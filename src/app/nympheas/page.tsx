"use client";

import React from "react";

export default function NympheasPage() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Variables locales non-nulles capturées dans les closures
    const c = canvas;
    const v = video;
    const x = ctx;

    let rafId = 0;
    let cw = 0;
    let ch = 0;

    // Synchronise la taille du buffer canvas avec sa taille CSS (seulement si changée)
    function syncSize() {
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(c.offsetWidth * dpr);
      const h = Math.round(c.offsetHeight * dpr);
      if (w !== cw || h !== ch) {
        c.width = w;
        c.height = h;
        cw = w;
        ch = h;
      }
    }

    function draw() {
      if (cw === 0 || ch === 0) return;

      x.clearRect(0, 0, cw, ch);

      // Étape 1 : dessiner le texte blanc — c'est la forme du cache
      const fontSize = Math.round(cw * 0.15);
      x.save();
      x.fillStyle = "#ffffff";
      x.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("Test", cw / 2, ch / 2 - Math.round(fontSize * 0.6));
      x.fillText("fgdfhdh", cw / 2, ch / 2 + Math.round(fontSize * 0.6));
      x.restore();

      // Étape 2 : appliquer les pixels de la frame vidéo uniquement dans la forme du texte
      // source-in = garde les pixels de la source (vidéo) là où la destination (texte blanc) existe
      if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        x.save();
        x.globalCompositeOperation = "source-in";
        x.drawImage(v, 0, 0, cw, ch);
        x.restore();
      }
      // Si la vidéo n'est pas encore prête, le texte blanc reste visible (étape 1)
    }

    function tick() {
      syncSize();
      draw();
      rafId = requestAnimationFrame(tick);
    }

    v.play().catch(() => {});
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[url('/monet/nympheas.jpg')] bg-cover bg-center bg-no-repeat">
      {/* Vidéo cachée — tourne en fond, ses frames sont lues par le canvas à chaque rAF */}
      <video
        ref={videoRef}
        src="/monet/osortiesfdh.webm"
        muted
        loop
        playsInline
        autoPlay
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />
      {/* Canvas visible : rAF → texte blanc + source-in vidéo = cache animé, zéro état React, zéro blob */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
