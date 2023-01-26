import { Group, ArrowHelper, AxesHelper, Quaternion, PerspectiveCamera,
  SphereGeometry,  MeshNormalMaterial,  MeshBasicMaterial,  Mesh,  Raycaster,
  Vector3,  TextureLoader, GridHelper, MathUtils, LineBasicMaterial, BufferGeometry, Line, CameraHelper
} from 'three'
import { UfoClass } from '../constructors/Models/Vehicles/UfoClass';
import { BasicCharacterControllerInput } from '../systems/BasicCharacterController';

function clamp(number: number, min: number, max: number) {
  //return Math.max(min, Math.min(number, max));
  return Math.min(Math.max(number, min), max);
}

class SpaceCraftClass {
  nameId: string;
  _threeGroup: Group;
  _updatables: Array<any>;

  _Camera: PerspectiveCamera;
  _CameraHelper: any;
  _Controls: any;
  _GravParent: any;
  _CharacterBody: any;

  rotationQ_: any;
  phi_: number;
  theta_: number;

  _decceleration: any;
  _acceleration: any;
  _velocity: any;
  _position: any;

  constructor(camera: PerspectiveCamera, gravitationalParent?: any|null) {
    // class infrastructure
    this.nameId = 'SpaceCraftClass'
    this._threeGroup = new Group();
    this._threeGroup.name = 'CharacterGroup';
    this._updatables = [];

    // class tools
    this._Camera = camera;
    this._CameraHelper = new CameraHelper(this._Camera);
    this._Controls = new BasicCharacterControllerInput(document.body);
    this._Controls.enabled = false
    this._GravParent = gravitationalParent != null ? gravitationalParent: null;

    // mouse camera controls
    this.rotationQ_ = new Quaternion();
    this.phi_ = 0,
    this.theta_ = 0
    // keyboard body controls
    this._decceleration = new Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new Vector3(1, 0.25, 50.0);
    this._velocity = new Vector3(0, 0, 0);
    this._position = new Vector3();

    this._initCharacterBody()
    this._initCharacterCamera()
  }

  _initCharacterBody(){
    this._CharacterBody = new UfoClass('Free float vehicle');
    this._threeGroup.add(this._CharacterBody.threeGroup);
    this._updatables.push(this._CharacterBody);

    // axes Helper
    const axesHelper = new AxesHelper( 15 );
    this._CharacterBody.threeGroup.add( axesHelper );
    // Grid Helper
    this._CharacterBody.threeGroup.add(new GridHelper(12, 12, "#666666", "#222222"));
  }

  _initCharacterCamera() {
    this._Camera.position.set(0, 12, -18);

    this._CharacterBody.threeGroup.add(this._Camera);
    this._Camera.lookAt(new Vector3(0, 0, -0.5));
    this._Camera.updateProjectionMatrix();
  }

  _updateCameraRotation() {
    this._Camera.quaternion.copy(this.rotationQ_)
  }

  _calculateMouseInputToRotation() {
    const xh = this._Controls.current_.mouseXDelta / window.innerWidth;
    const yh = this._Controls.current_.mouseYDelta / window.innerHeight;

    // turn mouse movement into spherical coordinates
    this.phi_ += -xh * 10;
    this.theta_ = clamp(this.theta_ + -yh * 5, -Math.PI / 3, -Math.PI / 3)

    const qx = new Quaternion();
    qx.setFromAxisAngle(new Vector3(0,1,0), this.phi_);

    const qy = new Quaternion();
    qy.setFromAxisAngle(new Vector3(0,1,0), this.phi_);

    const q = new Quaternion();
    q.multiply(qx);
    q.multiply(qy);

    this.rotationQ_.copy(q);
  }

  _reactToRecordedTickInputs(delta: number) {
    this._calculateMouseInputToRotation()

    const velocity = this._velocity;
    const frameDecceleration = new Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
    );

    frameDecceleration.multiplyScalar(delta);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
        Math.abs(frameDecceleration.z), Math.abs(velocity.z));
    frameDecceleration.y = Math.sign(frameDecceleration.y) * Math.min(
        Math.abs(frameDecceleration.y), Math.abs(velocity.y));

    velocity.add(frameDecceleration);

    const controlObject = this.threeGroup;
    const _Q = new Quaternion();
    const _A = new Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this._Controls.keys_.forward) {
      velocity.z += acc.z * delta;
    }
    if (this._Controls.keys_.backward) {
      velocity.z -= acc.z * delta;
    }
    if (this._Controls.keys_.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._Controls.keys_.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * delta * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._Controls.keys_.shift) {
      velocity.y -= acc.y * delta;
      // acc.multiplyScalar(2.0);
    }
    if (this._Controls.keys_.space) {
      velocity.y += acc.y * delta;
      console.log(velocity.y)
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

    const vertical = new Vector3(0, 1, 0);
    vertical.applyQuaternion(controlObject.quaternion);
    vertical.normalize();

    sideways.multiplyScalar(velocity.x * delta);
    vertical.multiplyScalar(velocity.y * delta);
    forward.multiplyScalar(velocity.z * delta);

    controlObject.position.add(forward);
    controlObject.position.add(vertical);
    controlObject.position.add(sideways);

    this._position.copy(controlObject.position);
  }

  get threeGroup() {
    return this._threeGroup;
  }

  get updatables() {
    return this._updatables;
  }

  get camera() {
    return this._Camera;
  }

  get cameraHelper() {
    return this._CameraHelper;
  }

  set enabled(enabled: boolean) {
    this._Controls.enabled = enabled
  }

  tick(delta: number) {
    if (this._Controls.enabled) {
      this._reactToRecordedTickInputs(delta)
      this._updateCameraRotation()
      this._Controls.tick(delta)
    }
  }
}

export { SpaceCraftClass }