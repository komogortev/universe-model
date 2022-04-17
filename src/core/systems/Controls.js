import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { camera } from '../cameras'
// import { renderer } from '../renderer'

function createControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);

  return controls;
}

export { createControls };