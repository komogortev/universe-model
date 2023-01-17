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
import { Planetoid } from './Planetoid';
import { Golem } from './Golem';
import { Character } from './Character';

let renderer_: any,
scene_: any,
Loop_: any,
Resizer_: any;

let cameras: Group, cameraRig: any,
activeCamera: PerspectiveCamera,
universeCamera: PerspectiveCamera,
characterCamera: PerspectiveCamera;

class WorldScene {
  container: HTMLElement;
  controls: any;

  constructor(container: HTMLElement) {
    // initialize barebones scene
    this.container = container
    renderer_ = createRenderer();
    scene_ = createScene(renderer_);

    // initialize scene tools
    this._initCameras();

    Resizer_ = new Resizer(this.container, activeCamera, renderer_);
    Loop_ = new Loop(activeCamera, scene_, renderer_);

    // attach constructed scene to the WorldTheater view
    this.container.appendChild(renderer_.domElement);

    // initialize scene elements
    this._initializeSceneObjects();
    document.addEventListener( 'keydown', onKeyDown );
  }

  _initCameras(){
    cameras = new THREE.Group()
    universeCamera = createPerspectiveCamera();
    universeCamera.position.set(0, 0, 5); // move the camera back
    universeCamera.lookAt(0, 0, 0); // so we can view the scene center
    const univerceControls = createOrbitControls(universeCamera, renderer_.domElement)
    const universeCameraHelper = new THREE.CameraHelper(universeCamera)

    characterCamera = createPerspectiveCamera();
    const characterControls = createOrbitControls(characterCamera, renderer_.domElement)
    const characterCameraHelper = new THREE.CameraHelper(characterCamera)

    scene_.add(universeCameraHelper, characterCameraHelper)
    cameras.add(universeCamera, characterCamera)
    // set universe camera as default
    activeCamera = cameras.children[0] as PerspectiveCamera;
  }

  // @Todo: move into separate generator based on json config
  _initializeSceneObjects() {
    const StarPlanetoid = new Planetoid();
    scene_.add(StarPlanetoid.mesh);
    Loop_.updatables.push(StarPlanetoid);

    const character = new Character(StarPlanetoid);
    character.Rig.add(characterCamera)
    StarPlanetoid.mesh.add(character.Rig);
    Loop_.updatables.push(character);
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
  switch ( event.keyCode ) {
    case 79: /*O*/
      activeCamera = universeCamera;
      activeCamera.updateProjectionMatrix();
      Loop_.camera = activeCamera
      Resizer_.camera = activeCamera
      console.log('uni cam')
      break;
    case 80: /*P*/
      activeCamera = characterCamera;
      activeCamera.updateProjectionMatrix();
      Loop_.camera = activeCamera
      Resizer_.camera = activeCamera
      console.log('char cam')
      break;
  }
}

export { WorldScene };
