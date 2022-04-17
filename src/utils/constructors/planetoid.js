import { Object3D, Mesh, MeshPhongMaterial, MeshBasicMaterial, SphereGeometry, TextureLoader } from 'three'

export function createPlanetoid(planetoidInfo = {}) {
  const loader = new TextureLoader();
  const planetoid = { planetoidInfo }
  const radius = 1
  const widthSegments = 24
  const heightSegments = 24
  const sphereGeometry = new SphereGeometry(
    radius, widthSegments, heightSegments
  )

  // Create planetoid orbit
  const planetoidNode = new Object3D();
  planetoidNode.name = `${planetoidInfo.nameId}Node`
  planetoidNode.position.x = planetoidInfo.distance * 20 //Distance from parent

  // Create planetoid body
  ///import map from
  // const planetoidMaterial = new MeshBasicMaterial({
  //   emissive: planetoidInfo.emissive ? planetoidInfo.emissive : null,
  //   color: planetoidInfo.color ? planetoidInfo.color : '#ccc',
  //   map: planetoidInfo.textureMap ? loader.load('public/models/solar-system/textures/2k_earth_daymap.jpg') : null,
  // });
  const planetoidMaterial = new MeshPhongMaterial({
    emissive: planetoidInfo.emissive ? planetoidInfo.emissive : null,
    color: planetoidInfo.color ? planetoidInfo.color : '#ccc',
    map: planetoidInfo.textureMap ? loader.load(planetoidInfo.textureMap) : null,
  });



  const planetoidMesh = new Mesh(sphereGeometry, planetoidMaterial);
  planetoidMesh.name = planetoidInfo.nameId
  planetoidMesh.planetoidInfo = planetoidInfo
  planetoidNode.rotation_period = planetoidInfo.rotation_period
  planetoidMesh.scale.set(
    planetoidInfo.scale,
    planetoidInfo.scale,
    planetoidInfo.scale,
  );

  // create planetoid parent Orbit object
  if (planetoidInfo.orbital_period) {
    const planetoidParentOrbit = new Object3D();
    planetoidParentOrbit.name = `${planetoidInfo.nameId}ParentOrbit`
    planetoidParentOrbit.orbital_period = planetoidInfo.orbital_period
    planetoidParentOrbit.add(planetoidNode)
    planetoid.planetoidParentOrbit = planetoidParentOrbit
  }

  planetoid.planetoidNode = planetoidNode
  planetoid.planetoidMesh = planetoidMesh
  planetoid.planetoidNode.add(planetoid.planetoidMesh)

  return planetoid
}