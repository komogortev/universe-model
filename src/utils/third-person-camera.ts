import { Vector3 } from 'three';
import {entity} from '../constructors/Entity';


export const third_person_camera = (() => {

  class ThirdPersonCamera extends entity.Component {
    _params: any;
    _camera: any;
    _currentPosition: Vector3;
    _currentLookat: Vector3;

    constructor(params: any) {
      super();

      this._params = params;
      this._camera = params.camera;

      this._currentPosition = new Vector3();
      this._currentLookat = new Vector3();
    }

    _CalculateIdealOffset() {
      const idealOffset = new Vector3(-0, 10, -15);
      idealOffset.applyQuaternion(this._params.target._rotation);
      idealOffset.add(this._params.target._position);
      return idealOffset;
    }

    _CalculateIdealLookat() {
      const idealLookat = new Vector3(0, 5, 20);
      idealLookat.applyQuaternion(this._params.target._rotation);
      idealLookat.add(this._params.target._position);
      return idealLookat;
    }

    tick(delta: number) {
      const idealOffset = this._CalculateIdealOffset();
      const idealLookat = this._CalculateIdealLookat();

      // const t = 0.05;
      // const t = 4.0 * timeElapsed;
      const t = 1.0 - Math.pow(0.01, delta);

      this._currentPosition.lerp(idealOffset, t);
      this._currentLookat.lerp(idealLookat, t);

      this._camera.position.copy(this._currentPosition);
      this._camera.lookAt(this._currentLookat);
    }
  }

  return {
    ThirdPersonCamera: ThirdPersonCamera
  };

})();