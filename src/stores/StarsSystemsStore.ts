// store/world.js
import { reactive, toRefs } from "vue";
import { IStarSystemsConfig, IPlanetoid } from "../types/StarsStoreTypes";
/**
 * 1. [AU] (150,000,000 km; 93,000,000 mi)
 * 2. "orbital_period" (also revolution period) is the amount of time a given
 *      astronomical object takes to complete one orbit around another object.
 * 3. "rotation_period" (or synodic day, or solar day) is the period
 *      for a celestial object to rotate once in relation to the star it is
 *      orbiting, and is the basis of solar time. (full day)
 * 4. POI - Cartesian coordinates may be retrieved from spherical
 *      coords (radius, inclination, azimuth)
 *      x = R cos() sin()
 *      y = R sin() sin()
 *      z = R cos()
 */
const _sunDownScale = 0.01
const _MoonDistanceUpScale = 10

const state = reactive<IStarSystemsConfig>({
  StarSystemsConfig: {
    SolarSystem: <IPlanetoid>{
      nameId: 'Sun',
      type: 'star',
      radius:   { AU: 0.0046 * _sunDownScale, km: 700000 }, // additionally scale down Sun against other planets
      distance: { AU: 0 },
      rotation_period: { days: 27 },
      tilt: 0,
      emissive: 0xFFFF00,
      emissiveMap: 'models/solar-system/textures/sun/2k_sun.jpg',
      emissiveIntensity: 100000,
      BG_MAP: '/models/solar-system/textures/8k_stars_milky_way.jpg',
      children: [
        {
          nameId: 'Mercury',
          type: 'planet',
          radius:   { AU: 0.00001626, km: 2440 },
          distance: { AU: 0.4 },
          orbital_period: { days: 87.97 },
          rotation_period: { days: 175.94 },
          tilt: 0.3,
          color: 0xA6ACAF,
          map: 'models/solar-system/textures/mercury/mercury_2k.jpg',
          bumpMap: 'models/solar-system/textures/mercury/mercury_bump.jpg',
          bumpScale: 0.0125,
        },
        {
          nameId: 'Venus',
          type: 'planet',
          radius: { AU: 0.000040346, km: 6052 },
          distance: { AU: 0.7 },
          orbital_period:  { days: 224.7 },
          rotation_period: { days: 243 },
          tilt: 3.86,
          color: 0xE67E22,
          map: 'models/solar-system/textures/venus/2k_venus_surface.jpg',
          displacementMap: 'models/solar-system/textures/venus/venus_bump.jpg',
          displacementScale: 0.025,
          bumpMap: 'models/solar-system/textures/venus/venus_bump.jpg',
          bumpScale: 0.125,
          athmosphereMap: 'models/solar-system/textures/venus/2k_venus_atmosphere.jpg',
          athmosphereOpacity: 0.3,
          athmosphereDepth: 0.04,
        },
        {
          nameId: 'Earth',
          type: 'planet',
          radius:   { AU: 0.000042473, km: 6371 },
          distance: { AU: 1 },
          orbital_period:  { days: 365 },
          rotation_period: { days: 1 },
          tilt: 0.41,
          color: 0xEBF5FB,
          map: 'models/solar-system/textures/earth/earth_daymap_8k.jpg',
          displacementMap: 'models/solar-system/textures/earth/earth_bump_8k.jpg',
          displacementScale: 0.15,
          bumpMap: 'models/solar-system/textures/earth/EarthNormal.png',
          bumpScale: 0.125,
          //specularMap: 'models/solar-system/textures/earth/EarthSpec.png',
          shininess: 0.5,
          athmosphereMap: 'models/solar-system/textures/earth/8k_earth_clouds.jpg',
          athmosphereOpacity: 0.25,
          athmosphereDepth: 0.18,
          children: [
            {
              nameId: 'Moon',
              type: 'moon',
              radius:   { AU: 0.0000115826, km: 1737.4 },
              distance: { AU: 0.00257 *_MoonDistanceUpScale, km: 385000 }, //0.00257, 385000
              orbital_period:  { days: 28 },
              rotation_period: null,
              tilt: 5.145,
              color: 0xFEF9E7,
              map: 'models/solar-system/textures/earth/moons/moon_2k.jpg',
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
          radius:   { AU: 0.00002264, km: 3396 },
          distance: { AU: 1.5 },
          orbital_period:  { days: 687 },
          rotation_period: { days: 1.02 },
          tilt: 5.65,
          color: 0x943126,
          map: 'models/solar-system/textures/mars/2k_mars.jpg',
          bumpMap: 'models/solar-system/textures/mars/1k_mars_bump.jpg',
          bumpScale: 0.5,
        },
        {
          nameId: 'Jupiter',
          type: 'planet',
          radius:   { AU: 0.000466073, km: 69911 },
          distance: { AU: 5.2 },
          orbital_period:  { days: 4380 },
          rotation_period: { days: 0.413575 },
          color: 0xFAE5D3,
          map: 'models/solar-system/textures/jupiter/2k_jupiter.jpg',
          children: [
            {
              nameId: 'Ganymede',
              type: 'moon',
              radius:   { AU: 0.0000175606, km: 2634.1 },
              distance: { AU: 0.007152508221 *_MoonDistanceUpScale },
              orbital_period:  { days: 7.16 },
              rotation_period: { days: 0 },
              tilt: 0.33,
              color: 0xFAE5D3,
              map: 'models/solar-system/textures/jupiter/moons/Ganymede-blinn.jpg',
            }
          ]
        },
        {
          nameId: 'Saturn',
          type: 'planet',
          radius:   { AU: 0.000388213, km: 58232 },
          distance: { AU: 9.5 },
          orbital_period:  { days: 10757.7365 },
          rotation_period: { days: 0.43416 },
          tilt: 26.73,
          color: 0xFAE5D3,
          map: 'models/solar-system/textures/2k_saturn.jpg',
          children: [
            {
              nameId: 'Titan',
              type: 'moon',
              radius:   { AU: 0.00001716486, km: 2574.73 },
              distance: { AU: 0.008021504547 *_MoonDistanceUpScale },
              orbital_period:  { days: 15.945 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xF1E17B
            },
            {
              nameId: 'Enceladus',
              type: 'moon',
              radius:   { AU: 0.0000016806, km: 252.1 },
              distance: { AU: 0.00159106543 *_MoonDistanceUpScale},
              orbital_period:  { days: 1.375 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xDADADA
            },
            {
              nameId: 'Iapetus',
              type: 'moon',
              radius:   { AU: 0.000004896, km: 734.5 },
              distance: { AU: 0.02380381474 *_MoonDistanceUpScale },
              orbital_period:  { days: 79 },
              rotation_period: { days: 0},
              tilt: 0,
              color: 0x506855
            },
            {
              nameId: 'Rhea',
              type: 'moon',
              radius:   { AU: 0.000005092, km: 763.8 },
              distance: { AU: 0.00352277741 *_MoonDistanceUpScale },
              orbital_period:  { days: 4.5 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xDADADA
            },
            {
              nameId: 'Dione',
              type: 'moon',
              radius:   { AU: 0.0000037426, km: 561.4 },
              distance: { AU: 0.00252276318 *_MoonDistanceUpScale },
              orbital_period:  { days: 2.75 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xDADADA
            },
            {
              nameId: 'Tethys',
              type: 'moon',
              radius:   { AU: 0.00000354, km: 531 },
              distance: { AU: 0.0019719532 *_MoonDistanceUpScale },
              orbital_period:  { days: 1.875 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xDADADA
            },
            {
              nameId: 'Mimas',
              type: 'moon',
              radius:   { AU: 0.0000013213, km: 198.2 },
              distance: { AU: 0.0012433332 *_MoonDistanceUpScale },
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
          radius:   { AU: 0.00016908, km: 25362 },
          distance: { AU: 19.2 },
          orbital_period:  { days: 30660 },
          rotation_period: { days: 0.71832 },
          tilt: 97.77,
          color: 0x2E86C1,
          map: 'models/solar-system/textures/2k_uranus.jpg',
          children: [
            {
              nameId: 'Titania',
              type: 'moon',
              radius:   { AU: 0.000005256, km: 788.4 },
              distance: { AU: 0.00291648536 *_MoonDistanceUpScale },
              orbital_period:  { days: 8.7 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xDADADA
            },
            {
              nameId: 'Oberon',
              type: 'moon',
              radius:   { AU: 0.000005076, km: 761.4 },
              distance: { AU: 0.00390045659 *_MoonDistanceUpScale },
              orbital_period:  { days: 13 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xF9D8F6
            },
            {
              nameId: 'Umbriel',
              type: 'moon',
              radius:   { AU: 0.000003898, km: 584.7 },
              distance: { AU: 0.00177810017 *_MoonDistanceUpScale },
              orbital_period:  { days: 4.125 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xDADADA
            },
            {
              nameId: 'Ariel',
              type: 'moon',
              radius:   { AU: 0.0000038593, km: 578.9 },
              distance: { AU: 0.00127608768 *_MoonDistanceUpScale },
              orbital_period:  { days: 2.5 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xDADADA
            },
            {
              nameId: 'Miranda',
              type: 'moon',
              radius:   { AU: 0.000001572, km: 235.8 },
              distance: { AU: 0.000868327867 *_MoonDistanceUpScale },
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
          radius:   { AU: 0.000164146, km: 24622 },
          distance: { AU: 30.1 },
          orbital_period:  { days: 60193.2 },
          rotation_period: { days: 0.67083 },
          tilt: 28.32,
          color: 0x154360,
          map: 'models/solar-system/textures/2k_neptune.jpg',
          children: [
            {
              nameId: 'Triton',
              type: 'moon',
              radius:   { AU: 0.0000090226, km: 1353.4 },
              distance: { AU: 0.002371417443 *_MoonDistanceUpScale },
              orbital_period:  { days: 5.875 },
              rotation_period: { days: 0 },
              tilt: 0,
              color: 0xDAB0FF
            },
          ]
        }
      ]
    },
  }
});

export default function useStarSystemsStore() {
  const getStarSystemsConfig = (() => state.StarSystemsConfig );

  const getStarSystemConfigByName = ((name: string) => ({
    ...state.StarSystemsConfig[name as keyof IStarSystemsConfig]
  }))

  return {
    ...toRefs(state), // convert to refs when returning
    getStarSystemsConfig,
    getStarSystemConfigByName
  }
}