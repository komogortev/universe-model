import { PerspectiveCamera } from 'three';


class Resizer {
  _camera: PerspectiveCamera;
  _renderer: any;

  constructor(container: HTMLElement, camera: PerspectiveCamera, renderer: any) {
    this._camera = camera;
    this._renderer = renderer;

    // set initial size
    this.setSize(container, this._camera, renderer);

    window.addEventListener('resize', () => {
      // set the size again if a resize occurs
      this.setSize(container, this._camera, renderer);
      // perform any custom actions
      this.onResize();
    });
  }

  setSize(container: HTMLElement, camera: PerspectiveCamera, renderer: any) {
    //camera.aspect = container.clientWidth / container.clientHeight;
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  }

  onResize() { }

  set camera(camera: PerspectiveCamera) {
    this._camera = camera
  }
}

export { Resizer };