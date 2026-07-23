"use client";

import React from "react";

export default function OndulationPage() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    let cleanup = () => {};
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      const THREE: any = await import("three");
      if (!mounted) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 0, 3);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      // Lights (adjusted for stronger contrast/highlights)
      const ambient = new THREE.AmbientLight(0xffffff, 0.45);
      scene.add(ambient);
      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.35);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 1.6);
      dir.position.set(0.5, 1, 0.5);
      scene.add(dir);
      // subtle rim light to boost highlights on edges
      const rim = new THREE.DirectionalLight(0xffffff, 0.28);
      rim.position.set(-0.6, 0.4, -0.7);
      scene.add(rim);

      // Calculate plane size to fill view
      const vFOV = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;

      const segments = 140;
      const planeWidth = visibleWidth * 0.98;
      const planeHeight = visibleHeight * 0.98;
      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segments, segments);

      const material: any = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        flatShading: false,
        roughness: 0.45,
        metalness: 0.0,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Save original positions
      const posArray = geometry.attributes.position.array as Float32Array;
      const vertexCount = posArray.length / 3;
      const original = new Float32Array(posArray.length);
      for (let i = 0; i < posArray.length; i++) original[i] = posArray[i];

      type Ripple = { x: number; y: number; start: number; amplitude: number; speed: number; wavelength: number; decay: number };
      const ripples: Ripple[] = [];

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      function addRipple(worldPoint: any) {
        const p = worldPoint.clone();
        mesh.worldToLocal(p);
          // speed reduced to slow wave propagation
        ripples.push({ x: p.x, y: p.y, start: performance.now() / 1000, amplitude: 0.05, speed: 0.5, wavelength: 0.35, decay: 0.1 });
        if (ripples.length > 8) ripples.shift();
      }

      const loader = new THREE.TextureLoader();
      let canvasTexture: any = null;
      let baseCanvas: HTMLCanvasElement | null = null;
      let baseCtx: CanvasRenderingContext2D | null = null;
      let workCanvas: HTMLCanvasElement | null = null;
      let workCtx: CanvasRenderingContext2D | null = null;
      let iw = 0;
      let ih = 0;

      // Draw image + text to a base canvas, create a working canvas that we update each frame
      loader.load("/monet/nympheas.jpg", (loadedTex: any) => {
        const img = loadedTex.image as HTMLImageElement | HTMLCanvasElement;
        iw = (img && (img.naturalWidth || (img as any).width)) || 2048;
        ih = (img && (img.naturalHeight || (img as any).height)) || 1024;

        baseCanvas = document.createElement("canvas");
        baseCanvas.width = iw;
        baseCanvas.height = ih;
        baseCtx = baseCanvas.getContext("2d");
        if (!baseCtx) return;

        try {
          baseCtx.filter = "brightness(1.12) contrast(1.25) saturate(1.22)";
          baseCtx.imageSmoothingEnabled = true;
          (baseCtx as any).imageSmoothingQuality = "high";
          baseCtx.drawImage(img as CanvasImageSource, 0, 0, iw, ih);
          baseCtx.filter = "none";

          // subtle vignette to focus center and increase apparent contrast
          try {
            const gx = iw / 2;
            const gy = ih / 2;
            const rInner = Math.min(iw, ih) * 0.12;
            const rOuter = Math.max(iw, ih) * 0.62;
            const grad = baseCtx.createRadialGradient(gx, gy, rInner, gx, gy, rOuter);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,0.22)");
            baseCtx.save();
            baseCtx.globalCompositeOperation = "multiply";
            baseCtx.fillStyle = grad;
            baseCtx.fillRect(0, 0, iw, ih);
            baseCtx.restore();
          } catch (e) {}
        } catch (e) {
          baseCtx.fillStyle = "#222";
          baseCtx.fillRect(0, 0, iw, ih);
        }

        const text = "Bonjour, ça roule ?";
        const fontSize = Math.floor(Math.min(iw, ih) * 0.18);
        baseCtx.font = `900 ${fontSize}px 'Bebas Neue', Arial Black, Arial, sans-serif`;
        baseCtx.textAlign = "center";
        baseCtx.textBaseline = "middle";
        // stronger black outline
        baseCtx.lineWidth = Math.max(6, Math.round(fontSize * 0.09));
        baseCtx.strokeStyle = "rgba(0,0,0,0.95)";
        baseCtx.strokeText(text, iw / 2, ih / 2);
        // white fill with soft shadow for depth
        baseCtx.save();
        baseCtx.shadowColor = "rgba(0,0,0,0.72)";
        baseCtx.shadowBlur = Math.max(8, Math.round(fontSize * 0.06));
        baseCtx.shadowOffsetY = Math.max(2, Math.round(fontSize * 0.02));
        baseCtx.fillStyle = "#ffffff";
        baseCtx.fillText(text, iw / 2, ih / 2);
        baseCtx.restore();

        // Working canvas where we'll composite base + dynamic highlights each frame
        workCanvas = document.createElement("canvas");
        workCanvas.width = iw;
        workCanvas.height = ih;
        workCtx = workCanvas.getContext("2d");
        if (!workCtx) return;

        // initialize work canvas with base
        workCtx.drawImage(baseCanvas, 0, 0);

        canvasTexture = new THREE.CanvasTexture(workCanvas);
        try { canvasTexture.encoding = (THREE as any).sRGBEncoding; } catch (e) {}
        canvasTexture.needsUpdate = true;
        try { canvasTexture.anisotropy = renderer.capabilities.getMaxAnisotropy(); } catch (e) {}

        try {
          renderer.outputEncoding = (THREE as any).sRGBEncoding;
          renderer.toneMapping = (THREE as any).ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.15;
        } catch (e) {}

        material.map = canvasTexture;
        material.needsUpdate = true;

        try { loadedTex.dispose(); } catch (e) {}
      });

      function onPointerDown(e: PointerEvent) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(mesh);
        if (hits.length > 0) addRipple(hits[0].point);
      }

      renderer.domElement.addEventListener("pointerdown", onPointerDown);

      function animate() {
        const time = performance.now() / 1000;

        for (let i = 0; i < vertexCount; i++) {
          const ix = i * 3;
          const x = original[ix];
          const y = original[ix + 1];
          const z0 = original[ix + 2];
          let dz = 0;
            for (let r = 0; r < ripples.length; r++) {
              const rip = ripples[r];
              const dx = x - rip.x;
              const dy = y - rip.y;
              const d = Math.sqrt(dx * dx + dy * dy) + 1e-6;
              const t = time - rip.start;
              if (t >= 0) {
                const k = (2 * Math.PI) / rip.wavelength;
                const envelope = Math.exp(-rip.decay * t);

                // Compute distance from the traveling wavefront (u = d - speed * t).
                // Use a narrow pulse (gaussian) around the front so points far
                // from the current wavefront get negligible displacement — this
                // enforces apparent propagation instead of instant global oscillation.
                const u = d - rip.speed * t;
                const spread = Math.max(0.02, rip.wavelength * 0.3);
                const pulse = Math.exp(-(u * u) / (2 * spread * spread));

                const attenuation = 1 / (1 + d * 6);
                dz += rip.amplitude * envelope * pulse * Math.sin(k * u) * attenuation;
              }
            }
          posArray[ix + 2] = z0 + dz;
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        // Draw highlight rings on work canvas based on ripple crest intensity
        try {
          if (workCtx && baseCanvas && canvasTexture) {
            // reset to base
            workCtx.clearRect(0, 0, iw, ih);
            workCtx.drawImage(baseCanvas, 0, 0);

            // for each ripple, draw an expanding ring centered at the impact,
            // converting world units to canvas pixels so the ring follows the wave
            const pxPerWorld = iw / planeWidth;
            const pyPerWorld = ih / planeHeight;
            const pixelScale = (pxPerWorld + pyPerWorld) * 0.5;
            for (let r = 0; r < ripples.length; r++) {
              const rip = ripples[r];
              const t = time - rip.start;
              if (t < 0) continue;

              // radius in world units -> pixels
              const worldRadius = Math.max(0, rip.speed * t);
              const ringRadius = worldRadius * pixelScale;

              // visual intensity (amplitude is often small) – boost for visibility
              const intensity = rip.amplitude * Math.exp(-rip.decay * t);
              const alpha = Math.min(0.95, intensity * 10);

              // convert ripple center in plane-local coordinates to canvas pixels
              const px = ((rip.x / planeWidth) + 0.5) * iw;
              const py = ((-rip.y / planeHeight) + 0.5) * ih;

              // draw a soft bright ring using stroke + additive blend
              workCtx.save();
              workCtx.globalCompositeOperation = "lighter";

              // outer faint glow (blur simulated with multiple strokes)
              const glowAlpha = Math.min(0.6, alpha * 0.6);
              for (let g = 3; g >= 1; g--) {
                workCtx.beginPath();
                workCtx.arc(px, py, Math.max(1, ringRadius) + g * 2, 0, Math.PI * 2);
                workCtx.strokeStyle = `rgba(255,255,255,${glowAlpha * (0.22 / g)})`;
                workCtx.lineWidth = Math.max(1, Math.round(Math.max(1, ringRadius * 0.02) * g));
                workCtx.stroke();
              }

              // main ring
              workCtx.beginPath();
              workCtx.arc(px, py, Math.max(1, ringRadius), 0, Math.PI * 2);
              workCtx.strokeStyle = `rgba(255,255,255,${alpha})`;
              workCtx.lineWidth = Math.max(2, Math.round(Math.max(1, ringRadius * 0.05)));
              workCtx.stroke();

              workCtx.restore();
            }

            canvasTexture.needsUpdate = true;
          }
        } catch (e) {}

        renderer.render(scene, camera);
        rafRef.current = requestAnimationFrame(animate);
      }

      rafRef.current = requestAnimationFrame(animate);

      function onResize() {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      window.addEventListener("resize", onResize);

      cleanup = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        try { renderer.domElement.removeEventListener("pointerdown", onPointerDown); } catch (e) {}
        try { window.removeEventListener("resize", onResize); } catch (e) {}
        try { geometry.dispose(); } catch (e) {}
        try { material.dispose(); } catch (e) {}
        try { if (canvasTexture) canvasTexture.dispose(); } catch (e) {}
        try { renderer.dispose(); } catch (e) {}
        try { if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); } catch (e) {}
      };
    })();

    return () => {
      mounted = false;
      try { cleanup(); } catch (e) {}
    };
  }, []);

  return (
    <div className="w-full h-screen relative">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute left-4 top-4 z-50 text-white  p-2 rounded text-sm">
        Cliquez / touchez la surface pour créer un impact
      </div>
    </div>
  );
}
