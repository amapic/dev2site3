import { useEffect, useRef } from 'react';
import styles from './FeatureIcon.module.css';

interface FeatureIconGrowthProps {
  /** true = joue l'animation, false = retour à l'état de repos */
  active?: boolean;
  /** Couleur des traits (défaut bleu #0b5fb0) */
  color?: string;
}

export default function FeatureIconGrowth_2({ active = false, color = '#0b5fb0' }: FeatureIconGrowthProps) {
  const ringRef = useRef<SVGPathElement>(null);
  const barOneRef = useRef<SVGPathElement>(null);
  const barTwoRef = useRef<SVGPathElement>(null);
  const barThreeRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);
  const animsRef = useRef<Animation[]>([]);

  useEffect(() => {
    const ring = ringRef.current;
    const barOne = barOneRef.current;
    const barTwo = barTwoRef.current;
    const barThree = barThreeRef.current;
    const line = lineRef.current;
    const arrow = arrowRef.current;

    if (!ring || !barOne || !barTwo || !barThree || !line || !arrow) return;

    animsRef.current.forEach((a) => a.cancel());
    animsRef.current = [];

    const EASE_OUT = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
    const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
    const EASE_SNAP = 'cubic-bezier(0.16, 1, 0.3, 1)';

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
      // Anneau : micro-rotation
      animate(
        ring,
        [
          { transform: 'rotate(0deg)', transformOrigin: '20px 20px' },
          { transform: 'rotate(7deg)', transformOrigin: '20px 20px' },
          { transform: 'rotate(0deg)', transformOrigin: '20px 20px' },
        ],
        520,
        EASE_IN_OUT,
        0
      );

      // Barre 1 : montée
      animate(
        barOne,
        [
          { transform: 'scaleY(0.15)', transformOrigin: '13px 27px' },
          { transform: 'scaleY(1)', transformOrigin: '13px 27px' },
        ],
        220,
        EASE_OUT,
        80
      );

      // Barre 2 : montée avec snap
      animate(
        barTwo,
        [
          { transform: 'scaleY(0.15)', transformOrigin: '20px 27px' },
          { transform: 'scaleY(1.08)', transformOrigin: '20px 27px' },
          { transform: 'scaleY(1)', transformOrigin: '20px 27px' },
        ],
        330,
        EASE_SNAP,
        170
      );

      // Barre 3 : montée avec snap
      animate(
        barThree,
        [
          { transform: 'scaleY(0.12)', transformOrigin: '27px 27px' },
          { transform: 'scaleY(1.12)', transformOrigin: '27px 27px' },
          { transform: 'scaleY(1)', transformOrigin: '27px 27px' },
        ],
        380,
        EASE_SNAP,
        260
      );

      // Ligne de tendance : apparition de gauche à droite
      const lineLength = 30;
      animate(
        line,
        [
          {
            strokeDasharray: `${lineLength}`,
            strokeDashoffset: lineLength,
            opacity: 0.2,
          },
          {
            strokeDasharray: `${lineLength}`,
            strokeDashoffset: 0,
            opacity: 1,
          },
        ],
        520,
        EASE_IN_OUT,
        430
      );

      // Flèche : arrivée diagonale
      animate(
        arrow,
        [
          {
            transform: 'translate(-1.8px, 1.8px) scale(0.72)',
            opacity: 0,
            transformOrigin: '20px 20px',
          },
          {
            transform: 'translate(0.35px, -0.35px) scale(1.08)',
            opacity: 1,
            transformOrigin: '20px 20px',
          },
          {
            transform: 'translate(0, 0) scale(1)',
            opacity: 1,
            transformOrigin: '20px 20px',
          },
        ],
        420,
        EASE_SNAP,
        700
      );
    }

    return () => {
      animsRef.current.forEach((a) => a.cancel());
      animsRef.current = [];
    };
  }, [active]);

  return (
    <span className={styles.stage} aria-hidden="true">
      <svg viewBox="0 0 40 40" className={styles.featureIconSvg} style={{ color }}>
        <path
          ref={ringRef}
          d="M20 4 A16 16 0 1 1 20 36 A16 16 0 0 1 20 4"
          className={styles.featureRing}
          style={{ transformBox: 'view-box' }}
        />
        <path
          ref={barOneRef}
          d="M13 27v-5"
          className={`${styles.featureLine} ${styles.chartBar}`}
          style={{ transformBox: 'view-box' }}
        />
        <path
          ref={barTwoRef}
          d="M20 27v-9"
          className={`${styles.featureLine} ${styles.chartBar}`}
          style={{ transformBox: 'view-box' }}
        />
        <path
          ref={barThreeRef}
          d="M27 27V14"
          className={`${styles.featureLine} ${styles.chartBar}`}
          style={{ transformBox: 'view-box' }}
        />
        <path
          ref={lineRef}
          d="M12 16l6-4 5 3 7-5"
          className={`${styles.featureLine} ${styles.chartLine}`}
          style={{ transformBox: 'view-box' }}
        />
        <path
          ref={arrowRef}
          d="M26.5 9.5H31v4.5"
          className={`${styles.featureLineSoft} ${styles.chartArrow}`}
          style={{ transformBox: 'view-box' }}
        />
      </svg>
    </span>
  );
}
