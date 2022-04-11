// store/world.js
import { ref, reactive, computed, toRefs } from "vue";

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
          cycle: 87.97, // Earth's days (24hr)
          scale: 0.33, // times Earth's
          rotation: 175.94, // Earth's days
          inclination: 0.3, // degrees to Sun equator
          radius: 2440, // (*km)
          mass: 0.055, // Earth's mass
          temperatures: { // Celsius
            day: 427,
            night: -173
          },
          athmosphere: 0, // times Earth's
          color: 0x888888
        },
        Venus: {
          nameId: 'Venus',
          distance: 0.7,
          cycle: 224.7,
          scale: 0.95,
          rotation: 243,
          inclination: 3.86,
          radius: 6052,
          mass: 0.815,
          temperatures: {
            day: 464,
            night: 400
          },
          athmosphere: 90,
          color: 0x888888
        },
        Earth: {
          nameId: 'Earth',
          distance: 1,
          cycle: 365,
          scale: 1,
          rotation: 1,
          inclination: 7.155,
          radius: 6371,
          mass: 1,
          temperatures: {
            day: 56.7,
            night: -89.2
          },
          athmosphere: 1,
          color: 0x2233FF,
          children: {
            Moon: {
              nameId: 'Moon',
              cycle: 28,
              inclination: 5.145,
              radius: 1737.4,
              mass: 0.0123,
              color: 0x888888
            }
          }
        },
        Mars: {
          nameId: 'Mars',
          distance: 1.5,
          cycle: 687,
          scale: 0.5,
          rotation: 1.02,
          inclination: 5.65,
          radius: 3396,
          mass: 0.107,
          temperatures: {
            day: -143,
            night: 35
          },
          athmosphere: 0.6,
          color: 0x888888
        },
        Jupiter: {
          nameId: 'Jupiter',
          distance: 5.2,
          scale: 11,
          cycle: 4380,
          radius: 69911,
          mass: 318,
          children: {
            Ganymede: {
              nameId: 'Titan',
              cycle: 7,
            }
          }
        },
        Saturn: {
          nameId: 'Saturn',
          distance: 9.5,
          cycle: 10767.5,
          scale: 9,
          radius: 58232,
          mass: 95,
          children: {
            Titan: { nameId: 'Titan' },
            Enceladus: { nameId: 'Enceladus' },
            Iapetus: { nameId: 'Iapetus' },
            Rhea: { nameId: 'Rhea' },
            Dione: { nameId: 'Dione' },
            Tethys: { nameId: 'Tethys' },
            Mimas: { nameId: 'Mimas' },
          }
        },
        Uranus: {
          nameId: 'Uranus',
          distance: 19.2,
          cycle: 30660,
          scale: 4,
          radius: 25362,
          mass: 14,
          children: {
            Titania: { nameId: 'Titania' },
            Oberon: { nameId: 'Oberon' },
            Umbriel: { nameId: 'Umbriel' },
            Ariel: { nameId: 'Ariel' },
            Miranda: { nameId: 'Miranda' },
          }
        },
        Neptun: {
          nameId: 'Neptun',
          distance: 30.1,
          cycle: 60225,
          scale: 4,
          radius: 24622,
          mass: 17,
          children: {
            Triton: { nameId: 'Triton' },
          }
        }
      }
    },
  },
  loading: true,
});

export default function useWorldStore() {

  const setSolarState = (solar) => {
    state.solarSystem = solar
  }

  return {
    ...toRefs(state), // convert to refs when returning
    setSolarState
  }
}