import { Clock } from 'three';

const clock = new Clock();
/**
 * This class will handle all the looping logic and the animation system
 */
class Loop {
  camera: any;
  scene: any;
  renderer: any;
  updatables: Array<any>;

  constructor(camera: any, scene: any, renderer: any) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      // tell every animated object to tick forward one frame
      this.tick();

      // render a frame
      this.renderer.render(this.scene, this.camera);
    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  tick() {
    // only call the getDelta function once per frame!
    const delta: number = clock.getDelta();
    // console.log(`The last frame rendered in ${delta * 1000} milliseconds`);

    for (const object of this.updatables) {
      if (object.tick) {
        object.tick(delta, this.updatables);
      }
    }
  }
}

export { Loop }