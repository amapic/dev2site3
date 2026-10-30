"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type UiUxPrismBackgroundProps = {
  className?: string;
};

type PrismMeta = {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  spin: number;
  driftX: number;
  driftY: number;
  phase: number;
  amplitude: number;
};

export function UiUxPrismBackground({ className }: UiUxPrismBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const colors = [
      new THREE.Color("#ffb479"),
      new THREE.Color("#ff8fc4"),
      new THREE.Color("#ffd8a8"),
      new THREE.Color("#84d7ff"),
      new THREE.Color("#cfefff"),
      new THREE.Color("#ffddb8"),
    ];

    const prisms: PrismMeta[] = [];
    for (let index = 0; index < 20; index += 1) {
      const radius = 0.12 + Math.random() * 0.22;
      const geometry = new THREE.CircleGeometry(radius, 3);
      const material = new THREE.MeshBasicMaterial({
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.12 + Math.random() * 0.16,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        -1.1 + Math.random() * 2.2,
        -0.8 + Math.random() * 1.6,
        -0.3 + Math.random() * 0.6,
      );
      mesh.rotation.z = Math.random() * Math.PI * 2;
      mesh.scale.setScalar(0.75 + Math.random() * 1.2);
      group.add(mesh);

      prisms.push({
        mesh,
        spin: (Math.random() - 0.5) * 0.0015,
        driftX: (Math.random() - 0.5) * 0.08,
        driftY: (Math.random() - 0.5) * 0.05,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0.04 + Math.random() * 0.08,
      });
    }

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight, false);

      const aspect = clientWidth / Math.max(clientHeight, 1);
      const viewHeight = 1;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = viewHeight;
      camera.bottom = -viewHeight;
      camera.updateProjectionMatrix();
    };

    resize();

    const startTime = performance.now();
    let frameId = 0;

    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;

      prisms.forEach(({ mesh, spin, driftX, driftY, phase, amplitude }, index) => {
        mesh.rotation.z += spin;
        mesh.position.x += Math.sin(elapsed * 0.21 + phase + index) * driftX * 0.0009;
        mesh.position.y += Math.cos(elapsed * 0.33 + phase + index) * driftY * 0.0009;
        mesh.position.y += Math.sin(elapsed * 0.45 + phase) * amplitude * 0.0015;
      });

      group.rotation.z = Math.sin(elapsed * 0.12) * 0.08;
      group.position.x = Math.sin(elapsed * 0.08) * 0.04;
      group.position.y = Math.cos(elapsed * 0.12) * 0.03;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      prisms.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}