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

  constructor(camera: PerspectiveCamera, gravitationalParent?: any|null) {
    this.nameId = 'SpaceCraftClass'
    this._threeGroup = new Group();
    this._threeGroup.name = 'CharacterGroup';
    this._updatables = [];

    this._Camera = camera;
    this._CameraHelper = new CameraHelper(this._Camera);
    this._Controls = new BasicCharacterControllerInput(document.body);
    this._Controls.enabled = false
    this._GravParent = gravitationalParent != null ? gravitationalParent: null;

    this.rotationQ_ = new Quaternion();
    this.phi_ = 0,
    this.theta_ = 0

    this._initCharacterBody()
    this._initCharacterCamera()
  }

  _initCharacterBody(){
    this._CharacterBody = new UfoClass('Free float vehicle');
    this._threeGroup.add(this._CharacterBody.threeGroup);
    this._updatables.push(this._CharacterBody);

    // // axes Helper
    // const axesHelper = new AxesHelper( 15 );
    // this._CharacterBody.threeGroup.add( axesHelper );
    // // Grid Helper
    // this._CharacterBody.threeGroup.add(new GridHelper(12, 12, "#666666", "#222222"));
  }

  _initCharacterCamera() {
    this._Camera.position.set(0, 12, -18);

    this._CharacterBody.threeGroup.add(this._Camera);
    this._Camera.lookAt(new Vector3(0, 0, -0.5));
    this._Camera.updateProjectionMatrix();
  }

  _updateBodyRotation() {
    this._Camera.quaternion.copy(this.rotationQ_)
  }

  _calculateMouseInputToRotation() {
    const xh = this._Controls.current_.mouseXDelta / window.innerWidth;
    const yh = this._Controls.current_.mouseYDelta / window.innerHeight;

    // turn mouse movement into spherical coordinates
    this.phi_ += -xh * 25;
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

  _reactToRecordedTickInputs() {
    this._calculateMouseInputToRotation()
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
    this._reactToRecordedTickInputs()
    this._updateBodyRotation()
    this._Controls.tick(delta)
  }
}

export { SpaceCraftClass }