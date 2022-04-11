import { WebGLRenderer } from 'three'
import { sizes } from './camera'

export const renderer = new WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
document.body.appendChild(renderer.domElement);

export function updateRenderer () {
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener('resize', () => {
  updateRenderer()
})

