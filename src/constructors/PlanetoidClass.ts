import type { IPlanetoid } from '../types/StarsStoreTypes';
import {
  SphereGeometry,
  BufferGeometry,
  MeshNormalMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Mesh,
  Raycaster,
  Vector3,
  TextureLoader, Group, Color, MeshPhongMaterial,PointLight,PointLightHelper, Light, AxesHelper, GridHelper
} from 'three'
import { calcPosFromLatLngRad, convertRotationPerDayToRadians } from '../utils/helpers';

import useWorldSettingsStore from "../stores/WorldSettingsStore";
import { WarpGateClass } from './Models/Structures/WarpGateClasss';
const { worldSettings } = useWorldSettingsStore();

const loader = new TextureLoader();

type IAthmosphere<Mesh> = Mesh & { tick: () => void }

class PlanetoidClass {
  nameId: string;
  _localConfig: IPlanetoid;
  _threeGroup: any;
  _updatables: Array<any>;
  _intersectables: Array<any>;
  _mesh: any;
  _sharedSphereGeometry: any;
  _gravParentThreeGroup: any;
  _OrbitalRadiansPerSecond: number;
  _RotationRadiansPerSecond: number;
  geometry: any;

  constructor(config: any, parentClass?: any, options?: any) {
    this.nameId = config.nameId
    this._localConfig = config;
    this._threeGroup = new Group(); // A group holds other objects but cannot be seen itself
    this._threeGroup.name = `${this._localConfig.nameId}Group`
    this._updatables = [];
    this._intersectables = [];
    this._gravParentThreeGroup = parentClass;
    this.geometry = options != null && options.geometry != null ? options.geometry : new SphereGeometry(1, 32, 32);
    // /!\ radiants = degrees * (2 * Math.PI)
    this._OrbitalRadiansPerSecond = this._localConfig.orbital_period != null ? convertRotationPerDayToRadians(this._localConfig.orbital_period.days as number) : 0
    this._RotationRadiansPerSecond = convertRotationPerDayToRadians(this._localConfig.rotation_period.days as number)

    this._initialize();
  }

