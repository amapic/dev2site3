import { useEffect, useRef } from 'react';
import styles from './FeatureIcon.module.css';

interface FeatureIconTargetProps {
  /** true = joue l'animation, false = retour à l'état de repos */
  active?: boolean;
  /** Couleur des traits (défaut jaune #e9a506) */
  color?: string;
}

export default function FeatureIconTarget_2({ active = false, color = '#e9a506' }: FeatureIconTargetProps) {
  const ringRef = useRef<SVGCircleElement>(null);
  const innerRef = useRef<SVGCircleElement>(null);
  const ticksRef = useRef<SVGPathElement>(null);
  const animsRef = useRef<Animation[]>([]);

  useEffect(() => {
    const ring = ringRef.current;
    const inner = innerRef.current;
    const ticks = ticksRef.current;
    if (!ring || !inner || !ticks) return;

    // Annule les animations en cours
    animsRef.current.forEach((a) => a.cancel());
    animsRef.current = [];

    const EASE_OUT = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
    const EASE_INOUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
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
      animate(
        ring,
        [
          { transform: 'scale(1)', transformOrigin: '18px 18px' },
          { transform: 'scale(1.06)', transformOrigin: '18px 18px' },
        ],
        150,
        EASE_OUT,
        0
      );
      animate(
        ring,
        [
          { transform: 'scale(1.06)', transformOrigin: '18px 18px' },
          { transform: 'scale(1)', transformOrigin: '18px 18px' },
        ],
        350,
        EASE_BOUNCE,
        150
      );

      animate(
        inner,
        [
          { transform: 'scale(1)', transformOrigin: '18px 18px' },
          { transform: 'scale(1.15)', transformOrigin: '18px 18px' },
        ],
        150,
        EASE_OUT,
        60
      );
      animate(
        inner,
        [
          { transform: 'scale(1.15)', transformOrigin: '18px 18px' },
          { transform: 'scale(1)', transformOrigin: '18px 18px' },
        ],
        400,
        EASE_BOUNCE,
        210
      );

      // la croix fait un tour complet autour du centre du SVG (18,18)
      animate(
        ticks,
        [
          { transform: 'rotate(0deg)', transformOrigin: '18px 18px' },
          { transform: 'rotate(360deg)', transformOrigin: '18px 18px' },
        ],
        550,
        EASE_INOUT,
        50
      );
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
        <circle ref={innerRef} cx="18" cy="18" r="8" className={styles.featureLine} />
        <path
          ref={ticksRef}
          d="M18 6v5M18 25v5M6 18h5M25 18h5"
          className={styles.featureLine}
        />
        <circle cx="18" cy="18" r="2.5" className={styles.featureFill} />
      </svg>
    </span>
  );
}
