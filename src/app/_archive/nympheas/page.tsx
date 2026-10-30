"use client";

import React from "react";

export default function NympheasPage() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [brightness, setBrightness] = React.useState(2);
  const brightnessRef = React.useRef<number>(2);
  const [transparency, setTransparency] = React.useState(1);
  const transparencyRef = React.useRef<number>(1);
  const [maxPlayTime, setMaxPlayTime] = React.useState<number>(20);
  const maxPlayTimeRef = React.useRef<number>(5);
  const [frameThickness, setFrameThickness] = React.useState<number>(12);
  const frameThicknessRef = React.useRef<number>(12);
  const [offsetX, setOffsetX] = React.useState<number>(0);
  const offsetXRef = React.useRef<number>(0);
  const [offsetY, setOffsetY] = React.useState<number>(0);
  const offsetYRef = React.useRef<number>(0);

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

      const lines = [
        "Atelier de peinture",
        "Partager • Expérimenter • Apprendre",
        "Gestes libres, couleurs vraies",
      ];

      let fs = Math.round(cw * 0.12);

      x.save();
      x.textAlign = "center";
      x.textBaseline = "middle";

      function measure(fsLocal: number) {
        x.font = `900 ${fsLocal}px 'Bebas Neue', sans-serif`;
        const widths = lines.map((l) => x.measureText(l).width);
        const maxWidth = Math.max(...widths);
        const lineHeight = Math.ceil(fsLocal * 1.05);
        const totalHeight = lineHeight * lines.length;
        return { maxWidth, lineHeight, totalHeight };
      }

      let m = measure(fs);

      const maxAllowedWidth = cw * 0.92;
      const maxAllowedHeight = ch * 0.9;

      while (
        (m.maxWidth > maxAllowedWidth || m.totalHeight > maxAllowedHeight) &&
        fs > 8
      ) {
        fs--;
        m = measure(fs);
      }

      const dpr = window.devicePixelRatio || 1;
      const offX = (offsetXRef.current || 0) * dpr;
      const offY = (offsetYRef.current || 0) * dpr;

      const centerX = Math.round(cw / 2 + offX);
      const startY = Math.round(
        ch / 2 - m.totalHeight / 2 + m.lineHeight / 2 + offY,
      );

      const pad = Math.round(m.lineHeight * 0.45);
      const frameThickness = Math.max(1, frameThicknessRef.current || 12) * dpr;

      const left = Math.round(centerX - m.maxWidth / 2 - pad);
      const top = Math.round(startY - m.lineHeight / 2 - pad);

      const boxW = Math.round(m.maxWidth + pad * 2);
      const boxH = Math.round(m.totalHeight + pad * 2);

      // =====================================================
      // MASQUE : TEXTE + CADRE
      // =====================================================

      x.fillStyle = "#fff";
      x.strokeStyle = "#fff";
      x.lineWidth = frameThickness;
      x.lineJoin = "miter";
      x.lineCap = "butt";
      x.miterLimit = 10;

      // cadre
      const half = frameThickness / 2;

      x.strokeRect(
        left + half,
        top + half,
        boxW - frameThickness,
        boxH - frameThickness,
      );

      // texte
      x.font = `900 ${fs}px 'Bebas Neue', sans-serif`;

      for (let i = 0; i < lines.length; i++) {
        x.fillText(lines[i], centerX, startY + i * m.lineHeight);
      }

      // =====================================================
      // VIDEO DANS LE MASQUE
      // =====================================================

      if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        x.globalCompositeOperation = "source-in";
        x.filter = `brightness(${brightnessRef.current})`;
        x.globalAlpha = transparencyRef.current;

        x.drawImage(v, 0, 0, cw, ch);
      }

      x.restore();
    }

    function tick() {
      syncSize();
      draw();
      // Si une durée max est définie (>0), on remet la vidéo au début quand elle est atteinte
      if (
        maxPlayTimeRef.current > 0 &&
        v.currentTime >= maxPlayTimeRef.current
      ) {
        try {
          v.currentTime = 0;
          v.play().catch(() => {});
        } catch (e) {
          // ignore
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    v.play().catch(() => {});
    // Attendre que toutes les fonts soient prêtes avant de lancer le loop
    document.fonts.ready.then(() => {
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[url('/monet/nympheas.jpg')] bg-cover bg-center bg-no-repeat">
      {/* Vidéo cachée — tourne en fond, ses frames sont lues par le canvas à chaque rAF */}
      <video
        ref={videoRef}
        src="/monet/marchebien.webm"
        muted
        loop
        playsInline
        autoPlay
        className="border-2 border-white"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      {/* Contrôles UI déplacés en haut à droite : luminosité + transparence */}
      <div className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 p-2 rounded pointer-events-auto">
        <label className="text-white text-xs block mb-1">
          Luminosité: {Math.round(brightness * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={brightness}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const v = Number(e.target.value);
            setBrightness(v);
            brightnessRef.current = v;
          }}
          className="w-36 mb-2"
        />

        <label className="text-white text-xs block mb-1">
          Transparence: {Math.round(transparency * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={transparency}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const v = Number(e.target.value);
            setTransparency(v);
            transparencyRef.current = v;
          }}
          className="w-36 mb-2"
        />

        <label className="text-white text-xs block mb-1">
          Durée max (s): {maxPlayTime}
        </label>
        <input
          type="range"
          min="0"
          max="60"
          step="0.5"
          value={maxPlayTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const v = Number(e.target.value);
            setMaxPlayTime(v);
            maxPlayTimeRef.current = v;
          }}
          className="w-36"
        />

        <div className="mt-2 border-t border-white/20 pt-2">
          <label className="text-white text-xs block mb-1">
            Cadre épaisseur: {frameThickness}px
          </label>
          <input
            type="range"
            min="0"
            max="60"
            step="1"
            value={frameThickness}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = Number(e.target.value);
              setFrameThickness(v);
              frameThicknessRef.current = v;
            }}
            className="w-36 mb-2"
          />

          <label className="text-white text-xs block mb-1">
            Décalage X: {offsetX}px
          </label>
          <input
            type="range"
            min={-200}
            max={200}
            step={1}
            value={offsetX}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = Number(e.target.value);
              setOffsetX(v);
              offsetXRef.current = v;
            }}
            className="w-36 mb-2"
          />

          <label className="text-white text-xs block mb-1">
            Décalage Y: {offsetY}px
          </label>
          <input
            type="range"
            min={-200}
            max={200}
            step={1}
            value={offsetY}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = Number(e.target.value);
              setOffsetY(v);
              offsetYRef.current = v;
            }}
            className="w-36"
          />
        </div>
      </div>

      {/* Canvas visible : rAF → texte blanc + source-in vidéo = cache animé, zéro état React, zéro blob */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
