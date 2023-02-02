import { THREE } from '../components/three-defs';

export interface IEntity {
  _name: string|null;
  _components: {[key: string]: IComponent};
  _position: THREE.Vector3;
  _rotation: THREE.Quaternion;
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
    name_: string|null;
    id_: string|null;
    components_: {[key: string]: any}|null;
    attributes_: {[key: string]: any};

    _position:  THREE.Vector3;
    _rotation:  THREE.Quaternion;
    handlers_: {[key: string]: any}|null;
    parent_: any;
    dead_: boolean;

    constructor() {
      this.name_ = null;
      this.id_ = null;
      this.components_ = {};
      this.attributes_ = {};

      this._position = new THREE.Vector3();
      this._rotation = new THREE.Quaternion();
      this.handlers_ = {};
      this.parent_ = null;
      this.dead_ = false;
    }

    Destroy() {
      for (let k in this.components_) {
        this.components_[k].Destroy();
      }
      this.components_ = null;
      this.parent_ = null;
      this.handlers_ = null;
    }

    // store means to handle components (controls, cameras?)
    RegisterHandler_(n: string, h: any) {
      if (this.handlers_ == null) return

      if (!(n in this.handlers_)) {
        this.handlers_[n] = [];
      }
      this.handlers_[n].push(h);
    }

    // Usually is EntityManager or other Entity
    SetParent(p: any) {
      this.parent_ = p;
    }

    SetName(n: string) {
      this.name_ = n;
    }

    SetId(id: string) {
      this.id_ = id;
    }

    get Name() {
      return this.name_;
    }

    get ID() {
      return this.id_;
    }

    get Manager() {
      return this.parent_;
    }

    get Attributes() {
      return this.attributes_;
    }

    get IsDead() {
      return this.dead_;
    }

    // Subscribe to update (tick) wave
    // add self to "updatables" list within EntityManager
    SetActive(b: boolean) {
      this.parent_.SetActive(this, b);
    }

    SetDead() {
      this.dead_ = true;
    }

    // attach components to the entity
    AddComponent(c: any) {
      c.SetParent(this);

      if (this.components_ != null) {
        this.components_[c.constructor.name] = c;
      } else {
        this.components_ = { [c.constructor.name]: c }
      }

      c.InitComponent();
    }

    InitEntity() {
      for (let k in this.components_) {
        this.components_[k].InitEntity();
      }
    }

    // provide reference to requested component
    GetComponent(n: string) {
      return this.components_ != null ? this.components_[n] : null;
    }

    // provide reference to requested entity
    FindEntity(n: string) {
      return this.parent_.Get(n);
    }

    // pass a message to the parent
    Broadcast(msg: IBroadcastMsg) {
      if (this.IsDead) {
        return;
      }

      if (this.handlers_ == null || !(msg.topic in this.handlers_)) {
        return;
      }

      for (let curHandler of this.handlers_[msg.topic]) {
        curHandler(msg);
      }
    }

    SetPosition(p: THREE.Vector3) {
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

    get Position() {
      return this._position;
    }

    get Quaternion() {
      return this._rotation;
    }

    get Forward() {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(this._rotation);
      return forward;
    }

    get Up() {
      const forward = new THREE.Vector3(0, 1, 0);
      forward.applyQuaternion(this._rotation);
      return forward;
    }

    // Entity passes tick to its components
    tick(delta: number) {
      for (let k in this.components_) {
        this.components_[k as string].tick(delta);
      }
    }
  };

  class Component {
    parent_: any;
    pass_: number;

    constructor() {
      this.parent_ = null;
      this.pass_ = 0;
    }

    Destroy() {
    }

    // subscribe self to an entity
    SetParent(p) {
      this.parent_ = p;
    }

    SetPass(p) {
      this.pass_ = p;
    }

    get Pass() {
      return this.pass_;
    }

    InitComponent() {}

    InitEntity() {}

    // provide reference to itself via entity's eyes
    GetComponent(n: any) {
      return this.parent_.GetComponent(n);
    }

    get Manager() {
      return this.parent_.Manager;
    }

    get Parent() {
      return this.parent_;
    }



    // provide reference to parent entity
    FindEntity(n: any) {
      return this.parent_.FindEntity(n);
    }

    Broadcast(m) {
      this.parent_.Broadcast(m);
    }

    tick(_: number) {}

    // inform parent entity about ways to handle this component
    RegisterHandler_(n: string, h: any) {
      this.parent_.RegisterHandler_(n, h);
    }

  };

  return {
    Entity: Entity,
    Component: Component,
  };

})();