import { THREE } from '../threejs/three-defs';
import { entity } from '../../constructors/Entity';
import { Vector3 } from 'three';


export const planetoid_ui_controller = (() => {

  const _VS = `
  varying vec3 vWorldPosition;
  varying vec2 vUV;

  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
    vUV = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`;


  const _FS = `
  uniform float time;
  uniform float shields;
  uniform vec3 colour;

  varying vec3 vWorldPosition;
  varying vec2 vUV;

  float sdf_Box(vec2 coords, vec2 bounds) {
    vec2 dist = abs(coords) - bounds;
    return length(max(dist, 0.0)) + min(max(dist.x, dist.y), 0.0);
  }

  float smootherstep(float a, float b, float x) {
    x = clamp((x - a) / (b - a), 0.0, 1.0);
    return x * x * x * (x * ( x * 6.0 - 15.0) + 10.0);
  }

  // The MIT License
  // Copyright © 2013 Inigo Quilez
  // https://www.youtube.com/c/InigoQuilez
  // https://iquilezles.org/
  // Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  // https://www.shadertoy.com/view/4sfGzS
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

  const mat3 _M = mat3( 0.00,  0.80,  0.60,
                      -0.80,  0.36, -0.48,
                      -0.60, -0.48,  0.64 );

  float FBM(vec3 p, int octaves) {
    float total = 0.0;
    float amplitude = 0.5;
    vec3 q = p;

    for (int i = 0; i < octaves; ++i) {
      total += noise(q) * amplitude;
      amplitude *= 0.5;

      q = _M * q * 2.0;
    }

    total = 1.0 - abs(total * 2.0 - 1.0);
    total = abs(total * 2.0 - 1.0);
    total = abs(total * 2.0 - 1.0);
    total = abs(total * 2.0 - 1.0);
    // total = total * 0.5 + 0.5;
    // total = pow(total, 1.0);

    return total;
  }

  void main() {
    vec2 boxCoords = fract(vUV * vec2(8.0, 1.0)) - 0.5;
    float d = sdf_Box(boxCoords, vec2(0.3, 0.4)) - 0.1;

    float a = smoothstep(0.0, -0.05, d) * step(round(vUV.x * 8.0 + 0.5)/8.0, shields);
    float c = mix(0.9, 1.0, clamp(smoothstep(-0.05, -0.2, d), 0.0, 1.0));
    vec3 col = colour;

    col *= 1.0 - exp(-16.0*abs(d));
    col *= vec3(pow(16.0*vUV.x*(1.0-vUV.x)*vUV.y*(1.0-vUV.y), 0.1));
    col *= vec3(FBM(vec3(vUV * vec2(8.0, 1.0), 0.5*time), 6) * 0.2 + 0.8);

    col *= c;

    gl_FragColor = vec4(col, a);
  }`;


  const _C1 = new THREE.Color(0xfa5959);
  const _C2 = new THREE.Color(0x2ce93c);


  class PlanetoidUIController extends entity.Component {
    params_: any;
    timeElapsed_: number;
    sprite_: any;
    boxPosition_: Vector3;
    boxPositionOffset_: Vector3;
    followText_: any;
    Y_AXIS: Vector3;

    constructor(params: any) {
      super();
      this.params_ = params;
      this.timeElapsed_ = 0.0;
      this.boxPosition_ = new Vector3();
      this.boxPositionOffset_ = new Vector3();
      this.Y_AXIS = new Vector3(0, 1, 0);
    }

    Destroy() {
      this.sprite_.traverse((c: any) => {
        if (c.material) {
          let materials = c.material;
          if (!(c.material instanceof Array)) {
            materials = [c.material];
          }
          for (let m of materials) {
            m.dispose();
          }
        }

        if (c.geometry) {
          c.geometry.dispose();
        }
      });
      if (this.sprite_.parent) {
        this.sprite_.parent.remove(this.sprite_);
      }
    }

    InitEntity() {
      this.CreateSprite_();
    }

    InitComponent() {
      this.RegisterHandler_('player.hit', (m) => { this.UpdateShieldColour_(); } );
    }

    UpdateShieldColour_() {
      const t = this.Parent.Attributes.shields / this.Parent.Attributes.maxShields;
      // this.colourTarget_ = _C1.clone().lerpHSL(_C2, t);
    }

    OnDeath_() {
      this.Destroy();
    }

    CreateSprite_() {
      const data = this.params_.data;

      this.followText_ = document.createElement("p");
      this.followText_.style.zIndex = '9';
      this.followText_.style.color = 'pink';
      this.followText_.style.position = 'absolute';
      this.followText_.style.border = '1px solid pink';

      const node = document.createTextNode(data.nameId);
      this.followText_.appendChild(node)
    }

    tick(delta: number) {
      // every time the camera or objects change position (or every frame)


      const canvas = document.getElementById('scene-container')
      this.boxPositionOffset_.copy(this.Parent.components_.PlanetController.planetoid_.position);
      this.boxPositionOffset_.sub(this.params_.camera.position)
      // make offset vector length = 1
      this.boxPositionOffset_.normalize();
      // rotate vector counterclockwise around Y
      this.boxPositionOffset_.applyAxisAngle(this.Y_AXIS, -Math.PI / 2);
      this.boxPositionOffset_.multiplyScalar(0.5);
      this.boxPositionOffset_.y = this.Parent.components_.PlanetController.planetoid_.scale.y + 25

      // create normalized box postion
      this.boxPosition_.setFromMatrixPosition(this.Parent.components_.PlanetController.planetoid_.matrixWorld);
      this.boxPosition_.add(this.boxPositionOffset_)

      this.boxPosition_.project(this.params_.camera);
      //translate from normalized position to browser absolute position
      const widthHalf = canvas.clientWidth / 2
      const heightHalf = canvas.clientHeight / 2

      var rect = canvas?.getBoundingClientRect();
      this.boxPosition_.x = rect.left + (this.boxPosition_.x * widthHalf) + widthHalf
      this.boxPosition_.y = rect.top - (this.boxPosition_.y * heightHalf) + heightHalf
      this.followText_.style.top = `${this.boxPosition_.y}px`
      this.followText_.style.left = `${this.boxPosition_.x}px`

      canvas.appendChild(this.followText_)
    }
  };

  return {
    PlanetoidUIController: PlanetoidUIController,
  };
})();