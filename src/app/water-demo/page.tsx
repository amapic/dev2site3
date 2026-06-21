"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

// global vertical positions
const SURFACE_Y = 0;
const SEABED_Y = -20;

function WaterPlane() {
  const { scene } = useThree();
  const waterRef = useRef<any>(null);
  const [waterObj, setWaterObj] = useState<any>(null);
  const textUniformsRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const geometry = new THREE.PlaneGeometry(1000, 1000);

    const loader = new THREE.TextureLoader();
    // normal map from threejs examples (CORS enabled)
    const normalUrl = "https://threejs.org/examples/textures/waternormals.jpg";
    const waterNormals = loader.load(normalUrl, (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    });

    const water = new Water(geometry, {
      textureWidth: 1024,
      textureHeight: 1024,
      waterNormals: waterNormals,
      sunDirection: new THREE.Vector3(0.70707, 0.70707, 0),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
    });

    water.rotation.x = -Math.PI / 2;
    water.position.y = SURFACE_Y;

    if (mounted) setWaterObj(water);

    return () => {
      mounted = false;
      geometry.dispose();
      try {
        if (water.material) water.material.dispose();
      } catch (e) {}
    };
  }, [scene]);

  // add 3D text on the water surface that deforms with waves (shader injection)
  useEffect(() => {
    const loader = new FontLoader();
    let textMesh: THREE.Mesh | null = null;
    let mounted = true;

    loader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (font) => {
      if (!mounted) return;
      const text = "bonjour";
      const geom = new TextGeometry(text, {
        font: font,
        size: 40,
        height: 0.06,
        curveSegments: 12,
        bevelEnabled: false,
      });
      geom.center();
      geom.computeBoundingBox();
      const bbox = geom.boundingBox;
      const maxZ = bbox ? bbox.max.z : 0;

      const mat = new THREE.MeshStandardMaterial({
        color: 0xffe0b2,
        metalness: 0.1,
        roughness: 0.6,
      });

      // inject vertex displacement into the standard material so lighting stays consistent
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.time = { value: 0 };
        shader.uniforms.waveAmp = { value: new Float32Array([0.6, 0.25, 0.12, 0.06]) };
        shader.uniforms.waveK = { value: new Float32Array([0.6, 1.2, 2.4, 4.8]) };
        shader.uniforms.waveSpeed = { value: new Float32Array([0.6, 0.9, 1.2, 1.6]) };
        shader.uniforms.waveDirX = { value: new Float32Array([1.0, 0.8, -0.6, -0.2]) };
        shader.uniforms.waveDirZ = { value: new Float32Array([0.0, 0.6, 0.6, -0.8]) };

        // prepend uniforms / defines
        shader.vertexShader = "uniform float time;\n#define NUM_WAVES 4\nuniform float waveAmp[NUM_WAVES];\nuniform float waveK[NUM_WAVES];\nuniform float waveSpeed[NUM_WAVES];\nuniform float waveDirX[NUM_WAVES];\nuniform float waveDirZ[NUM_WAVES];\n" + shader.vertexShader;

        // replace normal computation with analytical normal from the wave height function
        shader.vertexShader = shader.vertexShader.replace(
          "#include <beginnormal_vertex>",
          `
          vec3 objectNormal = vec3(0.0);
          {
            vec3 pos = (modelMatrix * vec4(position, 1.0)).xyz;
            float dhdx = 0.0;
            float dhdz = 0.0;
            for (int i = 0; i < NUM_WAVES; i++) {
              float phase = waveK[i] * (waveDirX[i] * pos.x + waveDirZ[i] * pos.z) - waveSpeed[i] * time;
              float c = cos(phase);
              float coef = waveAmp[i] * waveK[i] * c;
              dhdx += coef * waveDirX[i];
              dhdz += coef * waveDirZ[i];
            }
            objectNormal = normalize(vec3(-dhdx, 1.0, -dhdz));
          }
          `
        );

        // replace vertex position calculation to add height from waves (based on world XZ)
        shader.vertexShader = shader.vertexShader.replace(
          "#include <begin_vertex>",
          `
          vec3 transformed = vec3(position);
          {
            float dhdx = 0.0;
            float dhdz = 0.0;
            float h = 0.0;
            vec3 worldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
            for (int i = 0; i < NUM_WAVES; i++) {
              float phase = waveK[i] * (waveDirX[i] * worldPos.x + waveDirZ[i] * worldPos.z) - waveSpeed[i] * time;
              float s = sin(phase);
              float c = cos(phase);
              h += waveAmp[i] * s;
              float coef = waveAmp[i] * waveK[i] * c;
              dhdx += coef * waveDirX[i];
              dhdz += coef * waveDirZ[i];
            }
            transformed.y += h;
          }
          `
        );

        textUniformsRef.current = shader.uniforms;
      };

      mat.needsUpdate = true;

      textMesh = new THREE.Mesh(geom, mat);
      textMesh.rotation.x = -Math.PI / 2;
      // position so the top of the letters sits exactly on the water surface
      const epsilon = 0.01;
      const topY = SURFACE_Y;
      textMesh.position.set(0, topY - (maxZ + epsilon), 0);
      textMesh.renderOrder = 0;
      scene.add(textMesh);
    });

    return () => {
      mounted = false;
      if (textMesh) {
        try {
          textMesh.geometry.dispose();
          if (Array.isArray(textMesh.material)) textMesh.material.forEach((m) => m.dispose());
          else textMesh.material.dispose();
        } catch (e) {}
        scene.remove(textMesh);
      }
    };
  }, [scene]);

  useFrame((state, delta) => {
    if (waterObj) {
      // increment time uniform (same as three example)
      if (waterObj.material && waterObj.material.uniforms && waterObj.material.uniforms["time"]) {
        waterObj.material.uniforms["time"].value += delta;
      }
    }
    // drive any injected text shader time uniform
    if (textUniformsRef.current && textUniformsRef.current["time"]) {
      textUniformsRef.current["time"].value += delta;
    }
  });

  return waterObj ? <primitive object={waterObj} /> : null;
}

export default function Page() {
  return (
    <div style={{ width: "100%", height: "100vh", background: "#081a2c" }}>
      <Canvas camera={{ position: [30, 30, 100], fov: 55 }}>
        <color attach="background" args={["#a7c7df"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 100, 100]} intensity={1} />
        <Sky sunPosition={[100, 10, 100]} />

        <WaterPlane />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEABED_Y, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#0a1a1f" />
        </mesh>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
