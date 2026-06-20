"use client";
// 265222461
import React from "react";
import styles from "./page.module.css";

import { gsap } from "gsap";
import * as THREE from "three";

export default function NewGenesisTextDemoPage() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const revealRef = React.useRef<HTMLDivElement | null>(null);
  const [seed, setSeed] = React.useState<string>(() => String(Math.floor(Math.random() * 1e9)));
  const seedRef = React.useRef<string>(seed);
  const [locked, setLocked] = React.useState(false);
  const [regen, setRegen] = React.useState(0);

  React.useEffect(() => {
    seedRef.current = seed;
  }, [seed]);
  const bgPath = "/monet/arbre.jpg";
  const maskPath = "/monet/image%20(1).png";

  // ratio cache/bg : cache = bg * ratio
  const ratioX = 10.52 / 11.94; // x scale (cache relative to bg)
  const ratioY = 8.25 / 9.23; // y scale (cache relative to bg)

  const [overlayStyles, setOverlayStyles] = React.useState<React.CSSProperties>(
    {
      WebkitMaskImage: `url('${maskPath}')`,
      WebkitMaskSize: "contain",
      WebkitMaskPosition: "center",
      WebkitMaskRepeat: "no-repeat",
      maskImage: `url('${maskPath}')`,
      maskSize: "contain",
      maskPosition: "center",
      maskRepeat: "no-repeat",
      maskMode: "luminance",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    },
  );

  React.useEffect(() => {
    let mounted = true;

    const bgImg = new Image();
    bgImg.src = bgPath;

    function compute() {
      const container = containerRef.current;
      const cw = container?.clientWidth ?? window.innerWidth;
      const ch = container?.clientHeight ?? window.innerHeight;

      const bgW = bgImg.naturalWidth || 0;
      const bgH = bgImg.naturalHeight || 0;

      if (!bgW || !bgH) {
        // fallback: keep center/contain
        if (mounted) setOverlayStyles((s) => ({ ...s }));
        return;
      }

      const scale = Math.min(cw / bgW, ch / bgH);
      const renderedBgW = bgW * scale;
      const renderedBgH = bgH * scale;

      const maskW = renderedBgW * ratioX;
      const maskH = renderedBgH * ratioY;

      const posX = (cw - maskW) / 2;
      const posY = (ch - maskH) / 2;

      if (mounted) {
        setOverlayStyles({
          WebkitMaskImage: `url('${maskPath}')`,
          WebkitMaskSize: `${Math.round(maskW)}px ${Math.round(maskH)}px`,
          WebkitMaskPosition: `${Math.round(posX)}px ${Math.round(posY)}px`,
          WebkitMaskRepeat: "no-repeat",
          maskImage: `url('${maskPath}')`,
          maskSize: `${Math.round(maskW)}px ${Math.round(maskH)}px`,
          maskPosition: `${Math.round(posX)}px ${Math.round(posY)}px`,
          maskRepeat: "no-repeat",
          maskMode: "luminance",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        });
      }
    }

    const onResize = () => compute();

    bgImg.onload = () => compute();
    window.addEventListener("resize", onResize);

    // also run immediately in case image cached
    if (bgImg.complete) compute();

    return () => {
      mounted = false;
      window.removeEventListener("resize", onResize);
    };
  }, [bgPath, maskPath]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    gsap.set(video, { x: 0, willChange: "transform" });

    // run the animation once; after completion swap the video source to dos.mp4
    const tl = gsap.timeline({ repeat: 0, defaults: { ease: "power2.inOut" } });

    // animation : vers la droite, puis vers la gauche
    tl.to(video, { x: 600, duration: 3 }).to(video, { x: -200, duration: 3, delay: 0.6 });

    tl.eventCallback("onComplete", () => {
      const v = videoRef.current;
      if (!v) return;
      try {
        v.src = "/monet/dos.mp4";
        v.load();
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } catch (e) {
        // ignore
      }
    });

    return () => {
      tl.kill();
      gsap.set(video, { x: 0 });
    };
  }, [regen]);

  React.useEffect(() => {
    const host = revealRef.current;
    if (!host) return;

    // deterministic RNG from seedRef.current
    function strToSeed(s: string) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
      }
      return h >>> 0;
    }

    function mulberry32(a: number) {
      return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const seedValue = seedRef.current ?? "0";
    const seedNum = typeof seedValue === "string" ? strToSeed(seedValue) : Number(seedValue);
    const rng = mulberry32(seedNum);

    const width = host.clientWidth || window.innerWidth;
    const height = host.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, width, height, 0, -1000, 1000);
    camera.position.z = 1;

    // helper: create a rounded polygon texture (hex/hept) on a small canvas
    function makeShapeTexture(sides = 6, radius = 60, blur = 8) {
      const size = Math.ceil(radius * 2 + blur * 2);
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      if (!ctx) return null;

      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#ffffff";
      ctx.translate(size / 2, size / 2);
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      // add slight rounding using shadow blur to soften edges
      ctx.fill();
      // create soft alpha by drawing on secondary canvas with blur
      const temp = document.createElement("canvas");
      temp.width = temp.height = size;
      const tctx = temp.getContext("2d");
      if (!tctx) return null;
      tctx.clearRect(0, 0, size, size);
      tctx.filter = `blur(${blur}px)`;
      tctx.drawImage(c, 0, 0);

      const tex = new THREE.CanvasTexture(temp);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      return tex;
    }

    // Pre-generate a few textures for variety
    const textures: THREE.Texture[] = [];
    for (let i = 0; i < 6; i++) {
      const sides = i % 2 === 0 ? 6 : 7;
      const radius = 36 + (i % 3) * 8 + Math.floor(i / 3) * 6;
      const blur = 6 + (i % 2) * 3;
      const t = makeShapeTexture(sides, radius, blur);
      if (t) textures.push(t);
    }

    const sprites: { sprite: THREE.Sprite; radius: number }[] = [];
    const count = 56; // increased count to cover canvas more densely
    for (let i = 0; i < count; i++) {
      const tex = textures[Math.floor(rng() * textures.length)];
      const mat = new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(0.88, 0.80, 0.68), transparent: true });
      const sp = new THREE.Sprite(mat);

      // random position across canvas, allow exceeding bounds
      const x = (rng() - 0.1) * width * 1.2;
      const y = (rng() - 0.1) * height * 1.2;
      sp.position.set(x, y, 0);

      // much larger scales so shapes cover canvas
      const scale = 160 + rng() * 520;
      sp.scale.set(scale, scale, 1);

      sp.material.opacity = 1.0; // initially opaque (beige)
      sp.material.depthWrite = false;
      sp.material.depthTest = false;

      sprites.push({ sprite: sp, radius: Math.max(scale * 0.5, 40) });
      scene.add(sp);
    }

    // Build adjacency graph (contact if circles overlap)
    const adj: number[][] = new Array(sprites.length).fill(0).map(() => []);
    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
        const a = sprites[i].sprite.position;
        const b = sprites[j].sprite.position;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        const rsum = sprites[i].radius * 0.9 + sprites[j].radius * 0.9; // allow slight overlap
        if (dist <= rsum) {
          adj[i].push(j);
          adj[j].push(i);
        }
      }
    }

    // find seed nodes touching bottom-left (0, height)
    const seeds: number[] = [];
    const cornerX = 0;
    const cornerY = height;
    for (let i = 0; i < sprites.length; i++) {
      const p = sprites[i].sprite.position;
      const d = Math.hypot(p.x - cornerX, p.y - cornerY);
      if (d <= sprites[i].radius * 1.05) seeds.push(i);
    }

    // BFS to compute layers
    const layers: number[][] = [];
    const seen = new Array(sprites.length).fill(false);
    let frontier = seeds.slice();
    for (const s of frontier) seen[s] = true;
    if (frontier.length === 0) {
      // if none touch corner, pick nearest few
      const distances = sprites.map((s, idx) => ({ idx, d: Math.hypot(s.sprite.position.x - cornerX, s.sprite.position.y - cornerY) }));
      distances.sort((a, b) => a.d - b.d);
      frontier = distances.slice(0, 2).map((x) => x.idx);
      for (const f of frontier) seen[f] = true;
    }
    while (frontier.length) {
      layers.push(frontier.slice());
      const next: number[] = [];
      for (const u of frontier) {
        for (const v of adj[u]) {
          if (!seen[v]) {
            seen[v] = true;
            next.push(v);
          }
        }
      }
      frontier = next;
    }

    // Animate layers sequentially, making sprites transparent (opacity -> 0)
    const tl = gsap.timeline({ delay: 0.15, repeat: -1, yoyo: true, repeatDelay: 1.2 });
    for (let li = 0; li < layers.length; li++) {
      const group = layers[li];
      const duration = 0.28 + rng() * 0.18;
      const stagger = 0.02 + rng() * 0.03;
      tl.to(group.map((i) => sprites[i].sprite.material), { opacity: 0, duration, stagger }, li * 0.12 + 0);
    }

    const render = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    const onResize = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.right = w;
      camera.top = h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onResize);
    let raf = 0;
    raf = requestAnimationFrame(render);

    return () => {
      tl.kill();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      for (const it of sprites) {
        scene.remove(it.sprite);
        const m = it.sprite.material as THREE.SpriteMaterial;
        if (m.map) m.map.dispose();
        m.dispose();
      }
      for (const t of textures) t.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
    <div className="w-screen h-screen bg-[url('/monet/superbemonet.jpg')]  bg-contain bg-center bg-no-repeat relative" >
    <video
     ref={videoRef}
          src="/monet/caca.webm"
          autoPlay
          loop
          muted
          className=" absolute bottom-0 left-[100px] w-[300px] h-[300px] object-cover"
        ></video>
    </div>
      <div
        id="aaa"
        className="relative w-full h-screen flex items-center justify-center bg-[url('/monet/superbemonet.jpg')]  bg-contain bg-center bg-no-repeat"
      >
        {/* Overlay: same sizing/positioning as background (mask uses contain/center) */}
        <div style={overlayStyles} className="overlay">
          <div
            className={`${styles.slidingText} text-[36vw] md:text-[16rem] leading-none font-extrabold uppercase text-white text-center`}
          >
            HELLO
          </div>
          <video
            src="/monet/b.mp4"
            autoPlay
            loop
            muted
            className="absolute inset-0 w-full h-full object-cover"
          ></video>
        </div>
      </div>
      <div className=" h-screen w-full inset-0 bg-red-400 ">
        <video
          src="/monet/sgsgss.webm"
          autoPlay
          loop
          muted
          className=" inset-0 w-[100px] h-[100px] object-cover"
        ></video>
      </div>
      <div className="h-screen w-full inset-0 bg-blue-400 bg-[url('/monet/output.png')] bg-contain bg-center bg-no-repeat"></div>
      <div
          ref={revealRef}
          className="relative h-screen w-full overflow-hidden bg-[url('/monet/superbemonet.jpg')] bg-contain bg-center bg-no-repeat"
        ></div>

        <div className="fixed right-4 top-4 z-50 bg-white/80 dark:bg-black/60 p-3 rounded-md text-sm shadow-md">
          <label className="block text-xs text-gray-700 dark:text-gray-200">Seed</label>
          <input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className="w-44 mt-1 p-1 text-sm rounded border"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => { if (!locked) setRegen((r) => r + 1); }}
              disabled={locked}
              className="px-2 py-1 bg-blue-600 text-white rounded disabled:opacity-40"
            >
              Regenerate
            </button>
            <button
              onClick={() => setLocked((l) => !l)}
              className="px-2 py-1 bg-gray-700 text-white rounded"
            >
              {locked ? "Unlock" : "Lock"}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">Current: {seed}</div>
        </div>
    </>
  );
}
