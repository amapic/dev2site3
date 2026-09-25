"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";

const MODEL_PATH = "/model/Meshy_AI_Out_From_Out_Where_0915203400_generate.fbx";

function Model() {
  const groupRef = useRef<THREE.Group>(null);
  const fbx = useLoader(FBXLoader, MODEL_PATH);

  useEffect(() => {
    if (!groupRef.current) return;

    // Clone pour éviter de modifier l'asset partagé du cache
    const scene = fbx.clone();
    groupRef.current.clear();
    groupRef.current.add(scene);

    // Centrer et normaliser l'échelle
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 3;
    const scale = maxDim > 0 ? targetSize / maxDim : 1;

    scene.scale.setScalar(scale);
    scene.position.sub(center.clone().multiplyScalar(scale));

    // Oriente les matériaux vers un rendu standard propre
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [fbx]);

  return <group ref={groupRef} />;
}

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.5, 5);
  }, [camera]);

  return null;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 2, -5]} intensity={0.4} />
    </>
  );
}

export default function MeshyFbxViewer() {
  return (
    <Canvas shadows camera={{ fov: 45, near: 0.1, far: 100 }}>
      <CameraSetup />
      <Lights />
      <Suspense fallback={null}>
        <Model />
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls enablePan enableZoom enableRotate autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
}
