"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

const GRID_DIVISIONS = 12; // nombre de divisions par côté du grand triangle
const CENTRAL_SIDE_LENGTH = 8.7;
const RANDOM_SEED = 260826;

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

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

function easeInOutCubic(t: number) {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

type Vec2 = { x: number; y: number };

type SmallTriangle = {
  geometry: THREE.BufferGeometry;
  center: THREE.Vector3;
};

function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

function v2Add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

function v2Sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

function v2Scale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}

function v2Dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function triangleArea(a: Vec2, b: Vec2, c: Vec2): number {
  return Math.abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) * 0.5;
}

function map2DTo3D(point: Vec2, vertices: THREE.Vector3[]): THREE.Vector3 {
  const [A, B, C] = vertices;
  const AB = new THREE.Vector3().subVectors(B, A);
  const AC = new THREE.Vector3().subVectors(C, A);

  const denom = (B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y);
  const u = ((point.x - A.x) * (C.y - A.y) - (C.x - A.x) * (point.y - A.y)) / denom;
  const v = ((B.x - A.x) * (point.y - A.y) - (point.x - A.x) * (B.y - A.y)) / denom;

  return new THREE.Vector3().copy(A).addScaledVector(AB, u).addScaledVector(AC, v);
}

const sharedTriangleUvs = new Float32Array([0.5, 1, 0, 0, 1, 0]);

