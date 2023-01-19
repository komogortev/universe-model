import { data } from 'autoprefixer';
import {
  SphereGeometry,
  BufferGeometry,
  MeshNormalMaterial,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector3,
  TextureLoader, Group, Color, MeshPhongMaterial,
} from 'three'
import { calcPosFromLatLngRad, convertRotationPerDayToRadians } from '../utils/helpers';
const loader = new TextureLoader();

class Planetoid {
  _planetoidConfig: any;
  _threeGroup: any;
  _children: any;
  nameId: string;
  radius: number;
  widthSegments: number;
  heightSegments: number;
  planetGeometry: any;
  planetMaterial: any;
  planetMesh: any;

  constructor(config: any, parent: any) {
    this._planetoidConfig = config;
    this._threeGroup = new Group(); // A group holds other objects but cannot be seen itself
    this._children = [];

    this.nameId = config.nameId
    this.radius = 2 // 0.05
    this.widthSegments = 16
    this.heightSegments = 16

    // this.planetGeometry = new SphereGeometry(
    //   this.radius, this.widthSegments, this.heightSegments
    // );
    this.planetGeometry = new SphereGeometry(1, 132, 132);

    // this.planetMaterial = new MeshBasicMaterial({
    //   wireframe: true,
    //   // map: new TextureLoader().load(map) //wireframe: true,
    // });
    // 1. Create material according to planetoid config
    const sphereMaterial = config.emissive
      ? new MeshPhongMaterial({
        emissive: config.emissive,
        emissiveMap: loader.load(config.emissiveMap),
        emissiveIntensity: 1,
      })
      : new MeshPhongMaterial({
        color: config.color ? new Color(config.color) : '#fff',
        map: loader.load(config.textureMap),
      })

    if (config.displacementMap) {
      sphereMaterial.displacementMap = loader.load(config.displacementMap)
      sphereMaterial.displacementScale = config.displacementScale
      // sphereMaterial.wireframe = true;
    }

    if (config.bumpMap) {
      sphereMaterial.bumpMap = loader.load(config.bumpMap)
      sphereMaterial.bumpScale = config.bumpScale
    }

    if (config.specularMap) {
      sphereMaterial.specularMap = loader.load(config.specularMap)
      sphereMaterial.shininess = config.shininess
    }

    const _settings = {
      timeSpeed: 1,
      size_scaling: {
        multiplier: 0.0001
      },
      distance_scaling: {
        divider: 1000000
      },
    };
    const _AU = {
      km: 150000000,
      mi: 93000000
    }
    // this.planetMesh = new Mesh(this.planetGeometry, this.planetMaterial);
    // this.planetMesh.name = 'planet Mesh'
    // this.planetMesh.mesh.position.set(0, 0, 0);
    // 1. Create sphere mesh
    this.planetMesh = new Mesh(this.planetGeometry, sphereMaterial);
    this.planetMesh.name = `${config.nameId} MeshGroup`

    // Scale mesh by planetoid config factor?
    // Might need to either apply to group or decouple mesh altogether

    this.planetMesh.scale.multiplyScalar(config.radius.km * _settings.size_scaling.multiplier)
    // sphereMesh.rotation.z = config.tilt


    const planetDistanceOffset = parent != null && parent.mesh.scale.x > 0
      ? ((parent.mesh.scale.x + this.planetMesh.scale.x) * 2)
      : 0

    const distanceInKm = config.distance.AU * _AU.km
    this.planetMesh.position.x = (distanceInKm + planetDistanceOffset) / _settings.distance_scaling.divider

    // /!\ radiants = degrees * (2 * Math.PI)
    const radiansPerSecond = convertRotationPerDayToRadians(config.rotation_period.days)

    //Generate athmosphere
    if (config.athmosphereMap != null) {
      const materialClouds = new MeshBasicMaterial({
        map: loader.load(config.athmosphereMap),
        transparent: true,
        opacity: config.athmosphereOpacity,
      });
      const athmosphereMesh = new Mesh(this.planetGeometry, materialClouds);
      athmosphereMesh.name = 'Athmosphere Map';
      athmosphereMesh.scale.set(this.planetMesh.scale.x + 0.5, this.planetMesh.scale.y + 0.5, this.planetMesh.scale.z + 0.5);
      athmosphereMesh.scale.multiplyScalar(
        this.planetMesh.scale.x + config.athmosphereDepth
      );
      athmosphereMesh.position.set(0, 0, 0);
      athmosphereMesh.rotation.z = config.tilt;
      athmosphereMesh.tick = (delta: number) => {
        // rotate athmosphereMesh in anticlockwise direction (+=)
        athmosphereMesh.rotation.y += delta * radiansPerSecond *  _settings.timeSpeed;
      };
      this.planetMesh.add(athmosphereMesh);
    }

    // Generate POI
    if (config.POI != null) {
      const poiGeometry = new SphereGeometry(0.005, 6, 6);
      const poiMaterial = new MeshBasicMaterial({ color: 0xff0000 });

      config.POI.forEach((poi: any) => {
        let poiMesh = new Mesh(poiGeometry, poiMaterial);
        poiMesh.name = 'POI'
        poiMesh.title = poi.name

        const cartPos = calcPosFromLatLngRad(
          poi.lat,
          poi.lng,
          (config.radius.km * _settings.size_scaling.multiplier) + 0.375
        );
        poiMesh.position.set(cartPos.x, cartPos.y, cartPos.z);

        this.planetMesh.add(poiMesh);
      });
    }
  }

  get mesh() {
    return this.planetMesh
  }
  get threeGroup() {
    return this._threeGroup
  }

  get children() {
    return this._children
  }
  tick(delta: number) {
    this.planetMesh.rotation.y += 0.0001
  }
}

export { Planetoid }