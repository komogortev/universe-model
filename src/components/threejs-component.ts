import { THREE, OrbitControls } from './three-defs';
import { entity } from "../constructors/Entity";
import type { IComponent } from '../constructors/Entity';

import { createRenderer } from '../systems/Renderer';
import { createScene } from '../systems/Scene';
export interface IThreeComponent extends IComponent {
  scene_: any;
  camera_: any;
}

const CAM_PARAMS = {
  fov: 75,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 10000,
}

export const threejs_component = (() => {
  class ThreeJSController extends entity.Component implements IThreeComponent {
    threejsRenderer_: THREE.WebGLRenderer | null;
    scene_: any;
    camera_: any;
    uiCamera_: any;
    uiScene_: any;

    constructor() {
      super();

      this.threejsRenderer_ = createRenderer();
      // this.threejsRenderer_ = new THREE.WebGLRenderer({
      //   antialias: true,
      // });
      this.scene_ = null;
      this.camera_ = new THREE.PerspectiveCamera(
        CAM_PARAMS.fov,
        CAM_PARAMS.aspect,
        CAM_PARAMS.near,
        CAM_PARAMS.far
      );
      this.scene_ = new THREE.Scene();
      this.camera_.position.set(-155, 100, 0);
      this.camera_.lookAt(new THREE.Vector3(1,1,0))
    }

    InitEntity() {
      //document.getElementById('scene-container').appendChild(this.threejsRenderer_.domElement);

      // // window.addEventListener('resize', () => {
      // //   this.OnResize_();
      // // }, false);

      // this.listener_ = new THREE.AudioListener();
      // this.camera_.add(this.listener_);

      this.uiCamera_ = new THREE.OrthographicCamera(
          -1, 1, 1 * CAM_PARAMS.aspect, -1 * CAM_PARAMS.aspect, 1, 1000);
      this.uiScene_ = new THREE.Scene();

      {
        // let light = new THREE.DirectionalLight(0x8088b3, 1.0);
        // light.position.set(-10, 500, 10);
        // light.target.position.set(0, 0, 0);
        // light.castShadow = true;
        // light.shadow.bias = -0.001;
        // light.shadow.mapSize.width = 4096;
        // light.shadow.mapSize.height = 4096;
        // light.shadow.camera.near = 1.0;
        // light.shadow.camera.far = 1000.0;
        // light.shadow.camera.left = 500;
        // light.shadow.camera.right = -500;
        // light.shadow.camera.top = 500;
        // light.shadow.camera.bottom = -500;
        // this.scene_.add(light);
      }

      //this.OnResize_();
    }

    LoadBackground_() {
      // const loader = new THREE.CubeTextureLoader();
      // const texture = loader.load([
      //     './resources/terrain/space-posx.jpg',
      //     './resources/terrain/space-negx.jpg',
      //     './resources/terrain/space-posy.jpg',
      //     './resources/terrain/space-negy.jpg',
      //     './resources/terrain/space-posz.jpg',
      //     './resources/terrain/space-negz.jpg',
      // ]);
      // texture.encoding = THREE.sRGBEncoding;

      // const uniforms = {
      //   "background": { value: texture },
      // };

      // const skyGeo = new THREE.SphereBufferGeometry(5000, 32, 15);
      // const skyMat = new THREE.ShaderMaterial({
      //     uniforms: uniforms,
      //     vertexShader: _SKY_VS,
      //     fragmentShader: _SKY_FS,
      //     side: THREE.BackSide
      // });

      // this.sky_ = new THREE.Mesh(skyGeo, skyMat);
      // this.scene_.add(this.sky_);
    }

    LoadPlanet_() {
      // const planetGeo = new THREE.SphereBufferGeometry(5000, 48, 48);
      // const planetMat = new THREE.ShaderMaterial({
      //     uniforms: {
      //       'time': { value: 0.0 },
      //     },
      //     vertexShader: _PLANET_VS,
      //     fragmentShader: _PLANET_FS,
      //     side: THREE.FrontSide
      // });

      // const planet = new THREE.Mesh(planetGeo, planetMat);
      // planet.position.set(6000, -1000, 0);
      // this.planet_ = planet;
      // this.sky_.add(planet);
    }

    OnResize_() {
      this.camera_.aspect = window.innerWidth / window.innerHeight;
      this.camera_.updateProjectionMatrix();
      this.crawlCamera_.aspect = window.innerWidth / window.innerHeight;
      this.crawlCamera_.updateProjectionMatrix();

      this.uiCamera_.left = -this.camera_.aspect;
      this.uiCamera_.right = this.camera_.aspect;
      this.uiCamera_.updateProjectionMatrix();

      this.threejs_.setSize(window.innerWidth, window.innerHeight);
    }

    Render() {
      this.threejsRenderer_.autoClearColor = true;
      this.threejsRenderer_.render(this.scene_, this.camera_);
      this.threejsRenderer_.autoClearColor = false;
      // this.threejsRenderer_.render(this.crawlScene_, this.crawlCamera_);
      this.threejsRenderer_.autoClearColor = false;
      this.threejsRenderer_.render(this.uiScene_, this.uiCamera_);
    }

    tick(deltaTime: number) {
      // const player = this.FindEntity('player');
      // if (!player) {
      //   return;
      // }
      // const pos = player._position;

      // this.sun_.position.copy(pos);
      // this.sun_.position.add(new THREE.Vector3(-10, 500, 10));
      // this.sun_.target.position.copy(pos);
      // this.sun_.updateMatrixWorld();
      // this.sun_.target.updateMatrixWorld();

      // if (this.planet_) {
      //   this.planet_.material.uniforms.time.value += timeElapsed;
      // }

      // this.sky_.position.copy(pos);
    }
  }

  return {
      ThreeJSController: ThreeJSController,
  };
})();