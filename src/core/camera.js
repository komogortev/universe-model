import {  PerspectiveCamera } from 'three'

export const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

export const camera = new PerspectiveCamera(
  75, // FOV
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // near clipping plane
  1000 // far clipping plane
)
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
})

export default camera