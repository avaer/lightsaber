import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { BufferGeometryUtils } from 'BufferGeometryUtils';
import { renderer, app } from 'app';
import easing from './easing.js';
import generateLightsaberStats from "./generator.js";

const {
  art: {},
  stats
} = app.specification;

const SaberColors = {
  "Blue": "#0029FF",
  "Green": "#00FF00",
  "Cyan": "#00D1FF",
  "Yellow": "#FAFF00",
  "Orange": "#FF9900",
  "Purple": "#AD00FF",
  "Pink": "#F047FF",
  "White": "#FFFFFF",
  "Red": "#FF0000",
  "Silver": "#AFAFAF",
  "Black": "#000000"
}
function murmurhash(key, seed = 1) {
  var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
  
  remainder = key.length & 3; // key.length % 4
  bytes = key.length - remainder;
  h1 = seed;
  c1 = 0xcc9e2d51;
  c2 = 0x1b873593;
  i = 0;
  
  while (i < bytes) {
      k1 = 
        ((key.charCodeAt(i) & 0xff)) |
        ((key.charCodeAt(++i) & 0xff) << 8) |
        ((key.charCodeAt(++i) & 0xff) << 16) |
        ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;
    
    k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

    h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
    h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
    h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
  }
  
  k1 = 0;
  
  switch (remainder) {
    case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    case 1: k1 ^= (key.charCodeAt(i) & 0xff);
    
    k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= k1;
  }
  
  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

const cubicBezier = easing(0, 1, 0, 1);

(async () => {
const localEuler = new THREE.Euler();
localEuler.order = 'YXZ';

const {
  // rarity,
  // bladeType, // Light or Dark
  bladeColor,
  emitterType,
  switchType,
  handleType,
  featureType,
  colorScheme
} = generateLightsaberStats({art, stats})


const bladeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: {
      type: 'v3',
      value: new THREE.Vector3(),
    },
    map: {
      type: 't',
      value: null,
    },
    fogColor: {
      type: '3f',
      value: new THREE.Color(),
    },
    fogDensity: {
      type: 'f',
      value: 0,
    },
    sunIntensity: {
      type: 'f',
      value: 1,
    },
    factor: {
      type: 'f',
      value: 0,
    },
  },
  vertexShader: `\
    #define LOG2 1.442695
    uniform vec3 uTime;
    uniform float factor;
    attribute float a;
    attribute vec3 d;
    varying vec3 vPosition;

    float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
    float noise(vec3 p){
        vec3 a = floor(p);
        vec3 d = p - a;
        d = d * d * (3.0 - 2.0 * d);

        vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
        vec4 k1 = perm(b.xyxy);
        vec4 k2 = perm(k1.xyxy + b.zzww);

        vec4 c = k2 + a.zzzz;
        vec4 k3 = perm(c);
        vec4 k4 = perm(c + 1.0);

        vec4 o1 = fract(k3 * (1.0 / 41.0));
        vec4 o2 = fract(k4 * (1.0 / 41.0));

        vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
        vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

        return o4.y * d.y + o4.x * (1.0 - d.y);
    }

    void main() {
      vec3 p = position.xyz + d * uTime * factor * 0.02;
      vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
      gl_Position = projectionMatrix * mvPosition;
      vPosition = p;
    }
  `,
  fragmentShader: `\
    uniform float sunIntensity;
    uniform vec3 fogColor;
    uniform vec3 uTime;
    varying vec3 vPosition;
    #define saturate(a) clamp( a, 0.0, 1.0 )

    float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
    float noise(vec3 p){
        vec3 a = floor(p);
        vec3 d = p - a;
        d = d * d * (3.0 - 2.0 * d);

        vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
        vec4 k1 = perm(b.xyxy);
        vec4 k2 = perm(k1.xyxy + b.zzww);

        vec4 c = k2 + a.zzzz;
        vec4 k3 = perm(c);
        vec4 k4 = perm(c + 1.0);

        vec4 o1 = fract(k3 * (1.0 / 41.0));
        vec4 o2 = fract(k4 * (1.0 / 41.0));

        vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
        vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

        return o4.y * d.y + o4.x * (1.0 - d.y);
    }

    void main() {
      gl_FragColor = vec4(${new THREE.Color(SaberColors[bladeColor]).toArray().join(', ')}, 1.0);
      gl_FragColor.rgb *= (2.0 + uTime.x);
    }
  `,
});

