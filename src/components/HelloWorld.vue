<script setup>
import { ref, render, onMounted } from 'vue'
import * as THREE from 'three'
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { renderer, updateRenderer } from '../core/renderer'
import { camera } from '../core/camera'
import { ambientLight, pointLight } from '../core/lights'
import '../core/orbit-controls'
import { createPlanetoid } from '../utils/planetoid'
import { collectNameIds } from '../utils/helpers'
import { AxisGridHelper } from '../utils/axis-helper'
import useWorldStore from "../store/world";

// 1. Properties listing
const { solarSystemStore, setSolarState, getPlanetoidInfo } = useWorldStore();

defineProps({
  msg: String,
})

const loader = new GLTFLoader()
const scene = new THREE.Scene()
const gui = new GUI();
const celestialOjects = [];

const solarSystemNode = new THREE.Object3D();
solarSystemNode.name = 'SolarSystemNode'
makeAxisGrid(solarSystemNode, 'solarSystem', 50);
// celestialOjects.push(solarSystemNode)

scene.add(camera, ambientLight, pointLight, solarSystemNode)
// updateRenderer()

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

function makeAxisGrid(node, label, units) {
  const helper = new AxisGridHelper(node, units);
  gui.add(helper, 'visible').name(label);
}

onMounted(() => {
  //@Todo optimize into recursive fn
  Object.keys(solarSystemStore.value).forEach(key => {
    const sun = createPlanetoid(getPlanetoidInfo(key))
    solarSystemNode.add(sun.planetoidOrbit)
    celestialOjects.push(sun.planetoidOrbit)
    makeAxisGrid(sun.planetoidOrbit, `${key}Orbit`);

    if (solarSystemStore.value[key].children) {
      Object.keys(solarSystemStore.value[key].children).forEach(childKey => {
        const earth = createPlanetoid(getPlanetoidInfo(childKey))
        solarSystemNode.add(earth.planetoidParentOrbit)
        celestialOjects.push(earth.planetoidParentOrbit)
        celestialOjects.push(earth.planetoidOrbit)

        makeAxisGrid(earth.planetoidParentOrbit, `${childKey}ParentOrbit`, 50)
        makeAxisGrid(earth.planetoidOrbit, `${childKey}Orbit`, 25)
        makeAxisGrid(earth.planetoidMesh, `${childKey}Mesh`)

        if (solarSystemStore.value[key].children[childKey].children) {
          Object.keys(solarSystemStore.value[key].children[childKey].children).forEach(childKey2 => {
            const moon = createPlanetoid(getPlanetoidInfo(childKey2))

            earth.planetoidOrbit.add(moon.planetoidParentOrbit)
            celestialOjects.push(moon.planetoidParentOrbit)
            makeAxisGrid(moon.planetoidParentOrbit, `${childKey2}ParentOrbit`, 50)
            makeAxisGrid(moon.planetoidOrbit, `${childKey2}Orbit`, 25)
            makeAxisGrid(moon.planetoidMesh, `${childKey2}Mesh`)
          })
        }
      })
    }
  })

  // add an AxesHelper to each node
  celestialOjects.forEach((node) => {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    node.add(axes);
  });
});

// 3. Animation loop
const loop = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(loop)

  celestialOjects.forEach((obj) => {
    // Spin the planetoids
    if (obj.rotation_period) {
       obj.rotation.y += (0.0000001 * obj.rotation_period)
    }
    if (obj.orbital_period) {
       obj.rotation.y += (0.0000001 * obj.orbital_period)
    }
    //@Todo calculate/assign planetoid position progression
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
