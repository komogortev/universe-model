// store/world.js
import { reactive, toRefs } from "vue";
import type { IWorldState, IWorldSettings } from "../types/WorldSettingsTypes";

const state = reactive<IWorldState>({
  loading: true,
  worldSettings: <IWorldSettings>{
    timeSpeed: 0,
    timeScale: {
      sec: 0.5
    },
    size_scaling: {
      multiplier: 0.0001
    },
    distance_scaling: {
      multiplier: 1000000
    },
    constants: {
      STAR_SYSTEM: 'SolarSystem',
      CHARACTER_SPAWN: 'Sun',
      AU: {
        km: 150000000,
        mi: 93000000
      }
    },
    camSettings: {
      position: {x: 0, y: 0, z: 50},
      aspect: window.innerWidth / window.innerHeight, // aspect ratio
      near: 0.05, // near clipping plane
      far: 10000 // far clipping plane
    },
  },
});

export default function useWorldSettingsStore() {
  const getWorldSettings = (() => state.worldSettings );

  const getWorldConstants = (() => ({ ...state.worldSettings.constants }) );

  const setTimeSpeed = (value: number) => {
    state.worldSettings = { ...state.worldSettings, timeSpeed: value }
  }

  const setSizeScaleMultiplier = (value: number) => {
    state.worldSettings = {
      ...state.worldSettings,
      size_scaling: {
        multiplier: value
      }
    }
  }

  const setDistanceScaleMultiplier = (value: number) => {
    state.worldSettings = {
      ...state.worldSettings,
      distance_scaling: {
        multiplier: value
      }
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