'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// â”€â”€â”€ Copie exacte des utilitaires de prismatic-ribbon-canvas.tsx â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RANDOM_SEED = 150617;
const DEFAULT_CAMERA_DISTANCE = 18.5;

function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function bell(t: number) { return Math.exp(-Math.pow((t - 0.5) / 0.22, 2)); }

function colorByRibbonPosition(t: number, rand: () => number) {
  const r = rand();
  if (t < 0.22) {
    const c = ["#8ad8d3", "#5da9b3", "#1f5378", "#9fd9cf", "#d4e4de"];
    return c[Math.floor(r * c.length)];
  }
  if (t < 0.72) {
    const c = ["#f06d5e", "#d9474f", "#f5b479", "#31204a", "#8f2f49", "#f4c784", "#1f355d"];
    return c[Math.floor(r * c.length)];
  }
  const c = ["#7fcfc8", "#57b2aa", "#2b6f8a", "#0f2b4a", "#c8d8cc", "#9fd9cf"];
  return c[Math.floor(r * c.length)];
}

function createGradientPair(baseHex: string, rand: () => number) {
  const base = new THREE.Color(baseHex);
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);
  const hueShift = (rand() - 0.5) * 0.06;
  const satBoost = 0.16 + rand() * 0.2;
  const lightShift = 0.12 + rand() * 0.15;
  const colorA = new THREE.Color().setHSL(
    (hsl.h - hueShift + 1) % 1, clamp(hsl.s + satBoost, 0, 1), clamp(hsl.l - lightShift, 0.03, 0.82)
  );
  const colorB = new THREE.Color().setHSL(
    (hsl.h + hueShift + 1) % 1, clamp(hsl.s + satBoost * 0.75, 0, 1), clamp(hsl.l + lightShift, 0.16, 0.94)
  );
  return { colorA, colorB };
}

