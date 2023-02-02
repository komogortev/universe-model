import { AnimationMixer, LoadingManager, Object3D, Quaternion, sRGBEncoding, Vector3 } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { entity, IEntity } from '../../Entity';
import { finite_state_machine } from '../../../systems/finite-state-machine';
import { player_state } from './player-state';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export const player_entity = (() => {

  class CharacterFSM extends finite_state_machine.FiniteStateMachine {
    _proxy: any;

    constructor(proxy: any) {
      super();
      this._proxy = proxy;
      this._Init();
    }

    _Init() {
      this._AddState('idle', player_state.IdleState);
      this._AddState('walk', player_state.WalkState);
      this._AddState('run', player_state.RunState);
    }
  };

  class BasicCharacterControllerProxy {
    _animations: any;

    constructor(animations: any) {
      this._animations = animations;
    }

    get animations() {
      return this._animations;
    }
  };


  class BasicCharacterController extends entity.Component {
    _params: any;
    _decceleration: Vector3;
    _acceleration: Vector3;
    _velocity: Vector3;
    _position: Vector3;
    _target: any;
    _bones: any;
    _mixer: any;
    _manager: any;

    _animations: {[key: string]: any};
    _stateMachine: CharacterFSM;

    constructor(params: any) {
      super();
      this._params = params;
      this._decceleration = new Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new Vector3(1, 0.125, 50.0);
      this._velocity = new Vector3(0, 0, 0);
      this._position = new Vector3();

      this._animations = {};
      this._stateMachine = new CharacterFSM(
          new BasicCharacterControllerProxy(this._animations));

      this._Init();
    }

    _Init() {
      this._LoadModels();
    }

    InitComponent() {
      //this._RegisterHandler('health.death', (m) => { this._OnDeath(m); });
    }

    _OnDeath(msg: string) {
      //this._stateMachine.SetState('death');
    }

    _LoadModels() {
      const loader = new FBXLoader();

      loader.setPath('./models/aircrafts/Luminaris/');
      loader.load('Luminaris Animated FBX.FBX', (fbx) => {
        // MODEL
        this._target = fbx;
        this._target.scale.setScalar(0.05);
        this._target.position.set(-7,2,-7);
        this._params.scene.add(this._target);

        // TEXTURES
        this._target.traverse((child: any) => {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material && child.material.map) {
            child.material.map.encoding = sRGBEncoding;
          }
        });

        this.Broadcast({
          topic: 'load.character',
          model: this._target,
        });

        // ANIMATIONS
        this._mixer = new AnimationMixer(this._target);
        // local 'animation load' tool
        const _OnLoad = (animName: string, animationsList: any) => {
          const clip = animationsList.animations[0];
          const clipAction = this._mixer.clipAction(clip);

          this._animations[animName] = {
            clip: clip,
            action: clipAction,
          };
        };

        this._manager = new LoadingManager();
        this._manager.onLoad = () => {
          // set default state
          this._stateMachine.SetState('idle');
        };

        const loader = new FBXLoader(this._manager);
        // set path to animated fbx model
        loader.setPath('./models/aircrafts/Luminaris/');
        // Register first (and current model's only) animation for run and walk states
        loader.load('Luminaris Animated FBX.FBX', (a) => { _OnLoad('run', a); });
        loader.load('Luminaris Animated FBX.FBX', (a) => { _OnLoad('walk', a); });
      });
    }

    _FindIntersections(pos: Vector3) {
      console.log('_FindIntersections', null)
      const _IsAlive = (c: any) => {
        const h = c.entity.GetComponent('HealthComponent');
        if (!h) {
          return true;
        }
        return h._health > 0;
      };

      const grid = this.GetComponent('SpatialGridController');
      const nearby = grid.FindNearbyEntities(5).filter((e: IEntity) => _IsAlive(e));
      const collisions = [];

      for (let i = 0; i < nearby.length; ++i) {
        const e = nearby[i].entity;
        const d = ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5;

        // HARDCODED
        if (d <= 4) {
          collisions.push(nearby[i].entity);
        }
      }
      return collisions;
    }

    tick(delta: number) {
      if (!this._stateMachine._currentState) {
        return;
      }

      const input = this.GetComponent('BasicCharacterControllerInput');
      this._stateMachine.tick(delta, input);

      if (this._mixer) {
        this._mixer.update(delta);
      }

      // // HARDCODED
      // if (this._stateMachine._currentState._action) {
      //   this.Broadcast({
      //     topic: 'player.action',
      //     action: this._stateMachine._currentState.Name,
      //     time: this._stateMachine._currentState._action.time,
      //   });
      // }

      // no input updates for undefined states
      const currentState = this._stateMachine._currentState;
      if (currentState.Name != 'walk' &&
          currentState.Name != 'run' &&
          currentState.Name != 'idle') {
        return;
      }

      // Input applied to player entity
      const velocity = this._velocity;
      // attempt to bring player to stasis
      const frameDecceleration = new Vector3(
          velocity.x * this._decceleration.x,
          velocity.y * this._decceleration.y,
          velocity.z * this._decceleration.z
      );
      frameDecceleration.multiplyScalar(delta);
      frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
          Math.abs(frameDecceleration.z), Math.abs(velocity.z));

      velocity.add(frameDecceleration);

      // store original rotation position
      const controlObject = this._target;
      const _Q = new Quaternion();
      const _A = new Vector3();
      const _R = controlObject.quaternion.clone();

      // independent value of accelleration
      const acc = this._acceleration.clone();

      // react to shift key
      if (input._keys.shift) {
        acc.multiplyScalar(2.0);
      }

      // react to ctrl key
      if (input._keys.ctrl) {
        //attempt to move downward
        //acc.multiplyScalar(2.0);
      }

      // accelerate player velocity forward
      if (input._keys.forward) {
        velocity.z += acc.z * delta;
      }
      // accelerate player velosity backwards
      if (input._keys.backward) {
        velocity.z -= acc.z * delta;
      }
      // set values to rotate player model left
      if (input._keys.left) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * this._acceleration.y);
        _R.multiply(_Q);
      }
      // set values to rotate player model right
      if (input._keys.right) {
        _A.set(0, 1, 0);
        _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * delta * this._acceleration.y);
        _R.multiply(_Q);
      }

      // rotate target to a calculated position
      controlObject.quaternion.copy(_R);

      // move player to new position calculated based on velosity
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

      const pos = controlObject.position.clone();
      pos.add(forward);
      pos.add(sideways);

      // stop player from getting into objects
      // const collisions = this._FindIntersections(pos);
      // if (collisions.length > 0) {
      //   return;
      // }

      controlObject.position.copy(pos);
      this._position.copy(pos);

      // parent is player root entity
      this._parent.SetPosition(this._position);
      this._parent.SetQuaternion(this._target.quaternion);
    }
  };

  return {
      BasicCharacterControllerProxy: BasicCharacterControllerProxy,
      BasicCharacterController: BasicCharacterController,
  };

})();