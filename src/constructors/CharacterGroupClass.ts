import { Group, ArrowHelper, AxesHelper, Quaternion, PerspectiveCamera,
  SphereGeometry,  MeshNormalMaterial,  MeshBasicMaterial,  Mesh,  Raycaster,
  Vector3,  TextureLoader, GridHelper, MathUtils, LineBasicMaterial, BufferGeometry, Line
} from 'three'
import { calcPosFromLatLngRad } from '../utils/helpers'
import map from '../assets/ironman.png'

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

function _CalculateParentPosition(parentRadius: number, lat: number, lng: number) {
  const planetRadiusOffset = 0.02
  const cartRadius = parentRadius + planetRadiusOffset
  const cartPos = calcPosFromLatLngRad(lat, lng, cartRadius);
  return new Vector3(cartPos.x, cartPos.y, cartPos.z)
}

function clamp(number: number, min: number, max: number) {
  //return Math.max(min, Math.min(number, max));
  return Math.min(Math.max(number, min), max);
}

class CharacterGroupClass {
  nameId: string;
  _threeGroup: Group;
  _children: Array<any>;
  characterBody: any;
  characterCamera: PerspectiveCamera;
  _controls: any;
  _latitude: number;
  _longitude: number;
  _gravParentClass: any;
  _lookAtDistance: number;
  _lookAt: Vector3;
  rotation_: any;
  _bodyTranslation: any;
  phi_: number;
  theta_: number;

  constructor(camera: PerspectiveCamera, gravitationalParentClass?: any) {
    this.nameId = 'CharacterClass'
    this._threeGroup = new Group();
    this._threeGroup.name = 'CharacterGroup';
    this._children = [];
    this.characterCamera = camera;
    this._latitude = 0;
    this._longitude = 0;
    this._lookAtDistance = -0.5
    // LookAt normally returns value in global plane scope
    this._lookAt = new Vector3(0, this._lookAtDistance, 0); // look straight north
    this._gravParentClass = gravitationalParentClass;
    this._controls = new _BasicGolemControllerInput(document.body);

    this._updateRigPosition()
    this.initCharacterBody()
    this.initCharacterCamera()


    //this.buildDirectionArrow()
    this.buildGridHelper(this._threeGroup)
    this.buildAxesHelper(this.characterBody)
    this.buildCenterLine(this.characterBody)
    //this.buildGridHelper(this.characterBody)

    this.rotation_ = new Quaternion();
    this._bodyTranslation = new Vector3();
    this.phi_ = 0;
    this.theta_ = 0;
  }

  // Set character threeGroup position on gravParent (sphere) surface
  // according to class position params (planetDistanceOffset, _latitude, _longitude)
  _updateRigPosition() {
    const newPosX = this._gravParentClass.threeGroup.children[0].scale.x + .25

    const position = _CalculateParentPosition(
      newPosX,
      this._latitude,
      this._longitude
    )

    this._threeGroup.position.copy(position)
  }

  initCharacterBody(){
    const golemGeometry = new SphereGeometry(.11125, 12, 12);
    const golemMaterial = new MeshBasicMaterial({
      map: new TextureLoader().load(map)
    });

    this.characterBody = new Mesh(golemGeometry, golemMaterial);
    this._threeGroup.add(this.characterBody)
    this.characterBody.position.set(0,.08,0)
  }

  initCharacterCamera() {
    this.characterBody.add(this.characterCamera)
    this.characterCamera.position.set(
      this.characterBody.position.x + 0.11125,
      this.characterBody.position.y + 0.11125,
      this.characterBody.position.z
    )

    this.characterCamera.lookAt(this._lookAt)
    this.characterCamera.updateProjectionMatrix();
  }

  /**
   * Turn _threeGroup to "STAND" on the sphere surface
   */
  _updateBodyVerticalRotation() {
    var axis = new Vector3(0, 1, 0);
    var vector = new Vector3(this._threeGroup.position.x, this._threeGroup.position.y, this._threeGroup.position.z)
    this.characterBody.quaternion.setFromUnitVectors(axis, vector.clone().normalize())
  }

  _updateCameraRotation() {
    this.characterCamera.quaternion.copy(this.rotation_)
    //this._threeGroup.lookAt(new Vector3(this.characterCamera.lookAt.z,this.characterCamera.lookAt.x,this.characterCamera.lookAt.y))
    // attempts to apply direction to the body movement
    //     const forward = new Vector3(0, this._lookAtDistance, 0);
    //     forward.applyQuaternion(this.rotation_);
    // console.log('forward',forward)
    //     this._lookAt = forward.clone();
  }

