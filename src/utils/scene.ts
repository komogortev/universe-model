import { Scene, WebGLCubeRenderTarget, Color, FogExp2 } from 'three';
import * as THREE from 'three'

function createScene(renderer_: HTMLElement) {
  const scene = new Scene();

  scene.fog = new FogExp2(0x000000, 0.00000025);

  // const texture = textureLoader.load(
  //   AppSettings.BG_MAP,
  //   () => {
  //     const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
  //     rt.fromEquirectangularTexture(renderer_, texture);
  //     scene.background = rt.texture;
  //   })

   scene.background = new Color('skyblue');

  return scene;
}

export { createScene };