import { PerspectiveCamera, Vector2, Vector3 } from "three";

function createPerspectiveCamera(
  fov: number = 75,
  aspect: number = window.innerWidth / window.innerHeight,
  near: number = 0.05,
  far: number = 1000,
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

export { createPerspectiveCamera, ThirdPersonCamera };