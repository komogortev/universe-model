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


class StarGroup {
  _starSystemConfig: any;
  _threeGroup: any;
  _children: any;

  constructor(starSystemConfig: any) {
    this._starSystemConfig = starSystemConfig;
    this._threeGroup = new Group();
    this._threeGroup.name = 'StarGroup'; // A group holds other objects but cannot be seen itself
    this._children = [];

    this._intialize();
  }

  _intialize() {
    this.loopThroughStarConfigRecurs(this._starSystemConfig);
  }

  loopThroughStarConfigRecurs (config: any, parent?: any | null): void {
    if (config.type != null && ['star', 'planet', 'moon'].includes(config.type)) {
      // generate current config planetoid class
      const currentPlanetoid = new PlanetoidClass(config, parent)

      // attach class.group to threeGroup
      // attach class to children
      if (config.type == 'star') {
        this._threeGroup.add(currentPlanetoid.threeGroup)
        this._children.push(currentPlanetoid)
      } else if (parent != null) {
        if (config.type == 'planet') {
          // planet gets attached to root Star group
          this._threeGroup.add(currentPlanetoid.threeGroup)
          this._children.push(currentPlanetoid)
        } else {
          //moon gets attached to planet
          parent.threeGroup.children[0].add(currentPlanetoid.threeGroup)
          parent.children.push(currentPlanetoid)
          //this._children.push(currentPlanetoid)
        }
      }

      // repeat for config.children
      if (config.children != null) {
        config.children.forEach((childConfig: any) => {
          this.loopThroughStarConfigRecurs(childConfig, currentPlanetoid)
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

  tick(delta: number) {
  }
}

export { StarGroup }