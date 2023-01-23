import * as THREE from 'three'
import GUI from 'lil-gui';

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

  constructor(container: HTMLElement) {
    this.container = container;
    this.textureLoader = new THREE.TextureLoader();
    this._initLilGUI()

    // initialize *WorldScene systems (1)
    Renderer_ = createRenderer();
    Scene_ = createScene(Renderer_, this.textureLoader);

    {
      // initialize *WorldScene instruments
      SceneCameras_ = [];
      DefaultCamera_ = createPerspectiveCamera();
      DefaultCamera_.position.set(0, 0, -55)
      DefaultControls_ = createOrbitControls(DefaultCamera_, Renderer_.domElement);
      SceneCameras_.push(DefaultCamera_);
      ActiveCamera_ = SceneCameras_[0];

      const defaultCameraHelper = new THREE.CameraHelper(DefaultCamera_);
      Scene_.add(defaultCameraHelper);

      this._initLights();
    }

    // initialize *WorldScene systems (2)
    Resizer_ = new Resizer(this.container, ActiveCamera_, Renderer_);
    Loop_ = new Loop(ActiveCamera_, Scene_, Renderer_);

    // initialize *WorldScene decorations
    this.initializeStarGroup()
   // this.initializeCharacterGroup();

    // attach constructed scene to the WorldTheater view
    this.container.appendChild(Renderer_.domElement);
    // switch cameras on key press
    document.addEventListener('keydown', onKeyDown );
  }

  _initLights() {
    const ambLight_ = createAmbientLight(0xffffff, .00000015);
    Scene_.add(ambLight_)

    const pointLight_ = createPointLight(0xffffff, 1000, 100000);
    Scene_.add(pointLight_)
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
    const parentNameid = getWorldConstants().CHARACTER_SPAWN;
    CharacterGroupClass_ = new CharacterGroupClass(characterCamera);

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
    Scene_.add(CharacterGroupClass_.CameraHelper)


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

  start() { Loop_.start(); }

  stop() { Loop_.stop(); }
}


function onKeyDown( event: KeyboardEvent ) {
  switch ( event.key ) {
    case 'o': /*O*/
      console.log('universeCamera')
      activeCamera = SceneCameras_.children[0] as PerspectiveCamera;
      universeControls.enabled = true;
      //characterControls.enabled = false;

      activeCamera.updateProjectionMatrix();
      Loop_.camera = activeCamera
      Resizer_.camera = activeCamera
      console.log('uni cam')
      break;
    case 'p': /*P*/
      console.log('characterCamera')
      activeCamera = CharacterClass_.camera as PerspectiveCamera;
      universeControls.enabled = false;
      //characterControls.lock()

      activeCamera.updateProjectionMatrix();
      Loop_.camera = activeCamera
      Resizer_.camera = activeCamera
      console.log('char cam')
      break;
  }
}

export { WorldScene };
