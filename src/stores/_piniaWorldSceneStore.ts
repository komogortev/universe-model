//Pinia Store
import { defineStore } from 'pinia'

export const useWorldSceneStore = defineStore('WorldSceneStore', {
  state: () => ({
    starSystems: {
      Solar: {
          nameId: 'Sun',
          type: 'star',
          radius:   { km: 700000 * 0.1 }, // multiply by additional scale down
          distance: { AU: 0 },
          orbital_period:  { days: 0 },
          rotation_period: { days: 27 },
          tilt: 0,
          emissive: 0xFFFF00,
          emissiveMap: 'models/solar-system/textures/sun/2k_sun.jpg',
          emissiveIntensity: 10,
          children: [
            {
              nameId: 'Mercury',
              type: 'planet',
              radius:   { km: 2440 },
              distance: { AU: 0.4 },
              orbital_period: { days: 87.97 },
              rotation_period: { days: 175.94 },
              tilt: 0.3,
              emissive: 0xA6ACAF,
              emissiveMap: 'models/solar-system/textures/mercury/mercury_2k.jpg',
              emissiveIntensity: .5,
              bumpMap: 'models/solar-system/textures/mercury/mercury_bump.jpg',
              bumpScale: 0.0125,
            },
            {
              nameId: 'Venus',
              type: 'planet',
              radius: { km: 6052 },
              distance: { AU: 0.7 },
              orbital_period:  { days: 224.7 },
              rotation_period: { days: 243 },
              tilt: 3.86,
              emissive: 0xE67E22,
              emissiveMap: 'models/solar-system/textures/venus/2k_venus_surface.jpg',
              emissiveIntensity: .25,
              displacementMap: 'models/solar-system/textures/venus/venus_bump.jpg',
              displacementScale: 0.025,
              bumpMap: 'models/solar-system/textures/venus/venus_bump.jpg',
              bumpScale: 0.125,
              athmosphereMap: 'models/solar-system/textures/venus/2k_venus_atmosphere.jpg',
              athmosphereOpacity: 0.3,
              athmosphereDepth: 0.43,
            },
            {
              nameId: 'Earth',
              type: 'planet',
              radius:   { km: 6371 },
              distance: { AU: 1 },
              orbital_period:  { days: 365 },
              rotation_period: { days: 1 },
              tilt: 0.41,
              // textureMap: 'models/solar-system/textures/earth/earth_daymap_8k.jpg',
              emissive: 0xEBF5FB,
              emissiveMap: 'models/solar-system/textures/earth/earth_daymap_8k.jpg',
              emissiveIntensity: .125,
              displacementMap: 'models/solar-system/textures/earth/earth_bump_8k.jpg',
              displacementScale: 0.15,
              bumpMap: 'models/solar-system/textures/earth/EarthNormal.png',
              bumpScale: 0.125,
              specularMap: 'models/solar-system/textures/earth/EarthSpec.png',
              shininess: 0.5,
              athmosphereMap: 'models/solar-system/textures/earth/8k_earth_clouds.jpg',
              athmosphereOpacity: 0.5,
              athmosphereDepth: 0.425,
              children: [
                {
                  nameId: 'Moon',
                  type: 'moon',
                  radius:   { km: 1737.4 },
                  distance: { AU: 0.00257 * 8, km: 385000 }, //0.00257, 385000
                  orbital_period:  { days: 28 },
                  rotation_period: { days: 0 },
                  tilt: 5.145,
                  emissive: 0xFEF9E7,
                  emissiveMap: 'models/solar-system/textures/earth/moons/moon_2k.jpg',
                  emissiveIntensity: .00125,
                }
              ],
              POI: [
                {
                  name: 'Montreal',
                  lat: 45.5017,
                  lng: -73.5673,
                },
                {
                  name: 'Toronto',
                  lat: 43.6532,
                  lng: -79.3832,
                },
                {
                  name: 'Los-Angeles',
                  lat: 34.0522,
                  lng: -118.2437,
                },
                {
                  name: 'Chisinau',
                  lat: 47.0105,
                  lng: 28.8638,
                },
                {
                  name: 'Kiev',
                  lat: 50.4501,
                  lng: 30.5234,
                }
              ]
            },
            {
              nameId: 'Mars',
              type: 'planet',
              radius:   { km: 3396 },
              distance: { AU: 1.5 },
              orbital_period:  { days: 687 },
              rotation_period: { days: 1.02 },
              tilt: 5.65,
              emissive: 0x943126,
              emissiveMap: 'models/solar-system/textures/mars/2k_mars.jpg',
              emissiveIntensity: .000125,
              bumpMap: 'models/solar-system/textures/mars/1k_mars_bump.jpg',
              bumpScale: 0.5,
            },
            {
              nameId: 'Jupiter',
              type: 'planet',
              radius:   { km: 69911 },
              distance: { AU: 5.2 },
              orbital_period:  { days: 4380 },
              rotation_period: { days: 0.413575 },
              emissive: 0xFAE5D3,
              emissiveMap: 'models/solar-system/textures/jupiter/2k_jupiter.jpg',
              emissiveIntensity: .015,
              children: [
                {
                  nameId: 'Ganymede',
                  type: 'moon',
                  radius:   { km: 2634.1 },
                  distance: { AU: 0.007152508221 * 4 },
                  orbital_period:  { days: 7.16 },
                  rotation_period: { days: 0 },
                  tilt: 0.33,
                  emissive: 0xFAE5D3,
                  emissiveMap: 'models/solar-system/textures/jupiter/moons/Ganymede-blinn.jpg',
                  emissiveIntensity: .015,
                }
              ]
            },
            {
              nameId: 'Saturn',
              type: 'planet',
              radius:   { km: 58232 },
              distance: { AU: 9.5 },
              orbital_period:  { days: 29 * 365 },
              rotation_period: { days: 0.43416 },
              tilt: 26.73,
              textureMap: '',
              emissive: 0xFAE5D3,
              emissiveMap: 'models/solar-system/textures/2k_saturn.jpg',
              emissiveIntensity: 0.001,
              children: [
                {
                  nameId: 'Titan',
                  type: 'moon',
                  radius:   { km: 2574.73 },
                  distance: { AU: 0.008021504547 },
                  orbital_period:  { days: 15.945 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xF1E17B
                },
                {
                  nameId: 'Enceladus',
                  type: 'moon',
                  radius:   { km: 252.1 },
                  distance: { AU: 0.00159106543},
                  orbital_period:  { days: 1.375 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDADADA
                },
                {
                  nameId: 'Iapetus',
                  radius:   { km: 734.5 },
                  distance: { AU: 0.02380381474 },
                  orbital_period:  { days: 79 },
                  rotation_period: { days: 0},
                  tilt: 0,
                  color: 0x506855
                },
                {
                  nameId: 'Rhea',
                  type: 'moon',
                  radius:   { km: 763.8 },
                  distance: { AU: 0.00352277741 },
                  orbital_period:  { days: 4.5 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDADADA
                },
                {
                  nameId: 'Dione',
                  type: 'moon',
                  radius:   { km: 561.4 },
                  distance: { AU: 0.00252276318 },
                  orbital_period:  { days: 2.75 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDADADA
                },
                {
                  nameId: 'Tethys',
                  type: 'moon',
                  radius:   { km: 531 },
                  distance: { AU: 0.0019719532 },
                  orbital_period:  { days: 1.875 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDADADA
                },
                {
                  nameId: 'Mimas',
                  type: 'moon',
                  radius:   { km: 198.2 },
                  distance: { AU: 0.0012433332 },
                  orbital_period:  { days: 0.96 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDADADA
                },
              ]
            },
            {
              nameId: 'Uranus',
              type: 'planet',
              radius:   { km: 25362 },
              distance: { AU: 19.2 },
              orbital_period:  { days: 30660 },
              rotation_period: { days: 0.71832 },
              tilt: 97.77,
              emissive: 0x2E86C1,
              emissiveMap: 'models/solar-system/textures/2k_uranus.jpg',
              emissiveIntensity: 0.001,
              children: [
                {
                  nameId: 'Titania',
                  type: 'moon',
                  radius:   { km: 788.4 },
                  distance: { AU: 0.00291648536 },
                  orbital_period:  { days: 8.7 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDADADA
                },
                {
                  nameId: 'Oberon',
                  type: 'moon',
                  radius:   { km: 761.4 },
                  distance: { AU: 0.00390045659 },
                  orbital_period:  { days: 13 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xF9D8F6
                },
                {
                  nameId: 'Umbriel',
                  type: 'moon',
                  radius:   { km: 584.7 },
                  distance: { AU: 0.00177810017 },
                  orbital_period:  { days: 4.125 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDADADA
                },
                {
                  nameId: 'Ariel',
                  type: 'moon',
                  radius:   { km: 578.9 },
                  distance: { AU: 0.00127608768 },
                  orbital_period:  { days: 2.5 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDADADA
                },
                {
                  nameId: 'Miranda',
                  type: 'moon',
                  radius:   { km: 235.8 },
                  distance: { AU: 0.000868327867 },
                  orbital_period:  { days: 1.413479 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDADADA
                },
              ]
            },
            {
              nameId: 'Neptun',
              type: 'planet',
              radius:   { km: 24622 },
              distance: { AU: 30.1 },
              orbital_period:  { days: 165 * 365 },
              rotation_period: { days: 0.67083 },
              tilt: 28.32,
              emissive: 0x154360,
              emissiveMap: 'models/solar-system/textures/2k_neptune.jpg',
              emissiveIntensity: 0.001,
              children: [
                {
                  nameId: 'Triton',
                  type: 'moon',
                  radius:   { km: 1353.4 },
                  distance: { AU: 0.002371417443 },
                  orbital_period:  { days: 5.875 },
                  rotation_period: { days: 0 },
                  tilt: 0,
                  color: 0xDAB0FF
                },
              ]
            }
          ]
      }
    },
    settings: {
      timeSpeed: 1,
      size_scaling: {
        multiplier: 0.0001
      },
      distance_scaling: {
        divider: 1000000
      },
    },
  }),
  getters: {
    getSolarSystemConfig: (state) => state.starSystems.Solar,
    getSceneSettingsConfig: (state) => state.settings,
  },
  actions: {
    getPlanetoidConfigByName (nameId: string) {
      return _findObjectSection(this.starSystems.Solar, nameId)
    },
  }
})

function _findObjectSection(object: any, sectionKey: string): any {
  let result = null

  for (const key of Object.keys(object)) {
    if (key === sectionKey) {
      result = object[key]
      break
    } else if (!result && object[key].children) {
      result = _findObjectSection(object[key].children, sectionKey)
    }
  }

  return JSON.parse(JSON.stringify(result))
}