<script setup>
import { ref, render, onMounted } from 'vue'
import * as THREE from 'three'
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { renderer, updateRenderer } from '../core/renderer'
import { makePerspectiveCamera } from '../core/cameras'
import { ambientLight, pointLight } from '../core/lights'
import { createControls, createFlyControls  } from '../core/systems/Controls.js';
import { Golem }     from '../core/constructors/golem'
import { Planetoid } from '../core/constructors/planetoid'
import { AxisGridHelper } from '../utils/axis-helper'
import useWorldStore from "../store/world";

// 1. Properties listing
const { solarSystemStore, settings, setTimeSpeed, getPlanetoidInfo } = useWorldStore();

defineProps({
  msg: String,
})

let loader, gui, textureLoader
let currentCamera, scene, sceneCamera, golemCamera, universeControls, golemControls
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

  sceneCamera = makePerspectiveCamera(70, window.innerWidth / window.innerHeight)
  sceneCamera.name = 'Universe Camera'
  sceneCamera.position.set(0, 0, 50);
  sceneCamera.lookAt(0, 0, 0);
  _makeAxisGrid(sceneCamera, `sceneCamera`);
  universeControls = createControls(sceneCamera, renderer)

  golem = new Golem(renderer)
  _makeAxisGrid(golem.camera, `golem.camera`, 10)
  _makeAxisGrid(golem.parent, `golem.parent`, 12)
  _makeAxisGrid(golem.orbit, `golem.rbit`, 14)
  // golemCamera = makePerspectiveCamera(70, window.innerWidth / window.innerHeight)
  // golemCamera.position.set(0, 10, 50);
  // golemCamera.lookAt(0, 0, 0);
  // golemCamera.updateProjectionMatrix()
  // golem.orbit.add(golemCamera)
  //_makeAxisGrid(golemCamera, `golemCamera`);
  // golemControls = createControls(golemCamera, renderer)
  // golemControls.enabled = false
  // golemControls.update()

  currentCamera = sceneCamera
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

  scene = new THREE.Scene()
  textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    '/models/solar-system/textures/8k_stars_milky_way.jpg',
    () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer, texture);
      scene.background = rt.texture;
    })

  scene.add(ambientLight, pointLight, currentCamera, sceneCamera, solarSystemGroup, golem.golemParentOrbit)

  // 2. Init Scene
  // * Load 3D model
  loader.load( '/models/toon-cat/toon-cat.gltf', ( gltf ) => {
    gltf.animations // Array<THREE.AnimationClip>
    gltf.scene // THREE.Group
    gltf.scenes // Array<THREE.Group>
    gltf.cameras // Array<THREE.Camera>
    gltf.asset // Object
    gltf.scene.scale.setScalar(.025)
    scene.add( gltf.scene )
  }, undefined, ( error ) => {
    console.error( error )
  })

  document.addEventListener('click', onMouseClick) // Left click
  document.addEventListener('dblclick', onMouseDblClick) // Left, Left, Dbl
  document.addEventListener('contextmenu', onMouseContext) // Right click
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

function focusPlanetoidView(planetoid) {
  // attach camera to clicked object
  planetoid.add(golem.parent)
  golem.parent.position.set(
    0,
    0,
    0,
  )
  // place golem on parent orbit
  golem.orbit.position.set(
    golem.parent.position.x, //planetoid.children[0].scale.x + 1,
    golem.parent.position.y, //.25,
    golem.parent.position.z, //planetoid.children[0].scale.z + .5
  )

  golem.camera.lookAt(
    planetoid.position.x,
    planetoid.position.y,
    planetoid.position.z
  );
  golem.camera.position.x = 0;
  golem.camera.position.y = 0;
  golem.camera.position.z = 10;
  golem.camera.updateProjectionMatrix()
  currentCamera = golem.camera

  // set controls origin
  golem.controls.enabled = true
  golem.controls.target.set(
    planetoid.position.x,
    planetoid.position.y,
    planetoid.position.z
  )
  golem.controls.update()

  universeControls.enabled = false
  universeControls.update()

  console.log('Golem arrived to ', planetoid, golem)
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
  //renderer.render(scene, golemCamera)
  renderer.render(scene, sceneCamera)
  requestAnimationFrame(animate)

  // measure how long the previous frame took.
  const delta = clock.getDelta(); // diff in seconds from old time
  _animateCelestialObjects(delta)

  // Act on left click
  if (clickFlag) {
    clickFlag = false
    // find btn mesh connection and switch to its camera
    raycaster.setFromCamera( mouse, sceneCamera );
    const intersection = raycaster.intersectObjects( celestialOjects );

    if (intersection.length > 0) {
      // find celestial object that has name
      for (var i = 0; i < intersection.length; i++) {
        if (intersection[i].object && intersection[i].object.type !== 'GridHelper'
          && intersection[i].object.name
          && intersection[i].object.name.includes(' Mesh')) {
            focusPlanetoidView(intersection[i].object.parent)
            break
        }
      }
    }


  } else if (contextClickFlag) {
    focusPlanetoidView(scene)
    // return to default camera on right click
    currentCamera = sceneCamera

    golem.controls.enabled = false
    golem.controls.update()
    universeControls.enabled = true
    universeControls.update()
    // sceneCamera.updateProjectionMatrix()
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
