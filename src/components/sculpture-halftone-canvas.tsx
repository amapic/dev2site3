"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_PATH = "/model/mvadapter_model_texture_mesh_28c8394359fa0806.glb.glb";
const VERTEX_SAMPLE_RATIO = 1.0;
const TARGET_MODEL_MAX_DIMENSION = 4.2;
const FIXED_PARAMS = {
  sizeMin: 0.045,
  sizeMax: 0.12,
  tiltMinDeg: 0,
  tiltMaxDeg: 24,
  tiltRandomness: 1,
};

const SECTION1_COLORS_A = ["#8ad8d3", "#5da9b3", "#1f5378", "#9fd9cf", "#d4e4de"];
const SECTION1_COLORS_B = ["#f06d5e", "#d9474f", "#f5b479", "#31204a", "#8f2f49", "#f4c784", "#1f355d"];
const SECTION1_COLORS_C = ["#7fcfc8", "#57b2aa", "#2b6f8a", "#0f2b4a", "#c8d8cc", "#9fd9cf"];

function colorBySection1RibbonPosition(t: number, rand: () => number) {
  const r = rand();

  if (t < 0.22) {
    return SECTION1_COLORS_A[Math.floor(r * SECTION1_COLORS_A.length)];
  }

  if (t < 0.72) {
    return SECTION1_COLORS_B[Math.floor(r * SECTION1_COLORS_B.length)];
  }

  return SECTION1_COLORS_C[Math.floor(r * SECTION1_COLORS_C.length)];
}

function hashNoise(index: number, seed: number) {
  const x = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function randomRange(index: number, seed: number, min: number, max: number) {
  const t = hashNoise(index, seed);
  return min + (max - min) * t;
}

function buildTriangleGeometry() {
  const triangle = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    0.0, 0.62, 0.0,
    -0.54, -0.31, 0.0,
    0.54, -0.31, 0.0,
  ]);
  triangle.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  return triangle;
}

