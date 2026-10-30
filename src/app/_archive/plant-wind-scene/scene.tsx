"use client";

import { useEffect, useMemo, useRef } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

const MODEL_PATH = "/PlantOrchid001_Blender_Cycles.glb";

type GltfScene = {
  scene: THREE.Group;
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
};

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

function WindScene({
  scene,
  speed,
  amplitude,
}: {
  scene: THREE.Group;
  speed: number;
  amplitude: number;
}) {
  const uniformsRef = useRef<WindShaderUniforms[]>([]);
  const windScene = useMemo(() => {
    uniformsRef.current = [];

    const clonedScene = scene.clone(true) as THREE.Group;

    clonedScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || !object.geometry) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      const bounds = getGeometryBounds(object.geometry);
      const enableWind = shouldReceiveWind(object, bounds);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      let usesWind = false;

      const nextMaterials = materials.map((material, index) => {
        const clonedMaterial = material.clone();

        if (!(clonedMaterial instanceof THREE.MeshStandardMaterial) || !enableWind) {
          return clonedMaterial;
        }

        usesWind = true;

        return createWindMaterial(
          clonedMaterial,
          {
            speed,
            amplitude,
            minY: bounds.minY,
            height: bounds.height,
            phase: hashString(`${object.name}-${index}`),
            speedVariation: hashStringVariation(`${object.name}-${index}`),
          },
          uniformsRef
        );
      });

      object.material = Array.isArray(object.material) ? nextMaterials : nextMaterials[0];

      if (!usesWind) {
        return;
      }

      const depthSource = nextMaterials.find(
        (material): material is THREE.MeshStandardMaterial => material instanceof THREE.MeshStandardMaterial
      );

      if (!depthSource) {
        return;
      }

      object.customDepthMaterial = createWindDepthMaterial(
        depthSource,
        {
          speed,
          amplitude,
          minY: bounds.minY,
          height: bounds.height,
          phase: hashString(`${object.name}-depth`),
          speedVariation: hashStringVariation(`${object.name}-depth`),
        },
        uniformsRef
      );
    });

    return clonedScene;
  }, [scene, speed, amplitude]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    uniformsRef.current.forEach((uniforms) => {
      uniforms.uTime.value = elapsed;
    });
  });

  useEffect(
    () => () => {
      windScene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) {
          return;
        }

        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
        object.customDepthMaterial?.dispose();
      });
    },
    [windScene]
  );

  return <primitive object={windScene} />;
}

function PlantDebug({ nodes }: { nodes: Record<string, THREE.Object3D> }) {
  useEffect(() => {
    console.log("[plant-wind] Nodes:", Object.keys(nodes));

    Object.entries(nodes).forEach(([name, node]) => {
      const mesh = node as THREE.Mesh;

      if (!mesh.geometry) {
        return;
      }

      const material = getSingleMaterial(mesh);
      console.log(`  ${name}:`, {
        vertices: mesh.geometry.attributes.position?.count,
        materialType: material?.type ?? "none",
        hasMap: !!material?.map,
      });
    });
  }, [nodes]);

  return null;
}

function PlantWindScene({
  onCameraInfo,
}: {
  onCameraInfo?: (info: { position: number[]; rotation: number[] }) => void;
}) {
  const { scene, nodes } = useGLTF(MODEL_PATH) as unknown as GltfScene;
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const windSpeed = 1.7;
  const windAmplitude = 0.09;

  return (
    <>
      <PlantDebug nodes={nodes} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        onChange={() => {
          const camera = controlsRef.current?.object;
          if (!camera) {
            return;
          }

          onCameraInfo?.({
            position: camera.position.toArray(),
            rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
          });
        }}
      />

      <ambientLight intensity={0.5} />
      <directionalLight
        color="#ffffff"
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight color="#ffcf8f" position={[-4, 6, 1]} intensity={0.4} />
      <directionalLight color="#87d5ff" position={[3, 4, -6]} intensity={0.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial transparent opacity={0.25} />
      </mesh>

      <WindScene scene={scene} speed={windSpeed} amplitude={windAmplitude} />
    </>
  );
}

function CameraController({
  onCameraInfo,
}: {
  onCameraInfo?: (info: { position: number[]; rotation: number[] }) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(3, 2.5, 4);
    camera.lookAt(0, 1.5, 0);

    onCameraInfo?.({
      position: camera.position.toArray(),
      rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
    });
  }, [camera]);

  return null;
}

function InfoPanel() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        background: "rgba(255, 255, 255, 0.9)",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "280px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        zIndex: 10,
      }}
    >
      <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
        🌿 Plante au vent
      </h3>
      <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#555" }}>
        Ondulation injectée dans le vertex shader du matériau d'origine.
        La base reste plus rigide et le haut de la plante plie davantage.
      </p>
      <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#999" }}>
        Tourne / zoome avec la souris
      </p>
    </div>
  );
}

export default function PlantWindSceneWrapper({
  onCameraInfo,
}: {
  onCameraInfo?: (info: { position: number[]; rotation: number[] }) => void;
}) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        frameloop="always"
        gl={{ antialias: true }}
        dpr={[1, 2]}
        camera={{ position: [3, 2.5, 4], fov: 45 }}
        shadows
      >
        <color attach="background" args={["#e8f0e8"]} />
        <PlantWindScene onCameraInfo={onCameraInfo} />
        {/* <CameraController onCameraInfo={onCameraInfo} /> */}
      </Canvas>
      <InfoPanel />
    </div>
  );
}

useGLTF.preload(MODEL_PATH);