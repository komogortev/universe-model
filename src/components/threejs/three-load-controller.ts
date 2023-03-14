import { THREE, FBXLoader, GLTFLoader/*, SkeletonUtils */} from './three-defs.js';
import { entity } from "../../constructors/Entity";

export const three_load_controller = (() => {

  class LoadController extends entity.Component {
    textures_: any;
    models_: any;
    sounds_: any;
    playing_: any[];

    constructor() {
      super();

      this.textures_ = {};
      this.models_ = {};
      this.sounds_ = {};
      this.playing_ = [];
    }

    LoadTexture(path: string, name: string) {
      if (!(name in this.textures_)) {
        const loader = new THREE.TextureLoader();
        loader.setPath(path);

        this.textures_[name] = {loader: loader, texture: loader.load(name)};
        this.textures_[name].encoding = THREE.sRGBEncoding;
      }

      return this.textures_[name].texture;
    }

    LoadSound(path: string, name: string, onLoad: (sound: any) => void) {
      if (!(name in this.sounds_)) {
        const loader = new THREE.AudioLoader();
        loader.setPath(path);

        loader.load(name, (buf) => {
          this.sounds_[name] = {
            buffer: buf
          };
          const threejs = this.FindEntity('threejs').GetComponent('ThreeJSController');
          const s = new THREE.PositionalAudio(threejs.listener_);
          s.setBuffer(buf);
          s.setRefDistance(10);
          s.setMaxDistance(500);
          onLoad(s);
          this.playing_.push(s);
        });
      } else {
        const threejs = this.FindEntity('threejs').GetComponent('ThreeJSController');
        const s = new THREE.PositionalAudio(threejs.listener_);
        s.setBuffer(this.sounds_[name].buffer);
        s.setRefDistance(25);
        s.setMaxDistance(1000);
        onLoad(s);
        this.playing_.push(s);
      }
    }

    // GLB & FBX Loaders
    Load(path: string, name: string, onLoad: (model: any) => void) {
      if (name.endsWith('glb') || name.endsWith('gltf')) {
        this.LoadGLB(path, name, onLoad);
      } else if (name.endsWith('fbx')) {
        this.LoadFBX(path, name, onLoad);
      } else {
        console.error('Failed to load a non glb/fbx model')
      }
    }

    LoadFBX(path: string, name: string, onLoad: (fbx: any) => void) {
      if (!(name in this.models_)) {
        const loader = new FBXLoader();
        loader.setPath(path);

        this.models_[name] = {loader: loader, asset: null, queue: [onLoad]};
        this.models_[name].loader.load(name, (fbx: any) => {
          this.models_[name].asset = fbx;

          const queue = this.models_[name].queue;
          this.models_[name].queue = null;
          for (let q of queue) {
            const clone = this.models_[name].asset.clone();
            q(clone);
          }
        });
      } else if (this.models_[name].asset == null) {
        this.models_[name].queue.push(onLoad);
      } else {
        const clone = this.models_[name].asset.clone();
        onLoad(clone);
      }
    }

    LoadGLB(path: string, name: string, onLoad: (glb: any) => void) {
      const fullName = path + name;
      if (!(fullName in this.models_)) {
        const loader = new GLTFLoader();
        loader.setPath(path);

        this.models_[fullName] = {loader: loader, asset: null, queue: [onLoad]};
        this.models_[fullName].loader.load(name, (glb: any) => {
          this.models_[fullName].asset = glb;

          const queue = this.models_[fullName].queue;
          this.models_[fullName].queue = null;
          for (let q of queue) {
            const clone = {...glb};
            clone.scene = SkeletonUtils.clone(clone.scene);

            q(clone.scene);
          }
        });
      } else if (this.models_[fullName].asset == null) {
        this.models_[fullName].queue.push(onLoad);
      } else {
        const clone = {...this.models_[fullName].asset};
        clone.scene = SkeletonUtils.clone(clone.scene);

        onLoad(clone.scene);
      }
    }

    _LoadMesh() {

    }

    tick(delta: number) {
      for (let i = 0; i < this.playing_.length; ++i) {
        if (!this.playing_[i].isPlaying) {
          this.playing_[i].parent.remove(this.playing_[i]);
        }
      }

      this.playing_ = this.playing_.filter(s => s.isPlaying);
    }
  }

  return {
      LoadController: LoadController,
  };
})();