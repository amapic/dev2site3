"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import * as THREE from "three";

const MODEL_PATH = "/model/splat.ply";

function SplatModel() {
  const groupRef = useRef<THREE.Group>(null);
  const viewerRef = useRef<GaussianSplats3D.DropInViewer | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const viewer = new GaussianSplats3D.DropInViewer({
      selfDrivenMode: false,
      useBuiltInControls: false,
      sharedMemoryForWorkers: false,
    });

    viewer
      .addSplatScene(MODEL_PATH, {
        showLoadingUI: true,
        progressiveLoad: true,
        splatAlphaRemovalThreshold: 1,
      })
      .then(() => {
        viewerRef.current = viewer;
      })
      .catch((error) => {
        console.error("Erreur de chargement du splat:", error);
      });

    groupRef.current.add(viewer);

    return () => {
      viewer.dispose();
    };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return <group ref={groupRef} />;
}

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.2, 4.8);
  }, [camera]);

  return null;
}

function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.25}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.5}
        mipmapBlur
      />
      <Vignette
        offset={0.32}
        darkness={0.65}
        eskil={false}
      />
    </EffectComposer>
  );
}

export default function SampleOutScene() {
  return (
    <Canvas
      camera={{ fov: 42, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <CameraSetup />
      <SplatModel />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.4}
        minDistance={0.15}
        maxDistance={12}
        zoomSpeed={1.2}
      />
      <Effects />
    </Canvas>
  );
}
