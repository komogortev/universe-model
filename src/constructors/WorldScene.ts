import { PerspectiveCamera } from 'three';
import { Group } from 'three';
import * as THREE from 'three'
import GUI from 'lil-gui';

// Scene utils
import { createRenderer } from '../utils/renderer';
import { createScene } from '../utils/scene';
import { createAmbientLight, createPointLight } from '../utils/lights';
import { createPerspectiveCamera, ThirdPersonCamera, ConstructCameraRig } from "../utils/cameras"
import { createOrbitControls } from "../utils/controls"
import { addToLoopRecursevly, findObjectRecursevly } from '../utils/helpers';

import { Loop } from '../systems/Loop';
import { Resizer } from '../systems/Resizer';
// Scene Objects
import { StarGroupClass } from './StarGroup';
import { CharacterClass } from './Character';
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js"
import type { IPlanetoid } from '../types/StarsStoreTypes';

// connect to app stores
import useStarSystemsStore from "../stores/StarsSystemsStore";
const { getStarConfig } = useStarSystemsStore();
import useWorldSettingsStore from "../stores/WorldSettingsStore";
const { getWorldSettings, setTimeSpeed, setSizeScaleMultiplier } = useWorldSettingsStore();

// local WebGl systems
let renderer_: any,
scene_: any,
gui_: any,
Loop_: any,
Resizer_: any;

// local scene tools
let SceneCameras_: Group, cameraRig: any,
activeCamera: PerspectiveCamera,
universeCamera: PerspectiveCamera,
characterCamera: PerspectiveCamera,
universeControls: any, characterControls: any;

// local scene objects
let StarSystemsClass_: Array<any>, CharacterClass_: any;

class WorldScene {
  container: HTMLElement;
  textureLoader: any;

  constructor(container: HTMLElement) {
    // initialize barebones scene
    this.container = container
    renderer_ = createRenderer();
    this.textureLoader = new THREE.TextureLoader();
    scene_ = createScene(renderer_, this.textureLoader);

    // initialize scene tools
    this._initLights();
    this._initCameras();

    Resizer_ = new Resizer(this.container, activeCamera, renderer_);
    Loop_ = new Loop(activeCamera, scene_, renderer_);

    // attach constructed scene to the WorldTheater view
    this.container.appendChild(renderer_.domElement);

    // initialize scene elements
    if (Loop_ != null) {
      this.initializeStarGroup()
      this.initializeSceneObjects();
    }

    // switch cameras on key press
    document.addEventListener('keydown', onKeyDown );

    this._initLilGUI()
  }

  _initLilGUI() {
    //Create gui instance
    gui_ = new GUI();

    //Create object for gui's properties
    const settings = getWorldSettings()
    const guiProperties = { ...settings };

    gui_.add( document, 'title' );
    gui_.add(guiProperties, "timeSpeed", -100, 100).onChange(
      (value: number) => { setTimeSpeed(value);  }
    )
    gui_.add(guiProperties.size_scaling, "multiplier", -guiProperties.size_scaling.multiplier*5, guiProperties.size_scaling.multiplier*5,guiProperties.size_scaling.multiplier ).onChange(
      (value: number) => { setSizeScaleMultiplier(value);  }
    )

  }

  _initLights() {
    const ambLight_ = createAmbientLight(0xffffff, .5);
    const pointLight_ = createPointLight(0xffffff, 100);
    scene_.add(ambLight_, pointLight_)
  }

  _initCameras() {
    SceneCameras_ = new THREE.Group()
    const _camSettings = {
      position: {x: 0, y: 0, z: 50},
      aspect: window.innerWidth / window.innerHeight, // aspect ratio
      near: 0.05, // near clipping plane
      far: 10000 // far clipping plane
    },

    universeCamera = createPerspectiveCamera();
    universeCamera.position.set(0, 0, 55); // move the camera back
    universeCamera.lookAt(0, 0, 0); // so we can view the scene center
    universeControls = createOrbitControls(universeCamera, renderer_.domElement)
    const universeCameraHelper = new THREE.CameraHelper(universeCamera)

    characterCamera = createPerspectiveCamera();
    characterControls = new PointerLockControls(characterCamera, document.body)
    // characterControls.enabled = true
    const characterCameraHelper = new THREE.CameraHelper(characterCamera)

    scene_.add(universeCameraHelper, characterCameraHelper)
    SceneCameras_.add(universeCamera, characterCamera)
    // set universe camera as default
    activeCamera = SceneCameras_.children[0] as PerspectiveCamera;
  }

  _registerCandidatesWithLoop(candidates: Array<any>) {
    candidates.forEach((candidate) => {
      addToLoopRecursevly(candidate, (_candidate) => {
        if (_candidate.tick != null) {
          Loop_.updatables.push(_candidate)
        }
      })
    })
  }

  initializeStarGroup() {
    StarSystemsClass_ = [];
    const _starStoreConfig: Array<IPlanetoid> = getStarConfig('Solar');

    _starStoreConfig.forEach((planetoidConfig: IPlanetoid, index: number) => {
      const _starGroupClass = new StarGroupClass(planetoidConfig);
      // register new star group with the world core
      StarSystemsClass_.push(_starGroupClass);
      // add star class THREE.Group portion to the scene
      scene_.add(_starGroupClass.threeGroup);
    })

    // Register star system classes with animation Loop
    this._registerCandidatesWithLoop(StarSystemsClass_)
  }

  initializeSceneObjects() {
    // Spot the spawn threejs object
    const characterSpawnName = 'Earth';
    let refToCharacterSpawnClass: any;

    // loopup through star systems for matching spawn PlanetoidClass
    StarSystemsClass_.forEach((starSystemClass: any) => {
      if (refToCharacterSpawnClass == null) {
        const spawn = findObjectRecursevly(starSystemClass, characterSpawnName)

        if (spawn != null) {
          refToCharacterSpawnClass = spawn;
        }
      }
    })

    if (refToCharacterSpawnClass != null) {
      CharacterClass_ = new CharacterClass(refToCharacterSpawnClass, characterCamera);
      refToCharacterSpawnClass.threeGroup.add(CharacterClass_.threeGroup);
      this._registerCandidatesWithLoop([CharacterClass_]);
    }
    console.log(Loop_)
  }

  start() { Loop_.start(); }

  stop() { Loop_.stop(); }
}


function onKeyDown( event: KeyboardEvent ) {
  switch ( event.key ) {
    case 'o': /*O*/
      console.log('universeCamera')
      activeCamera = universeCamera;
      universeControls.enabled = true;
      //characterControls.enabled = false;

      activeCamera.updateProjectionMatrix();
      Loop_.camera = activeCamera
      Resizer_.camera = activeCamera
      console.log('uni cam')
      break;
    case 'p': /*P*/
      console.log('characterCamera')
      activeCamera = characterCamera;
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
