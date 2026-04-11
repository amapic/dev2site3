"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const CORE_TRIANGLES = 520;
const HAZE_TRIANGLES = 260;
const SHARP_TRIANGLES = 260;
const DUST_TRIANGLES = 220;
const RANDOM_SEED = 150617;

function createSeededRandom(seed: number) {
  let s = seed >>> 0;

  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function bell(t: number) {
  return Math.exp(-Math.pow((t - 0.5) / 0.22, 2));
}

function colorByRibbonPosition(t: number, rand: () => number) {
  const r = rand();

  if (t < 0.22) {
    const choices = ["#8ad8d3", "#5da9b3", "#1f5378", "#9fd9cf", "#d4e4de"];
    return choices[Math.floor(r * choices.length)];
  }

  if (t < 0.72) {
    const choices = [
      "#f06d5e",
      "#d9474f",
      "#f5b479",
      "#31204a",
      "#8f2f49",
      "#f4c784",
      "#1f355d",
    ];
    return choices[Math.floor(r * choices.length)];
  }

  const choices = ["#7fcfc8", "#57b2aa", "#2b6f8a", "#0f2b4a", "#c8d8cc", "#9fd9cf"];
  return choices[Math.floor(r * choices.length)];
}

function createGradientPair(baseHex: string, rand: () => number) {
  const base = new THREE.Color(baseHex);
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);

  const hueShift = (rand() - 0.5) * 0.06;
  const satBoost = 0.16 + rand() * 0.2;
  const lightShift = 0.12 + rand() * 0.15;

  const colorA = new THREE.Color().setHSL(
    (hsl.h - hueShift + 1) % 1,
    clamp(hsl.s + satBoost, 0, 1),
    clamp(hsl.l - lightShift, 0.03, 0.82)
  );

  const colorB = new THREE.Color().setHSL(
    (hsl.h + hueShift + 1) % 1,
    clamp(hsl.s + satBoost * 0.75, 0, 1),
    clamp(hsl.l + lightShift, 0.16, 0.94)
  );

  return { colorA, colorB };
}

function addTriangleCloud({
  group,
  count,
  rand,
  sizeMin,
  sizeMax,
  opacityMin,
  opacityMax,
  spreadY,
  spreadZ,
  wobble,
  soft,
  gradSharpness,
  grainAmount,
}: {
  group: THREE.Group;
  count: number;
  rand: () => number;
  sizeMin: number;
  sizeMax: number;
  opacityMin: number;
  opacityMax: number;
  spreadY: number;
  spreadZ: number;
  wobble: number;
  soft: boolean;
  gradSharpness: number;
  grainAmount: number;
}) {
  const triangleGeometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    0,
    1,
    0,
    -0.8660254,
    -0.5,
    0,
    0.8660254,
    -0.5,
    0,
  ]);
  const uvs = new Float32Array([0.5, 1, 0, 0, 1, 0]);
  triangleGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  triangleGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

  for (let i = 0; i < count; i += 1) {
    const t = rand();
    const x = lerp(-9.7, 9.9, t) + (rand() - 0.5) * 1.15;

    const centerBand =
      Math.sin((t - 0.03) * Math.PI * 2.1) * 0.7 +
      Math.cos((t + 0.12) * Math.PI * 3.2) * 0.22;

    const concentration = 0.38 + bell(t) * 1.9;
    const y = centerBand + (rand() - 0.5) * spreadY * concentration;
    const z = (rand() - 0.5) * spreadZ;

    const size = lerp(sizeMin, sizeMax, Math.pow(rand(), soft ? 1.4 : 0.82));
    const stretch = lerp(0.65, 1.75, rand());

    const color = colorByRibbonPosition(t, rand);
    const { colorA, colorB } = createGradientPair(color, rand);
    const opacityBase = lerp(opacityMin, opacityMax, rand());
    const centerBoost = 0.6 + 0.55 * bell(t);
    const opacity = clamp(opacityBase * centerBoost, 0.02, 0.96);
    const dirX = Math.cos(rand() * Math.PI * 2);
    const dirY = Math.sin(rand() * Math.PI * 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: colorA },
        uColorB: { value: colorB },
        uOpacity: { value: opacity },
        uGradientDir: { value: new THREE.Vector2(dirX, dirY) },
        uGradientSharpness: { value: gradSharpness },
        uGrainAmount: { value: grainAmount },
        uNoiseSeed: { value: rand() * 1000 },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;

        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uOpacity;
        uniform vec2 uGradientDir;
        uniform float uGradientSharpness;
        uniform float uGrainAmount;
        uniform float uNoiseSeed;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        void main() {
          vec2 dir = normalize(uGradientDir);
          float raw = dot(vUv - vec2(0.5), dir) * 0.95 + 0.5;
          float band = smoothstep(0.14, 0.86, raw);
          float gradientT = pow(band, uGradientSharpness);

          vec3 color = mix(uColorA, uColorB, gradientT);

          float noise = hash(gl_FragCoord.xy * 0.93 + uNoiseSeed);
          color *= 1.0 + (noise - 0.5) * uGrainAmount * 0.32;

          float alpha = uOpacity * (1.0 + (noise - 0.5) * uGrainAmount);
          gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      blending: soft ? THREE.NormalBlending : THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: soft ? THREE.OneMinusSrcAlphaFactor : THREE.OneFactor,
      blendEquation: THREE.AddEquation,
    });

    const mesh = new THREE.Mesh(triangleGeometry, material);
    mesh.position.set(x, y, z);

    mesh.rotation.x = (rand() - 0.5) * wobble;
    mesh.rotation.y = (rand() - 0.5) * wobble;
    mesh.rotation.z = rand() * Math.PI * 2;

    mesh.scale.set(size * stretch, size, 1);
    group.add(mesh);
  }

  return triangleGeometry;
}

