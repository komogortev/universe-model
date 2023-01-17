import { Group, ArrowHelper, AxesHelper, Quaternion } from "three"
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
  _keys: any

  constructor() {
    this._Init()
  }

  _Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      rigth: false,
      space: false,
      shift: false,
      rLeft: false,
      rRight: false
    }

    document.addEventListener('keydown', (e: KeyboardEvent) => this._onKeyDown(e), false)
    document.addEventListener('keyup', (e: KeyboardEvent) => this._onKeyUp(e), false)
  }

  _onKeyDown(e: KeyboardEvent) {
    switch (e.key.toLowerCase()) {
      case 'q':
        this._keys.rLeft = true
        break;
      case 'e':
        this._keys.rRight = true
        break;
      case 'w':
        this._keys.forward = true
        break;
      case 'a':
        this._keys.left = true
        break;
      case 's':
        this._keys.backward = true
        break;
      case 'd':
        this._keys.right = true
        break;
      case 'shift':
        this._keys.shift = true
        break;
      case 'space':
        this._keys.space = true
        break;
    }
  }
  _onKeyUp(e: KeyboardEvent) {
    switch (e.key.toLowerCase()) {
      case 'q':
        this._keys.rLeft = false
        break;
      case 'e':
        this._keys.rRight = false
        break;
      case 'w':
        this._keys.forward = false
        break;
      case 'a':
        this._keys.left = false
        break;
      case 's':
        this._keys.backward = false
        break;
      case 'd':
        this._keys.right = false
        break;
      case 'shift':
        this._keys.shift = false
        break;
      case 'space':
        this._keys.space = false
        break;
    }
  }
}

function _CalculateParentPosition(parentRadius: number, lat: number, lng: number) {
  const planetRadiusOffset = 0.02
  const cartRadius = parentRadius + planetRadiusOffset
  const cartPos = calcPosFromLatLngRad(lat, lng, cartRadius);
  return new Vector3(cartPos.x, cartPos.y, cartPos.z)
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

  constructor(gravitationalParent: any, camera: PerspectiveCamera) {
    this.characterRig = new Group();
    this._input = new _BasicGolemControllerInput();
    this._latitude = 0;
    this._longitude = 0;
    this._parent = gravitationalParent;
    this._updateRigPosition()
    this._lookAtDistance = 0.5
    // LookAt should be calculated relative to characterRig plane
    this._lookAt = new Vector3(
      0,
      0 + this._lookAtDistance,
      this._lookAtDistance
    )


    //this.buildDirectionArrow()
    this.buildAxesHelper()
    this.characterRig.add(new GridHelper(3,3))
    console.log(this._parent.mesh.position, this.characterRig.position)
    this.buildCenterLine()

    this.buildCharacterBody()
    this.buildCharacterCamera(camera)

  }

  get Rig() {
    return this.characterRig
  }

  buildCharacterBody(){
    const golemGeometry = new SphereGeometry(.125, 12, 12);
    const golemMaterial = new MeshBasicMaterial({
      map: new TextureLoader().load(map)
    });

    this.characterBody = new Mesh(golemGeometry, golemMaterial);
    this.characterRig.add(this.characterBody)
    this.characterBody.position.set(0,.08,0)
  }

  buildCharacterCamera(camera) {
    this.characterCamera = camera;
    this.characterBody.add(this.characterCamera)
    this.characterCamera.position.set(
      this.characterBody.position.x,
      this.characterBody.position.y + .35,
      this.characterBody.position.z - 0.25
    )
    this.characterCamera.lookAt(this.characterBody.position)
    this.characterCamera.up.set( 0, 0, 1 );
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
    this.characterRig.quaternion.setFromUnitVectors(axis, vector.clone().normalize())
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
    if (this._input._keys.forward) {
      const destinationX = this._lookAt.x / 10
      const destinationY = this._lookAt.y / 10

      this._latitude = this._latitude + destinationX
      this._longitude = this._longitude + destinationY
    }

    this._updateRigPosition()
    this._updateRigRotation()
  }
}

export { Character }