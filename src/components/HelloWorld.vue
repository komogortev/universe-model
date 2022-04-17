<script setup>
import { ref, render, onMounted } from 'vue'
import * as THREE from 'three'
import GUI from 'lil-gui';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { renderer, updateRenderer } from '../core/renderer'
import { camera, turretCamera, tankCamera, makePerspectiveCamera } from '../core/cameras'
import { ambientLight, pointLight } from '../core/lights'
import { controls } from '../core/orbit-controls'
import { createPlanetoid } from '../utils/planetoid'
import { collectNameIds } from '../utils/helpers'
import { AxisGridHelper } from '../utils/axis-helper'
import useWorldStore from "../store/world";


// 1. Properties listing
const { solarSystemStore, setSolarState, getPlanetoidInfo } = useWorldStore();

defineProps({
  msg: String,
})

let loader, gui, stats
let currentCamera, scene
let celestialOjects, solarSystemNode, golemMesh, golemElevation, golemCamera

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2( 1, 1 )
const clock = new THREE.Clock()
var time = 0;
var delta = 0;
let clickFlag, contextClickFlag

function init () {
  loader = new GLTFLoader()
  gui = new GUI();
  stats = new Stats()

  currentCamera = camera
  controls.camera = currentCamera
  scene = new THREE.Scene()

  celestialOjects = []
  solarSystemNode = new THREE.Object3D()
  solarSystemNode.name = 'SolarSystemNode'
  _makeAxisGrid(solarSystemNode, 'solarSystem', 50)
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

  // 3. Init golem
  const golemGeometry = new THREE.SphereGeometry(1, 6, 6);
  const golemMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
  golemMesh = new THREE.Mesh(golemGeometry, golemMaterial);

  const golemOrbit = new THREE.Object3D();
  golemElevation = new THREE.Object3D();
  const golemBlob = new THREE.Object3D();
  golemMesh.name = 'Golem'
  // golemMesh.castShadow = true;
  scene.add(golemOrbit);
  golemOrbit.add(golemElevation);
  golemElevation.position.x = 0;
  golemElevation.position.z = 2;
  golemElevation.position.y = -1;
  golemElevation.add(golemBlob);
  golemBlob.add(golemMesh);

  golemCamera = makePerspectiveCamera();
  golemCamera.position.y = 2;
  golemCamera.position.z = 3;
  //golemCamera.rotation.y = Math.PI;
  golemBlob.add(golemCamera);

  document.addEventListener( 'click', onMouseClick ) // Left click
  document.addEventListener( 'dblclick', onMouseDblClick ) // Left, Left, Dbl
  document.addEventListener( 'contextmenu', onMouseContext ) // Right click
}

function onMouseClick (event) {
  //event.preventDefault();
  if (clickFlag) {
    return onMouseDblClick(event)
  }
  console.log('onMouseClick', event)
  clickFlag = true
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onMouseDblClick (event) {
  //event.preventDefault();
  console.log('onMouseDblClick', event)
}

function onMouseContext (event) {
  //event.preventDefault();
  console.log('onMouseContext', event)
  contextClickFlag = true
}

function _makeAxisGrid(node, label, units) {
  const helper = new AxisGridHelper(node, units);
  gui.add(helper, 'visible').name(label);
}
// Attach golem to planet mesh
function _moveGolem (newParent) {
  newParent.add(golemElevation)
  currentCamera = golemCamera
}

function _animateCelestialObjects (delta) {
  const timeSpeed = 10
  // Spin the planetoids
  celestialOjects.forEach((obj) => {
    const timeSpan = 1 // (seconds)
    if (obj.hasOwnProperty('rotation_period') && obj.rotation_period !== 0) {
      const rotationRadiantsPerSecond = timeSpan / obj.rotation_period
      obj.rotation.y += (delta * rotationRadiantsPerSecond) * timeSpeed
    }
    if (obj.hasOwnProperty('orbital_period') && obj.orbital_period !== 0) {
     const orbitRadiantsPerSecond = timeSpan / obj.orbital_period
     obj.rotation.y += (delta * orbitRadiantsPerSecond) * timeSpeed
    }
    //@Todo calculate/assign planetoid position progression
    renderer.render(scene, currentCamera)
  });
}

onMounted(() => {
  //@Todo optimize into recursive fn generation of system
  Object.keys(solarSystemStore.value).forEach(key => {
    const sun = createPlanetoid(getPlanetoidInfo(key))
    solarSystemNode.add(sun.planetoidMesh)
    celestialOjects.push(sun.planetoidMesh)
    _makeAxisGrid(sun.planetoidMesh, `${key}Mesh`);

    if (solarSystemStore.value[key].children) {
      Object.keys(solarSystemStore.value[key].children).forEach(childKey => {
        const earth = createPlanetoid(getPlanetoidInfo(childKey))
        solarSystemNode.add(earth.planetoidParentOrbit)
        celestialOjects.push(earth.planetoidParentOrbit)
        celestialOjects.push(earth.planetoidNode)

        _makeAxisGrid(earth.planetoidParentOrbit, `${childKey}ParentOrbit`, 50)
        _makeAxisGrid(earth.planetoidNode, `${childKey}Node`, 12)
        _makeAxisGrid(earth.planetoidMesh, `${childKey}Mesh`)

        if (solarSystemStore.value[key].children[childKey].children) {
          Object.keys(solarSystemStore.value[key].children[childKey].children).forEach(childKey2 => {
            const moon = createPlanetoid(getPlanetoidInfo(childKey2))
            earth.planetoidNode.add(moon.planetoidParentOrbit)
            celestialOjects.push(moon.planetoidParentOrbit)

            _makeAxisGrid(moon.planetoidParentOrbit, `${childKey2}ParentOrbit`, 50)
            _makeAxisGrid(moon.planetoidNode, `${childKey2}Node`, 12)
            _makeAxisGrid(moon.planetoidMesh, `${childKey2}Mesh`)
          })
        }
      })
    }
  })

  // update and add AxesHelper to each node
  celestialOjects.forEach((node) => {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    node.add(axes);
  });
});


// 3. Animation loop
function animate (currentTime) {
  renderer.render(scene, currentCamera)
  requestAnimationFrame(animate)

  // measure how long the previous frame took.
  const delta = clock.getDelta(); // diff in seconds from old time
  _animateCelestialObjects(delta)

  // Act on left click
  if (clickFlag) {
    // find btn mesh connection and switch to its camera
    raycaster.setFromCamera( mouse, camera );
    const intersection = raycaster.intersectObjects( celestialOjects );

    if ( intersection.length > 0 ) {
      // find celestial object that has name
      for (var i = 0; i < intersection.length; i++) {
        if (intersection[i].object
          && intersection[i].object.name
          && intersection[i].object.name.length > 0) {
            _moveGolem(intersection[i].object)
            break
        }
      }
    }

    clickFlag = false
  } else if (contextClickFlag) {
    // return to default camera on right click
    currentCamera = camera
    scene.add(golemElevation)
    contextClickFlag = false
  }

  renderer.render(scene, currentCamera)
}

init ()
animate()
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