function buildTextureSampler(texture: THREE.Texture | null) {
  if (!texture || !texture.image) {
    return null;
  }

  const image = texture.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap;
  const width = (image as { width?: number }).width ?? 0;
  const height = (image as { height?: number }).height ?? 0;

  if (width <= 0 || height <= 0) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    return null;
  }

  ctx.drawImage(image as CanvasImageSource, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;

  return (u: number, v: number) => {
    const uu = THREE.MathUtils.clamp(u, 0, 1);
    const vv = THREE.MathUtils.clamp(v, 0, 1);
    const x = Math.min(width - 1, Math.max(0, Math.floor(uu * (width - 1))));
    const y = Math.min(height - 1, Math.max(0, Math.floor((1 - vv) * (height - 1))));
    const i = (y * width + x) * 4;

    return new THREE.Color(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
  };
}

export default function SculptureHalftoneCanvas() {
  const sceneHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = sceneHostRef.current;

    if (!host) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#080d26");

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0.75, 0.9, 5.1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.95;
    controls.panSpeed = 0.72;
    controls.minDistance = 0.6;
    controls.maxDistance = 24;
    controls.target.set(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    const ambient = new THREE.AmbientLight(0xffffff, 1.05);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(2.4, 3.4, 2.2);
    scene.add(key);

    const fill = new THREE.DirectionalLight("#77d2da", 0.3);
    fill.position.set(-2.5, 1.3, -1.8);
    scene.add(fill);

    let isDisposed = false;
    let cleanupLoaded: (() => void) | null = null;

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      MODEL_PATH,
      (gltf) => {
        if (isDisposed) {
          return;
        }

        let sourceGeometry: THREE.BufferGeometry | null = null;
        let sourceMap: THREE.Texture | null = null;

        gltf.scene.traverse((child) => {
          if (!(child instanceof THREE.Mesh) || sourceGeometry) {
            return;
          }

          sourceGeometry = (child.geometry as THREE.BufferGeometry).clone();
          const material = child.material;

          if (Array.isArray(material)) {
            const firstMat = material[0] as THREE.MeshStandardMaterial | undefined;
            sourceMap = firstMat?.map ?? null;
          } else {
            sourceMap = (material as THREE.MeshStandardMaterial).map ?? null;
          }
        });

        if (!sourceGeometry) {
          console.error("Aucune geometrie trouvee dans le GLB");
          return;
        }

        const geometry = sourceGeometry as THREE.BufferGeometry;

        geometry.center();
        geometry.computeBoundingBox();

        if (geometry.boundingBox) {
          const boxSize = new THREE.Vector3();
          geometry.boundingBox.getSize(boxSize);
          const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z, 0.0001);
          const scaleFactor = TARGET_MODEL_MAX_DIMENSION / maxDim;
          geometry.scale(scaleFactor, scaleFactor, scaleFactor);
        }

        geometry.computeVertexNormals();

        const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
        const normals = geometry.getAttribute("normal") as THREE.BufferAttribute;
        const uvs = geometry.getAttribute("uv") as THREE.BufferAttribute | undefined;

        const pos = positions.array as Float32Array;
        const nor = normals.array as Float32Array;
        const uv = uvs ? (uvs.array as Float32Array) : null;

        const sampledIndices: number[] = [];
        const sampleStep = Math.max(1, Math.floor(1 / VERTEX_SAMPLE_RATIO));

        for (let i = 0; i < positions.count; i += sampleStep) {
          sampledIndices.push(i);
        }

        const pointCount = sampledIndices.length;

        const triangleGeometry = buildTriangleGeometry();
        const triangleMaterial = new THREE.MeshBasicMaterial({
          color: "#ffffff",
          toneMapped: false,
          side: THREE.DoubleSide,
          depthWrite: true,
          depthTest: true,
        });

        const triangles = new THREE.InstancedMesh(triangleGeometry, triangleMaterial, pointCount);
        triangles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        triangles.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(pointCount * 3), 3);
        triangles.frustumCulled = false;
        const instanceColor = triangles.instanceColor;

        const zAxis = new THREE.Vector3(0, 0, 1);
        const normal = new THREE.Vector3();
        const position = new THREE.Vector3();
        const tangent = new THREE.Vector3();
        const bitangent = new THREE.Vector3();
        const worldUp = new THREE.Vector3(0, 1, 0);
        const fallbackRight = new THREE.Vector3(1, 0, 0);
        const tiltAxis = new THREE.Vector3();
        const baseQuat = new THREE.Quaternion();
        const tiltQuat = new THREE.Quaternion();
        const finalQuat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();

        const textureSampler = buildTextureSampler(sourceMap);

        const updateInstances = () => {
          const p = FIXED_PARAMS;
  
          for (let i = 0; i < pointCount; i += 1) {
            const idx = sampledIndices[i];

            position.set(pos[idx * 3], pos[idx * 3 + 1], pos[idx * 3 + 2]);
            normal.set(nor[idx * 3], nor[idx * 3 + 1], nor[idx * 3 + 2]).normalize();

            baseQuat.setFromUnitVectors(zAxis, normal);

            tangent.crossVectors(normal, worldUp);
            if (tangent.lengthSq() < 0.000001) {
              tangent.crossVectors(normal, fallbackRight);
            }
            tangent.normalize();
            bitangent.crossVectors(normal, tangent).normalize();

            const axisAngle = randomRange(i, 17, 0, Math.PI * 2);
            tiltAxis
              .copy(tangent)
              .multiplyScalar(Math.cos(axisAngle))
              .addScaledVector(bitangent, Math.sin(axisAngle))
              .normalize();

            const tiltMin = THREE.MathUtils.degToRad(p.tiltMinDeg);
            const tiltMax = THREE.MathUtils.degToRad(p.tiltMaxDeg);
            const rawTilt = randomRange(i, 29, tiltMin, tiltMax);
            const signedTilt = rawTilt * (hashNoise(i, 41) > 0.5 ? 1 : -1) * p.tiltRandomness;
            tiltQuat.setFromAxisAngle(tiltAxis, signedTilt);

            finalQuat.copy(baseQuat).multiply(tiltQuat);

            const s = randomRange(i, 53, p.sizeMin, p.sizeMax);
            scale.set(s, s, 1);

            matrix.compose(position, finalQuat, scale);
            triangles.setMatrixAt(i, matrix);

            if (textureSampler && uv) {
              const u = uv[idx * 2];
              const v = uv[idx * 2 + 1];
              color.copy(textureSampler(u, v));
            } else {
              const ribbonT = THREE.MathUtils.clamp((position.x / TARGET_MODEL_MAX_DIMENSION) + 0.5, 0, 1);
              const baseHex = colorBySection1RibbonPosition(ribbonT, () => hashNoise(i, 97));
              color.set(baseHex);
            }

            instanceColor.setXYZ(i, color.r, color.g, color.b);
          }

          triangles.instanceMatrix.needsUpdate = true;
          instanceColor.needsUpdate = true;
          triangleMaterial.needsUpdate = true;
        };

        updateInstances();

        // Modèle texturé normal
        const modelMesh = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({ map: sourceMap ?? undefined, side: THREE.DoubleSide })
        );
        group.add(modelMesh);
        group.add(triangles);

        const renderScene = () => {
          renderer.render(scene, camera);
        };

        controls.update();
        renderScene();
        controls.addEventListener("change", renderScene);

        const setSize = () => {
          const width = host.clientWidth;
          const height = host.clientHeight;

          camera.aspect = width / Math.max(1, height);
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(width, height, false);

          renderScene();
        };

        setSize();
        window.addEventListener("resize", setSize);

        cleanupLoaded = () => {
          window.removeEventListener("resize", setSize);
          controls.removeEventListener("change", renderScene);
          group.remove(triangles);
          group.remove(modelMesh);
          triangleGeometry.dispose();
          triangleMaterial.dispose();
          (modelMesh.material as THREE.MeshStandardMaterial).dispose();
          sourceGeometry?.dispose();
        };
      },
      undefined,
      (error) => {
        console.error("Echec de chargement du GLB", error);
      }
    );

    return () => {
      isDisposed = true;
      cleanupLoaded?.();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={sceneHostRef} style={{ width: "100%", height: "100%" }} />;
}
