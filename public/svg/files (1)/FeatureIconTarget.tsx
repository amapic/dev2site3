import { useRef } from 'react';
import gsap from 'gsap';
import styles from './FeatureIcon.module.css';

export default function FeatureIcon() {
  const ringRef = useRef<SVGCircleElement>(null);
  const innerRef = useRef<SVGCircleElement>(null);
  const ticksRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const handleHover = () => {
    const ring = ringRef.current;
    const inner = innerRef.current;
    const ticks = ticksRef.current;
    const dot = dotRef.current;
    if (!ring || !inner || !ticks || !dot) return;

    tlRef.current?.kill();
    // repart toujours de l'état réel (scale 1) : aucune couleur ni
    // géométrie n'est modifiée, seule une pulsation transitoire est jouée
    gsap.set([ring, inner, ticks, dot], { scale: 1 });

    const tl = gsap.timeline();
    tlRef.current = tl;

    tl.to(ring, { scale: 1.06, duration: 0.15, ease: 'power2.out' }, 0)
      .to(ring, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' }, 0.15)
      .to(inner, { scale: 1.15, duration: 0.15, ease: 'power2.out' }, 0.06)
      .to(inner, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }, 0.21)
      .to(ticks, { scale: 1.12, duration: 0.15, ease: 'power2.out' }, 0.1)
      .to(ticks, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.6)' }, 0.25)
      .to(dot, { scale: 1.6, duration: 0.18, ease: 'power2.out' }, 0.14)
      .to(dot, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' }, 0.32);
  };

  return (
    <svg
      viewBox="0 0 36 36"
      className={styles.featureIconSvg}
      onMouseEnter={handleHover}
    >
      <circle ref={ringRef} cx="18" cy="18" r="15" className={styles.featureRing} />
      <circle ref={innerRef} cx="18" cy="18" r="8" className={styles.featureLine} />
      <path
        ref={ticksRef}
        d="M18 6v5M18 25v5M6 18h5M25 18h5"
        className={styles.featureLine}
      />
      <circle ref={dotRef} cx="18" cy="18" r="2.5" className={styles.featureFill} />
    </svg>
  );
}
