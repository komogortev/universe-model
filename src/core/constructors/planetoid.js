import { Object3D, Mesh, MeshPhongMaterial, MeshBasicMaterial, SphereGeometry, TextureLoader } from 'three'

class Planetoid {
  constructor(planetoidInfo = {}) {
    this.loader = new TextureLoader();
    this.radius = 1
    this.widthSegments = 24
    this.heightSegments = 24
    this.sphereGeometry = new SphereGeometry(
      this.radius, this.widthSegments, this.heightSegments
    )
    this.planetoidMaterial = new MeshPhongMaterial({
      emissive: planetoidInfo.emissive ? planetoidInfo.emissive : null,
      color: planetoidInfo.color ? planetoidInfo.color : '#ccc',
      map: planetoidInfo.textureMap ? this.loader.load(planetoidInfo.textureMap) : null,
    });

    this.planetoidOrbit = new Object3D();
    this.planetoidOrbit.name = planetoidInfo.nameId
    this.planetoidOrbit.position.x = planetoidInfo.distance * 20 //Distance from parent

    this.planetoidMesh = new Mesh(this.sphereGeometry, this.planetoidMaterial);
    this.planetoidMesh.name = `${planetoidInfo.nameId} Mesh`
    this.planetoidMesh.planetoidInfo = planetoidInfo
    this.planetoidOrbit.rotation_period = planetoidInfo.rotation_period
    this.planetoidMesh.scale.set(
        planetoidInfo.scale,
        planetoidInfo.scale,
        planetoidInfo.scale,
      );

    this.planetoidParentOrbit = new Object3D();
    this.planetoidParentOrbit.name = `${planetoidInfo.nameId} Orbit`
    this.planetoidParentOrbit.orbital_period = planetoidInfo.orbital_period
    this.planetoidParentOrbit.add(this.planetoidOrbit)

    this.planetoidOrbit = this.planetoidOrbit
    this.planetoidMesh = this.planetoidMesh
    this.planetoidOrbit.add(this.planetoidMesh)

  }
  get camera() {
    //return this.golemCamera
  }
  get parent() {
    return this.planetoidParentOrbit
  }
  get orbit() {
    return this.planetoidOrbit
  }
  get mesh() {
    return this.planetoidMesh
  }
  set visible(v) {
    // this._visible = v;
    // this.grid.visible = v;
    // this.axes.visible = v;
  }
}

export { Planetoid }