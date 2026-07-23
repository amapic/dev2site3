"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const MODEL_PATH = "/PlantOrchid001_Blender_Cycles3.glb";

export default function Page() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c0c);

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 1000);
    camera.position.set(2, 2, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    try {
      // for newer three versions
      (renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace ?? (THREE as any).GammaEncoding;
    } catch (e) {
      // ignore
    }
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    const loader = new GLTFLoader();
    let model: THREE.Object3D | null = null;

    loader.load(
      MODEL_PATH,
      (gltf) => {
        model = gltf.scene;
        scene.add(model);

        // center
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.x += -center.x;
        model.position.y += -center.y;
        model.position.z += -center.z;

        // scale to fit into ~2 units
        const maxDim = Math.max(size.x, size.y, size.z, 0.001);
        const fitScale = 2.0 / maxDim;
        model.scale.setScalar(fitScale);
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error("GLTF load error", err);
      }
    );

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = Math.max(1, mount.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    let frameId = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);

      if (model) {
        model.traverse((child) => {
          if ((child as any).geometry) (child as any).geometry.dispose();
          if ((child as any).material) {
            const m = (child as any).material;
            if (Array.isArray(m)) m.forEach((mat) => mat.dispose());
            else m.dispose();
          }
        });
      }

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main style={{ width: "100%", height: "80vh", display: "block" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
    </main>
  );
}
