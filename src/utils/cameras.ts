import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Vector2, Vector3 } from "three";

function createPerspectiveCamera(
  fov: number = 75,
  aspect: number = window.innerWidth / window.innerHeight,
  near: number = 0.05,
  far: number = 10000,
  name: string = "Perspective Camera",
  options?: any
) {
  const camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.name = name
  camera.lookAt(0, 0, 0);

  if (options != null && options.position != null) {
    camera.position.set(options.position.x, options.position.y, options.position.z); // move the camera back
  }

  return camera;
}

class ThirdPersonCamera {
  _params
  _camera
  _currentPosition
  _currentLookat

  constructor(params: any) {
    this._params = params;
    this._camera = params.camera;

    this._currentPosition = new Vector3();
    this._currentLookat = new Vector3();
  }

  _CalculateIdealOffset() {
    const idealOffset = new Vector3(-15, 20, -30);
    idealOffset.applyQuaternion(this._params.target.Rotation);
    idealOffset.add(this._params.target.Position);
    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new Vector3(0, 10, 50);
    idealLookat.applyQuaternion(this._params.target.Rotation);
    idealLookat.add(this._params.target.Position);
    return idealLookat;
  }

  tick(delta: number) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.001, delta);

    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);

    this._camera.position.copy(this._currentPosition);
    this._camera.lookAt(this._currentLookat);
  }
}


export { createPerspectiveCamera, ThirdPersonCamera };