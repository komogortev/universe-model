import { THREE } from './three-defs';
import { SphereGeometry, Vector3 } from 'three';
import { entity } from '../constructors/Entity';
import { render_component } from './render-component';
import { player_input } from './player-input';
import { player_controller } from './player-controller';
import { third_person_camera } from './third-person-camera';
import { planetoid_controller } from './planetoid-controller';

import useStarSystemsStore from "../stores/StarsSystemsStore";
const { getStarSystemConfigByName } = useStarSystemsStore();

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
        offset: new THREE.Vector3(0, 0, 0),
      };

      const spaceship = new entity.Entity();
      spaceship.SetPosition(new THREE.Vector3(0, 0, 0));

      spaceship.AddComponent(new player_input.PlayerInput());
      spaceship.AddComponent(new player_controller.PlayerController());
      spaceship.AddComponent(
        new third_person_camera.ThirdPersonCamera({
            camera: this.params_.camera,
            target: spaceship}));

      // initialize component on the scene
      spaceship.AddComponent(new render_component.RenderComponent({
        scene: params.scene,
        resourcePath: './models/aircrafts/Luminaris/',
        resourceName: 'Luminaris Animated FBX.fbx',
        scale: 0.25,
        offset: {
          position: new THREE.Vector3(0, 0, 0),
          quaternion: new THREE.Quaternion(),
        },
      }));

      // entity's parent (entityManager, sometimes another entity)
      super.Manager.Add(spaceship, 'spaceship');

      return spaceship;
    }
  };
  class SolarSystemSpawner extends entity.Component {
    params_: any;
    group_: THREE.Group;
    geometry_: SphereGeometry;

    constructor(params: any) {
      super();
      this.params_ = params;
      this.group_ = new THREE.Group();
      this.geometry_ = new SphereGeometry(1, 32, 32);
    }

    Spawn() {
      const cfg = getStarSystemConfigByName('SolarSystem');
      const planetoidSpawner = this.FindEntity('spawners').GetComponent('PlanetoidSpawner');

      // create and spawn sun and planets at the center of the
      // Scene_, but moons - they get created in PlanetoidController
      this._spawnPlanetoidEntitiesRecursevly(cfg, planetoidSpawner)
      //this.Manager.Add(solar, cfg.nameId);
      console.log('!! SolarSystem result', this.Manager)
    }

    _spawnPlanetoidEntitiesRecursevly(cfg: any, planetoidSpawner: any, parentPlanetoid?: any): void {
      console.log(` ! Spawning Entity: ${cfg.nameId}`)
      const position = new Vector3(0, 0, 0)
      const e0 = planetoidSpawner.Spawn(cfg, position);

      console.log('Got fresh Entity & Mesh, attach to EM!', e0)
      this.Manager.Add(e0, cfg.nameId);

      // attempt to dive deeper into planetoid (config) children (not Moons)
      if (cfg.children != null) {
        cfg.children.forEach((childConfig: any) => {
          // limit generation to planets
          if (['star','planet'].includes(childConfig.type)) {
            this._spawnPlanetoidEntitiesRecursevly(childConfig, planetoidSpawner)
          }
        })
      }

      return e0
    }
  };
  class PlanetoidSpawner extends entity.Component {
    group_: THREE.Group;
    params_: any;
    geometry_: SphereGeometry;

    constructor(params: any) {
      super();
      this.params_ = params;
      this.group_ = new THREE.Group();
      this.geometry_ = new SphereGeometry(1, 32, 32);
    }

    Spawn(cfg: any, position, quaternion, correction) {
      const params = {
        camera: this.params_.camera,
        scene: this.params_.scene,
        grid: this.params_.grid,
      };

      const e = new entity.Entity();
      //position.add(new THREE.Vector3(0, 0, -1000));
      e.SetPosition(position);
      //e.SetQuaternion(quaternion);

      e.SetName(cfg.nameId);
      // center against core of the matrix (to rotate around sun, duh)

      e.AddComponent(new render_component.RenderComponent({
        scene: this.params_.scene,
      }));

      e.AddComponent(new planetoid_controller.PlanetoidController({
        data: cfg,
        geometry: this.geometry_,
        camera: this.params_.camera,
      }));

      return e;
    }
  };

  return {
    SpaceShipSpawner: SpaceShipSpawner,
    SolarSystemSpawner: SolarSystemSpawner,
    PlanetoidSpawner: PlanetoidSpawner,
    // TieFighterSpawner: TieFighterSpawner,
    // XWingSpawner: XWingSpawner,
    // StarDestroyerSpawner: StarDestroyerSpawner,
    // StarDestroyerTurretSpawner: StarDestroyerTurretSpawner,
    // ExplosionSpawner: ExplosionSpawner,
    // TinyExplosionSpawner: TinyExplosionSpawner,
    // ShipSmokeSpawner: ShipSmokeSpawner,
  };
})();