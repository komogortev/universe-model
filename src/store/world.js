// store/world.js
import { ref, reactive, computed, toRefs } from "vue";
import { findObjectSection } from '../utils/helpers'

const state = reactive({
  solarSystemStore: {
    Sun: {
      nameId: 'Sun',
      scale: 3, // (110*Earth)
      radius: 700000, //
      orbital_period: 0.1,
      rotation_period: 27,
      emissive: 0xFFFF00,//@Todo causes issue with texture map load
      // color: 0xFF7910,
      textureMap: 'models/solar-system/textures/sun_map.jpg',
      children: {
        Mercury: {
          nameId: 'Mercury',
          distance: 0.4, //  [AU] (150,000,000 km; 93,000,000 mi)
          scale: 0.33, // times Earth's
          orbital_period: 87.97, // Earth's days (24hr)
          rotation_period: 175.94, // Earth's days (24hr)
          inclination: 0.3, // degrees to Sun equator
          radius: 2440, // (*km)
          mass: 0.055, // Earth's mass
          temperatures: { // Celsius
            day: 427,
            night: -173
          },
          athmosphere: 0, // times Earth's
          // color: 0xFF7910,
          textureMap: 'models/solar-system/textures/mercury_map.jpg'
        },
        Venus: {
          nameId: 'Venus',
          distance: 0.7,
          scale: 0.95,
          orbital_period: 224.7,
          rotation_period: 243,
          inclination: 3.86,
          radius: 6052,
          mass: 0.815,
          temperatures: {
            day: 464,
            night: 400
          },
          athmosphere: 90,
          // color: 0xDA8A17,
          textureMap: 'models/solar-system/textures/venus_map.jpg'
        },
        Earth: {
          nameId: 'Earth',
          distance: 1,
          scale: 1,
          orbital_period: 365,
          rotation_period: 1,
          inclination: 7.155,
          radius: 6371,
          mass: 1,
          temperatures: {
            day: 56.7,
            night: -89.2
          },
          athmosphere: 1,
          // color: 0x1397FF,
          textureMap: 'models/solar-system/textures/2k_earth_daymap.jpg',
          children: {
            Moon: {
              nameId: 'Moon',
              distance: 0.1,
              scale: 0.3,
              orbital_period: 28,
              rotation_period: 0,
              inclination: 5.145,
              radius: 1737.4,
              mass: 0.0123,
              // color: 0xFCF7AB,
              textureMap: 'models/solar-system/textures/moon_2k.jpg',
            }
          }
        },
        Mars: {
          nameId: 'Mars',
          distance: 1.5,
          scale: 0.5,
          orbital_period: 687,
          rotation_period: 1.02,
          inclination: 5.65,
          radius: 3396,
          mass: 0.107,
          temperatures: {
            day: -143,
            night: 35
          },
          athmosphere: 0.6,
          color: 0xCF400F,
          textureMap: 'models/solar-system/textures/mars_map_1k.jpg',
        },
        Jupiter: {
          nameId: 'Jupiter',
          distance: 5.2,
          scale: 11,
          orbital_period: 4380,
          rotation_period: 1.02,
          radius: 69911,
          mass: 318,
          // color: 0xE1DFDE,
          textureMap: 'models/solar-system/textures/jupiter_map.jpg',
          children: {
            Ganymede: {
              nameId: 'Ganymede',
              distance: .2,
              scale: 1,
              orbital_period: 7,
              rotation_period: 0,
              color: 0xF3F2F2
            }
          }
        },
        Saturn: {
          nameId: 'Saturn',
          distance: 9.5,
          scale: 9,
          orbital_period: 10767.5,
          rotation_period: 0.475,
          radius: 58232,
          mass: 95,
          // color: 0xF7F085,
          textureMap: 'models/solar-system/textures/saturn_map.jpg',
          children: {
            Titan: {
              nameId: 'Titan',
              distance: 0.8,
              scale: 1,
              orbital_period: 500,
              rotation_period: 0,
              color: 0xF1E17B
            },
            Enceladus: {
              nameId: 'Enceladus',
              distance: 1,
              scale: 1,
              orbital_period: 510,
              rotation_period: 0,
              color: 0xDADADA
            },
            Iapetus: {
              nameId: 'Iapetus',
              distance: 1.2,
              scale: 1,
              orbital_period: 520,
              rotation_period: 0,
              color: 0x506855
            },
            Rhea: {
              nameId: 'Rhea',
              distance: 1.4,
              scale: 1,
              orbital_period: 530,
              rotation_period: 0,
              color: 0xDADADA
            },
            Dione: {
              nameId: 'Dione',
              distance: 1.6,
              scale: 1,
              orbital_period: 540,
              rotation_period: 0,
              color: 0xDADADA
            },
            Tethys: {
              nameId: 'Tethys',
              distance: 1.8,
              scale: 1,
              orbital_period: 550,
              rotation_period: 0,
              color: 0xDADADA
            },
            Mimas: {
              nameId: 'Mimas',
              distance: 2,
              scale: 1,
              orbital_period: 560,
              rotation_period: 0,
              color: 0xDADADA
            },
          }
        },
        Uranus: {
          nameId: 'Uranus',
          distance: 19.2,
          scale: 4,
          orbital_period: 30660,
          rotation_period: 0.71832,
          radius: 25362,
          mass: 14,
          // color: 0x85E9F7,
          textureMap: 'models/solar-system/textures/uranus_map.jpg',
          children: {
            Titania: {
              nameId: 'Titania',
              distance: 0.8,
              scale: 1,
              orbital_period: 500,
              rotation_period: 0,
              color: 0xDADADA
            },
            Oberon: {
              nameId: 'Oberon',
              distance: 1,
              scale: 1,
              orbital_period: 510,
              rotation_period: 0,
              color: 0xF9D8F6
            },
            Umbriel: {
              nameId: 'Umbriel',
              distance: 1.2,
              scale: 1,
              orbital_period: 520,
              rotation_period: 0,
              color: 0xDADADA
            },
            Ariel: {
              nameId: 'Ariel',
              distance: 1.4,
              scale: 1,
              orbital_period: 530,
              rotation_period: 0,
              color: 0xDADADA
            },
            Miranda: {
              nameId: 'Miranda',
              distance: 1.6,
              scale: 1,
              orbital_period: 540,
              rotation_period: 0,
              color: 0xDADADA
            },
          }
        },
        Neptun: {
          nameId: 'Neptun',
          distance: 30.1,
          scale: 4,
          orbital_period: 60225,
          rotation_period: 0.67125,
          radius: 24622,
          mass: 17,
          // color: 0x173498,
          textureMap: 'models/solar-system/textures/neptune_map.jpg',
          children: {
            Triton: {
              nameId: 'Triton',
              distance: 0.8,
              scale: 1,
              orbital_period: 500,
              rotation_period: 0,
              color: 0xDAB0FF
            },
          }
        }
      }
    },
  },
  loading: true,

});

export default function useWorldStore() {

  const getPlanetoidInfo = ((nameId) => {
    return findObjectSection(state.solarSystemStore, nameId)
  })

  const setSolarState = (solar) => {
    state.solarSystemStore = solar
  }

  return {
    ...toRefs(state), // convert to refs when returning
    setSolarState,
    getPlanetoidInfo
  }
}