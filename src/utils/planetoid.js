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
  planetoid.planetoidMesh = planetoidMesh

  // create planetoid Orbit object
  if (planetoidInfo.orbital_period) {
    const planetoidOrbit = new Object3D();
    planetoidOrbit.name = planetoidInfo.nameId
    planetoidOrbit.position.x = planetoidInfo.distance * 20
    planetoidOrbit.planetoidInfo = planetoidInfo
    planetoid.planetoidOrbit = planetoidOrbit
  }

  return planetoid
}