  _actualizeGroupOnSphere() {
    this._updateRigPosition()
    this._updateBodyVerticalRotation()
    this._updateCameraRotation()
  }

  _calculateMouseInputToRotation() {
    const xh = this._controls.current_.mouseXDelta / window.innerWidth;
    const yh = this._controls.current_.mouseYDelta / window.innerHeight;

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

    this.rotation_.copy(q);
  }

  _reactToInputs() {
    this._calculateMouseInputToRotation()

    if (this._controls.keys_.w) {
      //get mouse direction by accessing camera lookAt after the rotation?
      // this._lookAt.x
      // this._lookAt.y

      // calculate step distance: relative to sphere size vs static step size

      // get future position coordinates after "step" in the direction
      // do we lookAt 10 steps away?
      const destinationX = this._lookAt.x / 10
      const destinationY = this._lookAt.y / 10

      this._latitude = this._latitude + destinationX
      this._longitude = this._longitude + destinationY
    }

    if (this._controls.keys_.s) {
      //get mouse direction by accessing camera lookAt after the rotation?
      // this._lookAt.x
      // this._lookAt.y

      // calculate step distance: relative to sphere size vs static step size

      // get future position coordinates after "step" in the direction
      // do we lookAt 10 steps away?
      const destinationX = -(this._lookAt.x / 10)
      const destinationY = -(this._lookAt.y / 10)

      this._latitude = this._latitude + destinationX
      this._longitude = this._longitude + destinationY
    }

    if (this._controls.keys_.a) {
      // get future position coordinates after "step" in the direction
      // do we lookAt 10 steps away?
      const destinationX = -((this._lookAt.x - .5) / 10)
      const destinationY = -((this._lookAt.y - .5) / 10)

      this._latitude = this._latitude + destinationX
      this._longitude = this._longitude + destinationY
    }

    if (this._controls.keys_.d) {
      // get future position coordinates after "step" in the direction
      // do we lookAt 10 steps away?
      const destinationX = -((this._lookAt.x + .5) / 10)
      const destinationY = -((this._lookAt.y + .5) / 10)

      this._latitude = this._latitude + destinationX
      this._longitude = this._longitude + destinationY
    }
  }

  buildDirectionArrow() {
    var targetVector = new Vector3(); // create once an reuse it
    this._threeGroup.getWorldPosition( targetVector );

    // const x = new Vector3(1, 0, 0);
    // const y = new Vector3(0, 1, 0);
    // const z = new Vector3(0, 0, 1);
    // //normalize the direction vector (convert to vector of length 1)
    // x.normalize();
    // y.normalize();
    // z.normalize();

    const origin = new Vector3();
    this._gravParentClass.mesh.getWorldPosition( origin );

    const length = 1;
    const hexX = 0xffff00; // yellow
    const hexY = 0xff0000; // red
    const hexZ = 0x00ff00; // green

    const arrowHelperX = new ArrowHelper( targetVector, origin,  length, hexX );
    // const arrowHelperY = new ArrowHelper( y, origin, length, hexY );
    // const arrowHelperZ = new ArrowHelper( z, origin, length, hexZ );
    this._threeGroup.add( arrowHelperX );
    console.log(arrowHelperX)
  }

  buildAxesHelper(target: any) {
    const axesHelper = new AxesHelper( 5 );
    target.add( axesHelper );
  }

  buildGridHelper(target: any) {
    target.add(new GridHelper(3,3))
  }

  buildCenterLine(target: any) {
    // var targetVector = new Vector3(); // create once an reuse it
    // this.characterBody.getWorldPosition( targetVector );
    // const points = [];
    // points.push(new Vector3(
    //   this._gravParentClass.position.x,
    //   this._gravParentClass.position.y,
    //   this._gravParentClass.position.z
    // ))
    // points.push( new Vector3(-this._threeGroup.position.x,-this._threeGroup.position.y,-this._threeGroup.position.z));
    // const geometry = new BufferGeometry().setFromPoints( points );
    // const material = new LineBasicMaterial({
    //   color: 0xff0000, linewidth: 2
    // });
    // const line = new Line( geometry, material );
    // target.add( line );
  }

  get threeGroup() {
    return this._threeGroup;
  }

  get children() {
    return this._children;
  }

  get camera() {
    return this.characterCamera
  }

  tick(delta: number) {
    this._reactToInputs()
    this._actualizeGroupOnSphere()
    this._controls.tick(delta)
  }
}

export { CharacterGroupClass }