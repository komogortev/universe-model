<script setup>
import { ref, render, onMounted } from 'vue'
import * as THREE from 'three'
import GUI from 'lil-gui';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { renderer, updateRenderer } from '../core/renderer'
import { camera, makePerspectiveCamera } from '../core/cameras'
import { ambientLight, pointLight } from '../core/lights'
import { controls } from '../core/orbit-controls'
import { Loop }     from '../core/systems/Loop.js';
import { Golem }    from '../utils/constructors/golem'
import { Planetoid } from '../utils/constructors/planetoid'
import { AxisGridHelper } from '../utils/axis-helper'
import { collectNameIds } from '../utils/helpers'
import useWorldStore from "../store/world";

// 1. Properties listing
const { solarSystemStore, settings, setTimeSpeed, getPlanetoidInfo } = useWorldStore();

defineProps({
  msg: String,
})

let loader, gui, stats
let currentCamera, scene, loop
let celestialOjects, solarSystemGroup, golem

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
  loop = new Loop(currentCamera, scene, renderer);

  golem = new Golem()
  celestialOjects = []
  solarSystemGroup = new THREE.Group()

  const timeSpeedSetting = {
    speed: 1
  }
  // Add sliders to number fields by passing min and max
  gui.add( timeSpeedSetting, 'speed', -100, 100, 1)
    .name( 'Time speed' )
    .onChange( value => {
      setTimeSpeed(value)
    })
  scene.add(ambientLight, pointLight, currentCamera, solarSystemGroup)

  // 2. Init Scene
  // * Load 3D model
  loader.load( '/public/models/toon-cat/toon-cat.gltf', ( gltf ) => {
    gltf.animations; // Array<THREE.AnimationClip>
    gltf.scene; // THREE.Group
    gltf.scenes; // Array<THREE.Group>
    gltf.cameras; // Array<THREE.Camera>
    gltf.asset; // Object
    gltf.scene.scale.setScalar(.025);
    scene.add( gltf.scene );
  }, undefined, ( error ) => {
    console.error( error );
  });

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
  currentCamera = golem.camera
  newParent.add(golem.orbit)
}

function _animateCelestialObjects (delta) {
  const timeSpeed = settings.value.timeSpeed
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
    const star = new Planetoid(getPlanetoidInfo(key))
    solarSystemGroup.add(star.mesh)
    celestialOjects.push(star.mesh)
    _makeAxisGrid(star.mesh, `${key}`);

    if (solarSystemStore.value[key].children) {
      Object.keys(solarSystemStore.value[key].children).forEach(childKey => {
        const planet = new Planetoid(getPlanetoidInfo(childKey))
        solarSystemGroup.add(planet.parent)
        celestialOjects.push(planet.parent)
        celestialOjects.push(planet.orbit)

        _makeAxisGrid(planet.parent, `${childKey} Orbit`, 50)
        _makeAxisGrid(planet.orbit, `${childKey}`, 12)

        if (solarSystemStore.value[key].children[childKey].children) {
          Object.keys(solarSystemStore.value[key].children[childKey].children).forEach(childKey2 => {
            const moon = new Planetoid(getPlanetoidInfo(childKey2))
            planet.orbit.add(moon.parent)
            celestialOjects.push(moon.parent)

            _makeAxisGrid(moon.parent, `${childKey2} Orbit`, 50)
            _makeAxisGrid(moon.orbit, `${childKey2}`, 12)
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
    scene.add(golem.orbit)
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
