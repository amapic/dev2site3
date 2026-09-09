"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SEED = 771243;

function seededRand(seed: number) {
  let s = seed >>> 0;
  return (): number => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const COLOR_STOPS: [number, string][] = [
  [0.0, "#00d4d4"],
  [0.12, "#c8f7ff"],
  [0.26, "#ffc837"],
  [0.4, "#9fe4ec"],
  [0.56, "#2f78c0"],
  [0.72, "#003d82"],
  [0.86, "#0b5fb0"],
  [1.0, "#00d4d4"],
];

function angleToColor(angle: number): THREE.Color {
  const norm = (((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);

  for (let index = 0; index < COLOR_STOPS.length - 1; index += 1) {
    const [t0, c0] = COLOR_STOPS[index];
    const [t1, c1] = COLOR_STOPS[index + 1];
    if (norm >= t0 && norm < t1) {
      const f = (norm - t0) / (t1 - t0);
      return new THREE.Color(c0).lerp(new THREE.Color(c1), f);
    }
  }

  return new THREE.Color(COLOR_STOPS[0][1]);
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  uniform vec2 uGradDir;
  uniform float uGrain;
  uniform float uSeed;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 d = normalize(uGradDir);
    float t = dot(vUv - vec2(0.5), d) * 0.9 + 0.5;
    float band = smoothstep(0.08, 0.92, t);
    vec3 col = mix(uColorA, uColorB, band);
    float n = hash(gl_FragCoord.xy * 0.9 + uSeed);
    col *= 1.0 + (n - 0.5) * uGrain * 0.28;
    float a = uOpacity * (1.0 + (n - 0.5) * uGrain * 0.4);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

function makeMat(
  colorA: THREE.Color,
  colorB: THREE.Color,
  opacity: number,
  rand: () => number,
  grain: number
) {
  const gAngle = rand() * Math.PI * 2;
  return new THREE.ShaderMaterial({
    uniforms: {
      uColorA: { value: colorA },
      uColorB: { value: colorB },
      uOpacity: { value: opacity },
      uGradDir: {
        value: new THREE.Vector2(Math.cos(gAngle), Math.sin(gAngle)),
      },
      uGrain: { value: grain },
      uSeed: { value: rand() * 999 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });
}

type LayerCfg = {
  count: number;
  radiusMin: number;
  radiusMax: number;
  radiusPow: number;
  widthMin: number;
  widthMax: number;
  lengthMin: number;
  lengthMax: number;
  opacityMin: number;
  opacityMax: number;
  grain: number;
  zSpread: number;
  posNoise: number;
};

function addLayer(
  group: THREE.Group,
  geo: THREE.BufferGeometry,
  rand: () => number,
  cx: number,
  cy: number,
  cfg: LayerCfg
) {
  for (let index = 0; index < cfg.count; index += 1) {
    const angle = rand() * Math.PI * 2;
    const radius = lerp(cfg.radiusMin, cfg.radiusMax, Math.pow(rand(), cfg.radiusPow));

    const nx = cx + Math.cos(angle) * radius + (rand() - 0.5) * cfg.posNoise;
    const ny = cy + Math.sin(angle) * radius + (rand() - 0.5) * cfg.posNoise;
    const nz = (rand() - 0.5) * cfg.zSpread;

    const width = lerp(cfg.widthMin, cfg.widthMax, rand());
    const length = lerp(cfg.lengthMin, cfg.lengthMax, Math.pow(rand(), 0.55));
    const opacity = lerp(cfg.opacityMin, cfg.opacityMax, rand());

    const base = angleToColor(angle);
    const hsl = { h: 0, s: 0, l: 0 };
    base.getHSL(hsl);

    const colorA = new THREE.Color().setHSL(
      hsl.h,
      clamp(hsl.s + 0.1 + rand() * 0.18, 0, 1),
      clamp(hsl.l - 0.14 + rand() * 0.1, 0.04, 0.82)
    );
    const colorB = new THREE.Color().setHSL(
      (hsl.h + (rand() - 0.5) * 0.04 + 1) % 1,
      clamp(hsl.s + rand() * 0.12, 0, 1),
      clamp(hsl.l + 0.2, 0.2, 0.96)
    );

    const material = makeMat(colorA, colorB, opacity, rand, cfg.grain);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(nx, ny, nz);
    mesh.rotation.z = angle - Math.PI / 2;
    mesh.rotation.x = (rand() - 0.5) * 0.38;
    mesh.rotation.y = (rand() - 0.5) * 0.38;
    mesh.scale.set(width, length, 1);
    group.add(mesh);
  }
}

// Wind shader types and utilities
type WindShaderUniforms = {
  uTime: { value: number };
  uSpeed: { value: number };
  uAmplitude: { value: number };
  uMinY: { value: number };
  uHeight: { value: number };
  uPhase: { value: number };
  uSpeedVariation: { value: number };
};

type WindSettings = {
  speed: number;
  amplitude: number;
  minY: number;
  height: number;
  phase: number;
  speedVariation: number;
};

type ShaderProgram = {
  uniforms: Record<string, { value: unknown }>;
  vertexShader: string;
  fragmentShader: string;
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return (Math.abs(hash) % 2048) / 128;
}

function hashStringVariation(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 2654435761);
  }
  return 0.85 + ((Math.abs(hash) % 1000) / 1000) * 0.3;
}

function getGeometryBounds(geometry: THREE.BufferGeometry) {
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }
  const bounds = geometry.boundingBox;
  if (!bounds) {
    return { minY: 0, height: 1 };
  }
  return {
    minY: bounds.min.y,
    height: Math.max(bounds.max.y - bounds.min.y, 0.001),
  };
}

function shouldReceiveWind(mesh: THREE.Mesh, bounds: { minY: number; height: number }) {
  const materialNames = Array.isArray(mesh.material)
    ? mesh.material.map((material) => material?.name ?? "")
    : [mesh.material?.name ?? ""];
  const hint = `${mesh.name} ${materialNames.join(" ")}`.toLowerCase();
  if (/(pot|planter|vase|soil|dirt|ground|floor|container)/.test(hint)) {
    return false;
  }
  return bounds.height > 0.08;
}

function injectWind(shader: ShaderProgram, settings: WindSettings, uniformsRef: { current: WindShaderUniforms[] }) {
  const uniforms: WindShaderUniforms = {
    uTime: { value: 0 },
    uSpeed: { value: settings.speed },
    uAmplitude: { value: settings.amplitude },
    uMinY: { value: settings.minY },
    uHeight: { value: settings.height },
    uPhase: { value: settings.phase },
    uSpeedVariation: { value: settings.speedVariation },
  };
  uniformsRef.current.push(uniforms);
  shader.uniforms.uTime = uniforms.uTime;
  shader.uniforms.uSpeed = uniforms.uSpeed;
  shader.uniforms.uAmplitude = uniforms.uAmplitude;
  shader.uniforms.uMinY = uniforms.uMinY;
  shader.uniforms.uHeight = uniforms.uHeight;
  shader.uniforms.uPhase = uniforms.uPhase;
  shader.uniforms.uSpeedVariation = uniforms.uSpeedVariation;
  shader.vertexShader = shader.vertexShader
    .replace(
      "void main() {",
      `
        uniform float uTime;
        uniform float uSpeed;
        uniform float uAmplitude;
        uniform float uMinY;
        uniform float uHeight;
        uniform float uPhase;
        uniform float uSpeedVariation;

        void main() {
      `
    )
    .replace(
      "#include <begin_vertex>",
      `
        vec3 transformed = vec3(position);
        float normalizedHeight = clamp((position.y - uMinY) / uHeight, 0.0, 1.0);
        float bendMask = smoothstep(0.08, 0.95, normalizedHeight);
        float variableSpeed = uSpeed * uSpeedVariation;
        float primaryWave = sin(uTime * variableSpeed + uPhase + position.x * 1.35 + position.z * 0.85);
        float secondaryWave = cos(uTime * (variableSpeed * 0.65) + uPhase * 1.3 + position.z * 1.1 - position.x * 0.5);
        float tertiaryWave = sin(uTime * (variableSpeed * 0.42) + uPhase * 2.1 + position.x * 0.8);
        float sway = (primaryWave * 0.6 + secondaryWave * 0.25 + tertiaryWave * 0.15) * uAmplitude * bendMask;
        transformed.x += sway;
        transformed.z += (primaryWave * 0.6 + tertiaryWave * 0.4) * uAmplitude * 0.3 * bendMask;
        transformed.y += abs(sway) * 0.08 * bendMask;
      `
    );
}

function createWindMaterial(
  original: THREE.MeshStandardMaterial,
  settings: WindSettings,
  uniformsRef: { current: WindShaderUniforms[] }
) {
  const material = original.clone();
  material.onBeforeCompile = (shader) => {
    injectWind(shader, settings, uniformsRef);
  };
  material.customProgramCacheKey = () =>
    [
      "plant-wind",
      settings.speed.toFixed(3),
      settings.amplitude.toFixed(3),
      settings.minY.toFixed(3),
      settings.height.toFixed(3),
      settings.phase.toFixed(3),
      settings.speedVariation.toFixed(3),
    ].join(":");
  return material;
}

function createWindDepthMaterial(
  original: THREE.MeshStandardMaterial,
  settings: WindSettings,
  uniformsRef: { current: WindShaderUniforms[] }
) {
  const material = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: original.map,
    alphaMap: original.alphaMap,
    alphaTest: original.alphaTest,
    side: original.side,
  });
  material.onBeforeCompile = (shader) => {
    injectWind(shader, settings, uniformsRef);
  };
  material.customProgramCacheKey = () =>
    [
      "plant-wind-depth",
      settings.speed.toFixed(3),
      settings.amplitude.toFixed(3),
      settings.minY.toFixed(3),
      settings.height.toFixed(3),
      settings.phase.toFixed(3),
      settings.speedVariation.toFixed(3),
    ].join(":");
  return material;
}

export default function CrystalBurstCanvas({
  className,
  modelMode = 'crystal',
  animate = true,
  initialCameraPosition,
  initialPolarAngle,
  initialAzimuthalAngle,
  onLoadingChange,
}: {
  className?: string;
  modelMode?: 'crystal' | 'plant';
  animate?: boolean;
  initialCameraPosition?: [number, number, number];
  initialPolarAngle?: number;
  initialAzimuthalAngle?: number;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const [cameraInfo, setCameraInfo] = useState<{
    position: number[];
    polar: number;
    azimuthal: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rand = seededRand(SEED);

    const w = container.clientWidth || 1280;
    const h = container.clientHeight || 720;
    const cx = -4.0;
    const cy = 0;
    const screenOffsetX = -9;
    const crystalCameraPosition = new THREE.Vector3(0, 0, 22);
    const plantCameraPosition = initialCameraPosition 
      ? new THREE.Vector3(initialCameraPosition[0], initialCameraPosition[1], initialCameraPosition[2])
      : new THREE.Vector3(0.01, 0.22, 0.84);
    const activeCameraPosition = modelMode === 'plant' ? plantCameraPosition : crystalCameraPosition;

    const scene = new THREE.Scene();

    // Axes helper for debugging (disabled by default)
    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    cameraRef.current = camera;
    let frameId = 0;

    camera.position.copy(activeCameraPosition);

    // Set initial orientation based on mode
    if (modelMode === 'plant' && initialPolarAngle !== undefined && initialAzimuthalAngle !== undefined) {
      const direction = new THREE.Vector3(
        Math.sin(initialPolarAngle) * Math.sin(initialAzimuthalAngle),
        Math.cos(initialPolarAngle),
        Math.sin(initialPolarAngle) * Math.cos(initialAzimuthalAngle)
      );
      camera.lookAt(camera.position.clone().add(direction));
    } else if (modelMode === 'plant') {
      camera.lookAt(0, 0, 0);
    } else {
      // Crystal form is shifted to the right, look at its new center
      camera.lookAt(cx + 8, cy, 0);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.domElement.style.pointerEvents = modelMode === 'plant' ? 'none' : 'auto';
    container.appendChild(renderer.domElement);

    // Add FlyControls for free camera movement (disabled in plant mode)
    // eslint-disable-next-line @typescript/no-var-requires
    const { FlyControls } = require('three/examples/jsm/controls/FlyControls');
    const controls = modelMode === 'plant' ? null : new FlyControls(camera, renderer.domElement);
    controlsRef.current = controls;
    if (controls) {
      controls.movementSpeed = 0.5;
      controls.rollSpeed = Math.PI / 6;
      controls.dragToLook = true;
      controls.autoForward = false;
    }

    // Compute spherical angles from camera orientation
    const getCameraState = () => {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const polar = Math.acos(clamp(direction.y, -1, 1));
      const azimuthal = Math.atan2(direction.x, direction.z);
      return {
        position: camera.position.toArray(),
        polar,
        azimuthal,
      };
    };

    // Camera info display (disabled by default)
    // setCameraInfo(getCameraState());

    // Reset camera to look at origin when pressing 'R' (disabled in plant mode)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (modelMode === 'plant') return;
      if (event.key.toLowerCase() === 'r') {
        camera.lookAt(0, 0, 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([0, 1, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]), 3)
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array([0.5, 1, 0, 0, 1, 0]), 2)
    );

    const root = new THREE.Group();
    // root.rotation.z = 0.12;
    root.scale.set(0.5, 0.5, 0.5);

    const spikeGroup = new THREE.Group();
    const coreGroup = new THREE.Group();
    const dustGroup = new THREE.Group();

    addLayer(spikeGroup, geometry, rand, cx, cy, {
      count: 260,
      radiusMin: 0,
      radiusMax: 5.4,
      radiusPow: 1.65,
      widthMin: 0.04,
      widthMax: 0.36,
      lengthMin: 1.0,
      lengthMax: 6.8,
      opacityMin: 0.22,
      opacityMax: 0.68,
      grain: 0.22,
      zSpread: 2.8,
      posNoise: 0.14,
    });

    addLayer(coreGroup, geometry, rand, cx, cy, {
      count: 170,
      radiusMin: 0,
      radiusMax: 1.9,
      radiusPow: 2.25,
      widthMin: 0.12,
      widthMax: 0.58,
      lengthMin: 0.35,
      lengthMax: 2.4,
      opacityMin: 0.32,
      opacityMax: 0.78,
      grain: 0.18,
      zSpread: 1.6,
      posNoise: 0.2,
    });

    addLayer(dustGroup, geometry, rand, cx, cy, {
      count: 95,
      radiusMin: 1.8,
      radiusMax: 6.6,
      radiusPow: 1.7,
      widthMin: 0.04,
      widthMax: 0.16,
      lengthMin: 0.12,
      lengthMax: 0.52,
      opacityMin: 0.1,
      opacityMax: 0.38,
      grain: 0.3,
      zSpread: 0.6,
      posNoise: 0.75,
    });

    let modelRoot: THREE.Object3D | null = null;
    let plantBones: THREE.Bone[] = [];
    let time = 0;
    const windUniformsRef = { current: [] as WindShaderUniforms[] };
    let startTime = Date.now();
    let tuteurImpulseZ = 0;
    let tuteurImpulseX = 0;

    const renderScene = () => {
      // Update wind uniforms
      const elapsed = (Date.now() - startTime) / 1000;
      windUniformsRef.current.forEach((uniforms) => {
        uniforms.uTime.value = elapsed;
      });

      // Animate armature bones for wind effect.
      // Tuteur1 is a separate support armature and only moves when the stem pushes it.
      const tigeBones = ['Bone', 'Bone.001', 'Bone.002', 'Bone.003', 'Bone.004'];
      let tigeDeviation = 0;
      plantBones.forEach((bone) => {
        if (bone.name === 'Tuteur1') return;
        const idx = tigeBones.indexOf(bone.name);
        if (idx === -1) return;
        const phase = idx * 0.6;
        const ampZ = (0.006 + idx * 0.004) / 5;
        const ampX = ampZ * 0.5;
        const dz = Math.sin(elapsed * 1.2 + phase) * ampZ;
        const dx = Math.cos(elapsed * 0.9 + phase * 0.7) * ampX;
        bone.rotation.z += dz;
        bone.rotation.x += dx;
        tigeDeviation += Math.abs(dz) + Math.abs(dx);
      });

      const tuteur = plantBones.find((b) => b.name === 'Tuteur1');
      if (tuteur) {
        const threshold = 0.004;
        const maxExcess = 0.004;
        if (tigeDeviation > threshold) {
          const excess = Math.min(tigeDeviation - threshold, maxExcess);
          const shake = Math.sin(elapsed * 7.0 + Math.floor(elapsed * 3) * 1.7) * excess * 0.5;
          tuteurImpulseZ = shake;
          tuteurImpulseX = Math.cos(elapsed * 5.5) * excess * 0.3;
        } else {
          tuteurImpulseZ *= 0.92;
          tuteurImpulseX *= 0.92;
        }
        tuteur.rotation.z += tuteurImpulseZ * 0.25;
        tuteur.rotation.x += tuteurImpulseX * 0.25;
      }

      const delta = 1 / 60;
      controls?.update(delta);
      // setCameraInfo(getCameraState());
      renderer.render(scene, camera);
      if (animate && modelMode === 'plant') {
        frameId = window.requestAnimationFrame(renderScene);
      } else if (!animate) {
        // Static mode: only one frame requested externally
      }
    };

    // Build based on requested mode (default: crystal)
    const buildCrystal = () => {
      root.add(spikeGroup, coreGroup, dustGroup);
      // Shift crystal form to the right
      root.position.x += 8;
      scene.add(root);
      // Render a single static frame; no continuous loop for idle crystal mode
      renderer.render(scene, camera);
    };

    const buildPlant = () => {
      onLoadingChange?.(true);

      // simple plant loader using GLTFLoader
      // lazy import loader to avoid module issues
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');
      // enable interactive canvas while keeping the same transparent background as the crystal canvas
      const loader = new GLTFLoader();
      const MODEL_PATH = '/model/PlantOrchid001_Blender_Cyclesjjj.glb';

      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambient);

      const dir = new THREE.DirectionalLight(0xffffff, 1.5);
      dir.position.set(5, 8, 5);
      dir.castShadow = true;
      dir.shadow.mapSize.width = 2048;
      dir.shadow.mapSize.height = 2048;
      dir.shadow.camera.far = 50;
      scene.add(dir);

      const fill1 = new THREE.DirectionalLight(0xffcf8f, 0.4);
      fill1.position.set(-4, 6, 1);
      scene.add(fill1);

      const fill2 = new THREE.DirectionalLight(0x87d5ff, 0.3);
      fill2.position.set(3, 4, -6);
      scene.add(fill2);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.ShadowMaterial({ opacity: 0.25 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Wind settings
      const windSpeed = 1.7;
      const windAmplitude = 0.09;

      loader.load(
        MODEL_PATH,
        (gltf: any) => {
          const loaded = gltf.scene as THREE.Object3D;
          
          // Collect rigged bones for stem wind animation; skip shader wind on skinned meshes
          const bones: THREE.Bone[] = [];
          loaded.traverse((obj: any) => {
            if (obj.isSkinnedMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
              bones.push(...obj.skeleton.bones);
              return;
            }
            if (obj.isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;

              const bounds = getGeometryBounds(obj.geometry);
              const enableWind = shouldReceiveWind(obj, bounds);
              const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
              let usesWind = false;

              const nextMaterials = materials.map((material: any, index: number) => {
                const clonedMaterial = material.clone();
                if (!(clonedMaterial instanceof THREE.MeshStandardMaterial) || !enableWind) {
                  return clonedMaterial;
                }
                return createWindMaterial(
                  clonedMaterial,
                  {
                    speed: windSpeed,
                    amplitude: windAmplitude,
                    minY: bounds.minY,
                    height: bounds.height,
                    phase: hashString(`${obj.name}-${index}`),
                    speedVariation: hashStringVariation(`${obj.name}-${index}`),
                  },
                  windUniformsRef
                );
              });

              obj.material = Array.isArray(obj.material) ? nextMaterials : nextMaterials[0];

              if (Array.isArray(nextMaterials)) {
                usesWind = nextMaterials.some(m => m instanceof THREE.MeshStandardMaterial);
              } else {
                usesWind = nextMaterials instanceof THREE.MeshStandardMaterial;
              }

              if (!usesWind) {
                return;
              }

              const depthSource = Array.isArray(nextMaterials)
                ? nextMaterials.find((material: any) => material instanceof THREE.MeshStandardMaterial)
                : nextMaterials;

              if (!depthSource) {
                return;
              }

              obj.customDepthMaterial = createWindDepthMaterial(
                depthSource,
                {
                  speed: windSpeed,
                  amplitude: windAmplitude,
                  minY: bounds.minY,
                  height: bounds.height,
                  phase: hashString(`${obj.name}-depth`),
                  speedVariation: hashStringVariation(`${obj.name}-depth`),
                },
                windUniformsRef
              );
            }
          });

          loaded.scale.set(1.2, 1.2, 1.2);
          loaded.position.set(0, 0, 0);
          scene.add(loaded);
          modelRoot = loaded;
          plantBones = bones;

          onLoadingChange?.(false);

          // Start rendering loop for plant mode
          renderScene();
        },
        undefined,
        (err: any) => {
          onLoadingChange?.(false);
          // ignore load errors
          // console.error('GLTF load error', err);
        }
      );
    };

    // Mouvement souris temporairement desactive pour figer la forme de la section 2.
    if (modelMode === 'plant') {
      buildPlant();
    } else {
      buildCrystal();
    }

    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight || 600;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    ro.observe(container);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      ro.disconnect();
      [spikeGroup, coreGroup, dustGroup].forEach((group) => {
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            (child.material as THREE.Material).dispose();
          }
        });
      });
      geometry.dispose();
      if (modelRoot) {
        modelRoot.traverse((obj) => {
          if ((obj as any).isMesh) {
            const m = (obj as any).material;
            if (m) m.dispose && m.dispose();
          }
        });
      }
      controls?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [modelMode, animate, initialCameraPosition, initialPolarAngle, initialAzimuthalAngle, onLoadingChange]);


    return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: 'auto' }}
      aria-hidden={modelMode !== 'plant'}
    >
      {cameraInfo ? (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 10,
            color: '#fff',
            fontSize: 12,
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.5)',
            padding: '4px 8px',
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        >
          <div>position: [{cameraInfo.position[0]?.toFixed(2) ?? '0.00'}, {cameraInfo.position[1]?.toFixed(2) ?? '0.00'}, {cameraInfo.position[2]?.toFixed(2) ?? '0.00'}]</div>
          <div>polar: {cameraInfo.polar.toFixed(2)}, azimuthal: {cameraInfo.azimuthal.toFixed(2)}</div>
        </div>
      ) : null}
    </div>
  );
}
