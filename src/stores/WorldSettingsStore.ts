// store/world.js
import { reactive, toRefs } from "vue";

type sizeScalingType = {
  multiplier: number
}
interface IWorldSettings {
  timeSpeed: number,
  size_scaling: sizeScalingType;
  distance_scaling: sizeScalingType;
  constants: {
    [key: string]: string|number|{[key: string]: any}|Array<any>;
  }
}
interface IWorldState {
  loading: boolean;
  worldSettings: IWorldSettings
}

const state = reactive<IWorldState>({
  loading: true,
  worldSettings: {
    timeSpeed: 1,
    size_scaling: {
      multiplier: 0.0001
    },
    distance_scaling: {
      multiplier: 1000000
    },
    constants: {
      AU: {
        km: 150000000,
        mi: 93000000
      }
    }
  },
});

export default function useWorldSettingsStore() {
  const getWorldSettings = (() => state.worldSettings )

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
    setTimeSpeed,
    setSizeScaleMultiplier,
    setDistanceScaleMultiplier
  }
}