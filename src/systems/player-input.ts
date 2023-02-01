import { Box3, PerspectiveCamera, Ray, Raycaster } from "three";
import {entity} from "../constructors/Entity";

export const player_input = (() => {
  class PickableComponent extends entity.Component {
    constructor() {
      super();
    }

    InitComponent() {
    }
  };

  class BasicCharacterControllerInput extends entity.Component {
    //_parent: any;
    _keys: {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
      space: boolean;
      shift: boolean;
    }
    _params: {
      camera: PerspectiveCamera,
      enabled: boolean,
    }
    _raycaster: Raycaster;

    constructor(params: any) {
      super();
      this._params = params;
      this._keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        space: false,
        shift: false,
      };
      this._raycaster = new Raycaster();
      this._Init();
    }

    _Init() {
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
      document.addEventListener('mouseup', (e) => this._onMouseUp(e), false);
    }

    // attempt to spot any active entities
    _onMouseUp(event: MouseEvent) {
      if (this._params.enabled) {
        const rect = document.getElementById('scene-container').getBoundingClientRect();
        const pos = {
          x: ((event.clientX - rect.left) / rect.width) * 2  - 1,
          y: ((event.clientY - rect.top ) / rect.height) * -2 + 1,
        };

        this._raycaster.setFromCamera(pos, this._params.camera);

        // this. is a child of player entity, we go up one layer to the EntityManager
        // to get access to all the active entities (updatables) in the Scene_
        const pickables = this._parent._parent.Filter((e: any) => {
          const p = e.GetComponent('PickableComponent');
          if (!p) {
            return false;
          }
          return e._mesh;
        });

        const ray = new Ray();
        ray.origin.setFromMatrixPosition(this._params.camera.matrixWorld);
        ray.direction.set(pos.x, pos.y, 0.5).unproject(
            this._params.camera).sub(ray.origin).normalize();

        // hack - hide quest UI
        // document.getElementById('quest-ui').style.visibility = 'hidden';

        for (let p of pickables) {
          // GOOD ENOUGH
          const box = new Box3().setFromObject(p._mesh);

          // notify`em gents and ladies - we got`em
          if (ray.intersectsBox(box)) {
            p.Broadcast({
                topic: 'input.picked'
            });
            break;
          }
        }
      }
    }

    _onKeyDown(event: KeyboardEvent) {
      switch (event.keyCode) {
        case 87: // w
          this._keys.forward = true;
          break;
        case 65: // a
          this._keys.left = true;
          break;
        case 83: // s
          this._keys.backward = true;
          break;
        case 68: // d
          this._keys.right = true;
          break;
        case 32: // SPACE
          this._keys.space = true;
          break;
        case 16: // SHIFT
          this._keys.shift = true;
          break;
      }
    }

    _onKeyUp(event: KeyboardEvent) {
      switch(event.keyCode) {
        case 87: // w
          this._keys.forward = false;
          break;
        case 65: // a
          this._keys.left = false;
          break;
        case 83: // s
          this._keys.backward = false;
          break;
        case 68: // d
          this._keys.right = false;
          break;
        case 32: // SPACE
          this._keys.space = false;
          break;
        case 16: // SHIFT
          this._keys.shift = false;
          break;
      }
    }
  };

  return {
    BasicCharacterControllerInput: BasicCharacterControllerInput,
    PickableComponent: PickableComponent,
  };

})();