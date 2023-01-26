import {
  Group,
  ConeGeometry,
  MeshPhongMaterial,
  DoubleSide,
  Mesh,
  Color,
  CylinderGeometry
} from 'three'

class UfoClass {
  _nameId: string;
  _threeGroup: Group;
  _updatables: Array<any>;

  constructor(name: string = 'Bob Lazar Ufo') {
    this._nameId = name;
    this._threeGroup = new Group();
    this._updatables = [];
    this._updatables.push(this)
    this.initialize()
  }

  initialize() {
    const bodyModel = this.createBodyModel();
    this._threeGroup.add(bodyModel)
  }

  createBodyModel() {
    const body_: Group = new Group();
    const silver_ = new Color(0xE0DFDC);
    const silver2_ = new Color(0xCFCFCE);
    // ConeGeometry 'Top'
    {
      const radius = 8;  // ui: radius
      const height = 2;  // ui: height
      const radialSegments = 16;  // ui: radialSegments
      this._addSolidGeometry(body_, 0, 1, new ConeGeometry(radius, height, radialSegments), silver_);
    }
    // ConeGeometry 'Bottom'
    {
      const radius = 8;  // ui: radius
      const height = -2;  // ui: height
      const radialSegments = 16;  // ui: radialSegments
      this._addSolidGeometry(body_, 0, -1, new ConeGeometry(radius, height, radialSegments), silver2_);
    }
    // CylinderGeometry 'Cabin'
    {
      const radiusTop = 2;  // ui: radiusTop
      const radiusBottom = 4;  // ui: radiusBottom
      const height = 2;  // ui: height
      const radialSegments = 12;  // ui: radialSegments
      this._addSolidGeometry(body_, 0, 1.5, new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments), silver2_);
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

  _addSolidGeometry(parent: Group, x: number, y: number, geometry: any, color?: any) {
    const mesh = new Mesh(geometry, this._createMaterial(color));
    this._addObject(parent, x, y, mesh);
  }

  _addObject(parent: Group, x: number, y: number, obj: any) {
    obj.position.x = x;
    obj.position.y = y;
    parent.add(obj);
  }

  get threeGroup() {
    return this._threeGroup;
  }

  get updatables() {
    return this._updatables;
  }

  tick(delta: number) {
    this.threeGroup.rotation.y += 0.01
  }
}
export { UfoClass }