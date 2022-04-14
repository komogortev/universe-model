import { Object3D, Mesh, MeshPhongMaterial, SphereGeometry } from 'three'

export function createPlanetoid(planetoidInfo = {}) {
  const planetoid = { planetoidInfo }
  const radius = 1
  const widthSegments = 6
  const heightSegments = 6
  const sphereGeometry = new SphereGeometry(
    radius, widthSegments, heightSegments
  )

  // Create planetoid body
  const planetoidMaterial = new MeshPhongMaterial({
    emissive: planetoidInfo.emissive ? planetoidInfo.emissive : null,
    color: planetoidInfo.color ? planetoidInfo.color : null,
  });
  const planetoidMesh = new Mesh(sphereGeometry, planetoidMaterial);
  planetoidMesh.name = planetoidInfo.nameId
  planetoidMesh.planetoidInfo = planetoidInfo
  planetoidMesh.scale.set(
    planetoidInfo.scale,
    planetoidInfo.scale,
    planetoidInfo.scale,
  );

  const planetoidOrbit = new Object3D();
  planetoidOrbit.name = planetoidInfo.nameId
  planetoidOrbit.rotation_period = planetoidInfo.rotation_period
  planetoidOrbit.position.x = planetoidInfo.distance * 20 //Distance from parent
  planetoidOrbit.add(planetoidMesh)

  // create planetoid Orbit object
  if (planetoidInfo.orbital_period) {
    const planetoidParentOrbit = new Object3D();
    planetoidParentOrbit.name = planetoidInfo.nameId
    planetoidParentOrbit.orbital_period = planetoidInfo.orbital_period
    planetoidParentOrbit.add(planetoidOrbit)
    planetoid.planetoidParentOrbit = planetoidParentOrbit
  }

  planetoid.planetoidMesh = planetoidMesh
  planetoid.planetoidOrbit = planetoidOrbit

  return planetoid
}