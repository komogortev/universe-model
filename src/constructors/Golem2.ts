import {
  SphereGeometry,
  MeshNormalMaterial,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector3,
  TextureLoader,
  CylinderGeometry, Group, GridHelper
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

class Golem extends Group {
  radius: number;
  widthSegments: number;
  heightSegments: number;
  golemGeometry: any;
  golemMaterial: any;
  golemMesh: any;
  _input: any;
  _latitude: number;
  _longitude: number;
  gravitationalParent: any;
  _lookAt: Vector3;
  _lookAtDistance: number;
  characterCamera: any;

  constructor(gravitationalParent: any) {
    super()
    this.radius = 0.05
    this.widthSegments = 8
    this.heightSegments = 8

    this.golemGeometry = new SphereGeometry(
      this.radius, this.widthSegments, this.heightSegments
    );

    this.golemMaterial = new MeshBasicMaterial({
      // wireframe: true,
      map: new TextureLoader().load(map)
    });

    this.golemMesh = new Mesh(this.golemGeometry, this.golemMaterial);
    this.golemMesh.name = 'Golem Mesh'
    this.golemMesh.position.set(0,0,0)
    this.golemMesh.add(new GridHelper(3,3))

    this._input = new _BasicGolemControllerInput();

    // // spherical GPS coordinates Mtl
    // const mtl = { lat: 45.508888, lng: -73.561668 }
    // // default position
    // this._latitude = 0
    // this._longitude = 0
    // this._lookAtDistance = 0.5
    // this._lookAt = new Vector3(this._longitude, this._latitude + this._lookAtDistance, this._lookAtDistance)
    // this.gravitationalParent = gravitationalParent

    // const position = this._CalculateSpherePosition(this._latitude, this._longitude)
    // this.golemMesh.position.copy(this.gravitationalParent.position)
  }

  get mesh() {
    return this.golemMesh
  }

  _CalculateSpherePosition(lat: number, lng: number) {
    const planetRadiusOffset = 0.02
    const cartRadius = (this.gravitationalParent.radius) + planetRadiusOffset
    const cartPos = calcPosFromLatLngRad(lat, lng, cartRadius);
    return new Vector3(cartPos.x, cartPos.y, cartPos.z)
  }

  tick(delta: number) {
    // const position = this._CalculateSpherePosition(this._latitude, this._longitude)
    // this.golemMesh.position.copy(position)
  }
}
class GolemGroup {
  golemGroupGeometry: any;
  golemGroupMaterial: any;
  golemGroupMesh: any;
  gravitationalParent: any;
  golemBox: any;
  golem: any;
  characterCamera: any;
  _latitude: number;
  _longitude: number;
  _lookAt: Vector3;
  _lookAtDistance: number;
  _input: any;

  constructor(gravitationalParent: any, camera: any) {
    const radius = 0.05
    const widthSegments = 8
    const heightSegments = 8

    this.golemBox = new Group();
    this.golemGroupGeometry = new CylinderGeometry( .125, .25, .5, 4 );
    this.golemGroupMaterial = new MeshBasicMaterial( { wireframe: true } );
    this.golemGroupMesh = new Mesh( this.golemGroupGeometry, this.golemGroupMaterial );

    this.golem = new Golem(this.golemGroupMesh);
    this.characterCamera = camera

    this.golemBox.position.set(0,0,0)
    this.golemBox.add(this.golemGroupMesh)
    this.golemBox.add(new GridHelper(2,4))

    this.golemGroupMesh.add(this.golem, this.characterCamera)

    this.characterCamera.position.set(0,0,0)
    this.golemGroupMesh.position.set(0,0,0)
    this.golem.mesh.position.set(0,0,0)
    this.gravitationalParent = gravitationalParent

    // spherical GPS coordinates Mtl
    const mtl = { lat: 45.508888, lng: -73.561668 }
    // default position
    this._latitude = 0
    this._longitude = 0
    this._lookAtDistance = 1
    this._lookAt = new Vector3(this._longitude, this._latitude + this._lookAtDistance, this._lookAtDistance)

    const position = this._CalculateSpherePosition(this._latitude, this._longitude)
    this.golemBox.position.copy(position)
    this.golemBox.lookAt(this._lookAt)
    this.characterCamera.lookAt(this._lookAt)

    this._input = new _BasicGolemControllerInput();

  }

  get mesh() {
    return this.golemBox
  }

  _CalculateSpherePosition(lat: number, lng: number) {
    const planetRadiusOffset = 0.02
    const cartRadius = (this.gravitationalParent.radius) + planetRadiusOffset
    const cartPos = calcPosFromLatLngRad(lat, lng, cartRadius);
    return new Vector3(cartPos.x, cartPos.y, cartPos.z)
  }

  tick(delta: number) {
    if (this._input._keys.rLeft) {
      this._lookAt = new Vector3(this._longitude + this._lookAtDistance, this._latitude + this._lookAtDistance, this._lookAtDistance)
      this.golemGroupMesh.lookAt = this._lookAt
    }

    if (this._input._keys.rRight) {
      this._lookAt = new Vector3(this._longitude + this._lookAtDistance, this._latitude + this._lookAtDistance, this._lookAtDistance)
      this.golemGroupMesh.lookAt = this._lookAt
    }

    //left = -180
    //right = 180
    //top = 85.051129
    //bottom = -85.051129

    if (this._input._keys.forward) {
      const destinationX = this._lookAt.x / 20
      const destinationY = this._lookAt.y / 20

      this._latitude = this._latitude + destinationX
      this._longitude = this._longitude + destinationY
    }

    const position = this._CalculateSpherePosition(this._latitude, this._longitude)
    this.golemGroupMesh.position.copy(position)
    //this.golemGroupMesh.setRotationFromQuaternion(10)
  }
}

export { Golem, GolemGroup, _BasicGolemControllerInput }