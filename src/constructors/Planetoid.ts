import {
  SphereGeometry,
  MeshNormalMaterial,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector3,
  TextureLoader
} from 'three'

class Planetoid {
  radius: number;
  widthSegments: number;
  heightSegments: number;
  planetGeometry: any;
  planetMaterial: any;
  planetMesh: any;

  constructor() {
    this.radius = 2 // 0.05
    this.widthSegments = 16
    this.heightSegments = 16

    this.planetGeometry = new SphereGeometry(
      this.radius, this.widthSegments, this.heightSegments
    );

    this.planetMaterial = new MeshNormalMaterial({
      wireframe: true,
    });

    this.planetMesh = new Mesh(this.planetGeometry, this.planetMaterial);
    this.planetMesh.name = 'planet Mesh'
    //this.planetMesh.mesh.position.set(0, 0, 0);
  }

  get mesh() {
    return this.planetMesh
  }

  tick(delta: number) {
    this.planetMesh.rotation.y += 0.0001
  }
}

export { Planetoid }