function createTriangleGeometryFromCell(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3
): SmallTriangle {
  const center = new THREE.Vector3().addVectors(a, b).add(c).divideScalar(3);

  const vertices = new Float32Array([
    a.x - center.x, a.y - center.y, a.z - center.z,
    b.x - center.x, b.y - center.y, b.z - center.z,
    c.x - center.x, c.y - center.y, c.z - center.z,
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(sharedTriangleUvs, 2));
  geometry.computeVertexNormals();

  return { geometry, center };
}

function triangulateEquilateralGrid(
  A: Vec2,
  B: Vec2,
  C: Vec2,
  divisions: number
): Array<{ a: Vec2; b: Vec2; c: Vec2 }> {
  const triangles: Array<{ a: Vec2; b: Vec2; c: Vec2 }> = [];

  // Triangle pointant vers le haut : A en haut, B en bas gauche, C en bas droit
  // On parcourt les lignes horizontales du haut vers le bas
  for (let row = 0; row < divisions; row += 1) {
    const tTop = row / divisions;
    const tBottom = (row + 1) / divisions;

    // Point de gauche et de droite sur le côté AB et AC pour la ligne du haut
    const leftTop = v2Add(A, v2Scale(v2Sub(B, A), tTop));
    const rightTop = v2Add(A, v2Scale(v2Sub(C, A), tTop));

    // Point de gauche et de droite pour la ligne du bas
    const leftBottom = v2Add(A, v2Scale(v2Sub(B, A), tBottom));
    const rightBottom = v2Add(A, v2Scale(v2Sub(C, A), tBottom));

    // Nombre de colonnes sur cette ligne
    const cols = row + 1;

    for (let col = 0; col < cols; col += 1) {
      const tLeft = col / cols;
      const tRight = (col + 1) / cols;

      const topLeft = v2Add(leftTop, v2Scale(v2Sub(rightTop, leftTop), tLeft));
      const topRight = v2Add(leftTop, v2Scale(v2Sub(rightTop, leftTop), tRight));

      const bottomLeft = v2Add(leftBottom, v2Scale(v2Sub(rightBottom, leftBottom), tLeft));
      const bottomRight = v2Add(leftBottom, v2Scale(v2Sub(rightBottom, leftBottom), tRight));

      // Triangle supérieur de la cellule (pointe vers le haut)
      triangles.push({ a: topLeft, b: bottomLeft, c: topRight });

      // Triangle inférieur (pointe vers le bas), sauf à la dernière colonne
      if (col < cols - 1) {
        triangles.push({ a: topRight, b: bottomLeft, c: bottomRight });
      }
    }
  }

  return triangles;
}

function createGradientPair(baseHex: string, rand: () => number) {
  const base = new THREE.Color(baseHex);
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);

  const hueShift = (rand() - 0.5) * 0.08;
  const satBoost = 0.12 + rand() * 0.22;
  const lightShift = 0.1 + rand() * 0.18;

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

const PALETTE_COLORS = [
  "#8ad8d3",
  "#5da9b3",
  "#1f5378",
  "#9fd9cf",
  "#d4e4de",
  "#f06d5e",
  "#d9474f",
  "#f5b479",
  "#31204a",
  "#8f2f49",
  "#f4c784",
  "#1f355d",
  "#7fcfc8",
  "#57b2aa",
  "#2b6f8a",
  "#0f2b4a",
  "#c8d8cc",
  "#ffc837",
  "#00d4d4",
];



const triangleShaderMaterial = (colorA: THREE.Color, colorB: THREE.Color, opacity: number) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uColorA: { value: colorA },
      uColorB: { value: colorB },
      uOpacity: { value: opacity },
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
      void main() {
        float gradientT = smoothstep(0.15, 0.85, vUv.y);
        vec3 color = mix(uColorA, uColorB, gradientT);
        gl_FragColor = vec4(color, uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });

const SIDE_COLORS = [
  new THREE.Color("#ffc837"), // jaune — côté gauche
  new THREE.Color("#003d82"), // bleu — base
  new THREE.Color("#00d4d4"), // cyan — côté droit
];

export type TriangleConstellationCanvasHandle = {
  setProgress: (progress: number) => void;
};

const TriangleConstellationCanvas = forwardRef<TriangleConstellationCanvasHandle>(
  function TriangleConstellationCanvas(_, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef(0);
    const stateRef = useRef<{
      scene: THREE.Scene | null;
      camera: THREE.PerspectiveCamera | null;
      renderer: THREE.WebGLRenderer | null;
      root: THREE.Group | null;
      centralSides: THREE.Line[];
      smallTriangles: {
        mesh: THREE.Mesh;
        initialPos: THREE.Vector3;
        targetPos: THREE.Vector3;
        initialRot: THREE.Euler;
        targetRot: THREE.Euler;
        initialScale: number;
        targetScale: number;
        initialOpacity: number;
        targetOpacity: number;
      }[];
      cleanup: (() => void) | null;
    }>({
      scene: null,
      camera: null,
      renderer: null,
      root: null,
      centralSides: [],
      smallTriangles: [],
      cleanup: null,
    });

    const renderScene = () => {
      const { renderer, scene, camera } = stateRef.current;
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    const updateScene = (progress: number) => {
      const state = stateRef.current;
      if (!state.root) return;

      // 1. Concentration des petits triangles : 0 -> 0.45
      const concentrationT = easeOutCubic(clamp(progress / 0.45, 0, 1));
      state.smallTriangles.forEach((item) => {
        item.mesh.position.lerpVectors(item.initialPos, item.targetPos, concentrationT);
        item.mesh.rotation.x = lerp(item.initialRot.x, item.targetRot.x, concentrationT);
        item.mesh.rotation.y = lerp(item.initialRot.y, item.targetRot.y, concentrationT);
        item.mesh.rotation.z = lerp(item.initialRot.z, item.targetRot.z, concentrationT);

        const scale = lerp(item.initialScale, item.targetScale, concentrationT);
        item.mesh.scale.setScalar(scale);

        const opacity = lerp(item.initialOpacity, item.targetOpacity, concentrationT);
        const material = item.mesh.material as THREE.ShaderMaterial;
        material.uniforms.uOpacity.value = opacity;
      });

      // 2. Apparition des côtés du triangle central
      const sidePhases = [
        { start: 0.30, end: 0.48 },
        { start: 0.50, end: 0.68 },
        { start: 0.70, end: 0.88 },
      ];

      state.centralSides.forEach((line, index) => {
        const { start, end } = sidePhases[index];
        const sideT = easeInOutCubic(clamp((progress - start) / (end - start), 0, 1));
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = sideT;
        line.scale.setScalar(0.02 + 0.98 * sideT);
      });

      // 3. Légère rotation globale en fonction du scroll
      state.root.rotation.z = lerp(-0.08, 0.08, progress);
      state.root.rotation.x = lerp(0.04, -0.04, progress);

      renderScene();
    };

    useImperativeHandle(ref, () => ({
      setProgress: (progress: number) => {
        const p = clamp(progress, 0, 1);
        progressRef.current = p;
        updateScene(p);
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const rand = createSeededRandom(RANDOM_SEED);

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#f5f6f4");

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 18);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearAlpha(0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      const root = new THREE.Group();
      root.position.set(0, 0, 0);
      scene.add(root);

      // Triangle central : 3 côtés
      const halfSide = CENTRAL_SIDE_LENGTH / 2;
      const height = (CENTRAL_SIDE_LENGTH * Math.sqrt(3)) / 2;
      const vertices = [
        new THREE.Vector3(0, height * 0.62, 0), // haut
        new THREE.Vector3(-halfSide, -height * 0.31, 0), // bas gauche
        new THREE.Vector3(halfSide, -height * 0.31, 0), // bas droit
      ];

      const sidePairs = [
        [vertices[0], vertices[1]], // gauche
        [vertices[1], vertices[2]], // base
        [vertices[2], vertices[0]], // droit
      ];

      const centralSides: THREE.Line[] = [];

      sidePairs.forEach(([start, end], index) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({
          color: SIDE_COLORS[index],
          transparent: true,
          opacity: 0,
          linewidth: 2,
        });
        const line = new THREE.Line(geometry, material);
        line.position.set(0, 0, 0);
        line.scale.setScalar(0.02);
        // On centre l'échelle sur le milieu du côté
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        geometry.translate(-mid.x, -mid.y, -mid.z);
        line.position.copy(mid);
        root.add(line);
        centralSides.push(line);
      });

      // Petits triangles
      const smallTriangles: typeof stateRef.current.smallTriangles = [];

      // Points du triangle central
      const A = vertices[0];
      const B = vertices[1];
      const C = vertices[2];
      const AB = new THREE.Vector3().subVectors(B, A);
      const AC = new THREE.Vector3().subVectors(C, A);
      const normal = new THREE.Vector3().crossVectors(AB, AC).normalize();

      // Génération par pavage régulier du grand triangle
      const centroid2D = {
        x: (A.x + B.x + C.x) / 3,
        y: (A.y + B.y + C.y) / 3,
      };

      const subdivided = triangulateEquilateralGrid(
        { x: A.x, y: A.y },
        { x: B.x, y: B.y },
        { x: C.x, y: C.y },
        GRID_DIVISIONS
      );

      for (let i = 0; i < subdivided.length; i += 1) {
        const tri = subdivided[i];

        const a3D = map2DTo3D(tri.a, vertices);
        const b3D = map2DTo3D(tri.b, vertices);
        const c3D = map2DTo3D(tri.c, vertices);

        const { geometry: cellGeometry, center } = createTriangleGeometryFromCell(a3D, b3D, c3D);

        // Léger décalage hors du plan pour donner du volume à l'agglomération
        const depthSpread = lerp(-0.5, 0.5, rand());
        const targetPos = center.clone().addScaledVector(normal, depthSpread);

        // Position initiale visible : nuage large autour du triangle
        const outward = v2Sub({ x: targetPos.x, y: targetPos.y }, centroid2D);
        const outwardLen = Math.hypot(outward.x, outward.y) || 1;
        const spreadAngle = Math.atan2(outward.y, outward.x) + (rand() - 0.5) * 0.4;
        const radius = lerp(5.5, 14, Math.pow(rand(), 0.55));
        const initialPos = new THREE.Vector3(
          centroid2D.x + Math.cos(spreadAngle) * radius,
          centroid2D.y + Math.sin(spreadAngle) * radius,
          lerp(-3.5, 3.5, rand())
        );

        const baseColor = PALETTE_COLORS[Math.floor(rand() * PALETTE_COLORS.length)];
        const { colorA, colorB } = createGradientPair(baseColor, rand);
        const targetOpacity = lerp(0.45, 0.9, rand());
        const initialOpacity = lerp(0.25, 0.55, rand());
        const material = triangleShaderMaterial(colorA, colorB, initialOpacity);

        const mesh = new THREE.Mesh(cellGeometry, material);
        mesh.position.copy(initialPos);

        const initialRot = new THREE.Euler(
          (rand() - 0.5) * 2.5,
          (rand() - 0.5) * 2.5,
          rand() * Math.PI * 2
        );

        // Rotation cible : légère variation autour de l'orientation naturelle de la cellule
        const targetRot = new THREE.Euler(
          (rand() - 0.5) * 0.2,
          (rand() - 0.5) * 0.2,
          (rand() - 0.5) * 0.3
        );

        // Pavage parfait : échelle exacte de 1 (les géométries sont déjà à la bonne taille)
        const initialScale = lerp(0.35, 0.75, rand());
        const targetScale = 1.0;

        mesh.rotation.copy(initialRot);
        mesh.scale.setScalar(initialScale);

        root.add(mesh);

        smallTriangles.push({
          mesh,
          initialPos,
          targetPos,
          initialRot,
          targetRot,
          initialScale,
          targetScale,
          initialOpacity,
          targetOpacity,
        });
      }

      // Halo central discret (sprite)
      const glowGeometry = new THREE.PlaneGeometry(14, 14);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.z = -0.5;
      root.add(glow);

      stateRef.current = {
        scene,
        camera,
        renderer,
        root,
        centralSides,
        smallTriangles,
        cleanup: null,
      };

      const setSize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;

        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, true);

        // Ajustement de l'échelle pour garder la composition visible
        const distance = camera.position.distanceTo(root.position);
        const verticalFovRad = THREE.MathUtils.degToRad(camera.fov);
        const viewportHeight = 2 * Math.tan(verticalFovRad * 0.5) * distance;
        const viewportWidth = viewportHeight * camera.aspect;
        const fitScale = Math.min(
          (viewportWidth * 0.82) / 18,
          (viewportHeight * 0.82) / 14
        );
        root.scale.setScalar(Math.max(0.55, fitScale));

        updateScene(progressRef.current);
      };

      window.addEventListener("resize", setSize);
      setSize();

      stateRef.current.cleanup = () => {
        window.removeEventListener("resize", setSize);
        renderer.dispose();
        smallTriangles.forEach((item) => {
          item.mesh.geometry.dispose();
          const material = item.mesh.material as THREE.Material;
          material.dispose();
        });
        centralSides.forEach((line) => {
          line.geometry.dispose();
          const material = line.material as THREE.Material;
          material.dispose();
        });
        glowGeometry.dispose();
        glowMaterial.dispose();
        renderer.domElement.remove();
      };

      return () => {
        stateRef.current.cleanup?.();
      };
    }, []);

    return <div ref={containerRef} className="triangle-constellation-canvas" aria-hidden="true" />;
  }
);

export default TriangleConstellationCanvas;
