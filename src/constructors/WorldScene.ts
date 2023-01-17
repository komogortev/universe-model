import { PerspectiveCamera } from 'three';
import { Group } from 'three';
import * as THREE from 'three'
// Scene utils
import { createRenderer } from '../utils/renderer';
import { createScene } from '../utils/scene';
import { createPerspectiveCamera, ThirdPersonCamera, ConstructCameraRig } from "../utils/camera"
import { Loop } from '../systems/Loop';
import { Resizer } from '../systems/Resizer';
// Scene Objects
import { Planetoid } from './Planetoid';
import { Golem, _BasicGolemControllerInput } from './Golem';

let renderer_: any,
scene_: any,
Loop_: any;

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

    const resizer = new Resizer(this.container, activeCamera, renderer_);
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
    cameras.add(universeCamera)

    characterCamera = createPerspectiveCamera();
    cameras.add(characterCamera)
    cameraRig = new ConstructCameraRig(characterCamera);
    // set universe camera as default
    activeCamera = cameras.children[0] as PerspectiveCamera;
  }

  // @Todo: move into separate generator based on json config
  _initializeSceneObjects() {
    const StarPlanetoid = new Planetoid();
    scene_.add(StarPlanetoid.mesh);
    Loop_.updatables.push(StarPlanetoid);

    const Character = new Golem(StarPlanetoid);
    StarPlanetoid.mesh.add(Character.mesh);
    cameraRig.parent = Character.mesh
    Loop_.updatables.push(Character);
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
      console.log('uni cam')
      break;
    case 80: /*P*/
      activeCamera = characterCamera;
      activeCamera.updateProjectionMatrix();
      Loop_.camera = activeCamera
      console.log('char cam')
      break;
  }
}

export { WorldScene };
