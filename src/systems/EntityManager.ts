import { IEntity } from "../constructors/Entity";

export const entity_manager = (() => {

  class EntityManager {
    _ids: number;
    // storage for all registered, incoming entities
    _entitiesMap: {[key: string]: IEntity};
    // list of active entities (_updatables)
    _updatables: Array<IEntity>;

    constructor() {
      this._ids = 0;
      this._entitiesMap = {};
      this._updatables = [];
    }

    _GenerateName() {
      this._ids += 1;
      return '__name__' + this._ids;
    }

    Get(n: any) {
      return this._entitiesMap[n];
    }

    Filter(cb: any) {
      return this._updatables.filter(cb);
    }

    // Register entity with _entitiesMap storage and
    // set as default in (active/updatables) entities collection
    Add(e: any, n: string) {
      if (!n) {
        n = this._GenerateName();
      }

      this._entitiesMap[n] = e;
      this._updatables.push(e);

      // acknowledge entity's add request
      e.SetParent(this);
      e.SetName(n);
    }

    // Sets status of _entitiesMap element in (active) entities collection
    SetActive(e: IEntity, b: boolean) {
      // fyi works only to remove from current updatables collection
      const i = this._updatables.indexOf(e);
      if (i < 0) {
        return;
      }

      this._updatables.splice(i, 1);
    }

    tick(delta: number) {
      for (let e of this._updatables) {
        e.tick(delta);
      }
    }
  }

  return {
    EntityManager: EntityManager
  };

})();