type PrismaticRibbonCanvasProps = {
  transparent?: boolean;
  enableControls?: boolean;
  className?: string;
  onReady?: () => void;
};

export default function PrismaticRibbonCanvas({
  transparent = false,
  enableControls = false,
  className,
  onReady,
}: PrismaticRibbonCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onReadyRef = useRef<(() => void) | undefined>(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rand = createSeededRandom(RANDOM_SEED);

    const scene = new THREE.Scene();
    scene.background = transparent ? null : new THREE.Color("#f5f6f4");

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 18.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: transparent,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearAlpha(transparent ? 0 : 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const controls = enableControls ? new OrbitControls(camera, renderer.domElement) : null;
    if (controls) {
      controls.enableDamping = false;
      controls.enablePan = false;
      controls.enableZoom = true;
      controls.rotateSpeed = 0.62;
      controls.zoomSpeed = 0.85;
      controls.minDistance = 10;
      controls.maxDistance = 38;
      controls.target.set(0, 0, 0);
    }

    const root = new THREE.Group();
    root.rotation.z = -0.14;
    root.rotation.x = 0.02;
    root.position.set(0, 0, 0);
    root.scale.set(1, 1, 1);
    scene.add(root);

    const hazeGroup = new THREE.Group();
    const coreGroup = new THREE.Group();
    const sharpGroup = new THREE.Group();
    const dustGroup = new THREE.Group();

    root.add(hazeGroup);
    root.add(coreGroup);
    root.add(sharpGroup);
    root.add(dustGroup);

    const sharedHazeGeometry = addTriangleCloud({
      group: hazeGroup,
      count: HAZE_TRIANGLES,
      rand,
      sizeMin: 0.56,
      sizeMax: 2.15,
      opacityMin: 0.045,
      opacityMax: 0.22,
      spreadY: 4.6,
      spreadZ: 3.8,
      wobble: 0.35,
      soft: true,
      gradSharpness: 1.35,
      grainAmount: 0.08,
    });

    const sharedCoreGeometry = addTriangleCloud({
      group: coreGroup,
      count: CORE_TRIANGLES,
      rand,
      sizeMin: 0.2,
      sizeMax: 0.95,
      opacityMin: 0.2,
      opacityMax: 0.62,
      spreadY: 2.3,
      spreadZ: 2.2,
      wobble: 0.6,
      soft: false,
      gradSharpness: 2.1,
      grainAmount: 0.22,
    });

    const sharedSharpGeometry = addTriangleCloud({
      group: sharpGroup,
      count: SHARP_TRIANGLES,
      rand,
      sizeMin: 0.08,
      sizeMax: 0.45,
      opacityMin: 0.45,
      opacityMax: 0.92,
      spreadY: 1.35,
      spreadZ: 1.1,
      wobble: 0.92,
      soft: false,
      gradSharpness: 2.55,
      grainAmount: 0.28,
    });

    const sharedDustGeometry = addTriangleCloud({
      group: dustGroup,
      count: DUST_TRIANGLES,
      rand,
      sizeMin: 0.05,
      sizeMax: 0.2,
      opacityMin: 0.2,
      opacityMax: 0.72,
      spreadY: 6.8,
      spreadZ: 4.3,
      wobble: 1.15,
      soft: false,
      gradSharpness: 2,
      grainAmount: 0.26,
    });

    const compositionBounds = new THREE.Box3();
    const compositionSize = new THREE.Vector3();
    const compositionCenter = new THREE.Vector3();

    scene.updateMatrixWorld(true);
    compositionBounds.setFromObject(root);
    compositionBounds.getCenter(compositionCenter);
    root.position.sub(compositionCenter);

    scene.updateMatrixWorld(true);
    compositionBounds.setFromObject(root);
    compositionBounds.getSize(compositionSize);

    const baseWidth = Math.max(0.001, compositionSize.x);
    const baseHeight = Math.max(0.001, compositionSize.y);

    const renderScene = () => {
      renderer.render(scene, camera);
    };

    let frozen = false;

    const setSize = () => {
      if (frozen) {
        return;
      }

      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();

      const distanceToComposition = camera.position.distanceTo(root.position);
      const verticalFovRad = THREE.MathUtils.degToRad(camera.fov);
      const viewportHeightWorld = 2 * Math.tan(verticalFovRad * 0.5) * distanceToComposition;
      const viewportWidthWorld = viewportHeightWorld * camera.aspect;

      const fitPadding = 0.84;
      const targetWidth = viewportWidthWorld * fitPadding;
      const targetHeight = viewportHeightWorld * fitPadding;
      const fitScale = Math.max(0.01, Math.min(targetWidth / baseWidth, targetHeight / baseHeight));
      root.scale.setScalar(fitScale);

      scene.updateMatrixWorld(true);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, true);

      controls?.update();
      renderScene();

      if (!frozen) {
        frozen = true;
        onReadyRef.current?.();
      }
    };

    controls?.update();
    controls?.addEventListener("change", renderScene);

    setSize();
    window.addEventListener("resize", setSize);

    return () => {
      window.removeEventListener("resize", setSize);
      controls?.removeEventListener("change", renderScene);
      controls?.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material.dispose();
        }
      });

      sharedHazeGeometry.dispose();
      sharedCoreGeometry.dispose();
      sharedSharpGeometry.dispose();
      sharedDustGeometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [transparent, enableControls]);

  return <div ref={containerRef} className={className ?? "prismatic-ribbon-canvas"} />;
}
