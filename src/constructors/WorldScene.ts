import { PerspectiveCamera } from 'three';
import { Group } from 'three';
import * as THREE from 'three'
// Scene utils
import { createRenderer } from '../utils/renderer';
import { createScene } from '../utils/scene';
import { createAmbientLight, createPointLight } from '../utils/lights';
import { createPerspectiveCamera, ThirdPersonCamera, ConstructCameraRig } from "../utils/cameras"
import { createOrbitControls } from "../utils/controls"

import { Loop } from '../systems/Loop';
import { Resizer } from '../systems/Resizer';
// Scene Objects
import { StarGroupClass } from './StarGroup';
import { Character } from './Character';
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js"

// connect to app stores
import useStarSystemsStore from "../stores/StarsSystemsStore";
const { getStarConfig } = useStarSystemsStore();
import useWorldSettingsStore from "../stores/WorldSettingsStore";
import { IPlanetoid, IStarConfig } from '../types/StarsStoreTypes';
import { applyRecursevly } from '../utils/helpers';
const { worldSettings } = useWorldSettingsStore();

// local WebGl systems
let renderer_: any,
scene_: any,
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

    // register star groups with animation loop
    Loop_.updatables.push(...StarSystemsClass_);

    // also loop through children planetoid class instances (for tick method)
    // and add them to Loop
    StarSystemsClass_.forEach((systemClass) => {
      systemClass.children.forEach((childClass: any) => {
        Loop_.updatables.push(childClass)

        if (childClass.children != null) {
          applyRecursevly(childClass, (subChild) => Loop_.updatables.push(subChild))
          //childClass.children.forEach((ch: any) => Loop_.updatables.push(ch))
        }
      })
    })
  }

  // @Todo: move into separate generator based on json config
  initializeSceneObjects() {

    // const StarPlanetoid = new Planetoid();
    // scene_.add(StarPlanetoid.mesh);
    // Loop_.updatables.push(StarPlanetoid);
    const refToFirstStarSystem = StarSystemsClass_[0]
    const refToStarClass = refToFirstStarSystem.children[3]
    const refToStarMesh = refToFirstStarSystem.threeGroup.children[3].children[0].children[6].children[0]
    const character = new Character(refToStarClass, characterCamera);
    refToStarMesh.add(character.Rig);
    console.log(refToStarClass)
    Loop_.updatables.push(character);
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
