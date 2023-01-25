import { Group, ArrowHelper, AxesHelper, Quaternion, PerspectiveCamera,
  SphereGeometry,  MeshNormalMaterial,  MeshBasicMaterial,  Mesh,  Raycaster,
  Vector3,  TextureLoader, GridHelper, MathUtils, LineBasicMaterial, BufferGeometry, Line, CameraHelper
} from 'three'
import { UfoClass } from '../constructors/Models/Vehicles/UfoClass';
import { BasicCharacterController } from '../systems/BasicCharacterController';

class SpaceCraftClass {
  nameId: string;
  _threeGroup: Group;
  _updatables: Array<any>;

  _Camera: PerspectiveCamera;
  _CameraHelper: any;
  _Controls: any;
  _GravParent: any;
  _CharacterBody: any;

  lookAt_: any;

  constructor(camera: PerspectiveCamera, gravitationalParent?: any|null) {
    this.nameId = 'SpaceCraftClass'
    this._threeGroup = new Group();
    this._threeGroup.name = 'CharacterGroup';
    this._updatables = [];

    this._Camera = camera;
    this._CameraHelper = new CameraHelper(this._Camera);
    this._Controls = new BasicCharacterController(document.body);
    this._GravParent = gravitationalParent != null ? gravitationalParent: null;

    this.lookAt_ = {x: 0,y: 0, z: 10}

    this._initCharacterBody()
    this._initCharacterCamera()
  }


  _initCharacterBody(){
    this._CharacterBody = new UfoClass('Free float vehicle');

    // // axes Helper
    // const axesHelper = new AxesHelper( 15 );
    // this._CharacterBody.threeGroup.add( axesHelper );
    // // Grid Helper
    // this._CharacterBody.threeGroup.add(new GridHelper(12, 12, "#666666", "#222222"));

    this._threeGroup.add(this._CharacterBody.threeGroup)
    this._updatables.push(this._CharacterBody)

  }

  _initCharacterCamera() {
    this._Camera.position.set(0,12,-18);
    this._Camera.lookAt(this.lookAt_.x,this.lookAt_.y,this.lookAt_.z);
    // axes Helper
    const axesHelper = new AxesHelper( 15 );
    this._Camera.add( axesHelper );
    // Grid Helper
    this._Camera.add(new GridHelper(12, 12, "#666666", "#222222"));

    this._CharacterBody.threeGroup.add(this._Camera);
    this._CharacterBody.threeGroup.add(this._CameraHelper);
    this._Camera.updateProjectionMatrix();
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

  tick(delta: number) {
    this._CameraHelper.update()
  }
}

export { SpaceCraftClass }