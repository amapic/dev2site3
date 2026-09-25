import { useEffect, useRef } from 'react';
import styles from './FeatureIcon.module.css';

interface FeatureIconCodeProps {
  /** true = joue l'animation, false = retour à l'état de repos */
  active?: boolean;
  /** Couleur des traits (défaut violet #8a5dd6) */
  color?: string;
}

export default function FeatureIconCode_2({ active = false, color = '#8a5dd6' }: FeatureIconCodeProps) {
  const ringRef = useRef<SVGCircleElement>(null);
  const bracketsRef = useRef<SVGPathElement>(null);
  const slashRef = useRef<SVGPathElement>(null);
  const animsRef = useRef<Animation[]>([]);

  useEffect(() => {
    const ring = ringRef.current;
    const brackets = bracketsRef.current;
    const slash = slashRef.current;
    if (!ring || !brackets || !slash) return;

    animsRef.current.forEach((a) => a.cancel());
    animsRef.current = [];

    const EASE_OUT = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
    const EASE_IN = 'cubic-bezier(0.55, 0.06, 0.68, 0.19)';
    const EASE_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

    function animate(
      el: Element,
      keyframes: Keyframe[],
      duration: number,
      easing: string,
      delay = 0
    ): Animation {
      const anim = el.animate(keyframes, {
        duration,
        easing,
        delay,
        fill: 'none',
      });
      animsRef.current.push(anim);
      return anim;
    }

    if (active) {
      animate(ring, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], 150, EASE_OUT, 0);
      animate(ring, [{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], 350, EASE_BOUNCE, 150);

      animate(
        brackets,
        [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.85)' }],
        120,
        EASE_IN,
        50
      );
      animate(
        brackets,
        [{ transform: 'scaleX(0.85)' }, { transform: 'scaleX(1.12)' }],
        140,
        EASE_OUT,
        170
      );
      animate(
        brackets,
        [{ transform: 'scaleX(1.12)' }, { transform: 'scaleX(1)' }],
        350,
        EASE_BOUNCE,
        310
      );

      animate(slash, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.18)' }], 140, EASE_OUT, 220);
      animate(slash, [{ transform: 'scaleY(1.18)' }, { transform: 'scaleY(1)' }], 350, EASE_BOUNCE, 360);
    }

    return () => {
      animsRef.current.forEach((a) => a.cancel());
      animsRef.current = [];
    };
  }, [active]);

  return (
    <span className={styles.stage} aria-hidden="true">
      <svg viewBox="0 0 36 36" className={styles.featureIconSvg} style={{ color }}>
        <circle ref={ringRef} cx="18" cy="18" r="15" className={styles.featureRing} />
        <path
          ref={bracketsRef}
          d="M14 11l-5 7 5 7M22 11l5 7-5 7"
          className={styles.featureLine}
        />
        <path ref={slashRef} d="M19.5 10l-3 16" className={styles.featureLineSoft} />
      </svg>
    </span>
  );
}
