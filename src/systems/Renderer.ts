import { WebGLRenderer, PCFSoftShadowMap } from 'three';

function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.physicallyCorrectLights = true; // turn on physically correct lighting (for...?)

  return renderer;
}

export { createRenderer };