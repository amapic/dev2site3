"use client";

import { useEffect, useMemo, useRef } from "react";
import { MeshRefractionMaterial, OrbitControls, Stats, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { CuboidCollider, InstancedRigidBodies, Physics, RigidBody } from "@react-three/rapier";
import * as THREE from "three";

const MODEL_PATH = "/instanced-refraction/stylized_crystal_gem_pack_-_handpainted.glb";
const RANDOM_SEED = 137;
const CAMERA_POSITION: [number, number, number] = [-14.98, 14.86, -6.02];
const CAMERA_ROTATION_DEG: [number, number, number] = [-114.8, -0.7, -178.5];

type GltfNodes = {
  nodes: Record<string, THREE.Mesh>;
};

function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next ^= next + Math.imul(next ^ (next >>> 7), 61 | next);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function randFloatSpread(random: () => number, range: number) {
  return (random() - 0.5) * range;
}

function InstancedRefractionMeshes({ count = 50}: { count?: number }) {
  const { nodes } = useGLTF(MODEL_PATH) as unknown as GltfNodes;
  const envMap = useMemo(() => {
    const pixels = new Uint8Array([
      210, 210, 210, 255,
      255, 255, 255, 255,
    ]);
    const texture = new THREE.DataTexture(pixels, 2, 1, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.needsUpdate = true;
    return texture;
  }, []);

  const geometry = useMemo(() => {
    const meshNodes = Object.values(nodes).filter((node) => node?.geometry);

    console.log(
      "[instanced-refraction] mesh nodes found:",
      meshNodes.length,
      Object.keys(nodes).filter((k) => (nodes[k] as THREE.Mesh)?.geometry)
    );

    // Use second mesh if available, otherwise fall back to first
    const target = meshNodes.length >= 2 ? meshNodes[0] : meshNodes[0];
    console.log("[instanced-refraction] using geometry from node:", meshNodes.length);
    if (!target?.geometry) {
      throw new Error("No mesh geometry found in GLB");
    }

    return target.geometry;
  }, [nodes]);

  const positions = useMemo(
    () => {
      const random = createSeededRandom(RANDOM_SEED);

      return Array.from({ length: count }, (_, index) => [
        randFloatSpread(random, 6),
        5 + index * 0.1,
        randFloatSpread(random, 6),
      ] as [number, number, number]);
    },
    [count]
  );

  const rotations = useMemo(
    () => {
      const random = createSeededRandom(RANDOM_SEED * 2);

      return Array.from({ length: count }, () => [random(), random(), random()] as [number, number, number]);
    },
    [count]
  );

  const scales = useMemo(
    () => {
      const random = createSeededRandom(RANDOM_SEED * 3);

      return Array.from({ length: count }, (_, index) => {
        const scale = index === 0 ? 2 : 0.2 + random() * 0.4;
        return [scale, scale, scale] as [number, number, number];
      });
    },
    [count]
  );

  const colors = useMemo(() => {
    const random = createSeededRandom(RANDOM_SEED * 4);
    const pickColor = (index: number) => {
      const randomValue = random();

      if (index === 0 || randomValue > 0.3) {
        return new THREE.Color("white").toArray();
      }

      if (randomValue > 0.2) {
        return new THREE.Color("#9a0050").toArray();
      }

      if (randomValue > 0.1) {
        return new THREE.Color("#509a00").toArray();
      }

      return new THREE.Color("#00509a").toArray();
    };

    return Float32Array.from(Array.from({ length: count }, (_, index) => pickColor(index)).flat());
  }, [count]);

  return (
    <Physics>
      <InstancedRigidBodies positions={positions} rotations={rotations} scales={scales} colliders="hull">
        <instancedMesh args={[geometry, undefined, count]} castShadow receiveShadow>
          <instancedBufferAttribute attach="geometry-attributes-color" args={[colors, 3]} />
          <MeshRefractionMaterial
            envMap={envMap}
            ior={2.5}
            bounces={2}
            aberrationStrength={0.02}
            fresnel={0.5}
            toneMapped={false}
            vertexColors
          />
        </instancedMesh>
      </InstancedRigidBodies>

      <RigidBody position={[0, -11, 0]} type="fixed" colliders={false}>
        <CuboidCollider friction={1} restitution={0} args={[100, 10, 100]} />
      </RigidBody>
    </Physics>
  );
}

function CameraFocus() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    const [x, y, z] = CAMERA_POSITION;
    const [rxDeg, ryDeg, rzDeg] = CAMERA_ROTATION_DEG;
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    camera.position.set(x, y, z);
    camera.rotation.set(toRad(rxDeg), toRad(ryDeg), toRad(rzDeg));
    camera.updateMatrixWorld(true);

    if (controlsRef.current) {
      // Keep controls aligned with the exact camera orientation at startup.
      const direction = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation).normalize();
      const target = new THREE.Vector3(x, y, z).add(direction.multiplyScalar(10));
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }
  }, [camera]);

  return <OrbitControls ref={controlsRef} minPolarAngle={0} maxPolarAngle={Math.PI / 2} />;
}

export default function InstancedRefractionScene() {
  return (
    <Canvas frameloop="demand" gl={{ antialias: false }} dpr={[1, 1.5]} camera={{ position: CAMERA_POSITION, fov: 50 }}>
      <color attach="background" args={["#f0f0f0"]} />
      <directionalLight color="#ffffff" position={[5, 5, 5]} intensity={0.95}>
        <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10]} />
      </directionalLight>
      <directionalLight color="#ffcf8f" position={[-4, 6, 1]} intensity={0.45} />
      <directionalLight color="#87d5ff" position={[3, 4, -6]} intensity={0.4} />
      <directionalLight color="#f2b3ff" position={[-6, 3, -4]} intensity={0.28} />
      <directionalLight color="#b8ffe1" position={[2, -2, 6]} intensity={0.22} />

      <InstancedRefractionMeshes />

      <CameraFocus />

      {/* <EffectComposer disableNormalPass multisampling={4}>
        <Bloom luminanceThreshold={2} intensity={1.5} levels={9} mipmapBlur />
      </EffectComposer> */}

      {/* <Stats className="r3f-stats" /> */}
    </Canvas>
  );
}

useGLTF.preload(MODEL_PATH);
