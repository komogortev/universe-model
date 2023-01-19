import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Vector2, Vector3 } from "three";

function createPerspectiveCamera(
  fov: number = 75,
  aspect: number = window.innerWidth / window.innerHeight,
  near: number = 0.05,
  far: number = 10000,
  name: string = "Perspective Camera"
) {

  const camera = new PerspectiveCamera(fov, aspect, near, far);
  var cameraLayer = 1;

  camera.name = name

  return camera;
}

class ThirdPersonCamera {
  _params: any;
  _camera: any;
  _currentPosition: Vector3;
  _currentLookAt: Vector3;

  constructor(params: any) {
    this._params = params;
    this._camera = params.camera;

    this._currentPosition = new Vector3;
    this._currentLookAt = new Vector3;
  }

  _CalculateIdealOffset () {
    const idealOffset = new Vector3(-1, 1, -1)
    idealOffset.applyQuaternion(this._params.target.Rotation)
    idealOffset.add(this._params.target.Position)
    return idealOffset
  }

  _CalculateIdealLookAt () {
    const idealLookAt = new Vector3(0, 1, 2)
    idealLookAt.applyQuaternion(this._params.target.Rotation)
    idealLookAt.add(this._params.target.Position)
    return idealLookAt
  }
  tick(delta: number) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookAt = this._CalculateIdealLookAt();

    this._currentPosition.copy(idealOffset)
    this._currentLookAt.copy(idealLookAt)
    this._camera.position.copy(this._currentPosition)
    this._camera.lookAt(this._currentLookAt)
  }
}

class ConstructCameraRig {
  _name: string;
  _rig: Group;
  _parent: any | null;
  _camera: any;

  constructor(camera: any, parent?: any | null) {
    this._name = 'Camera Rig';
    this._rig = new Group();
    this._parent = parent;
    this._camera = camera

    this._rig.add(this._camera);
    this.updateCamera()

    var geometry = new CylinderGeometry( 5, 5, 20, 32 );
    var material = new MeshBasicMaterial( { wireframe: true } );
    var cylinder = new Mesh( geometry, material );
    this.rig.add(cylinder)
  }

  updateCamera() {
    if (this._parent != null) {
      this._camera.position.set(0,0,0)
      this._camera.lookAt(-1, 0.5, 1);
    }
  }

  get name() {
    return this._name;
  }

  get rig() {
    return this._rig;
  }

  get camera() {
    return this._camera;
  }

  set parent(mesh: any) {
    this._parent = mesh;
  }

  tick(delta: number) {
    // rotate the rig to face the floor
    this.rig.lookAt(this._parent.position.x, this._parent.position.y, this._parent.position.z)
    if (this._parent != null) {
      this.updateCamera()
      this.rig.position.copy(this._parent.position)
    }
    // find direction of attraction (to floor)

    // ensure rig is on the floor
    // const cameraOffset = 0.01
    // this.rig.position.copy(parent.position)
    //  .add(new Vector3(0, 0, this._floor.scale.z + cameraOffset));
  }
}

export { createPerspectiveCamera, ThirdPersonCamera, ConstructCameraRig };