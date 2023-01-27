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
  GridHelper
} from 'three'

class WarpGateClass {
  _nameId: string;
  _threeGroup: Group;
  _updatables: Array<any>;
  _mesh: any;

  constructor(name: string = 'Warp Gate') {
    this._nameId = name;
    this._threeGroup = new Group();
    this._threeGroup.name = 'Warp Gate Root Group';
    this._updatables = [];

    this.initialize()

    //this._threeGroup.position.set(parentScale.x * 1.1, 0, 0);
  }

  initialize() {
    this._mesh = this.createBodyModel();
    this._mesh.name = 'Body Model Mesh Group';
    this._threeGroup.add(this._mesh)
  }

  createBodyModel() {
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
      const mesh = this._createSolidGeometry(new CircleGeometry(radius, segments));
      this._addObject(body_, 0, 0, 0, mesh);
    }
    // LatheGeometry 'Frame'
    {
      const points = [];
      for (let i = 0; i < 8; ++i) {
        points.push(new Vector2(Math.sin(i * 0.2) * 2 + 1, (i - 3) * .4));
      }
      const mesh = this._createSolidGeometry(new LatheGeometry(points), silver_);
      mesh.rotation.x = Math.PI / 2;
      this._addObject(body_, 0,0, -1, mesh);
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