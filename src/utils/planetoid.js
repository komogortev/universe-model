import { Object3D, Mesh, MeshPhongMaterial, SphereGeometry } from 'three'

export function createPlanetoid(planetoidInfo = {}) {
  const planetoid = { planetoidInfo }
  const radius = 1
  const widthSegments = 6
  const heightSegments = 6
  const sphereGeometry = new SphereGeometry(
    radius, widthSegments, heightSegments
  )

  // Create planetoid orbit
  const planetoidNode = new Object3D();
  planetoidNode.name = `${planetoidInfo.nameId}Node`
  planetoidNode.position.x = planetoidInfo.distance * 20 //Distance from parent

  // Create planetoid body
  const planetoidMaterial = new MeshPhongMaterial({
    emissive: planetoidInfo.emissive ? planetoidInfo.emissive : null,
    color: planetoidInfo.color ? planetoidInfo.color : null,
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