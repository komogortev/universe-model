import { WebGLRenderer, sRGBEncoding, PCFSoftShadowMap } from 'three';

function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.domElement.id = 'threejs';
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = sRGBEncoding;
  // renderer.gammaFactor = 2.2;
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = PCFSoftShadowMap;
  // renderer.physicallyCorrectLights = true;

  return renderer;
}

export { createRenderer };