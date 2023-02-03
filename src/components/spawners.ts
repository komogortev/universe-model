import { THREE } from './three-defs';
import { entity } from '../constructors/Entity';
import { render_component } from './render-component';
import { player_input } from './player-input';
import { player_controller } from './player-controller';
import { third_person_camera } from './third-person-camera';

// import {player_ps4_input} from './player-ps4-input.js';
// import {xwing_controller} from './xwing-controller.js';
// import {xwing_effect} from './xwing-effects.js';
// import {tie_fighter_controller} from './tie-fighter-controller.js';
// import {basic_rigid_body} from './basic-rigid-body.js';
// import {mesh_rigid_body} from './mesh-rigid-body.js';
// import {explode_component} from './explode-component.js';
// import {health_controller} from './health-controller.js';
// import {ship_effect} from './ship-effects.js';
// import {floating_descriptor} from './floating-descriptor.js';
// import {crosshair} from './crosshair.js';
// import {spatial_grid_controller} from './spatial-grid-controller.js';
// import {enemy_ai_controller} from './enemy-ai-controller.js';
// import {star_destroyer_fighter_controller} from './star-destroyer-fighter-controller.js';
// import {turret_controller} from './turret-controller.js';
// import {shields_controller} from './shields-controller.js';
// import {shields_ui_controller} from './shields-ui-controller.js';
// import {atmosphere_effect} from './atmosphere-effect.js';

