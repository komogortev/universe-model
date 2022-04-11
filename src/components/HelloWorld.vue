<script setup>
import { ref, render, onMounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { renderer, updateRenderer } from '../core/renderer'
import { camera } from '../core/camera'
import { ambientLight, pointLight } from '../core/lights'
import '../core/controls'
import { createPlanetoid } from '../utils/planetoid'
import { collectNameIds } from '../utils/helpers'
import useWorldStore from "../store/world";

// 1. Properties listing
const { solarSystem, setSolarState, getPlanetoidInfo } = useWorldStore();

defineProps({
  msg: String
})

const loader = new GLTFLoader();
const scene = new THREE.Scene()
const celestialOjects = [];
const solarSystem3D = new THREE.Object3D();
celestialOjects.push(solarSystem3D)

// 2. Init Scene
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
});

scene.add(camera, ambientLight, pointLight, solarSystem3D)
updateRenderer()

onMounted(() => {
  Object.keys(solarSystem.value).forEach(key => {
    const planetoid = createPlanetoid(getPlanetoidInfo(key))
    solarSystem3D.add(planetoid.planetoidOrbit)
    celestialOjects.push(planetoid.planetoidOrbit)
    celestialOjects.push(planetoid.planetoidMesh)

    if (solarSystem.value[key].children) {
      Object.keys(solarSystem.value[key].children).forEach(childKey => {
        const planetoid2 = createPlanetoid(getPlanetoidInfo(childKey))
        solarSystem3D.add(planetoid2.planetoidOrbit)
        celestialOjects.push(planetoid2.planetoidOrbit)
        celestialOjects.push(planetoid2.planetoidMesh)

        if (solarSystem.value[key].children[childKey].children) {
          Object.keys(solarSystem.value[key].children[childKey].children).forEach(childKey2 => {
            const planetoid3 = createPlanetoid(getPlanetoidInfo(childKey2))
            planetoid2.planetoidOrbit.add(planetoid3.planetoidOrbit)
            celestialOjects.push(planetoid3.planetoidMesh)
          })
        }
      })
    }
  })


  // collectNameIds(solarSystem.value).forEach(planetoidName => {
  //   const planetoid = createPlanetoid(getPlanetoidInfo(planetoidName))
  //   solarSystem3D.add(planetoid.planetoidMesh)
  //   celestialOjects.push(planetoid.planetoidMesh)
  // })
});

// 3. Animation loop
const loop = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(loop)

  celestialOjects.forEach((obj) => {
    obj.rotation.y += 0.001;
  });
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
