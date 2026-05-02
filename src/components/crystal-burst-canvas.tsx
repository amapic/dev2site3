"use client";

import { useEffect, useRef } from "react";
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
  [0.00, "#00d4d4"],
  [0.12, "#c8f7ff"],
  [0.26, "#ffc837"],
  [0.40, "#9fe4ec"],
  [0.56, "#2f78c0"],
  [0.72, "#003d82"],
  [0.86, "#0b5fb0"],
  [1.00, "#00d4d4"],
];

function angleToColor(angle: number): THREE.Color {
  const norm =
    (((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const [t0, c0] = COLOR_STOPS[i];
    const [t1, c1] = COLOR_STOPS[i + 1];
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
  for (let i = 0; i < cfg.count; i++) {
    const angle = rand() * Math.PI * 2;
    const r = lerp(cfg.radiusMin, cfg.radiusMax, Math.pow(rand(), cfg.radiusPow));

    const nx = cx + Math.cos(angle) * r + (rand() - 0.5) * cfg.posNoise;
    const ny = cy + Math.sin(angle) * r + (rand() - 0.5) * cfg.posNoise;
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

    const mat = makeMat(colorA, colorB, opacity, rand, cfg.grain);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(nx, ny, nz);
    mesh.rotation.z = angle - Math.PI / 2;
    mesh.rotation.x = (rand() - 0.5) * 0.38;
    mesh.rotation.y = (rand() - 0.5) * 0.38;
    mesh.scale.set(width, length, 1);
    group.add(mesh);
  }
}

export default function CrystalBurstCanvas({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rand = seededRand(SEED);

    const w = container.clientWidth || 1280;
    const h = container.clientHeight || 720;
    const cx = 2.6;
    const cy = 0;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    const baseCameraPosition = new THREE.Vector3(0, 0, 22);
    const focusPoint = new THREE.Vector3(cx, cy, 0);
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);
    let frameId = 0;

    camera.position.copy(baseCameraPosition);
    camera.lookAt(focusPoint);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.domElement.style.pointerEvents = "none";
    container.appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([0, 1, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]),
        3
      )
    );
    geo.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array([0.5, 1, 0, 0, 1, 0]), 2)
    );

    const root = new THREE.Group();
    root.rotation.z = 0.12;
    root.scale.set(0.5, 0.5, 0.5);

    const spikeGroup = new THREE.Group();
    const coreGroup = new THREE.Group();
    const dustGroup = new THREE.Group();

    addLayer(spikeGroup, geo, rand, cx, cy, {
      count: 260,
      radiusMin: 0.0,
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

    addLayer(coreGroup, geo, rand, cx, cy, {
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

    addLayer(dustGroup, geo, rand, cx, cy, {
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

    root.add(spikeGroup, coreGroup, dustGroup);
    scene.add(root);

    const renderScene = () => {
      pointerCurrent.lerp(pointerTarget, 0.06);

      camera.position.x = baseCameraPosition.x + pointerCurrent.x * 0.65;
      camera.position.y = baseCameraPosition.y + pointerCurrent.y * 0.45;
      camera.lookAt(
        focusPoint.x + pointerCurrent.x * 0.08,
        focusPoint.y + pointerCurrent.y * 0.06,
        focusPoint.z,
      );

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderScene);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const py = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;

      pointerTarget.set(clamp(px, -1, 1), clamp(-py, -1, 1));
    };

    const handlePointerLeave = () => {
      pointerTarget.set(0, 0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerLeave);
    renderScene();

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
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerLeave);
      ro.disconnect();
      [spikeGroup, coreGroup, dustGroup].forEach((g) => {
        g.children.forEach((c) => {
          if (c instanceof THREE.Mesh) {
            (c.material as THREE.Material).dispose();
          }
        });
      });
      geo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    />
  );
}
