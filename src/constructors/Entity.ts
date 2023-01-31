import { Quaternion, Vector3 } from "three";
export interface IEntity {
  _name: string|null;
  _components: {[key: string]: IComponent};
  _position: Vector3;
  _rotation: Quaternion;
  _handlers: {[key: string]: any};
  _parent: any|null;
  tick: (delta: number)=>void;
}

export interface IComponent {
  _parent: any|null;
  _RegisterHandler: (n: string, h: any) => void;
  SetParent: (p: any) => void;
  InitComponent: () => void;
  GetComponent: (n: any) => (() => void);
  FindEntity: (n: any) => (() => void);
  Broadcast: (m: IBroadcastMsg) => void;
  tick: (delta: number)=>void;
}

export interface IBroadcastMsg {
  topic: string;
  value?: any;
  model?: any;
  bones?: any;
  action?: any,
  time?: any,
}

export const entity = (() => {
  class Entity {
    _name: string|null;
    _components: {[key: string]: IComponent}; // threejs components

    _position: Vector3;
    _rotation: Quaternion;
    _handlers: {[key: string]: any};
    _parent: any|null;

    constructor() {
      this._name = null;
      this._components = {};

      this._position = new Vector3();
      this._rotation = new Quaternion();
      this._handlers = {};
      this._parent = null;
    }

    // store means to handle components (controls, cameras?)
    _RegisterHandler(n: string, h: any) {
      if (!(n in this._handlers)) {
        this._handlers[n] = [];
      }
      this._handlers[n].push(h);
    }

    // Usually is EntityManager
    SetParent(p: any) {
      this._parent = p;
    }

    SetName(n: string) {
      this._name = n;
    }

    get Name() {
      return this._name;
    }

    // subscribe to update (tick) wave
    // add self to updatables list within EntityManager
    SetActive(b: boolean) {
      this._parent.SetActive(this, b);
    }

    // attach components to the entity
    AddComponent(c: any) {
      c.SetParent(this);
      this._components[c.constructor.name] = c;

      c.InitComponent();
    }

    // provide reference to requested component
    GetComponent(n: string) {
      return this._components[n];
    }

    // provide reference to requested entity
    FindEntity(n: string) {
      return this._parent.Get(n);
    }

    // pass a message to the parent
    Broadcast(msg: IBroadcastMsg) {
      if (!(msg.topic in this._handlers)) {
        return;
      }

      for (let curHandler of this._handlers[msg.topic]) {
        curHandler(msg);
      }
    }

    SetPosition(p: Vector3) {
      this._position.copy(p);
      this.Broadcast({
          topic: 'update.position',
          value: this._position,
      });
    }

    SetQuaternion(r: any) {
      this._rotation.copy(r);
      this.Broadcast({
          topic: 'update.rotation',
          value: this._rotation,
      });
    }

    // Entity passes tick to its components
    tick(delta: number) {
      for (let k in this._components) {
        this._components[k as string].tick(delta);
      }
    }
  };

  class Component {
    _parent: any;

    constructor() {
      this._parent = null;
    }

    // inform parent entity about ways to handle this component
    _RegisterHandler(n: string, h: any) {
      this._parent._RegisterHandler(n, h);
    }

    // subscribe self to an entity
    SetParent(p: any) {
      this._parent = p;
    }

    InitComponent() {}

    // provide reference to itself via entity's eyes
    GetComponent(n: any) {
      return this._parent.GetComponent(n);
    }

    // provide reference to parent entity
    FindEntity(n: any) {
      return this._parent.FindEntity(n);
    }

    // pass a message to the parent
    Broadcast(m: IBroadcastMsg) {
      this._parent.Broadcast(m);
    }

    tick(_: number) {}
  };

  return {
    Entity: Entity,
    Component: Component,
  };

})();