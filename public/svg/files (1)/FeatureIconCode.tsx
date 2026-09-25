import { useRef } from 'react';
import gsap from 'gsap';
import styles from './FeatureIcon.module.css';

export default function FeatureIcon() {
  const ringRef = useRef<SVGCircleElement>(null);
  const bracketsRef = useRef<SVGPathElement>(null);
  const slashRef = useRef<SVGPathElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const handleHover = () => {
    const ring = ringRef.current;
    const brackets = bracketsRef.current;
    const slash = slashRef.current;
    if (!ring || !brackets || !slash) return;

    tlRef.current?.kill();
    // repart toujours de l'état réel (scale 1) : couleur d'origine
    // conservée, seule une pulsation transitoire est jouée
    gsap.set([ring, brackets, slash], { scale: 1, scaleX: 1, scaleY: 1 });

    const tl = gsap.timeline();
    tlRef.current = tl;

    tl.to(ring, { scale: 1.06, duration: 0.15, ease: 'power2.out' }, 0)
      .to(ring, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' }, 0.15)
      .to(brackets, { scaleX: 0.85, duration: 0.12, ease: 'power2.in' }, 0.05)
      .to(brackets, { scaleX: 1.12, duration: 0.14, ease: 'power2.out' }, 0.17)
      .to(brackets, { scaleX: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' }, 0.31)
      .to(slash, { scaleY: 1.18, duration: 0.14, ease: 'power2.out' }, 0.22)
      .to(slash, { scaleY: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' }, 0.36);
  };

  return (
    <svg
      viewBox="0 0 36 36"
      className={styles.featureIconSvg}
      onMouseEnter={handleHover}
    >
      <circle ref={ringRef} cx="18" cy="18" r="15" className={styles.featureRing} />
      <path
        ref={bracketsRef}
        d="M14 11l-5 7 5 7M22 11l5 7-5 7"
        className={styles.featureLine}
      />
      <path ref={slashRef} d="M19.5 10l-3 16" className={styles.featureLineSoft} />
    </svg>
  );
}
