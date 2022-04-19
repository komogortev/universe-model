import { SphereGeometry, MeshNormalMaterial, Mesh, Object3D } from 'three'
import { golemCamera } from '../cameras'

class Golem {
  constructor(orbitDistance = 1) {
    this.radius = .05
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
    this.golemOrbit.position.x = orbitDistance //Distance from parent

    this.golemMesh = new Mesh(this.golemGeometry, this.golemMaterial);
    this.golemMesh.name = 'Golem Mesh'


    this.golemParentOrbit = new Object3D();
    this.golemParentOrbit.name = 'Golem Orbit'

    this.golemParentOrbit.add(this.golemOrbit)
    this.golemOrbit.add(this.golemMesh)

    this.golemCamera = golemCamera;
    this.golemCamera.name = 'Golem Camera'
    this.golemCamera.position.x = 0.15;
    this.golemCamera.position.y = 0;
    this.golemCamera.position.z = 0;
    this.golemOrbit.add(golemCamera);
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
  set visible(v) {
    // this._visible = v;
    // this.grid.visible = v;
    // this.axes.visible = v;
  }
}

export { Golem }