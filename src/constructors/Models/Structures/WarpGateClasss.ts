import {
  Group,
  MeshPhongMaterial,
  DoubleSide,
  Mesh,
  Color,
  CircleGeometry,
  LatheGeometry,
  Vector2
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
    this._updatables.push(this)
    this.initialize()
  }

  initialize() {
    this._mesh = this.createBodyModel();
    this._mesh.name = 'Body Model Mesh Group';
    this._threeGroup.add(this._mesh)
  }

  createBodyModel() {
    const body_: Group = new Group();
    const silver_ = new Color(0xE0DFDC);
    const silver2_ = new Color(0xCFCFCE);
    // CircleGeometry 'Gate Mirror'
    {
      const radius = 2;  // ui: radius
      const segments = 12;  // ui: segments
      const mesh = this._createSolidGeometry(new CircleGeometry(radius, segments));
      this._addObject(body_, mesh.scale.x / 2, mesh.scale.y / 2, mesh.scale.z / 2, mesh);
    }
    // LatheGeometry 'Frame'
    {
      const points = [];
      for (let i = 0; i < 8; ++i) {
        points.push(new Vector2(Math.sin(i * 0.2) * 2 + 1, (i - 3) * .4));
      }
      const mesh = this._createSolidGeometry(new LatheGeometry(points), silver_);
      mesh.rotation.x = Math.PI / 2;
      this._addObject(body_, mesh.scale.x / 2, mesh.scale.y / 2, -0.75, mesh);
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
    this.threeGroup.rotation.y += 0.01
  }
}
export { WarpGateClass }