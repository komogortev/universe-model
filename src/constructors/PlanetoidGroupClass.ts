import { Group } from 'three'
import type { IPlanetoid } from '../types/StarsStoreTypes';
import { PlanetoidClass } from './PlanetoidClass';

class PlanetoidGroupClass {
  nameId: string;
  _localConfig: any;
  _threeGroup: any;
  _updatables: Array<any>

  constructor(planetoidConfig: any) {
    this.nameId = `PlanetoidRootGroupClass`
    this._localConfig = planetoidConfig;
    this._threeGroup = new Group();
    this._threeGroup.nameId = `Three${planetoidConfig.nameId}SceneRootGroup`; // A group holds other objects but cannot be seen itself
    this._updatables = [];

    this._intialize();
  }

  _intialize() {
    this.initPlanetoidsRecursevly(this._localConfig, this.threeGroup);
  }

  initPlanetoidsRecursevly (config: any, parentThreeGroup?: any | null): void {
    // attempt generating current config planetoid class
    const newPlanetoidClass = new PlanetoidClass(config, parentThreeGroup)
    this._updatables.push(newPlanetoidClass);

    parentThreeGroup.add(newPlanetoidClass.threeGroup)

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
}

export { PlanetoidGroupClass }