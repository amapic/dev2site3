"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const MODEL_PATH = "/PlantOrchid001_Blender_Cycles3.glb";
const MODEL_TARGET_MAX_DIMENSION = 3.6;
const MODEL_Z_OFFSET = 1.8;
const INITIAL_CAMERA_POSITION = new THREE.Vector3(-1.59, -0.13, 3.9);
const INITIAL_CAMERA_TARGET = new THREE.Vector3(-0.12, -0.45, -0.18);

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
};

function getSingleMaterial(mesh: THREE.Mesh): THREE.MeshStandardMaterial | null {
  const material = mesh.material;

  if (!material) {
    return null;
  }

  if (Array.isArray(material)) {
    return (material[0] as THREE.MeshStandardMaterial) ?? null;
  }

  return material as THREE.MeshStandardMaterial;
}

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
      "crystal-burst-wind",
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
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.style.pointerEvents = "auto";

    const scene = new THREE.Scene();
    const w = container.clientWidth || 1280;
    const h = container.clientHeight || 720;
    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    const lookTarget = INITIAL_CAMERA_TARGET.clone();
    let frameId = 0;
    let loadedModel: THREE.Object3D | null = null;
    const windUniformsRef: { current: WindShaderUniforms[] } = { current: [] };

    camera.position.copy(INITIAL_CAMERA_POSITION);
    camera.lookAt(lookTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.domElement.style.pointerEvents = "auto";
    container.appendChild(renderer.domElement);

    const cameraInfo = document.createElement("div");
    cameraInfo.style.position = "absolute";
    cameraInfo.style.left = "12px";
    cameraInfo.style.top = "12px";
    cameraInfo.style.zIndex = "20";
    cameraInfo.style.padding = "8px 10px";
    cameraInfo.style.borderRadius = "8px";
    cameraInfo.style.background = "rgba(6, 10, 18, 0.72)";
    cameraInfo.style.color = "#e8f3ff";
    cameraInfo.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    cameraInfo.style.fontSize = "11px";
    cameraInfo.style.lineHeight = "1.4";
    cameraInfo.style.whiteSpace = "pre";
    cameraInfo.style.pointerEvents = "none";
    container.appendChild(cameraInfo);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.7;
    controls.target.copy(lookTarget);
    controls.update();

    const ambient = new THREE.HemisphereLight(0xffffff, 0x1e2a44, 1.08);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(4.2, 5.2, 3.6);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x9dc6ff, 0.55);
    rim.position.set(-3.6, 2.8, -4.2);
    scene.add(rim);

    const loader = new GLTFLoader();
      // Charger l'environnement HDR (même que dans cac.html)
      const rgbeLoader = new RGBELoader();
      rgbeLoader.load(
        "https://modelviewer.dev/shared-assets/environments/neutral.hdr",
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.environment = texture;
          scene.background = null; // Garder le fond transparent
        },
        undefined,
        (err) => console.warn("Echec du chargement HDR:", err)
      );

    loader.load(
      MODEL_PATH,
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
        const scaleFactor = MODEL_TARGET_MAX_DIMENSION / maxDim;

        model.scale.setScalar(scaleFactor);
        model.position.sub(center.multiplyScalar(scaleFactor));

        const scaledHeight = size.y * scaleFactor;
        model.position.y -= scaledHeight * 0.35;
        model.position.z += MODEL_Z_OFFSET;

        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) {
            return;
          }

          const material = getSingleMaterial(object);
          if (!material || !material.isMeshStandardMaterial) {
            return;
          }

          const bounds = getGeometryBounds(object.geometry);
          if (!shouldReceiveWind(object, bounds)) {
            return;
          }

          object.material = createWindMaterial(
            material,
            {
              speed: 1.7,
              amplitude: 0.09,
              minY: bounds.minY,
              height: bounds.height,
              phase: hashString(object.name || material.name || "crystal-wind"),
              speedVariation: hashStringVariation(object.name || material.name || "crystal-wind"),
            },
            windUniformsRef
          );
        });

        // Conserver le cadrage initial exact demandé au chargement.
        camera.position.copy(INITIAL_CAMERA_POSITION);
        lookTarget.copy(INITIAL_CAMERA_TARGET);
        controls.target.copy(lookTarget);
        controls.update();

        scene.add(model);
        loadedModel = model;
      },
      undefined,
      (error) => {
        console.error("Echec de chargement du modele GLB:", error);
      }
    );

    const renderScene = () => {
      const elapsedTime = performance.now() / 1000;
      windUniformsRef.current.forEach((uniforms) => {
        uniforms.uTime.value = elapsedTime;
      });

      controls.update();

      const toDeg = (rad: number) => (rad * 180) / Math.PI;
      cameraInfo.textContent =
        `cam pos  x:${camera.position.x.toFixed(2)} y:${camera.position.y.toFixed(2)} z:${camera.position.z.toFixed(2)}\n` +
        `cam rot  x:${toDeg(camera.rotation.x).toFixed(1)} y:${toDeg(camera.rotation.y).toFixed(1)} z:${toDeg(camera.rotation.z).toFixed(1)}\n` +
        `target   x:${controls.target.x.toFixed(2)} y:${controls.target.y.toFixed(2)} z:${controls.target.z.toFixed(2)}`;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderScene);
    };
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
      ro.disconnect();
      controls.dispose();

      if (loadedModel) {
        loadedModel.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) {
            return;
          }

          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        });
      }

      renderer.dispose();
      cameraInfo.remove();
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
