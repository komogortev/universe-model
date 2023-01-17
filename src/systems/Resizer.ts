import { PerspectiveCamera } from 'three';

const setSize = (container: HTMLElement, camera: PerspectiveCamera, renderer: any) => {
  //camera.aspect = container.clientWidth / container.clientHeight;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
};

class Resizer {
  _camera: PerspectiveCamera;

  constructor(container: HTMLElement, camera: PerspectiveCamera, renderer: any) {
    this._camera = camera
    // set initial size
    setSize(container, this._camera, renderer);

    window.addEventListener('resize', () => {
      // set the size again if a resize occurs
      setSize(container, this._camera, renderer);
      // perform any custom actions
      this.onResize();
    });
  }

  set camera(camera: PerspectiveCamera) {
    this._camera = camera
  }

  onResize() { }
}

export { Resizer };