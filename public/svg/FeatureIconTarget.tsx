import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './FeatureIcon.module.css';

interface FeatureIconProps {
  /** true = icône activée (joue l'animation), false = retour à l'état inactif */
  active: boolean;
}

export default function FeatureIcon({ active }: FeatureIconProps) {
  const ringRef = useRef<SVGCircleElement>(null);
  const innerRef = useRef<SVGCircleElement>(null);
  const ticksRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const pulse1Ref = useRef<HTMLSpanElement>(null);
  const pulse2Ref = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Rien n'est initialisé/caché au montage : la frame de repos reste
  // exactement celle du SVG tel que fourni (scale 1, aucun dash-offset).

  useEffect(() => {
    const ring = ringRef.current;
    const inner = innerRef.current;
    const ticks = ticksRef.current;
    const dot = dotRef.current;
    const pulses = [pulse1Ref.current, pulse2Ref.current].filter(
      (el): el is HTMLSpanElement => el !== null
    );
    if (!ring || !inner || !ticks || !dot) return;

    tlRef.current?.kill();

    if (active) {
      const tl = gsap.timeline();
      tlRef.current = tl;

      // chaque élément part de son état visible réel (scale 1) : la
      // première frame jouée est donc identique au SVG d'origine.
      tl.to(ring, { scale: 1.06, duration: 0.15, ease: 'power2.out' }, 0)
        .to(ring, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' }, 0.15)

        .to(inner, { scale: 1.15, duration: 0.15, ease: 'power2.out' }, 0.06)
        .to(inner, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }, 0.21)

        .to(ticks, { scale: 1.12, duration: 0.15, ease: 'power2.out' }, 0.1)
        .to(ticks, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.6)' }, 0.25)

        .to(dot, { scale: 1.6, duration: 0.18, ease: 'power2.out' }, 0.14)
        .to(dot, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' }, 0.32)

        // ondes sonar : éléments additionnels, distincts du SVG d'origine
        .to(pulses[0], { opacity: 0.9, scale: 1, duration: 0.05 }, 0.14)
        .to(pulses[0], { opacity: 0, scale: 2.4, duration: 0.9, ease: 'power1.out' }, 0.14)
        .to(pulses[1], { opacity: 0.6, scale: 1, duration: 0.05 }, 0.3)
        .to(pulses[1], { opacity: 0, scale: 2.4, duration: 0.9, ease: 'power1.out' }, 0.3);
    } else {
      // si on désactive en cours d'anim, on ramène tout en douceur
      // à l'état de repos (scale 1) — jamais à un état caché.
      const tl = gsap.timeline();
      tlRef.current = tl;
      tl.to([ring, inner, ticks, dot], { scale: 1, duration: 0.25, ease: 'power2.out' }, 0)
        .to(pulses, { opacity: 0, duration: 0.2 }, 0);
    }

    return () => {
      tlRef.current?.kill();
    };
  }, [active]);

  return (
    <div className={styles.stage}>
      <span ref={pulse1Ref} className={styles.pulseRing} />
      <span ref={pulse2Ref} className={styles.pulseRing} />
      <svg
        viewBox="0 0 36 36"
        className={styles.featureIconSvg}
        data-active={active || undefined}
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
    </div>
  );
}
