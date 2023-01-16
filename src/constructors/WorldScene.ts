import * as THREE from 'three'
import { createRenderer } from '../utils/renderer';
import { createScene } from '../utils/scene';
import { createPerspectiveCamera } from "../utils/camera"
import { Loop } from '../systems/Loop';
import { Resizer } from '../systems/Resizer';

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

    this.container.appendChild(renderer_.domElement);
  }

  init() {
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
