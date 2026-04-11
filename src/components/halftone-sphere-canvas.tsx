"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const LATITUDE_STEPS = 58;
const LONGITUDE_STEPS = 92;
const SPHERE_RADIUS = 2.45;
const POLE_DENT_STRENGTH = 0.12;
const POLE_DENT_POWER = 2.4;
const BASE_POINT_RADIUS = 0.041;

// Taille absolue par point, basee sur sa distance reelle a la camera.
// Le plus proche prend SIZE_FOR_CLOSEST_POINT, le plus loin SIZE_FOR_FARTHEST_POINT.
const DISTANCE_SIZE_EFFECT = 1;
const SIZE_FOR_CLOSEST_POINT = 1.9;
const SIZE_FOR_FARTHEST_POINT = 0.1;
const NEIGHBOR_GAP_FACTOR = 0.94;
const RING_INNER_RATIO = 0.74;

function poleDentScale(normalY: number) {
  const influence = Math.pow(Math.abs(normalY), POLE_DENT_POWER);
  return 1 - POLE_DENT_STRENGTH * influence;
}

function createDentedSphereGeometry(radius: number) {
  const geometry = new THREE.SphereGeometry(radius, 64, 64);
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i).normalize();
    const scale = poleDentScale(vertex.y);
    position.setXYZ(i, vertex.x * radius * scale, vertex.y * radius * scale, vertex.z * radius * scale);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function buildCheckerSphere(latitudeSteps: number, longitudeSteps: number, radius: number) {
  const pointCount = latitudeSteps * longitudeSteps;
  const positions = new Float32Array(pointCount * 3);
  const normals = new Float32Array(pointCount * 3);
  const sizes = new Float32Array(pointCount);

  let index = 0;
  const phiStart = 0.06 * Math.PI;
  const phiEnd = Math.PI - 0.06 * Math.PI;

  for (let lat = 0; lat < latitudeSteps; lat += 1) {
    const v = lat / Math.max(1, latitudeSteps - 1);
    const phi = THREE.MathUtils.lerp(phiStart, phiEnd, v);

    for (let lon = 0; lon < longitudeSteps; lon += 1) {
      const u = lon / longitudeSteps;
      const theta = u * Math.PI * 2;

      const sinPhi = Math.sin(phi);
      const x = sinPhi * Math.cos(theta);
      const y = Math.cos(phi);
      const z = sinPhi * Math.sin(theta);
      const dentScale = poleDentScale(y);

      positions[index * 3] = x * radius * dentScale;
      positions[index * 3 + 1] = y * radius * dentScale;
      positions[index * 3 + 2] = z * radius * dentScale;

      normals[index * 3] = x;
      normals[index * 3 + 1] = y;
      normals[index * 3 + 2] = z;

      sizes[index] = BASE_POINT_RADIUS;
      index += 1;
    }
  }

  return { pointCount, positions, normals, sizes };
}

