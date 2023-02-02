<script setup lang="ts">
import { onMounted } from 'vue';
import { WorldScene } from '../constructors/WorldScene';

async function init() {
  // Get a reference to the container element
  const container_ = document.querySelector('#scene-container') as HTMLElement;
  // create a new world
  const world = new WorldScene(container_);
  // start the animation loop
  world.start();
}

onMounted(() => {
  init().catch((err) => console.error("onMounted Error", err))
});
</script>

<template>
  <section id="scene-container"></section>
</template>

