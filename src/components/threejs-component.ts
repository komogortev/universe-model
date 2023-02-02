import { THREE, OrbitControls } from './three-defs.js';
import { entity } from "../constructors/Entity";
import type { IComponent } from '../constructors/Entity';

import { createRenderer } from '../systems/Renderer';
import { createScene } from '../systems/Scene';

let Renderer_: any;
let Scene_: any;
let Resizer_: any;

export interface IThreeComponent extends IComponent {
  scene_: any;
  camera_: any;
}

export const threejs_component = (() => {

  class ThreeJSController extends entity.Component implements IThreeComponent {
    threejsRenderer_: THREE.WebGLRenderer;
    scene_: any;
    camera_: any;

    constructor() {
      super();

      this.threejsRenderer_ = createRenderer();
      // this.threejsRenderer_ = new THREE.WebGLRenderer({
      //   antialias: true,
      // });
      this.scene_ = new THREE.Scene();
      const fov = 60;
      const aspect = 1920 / 1080;
      const near = 1.0;
      const far = 10000.0;
      this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera_.position.set(0, 15, -25);

    }

    InitEntity() {
      document.getElementById('scene-container').appendChild(this.threejs_.domElement);

      // // window.addEventListener('resize', () => {
      // //   this.OnResize_();
      // // }, false);



      // this.listener_ = new THREE.AudioListener();
      // this.camera_.add(this.listener_);

      // this.crawlCamera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
      // this.crawlScene_ = new THREE.Scene();

      // this.uiCamera_ = new THREE.OrthographicCamera(
      //     -1, 1, 1 * aspect, -1 * aspect, 1, 1000);
      // this.uiScene_ = new THREE.Scene();

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

      this.sun_ = light;

      light = new THREE.AmbientLight(0xFFFFFF, 0.035);
      this.scene_.add(light);

      this.LoadBackground_();
      // this.LoadPlanet_();
      this.OnResize_();
    }

    LoadBackground_() {
      const loader = new THREE.CubeTextureLoader();
      const texture = loader.load([
          './resources/terrain/space-posx.jpg',
          './resources/terrain/space-negx.jpg',
          './resources/terrain/space-posy.jpg',
          './resources/terrain/space-negy.jpg',
          './resources/terrain/space-posz.jpg',
          './resources/terrain/space-negz.jpg',
      ]);
      texture.encoding = THREE.sRGBEncoding;

      const uniforms = {
        "background": { value: texture },
      };

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
      const planetGeo = new THREE.SphereBufferGeometry(5000, 48, 48);
      const planetMat = new THREE.ShaderMaterial({
          uniforms: {
            'time': { value: 0.0 },
          },
          vertexShader: _PLANET_VS,
          fragmentShader: _PLANET_FS,
          side: THREE.FrontSide
      });

      const planet = new THREE.Mesh(planetGeo, planetMat);
      planet.position.set(6000, -1000, 0);
      this.planet_ = planet;
      this.sky_.add(planet);
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
      this.threejs_.autoClearColor = true;
      this.threejs_.render(this.scene_, this.camera_);
      this.threejs_.autoClearColor = false;
      this.threejs_.render(this.crawlScene_, this.crawlCamera_);
      this.threejs_.autoClearColor = false;
      this.threejs_.render(this.uiScene_, this.uiCamera_);
    }

    tick(deltaTime: number) {
      const player = this.FindEntity('player');
      if (!player) {
        return;
      }
      const pos = player._position;

      this.sun_.position.copy(pos);
      this.sun_.position.add(new THREE.Vector3(-10, 500, 10));
      this.sun_.target.position.copy(pos);
      this.sun_.updateMatrixWorld();
      this.sun_.target.updateMatrixWorld();

      if (this.planet_) {
        this.planet_.material.uniforms.time.value += timeElapsed;
      }

      this.sky_.position.copy(pos);
    }
  }

  return {
      ThreeJSController: ThreeJSController,
  };
})();