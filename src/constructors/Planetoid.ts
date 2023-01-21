import type { IPlanetoid } from './../types/StarsStoreTypes';
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

import useWorldSettingsStore from "../stores/WorldSettingsStore";
const { worldSettings } = useWorldSettingsStore();

const loader = new TextureLoader();

type IAthmosphere<Mesh> = Mesh & { tick: () => void }

class PlanetoidClass {
  nameId: string;
  _localConfig: IPlanetoid;
  _threeGroup: any;
  _children: any;
  _sharedSphereGeometry: any;
  _gravParentClass: any;

  constructor(config: any, parentClass?: any) {
    this.nameId = config.nameId
    this._localConfig = config;
    this._threeGroup = new Group(); // A group holds other objects but cannot be seen itself
    this._threeGroup.name = `${this._localConfig.nameId}Group`
    this._children = [];
    this._sharedSphereGeometry = new SphereGeometry(1, 132, 132); // shared planetoid geometry template
    this._gravParentClass = parentClass;
    this._initialize()
  }

  _initialize() {
    // 1. Create sphere mesh
    const planetoidMesh = new Mesh(
      this._sharedSphereGeometry,
      this._generateMaterial(this._localConfig)
    );
    planetoidMesh.name = `${this._localConfig.nameId} MeshGroup`
    planetoidMesh.scale.multiplyScalar(
      (this._localConfig.radius.km as number) * (worldSettings.value.size_scaling.multiplier as number)
    )
    planetoidMesh.rotation.y = this._localConfig.tilt

    // offset parent and child radius from distance value
    const planetDistanceOffset = this._gravParentClass != null && this._gravParentClass.threeGroup.children[0].scale.x > 0
      ? ((this._gravParentClass.threeGroup.children[0].scale.x + planetoidMesh.scale.x) / 2)
      : 0

    const planetDistanceInKm = (this._localConfig.distance.AU as number) * worldSettings.value.constants.AU.km
    planetoidMesh.position.x = (planetDistanceInKm + planetDistanceOffset) / worldSettings.value.distance_scaling.multiplier

    // /!\ radiants = degrees * (2 * Math.PI)
    const radiansPerSecond = convertRotationPerDayToRadians(this._localConfig.rotation_period.days as number)

    //Generate athmosphere
    if (this._localConfig.athmosphereMap != null) {
      planetoidMesh.add(
        this._generateAthmosphere(
          planetoidMesh.scale.x,
          this._localConfig.athmosphereMap,
          radiansPerSecond
        )
      );
    }

    // Generate POI
    if (this._localConfig.POI != null) {
      const poiGeometry = new SphereGeometry(0.005, 6, 6);
      const poiMaterial = new MeshBasicMaterial({ color: 0xff0000 });

      this._localConfig.POI.forEach((poi: any) => {
        let poiMesh = new Mesh(poiGeometry, poiMaterial);
        poiMesh.name = `POI: ${poi.name}`

        const cartPos = calcPosFromLatLngRad(
          poi.lat,
          poi.lng,
          ((this._localConfig.radius.km as number) * worldSettings.value.size_scaling.multiplier) + 0.375
        );
        poiMesh.position.set(cartPos.x, cartPos.y, cartPos.z);

        planetoidMesh.add(poiMesh);
      });
    }

    this._threeGroup.add(planetoidMesh)
    this.children.push()
  }

  // 1. Create material according to planetoid config
  _generateMaterial(cfg: IPlanetoid) {
    let sphereMaterial = cfg.emissive != null
      ? new MeshPhongMaterial({
        emissive: cfg.emissive,
        emissiveIntensity: 1,
      })
      : new MeshPhongMaterial({
        color: cfg.color ? new Color(cfg.color) : '#fff',
      })

    if (cfg.emissiveMap != null) {
      sphereMaterial.emissiveMap = loader.load(cfg.emissiveMap);
    }

    if (cfg.displacementMap != null) {
      sphereMaterial.displacementMap = loader.load(cfg.displacementMap)
      sphereMaterial.displacementScale = cfg.displacementScale || 1
    }

    if (cfg.bumpMap != null) {
      sphereMaterial.bumpMap = loader.load(cfg.bumpMap)
      sphereMaterial.bumpScale = cfg.bumpScale || 1
    }

    if (cfg.specularMap != null) {
      sphereMaterial.specularMap = loader.load(cfg.specularMap)
      sphereMaterial.shininess = cfg.shininess || 0
    }

    return sphereMaterial;
  }

  _generateAthmosphere(parentScale: number, athmosphereMap: string, radiansPerSecond: number) {
    const _athmosphereDepth = this._localConfig.athmosphereDepth != null ? this._localConfig.athmosphereDepth : 0.5
    const materialClouds = new MeshBasicMaterial({
      map: loader.load(athmosphereMap),
      transparent: true,
      opacity: this._localConfig.athmosphereOpacity,
    });
    const athmosphereMesh = new Mesh(this._sharedSphereGeometry, materialClouds);
    athmosphereMesh.name = 'Athmosphere Map';
    athmosphereMesh.scale.multiplyScalar(parentScale + _athmosphereDepth);

    athmosphereMesh.position.set(0, 0, 0);
    athmosphereMesh.rotation.z = this._localConfig.tilt;

    // rotate athmosphereMesh in anticlockwise direction (+=)
    athmosphereMesh.tick = (delta: number) => {
      athmosphereMesh.rotation.y += delta * radiansPerSecond *  worldSettings.value.timeSpeed;
    };

    return athmosphereMesh;
  }

  get mesh() {
    return this._threeGroup[0]
  }

  get threeGroup() {
    return this._threeGroup
  }

  get children() {
    return this._children
  }

  tick(delta: number) {
    this._threeGroup.rotation.y += 0.0001
  }
}

export { PlanetoidClass }