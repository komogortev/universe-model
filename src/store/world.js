// store/world.js
import { ref, reactive, computed, toRefs } from "vue";
import { findObjectSection } from '../utils/helpers'

const state = reactive({
  solarSystem: {
    Sun: {
      nameId: 'Sun',
      scale: 5, // (110*Earth)
      radius: 700000, //
      emissive: 0xFFFF00,
      children: {
        Mercury: {
          nameId: 'Mercury',
          distance: 0.4, //  [AU] (150,000,000 km; 93,000,000 mi)
          scale: 0.33, // times Earth's
          cycle: 87.97, // Earth's days (24hr)
          rotation: 175.94, // Earth's days
          inclination: 0.3, // degrees to Sun equator
          radius: 2440, // (*km)
          mass: 0.055, // Earth's mass
          temperatures: { // Celsius
            day: 427,
            night: -173
          },
          athmosphere: 0, // times Earth's
          color: 0xFF7910
        },
        Venus: {
          nameId: 'Venus',
          distance: 0.7,
          scale: 0.95,
          cycle: 224.7,
          rotation: 243,
          inclination: 3.86,
          radius: 6052,
          mass: 0.815,
          temperatures: {
            day: 464,
            night: 400
          },
          athmosphere: 90,
          color: 0xDA8A17
        },
        Earth: {
          nameId: 'Earth',
          distance: 1,
          scale: 1,
          cycle: 365,
          rotation: 1,
          inclination: 7.155,
          radius: 6371,
          mass: 1,
          temperatures: {
            day: 56.7,
            night: -89.2
          },
          athmosphere: 1,
          color: 0x1397FF,
          children: {
            Moon: {
              nameId: 'Moon',
              distance: 0.1,
              scale: 0.3,
              cycle: 28,
              inclination: 5.145,
              radius: 1737.4,
              mass: 0.0123,
              color: 0xFCF7AB
            }
          }
        },
        Mars: {
          nameId: 'Mars',
          distance: 1.5,
          scale: 0.5,
          cycle: 687,
          rotation: 1.02,
          inclination: 5.65,
          radius: 3396,
          mass: 0.107,
          temperatures: {
            day: -143,
            night: 35
          },
          athmosphere: 0.6,
          color: 0xCF400F
        },
        Jupiter: {
          nameId: 'Jupiter',
          distance: 5.2,
          scale: 11,
          cycle: 4380,
          radius: 69911,
          mass: 318,
          color: 0xE1DFDE,
          children: {
            Ganymede: {
              nameId: 'Ganymede',
              distance: .2,
              scale: 1,
              cycle: 7,
              color: 0xF3F2F2
            }
          }
        },
        Saturn: {
          nameId: 'Saturn',
          distance: 9.5,
          scale: 9,
          cycle: 10767.5,
          radius: 58232,
          mass: 95,
          color: 0xE6FC81,
          children: {
            Titan: {
              nameId: 'Titan',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2
            },
            Enceladus: {
              nameId: 'Enceladus',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2
            },
            Iapetus: {
              nameId: 'Iapetus',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2
            },
            Rhea: {
              nameId: 'Rhea',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2
            },
            Dione: {
              nameId: 'Dione',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2 },
            Tethys: {
              nameId: 'Tethys',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2 },
            Mimas: {
              nameId: 'Mimas',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2 },
          }
        },
        Uranus: {
          nameId: 'Uranus',
          distance: 19.2,
          cycle: 30660,
          scale: 4,
          radius: 25362,
          mass: 14,
          color: 0xF3F2F2,
          children: {
            Titania: {
              nameId: 'Titania',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2 },
            Oberon: {
              nameId: 'Oberon',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2 },
            Umbriel: {
              nameId: 'Umbriel',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2 },
            Ariel: {
              nameId: 'Ariel',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2 },
            Miranda: {
              nameId: 'Miranda',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2 },
          }
        },
        Neptun: {
          nameId: 'Neptun',
          distance: 30.1,
          cycle: 60225,
          scale: 4,
          radius: 24622,
          mass: 17,
          color: 0xF3F2F2,
          children: {
            Triton: {
              nameId: 'Triton',
              distance: 1,
              scale: 1,
              color: 0xF3F2F2 },
          }
        }
      }
    },
  },
  loading: true,
});

export default function useWorldStore() {

  const getPlanetoidInfo = ((nameId) => {
    return findObjectSection(state.solarSystem, nameId)
  })

  const setSolarState = (solar) => {
    state.solarSystem = solar
  }

  return {
    ...toRefs(state), // convert to refs when returning
    setSolarState,
    getPlanetoidInfo
  }
}