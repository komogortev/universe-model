import { Group, SphereGeometry } from 'three'
import { PlanetoidClass } from './PlanetoidClass';

class PlanetoidGroupClass {
  nameId: string;
  _localConfig: any;
  _threeGroup: any;
  _updatables: Array<any>;
  _intersectables: Array<any>;
  _sharedSphereGeometry: any;

  constructor(planetoidConfig: any) {
    this.nameId = `PlanetoidRootGroupClass`
    this._localConfig = planetoidConfig;
    this._threeGroup = new Group();
    this._threeGroup.name = `Three${planetoidConfig.nameId}SceneRootGroup`; // A group holds other objects but cannot be seen itself
    this._updatables = [];
    this._intersectables = [];
    this._sharedSphereGeometry = new SphereGeometry(1, 132, 132);
    this._intialize();
  }

  _intialize() {
    this.initPlanetoidsRecursevly(this._localConfig, this.threeGroup);
  }

  initPlanetoidsRecursevly (config: any, parentThreeGroup?: any | null): void {
    // attempt generating current config planetoid class
    const newPlanetoidClass = new PlanetoidClass(config, parentThreeGroup, { geometry: this._sharedSphereGeometry })
    this._updatables.push(newPlanetoidClass);
    this._intersectables.push([...newPlanetoidClass.intersectables]);

    // group assigned to group sets child position to root position
    // to calculate child position relative to actual parent we need to assign it to mesh
    if (config.type == 'star') {
      parentThreeGroup.add(newPlanetoidClass.threeGroup)
    } else if (config.type == 'planet') {
      // planet gets attached to root Star group
      parentThreeGroup.add(newPlanetoidClass.threeGroup)
    } else {
      // moon gets attached to planet mesh
      parentThreeGroup.children[0].add(newPlanetoidClass.threeGroup)
    }

    // repeat for config.children
    if (config.children != null) {
      config.children.forEach((childConfig: any) => {
        this.initPlanetoidsRecursevly(childConfig, newPlanetoidClass.threeGroup)
      })
    }
  }


  get threeGroup() {
    return this._threeGroup;
  }

  get updatables() {
    return this._updatables;
  }

   get intersectables() {
    return this._intersectables;
  }
}

export { PlanetoidGroupClass }