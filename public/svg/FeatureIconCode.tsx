import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './FeatureIcon.module.css';

interface FeatureIconProps {
  /** true = icône activée (joue l'animation), false = retour à l'état inactif */
  active: boolean;
}

export default function FeatureIcon({ active }: FeatureIconProps) {
  const ringRef = useRef<SVGCircleElement>(null);
  const bracketsRef = useRef<SVGPathElement>(null);
  const slashRef = useRef<SVGPathElement>(null);
  const pulse1Ref = useRef<HTMLSpanElement>(null);
  const pulse2Ref = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Rien n'est initialisé/caché au montage : la frame de repos reste
  // exactement celle du SVG tel que fourni (scale 1, aucun dash-offset).

  useEffect(() => {
    const ring = ringRef.current;
    const brackets = bracketsRef.current;
    const slash = slashRef.current;
    const pulses = [pulse1Ref.current, pulse2Ref.current].filter(
      (el): el is HTMLSpanElement => el !== null
    );
    if (!ring || !brackets || !slash) return;

    tlRef.current?.kill();

    if (active) {
      const tl = gsap.timeline();
      tlRef.current = tl;

      // chaque élément part de son état visible réel (scale 1) : la
      // première frame jouée est donc identique au SVG d'origine.
      tl.to(ring, { scale: 1.06, duration: 0.15, ease: 'power2.out' }, 0)
        .to(ring, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' }, 0.15)

        // chevrons : léger resserrement puis "snap" d'ouverture
        .to(brackets, { scaleX: 0.85, duration: 0.12, ease: 'power2.in' }, 0.05)
        .to(brackets, { scaleX: 1.12, duration: 0.14, ease: 'power2.out' }, 0.17)
        .to(brackets, { scaleX: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' }, 0.31)

        // barre oblique : petit "coup" vertical
        .to(slash, { scaleY: 1.18, duration: 0.14, ease: 'power2.out' }, 0.22)
        .to(slash, { scaleY: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' }, 0.36)

        // ondes sonar : éléments additionnels, distincts du SVG d'origine
        .to(pulses[0], { opacity: 0.9, scale: 1, duration: 0.05 }, 0.2)
        .to(pulses[0], { opacity: 0, scale: 2.4, duration: 0.9, ease: 'power1.out' }, 0.2)
        .to(pulses[1], { opacity: 0.6, scale: 1, duration: 0.05 }, 0.36)
        .to(pulses[1], { opacity: 0, scale: 2.4, duration: 0.9, ease: 'power1.out' }, 0.36);
    } else {
      // si on désactive en cours d'anim, on ramène tout en douceur
      // à l'état de repos (scale 1) — jamais à un état caché.
      const tl = gsap.timeline();
      tlRef.current = tl;
      tl.to([ring, brackets, slash], { scale: 1, duration: 0.25, ease: 'power2.out' }, 0)
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
        <path
          ref={bracketsRef}
          d="M14 11l-5 7 5 7M22 11l5 7-5 7"
          className={styles.featureLine}
        />
        <path ref={slashRef} d="M19.5 10l-3 16" className={styles.featureLineSoft} />
      </svg>
    </div>
  );
}