export default function HalftoneSphereCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#080d26");

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 8.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.7;
    controls.minDistance = 3.4;
    controls.maxDistance = 16;
    controls.target.set(0, 0, 0);

    const group = new THREE.Group();
    group.rotation.set(-0.22, 0.36, 0);
    scene.add(group);

    const coreGeometry = createDentedSphereGeometry(SPHERE_RADIUS * 0.992);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: "#0f153f",
      side: THREE.FrontSide,
      transparent: false,
    });
    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(coreSphere);

    const { pointCount, positions, normals, sizes } = buildCheckerSphere(
      LATITUDE_STEPS,
      LONGITUDE_STEPS,
      SPHERE_RADIUS
    );
    const maxAllowedRadii = new Float32Array(pointCount);

    const getDistanceBetweenPoints = (indexA: number, indexB: number) => {
      const ax = positions[indexA * 3];
      const ay = positions[indexA * 3 + 1];
      const az = positions[indexA * 3 + 2];
      const bx = positions[indexB * 3];
      const by = positions[indexB * 3 + 1];
      const bz = positions[indexB * 3 + 2];
      const dx = ax - bx;
      const dy = ay - by;
      const dz = az - bz;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    for (let lat = 0; lat < LATITUDE_STEPS; lat += 1) {
      for (let lon = 0; lon < LONGITUDE_STEPS; lon += 1) {
        const index = lat * LONGITUDE_STEPS + lon;
        let minNeighborDistance = Number.POSITIVE_INFINITY;

        const left = lat * LONGITUDE_STEPS + ((lon - 1 + LONGITUDE_STEPS) % LONGITUDE_STEPS);
        const right = lat * LONGITUDE_STEPS + ((lon + 1) % LONGITUDE_STEPS);

        minNeighborDistance = Math.min(minNeighborDistance, getDistanceBetweenPoints(index, left));
        minNeighborDistance = Math.min(minNeighborDistance, getDistanceBetweenPoints(index, right));

        if (lat > 0) {
          const up = (lat - 1) * LONGITUDE_STEPS + lon;
          const upLeft = (lat - 1) * LONGITUDE_STEPS + ((lon - 1 + LONGITUDE_STEPS) % LONGITUDE_STEPS);
          const upRight = (lat - 1) * LONGITUDE_STEPS + ((lon + 1) % LONGITUDE_STEPS);
          minNeighborDistance = Math.min(minNeighborDistance, getDistanceBetweenPoints(index, up));
          minNeighborDistance = Math.min(minNeighborDistance, getDistanceBetweenPoints(index, upLeft));
          minNeighborDistance = Math.min(minNeighborDistance, getDistanceBetweenPoints(index, upRight));
        }

        if (lat < LATITUDE_STEPS - 1) {
          const down = (lat + 1) * LONGITUDE_STEPS + lon;
          const downLeft =
            (lat + 1) * LONGITUDE_STEPS + ((lon - 1 + LONGITUDE_STEPS) % LONGITUDE_STEPS);
          const downRight = (lat + 1) * LONGITUDE_STEPS + ((lon + 1) % LONGITUDE_STEPS);
          minNeighborDistance = Math.min(minNeighborDistance, getDistanceBetweenPoints(index, down));
          minNeighborDistance = Math.min(minNeighborDistance, getDistanceBetweenPoints(index, downLeft));
          minNeighborDistance = Math.min(minNeighborDistance, getDistanceBetweenPoints(index, downRight));
        }

        maxAllowedRadii[index] = 0.5 * minNeighborDistance * NEIGHBOR_GAP_FACTOR;
      }
    }

    const diskGeometry = new THREE.CircleGeometry(1, 18);
    const diskMaterial = new THREE.MeshBasicMaterial({
      color: "#f6f8ff",
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
    });

    const disks = new THREE.InstancedMesh(diskGeometry, diskMaterial, pointCount);
    disks.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const ringGeometry = new THREE.RingGeometry(RING_INNER_RATIO, 1, 18);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: "#07102f",
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
    });
    const rings = new THREE.InstancedMesh(ringGeometry, ringMaterial, pointCount);
    rings.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const zAxis = new THREE.Vector3(0, 0, 1);
    const normal = new THREE.Vector3();
    const position = new THREE.Vector3();
    const worldPosition = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const matrix = new THREE.Matrix4();
    const distances = new Float32Array(pointCount);

    const updateDiskScalesFromCameraDistance = () => {
      scene.updateMatrixWorld(true);

      let minDistance = Number.POSITIVE_INFINITY;
      let maxDistance = Number.NEGATIVE_INFINITY;

      for (let i = 0; i < pointCount; i += 1) {
        position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        worldPosition.copy(position).applyMatrix4(group.matrixWorld);

        const absoluteDistance = camera.position.distanceTo(worldPosition);
        distances[i] = absoluteDistance;

        if (absoluteDistance < minDistance) {
          minDistance = absoluteDistance;
        }
        if (absoluteDistance > maxDistance) {
          maxDistance = absoluteDistance;
        }
      }

      const distanceSpan = Math.max(0.0001, maxDistance - minDistance);

      for (let i = 0; i < pointCount; i += 1) {
        position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        normal.set(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]).normalize();
        quaternion.setFromUnitVectors(zAxis, normal);

        const t = THREE.MathUtils.clamp((distances[i] - minDistance) / distanceSpan, 0, 1);

        const targetMultiplier = THREE.MathUtils.lerp(
          SIZE_FOR_CLOSEST_POINT,
          SIZE_FOR_FARTHEST_POINT,
          t
        );
        const finalMultiplier = THREE.MathUtils.lerp(1, targetMultiplier, DISTANCE_SIZE_EFFECT);

        const desiredSize = sizes[i] * finalMultiplier;
        const size = Math.min(desiredSize, maxAllowedRadii[i]);
        scale.set(size, size, 1);

        matrix.compose(position, quaternion, scale);
        disks.setMatrixAt(i, matrix);
        rings.setMatrixAt(i, matrix);
      }

      disks.instanceMatrix.needsUpdate = true;
      rings.instanceMatrix.needsUpdate = true;
    };

    updateDiskScalesFromCameraDistance();
    group.add(disks);
    group.add(rings);

    const renderScene = () => {
      updateDiskScalesFromCameraDistance();
      renderer.render(scene, camera);
    };

    controls.update();
    controls.addEventListener("change", renderScene);

    const setSize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);

      controls.update();
      renderScene();
    };

    setSize();
    window.addEventListener("resize", setSize);

    return () => {
      window.removeEventListener("resize", setSize);
      controls.removeEventListener("change", renderScene);
      controls.dispose();

      group.remove(disks);
      group.remove(rings);
      group.remove(coreSphere);
      coreGeometry.dispose();
      coreMaterial.dispose();
      diskGeometry.dispose();
      diskMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="halftone-sphere-canvas" />;
}
