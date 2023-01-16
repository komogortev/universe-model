import * as THREE from 'three'
// Scene utils
import { createRenderer } from '../utils/renderer';
import { createScene } from '../utils/scene';
import { createPerspectiveCamera } from "../utils/camera"
import { Loop } from '../systems/Loop';
import { Resizer } from '../systems/Resizer';
// Scene Objects
import { Planetoid } from './Planetoid';
import { Golem } from './Golem';

let renderer_: any,
scene_: any,
cameras_: Array<any>,
defaultCamera_: any,
Loop_: any;

class WorldScene {
  container: HTMLElement;
  controls: any;

  constructor(container: HTMLElement) {
    // initialize barebones scene
    this.container = container
    renderer_ = createRenderer();
    scene_ = createScene(renderer_);
    this.container.appendChild(renderer_.domElement);

    // initialize scene tools
    defaultCamera_ = createPerspectiveCamera();
    cameras_ = [defaultCamera_];
    const resizer = new Resizer(this.container, defaultCamera_, renderer_);
    Loop_ = new Loop(defaultCamera_, scene_, renderer_);

    // attach constructed scene to the WorldTheater view
    this.container.appendChild(renderer_.domElement);

    // initialize scene elements
    this._initializeSceneObjects();

    // dev defaults
    this.initDefaults();
  }

  // @Todo: move into separate generator based on json config
  _initializeSceneObjects() {
    const StarPlanetoid = new Planetoid();
    scene_.add(StarPlanetoid.mesh);
    Loop_.updatables.push(StarPlanetoid);

    const Character = new Golem(StarPlanetoid);
    StarPlanetoid.mesh.add(Character.mesh);
    Loop_.updatables.push(Character);
  }

  initDefaults(){
    defaultCamera_.position.set(0, 0, 15); // move the camera back
    defaultCamera_.lookAt(0, 0, 0); // so we can view the scene center
  }

  start() {
    Loop_.start();
    console.log("World Scene started!");
  }

  stop() {
    Loop_.stop();
  }

  tick(delta: number) {
  }
}

export { WorldScene };
