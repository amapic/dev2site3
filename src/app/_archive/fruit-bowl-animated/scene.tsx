"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

const MODEL_PATH = "/fruit_bowl_collection gltf/scene.gltf";

type GltfScene = {
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
};

type AnimationType = "rotate" | "bounce" | "float" | "none";

// Component for an individual animated mesh
function AnimatedMesh({
  mesh,
  animationType,
  speed,
  isHovered,
  onHover,
  onUnhover,
}: {
  mesh: THREE.Object3D;
  animationType: AnimationType;
  speed: number;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const currentSpeed = hovered ? speed * 2 : speed;

    switch (animationType) {
      case "rotate":
        meshRef.current.rotation.y += currentSpeed * delta;
        break;
      case "bounce":
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * currentSpeed) * 0.01;
        break;
      case "float":
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * currentSpeed) * 0.005;
        meshRef.current.rotation.y += currentSpeed * delta * 0.3;
        break;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={mesh.clone()}
      scale={hovered ? 1.1 : 1}
      onPointerOver={(e: PointerEvent) => {
        e.stopPropagation();
        setHovered(true);
        onHover();
      }}
      onPointerOut={(e: PointerEvent) => {
        e.stopPropagation();
        setHovered(false);
        onUnhover();
      }}
      castShadow
      receiveShadow
    />
  );
}

// Main scene component
function FruitBowlScene() {
  const { nodes, materials } = useGLTF(MODEL_PATH) as unknown as GltfScene;
  const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Log available meshes for debugging
  useEffect(() => {
    console.log("[fruit-bowl] Available nodes:", Object.keys(nodes));
    console.log(
      "[fruit-bowl] Mesh nodes:",
      Object.entries(nodes)
        .filter(([, node]) => (node as THREE.Mesh)?.geometry)
        .map(([name]) => name)
    );
    console.log("[fruit-bowl] Materials:", Object.keys(materials));
  }, [nodes, materials]);

  // Animation configuration for each mesh type
  const animationConfig = useMemo(
    (): Record<string, { type: AnimationType; speed: number }> => ({
      apple: { type: "bounce", speed: 2 },
      banana: { type: "float", speed: 1.5 },
      lemon: { type: "rotate", speed: 1 },
      lime: { type: "float", speed: 1.8 },
      pear: { type: "bounce", speed: 1.2 },
      pineapple: { type: "rotate", speed: 0.8 },
      plum: { type: "float", speed: 2.2 },
      pumpkin: { type: "bounce", speed: 1 },
      bowl: { type: "none", speed: 0 },
    }),
    []
  );

  // Extract and render individual meshes
  const meshElements = useMemo(() => {
    const elements: ReactNode[] = [];

    Object.entries(nodes).forEach(([name, node]) => {
      // Check if this node is a mesh with geometry
      const mesh = node as THREE.Mesh;
      if (!mesh.geometry) return;

      // Determine animation type based on mesh name
      let animType: AnimationType = "none";
      let speed = 0;

      for (const [key, config] of Object.entries(animationConfig)) {
        if (name.toLowerCase().includes(key)) {
          animType = config.type;
          speed = config.speed;
          break;
        }
      }

      elements.push(
        <AnimatedMesh
          key={name}
          mesh={mesh}
          animationType={animType}
          speed={speed}
          isHovered={hoveredMesh === name}
          onHover={() => setHoveredMesh(name)}
          onUnhover={() => setHoveredMesh(null)}
        />
      );
    });

    return elements;
  }, [nodes, animationConfig, hoveredMesh]);

  return (
    <>
      <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        color="#ffffff"
        position={[5, 8, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight color="#ffcf8f" position={[-4, 6, 1]} intensity={0.5} />
      <directionalLight color="#87d5ff" position={[3, 4, -6]} intensity={0.3} />

      {/* Ground plane with shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>

      {/* Render all animated meshes */}
      {meshElements}

      {/* Repère visuel de profondeur — centre de la scène */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </>
  );
}

// Camera controller
function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [camera]);

  return <OrbitControls ref={controlsRef} minDistance={2} maxDistance={15} />;
}

// Info panel component
function MeshInfoPanel({ hoveredMesh }: { hoveredMesh: string | null }) {
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
        maxWidth: "300px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        zIndex: 10,
      }}
    >
      <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600" }}>
        Fruit Bowl Collection
      </h3>
      <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
        Hover over fruits to see them animate individually
      </p>
      {hoveredMesh && (
        <div style={{ fontSize: "12px", color: "#0066cc" }}>
          <strong>Selected:</strong> {hoveredMesh}
        </div>
      )}
      <div style={{ marginTop: "8px", fontSize: "11px", color: "#999" }}>
        <strong>Available meshes:</strong>
        <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
          <li>Apple (bounce)</li>
          <li>Banana (float)</li>
          <li>Lemon (rotate)</li>
          <li>Lime (float)</li>
          <li>Pear (bounce)</li>
          <li>Pineapple (rotate)</li>
          <li>Plum (float)</li>
          <li>Pumpkin (bounce)</li>
          <li>Bowl (static)</li>
        </ul>
      </div>
    </div>
  );
}

export default function FruitBowlAnimatedScene() {
  const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        frameloop="demand"
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
      >
        <color attach="background" args={["#f0f4f8"]} />
        <FruitBowlScene />
        <CameraController />
      </Canvas>
      <MeshInfoPanel hoveredMesh={hoveredMesh} />
    </div>
  );
}

useGLTF.preload(MODEL_PATH);