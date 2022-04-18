import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';

function createControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  return controls;
}

function createFlyControls(camera, renderer) {
  const controls = new FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 1000;
  controls.domElement = renderer.domElement;
  //controls.rollSpeed = Math.PI / 24;
  //controls.autoForward = false;
  //controls.dragToLook = false;
  return controls;
}

export { createControls, createFlyControls };