export const spawners = (() => {

  class SpaceShipSpawner extends entity.Component {
    params_: any;

    constructor(params: any) {
      super();
      this.params_ = params;
    }

    Spawn() {
      const params = {
        scene: this.params_.scene,
        camera: this.params_.camera,
        offset: new THREE.Vector3(0, -5, 4),
      };

      const spaceship = new entity.Entity();
      spaceship.SetPosition(new THREE.Vector3(0, 0, 0));

      // initialize component on the scene
      spaceship.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        resourcePath: './models/aircrafts/Luminaris/',
        resourceName: 'Luminaris Animated FBX.fbx',
        scale: 0.25,
        offset: {
          position: new THREE.Vector3(0, -5, -4),
          quaternion: new THREE.Quaternion(),
        },
      }));
      spaceship.AddComponent(new player_input.PlayerInput());
      spaceship.AddComponent(new player_controller.PlayerController());
      spaceship.AddComponent(
        new third_person_camera.ThirdPersonCamera({
            camera: this.params_.camera,
            target: spaceship}));
      // entity's parent (entityManager, sometimes another entity)
      super.Manager.Add(spaceship, 'spaceship');

      return spaceship;
    }
  };

  // class TieFighterSpawner extends entity.Component {
  //   constructor(params) {
  //     super();
  //     this.params_ = params;
  //   }

  //   Spawn() {
  //     const params = {
  //       camera: this.params_.camera,
  //       scene: this.params_.scene,
  //       blasterStrength: 20,
  //     };

  //     const e = new entity.Entity();
  //     e.AddComponent(
  //       new spatial_grid_controller.SpatialGridController(
  //           {grid: this.params_.grid}));
  //     e.AddComponent(new render_component.RenderComponent({
  //       scene: params.scene,
  //       resourcePath: './resources/models/tie-fighter-gltf/',
  //       resourceName: 'scene.gltf',
  //       scale: 0.15,
  //       colour: new THREE.Color(0xFFFFFF),
  //     }));
  //     e.AddComponent(new tie_fighter_controller.TieFighterController(params));
  //     e.AddComponent(new basic_rigid_body.BasicRigidBody({
  //       box: new THREE.Vector3(15, 15, 15)
  //     }));
  //     e.AddComponent(new health_controller.HealthController({
  //       maxHealth: 50,
  //     }));
  //     // DEMO
  //     e.AddComponent(new floating_descriptor.FloatingDescriptor());
  //     e.AddComponent(new enemy_ai_controller.EnemyAIController({
  //       grid: this.params_.grid,
  //     }));

  //     this.Manager.Add(e);

  //     return e;
  //   }
  // };

  // class XWingSpawner extends entity.Component {
  //   constructor(params) {
  //     super();
  //     this.params_ = params;
  //   }

  //   Spawn() {
  //     const params = {
  //       camera: this.params_.camera,
  //       scene: this.params_.scene,
  //       blasterStrength: 10,
  //       offset: new THREE.Vector3(0, -5, -4),
  //     };

  //     const e = new entity.Entity();
  //     e.AddComponent(
  //       new spatial_grid_controller.SpatialGridController(
  //           {grid: this.params_.grid}));
  //     e.AddComponent(new render_component.RenderComponent({
  //       scene: params.scene,
  //       resourcePath: './resources/models/x-wing/',
  //       resourceName: 'scene.gltf',
  //       scale: 2,
  //       offset: {
  //         position: new THREE.Vector3(0, -5, -4),
  //         quaternion: new THREE.Quaternion(),
  //       },
  //     }));
  //     e.AddComponent(new xwing_effect.XWingEffects(params));
  //     e.AddComponent(new xwing_controller.XWingController(params));
  //     e.AddComponent(new basic_rigid_body.BasicRigidBody({
  //       box: new THREE.Vector3(15, 15, 15)
  //     }));
  //     e.AddComponent(new health_controller.HealthController({
  //       maxHealth: 50,
  //       shields: 50,
  //     }));
  //     // e.AddComponent(new floating_descriptor.FloatingDescriptor());
  //     e.AddComponent(new enemy_ai_controller.EnemyAIController({
  //       grid: this.params_.grid,
  //     }));
  //     e.AddComponent(
  //         new shields_controller.ShieldsController(params));

  //     this.Manager.Add(e);

  //     return e;
  //   }
  // };

  // class StarDestroyerSpawner extends entity.Component {
  //   constructor(params) {
  //     super();
  //     this.params_ = params;
  //   }

  //   Spawn() {
  //     const params = {
  //       camera: this.params_.camera,
  //       scene: this.params_.scene,
  //     };

  //     const e = new entity.Entity();
  //     e.SetPosition(new THREE.Vector3(0, 0, -1000));
  //     e.AddComponent(new render_component.RenderComponent({
  //       scene: params.scene,
  //       resourcePath: './resources/models/star-destroyer/',
  //       resourceName: 'scene-final.glb',
  //       scale: 50.0,
  //       colour: new THREE.Color(0.5, 0.5, 0.5),
  //     }));
  //     e.AddComponent(new mesh_rigid_body.MeshRigidBody({
  //       scene: params.scene,
  //       resourcePath: './resources/models/star-destroyer/',
  //       resourceName: 'scene-collision.glb',
  //       scale: 50.0,
  //     }));
  //     e.AddComponent(
  //         new star_destroyer_fighter_controller.StarDestroyerFighterController());

  //     this.Manager.Add(e, 'star-destroyer');

  //     return e;
  //   }
  // };

  // class StarDestroyerTurretSpawner extends entity.Component {
  //   constructor(params) {
  //     super();
  //     this.params_ = params;
  //   }

  //   Spawn(position, quaternion, correction) {
  //     const params = {
  //       camera: this.params_.camera,
  //       scene: this.params_.scene,
  //       grid: this.params_.grid,
  //       blasterStrength: 10,
  //     };

  //     position.add(new THREE.Vector3(0, 0, -1000));

  //     const e = new entity.Entity();
  //     e.SetPosition(position);
  //     e.SetQuaternion(quaternion);
  //     e.AddComponent(new render_component.RenderComponent({
  //       scene: params.scene,
  //       resourcePath: './resources/models/star-destroyer/',
  //       resourceName: 'turret.glb',
  //       scale: 50.0,
  //       offset: {
  //         position: new THREE.Vector3(),
  //         quaternion: correction,
  //       },
  //     }));
  //     e.AddComponent(new basic_rigid_body.BasicRigidBody({
  //       box: new THREE.Vector3(25, 25, 25)
  //     }));
  //     // e.AddComponent(new floating_descriptor.FloatingDescriptor());
  //     e.AddComponent(new health_controller.HealthController({
  //       maxHealth: 40,
  //       ignoreCollisions: true,
  //     }));
  //     e.AddComponent(new turret_controller.TurretController(params));

  //     this.Manager.Add(e);

  //     return e;
  //   }
  // };

  // class ShipSmokeSpawner extends entity.Component {
  //   constructor(params) {
  //     super();
  //     this.params_ = params;
  //   }

  //   Spawn(target) {
  //     const params = {
  //       camera: this.params_.camera,
  //       scene: this.params_.scene,
  //       target: target,
  //     };

  //     const e = new entity.Entity();
  //     e.SetPosition(target.Position);
  //     e.AddComponent(new ship_effect.ShipEffects(params));

  //     this.Manager.Add(e);

  //     return e;
  //   }
  // };

  // class ExplosionSpawner extends entity.Component {
  //   constructor(params) {
  //     super();
  //     this.params_ = params;
  //   }

  //   Spawn(pos) {
  //     const params = {
  //       camera: this.params_.camera,
  //       scene: this.params_.scene,
  //     };

  //     const e = new entity.Entity();
  //     e.SetPosition(pos);
  //     e.AddComponent(new explode_component.ExplodeEffect(params));

  //     this.Manager.Add(e);

  //     return e;
  //   }
  // };

  // class TinyExplosionSpawner extends entity.Component {
  //   constructor(params) {
  //     super();
  //     this.params_ = params;
  //   }

  //   Spawn(pos) {
  //     const params = {
  //       camera: this.params_.camera,
  //       scene: this.params_.scene,
  //     };

  //     const e = new entity.Entity();
  //     e.SetPosition(pos);
  //     e.AddComponent(new explode_component.TinyExplodeEffect(params));

  //     this.Manager.Add(e);

  //     return e;
  //   }
  // };

  return {
    SpaceShipSpawner: SpaceShipSpawner,
    // TieFighterSpawner: TieFighterSpawner,
    // XWingSpawner: XWingSpawner,
    // StarDestroyerSpawner: StarDestroyerSpawner,
    // StarDestroyerTurretSpawner: StarDestroyerTurretSpawner,
    // ExplosionSpawner: ExplosionSpawner,
    // TinyExplosionSpawner: TinyExplosionSpawner,
    // ShipSmokeSpawner: ShipSmokeSpawner,
  };
})();