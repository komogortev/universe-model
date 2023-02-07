import { THREE } from './three-defs';
import { entity } from '../constructors/Entity';
import { math } from './math';
import { AxesHelper, Color, GridHelper, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, PointLight, PointLightHelper, SphereGeometry, TextureLoader, Vector3 } from 'three';
import useWorldSettingsStore from "../stores/WorldSettingsStore";
import { calcPosFromLatLngRad, convertRotationPerDayToRadians } from '../utils/helpers';
import { render_component } from './render-component';
const { worldSettings } = useWorldSettingsStore();

export const planetoid_controller = (() => {

  const _SHIELD_VS = `
  varying vec3 vNormal;
  varying vec3 vNoiseCoords;
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec3 worldNormal = normalize(
        mat3(modelMatrix[0].xyz,
             modelMatrix[1].xyz,
             modelMatrix[2].xyz) * normal);
    vNormal = worldNormal;

    vec3 noiseCoords = normalize(
        mat3(modelMatrix[0].xyz,
             modelMatrix[1].xyz,
             modelMatrix[2].xyz) * (normal * vec3(0.5, 1.0, 1.0)));
    vNoiseCoords = noiseCoords;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;


  const _SHIELD_FS = `
  varying vec3 vNormal;
  varying vec3 vNoiseCoords;
  varying vec3 vWorldPosition;
  uniform float time;
  uniform float visibility;

  // Taken from https://www.shadertoy.com/view/4sfGzS
  float hash(vec3 p)  // replace this by something better
  {
    p  = fract( p*0.3183099+.1 );
    p *= 17.0;
    return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
  }

  float noise( in vec3 x )
  {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);

    return mix(mix(mix( hash(i+vec3(0,0,0)),
                        hash(i+vec3(1,0,0)),f.x),
                   mix( hash(i+vec3(0,1,0)),
                        hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix( hash(i+vec3(0,0,1)),
                        hash(i+vec3(1,0,1)),f.x),
                   mix( hash(i+vec3(0,1,1)),
                        hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }

  float FBM(vec3 p, int octaves) {
    float w = length(fwidth(p));
    float G = pow(2.0, -1.0);
    float amplitude = 1.0;
    float frequency = 1.0;
    float lacunarity = 2.0;
    float normalization = 0.0;
    float total = 0.0;

    for (int i = 0; i < octaves; ++i) {
      float noiseValue = noise(p * frequency);

      noiseValue = abs(noiseValue);
      // noiseValue *= noiseValue;

      total += noiseValue * amplitude;
      normalization += amplitude;
      amplitude *= G;
      frequency *= lacunarity;
    }

    // total = total * 0.5 + 0.5;
    // total = pow(total, 1.0);

    return total;
  }

  vec2  hash2( vec2  p ) { p = vec2( dot(p,vec2(117.13,313.74)), dot(p,vec2(269.5,183.3)) ); return fract(sin(p)*43758.5453); }

  // The parameter w controls the smoothness
  float voronoi( in vec3 coords)
  {
    vec2 x = coords.xy;
    float w = 0.0;
      vec2 n = floor( x );
      vec2 f = fract( x );

    vec4 m = vec4( 8.0, 0.0, 0.0, 0.0 );
      for( int j=-2; j<=2; j++ )
      for( int i=-2; i<=2; i++ )
      {
          vec2 g = vec2( float(i),float(j) );
          // vec2 o = hash2( n + g );
          vec3 ng = vec3(n + g, coords.z);
          vec2 o = vec2(
              noise(ng + vec3(217.3, 325.3, 0.0)),
              noise(ng));

          // distance to cell
      float d = length(g - f + o);
      d = pow(d, 1.25);

      float h = smoothstep( 0.0, 1.0, 0.5 + 0.5*(m.x-d)/w );

        m.x   = mix( m.x,     d, h ) - h*(1.0-h)*w/(1.0+3.0*w); // distance
      }

    return clamp(m.x, 0.0, 1.0);
  }

  void main() {
    vec3 norm = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = clamp(dot(viewDirection, norm), 0.0, 1.0);
    fresnel = 1.0 - fresnel;
    fresnel *= fresnel;
    fresnel = smoothstep(0.0, 1.0, fresnel);

    float fbm1 = FBM(vNoiseCoords * 5.0, 8);
    float fbm2 = FBM(vNoiseCoords * 5.0 + vec3(fbm1 + time * 2.0), 8);

    fbm2 = clamp(fbm2, 0.0, 1.0) * 2.0 - 1.0;
    fbm2 = (1.0 - abs(fbm2)) * 0.5 + 0.75 * fbm1;
    // float n2 = voronoi(vNoiseCoords * 5.0);
    vec3 col = vec3(0.25, 0.25, 0.75) * (fbm2) * fresnel;

    // float edgeGlow = fresnel * fresnel;
    // edgeGlow *= edgeGlow;
    // edgeGlow *= 0.5;
    // col += vec3(edgeGlow);

    gl_FragColor = vec4(col * visibility, 1.0);
  }`;

  function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  function easeOutBounce(x: number) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  }

  class PlanetoidController extends entity.Component {
    group_: any;
    params_: any;
    planetoid_: any;
    updatables_: Array<any>;

    constructor(params: any) {
      super();
      this.params_ = params;
      this.updatables_ = [];
    }

    InitEntity() {
      // get access to renderer three group to attach Meshes directly
      this.group_ = this.GetComponent('RenderComponent').group_;
      const cfg = this.params_.data;
      this.group_.name = cfg.nameId + 'Group';

      // attempts of optimization, borrow geometry, share with all children moons
      const sphereGeo =  this.params_.geometry;
      const sphereMat = this._generateMaterial(cfg);

      const originalPlanetoidMesh = this.InitPlanetoidMesh(cfg, sphereGeo, sphereMat);
      // Attach to root controller three group (which is always SunGroup)
      //this.group_.add(entityPlanetoid);

      // Check for moons to genereate
      if (cfg.children != null) {
        // Woohoo! Got moons to generate
        cfg.children.forEach((childConfig: any) => {
          // limit search to moon typed children in case we got full planetoid n stars
          // (sun & planet are parent Entity attached to the scene)
          if (!['star','planet'].includes(childConfig.type)) {
            const m = this.InitMoonMeshGroup({
              cfg: childConfig,
              geometry: sphereGeo,
              parentScale: cfg.radius.AU
            });
            this.updatables_.push(m);
            originalPlanetoidMesh.add(m)
          }
        })
      }

      // attach resulting planetoid with moons
      this.group_.add(originalPlanetoidMesh);
      console.log('_attach Mesh to three Group', this.group_)
    }

    InitPlanetoidMesh(cfg: any, sphereGeo: any, sphereMat: any) {
      const planetoid_ = new THREE.Mesh(sphereGeo, sphereMat);
      planetoid_.name = `${cfg.nameId} Mesh`

      // Inject Light for stars
      if (cfg.emissive != null) {
        planetoid_.add(this._createLight());
      }

      planetoid_.rotation.y = cfg.tilt

      if (['star','planet'].includes(cfg.type)) {
        // default planetoid mesh scale as Scene_ units multiplied by Scene scale settings
        planetoid_.scale.multiplyScalar(
          (parseFloat(cfg.radius.AU as string)) * (worldSettings.value.planetoidScale as number)
        )
      } else {
        // derive moon scale by dividing parent scale to moon scale
        const moonScaleRelativeToParent = parseFloat(cfg.radius.AU as string) / 4
        // Moon scale should be declared or transformed into local scale value relative to parent
        planetoid_.scale.multiplyScalar(
          moonScaleRelativeToParent * (worldSettings.value.planetoidScale as number)
          )
      }

      // Set planetoid distance from group center
      const planetDistanceInAU = (parseFloat(cfg.distance.AU as string)) * worldSettings.value.distanceScale
      let planetDistanceInSceneUnits: number;

      if (cfg.type !== 'moon') {
        planetDistanceInSceneUnits = planetDistanceInAU  * worldSettings.value.distanceScale
      } else {
        planetDistanceInSceneUnits = planetDistanceInAU * (worldSettings.value.distanceScale * 10)
      }

      // offset parent and child radius from distance value
      const parentStarDistanceOffset = this.params_.parent != null
        && this.params_.parent.components_!= null && this.params_.parent.components_.PlanetController
        && this.params_.parent.components_.PlanetController.planetoid_.scale
      ? (this.params_.parent.components_.PlanetController.planetoid_.scale.x + planetoid_.scale.x)
        : 0

      planetoid_.position.x = planetDistanceInSceneUnits + parentStarDistanceOffset

      // {
      //   // axes Helper
      //   const axesHelper = new AxesHelper( planetoid_.scale.x * 2 );
      //   planetoid_.add( axesHelper );
      //   // Grid Helper
      //   planetoid_.add(new GridHelper(6, 6, "#666666", "#222222"));
      //   this.SetLabel(cfg.nameId, planetoid_);
      // }

      //Generate athmosphere
      if (cfg.athmosphereMap != null) {
        const athmosphere = this._generateAthmosphere(
          cfg,
          planetoid_.scale.x,
          cfg.athmosphereMap,
        )

        // rotate athmosphereMesh in anticlockwise direction (+=)
        athmosphere.tick = (delta: number) => {
          athmosphere.rotation.y -= delta * convertRotationPerDayToRadians(this.params_.data.rotation_period.days as number) *  worldSettings.value.timeSpeed;
        };

        planetoid_.add(athmosphere);
        this.updatables_.push(athmosphere);
      }

      // Generate POI
      if (cfg.POI != null) {
        const poiGeometry = new SphereGeometry(0.005, 6, 6);
        const poiMaterial = new MeshBasicMaterial({ color: 0xff0000 });

        cfg.POI.forEach((poi: any) => {
          let poiMesh = new Mesh(poiGeometry, poiMaterial);
          poiMesh.name = `POI: ${poi.name}`

          const cartPos = calcPosFromLatLngRad(
            poi.lat,
            poi.lng,
            ((cfg.radius.km as number) * worldSettings.value.planetoidScale) + 0.375
          );
          poiMesh.position.set(cartPos.x, cartPos.y, cartPos.z);

          planetoid_.add(poiMesh);
        });
      }

      // Attach day rotation if it is present in planetoid(/moon) config
      if (cfg.rotation_period != null) {
        planetoid_.tick = (delta: number) => {
          // rotate planetoid days
          planetoid_.rotation.y += delta * convertRotationPerDayToRadians(cfg.rotation_period.days as number) * worldSettings.value.timeSpeed;
        }
      }

      this.updatables_.push(planetoid_);
      return planetoid_;
    }

    InitMoonMeshGroup(params: any) {
      const moonGroup = new THREE.Group();
      const moonMesh = this.InitPlanetoidMesh(params.cfg, params.geometry, this._generateMaterial(params.cfg));
      // @Todo, script correct texture positioning of the moon against the parent planetoid (if axial rotation is 0?)
      moonMesh.rotation.y = Math.PI * moonMesh.rotation.y

      // attach moon group to parent planetoid
      moonGroup.name = `${params.cfg.nameId} Group`
      // Moon Group has scale 1 and moon mesh 1.15 - this results in moon bigger than earth
      moonGroup.add(moonMesh);
        {
          // axes Helper
          const axesHelper = new AxesHelper( moonGroup.scale.x * 2 );
          moonGroup.add( axesHelper );
          // Grid Helper
          moonGroup.add(new GridHelper(16, 16, "#F300D5", "#F30060"));
          this.SetLabel(params.cfg.nameId, moonGroup);
        }
      moonGroup.tick = (delta: number) => {
        moonGroup.rotation.y += delta * convertRotationPerDayToRadians(params.cfg.orbital_period.days as number) *  worldSettings.value.timeSpeed;
      }
      return moonGroup;
    }

    SetLabel(nameId: string, parent: any) {
      const spritey = this.makeTextSprite(
        nameId + ' Label',
        { alignment: 1, fontsize: 22, backgroundColor: {r:255, g:100, b:100, a:1} }
      );
      spritey.position.set(0, parent.scale.y, 0)
      parent.add(spritey);
    }

    makeTextSprite( message: string, parameters: any ) {
      if ( parameters === undefined ) parameters = {};
      var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
      var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
      var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
      var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
      var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
      var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      context.font = "Bold " + fontsize + "px " + fontface;
      var metrics = context.measureText( message );
      var textWidth = metrics.width;

      context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
      context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

      context.lineWidth = borderThickness;
      roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

      context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
      context.fillText( message, borderThickness, fontsize + borderThickness);

      var texture = new THREE.Texture(canvas)
      texture.needsUpdate = true;

      var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
      var sprite = new THREE.Sprite( spriteMaterial );
      sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
      sprite.name = message;
      return sprite;
    }

    InitComponent() {
      this.RegisterHandler_('health.damage', () => { this.OnHit_(); });
    }

    // 1. Create material according to planetoid config
    _generateMaterial(cfg: any) {
      const loader = new TextureLoader();
      let sphereMaterial = cfg.emissive != null
        ? new MeshPhongMaterial({
          wireframe: true,
          emissive: cfg.emissive,
          emissiveIntensity: 1,
        })
        : new MeshPhongMaterial({
          //wireframe: true,
          //color: cfg.color ? new Color(cfg.color) : '#fff',
        })

      if (cfg.map != null) {
        sphereMaterial.map = loader.load(cfg.map);
      }

      if (cfg.emissiveMap != null) {
        sphereMaterial.emissiveMap = loader.load(cfg.emissiveMap);
      }

      if (cfg.displacementMap != null) {
        sphereMaterial.displacementMap = loader.load(cfg.displacementMap)
        sphereMaterial.displacementScale = cfg.displacementScale || 1
      }

      if (cfg.bumpMap != null) {
        sphereMaterial.bumpMap = loader.load(cfg.bumpMap)
        sphereMaterial.bumpScale = cfg.bumpScale || 1
      }

      if (cfg.emissive != null && cfg.specularMap != null) {
        sphereMaterial.specularMap = loader.load(cfg.specularMap)
        sphereMaterial.shininess = cfg.shininess || 0
      }

      return sphereMaterial;
    }

    _generateAthmosphere(cfg: any, parentScale: number, athmosphereMap: string) {
      const _athmosphereDepth = cfg.athmosphereDepth != null ? cfg.athmosphereDepth : 0.5
      const materialClouds = new MeshStandardMaterial({
       // map: loader.load(athmosphereMap),
        transparent: true,
        opacity: cfg.athmosphereOpacity,
      });
      const athmosphereMesh = new Mesh(this.params_.geometry, materialClouds);
      athmosphereMesh.name = 'Athmosphere Map';
      athmosphereMesh.scale.multiplyScalar(parentScale + _athmosphereDepth);

      athmosphereMesh.position.set(0, 0, 0);
      athmosphereMesh.rotation.z = cfg.tilt;

      return athmosphereMesh;
    }

    _createLight() {
      class ColorGUIHelper {
        object: any;
        prop: any;
        constructor(object: any, prop: any) {
          this.object = object;
          this.prop = prop;
        }
        get value() {
          return `#${this.object[this.prop].getHexString()}`;
        }
        set value(hexString) {
          this.object[this.prop].set(hexString);
        }
      }

      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new PointLight(color, intensity);
      light.position.set(0, 0, 0);

      const helper = new PointLightHelper(light);
      light.add(helper);

      return light;
    }

    OnHit_() {
      if (this.Parent.Attributes.dead) {
        return;
      }

      if (this.Parent.Attributes.shields > 0) {
        const loader = this.FindEntity('loader').GetComponent('LoadController');
        loader.LoadSound('./resources/sounds/', 'shields.ogg', (s) => {
          const group = this.GetComponent('RenderComponent').group_;
          group.add(s);
          s.play();
        });

        this.shieldsVisible_ = true;
        this.shieldsTimer_ = 0.0;
      }
    }

    tick(delta: number) {
      // spin whole planetoid Group around sun Orbit
      if (this.params_.data.orbital_period != null) {
        this.group_.rotation.y += delta * convertRotationPerDayToRadians(this.params_.data.orbital_period.days as number) *  worldSettings.value.timeSpeed;
      }

      this.updatables_.forEach((u: any) => u.tick(delta))
    }
  };

  return {
    PlanetoidController: PlanetoidController
  };
})();