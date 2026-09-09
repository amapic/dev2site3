import React from 'react';

export default function FiveYearsAbstract() {
  return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      backgroundColor: '#FCF5E6', // Fond crème
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <svg 
        viewBox="0 0 900 400" 
        style={{ width: '100%', maxWidth: '1000px', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients pour les parties blanches/grises qui se fondent */}
          <linearGradient id="grad1" x1="0%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#8A9BB4" />
            <stop offset="60%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="grad2" x1="50%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8A9BB4" />
            <stop offset="70%" stopColor="#FFFFFF" />
          </linearGradient>
          <radialGradient id="gradRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#8A9BB4" />
          </radialGradient>

          {/* Filtre pour l'effet de texture/bruit (grain dispersé façon points/halftone) */}
          <filter id="noiseTexture" x="-20%" y="-20%" width="140%" height="140%">
            {/* Génération du bruit blanc assez large */}
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
            {/* Augmentation drastique du contraste du bruit pour créer des "points" */}
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 6 -2.5" in="noise" result="highContrastNoise" />
            {/* On mixe le bruit pointillé avec la forme (qui elle a un dégradé) en mode Multiply */}
            <feBlend mode="multiply" in="SourceGraphic" in2="highContrastNoise" />
          </filter>
          
          {/* Filtre pour adoucir très légèrement les bords ou ajouter de la texture au fond */}
          <filter id="paper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.05 0" in="noise" />
            <feBlend mode="multiply" in2="SourceGraphic" />
          </filter>
        </defs>

        <g filter="url(#paper)">
          {/* Gérer le mélange des couleurs un peu comme de la sérigraphie */}
          <g style={{ mixBlendMode: 'multiply' }}>

            {/* --- CHIFFRE 5 --- */}
            {/* Barre supérieure du 5 : Triangle rouge */}
            <polygon points="100,100 240,80 100,150" fill="#EE4B3E" />
            
            {/* Ligne verticale du 5 : Rectangle bleu marine */}
            <rect x="100" y="100" width="35" height="120" fill="#082B54" />
            
            {/* Forme texturée superposée (gris-bleu clair avec grain) */}
            <polygon points="80,130 180,90 150,230" fill="url(#grad1)" filter="url(#noiseTexture)" />

            {/* Boucle du 5 : Arc de cercle bleu épais + pointiller/texture rouge */}
            <path d="M 135 180 A 65 65 0 1 1 135 310" fill="none" stroke="#082B54" strokeWidth="35" />
            {/* Demi-cercle rouge pour finir la boucle du 5 */}
            <path d="M 170 190 A 60 60 0 0 0 160 300 Z" fill="#EE4B3E" />


            {/* --- LETTRE A --- */}
            <g transform="translate(320, 0)">
              {/* Cercle de fond gris/bleu clair avec grain */}
              <circle cx="70" cy="240" r="55" fill="url(#gradRadial)" filter="url(#noiseTexture)" />
              
              {/* Grand demi-cercle rouge */}
              <path d="M 70 185 A 55 55 0 0 0 70 295 Z" fill="#EE4B3E" />
              
              {/* Triangle navy superposé pour évoquer l'arc du a */}
              <polygon points="10,240 120,295 120,185" fill="#082B54" />
              
              {/* Barre verticale rouge/navy */}
              <rect x="110" y="170" width="25" height="125" fill="#EE4B3E" />
              <polygon points="110,295 135,295 135,270" fill="#082B54" />
            </g>


            {/* --- LETTRE N --- */}
            <g transform="translate(480, 0)">
              {/* Barre montante navy */}
              <rect x="20" y="170" width="30" height="125" fill="#082B54" />
              
              {/* Diagonale centrale: forme géométrique texturée et triangle rouge */}
              <polygon points="50,170 130,295 50,295" fill="url(#grad2)" filter="url(#noiseTexture)" />
              <polygon points="50,170 130,170 130,295" fill="#EE4B3E" />
              
              {/* Barre descente navy coupée */}
              <rect x="105" y="200" width="25" height="95" fill="#082B54" />
            </g>


            {/* --- LETTRE S --- */}
            <g transform="translate(640, 0)">
              {/* Partie supérieure du S : Arc navy + cercle clair grainé */}
              <circle cx="80" cy="195" r="40" fill="url(#gradRadial)" filter="url(#noiseTexture)" />
              <path d="M 40 195 A 40 40 0 0 1 120 195 Z" fill="#082B54" />

              {/* Partie inférieure du S : Arc rouge inversé */}
              <path d="M 40 255 A 40 40 0 0 0 120 255 Z" fill="#EE4B3E" />
              
              {/* Liaison centrale du S : Rectangle incliné texturé + poly navy */}
              <polygon points="40,205 120,185 120,245 40,265" fill="#EE4B3E" />
              <polygon points="60,190 100,200 40,270" fill="#082B54" />
              
              {/* Petit accent final texturé */}
              <circle cx="110" cy="275" r="15" fill="url(#gradRadial)" filter="url(#noiseTexture)" />
            </g>
            
          </g>
        </g>
      </svg>
    </div>
  );
}
