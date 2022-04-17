import { SphereGeometry, MeshNormalMaterial, Mesh, Object3D } from 'three'
import { golemCamera } from '../cameras'

class Golem {
  constructor(camera) {
    this.golemGeometry = new SphereGeometry(1, 6, 6);
    this.golemMaterial = new MeshNormalMaterial({ wireframe: true });
    this.golemMesh = new Mesh(this.golemGeometry, this.golemMaterial);
    this.golemMesh.name = 'Golem'

    this.golemOrbit = new Object3D();
    this.golemBlob = new Object3D();
    this.golemBlob.position.x = 0;
    this.golemBlob.position.z = 2;
    this.golemBlob.position.y = -1;
    this.golemOrbit.add(this.golemBlob);
    this.golemBlob.add(this.golemMesh);

    this.golemCamera = golemCamera;
    this.golemCamera.position.y = 2;
    this.golemCamera.position.z = 3;
    this.golemBlob.add(golemCamera);
  }
  get camera() {
    return this.golemCamera
  }
  get orbit() {
    return this.golemOrbit
  }
  set visible(v) {
    // this._visible = v;
    // this.grid.visible = v;
    // this.axes.visible = v;
  }
}

export { Golem }