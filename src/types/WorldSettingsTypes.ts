
type sizeScalingType = {
  multiplier: number
}
type wildcardObject = {
  [key: string]: string|number|Array<any>|any;
}

export interface IWorldSettings {
  timeSpeed: number;
  timeScale: { sec: number };
  planetoidScale: number;
  distance_scaling: sizeScalingType;
  constants: wildcardObject;
}

export interface IWorldState {
  loading: boolean;
  worldSettings: IWorldSettings
}
