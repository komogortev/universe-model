import { THREE } from './three-defs';
import { entity } from '../constructors/Entity';
import { math } from './math';

export const planetoid_controller = (() => {

  class PlanetoidController extends entity.Component {
    group_: THREE.Group;
    params_: any;
    dead_: boolean;

    constructor(params: any) {
      super();
      this.group_ = new THREE.Group();
      this.params_ = params;
      this.dead_ = false;
    }

    Destroy() {
      this.group_.traverse((c: any) => {
        if (c.material) {
          c.material.dispose();
        }
        if (c.geometry) {
          c.geometry.dispose();
        }
      });
      this.params_.scene.remove(this.group_);
    }

    InitComponent() {
      //this.RegisterHandler_('physics.collision', (m: any) => { this.OnCollision_(m); });
    }

    InitEntity() {
      this._LoadModels();
    }

    _LoadModels() {
      const data = this.params_.data;
      // const result = this._generatePlanetoid(data, this.group_)

      const tmpPlanetoid = new entity.Entity();
      tmpPlanetoid.SetName('mercGroup')
      tmpPlanetoid.AddComponent(new planetoid_controller.PlanetoidController({
        scene: this.params_.scene,
        data: this.params_.data,
      }));
    }

    _generatePlanetoid(planetoidData: any, parent: any) {
      const planetoid = new entity.Entity();
      planetoid.SetParent(parent)
      planetoid.SetName(planetoidData.name)
      parent.AddComponent(planetoid);

      if (planetoidData.children) {
        planetoidData.children.forEach((c: any) => this._generatePlanetoid(c, planetoid))
      }
    }

    OnCollision_() {
      if (!this.dead_) {
        this.dead_ = true;
        console.log('EXPLODE ' + this.Parent.Name);
        this.Broadcast({topic: 'health.dead'});
      }
    }

    Fire_() {
      this.Broadcast({
          topic: 'player.fire'
      });
    }

    tick(delta: number) {
      if (this.dead_) {
        return;
      }


    }
  };

  return {
    PlanetoidController: PlanetoidController,
  };

})();