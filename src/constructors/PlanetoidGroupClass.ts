import { Group } from 'three'
import type { IPlanetoid } from '../types/StarsStoreTypes';
import { PlanetoidClass } from './PlanetoidClass';

class PlanetoidGroupClass {
  nameId: string;
  _localConfig: any;
  _threeGroup: any;
  _updatables: Array<any>

  constructor(planetoidConfig: any) {
    this.nameId = `${planetoidConfig.nameId}GroupClass`
    this._localConfig = planetoidConfig;
    this._threeGroup = new Group();
    this._threeGroup.nameId = `Three${planetoidConfig.nameId}Group`; // A group holds other objects but cannot be seen itself
    this._updatables = [];

    this._intialize();
  }

  _intialize() {
    this.initPlanetoidsRecursevly(this._localConfig);
  }

  initPlanetoidsRecursevly (config: any, parentThreeGroup?: any | null): void {
    // attempt generating current config planetoid class
    const newPlanetoidClass = new PlanetoidClass(config, parent)
    this._updatables.push(newPlanetoidClass);

    if (parentThreeGroup != null) {
      parentThreeGroup.add(newPlanetoidClass.threeGroup)
    } else {
      this._threeGroup.add(newPlanetoidClass.threeGroup)
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
}

export { PlanetoidGroupClass }