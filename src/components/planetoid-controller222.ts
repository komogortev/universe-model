import { THREE } from './three-defs';
import { entity } from '../constructors/Entity';
import { math } from './math';
import { Mesh, MeshPhongMaterial, PointLight, PointLightHelper, SphereGeometry, TextureLoader } from 'three';
import useWorldSettingsStore from "../stores/WorldSettingsStore";
const { worldSettings } = useWorldSettingsStore();

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

      // create planetoid mesh body
      const planetoidMesh = new Mesh(
         new SphereGeometry(1, 32, 32),
        this._generateMaterial(data)
      );
      planetoidMesh.name = `${data.nameId} MeshGroup`

      if (data.emissive != null) {
        planetoidMesh.add(this._createLight());
      }

      planetoidMesh.rotation.y = data.tilt
      planetoidMesh.scale.multiplyScalar(
        (parseFloat(data.radius.AU as string))  * (worldSettings.value.planetoidScale as number)
      )




      this.group_.add(planetoidMesh);
      this.group_.position.copy(this.Parent.Position);
      this.group_.quaternion.copy(this.Parent.Quaternion);

      // const tmpPlanetoid = new entity.Entity();
      // tmpPlanetoid.SetName('mercGroup')
      // tmpPlanetoid.AddComponent(new planetoid_controller.PlanetoidController({
      //   scene: this.params_.scene,
      //   data: this.params_.data,
      // }));
    }

    _OnLoaded(mdl: any){}

    _createLight() {
      class ColorGUIHelper {
        object: any;
        prop: any;
        constructor(object: any, prop: any) {
          this.object = object;
          this.prop = prop;
        }
        get value() {
          return `#${this.object[this.prop].getHexString()}`;
        }
        set value(hexString) {
          this.object[this.prop].set(hexString);
        }
      }

      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new PointLight(color, intensity);
      light.position.set(0, 0, 0);

      const helper = new PointLightHelper(light);
      light.add(helper);

      return light;
    }

    // 1. Create material according to planetoid config
    _generateMaterial(cfg: any) {
      const loader = new TextureLoader();

      // loader.Load(
      //     this.params_.resourcePath, this.params_.resourceName, (mdl: any) => {
      //   this._OnLoaded(mdl);
      // });

      let sphereMaterial = cfg.emissive != null
        ? new MeshPhongMaterial({
          emissive: cfg.emissive,
          emissiveIntensity: 1,
        })
        : new MeshPhongMaterial({
          wireframe: true,
          //color: cfg.color ? new Color(cfg.color) : '#fff',
        })

      if (cfg.map != null) {
        sphereMaterial.map = loader.load(cfg.map);
      }

      if (cfg.emissiveMap != null) {
        sphereMaterial.emissiveMap = loader.load(cfg.emissiveMap);
      }

      if (cfg.displacementMap != null) {
        sphereMaterial.displacementMap = loader.load(cfg.displacementMap)
        sphereMaterial.displacementScale = cfg.displacementScale || 1
      }

      if (cfg.bumpMap != null) {
        sphereMaterial.bumpMap = loader.load(cfg.bumpMap)
        sphereMaterial.bumpScale = cfg.bumpScale || 1
      }

      if (cfg.emissive != null && cfg.specularMap != null) {
        sphereMaterial.specularMap = loader.load(cfg.specularMap)
        sphereMaterial.shininess = cfg.shininess || 0
      }

      return sphereMaterial;
    }

    // _generatePlanetoid(planetoidData: any, parent: any) {
    //   const planetoid = new entity.Entity();
    //   planetoid.SetParent(parent)
    //   planetoid.SetName(planetoidData.name)
    //   parent.AddComponent(planetoid);

    //   if (planetoidData.children) {
    //     planetoidData.children.forEach((c: any) => this._generatePlanetoid(c, planetoid))
    //   }
    // }

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