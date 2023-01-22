import { Scene, WebGLCubeRenderTarget, Color, FogExp2 } from 'three';
import * as THREE from 'three'

function createScene(renderer_: any, textureLoader: any) {
  const scene = new Scene();
  scene.fog = new FogExp2(0x000000, 0.00000025);
  scene.matrixAutoUpdate = false

  const solarBgMap = '/models/solar-system/textures/8k_stars_milky_way.jpg';

  const texture = textureLoader.load(
    solarBgMap,
    () => {
      const rt = new WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer_, texture);
      scene.background = rt.texture;
    }
  )
  // scene.background = new Color('skyblue');

  return scene;
}

export { createScene };