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

class Golem {
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

    this._input = new _BasicGolemControllerInput();

    // spherical GPS coordinates Mtl
    const mtl = { lat: 45.508888, lng: -73.561668 }
    // default position
    this._latitude = 0
    this._longitude = 0
    this._lookAtDistance = 0.5
    this._lookAt = new Vector3(this._longitude, this._latitude + this._lookAtDistance, this._lookAtDistance)

    this.gravitationalParent = gravitationalParent
    this.golemMesh.add(new GridHelper(3,3))

    const position = this._CalculateSpherePosition(this._latitude, this._longitude)
    this.golemMesh.position.copy(position)

    // build vector between parent and local centers
    var targetVector = new Vector3(); // create once an reuse it
    this.golemMesh.getWorldPosition( targetVector );


    const points = [];
    points.push(new Vector3(this.gravitationalParent.mesh.position.x,this.gravitationalParent.mesh.position.y,this.gravitationalParent.mesh.position.z))
    points.push( targetVector );
    const geometry = new BufferGeometry().setFromPoints( points );
    const material = new LineBasicMaterial({
      color: 0x0000ff, linewidth: 2
    });
    const line = new Line( geometry, material );
    this.golemMesh.add( line );

    // adjust local rotation to directional vector
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
    if (this._input._keys.rLeft) {
      this._lookAt = new Vector3(this._longitude + this._lookAtDistance, this._latitude + this._lookAtDistance, this._lookAtDistance)
      this.golemMesh.lookAt = this._lookAt
    }

    if (this._input._keys.rRight) {
      this._lookAt = new Vector3(this._longitude + this._lookAtDistance, this._latitude + this._lookAtDistance, this._lookAtDistance)
      this.golemMesh.lookAt = this._lookAt
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
    // if (this._input._keys.backward) {
    //   this._latitude = this._latitude - 0.1
    // }
    // if (this._input._keys.left) {
    //   this._longitude = this._longitude + 0.1
    // }
    // if (this._input._keys.right) {
    //   this._longitude = this._longitude - 0.1
    // }

    const position = this._CalculateSpherePosition(this._latitude, this._longitude)
    this.golemMesh.position.copy(position)

    // Rotate golem to stand on the planetoid
    const rads = MathUtils.degToRad(-90); // 1.57079... = π/2
    this.golemMesh.rotation.set(0,0, rads);

  }
}

export { Golem, _BasicGolemControllerInput }