type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;
type Color = RGB | RGBA | HEX;

export interface IBaseDataObj {
  [key: string]:  number | string
}

export interface IPOI {
  name: string,
  lat: number,
  lng: number,
}

export interface IPlanetoid {
  nameId: string,
  type: string,
  radius: IBaseDataObj,
  distance: IBaseDataObj,
  orbital_period: IBaseDataObj,
  rotation_period: IBaseDataObj,
  tilt: number,
  color?: Color|number,
  textureMap?: string,
  emissive?: Color|number,
  emissiveMap?: string,
  emissiveIntensity?: number,
  displacementMap?: string,
  displacementScale?: number,
  bumpMap?: string,
  bumpScale?: number,
  specularMap?: string,
  shininess?:  number,
  athmosphereMap?: string,
  athmosphereOpacity?: number,
  athmosphereDepth?: number,
  children?: Array<IPlanetoid>,
  POI?: Array<IPOI>
  BG_MAP?: string,
}

export interface IStarConfig {
  [key: string]: Array<IPlanetoid>
}

export interface IStarSystemsConfig {
  [key: string]: IStarConfig
}