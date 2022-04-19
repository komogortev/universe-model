import { SphereGeometry, MeshNormalMaterial, Mesh, Object3D } from 'three'
import { createControls } from '../systems/Controls'
import { makePerspectiveCamera } from '../cameras'

class Golem {
  constructor(renderer) {
    this.radius = 1
    this.widthSegments = 5
    this.heightSegments = 5
    this.golemGeometry = new SphereGeometry(
      this.radius, this.widthSegments, this.heightSegments
    );
    this.golemMaterial = new MeshNormalMaterial({
      wireframe: true
    });

    this.golemOrbit = new Object3D();
    this.golemOrbit.name = 'Golem'

    this.golemMesh = new Mesh(this.golemGeometry, this.golemMaterial);
    this.golemMesh.name = 'Golem Mesh'


    this.golemParentOrbit = new Object3D();
    this.golemParentOrbit.name = 'Golem Orbit'

    this.golemParentOrbit.add(this.golemOrbit)
    this.golemOrbit.add(this.golemMesh)

    this.golemCamera = makePerspectiveCamera(75, window.innerWidth / window.innerHeight);
    this.golemCamera.name = 'Golem Camera'
    this.golemCamera.position.x = 0;
    this.golemCamera.position.y = 0;
    this.golemCamera.position.z = 10;
    this.golemCamera.lookAt(0, 0, 0)
    this.golemCamera.updateProjectionMatrix()
    this.golemOrbit.add(this.golemCamera);

    this.golemControls = createControls(this.golemCamera, renderer)

  }
  get camera() {
    return this.golemCamera
  }
  get orbit() {
    return this.golemOrbit
  }
  get parent() {
    return this.golemParentOrbit
  }
  get mesh() {
    return this.golemMesh
  }
  get controls() {
    return this.golemControls
  }
  set visible(v) {
    // this._visible = v;
    // this.grid.visible = v;
    // this.axes.visible = v;
  }
}

export { Golem }