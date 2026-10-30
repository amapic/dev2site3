'use client';

import React, { useEffect, useRef } from 'react';

export default function CrystalFlowPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // S'assurer que le canvas a la taille de l'écran (avec prise en compte du Device Pixel Ratio pour la netteté)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);

      // Couleurs basées sur votre image (Cyan clair, Jaune doré, Gris/Bleu-Gris, Blanc, Turquoise)
      const palette = [
        { r: 77, g: 208, b: 225 },  // Turquoise / Cyan éclatant
        { r: 255, g: 213, b: 79 },  // Jaune doré / Ambre léger
        { r: 159, g: 168, b: 218 }, // Bleu-Gris doux
        { r: 238, g: 238, b: 238 }, // Gris très clair
        { r: 255, g: 255, b: 255 }  // Blanc brillant
      ];

      // Générer environ 600 triangles pour créer ce flux dense
      const numTriangles = 600;

      for (let i = 0; i < numTriangles; i++) {
        // La répartition des triangles forme une vague douce horizontale
        const xProgress = Math.random(); 
        const baseX = width * 0.1 + (width * 0.8 * xProgress); // Etalé sur la largeur centré
        
        // Onde sinusoïdale pour le mouvement vertical (vague)
        const waveY = Math.sin(xProgress * Math.PI * 2.5) * (height * 0.15);
        const baseY = height / 2 + waveY;
        
        // Dispersion aléatoire autour du centre (forme un nuage)
        // La dispersion est plus forte au centre et fine aux extrémités
        const spreadFactor = Math.sin(xProgress * Math.PI); 
        const scatterX = (Math.random() - 0.5) * (width * 0.2);
        const scatterY = (Math.random() - 0.5) * (height * 0.5 * spreadFactor + height * 0.1);
        
        const centerX = baseX + scatterX;
        const centerY = baseY + scatterY;

        // Tailles extrêmes : quelques très gros triangles, beaucoup de petits "éclats"
        const isHuge = Math.random() > 0.95;
        const baseSize = isHuge 
          ? 100 + Math.random() * 200 
          : 5 + Math.random() * Math.random() * 100;
        
        // Définir les 3 points du triangle avec des longueurs/angles aléatoires pour les rendre pointus/irréguliers
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

        // Choix de la couleur : Centre plus chaud (or/blanc), Extrémités plus froides (cyan/gris)
        const distToCenter = Math.abs(xProgress - 0.5) * 2; // 0 = centre, 1 = bord extrème
        
        let colorObj;
        const r = Math.random();
        if (distToCenter < 0.4) {
          // Zone Centrale
          colorObj = r < 0.35 ? palette[1] /*Or*/ : (r < 0.65 ? palette[4] /*Blanc*/ : palette[0] /*Cyan*/);
        } else {
          // Bords
          colorObj = r < 0.45 ? palette[0] /*Cyan*/ : (r < 0.8 ? palette[2] /*Bleu gris*/ : palette[3] /*Gris clair*/);
        }
        
        // Opacité variable : beaucoup de triangles très transparents
        const alpha = 0.05 + Math.random() * 0.5;
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        
        ctx.fillStyle = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${alpha})`;
        
        // De temps en temps on utilise un mode de fusion "multiply" (produit) 
        // ou "overlay" pour créer la densité et la profondeur sombre au milieu des teintes claires
        if (Math.random() > 0.7) {
          ctx.globalCompositeOperation = 'multiply';
        } else if (Math.random() > 0.8) {
          ctx.globalCompositeOperation = 'overlay';
        } else {
          ctx.globalCompositeOperation = 'source-over';
        }
        
        ctx.fill();
        
        // Les triangles ajoutent parfois un mini contour clair pour l'aspect de superposition aiguisée
        if (Math.random() > 0.8) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 1.5})`;
          ctx.lineWidth = Math.random() * 1.5;
          ctx.stroke();
        }
      }
    };

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      // Debounce pour ne redessiner qu'à la fin du redimensionnement
      resizeTimer = setTimeout(draw, 150); 
    };

    window.addEventListener('resize', handleResize);
    // Dessin initial
    draw();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFCFF', position: 'relative' }}>
      
      {/* 1. Le Canvas qui génère la composition organique */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%',
          filter: 'contrast(1.1) saturate(1.2)' // Renforce légèrement l'éclat des couleurs
        }} 
      />
      
      {/* 2. Texture de grain générée via SVG, placée au-dessus pour reproduire l'effet matiéré */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        opacity: 0.18,
        mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />
      
      {/* 3. Halo lumineux central pour amplifier l'explosion de lumière (or/blanc) au milieu */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw', height: '50vh',
        background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%)',
        pointerEvents: 'none',
        mixBlendMode: 'overlay'
      }} />

      {/* Interface minimaliste d'accompagnement */}
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
          transition: 'all 0.3s'
        }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(159, 168, 218, 0.2)')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        Générer une nouvelle composition
      </button>
    </div>
  );
}