import {
  SphereGeometry,
  MeshNormalMaterial,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector3,
  TextureLoader,
  Group
} from 'three'
import { PlanetoidClass } from './Planetoid';


class StarGroupClass {
  nameId: string;
  _localConfig: any;
  _threeGroup: any;
  _children: any;

  constructor(starSystemConfig: any) {
    this.nameId = `${starSystemConfig.nameId}SystemClass`
    this._localConfig = starSystemConfig;
    this._threeGroup = new Group();
    this._threeGroup.name = 'StarGroup'; // A group holds other objects but cannot be seen itself
    this._children = [];

    this._intialize();
  }

  _intialize() {
    this.loopThroughStarConfigRecurs(this._localConfig);
  }

  loopThroughStarConfigRecurs (config: any, parent?: any | null): void {
    if (config.type != null && ['star', 'planet', 'moon'].includes(config.type)) {
      // generate current config planetoid class
      const newPlanetoidClass = new PlanetoidClass(config, parent)

      // attach class.group to threeGroup
      // attach class to children
      if (config.type == 'star') {
        this._threeGroup.add(newPlanetoidClass.threeGroup)
        this._children.push(newPlanetoidClass)
      } else if (parent != null) {
        if (config.type == 'planet') {
          // planet gets attached to root Star group
          this._threeGroup.add(newPlanetoidClass.threeGroup)
          this._children.push(newPlanetoidClass)
        } else {
          //moon gets attached to planet
          parent.threeGroup.children[0].add(newPlanetoidClass.threeGroup)
          parent.children.push(newPlanetoidClass)
          //this._children.push(newPlanetoidClass)
        }
      }

      // repeat for config.children
      if (config.children != null) {
        config.children.forEach((childConfig: any) => {
          this.loopThroughStarConfigRecurs(childConfig, newPlanetoidClass)
        })
      }
    }
  }

  get threeGroup() {
    return this._threeGroup
  }

  get children() {
    return this._children
  }
}

export { StarGroupClass }