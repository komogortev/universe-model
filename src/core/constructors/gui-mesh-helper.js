import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  Curve,
  CylinderGeometry,
  DodecahedronGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LatheGeometry,
  LineSegments,
  LineBasicMaterial,
  Mesh,
  MeshPhongMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RingGeometry,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WireframeGeometry,
  WebGLRenderer,
} from "three";

import { GUI } from "lil-gui";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const twoPi = Math.PI * 2;
const gui = new GUI();

class CustomSinCurve extends Curve {
  constructor(scale = 1) {
    super();

    this.scale = scale;
  }

  getPoint(t, optionalTarget = new Vector3()) {
    const tx = t * 3 - 1.5;
    const ty = Math.sin(2 * Math.PI * t);
    const tz = 0;

    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}

function updateGroupGeometry(mesh, newGeometry) {
  mesh.children[0].geometry.dispose();
  mesh.children[1].geometry.dispose();

  mesh.children[0].geometry = new WireframeGeometry(newGeometry);
  mesh.children[1].geometry = newGeometry;

  // these do not update nicely together if shared
}

// heart shape
const x = 0,
  y = 0;

const heartShape = new Shape();

heartShape.moveTo(x + 5, y + 5);
heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

const guis = {
  BoxGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      width: 15,
      height: 15,
      depth: 15,
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new BoxGeometry(
          data.width,
          data.height,
          data.depth,
          data.widthSegments,
          data.heightSegments,
          data.depthSegments
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.BoxGeometry");

    parentFolder.add(data, "width", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "height", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "depth", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "widthSegments", 1, 10).step(1).onChange(generateGeometry);
    parentFolder
      .add(data, "heightSegments", 1, 10)
      .step(1)
      .onChange(generateGeometry);
    parentFolder.add(data, "depthSegments", 1, 10).step(1).onChange(generateGeometry);

    generateGeometry();
  },

  CapsuleGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 5,
      length: 5,
      capSegments: 10,
      heightSegments: 20,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new CapsuleGeometry(
          data.radius,
          data.length,
          data.capSegments,
          data.heightSegments
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.CapsuleGeometry");

    parentFolder.add(data, "radius", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "length", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "capSegments", 1, 32).step(1).onChange(generateGeometry);
    parentFolder
      .add(data, "heightSegments", 1, 64)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  CylinderGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radiusTop: 5,
      radiusBottom: 5,
      height: 10,
      radialSegments: 8,
      heightSegments: 1,
      openEnded: false,
      thetaStart: 0,
      thetaLength: twoPi,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new CylinderGeometry(
          data.radiusTop,
          data.radiusBottom,
          data.height,
          data.radialSegments,
          data.heightSegments,
          data.openEnded,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.CylinderGeometry");

    parentFolder.add(data, "radiusTop", 0, 30).onChange(generateGeometry);
    parentFolder.add(data, "radiusBottom", 0, 30).onChange(generateGeometry);
    parentFolder.add(data, "height", 1, 50).onChange(generateGeometry);
    parentFolder
      .add(data, "radialSegments", 3, 64)
      .step(1)
      .onChange(generateGeometry);
    parentFolder
      .add(data, "heightSegments", 1, 64)
      .step(1)
      .onChange(generateGeometry);
    parentFolder.add(data, "openEnded").onChange(generateGeometry);
    parentFolder.add(data, "thetaStart", 0, twoPi).onChange(generateGeometry);
    parentFolder.add(data, "thetaLength", 0, twoPi).onChange(generateGeometry);

    generateGeometry();
  },

  ConeGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 5,
      height: 10,
      radialSegments: 8,
      heightSegments: 1,
      openEnded: false,
      thetaStart: 0,
      thetaLength: twoPi,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new ConeGeometry(
          data.radius,
          data.height,
          data.radialSegments,
          data.heightSegments,
          data.openEnded,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.ConeGeometry");

    parentFolder.add(data, "radius", 0, 30).onChange(generateGeometry);
    parentFolder.add(data, "height", 1, 50).onChange(generateGeometry);
    parentFolder
      .add(data, "radialSegments", 3, 64)
      .step(1)
      .onChange(generateGeometry);
    parentFolder
      .add(data, "heightSegments", 1, 64)
      .step(1)
      .onChange(generateGeometry);
    parentFolder.add(data, "openEnded").onChange(generateGeometry);
    parentFolder.add(data, "thetaStart", 0, twoPi).onChange(generateGeometry);
    parentFolder.add(data, "thetaLength", 0, twoPi).onChange(generateGeometry);

    generateGeometry();
  },

  CircleGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 10,
      segments: 32,
      thetaStart: 0,
      thetaLength: twoPi,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new CircleGeometry(
          data.radius,
          data.segments,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.CircleGeometry");

    parentFolder.add(data, "radius", 1, 20).onChange(generateGeometry);
    parentFolder.add(data, "segments", 0, 128).step(1).onChange(generateGeometry);
    parentFolder.add(data, "thetaStart", 0, twoPi).onChange(generateGeometry);
    parentFolder.add(data, "thetaLength", 0, twoPi).onChange(generateGeometry);

    generateGeometry();
  },

  DodecahedronGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 10,
      detail: 0,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new DodecahedronGeometry(data.radius, data.detail)
      );
    }

