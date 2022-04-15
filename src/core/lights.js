import { AmbientLight, PointLight } from 'three'

export const ambientLight = new AmbientLight(0xffffff, .25)

const color = 0xFFFFFF;
const intensity = 3;
export const pointLight = new PointLight(color, intensity)
