import * as THREE from 'three'
import GUI from 'lil-gui';
import Stats from 'three/examples/jsm/libs/stats.module.js';

// WorldScene systems
import { createRenderer } from '../systems/Renderer';
import { createScene } from '../systems/Scene';
import { Resizer } from '../systems/Resizer';
import { Loop } from '../systems/Loop';

// WorldScene instruments
import { createPerspectiveCamera } from "../utils/cameras"
import { createOrbitControls } from "../utils/controls"
import { createAmbientLight, createPointLight } from '../utils/lights';
import { helperAddToLoopRecursevly, findClassByNameIdRecursevly } from '../utils/helpers';

// WorldScene decorations
import type { IPlanetoid } from '../types/StarsStoreTypes';
import { PlanetoidGroupClass } from './PlanetoidGroupClass';
import { CharacterGroupClass } from './CharacterGroupClass';

// Connect to App stores
import useStarSystemsStore from "../stores/StarsSystemsStore";
const { getStarSystemConfigByName } = useStarSystemsStore();
import useWorldSettingsStore from "../stores/WorldSettingsStore";
const { getWorldSettings, getWorldConstants, setTimeSpeed, setSizeScaleMultiplier } = useWorldSettingsStore();

// *WorldScene systems
let Renderer_: THREE.WebGLRenderer;
let Scene_: THREE.Scene;
let GUI_: any;
let Loop_: any;
let Resizer_: any;

// *WorldScene instruments
let SceneCameras_: Array<THREE.PerspectiveCamera>;
let DefaultCamera_: THREE.PerspectiveCamera;
let ActiveCamera_: THREE.PerspectiveCamera;
let DefaultControls_: any;

// *WorldScene decorations
let StarGroupClass_: any;
let CharacterGroupClass_: any;

class WorldScene {
  container: HTMLElement;
  textureLoader: any;
  stats: any;

  constructor(container: HTMLElement) {
    this.container = container;
    this.textureLoader = new THREE.TextureLoader();
    this._initLilGUI()
    this.stats = new Stats();
    this.container.appendChild(this.stats.dom);

    // initialize *WorldScene systems (1)
    Renderer_ = createRenderer();
    Scene_ = createScene(Renderer_, this.textureLoader);

    // initialize *WorldScene instruments (Cameras, Lights)
    {
      SceneCameras_ = [];
      DefaultCamera_ = createPerspectiveCamera();
      DefaultCamera_.position.set(0, 0, -55)
      DefaultControls_ = createOrbitControls(DefaultCamera_, Renderer_.domElement);
      SceneCameras_.push(DefaultCamera_);
      ActiveCamera_ = SceneCameras_[0];

      const defaultCameraHelper = new THREE.CameraHelper(DefaultCamera_);
      DefaultCamera_.add(defaultCameraHelper);

      this._initLights();
    }

    // initialize *WorldScene systems (2)
    Resizer_ = new Resizer(this.container, ActiveCamera_, Renderer_);
    Loop_ = new Loop(ActiveCamera_, Scene_, Renderer_);
    Loop_.updatables.push(this)

    // initialize *WorldScene decorations
    this.initGymTools()
    this.initializeStarGroup()
    this.initializeCharacterGroup();

    // attach constructed scene to the WorldTheater view
    this.container.appendChild(Renderer_.domElement);
    // switch cameras on key press
    document.addEventListener('keydown', onKeyDown );
  }

  _initLights() {
   class ColorGUIHelper {
      object: any;
      prop: any;
      constructor(object: any, prop: any) {
        this.object = object;
        this.prop = prop;
      }
      get value() {
        return `#${this.object[this.prop].getHexString()}`;
      }
      set value(hexString) {
        this.object[this.prop].set(hexString);
      }
    }

    {
      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.PointLight(color, intensity);
      light.position.set(0, 10, 0);
      Scene_.add(light);

      const helper = new THREE.PointLightHelper(light);
      light.add(helper);

      function updateLight() {
        helper.update();
      }

      GUI_.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
      GUI_.add(light, 'intensity', 0, 2, 0.01);
      GUI_.add(light, 'distance', 0, 40).onChange(updateLight);
      this.makeXYZGUI(GUI_, light.position, 'position', updateLight);
    }
  }

