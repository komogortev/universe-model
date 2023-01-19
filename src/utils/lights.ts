import {
  DirectionalLight,
  PointLight,
  RectAreaLight,
  AmbientLight,
  SpotLight,
  HemisphereLight
} from 'three';
/**
 * Two ways to light the objects:
 * 1. Direct lighting: light rays that come directly from the bulb and hit an object.
 * 2. Indirect lighting: light rays that have bounced off the walls and other objects in the room before hitting an object, changing color, and losing intensity with each bounce.
 * Matching these, the light classes in three.js are split into two types:
 * a. Direct lights, which simulate direct lighting.
 * b. Ambient lights, which are a cheap and somewhat believable way of faking indirect lighting.
 */

/**
 * DirectionalLight => Sunlight
 * @param { String } color
 * @param { Number } intensity
 * @returns { Object } light
 */
function createDirectionalLight(color = 'white', intensity = 8) {
  // Create a directional light
  const light = new DirectionalLight(color, intensity);
  // move the light right, up, and towards us
  light.position.set(10, 10, 10);
  return light;
}

/**
 * PointLight => Light Bulbs
* @param { String } color
 * @param { Number } intensity
 * @returns { Object } light
 */
function createPointLight(color = 0xFFFFFF, intensity = 1) {
  const pointLight = new PointLight(color, intensity)
  return pointLight;
}

/**
 * RectAreaLight => Strip lighting or bright windows
 * @param { String } color
 * @param { Number } intensity
 * @returns { Object } light
 */
function createRectAreaLight(color = 0xffffff, intensity = .25) {
  const areaLight = new RectAreaLight(color, intensity)
  return areaLight;
}

/**
 * SpotLight => Spotlights
 * @param { String } color
 * @param { Number } intensity
 * @returns { Object } light
 */
function createSpotLight(color = 0xFFFFFF) {
  const distance = 50.0;
  const angle = Math.PI / 4.0;
  const penumbra = 0.5;
  const decay = 1.0;

  let spotLight = new SpotLight(
    color, 100.0, distance, angle, penumbra, decay);
  spotLight.castShadow = true;
  spotLight.shadow.bias = -0.00001;
  spotLight.shadow.mapSize.width = 4096;
  spotLight.shadow.mapSize.height = 4096;
  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 100;
  spotLight.position.set(25, 25, 0);
  spotLight.lookAt(0, 0, 0);
  return spotLight;
}

function createAmbientLight(color = 0xffffff, intensity = .25) {
  const ambientLight = new AmbientLight(color, intensity)
  return ambientLight;
}

function createHemisphereLight(upColour = 0xFFFF80, downColour = 0x808080) {
  const hemisphereLight = new HemisphereLight(upColour, downColour, 0.5);
  hemisphereLight.color.setHSL(0.6, 1, 0.6);
  hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
  hemisphereLight.position.set(0, 4, 0);
  return hemisphereLight;
}

export {
  createDirectionalLight,
  createPointLight,
  createRectAreaLight,
  createSpotLight,
  createAmbientLight,
  createHemisphereLight
};
