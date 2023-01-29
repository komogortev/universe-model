import { Vector3 } from 'three';
import {
  Group,
  MeshPhongMaterial,
  DoubleSide,
  Mesh,
  Color,
  CircleGeometry,
  LatheGeometry,
  Vector2,
  AxesHelper,
  GridHelper,
  Sphere,
  Ray,
  Raycaster
} from 'three'

class WarpGateClass {
  _nameId: string;
  _threeGroup: Group;
  _updatables: Array<any>;
  _mesh: any;
  _boundingSphere: any|null;

  constructor(name: string = 'Warp Gate') {
    this._nameId = name;
    this._threeGroup = new Group();
    this._threeGroup.name = 'Warp Gate Root Group';
    this._updatables = [];
    this._boundingSphere = null;
    this.initialize()

    //this._threeGroup.position.set(parentScale.x * 1.1, 0, 0);
  }

  initialize() {
    this._mesh = this._createBodyModel();
    this._mesh.name = 'Body Model Mesh Group';
    this._threeGroup.add(this._mesh)
  }


  _createBodyModel() {
    const body_: Group = new Group();

    {
      // axes Helper
      const axesHelper = new AxesHelper( 15 );
      body_.add( axesHelper );
      // Grid Helper
      body_.add(new GridHelper(16, 16, "#666666", "#222222"));
    }


    const silver_ = new Color(0xE0DFDC);
    const silver2_ = new Color(0xCFCFCE);
    // CircleGeometry 'Gate Mirror'
    {
      const radius = 2;  // ui: radius
      const segments = 12;  // ui: segments
      const CircleGeometryMesh = this._createSolidGeometry(new CircleGeometry(radius, segments));
      this._addObject(body_, 0, 0, 0, CircleGeometryMesh);

      // {
      //   const raycaster_ = new Raycaster();
      //   const search: Array<Vector3> = []; // directions of all raycaster rays
      //   const lag = 0.02; // warpGate speed lag

      //   for (let i = 0; i < 360; i+=3) { // raycaster is every 3 degrees
      //     search[i] = new Vector3(Math.cos(i), 0, Math.sin(i));
      //   }

      //   function checkForTarget() {
      //     search.forEach((direction: Vector3) => {
      //       // ray starts here, direction, near, far
      //       raycaster_.set(CircleGeometryMesh.position, direction, 0, 5);
      //       // WARPGATES ONLY DETECTS FIRST OBJECT HIT BY RAYCASTER - PLAYER CAN HIDE BEHIND OBJECT
      //         // check if ray intersects any object in scene
      //         const intersects = raycaster_.intersectObject(scene.children, false);
      //         if (intersects[0].object.name) {
      //           console.log(intersects[0]);
      //         }
      //     })
      //   }

      // }
    }
    // LatheGeometry 'Frame'
    {
      const points = [];
      for (let i = 0; i < 8; ++i) {
        points.push(new Vector2(Math.sin(i * 0.2) * 2 + 1, (i - 3) * .4));
      }
      const LatheGeometryMesh = this._createSolidGeometry(new LatheGeometry(points), silver_);
      LatheGeometryMesh.rotation.x = Math.PI / 2;
      this._addObject(body_, 0,0, -1, LatheGeometryMesh);
    }

    return body_;
  }

  _createMaterial(color?: Color) {
    const material = new MeshPhongMaterial({
      side: DoubleSide,
    });

    if (color != null) {
      material.color = color;
    } else {
      const hue = Math.random();
      const saturation = 1;
      const luminance = .5;
      material.color.setHSL(hue, saturation, luminance);
    }

    return material;
  }

  _createSolidGeometry(geometry: any, color?: any) {
    geometry.name = this._nameId;
    return new Mesh(geometry, this._createMaterial(color));
  }

  _addObject(parent: Group, x: number, y: number, z: number, obj: any) {
    obj.position.x = x;
    obj.position.y = y;
    obj.position.z = z;
    parent.add(obj);
  }



  get threeGroup() {
    return this._threeGroup;
  }

  get updatables() {
    return this._updatables;
  }

  get mesh() {
    return this._mesh;
  }

  tick(delta: number) {
    this._mesh.rotation.z += 0.0001

  }
}
export { WarpGateClass }