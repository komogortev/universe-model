<script setup>
import { ref, render } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { renderer, updateRenderer } from '../core/renderer'
import { camera } from '../core/camera'
import { ambientLight, pointLight } from '../core/lights'
import '../core/controls'

import useWorldStore from "../store/world";

// 1. Properties listing
const { solarSystem, setSolarState } = useWorldStore();

defineProps({
  msg: String
})
const loader = new GLTFLoader();
const scene = new THREE.Scene()

// 2. Init Scene
scene.add(camera, ambientLight, pointLight)
updateRenderer()

// * Load 3D model
loader.load( '/public/models/toon-cat/toon-cat.gltf', ( gltf ) => {
  gltf.animations; // Array<THREE.AnimationClip>
  gltf.scene; // THREE.Group
  gltf.scenes; // Array<THREE.Group>
  gltf.cameras; // Array<THREE.Camera>
  gltf.asset; // Object
  // *1. detailed option: downsize the model scale
  // const box = new THREE.Box3().setFromObject(gltf.scene);
  // const size = new THREE.Vector3();
  // var center = new THREE.Vector3();
  // box.getCenter(center);
  // var scale = .05;
  // gltf.scene.scale.setScalar(scale);
  // gltf.scene.position.sub(center.multiplyScalar(scale));
  // *2. general scale: alter model scale (less recommended)
  gltf.scene.scale.setScalar(.025);
  scene.add( gltf.scene );
}, undefined, ( error ) => {
  console.error( error );
} );

// 3. Animation loop
const loop = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}
loop()
</script>

<template>
  <div id="info">{{ msg }}</div>
</template>
<style scoped>
#info {
	position: absolute;
	top: 10px;
	width: 100%;
	text-align: center;
	z-index: 100;
	display:block;
}
</style>
