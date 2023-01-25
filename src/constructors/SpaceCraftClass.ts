import { Group, ArrowHelper, AxesHelper, Quaternion, PerspectiveCamera,
  SphereGeometry,  MeshNormalMaterial,  MeshBasicMaterial,  Mesh,  Raycaster,
  Vector3,  TextureLoader, GridHelper, MathUtils, LineBasicMaterial, BufferGeometry, Line, CameraHelper
} from 'three'


class _BasicGolemControllerInput {
  current_: any;
  previous_: any;
  keys_: any
  previousKeys_: any;

  constructor(target: any) {
    this.target_ = target || document;
    this.initialize_()
  }

  initialize_() {
    this.current_ = {
      leftButton: false,
      rightButton: false,
      mouseX: 0,
      mouseY: 0
    }
    this.previous_ = null;
    this.keys_ = {};
    this.previousKeys_ = {};

    this.target_.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
    this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
    this.target_.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
    this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
    this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
  }

  onMouseDown_(e: MouseEvent) {
    switch(e.button) {
      case 0: {
        this.current_.leftButton = true;
        console.log('left mouse dwn')
        break;
      }
      case 2: {
        this.current_.rightButton = true;
        console.log('right mouse dwn')
        break;
      }
    }
  }
  onMouseUp_(e: MouseEvent) {
    switch(e.button) {
      case 0: {
        this.current_.leftButton = false;
        break;
      }
      case 2: {
        this.current_.rightButton = false;
        break;
      }
    }
  }
  onMouseMove_(e: MouseEvent) {
    // we reduce screen size to figure mouse going up/down or left/right from the center
    this.current_.mouseX = e.pageX - window.innerWidth / 2;
    this.current_.mouseY = e.pageY - window.innerHeight / 2;

    if (this.previous_ === null) {
      this.previous_ = {...this.current_};
    }

    // Compute mouse move delta substracting current pos from previous
    this.current_.mouseXDelta = this.current_.mouseX - (this.previous_.mouseX != null ? this.previous_.mouseX : 0);
    this.current_.mouseYDelta = this.current_.mouseY - (this.previous_.mouseY != null ? this.previous_.mouseY : 0);
  }
  onKeyDown_(e: KeyboardEvent) {
    this.keys_[e.key] = true;
  }
  onKeyUp_(e: KeyboardEvent) {
    this.keys_[e.key] = false;
  }

  key(keyCode) {
    return !!this.keys_[keyCode];
  }

  isReady() {
    return this.previous_ !== null;
  }

  tick(delta: number) {
    // push current keyboard/mouse snapshot into previous
    if (this.previous_ !== null) {
      this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
      this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

      this.previous_ = {...this.current_}
    }
  }
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


  constructor(camera: PerspectiveCamera, gravitationalParent?: any|null) {
    this.nameId = 'SpaceCraftClass'
    this._threeGroup = new Group();
    this._threeGroup.name = 'CharacterGroup';
    this._updatables = [];

    this._Camera = camera;
    this._CameraHelper = new CameraHelper(this._Camera);
    this._Controls = new _BasicGolemControllerInput(document.body);
    this._GravParent = gravitationalParent != null ? gravitationalParent: null;


    this._initCharacterBody()
    this._initCharacterCamera()
  }


  _initCharacterBody(){
    const golemGeometry = new SphereGeometry(.5, 12, 12);
    const golemMaterial = new MeshBasicMaterial({
      wireframe: true
    });

    this._CharacterBody = new Mesh(golemGeometry, golemMaterial);
    this._CharacterBody.position.set(0, 5, -5)
    this._threeGroup.add(this._CharacterBody)
  }

  _initCharacterCamera() {
    this._Camera.position.copy(this._CharacterBody.position);

    this._CharacterBody.add(this._Camera);
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

  }
}

export { SpaceCraftClass }