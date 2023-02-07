// store/world.js
import { reactive, toRefs } from "vue";
import type { IWorldState, IWorldSettings } from "../types/WorldSettingsTypes";

const state = reactive<IWorldState>({
  loading: true,
  worldSettings: <IWorldSettings>{
    timeSpeed: 1,
    timeScale: {
      sec: 0.5
    },
    planetoidScale: 100000, // multiply planetoid AU/SceneUnits size
    distanceScale: 12,

    // closer to realistic scales
    // planetoidScale: 100000, // multiply planetoid AU/SceneUnits size
    // distanceScale: 100,
    constants: {
      STAR_SYSTEM: 'SolarSystem',
      CHARACTER_SPAWN: 'Sun',
      AU: {
        km: 150000000,
        mi: 93000000,
      }
    },
    camSettings: {
      position: {x: 0, y: 0, z: 50},
      aspect: window.innerWidth / window.innerHeight, // aspect ratio
      near: 0.05, // near clipping plane
      far: 1000 // far clipping plane
    },
  },
});

export default function useWorldSettingsStore() {
  const getWorldSettings = (() => ({ ...state.worldSettings }));

  const getWorldConstants = (() => ({ ...state.worldSettings.constants }) );

  const setTimeSpeed = (value: number) => {
    state.worldSettings = { ...state.worldSettings, timeSpeed: value }
  }

  const setSizeScaleMultiplier = (value: number) => {
    state.worldSettings = {
      ...state.worldSettings,
      planetoidScale: value
    }
  }

  const setDistanceScaleMultiplier = (value: number) => {
    state.worldSettings = {
      ...state.worldSettings,
      distanceScale: value
    }
  }

  return {
    ...toRefs(state), // convert to refs when returning
    getWorldSettings,
    getWorldConstants,
    setTimeSpeed,
    setSizeScaleMultiplier,
    setDistanceScaleMultiplier
  }
}