// â”€â”€â”€ Shaders identiques section 1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAG = `
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
`;

// â”€â”€â”€ GÃ©nÃ©ration des triangles sur les points SVG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function addLayer({
  group, count, rand, svgPoints,
  sizeMin, sizeMax, opacityMin, opacityMax,
  spreadXY, spreadZ, wobble, gradSharpness, grainAmount,
}: {
  group: THREE.Group; count: number; rand: () => number;
  svgPoints: THREE.Vector2[];
  sizeMin: number; sizeMax: number; opacityMin: number; opacityMax: number;
  spreadXY: number; spreadZ: number; wobble: number;
  gradSharpness: number; grainAmount: number;
}) {
  // GÃ©omÃ©trie partagÃ©e entre tous les triangles du groupe
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(
    new Float32Array([0, 1, 0, -0.8660254, -0.5, 0, 0.8660254, -0.5, 0]), 3
  ));
  geo.setAttribute('uv', new THREE.BufferAttribute(
    new Float32Array([0.5, 1, 0, 0, 1, 0]), 2
  ));

  for (let i = 0; i < count; i++) {
    const pt = svgPoints[Math.floor(rand() * svgPoints.length)];

    // t normalisÃ© 0â†’1 selon position X, pour associer la mÃªme palette couleur
    // que le ruban original (gauche=cyan, centre=rouge/or, droite=cyan)
    const t = clamp((pt.x + 9.8) / 19.6, 0, 1);

    const concentration = 0.5 + bell(t) * 1.2;
    const x = pt.x + (rand() - 0.5) * spreadXY * concentration;
    const y = pt.y + (rand() - 0.5) * spreadXY * concentration;
    const z = (rand() - 0.5) * spreadZ;

    const size = lerp(sizeMin, sizeMax, Math.pow(rand(), 0.82));
    const stretch = lerp(0.65, 1.75, rand());

    const colorHex = colorByRibbonPosition(t, rand);
    const { colorA, colorB } = createGradientPair(colorHex, rand);
    const opacity = clamp(lerp(opacityMin, opacityMax, rand()) * (0.6 + 0.55 * bell(t)), 0.02, 0.95);
    const angle = rand() * Math.PI * 2;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: colorA },
        uColorB: { value: colorB },
        uOpacity: { value: opacity },
        uGradientDir: { value: new THREE.Vector2(Math.cos(angle), Math.sin(angle)) },
        uGradientSharpness: { value: gradSharpness },
        uGrainAmount: { value: grainAmount },
        uNoiseSeed: { value: rand() * 99 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      // NormalBlending : blending standard, fonctionne parfaitement sur fond clair
      blending: THREE.NormalBlending,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.x = (rand() - 0.5) * wobble;
    mesh.rotation.y = (rand() - 0.5) * wobble;
    mesh.rotation.z = rand() * Math.PI * 2;
    mesh.scale.set(size * stretch, size, 1);
    group.add(mesh);
  }
}

// â”€â”€â”€ Composant principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SvgCrystalPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Setup Three.js
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor('#f5f6f4', 1);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f5f6f4');

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.z = DEFAULT_CAMERA_DISTANCE;

    const root = new THREE.Group();
    scene.add(root);

    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = performance.now() * 0.00025;
      root.rotation.y = Math.sin(t) * 0.08;
      root.rotation.x = Math.cos(t * 0.7) * 0.04;
      renderer.render(scene, camera);
    };

    const setSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    setSize();
    window.addEventListener('resize', setSize);
    animate();

    // â”€â”€â”€ Chargement SVG via Canvas2D â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // (MÃªme approche que 5-ans-crystal-demo, Ã©prouvÃ©e)
    const img = new Image();
    img.onload = () => {
      // Rendre le SVG dans un canvas pour lire les pixels
      const W = 592; // demi-rÃ©solution du SVG natif (1184x244)
      const H = 122;
      const offscreen = document.createElement('canvas');
      offscreen.width = W;
      offscreen.height = H;
      const ctx2d = offscreen.getContext('2d');
      if (!ctx2d) return;
      ctx2d.drawImage(img, 0, 0, W, H);

      const data = ctx2d.getImageData(0, 0, W, H).data;
      const svgPoints: THREE.Vector2[] = [];

      const step = 3; // un point tous les 3 pixels â†’ densitÃ© raisonnable
      for (let py = 0; py < H; py += step) {
        for (let px = 0; px < W; px += step) {
          const idx = (py * W + px) * 4;
          // Le SVG a fill="black" sur ses paths, donc A>64 = pixel lettre
          if (data[idx + 3] > 64) {
            // Mapping vers l'espace monde Three.js  (mÃªme Ã©chelle que le ruban: -9.8..9.8 x -2.0..2.0)
            const wx = (px / W - 0.5) * 19.6;
            const wy = -(py / H - 0.5) * 4.0;
            svgPoints.push(new THREE.Vector2(wx, wy));
          }
        }
      }

      if (svgPoints.length === 0) {
        console.warn('[svg-crystal-3d] Aucun pixel SVG dÃ©tectÃ©. VÃ©rifier le chemin du fichier.');
        return;
      }

      const rand = createSeededRandom(RANDOM_SEED);

      // â”€â”€â”€ Quatre couches comme la section 1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const hazeGroup  = new THREE.Group();
      const coreGroup  = new THREE.Group();
      const sharpGroup = new THREE.Group();
      const dustGroup  = new THREE.Group();

      // HAZE : grands triangles flous, trÃ¨s transparents, lÃ©ger dÃ©bordement
      addLayer({
        group: hazeGroup, count: 3, rand, svgPoints,
        sizeMin: 0.12, sizeMax: 0.55,
        opacityMin: 0.04, opacityMax: 0.20,
        spreadXY: 1.0, spreadZ: 1.5, wobble: 0.3,
        gradSharpness: 1.35, grainAmount: 0.08,
      });

      // CORE : triangles moyens, bien colorÃ©s, collÃ©s aux lettres
      addLayer({
        group: coreGroup, count: 10, rand, svgPoints,
        sizeMin: 0.04, sizeMax: 0.25,
        opacityMin: 0.22, opacityMax: 0.60,
        spreadXY: 0.35, spreadZ: 0.8, wobble: 0.55,
        gradSharpness: 2.1, grainAmount: 0.22,
      });

      // SHARP : petits Ã©clats nets, trÃ¨s proches des contours
      addLayer({
        group: sharpGroup, count: 10000, rand, svgPoints,
        sizeMin: 0.015, sizeMax: 0.10,
        opacityMin: 0.45, opacityMax: 0.90,
        spreadXY: 0.08, spreadZ: 0.3, wobble: 0.85,
        gradSharpness: 2.55, grainAmount: 0.28,
      });

      // DUST : micro-particules dispersÃ©es
      addLayer({
        group: dustGroup, count: 10, rand, svgPoints,
        sizeMin: 0.008, sizeMax: 0.055,
        opacityMin: 0.20, opacityMax: 0.70,
        spreadXY: 1.6, spreadZ: 1.5, wobble: 1.1,
        gradSharpness: 2.0, grainAmount: 0.26,
      });

      root.add(hazeGroup, coreGroup, sharpGroup, dustGroup);

      // â”€â”€â”€ Adapter l'Ã©chelle pour remplir l'Ã©cran â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      scene.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(root);
      const sz   = bbox.getSize(new THREE.Vector3());
      const bw   = Math.max(0.001, sz.x);
      const bh   = Math.max(0.001, sz.y);

      const w   = container.clientWidth;
      const h   = container.clientHeight;
      const asp = w / Math.max(1, h);
      const vFov = THREE.MathUtils.degToRad(30);
      const dist = DEFAULT_CAMERA_DISTANCE;
      const visH = 2 * Math.tan(vFov / 2) * dist;
      const visW = visH * asp;
      const fitScale = Math.min(visW * 0.82 / bw, visH * 0.82 / bh);
      root.scale.setScalar(Math.max(0.01, fitScale));
    };

    // Le SVG est dans /public â†’ accessible via URL absolue
    img.src = '/texte%20section%202/full%20texte.svg';

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', setSize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: '#f5f6f4', overflow: 'hidden' }}
    />
  );
}
