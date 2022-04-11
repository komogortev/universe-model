import { Object3D, Mesh, MeshPhongMaterial, SphereGeometry } from 'three'

export function createPlanetoid(planetoidInfo = {}) {
  const radius = 1
  const widthSegments = 6
  const heightSegments = 6
  const sphereGeometry = new SphereGeometry(
    radius, widthSegments, heightSegments
  )

  const planetoidName = planetoidInfo.nameId
  const planetoidOrbit = new Object3D();
  const planetoidMaterial = new MeshPhongMaterial({
    emissive: planetoidInfo.emissive ? planetoidInfo.emissive : null,
    color: planetoidInfo.color ? planetoidInfo.color : null,
  });
  const planetoidMesh = new Mesh(sphereGeometry, planetoidMaterial);

  Object.keys(planetoidInfo).forEach(prop => {
    switch (prop) {
      case 'scale':
        planetoidMesh.scale.set(
          planetoidInfo.scale,
          planetoidInfo.scale,
          planetoidInfo.scale,
        );
        break;
      case 'distance':
        planetoidOrbit.position.x = planetoidInfo.distance * 20
        break;
    }
  })

  planetoidOrbit.add(planetoidMesh);
  return { planetoidOrbit, planetoidMesh }
}