const lightsaberMesh = await (async () => {
  const object = new THREE.Object3D();

  const o = await new Promise((accept, reject) => {
    new GLTFLoader().load(app.files['./lightsaber.glb'], function(oScene) {
      oScene = oScene.scene;
      oScene.traverse(o => {
        if (o.isMesh) {
          if(!(o.name === emitterType ||
          o.name === switchType ||
          o.name === handleType ||
          o.name === featureType)){
            oScene.remove(o)
          } else {
            o.frustumCulled = false;
          }
        }
      });
      accept(oScene);
    }, undefined, reject);
  });
  object.add(o);

  const bladeLength = 1 * featureType === "ShortBlade" ? .6 : 1;

  const topBladeMesh = (() => {
    const geometry = new THREE.BoxBufferGeometry(0.015, 0.015, bladeLength, 1, 1, 100).applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -1/2 - 0.165 + 0.145));
    const numAs = geometry.attributes.position.array.length/3;
    const as = new Float32Array(numAs);
    for (let i = 0; i < numAs; i++) {
      as[i] = murmurhash(geometry.attributes.position.array[i*3+2]);
    }
    geometry.setAttribute('a', new THREE.BufferAttribute(as, 1));
    const ds = new Float32Array(geometry.attributes.position.array.length);
    for (let i = 0; i < ds.length;) {
      const j = i;
      ds[i++] = murmurhash(geometry.attributes.position.array[j+2] + 'a')/0xFFFFFFFF;
      ds[i++] = murmurhash(geometry.attributes.position.array[j+2] + 'b')/0xFFFFFFFF;
      ds[i++] = 0;
    }
    geometry.setAttribute('d', new THREE.BufferAttribute(ds, 3));
    const mesh = new THREE.Mesh(geometry, bladeMaterial);
    mesh.position.z = -0.145;
    mesh.visible = false;
    mesh.frustumCulled = false;
    return mesh;
  })();
  object.add(topBladeMesh);
  let sideBladeMesh = null;
  if(featureType === "CrossGuard"){
    const sideBladeMesh = (() => {
      const baseGeometry = new THREE.BoxBufferGeometry(0.1, 0.01, 0.01, 10, 1, 1);
      const numAs = baseGeometry.attributes.position.array.length/3;
      const as = new Float32Array(numAs);
      for (let i = 0; i < numAs; i++) {
        as[i] = murmurhash(baseGeometry.attributes.position.array[i*3]);
      }
      baseGeometry.setAttribute('a', new THREE.BufferAttribute(as, 1));

      const geometry = BufferGeometryUtils.mergeBufferGeometries([
        baseGeometry.clone().applyMatrix4(new THREE.Matrix4().makeTranslation(-0.1/2 - 0.06, 0, 0)),
        baseGeometry.clone().applyMatrix4(new THREE.Matrix4().makeTranslation(0.1/2 + 0.06, 0, 0)),
      ]);
      
      const ds = new Float32Array(geometry.attributes.position.array.length);
      for (let i = 0; i < ds.length;) {
        const j = i;
        ds[i++] = 0;
        ds[i++] = murmurhash(geometry.attributes.position.array[j] + 'a')/0xFFFFFFFF;
        ds[i++] = murmurhash(geometry.attributes.position.array[j] + 'b')/0xFFFFFFFF;
      }
      geometry.setAttribute('d', new THREE.BufferAttribute(ds, 3));
      const mesh = new THREE.Mesh(geometry, bladeMaterial);
      mesh.position.z = -0.145;
      mesh.visible = false;
      mesh.frustumCulled = false;
      return mesh;
    })();
    object.add(sideBladeMesh);
  }

  const particleGeometry = new THREE.BoxBufferGeometry(0.02, 0.02, 0.02);
  let particles = [];
  let lastParticleTime = Date.now();

  let animation = null;
  let factor = 0;
  object.tick = () => {
    const now = Date.now();
    const timeDiff = now - lastParticleTime;
    // if (timeDiff > 50) {
      const _makeParticle = (p, dv) => {
        const particle = new THREE.Mesh(particleGeometry, bladeMaterial);
        particle.position.copy(p);
        particle.rotation.order = 'YXZ';
        particle.rotation.x = Math.random()*Math.PI*2;
        particle.rotation.y = Math.random()*Math.PI*2;
        particle.rotation.z = Math.random()*Math.PI*2;
        particle.scale.set(0.2 + Math.random(), 0.2 + Math.random(), 0.2 + Math.random());
        particle.velocity = new THREE.Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random())
          .multiply(dv)
          .normalize()
          .multiplyScalar(0.001 + Math.random() * 0.001)
        particle.angularVelocity = new THREE.Vector3(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2);
        app.object.add(particle);
        particle.endTime = now + Math.random() * 3000;
        particles.push(particle);
        lastParticleTime = now;
      };
      const r = Math.random();
      if (r < 2/3) {
        _makeParticle(
          topBladeMesh.position.clone()
            .add(
              new THREE.Vector3(0, 0, -Math.random() * (0.1 + factor*0.9))
            ).applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2)),
          new THREE.Vector3(1, 1, 0)
        );
      } else {
        if(sideBladeMesh){
          _makeParticle(
            sideBladeMesh.position.clone()
              .add(
                new THREE.Vector3((Math.random() < 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.12*factor), 0, 0)
              ).applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2)),
            new THREE.Vector3(0, 1, 1)
          );
        }
      }
    particles = particles.filter(particle => {
      if (now < particle.endTime) {
        particle.position.add(particle.velocity);
        particle.rotation.x = particle.angularVelocity.x;
        particle.rotation.y = particle.angularVelocity.y;
        particle.rotation.z = particle.angularVelocity.z;
        particle.scale.multiplyScalar(0.95);
        return true;
      } else {
        particle.parent.remove(particle);
        return false;
      }
    });

    if (animation) {
      const {startFactor, endFactor, startTime, endTime} = animation;
      const now = Date.now();
      const lerp = Math.min(Math.max((now - startTime) / (endTime - startTime), 0), 1);
      factor = startFactor + (endFactor - startFactor)*lerp;
      bladeMaterial.uniforms.factor.value = factor;
      if (endFactor > startFactor) {
        factor = cubicBezier(factor);
      }
      topBladeMesh.scale.set(1, 1, factor);
      sideBladeMesh?.scale.set(factor, 1, 1);
      topBladeMesh.visible = sideBladeMesh?.visible = factor > 0;
      if (lerp >= 1) {
        animation = null;
      }
      return true;
    } else {
      return false;
    }
  };
  let phase = 0;
  object.setState = () => {
    if (phase === 0) {
      const startTime = Date.now();
      const endTime = startTime + 300;
      animation = {
        startFactor: 0,
        endFactor: 1,
        startTime,
        endTime,
      };
      phase = 1;
    } else if (phase === 1) {
      const startTime = Date.now();
      const endTime = startTime + 2000;
      animation = {
        startFactor: 1,
        endFactor: 1,
        startTime,
        endTime,
      };
      phase = 2;
    } else if (phase === 2) {
      const startTime = Date.now();
      const endTime = startTime + 500;
      animation = {
        startFactor: 1,
        endFactor: 0,
        startTime,
        endTime,
      };
      phase = 0;
    } else {
      throw new Error('unknown phase');
    }
  };

  app.addEventListener('terminate', () => {
    for (const particle of particles) {
      particle.parent.remove(particle);
    }
  });

  return object;
})();
lightsaberMesh.rotation.order = 'YXZ';
lightsaberMesh.rotation.x = Math.PI/2;
app.object.add(lightsaberMesh);

function animate() {
  bladeMaterial.uniforms.uTime.value.set(-1 + Math.random()*2, -1 + Math.random()*2, -1 + Math.random()*2);
  if (!lightsaberMesh.tick()) {
    lightsaberMesh.setState();
  }
}

renderer.setAnimationLoop(animate);
})();