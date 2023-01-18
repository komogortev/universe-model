import { Group, ArrowHelper, AxesHelper, Quaternion, PerspectiveCamera } from "three"
import {
  SphereGeometry,
  MeshNormalMaterial,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector3,
  TextureLoader, GridHelper, MathUtils, LineBasicMaterial, BufferGeometry, Line
} from 'three'
import { calcPosFromLatLngRad } from '../utils/helpers'
import map from '../assets/ironman.png'

class _BasicGolemControllerInput {
  current_: any;
  previous_: any;
  keys_: any
  previousKeys_: any;

  constructor() {
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

    document.addEventListener('mousedown', (e: MouseEvent) => this.onMouseDown_(e), false)
    document.addEventListener('mouseup', (e: MouseEvent) => this.onMouseUp_(e), false)
    document.addEventListener('mousemove', (e: MouseEvent) => this.onMouseMove_(e), false)
    document.addEventListener('keydown', (e: KeyboardEvent) => this.onKeyDown_(e), false)
    document.addEventListener('keyup', (e: KeyboardEvent) => this.onKeyUp_(e), false)
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
    console.log('key dwn', e.key)
    this.keys_[e.key] = true;
  }
  onKeyUp_(e: KeyboardEvent) {
    this.keys_[e.key] = false;
  }

  tick(delta: number) {
    // push current keyboard/mouse snapshot into previous
    this.previous_ = {...this.current_}
  }
}

function _CalculateParentPosition(parentRadius: number, lat: number, lng: number) {
  const planetRadiusOffset = 0.02
  const cartRadius = parentRadius + planetRadiusOffset
  const cartPos = calcPosFromLatLngRad(lat, lng, cartRadius);
  return new Vector3(cartPos.x, cartPos.y, cartPos.z)
}

function clamp(number, min, max) {
  //return Math.max(min, Math.min(number, max));
  return Math.min(Math.max(number, min), max);
}

class Character {
  characterRig: Group;
  characterBody: any;
  characterCamera: PerspectiveCamera;
  _input: any;
  _latitude: number;
  _longitude: number;
  _parent: any;
  _lookAtDistance: number;
  _lookAt: Vector3;
  _bodyRotation: any;
  _bodyTranslation: any;
  phi_: number;
  theta_: number;

  constructor(gravitationalParent: any, camera: PerspectiveCamera) {
    this.characterRig = new Group();
    this.characterCamera = camera;
    this._input = new _BasicGolemControllerInput();
    this._latitude = 0;
    this._longitude = 0;
    this._lookAtDistance = -0.5
    // LookAt should be calculated relative to characterRig plane
    this._lookAt = new Vector3(0, this._lookAtDistance, 0);
    this._parent = gravitationalParent;
    this._updateRigPosition()
    this.initCharacterBody()
    this.initCharacterCamera(camera)

    //this.buildDirectionArrow()
    this.buildAxesHelper()
    this.characterRig.add(new GridHelper(3,3))
    console.log(this._parent.mesh.position, this.characterRig.position)
    this.buildCenterLine()

    this._bodyRotation = new Quaternion();
    this._bodyTranslation = new Vector3();
    this.phi_ = 0;
    this.theta_ = 0;
  }

  get Rig() {
    return this.characterRig
  }

  initCharacterBody(){
    const golemGeometry = new SphereGeometry(.125, 12, 12);
    const golemMaterial = new MeshBasicMaterial({
      map: new TextureLoader().load(map)
    });

    this.characterBody = new Mesh(golemGeometry, golemMaterial);
    this.characterRig.add(this.characterBody)
    this.characterBody.position.set(0,.08,0)
  }

  initCharacterCamera(camera: PerspectiveCamera) {
    this.characterBody.add(this.characterCamera)
    this.characterCamera.position.set(
      this.characterBody.position.x + 0.05,
      this.characterBody.position.y + .15,
      this.characterBody.position.z
    )
    this.characterCamera.lookAt(this._lookAt)
    this.characterCamera.updateProjectionMatrix();
  }

  _updateRigPosition() {
    const position = _CalculateParentPosition(
      this._parent.radius,
      this._latitude,
      this._longitude
    )

    this.characterRig.position.copy(position)
  }

  _updateRigRotation() {
    var axis = new Vector3(0, 1, 0);
    var vector = new Vector3(this.characterRig.position.x, this.characterRig.position.y, this.characterRig.position.z)
    this.characterBody.quaternion.setFromUnitVectors(axis, vector.clone().normalize())
  }

  _updateBodyRotation(delta: number) {
    const xh = this._input.current_.mouseXDelta / window.innerWidth;
    const yh = this._input.current_.mouseYDelta / window.innerHeight;

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
    this._bodyRotation.copy(q);
  }

  _updateCameraRotation(delta: number) {
    this.characterCamera.quaternion.copy(this._bodyRotation)
  }

  buildDirectionArrow() {
    var targetVector = new Vector3(); // create once an reuse it
    this.characterRig.getWorldPosition( targetVector );

    // const x = new Vector3(1, 0, 0);
    // const y = new Vector3(0, 1, 0);
    // const z = new Vector3(0, 0, 1);
    // //normalize the direction vector (convert to vector of length 1)
    // x.normalize();
    // y.normalize();
    // z.normalize();

    const origin = new Vector3();
    this._parent.mesh.getWorldPosition( origin );

    const length = 1;
    const hexX = 0xffff00; // yellow
    const hexY = 0xff0000; // red
    const hexZ = 0x00ff00; // green

    const arrowHelperX = new ArrowHelper( targetVector, origin,  length, hexX );
    // const arrowHelperY = new ArrowHelper( y, origin, length, hexY );
    // const arrowHelperZ = new ArrowHelper( z, origin, length, hexZ );
    this.characterRig.add( arrowHelperX );
    console.log(arrowHelperX)
  }

  buildAxesHelper() {
    const axesHelper = new AxesHelper( 5 );
    this.characterRig.add( axesHelper );
  }

  buildCenterLine() {
    var targetVector = new Vector3(); // create once an reuse it
    this.characterRig.getWorldPosition( targetVector );
    const points = [];
    points.push(new Vector3(
      this._parent.mesh.position.x,
      this._parent.mesh.position.y,
      this._parent.mesh.position.z
    ))
    points.push( new Vector3(-this.characterRig.position.x,-this.characterRig.position.y,-this.characterRig.position.z));
    const geometry = new BufferGeometry().setFromPoints( points );
    const material = new LineBasicMaterial({
      color: 0xff0000, linewidth: 2
    });
    const line = new Line( geometry, material );
    this.characterRig.add( line );
  }

  tick(delta: number) {
    if (this._input.keys_.w) {
      //get mouse direction
      // calculate step distance
      // get new coordinates after step
      // this._latitude = this._latitude + 0
      // this._longitude = this._longitude + 0

      const destinationX = this._lookAt.x / 10
      const destinationY = this._lookAt.y / 10

      this._latitude = this._latitude + destinationX
      this._longitude = this._longitude + destinationY
    }

    this._updateRigPosition()
    this._updateRigRotation()
    this._updateBodyRotation(delta)
    this._updateCameraRotation(delta)
    this._input.tick(delta)
  }
}

export { Character }