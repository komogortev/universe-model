
type sizeScalingType = {
  multiplier: number
}
type wildcardObject = {
  [key: string]: string|number|Array<any>|any;
}

export interface IWorldSettings {
  timeSpeed: number,
  size_scaling: sizeScalingType;
  distance_scaling: sizeScalingType;
  constants: wildcardObject
}

export interface IWorldState {
  loading: boolean;
  worldSettings: IWorldSettings
}
