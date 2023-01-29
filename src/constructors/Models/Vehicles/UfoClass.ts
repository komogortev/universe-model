import {
  Group,
  ConeGeometry,
  MeshPhongMaterial,
  DoubleSide,
  Mesh,
  Color,
  CylinderGeometry,
  Sphere
} from 'three'

class UfoClass {
  _nameId: string;
  _threeGroup: Group;
  _updatables: Array<any>;
  _boundingSphere: any | null;

  constructor(name: string = 'Bob Lazar Ufo') {
    this._nameId = name;
    this._threeGroup = new Group();
    this._updatables = [];
    this._updatables.push(this)
    this._boundingSphere = null;
    this.initialize()
  }

  initialize() {
    const bodyModel = this._createBodyModel();
    this._threeGroup.add(bodyModel)
  }



  _createBodyModel() {
    const body_: Group = new Group();
    const silver_ = new Color(0xE0DFDC);
    const silver2_ = new Color(0xCFCFCE);
    // ConeGeometry 'Top'
    {
      const radius = 8;  // ui: radius
      const height = 2;  // ui: height
      const radialSegments = 16;  // ui: radialSegments
      const ConeGeometryMesh = this._createSolidGeometry(new ConeGeometry(radius, height, radialSegments), silver_);
      this._addObject(body_, 0, 1, 0, ConeGeometryMesh);

      // ConeGeometry 'Bottom'
      const ConeGeometryMesh2 = this._createSolidGeometry(new ConeGeometry(radius, -height, radialSegments), silver2_);
      this._addObject(body_, 0, -1, 0, ConeGeometryMesh2);
    }
    // CylinderGeometry 'Cabin'
    {
      const radiusTop = 2;  // ui: radiusTop
      const radiusBottom = 4;  // ui: radiusBottom
      const height = 2;  // ui: height
      const radialSegments = 12;  // ui: radialSegments
      const CylinderGeometryMesh = this._createSolidGeometry(new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments), silver2_);
      this._addObject(body_, 0, 1.5, 0, CylinderGeometryMesh);
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

  get mesh() {
    return this._threeGroup.children[0];
  }

  get updatables() {
    return this._updatables;
  }

  tick(delta: number) {
    this.threeGroup.rotation.y += 0.01
  }
}
export { UfoClass }