  _initLilGUI() {
    //Create gui instance
    GUI_ = new GUI();

    //Create object for gui's properties
    const settings = getWorldSettings()
    const guiProperties = { ...settings };

    GUI_.add( document, 'title' );
    GUI_.add(guiProperties, "timeSpeed", -100, 100).onChange(
      (value: number) => { setTimeSpeed(value);  }
    )
    GUI_.add(guiProperties.size_scaling, "multiplier", -guiProperties.size_scaling.multiplier*5, guiProperties.size_scaling.multiplier*5,guiProperties.size_scaling.multiplier ).onChange(
      (value: number) => { setSizeScaleMultiplier(value);  }
    )
  }

  _registerCandidatesWithLoop(candidatesClass: Array<any>) {
    candidatesClass.forEach((candidate) => {
      helperAddToLoopRecursevly(candidate, (_candidate) => {
        if (_candidate.tick != null) {
          Loop_.updatables.push(_candidate)
        }
      })
    })
  }

  makeXYZGUI(gui: any, vector3: THREE.Vector3, name: string, onChangeFn: () => {}) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
  }

  initializeStarGroup() {
    const _starSystemConfig: IPlanetoid = getStarSystemConfigByName(getWorldConstants().STAR_SYSTEM);
    StarGroupClass_ = new PlanetoidGroupClass(_starSystemConfig);
    Scene_.add(StarGroupClass_.threeGroup);
    // Register star system classes with animation Loop
    this._registerCandidatesWithLoop(StarGroupClass_.updatables)
    console.log(StarGroupClass_, Loop_)
  }

  initializeCharacterGroup() {
    const characterCamera = createPerspectiveCamera();
    const parentNameid = `${getWorldConstants().CHARACTER_SPAWN}GroupClass`;
    const parent = Loop_.updatables.find(u => u.nameId === parentNameid)
    CharacterGroupClass_ = new CharacterGroupClass(characterCamera, parent);

    // attempt to spot spawn location (planetoid surface?)

    // for (let potentialParentThreeGroup in [StarGroupClass_.threeGroup]) {
    //   if (potentialParentThreeGroup.nameId != null) {
    //     isParent = possibleSpawnClass.nameId == parentNameid
    //   }
    // }

    // const spawn = [StarGroupClass_].forEach((possibleSpawnClass: IPlanetoid) => {
    //   let isParent = false;

    // })

    SceneCameras_.push(CharacterGroupClass_.camera)
    Scene_.add(CharacterGroupClass_.cameraHelper)
    Loop_.updatables.push(CharacterGroupClass_)

    // Spawn has to be at updatable (animated) Object?
    // const spawnConfig = findClassByNameIdRecursevly(Loop_.updatables, getWorldConstants().CHARACTER_SPAWN);

    // let refToCharacterSpawnClass: any;

    // // loopup through star systems for matching spawn PlanetoidClass
    // StarGroupClass_.forEach((starSystemClass: any) => {
    //   if (refToCharacterSpawnClass == null) {
    //     const spawn = findClassByNameIdRecursevly(starSystemClass, characterSpawnName)

    //     if (spawn != null) {
    //       refToCharacterSpawnClass = spawn;
    //     }
    //   }
    // })

    // if (refToCharacterSpawnClass != null) {
    //   refToCharacterSpawnClass.threeGroup.children[0].add(CharacterClass_.threeGroup);
    //   this._registerCandidatesWithLoop([CharacterClass_]);
    // }
    // console.log(Loop_)
  }

  initGymTools() {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.position.set(0,-2,0)
    mesh.rotation.x = Math.PI * -.5;
    Scene_.add(mesh);
  }
  tick(delta) {
    this.stats.update(delta);
  }

  start() { Loop_.start(); }

  stop() { Loop_.stop(); }
}


function onKeyDown( event: KeyboardEvent ) {
  switch ( event.key ) {
    case 'o': /*O*/
      ActiveCamera_ = SceneCameras_[0];
      ActiveCamera_.updateProjectionMatrix();
      DefaultControls_.enabled = true;

      Loop_.camera = ActiveCamera_;
      Resizer_.camera = ActiveCamera_;
      break;
    case 'p': /*P*/
      ActiveCamera_ = SceneCameras_[1];
      ActiveCamera_.updateProjectionMatrix();
      DefaultControls_.enabled = false;

      Loop_.camera = ActiveCamera_
      Resizer_.camera = ActiveCamera_
      break;
  }
}

export { WorldScene };
