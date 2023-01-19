import { PerspectiveCamera } from 'three';
import { Group } from 'three';
import * as THREE from 'three'
// Scene utils
import { createRenderer } from '../utils/renderer';
import { createScene } from '../utils/scene';
import { createPerspectiveCamera, ThirdPersonCamera, ConstructCameraRig } from "../utils/camera"
import { createOrbitControls } from "../utils/controls"

import { Loop } from '../systems/Loop';
import { Resizer } from '../systems/Resizer';
// Scene Objects
import { StarGroup } from './StarGroup';
import { Planetoid } from './Planetoid';
import { Character } from './Character';
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js"
import { createAmbientLight, createPointLight } from '../utils/lights';


let renderer_: any,
scene_: any,
Loop_: any,
Resizer_: any;

let cameras: Group, cameraRig: any,
activeCamera: PerspectiveCamera,
universeCamera: PerspectiveCamera,
characterCamera: PerspectiveCamera,
universeControls: any, characterControls: any;

let StarSystem_: any;

class WorldScene {
  container: HTMLElement;
  controls: any;
  worldSceneStore: any;
  textureLoader: any;

  constructor(container: HTMLElement, worldSceneStore: any) {
    // initialize barebones scene
    this.container = container
    renderer_ = createRenderer();
    this.textureLoader = new THREE.TextureLoader();
    scene_ = createScene(renderer_, this.textureLoader);
    this.worldSceneStore = worldSceneStore;

    // initialize scene tools
    this._initCameras();
    const ambLight_ = createAmbientLight(0xffffff, .5);
    const pointLight_ = createPointLight(0xffffff, 100);
    scene_.add(ambLight_, pointLight_)

    Resizer_ = new Resizer(this.container, activeCamera, renderer_);
    Loop_ = new Loop(activeCamera, scene_, renderer_);

    // attach constructed scene to the WorldTheater view
    this.container.appendChild(renderer_.domElement);

    // initialize scene elements
    if (Loop_ != null) {
      this._initializeStarGroup()
      this._initializeSceneObjects();
    }

    // switch cameras on key press
    document.addEventListener('keydown', onKeyDown );
  }

  _initCameras(){
    cameras = new THREE.Group()
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
    cameras.add(universeCamera, characterCamera)
    // set universe camera as default
    activeCamera = cameras.children[0] as PerspectiveCamera;
  }

  _initializeStarGroup() {
    StarSystem_ = new StarGroup(this.worldSceneStore.getSolarSystemConfig[0]);
    scene_.add(StarSystem_.threeGroup.children[0]);
    Loop_.updatables.push(StarSystem_);
    // also loop through children and add them to Loop
    StarSystem_.children.forEach((ch: any) => Loop_.updatables.push(ch))
    console.log(StarSystem_)
  }

  // @Todo: move into separate generator based on json config
  _initializeSceneObjects() {
    // const StarPlanetoid = new Planetoid();
    // scene_.add(StarPlanetoid.mesh);
    // Loop_.updatables.push(StarPlanetoid);
    // const refToFirstStar = StarSystem_.threeGroup.children[0]
    // const character = new Character(refToFirstStar, characterCamera);
    // refToFirstStar.add(character.Rig);
    // Loop_.updatables.push(character);
  }

  start() {
    Loop_.start();
    console.log("World Scene started!");
  }

  stop() {
    Loop_.stop();
  }
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
