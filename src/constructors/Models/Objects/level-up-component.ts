import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

//import { particle_system } from "./particle-system.js";
import { entity } from "../../Entity";

export const level_up_component = (() => {

  class LevelUpComponentSpawner extends entity.Component {
    _params: any;
    _parent: any;

    constructor(params: any) {
      super();
      this._params = params;
    }

    Spawn(pos: Vector3) {
      const e = new entity.Entity();
      e.SetPosition(pos);
      e.AddComponent(new LevelUpComponent(this._params));
      this._parent._parent.Add(e);

      return e;
    }
  };

  class LevelUpComponent extends entity.Component {
    _params: any;
    _particles: any;

    constructor(params: any) {
      super();
      this._params = params;

      // this._particles = new particle_system.ParticleSystem({
      //     camera: params.camera,
      //     parent: params.scene,
      //     texture: './resources/textures/ball.png',
      // });
      // this._particles._alphaSpline.AddPoint(0.0, 0.0);
      // this._particles._alphaSpline.AddPoint(0.1, 1.0);
      // this._particles._alphaSpline.AddPoint(0.7, 1.0);
      // this._particles._alphaSpline.AddPoint(1.0, 0.0);

      // this._particles._colourSpline.AddPoint(0.0, new THREE.Color(0x00FF00));
      // this._particles._colourSpline.AddPoint(0.5, new THREE.Color(0x40C040));
      // this._particles._colourSpline.AddPoint(1.0, new THREE.Color(0xFF4040));

      // this._particles._sizeSpline.AddPoint(0.0, 0.05);
      // this._particles._sizeSpline.AddPoint(0.5, 0.25);
      // this._particles._sizeSpline.AddPoint(1.0, 0.0);
    }

    InitComponent() {
      // this._particles.AddParticles(this._parent._position, 300);
    }

    tick(delta: number) {
      this._particles.Step(delta);
      //if (this._particles._particles.length == 0) {
        // this._parent.SetActive(false);
      //}
    }
  }

  return {
      LevelUpComponent: LevelUpComponent,
      LevelUpComponentSpawner: LevelUpComponentSpawner,
  };
})();