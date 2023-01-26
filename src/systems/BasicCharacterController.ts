import { Vector3, Quaternion } from "three"
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

class BasicCharacterControllerProxy {
  _animations: any;

  constructor(animations: any) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
};

/**
 * Represents single character movement
*/
class BasicCharacterController {
  _params: any;
  _decceleration: any;
  _acceleration: any;
  _velocity: any;
  _position: any;

  _input: any;
  _stateMachine: any;
  _animations: any;

  constructor(params: any) {
    this._params = params;
    this._decceleration = new Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new Vector3(1, 0.25, 50.0);
    this._velocity = new Vector3(0, 0, 0);
    this._position = new Vector3();

    this._input = new BasicCharacterControllerInput(document.body);
    this._stateMachine = new CharacterFSM(
      new BasicCharacterControllerProxy(this._animations));
    this._animations = {};
    //this._LoadModels();
  }


  _LoadModels() {
    const loader = new FBXLoader();
    loader.setPath('./resources/zombie/');
    loader.load('mremireh_o_desbiens.fbx', (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState('idle');
      };

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);

        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.setPath('./resources/zombie/');
      loader.load('walk.fbx', (a) => { _OnLoad('walk', a); });
      loader.load('run.fbx', (a) => { _OnLoad('run', a); });
      loader.load('idle.fbx', (a) => { _OnLoad('idle', a); });
      loader.load('dance.fbx', (a) => { _OnLoad('dance', a); });
    });
  }

  get Position() {
    return this._position;
  }

  get Rotation() {
    if (!this._target) {
      return new THREE.Quaternion();
    }
    return this._target.quaternion;
  }

  _reactToRecordedTickInputs(delta) {
    if (!this._stateMachine._currentState) {
      return;
    }

    this._stateMachine.Update(delta, this._input);

    const velocity = this._velocity;
    const frameDecceleration = new Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(delta);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
        Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new Quaternion();
    const _A = new Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this._input._keys.shift) {
      acc.multiplyScalar(2.0);
    }

    if (this._stateMachine._currentState.Name == 'dance') {
      acc.multiplyScalar(0.0);
    }

    if (this._input._keys.forward) {
      velocity.z += acc.z * delta;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * delta;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * delta * this._acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * delta);
    forward.multiplyScalar(velocity.z * delta);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    this._position.copy(controlObject.position);

    if (this._mixer) {
      this._mixer.update(delta);
    }
  }

  tick(delta: number) {
    this._reactToRecordedTickInputs();
  }
};

class BasicCharacterControllerInput {
  keys_: {
    forward: boolean,
    backward: boolean,
    left: boolean,
    right: boolean,
    space: boolean,
    shift: boolean,
  };
  current_: {
    leftButton: boolean,
    rightButton: boolean,
    mouseXDelta: number,
    mouseYDelta: number,
    mouseX: number,
    mouseY: number
  };
  previous_: any;
  previousKeys_: any;
  _enabled: boolean;

