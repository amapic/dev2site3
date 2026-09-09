'use client';

import React, { useEffect, useRef } from 'react';

export default function FiveAnsCrystalPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const draw = () => {
      // Setup canvas size
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);

      // Couleurs (Cyan clair, Jaune doré, Bleu-Gris, Blanc, Turquoise)
      const palette = [
        { r: 77, g: 208, b: 225 },   // Cyan
        { r: 255, g: 213, b: 79 },   // Jaune or
        { r: 159, g: 168, b: 218 },  // Gris-bleu
        { r: 238, g: 238, b: 238 },  // Gris clair
        { r: 255, g: 255, b: 255 }   // Blanc
      ];

      // 1. DESSINER LE TEXTE INVISIBLE POUR RÉCUPÉRER LES PIXELS
      const textCanvas = document.createElement('canvas');
      textCanvas.width = width;
      textCanvas.height = height;
      const textCtx = textCanvas.getContext('2d', { willReadFrequently: true });
      if (!textCtx) return;

      const fontSize = Math.min(width * 0.15, 300); // Taille responsive
      textCtx.font = `900 ${fontSize}px "Arial Black", "Impact", system-ui, sans-serif`;
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'middle';
      textCtx.fillStyle = '#000';
      textCtx.fillText('5 ANS', width / 2, height / 2);

      // Parcourir les pixels pour trouver ceux qui font partie du texte
      const imgData = textCtx.getImageData(0, 0, width, height).data;
      const textPoints = [];
      const step = 6; // Précision du scan (tous les X pixels)
      
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const alpha = imgData[(y * width + x) * 4 + 3];
          if (alpha > 128) {
            textPoints.push({ x, y });
          }
        }
      }

      // Si le texte n'a pas pu être lu, on annule
      if (textPoints.length === 0) return;

      // 2. GÉNÉRER LES TRIANGLES
      // On génère 2 types de triangles : 
      // - Ceux du "fond" (le flux flottant large pour l'effet global)
      // - Ceux "textuels" (concentrés sur les lettres)
      
      const drawTriangle = (centerX: number, centerY: number, baseSize: number, opacityMultiplier = 1) => {
        const xProgress = centerX / width;
        
        // Choix de la palette selon la position X
        let colorObj;
        const r = Math.random();
        // Plus on est au centre, plus il y a de l'or et du blanc
        if (Math.abs(xProgress - 0.5) < 0.3) {
          colorObj = r < 0.4 ? palette[1] /*Or*/ : (r < 0.7 ? palette[4] /*Blanc*/ : palette[0]);
        } else {
          colorObj = r < 0.5 ? palette[0] /*Cyan*/ : (r < 0.8 ? palette[2] /*Bleu gris*/ : palette[3]);
        }
        
        const alpha = (0.05 + Math.random() * 0.4) * opacityMultiplier;
        
        // Calcul des 3 sommets du triangle
        const angleOffset = Math.random() * Math.PI * 2;
        const p1 = {
          x: centerX + Math.cos(angleOffset) * baseSize * (0.2 + Math.random()),
          y: centerY + Math.sin(angleOffset) * baseSize * (0.2 + Math.random())
        };
        const p2 = {
          x: centerX + Math.cos(angleOffset + Math.PI*(2/3) + (Math.random()-0.5)) * baseSize * (0.2 + Math.random()),
          y: centerY + Math.sin(angleOffset + Math.PI*(2/3) + (Math.random()-0.5)) * baseSize * (0.2 + Math.random())
        };
        const p3 = {
          x: centerX + Math.cos(angleOffset + Math.PI*(4/3) + (Math.random()-0.5)) * baseSize * (0.2 + Math.random()),
          y: centerY + Math.sin(angleOffset + Math.PI*(4/3) + (Math.random()-0.5)) * baseSize * (0.2 + Math.random())
        };

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        
        ctx.fillStyle = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${alpha})`;
        
        // Mode de fusion pour la profondeur
        const randBlend = Math.random();
        if (randBlend > 0.8) {
          ctx.globalCompositeOperation = 'multiply';
        } else if (randBlend > 0.6) {
          ctx.globalCompositeOperation = 'overlay';
        } else {
          ctx.globalCompositeOperation = 'source-over';
        }
        
        ctx.fill();
        
        // Quelques petits contours blancs
        if (Math.random() > 0.85) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 2})`;
          ctx.lineWidth = Math.random() * 2 * dpr;
          ctx.stroke();
        }
      };

      // A. Flux de fond (pour asseoir le contour général avec BEAUCOUP moins de triangles)
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * width;
        const wave = Math.sin((x / width) * Math.PI * 2) * (height * 0.1);
        const y = height / 2 + wave + (Math.random() - 0.5) * height * 0.4;
        
        const size = Math.random() > 0.8 ? 150 + Math.random() * 200 : 30 + Math.random() * 100;
        drawTriangle(x, y, size * dpr, 0.4);
      }

      // B. Structure du texte : quantité drastiquement réduite
      const numTextTriangles = 400; // Avant : 3000
      for (let i = 0; i < numTextTriangles; i++) {
        // Prendre un point au hasard parmis les pixels du texte "5 ANS"
        const pt = textPoints[Math.floor(Math.random() * textPoints.length)];
        
        // Dispersion autour du pixel cible (léger flou)
        const scatter = (Math.random() - 0.5) * 20 * dpr;
        const cx = pt.x + scatter;
        const cy = pt.y + scatter;

        // Tailles légèrement augmentées pour compenser le faible nombre et préserver la silhouette
        const size = 15 + Math.random() * 50;
        
        drawTriangle(cx, cy, size * dpr, 1.4); // Opacité renforcée dans le texte
      }
    };

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(draw, 150); 
    };

    window.addEventListener('resize', handleResize);
    // Délai minimal pour que la police "système" (bold font) soit bien chargée avant le scan canvas
    setTimeout(draw, 100);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFCFF', position: 'relative' }}>
      
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%',
          filter: 'contrast(1.15) saturate(1.2)' // Donne cet effet cristallin éclatant
        }} 
      />
      
      {/* Texture de grain (halftone print-like) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        opacity: 0.22,
        mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />
      
      {/* Halo rayonnant central */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70vw', height: '60vh',
        background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        mixBlendMode: 'overlay'
      }} />

      <button 
        onClick={() => window.location.reload()}
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          border: '1px solid #9FA8DA',
          color: '#555',
          fontSize: '11px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'all 0.3s',
        }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(159, 168, 218, 0.2)')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        Régénérer "5 ans"
      </button>
    </div>
  );
}