    // const folder = parentFolder.addFolder("THREE.DodecahedronGeometry");

    parentFolder.add(data, "radius", 1, 20).onChange(generateGeometry);
    parentFolder.add(data, "detail", 0, 5).step(1).onChange(generateGeometry);

    generateGeometry();
  },

  IcosahedronGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 10,
      detail: 0,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new IcosahedronGeometry(data.radius, data.detail)
      );
    }

    // const folder = parentFolder.addFolder("THREE.IcosahedronGeometry");

    parentFolder.add(data, "radius", 1, 20).onChange(generateGeometry);
    parentFolder.add(data, "detail", 0, 5).step(1).onChange(generateGeometry);

    generateGeometry();
  },

  LatheGeometry: function (mesh, options, parentFolder = gui) {
    const points = [];

    for (let i = 0; i < 10; i++) {
      points.push(new Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
    }

    const data = {
      segments: 12,
      phiStart: 0,
      phiLength: twoPi,
    };

    function generateGeometry() {
      const geometry = new LatheGeometry(
        points,
        data.segments,
        data.phiStart,
        data.phiLength
      );

      updateGroupGeometry(mesh, geometry);
    }

    // const folder = parentFolder.addFolder("THREE.LatheGeometry");

    parentFolder.add(data, "segments", 1, 30).step(1).onChange(generateGeometry);
    parentFolder.add(data, "phiStart", 0, twoPi).onChange(generateGeometry);
    parentFolder.add(data, "phiLength", 0, twoPi).onChange(generateGeometry);

    generateGeometry();
  },

  OctahedronGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 10,
      detail: 0,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new OctahedronGeometry(data.radius, data.detail)
      );
    }

    // const folder = parentFolder.addFolder("THREE.OctahedronGeometry");

    parentFolder.add(data, "radius", 1, 20).onChange(generateGeometry);
    parentFolder.add(data, "detail", 0, 5).step(1).onChange(generateGeometry);

    generateGeometry();
  },

  PlaneGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      width: options.width || 1,
      height: options.height || 1,
      widthSegments: 1,
      heightSegments: 1,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new PlaneGeometry(
          data.width,
          data.height,
          data.widthSegments,
          data.heightSegments
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.PlaneGeometry");

    parentFolder.add(data, "width", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "height", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "widthSegments", 1, 30).step(1).onChange(generateGeometry);
    parentFolder
      .add(data, "heightSegments", 1, 30)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  RingGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      innerRadius: 5,
      outerRadius: 10,
      thetaSegments: 8,
      phiSegments: 8,
      thetaStart: 0,
      thetaLength: twoPi,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new RingGeometry(
          data.innerRadius,
          data.outerRadius,
          data.thetaSegments,
          data.phiSegments,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.RingGeometry");

    parentFolder.add(data, "innerRadius", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "outerRadius", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "thetaSegments", 1, 30).step(1).onChange(generateGeometry);
    parentFolder.add(data, "phiSegments", 1, 30).step(1).onChange(generateGeometry);
    parentFolder.add(data, "thetaStart", 0, twoPi).onChange(generateGeometry);
    parentFolder.add(data, "thetaLength", 0, twoPi).onChange(generateGeometry);

    generateGeometry();
  },

  SphereGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 15,
      widthSegments: 32,
      heightSegments: 16,
      phiStart: 0,
      phiLength: twoPi,
      thetaStart: 0,
      thetaLength: Math.PI,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new SphereGeometry(
          data.radius,
          data.widthSegments,
          data.heightSegments,
          data.phiStart,
          data.phiLength,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.SphereGeometry");

    parentFolder.add(data, "radius", 1, 30).onChange(generateGeometry);
    parentFolder.add(data, "widthSegments", 3, 64).step(1).onChange(generateGeometry);
    parentFolder
      .add(data, "heightSegments", 2, 32)
      .step(1)
      .onChange(generateGeometry);
    parentFolder.add(data, "phiStart", 0, twoPi).onChange(generateGeometry);
    parentFolder.add(data, "phiLength", 0, twoPi).onChange(generateGeometry);
    parentFolder.add(data, "thetaStart", 0, twoPi).onChange(generateGeometry);
    parentFolder.add(data, "thetaLength", 0, twoPi).onChange(generateGeometry);

    generateGeometry();
  },

  TetrahedronGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 10,
      detail: 0,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new TetrahedronGeometry(data.radius, data.detail)
      );
    }

    // const folder = parentFolder.addFolder("THREE.TetrahedronGeometry");

    parentFolder.add(data, "radius", 1, 20).onChange(generateGeometry);
    parentFolder.add(data, "detail", 0, 5).step(1).onChange(generateGeometry);

    generateGeometry();
  },

  TorusGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 10,
      tube: 3,
      radialSegments: 16,
      tubularSegments: 100,
      arc: twoPi,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new TorusGeometry(
          data.radius,
          data.tube,
          data.radialSegments,
          data.tubularSegments,
          data.arc
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.TorusGeometry");

    parentFolder.add(data, "radius", 1, 20).onChange(generateGeometry);
    parentFolder.add(data, "tube", 0.1, 10).onChange(generateGeometry);
    parentFolder
      .add(data, "radialSegments", 2, 30)
      .step(1)
      .onChange(generateGeometry);
    parentFolder
      .add(data, "tubularSegments", 3, 200)
      .step(1)
      .onChange(generateGeometry);
    parentFolder.add(data, "arc", 0.1, twoPi).onChange(generateGeometry);

    generateGeometry();
  },

  TorusKnotGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      radius: 10,
      tube: 3,
      tubularSegments: 64,
      radialSegments: 8,
      p: 2,
      q: 3,
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new TorusKnotGeometry(
          data.radius,
          data.tube,
          data.tubularSegments,
          data.radialSegments,
          data.p,
          data.q
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.TorusKnotGeometry");

    parentFolder.add(data, "radius", 1, 20).onChange(generateGeometry);
    parentFolder.add(data, "tube", 0.1, 10).onChange(generateGeometry);
    parentFolder
      .add(data, "tubularSegments", 3, 300)
      .step(1)
      .onChange(generateGeometry);
    parentFolder
      .add(data, "radialSegments", 3, 20)
      .step(1)
      .onChange(generateGeometry);
    parentFolder.add(data, "p", 1, 20).step(1).onChange(generateGeometry);
    parentFolder.add(data, "q", 1, 20).step(1).onChange(generateGeometry);

    generateGeometry();
  },

  TubeGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      segments: 20,
      radius: 2,
      radialSegments: 8,
    };

    const path = new CustomSinCurve(10);

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        new TubeGeometry(
          path,
          data.segments,
          data.radius,
          data.radialSegments,
          false
        )
      );
    }

    // const folder = parentFolder.addFolder("THREE.TubeGeometry");

    parentFolder.add(data, "segments", 1, 100).step(1).onChange(generateGeometry);
    parentFolder.add(data, "radius", 1, 10).onChange(generateGeometry);
    parentFolder
      .add(data, "radialSegments", 1, 20)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  ShapeGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      segments: 12,
    };

    function generateGeometry() {
      const geometry = new ShapeGeometry(heartShape, data.segments);
      geometry.center();

      updateGroupGeometry(mesh, geometry);
    }

    // const folder = parentFolder.addFolder("THREE.ShapeGeometry");
    parentFolder.add(data, "segments", 1, 100).step(1).onChange(generateGeometry);

    generateGeometry();
  },

  ExtrudeGeometry: function (mesh, options, parentFolder = gui) {
    const data = {
      steps: 2,
      depth: 16,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 1,
    };

    const length = 12,
      width = 8;

    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(length, width);
    shape.lineTo(length, 0);
    shape.lineTo(0, 0);

    function generateGeometry() {
      const geometry = new ExtrudeGeometry(shape, data);
      geometry.center();

      updateGroupGeometry(mesh, geometry);
    }

    // const folder = parentFolder.addFolder("THREE.ExtrudeGeometry");

    parentFolder.add(data, "steps", 1, 10).step(1).onChange(generateGeometry);
    parentFolder.add(data, "depth", 1, 20).onChange(generateGeometry);
    parentFolder.add(data, "bevelThickness", 1, 5).step(1).onChange(generateGeometry);
    parentFolder.add(data, "bevelSize", 0, 5).step(1).onChange(generateGeometry);
    parentFolder.add(data, "bevelOffset", -4, 5).step(1).onChange(generateGeometry);
    parentFolder.add(data, "bevelSegments", 1, 5).step(1).onChange(generateGeometry);

    generateGeometry();
  },
};

function chooseFromHash(mesh, geometryType) {
  if (guis[geometryType] !== undefined) {
    //execute geometryType methods on mesh
    guis[geometryType](mesh);
  }

  if (geometryType === "TextGeometry") {
    return { fixed: true };
  }

  //No configuration options
  return {};
}

export { CustomSinCurve, guis };
