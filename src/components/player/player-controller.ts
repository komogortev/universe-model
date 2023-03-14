import { THREE } from '../threejs/three-defs';
import { entity } from '../../constructors/Entity';
import { math } from '../math';

export const player_controller = (() => {

  class PlayerController extends entity.Component {
    dead_: boolean;
    decceleration_: THREE.Vector3;
    acceleration_: THREE.Vector3;
    velocity_: THREE.Vector3;

    constructor() {
      super();
      this.dead_ = false;
      this.decceleration_ = new THREE.Vector3(-0.0005, -0.0001, -1);
      this.acceleration_ = new THREE.Vector3(100, 0.5, 25000);
      this.velocity_ = new THREE.Vector3(0, 0, 0);
    }

    InitComponent() {
      this.RegisterHandler_('physics.collision', (m: any) => { this.OnCollision_(m); });
    }

    InitEntity() {
    }

    OnCollision_() {
      if (!this.dead_) {
        this.dead_ = true;
        console.log('EXPLODE ' + this.Parent.Name);
        this.Broadcast({topic: 'health.dead'});
      }
    }

    Fire_() {
      this.Broadcast({
          topic: 'player.fire'
      });
    }

    tick(delta: number) {
      if (this.dead_) {
        return;
      }

      const velocity = this.velocity_;
      const frameDecceleration = new THREE.Vector3(
          velocity.x * this.decceleration_.x,
          velocity.y * this.decceleration_.y,
          velocity.z * this.decceleration_.z
      );
      frameDecceleration.multiplyScalar(delta);

      velocity.add(frameDecceleration);
      // constant application of velocity to the player!
      // *return max of the first pair and min of the second
      // @Todo: add means to start and alter velocity (key controls)
      velocity.z = -math.clamp(Math.abs(velocity.z), 0, 125.0);

      const _PARENT_Q = this.Parent.Quaternion.clone();
      const _PARENT_P = this.Parent.Position.clone();

      const _Q = new THREE.Quaternion();
      const _A = new THREE.Vector3();
      const _R = _PARENT_Q.clone();

      const acc = this.acceleration_.clone();

      const input = this.Parent.Attributes.InputCurrent;
      if (input) {
        if (input.shift > 0) {
          // acc.multiplyScalar(2.0); // accelleration
          // start speed forward and few steps up
          velocity.z = -math.clamp(
            Math.abs(velocity.z),
            input.shift * 50,
            input.shift * 125.0
          );
        }
         if (input.ctrl) {
          // slow speed down and bring to a halt
          // velocity.z = -math.clamp(
          //   Math.abs(velocity.z),
          //   input.shift * 50,
          //   input.shift * 125.0
          // );
        }

        if (input.axisZLeft) {
          _A.set(0, 0, input.axisZLeft);
          _Q.setFromAxisAngle(_A, Math.PI * delta * acc.y * input.axisZLeft);
          _R.multiply(_Q);
        }
         if (input.axisZRight) {
          _A.set(0, 0, input.axisZRight);
          _Q.setFromAxisAngle(_A, -Math.PI * delta * acc.y * input.axisZRight);
          _R.multiply(_Q);
        }
        if (input.axis1Forward) {
          _A.set(1, 0, 0);
          _Q.setFromAxisAngle(_A, Math.PI * delta * acc.y * input.axis1Forward);
          _R.multiply(_Q);
        }
        if (input.axis1Side) {
          _A.set(0, 1, 0);
          _Q.setFromAxisAngle(_A, -Math.PI * delta * acc.y * input.axis1Side);
          _R.multiply(_Q);
        }
        if (input.axis2Side) {
          _A.set(0, 0, -1);
          _Q.setFromAxisAngle(_A, Math.PI * delta * acc.y * input.axis2Side);
          _R.multiply(_Q);
        }

        if (input.space) {
          this.Fire_();
        }
      }

      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(_PARENT_Q);
      forward.normalize();

      const updown = new THREE.Vector3(0, 1, 0);
      updown.applyQuaternion(_PARENT_Q);
      updown.normalize();

      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(_PARENT_Q);
      sideways.normalize();

      sideways.multiplyScalar(velocity.x * delta);
      updown.multiplyScalar(velocity.y * delta);
      forward.multiplyScalar(velocity.z * delta);

      const pos = _PARENT_P;
      pos.add(forward);
      pos.add(sideways);
      pos.add(updown);

      this.Parent.SetPosition(pos);
      this.Parent.SetQuaternion(_R);
    }
  };

  return {
    PlayerController: PlayerController,
  };

})();