  constructor(target: any) {
    const target_ = target || document;
    this.keys_ = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    this.current_ = {
      leftButton: false,
      rightButton: false,
      mouseXDelta: 0,
      mouseYDelta: 0,
      mouseX: 0,
      mouseY: 0
    }
    this.previous_ = null;
    this.previousKeys_ = {};
    this._enabled = true;

    target_.addEventListener('mousedown', (e: MouseEvent) => {
      if (this._enabled) this.onMouseDown_(e)
    }, false);
    target_.addEventListener('mousemove', (e: MouseEvent) => {
      if (this._enabled) this.onMouseMove_(e)
    }, false);
    target_.addEventListener('mouseup', (e: MouseEvent) => {
      if (this._enabled) this.onMouseUp_(e)
    }, false);
    target_.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this._enabled) this._onKeyDown(e)
    }, false);
    target_.addEventListener('keyup', (e: KeyboardEvent) => {
      if (this._enabled) this._onKeyUp(e)
    }, false);
  }

  onMouseDown_(e: MouseEvent) {
    switch(e.button) {
      case 0: {
        this.current_.leftButton = true;
        console.log('left mouse dwn')
        break;
      }
      case 2: {
        this.current_.rightButton = true;
        console.log('right mouse dwn')
        break;
      }
    }
  }

  onMouseUp_(e: MouseEvent) {
    switch(e.button) {
      case 0: {
        this.current_.leftButton = false;
        break;
      }
      case 2: {
        this.current_.rightButton = false;
        break;
      }
    }
  }

  onMouseMove_(e: MouseEvent) {
    // we reduce screen size to figure mouse going up/down or left/right from the center
    this.current_.mouseX = e.pageX - window.innerWidth / 2;
    this.current_.mouseY = e.pageY - window.innerHeight / 2;

    if (this.previous_ === null) {
      this.previous_ = {...this.current_};
    }

    // Compute mouse move delta substracting current pos from previous
    this.current_.mouseXDelta = this.current_.mouseX - (this.previous_.mouseX != null ? this.previous_.mouseX : 0);
    this.current_.mouseYDelta = this.current_.mouseY - (this.previous_.mouseY != null ? this.previous_.mouseY : 0);
  }

  _onKeyDown(e: KeyboardEvent) {
    //this.keys_[e.key] = true;
    switch(e.key) {
      case 'w':
        this.keys_.forward = true;
        break;
      case 's':
        this.keys_.backward = true;
        break;
      case 'a':
        this.keys_.left = true;
        break;
      case 'd':
        this.keys_.right = true;
        break;
      case 'Shift':
        this.keys_.shift = true;
        break;
      case ' ':
        this.keys_.space = true;
        break;
    }
  }

  _onKeyUp(e: KeyboardEvent) {
    //this.keys_[e.key] = false;
    switch(e.key) {
      case 'w':
        this.keys_.forward = false;
        break;
      case 's':
        this.keys_.backward = false;
        break;
      case 'a':
        this.keys_.left = false;
        break;
      case 'd':
        this.keys_.right = false;
        break;
      case 'Shift':
        this.keys_.shift = false;
        break;
      case ' ':
        this.keys_.space = false;
        break;
    }
  }

  key(keyCode) {
    return !!this.keys_[keyCode];
  }

  isReady() {
    return this.previous_ !== null;
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(enabled: boolean) {
    this._enabled = enabled
  }

  tick(delta: number) {
    // push current keyboard/mouse snapshot into previous
    if (this.previous_ !== null) {
      this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
      this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

      this.previous_ = { ...this.current_ }
    }
  }
};

class FiniteStateMachine {
  _states: any;
  _currentState: any;

  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _AddState(name: string, type: any) {
    this._states[name] = type;
  }

  SetState(name: string) {
    const prevState = this._currentState;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  tick(delta: number, input: any) {
    if (this._currentState) {
      this._currentState.tick(delta, input);
    }
  }
};

class CharacterFSM extends FiniteStateMachine {
  _proxy: any;

  constructor(proxy: any) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._AddState('idle', IdleState);
    this._AddState('walk', WalkState);
    this._AddState('run', RunState);
    //this._AddState('dance', DanceState);
  }
};

class State {
  _parent: any;

  constructor(parent: any) {
    this._parent = parent;
  }

  Enter() {}
  Exit() {}
  tick(delta: number) {}
};

class IdleState extends State {
  constructor(parent: any) {
    super(parent);
  }

  get Name() {
    return 'idle';
  }

  Enter(prevState: any) {
    const idleAction = this._parent._proxy._animations['idle'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {
  }

  tick(_: number, input: any) {
    if (input._keys.forward || input._keys.backward) {
      this._parent.SetState('walk');
    } else if (input._keys.space) {
      this._parent.SetState('dance');
    }
  }
};

class WalkState extends State {
  constructor(parent: any) {
    super(parent);
  }

  get Name() {
    return 'walk';
  }

  Enter(prevState: any) {
    const curAction = this._parent._proxy._animations['walk'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'run') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  tick(delta: number, input: any) {
    if (input._keys.forward || input._keys.backward) {
      if (input._keys.shift) {
        this._parent.SetState('run');
      }
      return;
    }

    this._parent.SetState('idle');
  }
};

class RunState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'run';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['run'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'walk') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      if (!input._keys.shift) {
        this._parent.SetState('walk');
      }
      return;
    }

    this._parent.SetState('idle');
  }
};

export { BasicCharacterController, BasicCharacterControllerInput }