  _initialize() {
    // 1. Create sphere mesh
    this._mesh = new Mesh(
      this.geometry,
      this._generateMaterial(this._localConfig)
    );
    this._mesh.name = `${this._localConfig.nameId} MeshGroup`

    if (this._localConfig.emissive != null) {
      this._mesh.add(this._createLight());
    }
    this._mesh.rotation.y = this._localConfig.tilt
    this._mesh.scale.multiplyScalar(
      (parseFloat(this._localConfig.radius.AU as string))  * (worldSettings.value.planetoidScale as number)
    )

    // Set planetoid distance from group center
    const planetDistanceInAU = (parseFloat(this._localConfig.distance.AU as string)) * worldSettings.value.distanceScale
    let planetDistanceInSceneUnits: number;

    if (this._localConfig.type !== 'moon') {
      planetDistanceInSceneUnits = planetDistanceInAU  * worldSettings.value.distanceScale
    } else {
      planetDistanceInSceneUnits = planetDistanceInAU * (worldSettings.value.distanceScale * 10)
    }

    // offset parent and child radius from distance value
    const parentStarDistanceOffset = this._gravParentThreeGroup != null
      // if parent is not three group but a mesh we can calculate parent mesh offset
      && this._gravParentThreeGroup.children != null && this._gravParentThreeGroup.children[0] != null
      && this._gravParentThreeGroup.children[0].scale.x > 0
     ? (this._gravParentThreeGroup.children[0].scale.x + this._mesh.scale.x)
      : 0

    this._mesh.position.x = planetDistanceInSceneUnits + parentStarDistanceOffset

    //Generate athmosphere
    if (this._localConfig.athmosphereMap != null) {
      const athmosphere = this._generateAthmosphere(
          this._mesh.scale.x,
          this._localConfig.athmosphereMap,
        )
      this._mesh.add(athmosphere);
      this._updatables.push(athmosphere);
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
          ((this._localConfig.radius.km as number) * worldSettings.value.planetoidScale) + 0.375
        );
        poiMesh.position.set(cartPos.x, cartPos.y, cartPos.z);

        this._mesh.add(poiMesh);
      });
    }

    {
      // axes Helper
      const axesHelper = new AxesHelper( 15 );
      this._mesh.add( axesHelper );
      // Grid Helper
      this._mesh.add(new GridHelper(6, 6, "#666666", "#222222"));
    }


    // initiate and collect warpGates
    {
      const warpGates = new WarpGateClass(`${this.nameId} WarpGateGroup`);
      console.log(warpGates._nameId, warpGates);
      // attach warp gate to planetoid mesh
      this._mesh.add(warpGates.threeGroup)
      // position warp gate against planetoid and scaledown
      // offset parent and child radius from distance value
      const parentPlanetoidDistanceOffset = this.mesh.scale.x + 1
      warpGates.threeGroup.children[0].position.set(parentPlanetoidDistanceOffset + warpGates.threeGroup.children[0].scale.x, 0, 0);
      warpGates.threeGroup.children[0].scale.multiplyScalar(this.mesh.scale.x / 4);
      // subscribe to animation loop
      // console.log(newPlanetoidClass.nameId, newPlanetoidClass.mesh);
      this._updatables.push(warpGates);
      this._intersectables.push(warpGates);
    }


    this._threeGroup.add(this._mesh)
    //console.log(this._mesh.name, `scale ${this._mesh.scale.x}`, `distance ${this._mesh.position.x}`, 'DistanceInSceneUnits',planetDistanceInSceneUnits, 'offset', parentStarDistanceOffset)
  }

  // 1. Create material according to planetoid config
  _generateMaterial(cfg: IPlanetoid) {
    let sphereMaterial = cfg.emissive != null
      ? new MeshPhongMaterial({
        emissive: cfg.emissive,
        emissiveIntensity: 1,
      })
       : new MeshPhongMaterial({
        wireframe: true,
        //color: cfg.color ? new Color(cfg.color) : '#fff',
      })

    if (cfg.map != null) {
      sphereMaterial.map = loader.load(cfg.map);
    }

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

    if (cfg.emissive != null && cfg.specularMap != null) {
      sphereMaterial.specularMap = loader.load(cfg.specularMap)
      sphereMaterial.shininess = cfg.shininess || 0
    }

    return sphereMaterial;
  }

  _generateAthmosphere(parentScale: number, athmosphereMap: string) {
    const _athmosphereDepth = this._localConfig.athmosphereDepth != null ? this._localConfig.athmosphereDepth : 0.5
    const materialClouds = new MeshStandardMaterial({
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
      athmosphereMesh.rotation.y += delta * this._RotationRadiansPerSecond *  worldSettings.value.timeSpeed;
    };

    return athmosphereMesh;
  }

  _createLight() {
    class ColorGUIHelper {
      object: any;
      prop: any;
      constructor(object: any, prop: any) {
        this.object = object;
        this.prop = prop;
      }
      get value() {
        return `#${this.object[this.prop].getHexString()}`;
      }
      set value(hexString) {
        this.object[this.prop].set(hexString);
      }
    }

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new PointLight(color, intensity);
    light.position.set(0, 0, 0);

    const helper = new PointLightHelper(light);
    light.add(helper);

    return light;
  }

  get mesh() {
    return this._mesh;
  }

  get threeGroup() {
    return this._threeGroup
  }

  get updatables() {
    return this._updatables;
  }

  get intersectables() {
    return this._intersectables;
  }

  tick(delta: number) {
    // spin planetoid group according to its configured orbital speed
    this.threeGroup.rotation.y += delta * this._OrbitalRadiansPerSecond *  worldSettings.value.timeSpeed;
    // spin planetoid according to its configured rotation cycle
    this.mesh.rotation.y += delta * this._RotationRadiansPerSecond *  worldSettings.value.timeSpeed;

    // Athmosphere rotation
    // if (this.threeGroup.children[0].children != null && this._threeGroup.children[0].children[0] != null && this._threeGroup.children[0].children[0].name == 'Athmosphere Map') {
    //   this.threeGroup.children[0].children[0].rotation.y += delta * this._RotationRadiansPerSecond *  worldSettings.value.timeSpeed;
    // }

    this.updatables.forEach(u => u.tick(delta))
  }
}

export { PlanetoidClass }