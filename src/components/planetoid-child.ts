import { THREE } from './three-defs';
import { entity } from "../constructors/Entity";


export const planetoid_child = (() => {

  class PlanetoidChild extends entity.Component {
    params_: any;

    constructor(params: any) {
      super();
      this.params_ = params;
    }


    Destroy() {
      //this.particles_.Destroy();
    }

    InitEntity() {
    }

    tick(delta: number) {
    }
  }

  return {
    PlanetoidChild: PlanetoidChild,
  };
})();