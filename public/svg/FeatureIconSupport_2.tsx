import { useEffect, useRef } from 'react';
import styles from './FeatureIcon.module.css';

interface FeatureIconSupportProps {
  /** true = joue l'animation, false = retour à l'état de repos */
  active?: boolean;
  /** Couleur des traits principaux (défaut cyan) */
  color?: string;
  /** Couleur du tick (défaut vert pomme) */
  tickColor?: string;
}

export default function FeatureIconSupport_2({ active = false, color = 'var(--em-cyan, #05d9e8)', tickColor = '#7ed321' }: FeatureIconSupportProps) {
  const ringRef = useRef<SVGCircleElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const shouldersRef = useRef<SVGPathElement>(null);
  const tickRef = useRef<SVGPathElement>(null);
  const animsRef = useRef<Animation[]>([]);

  useEffect(() => {
    const ring = ringRef.current;
    const head = headRef.current;
    const shoulders = shouldersRef.current;
    const tick = tickRef.current;

    if (!ring || !head || !shoulders || !tick) return;

    animsRef.current.forEach((a) => a.cancel());
    animsRef.current = [];

    const EASE_OUT = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
    const EASE_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';

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

    function getPathLength(el: SVGPathElement | SVGCircleElement): number {
      if (el instanceof SVGCircleElement) {
        return 2 * Math.PI * Number(el.getAttribute('r') ?? 0);
      }
      return el.getTotalLength();
    }

    if (active) {
      // Scale global de l'icône
      animate(
        ring,
        [
          { transform: 'scale(1)', transformOrigin: '20px 20px' },
          { transform: 'scale(1.06)', transformOrigin: '20px 20px' },
        ],
        180,
        EASE_OUT,
        0
      );
      animate(
        ring,
        [
          { transform: 'scale(1.06)', transformOrigin: '20px 20px' },
          { transform: 'scale(1)', transformOrigin: '20px 20px' },
        ],
        420,
        EASE_BOUNCE,
        180
      );

      // Tête : remplissage depuis 0
      const headLength = getPathLength(head);
      animate(
        head,
        [
          { strokeDasharray: `${headLength}`, strokeDashoffset: headLength, opacity: 0.5 },
          { strokeDasharray: `${headLength}`, strokeDashoffset: 0, opacity: 1 },
        ],
        400,
        EASE_IN_OUT,
        120
      );

      // Épaules : remplissage depuis 0
      const shouldersLength = getPathLength(shoulders);
      animate(
        shoulders,
        [
          { strokeDasharray: `${shouldersLength}`, strokeDashoffset: shouldersLength, opacity: 0.5 },
          { strokeDasharray: `${shouldersLength}`, strokeDashoffset: 0, opacity: 1 },
        ],
        450,
        EASE_IN_OUT,
        260
      );

      // Tick : remplissage depuis 0 + petit scale
      const tickLength = getPathLength(tick);
      animate(
        tick,
        [
          { strokeDasharray: `${tickLength}`, strokeDashoffset: tickLength, opacity: 0 },
          { strokeDasharray: `${tickLength}`, strokeDashoffset: 0, opacity: 1 },
        ],
        350,
        EASE_IN_OUT,
        450
      );
      animate(
        tick,
        [
          { transform: 'scale(0.8)', transformOrigin: '20px 20px', opacity: 0 },
          { transform: 'scale(1.1)', transformOrigin: '20px 20px', opacity: 1 },
          { transform: 'scale(1)', transformOrigin: '20px 20px', opacity: 1 },
        ],
        420,
        EASE_BOUNCE,
        450
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
        <circle ref={ringRef} cx="20" cy="20" r="16" className={styles.featureRing} />
        <circle
          ref={headRef}
          cx="20"
          cy="15"
          r="4.4"
          className={styles.featureLine}
          style={{ transformBox: 'view-box', transformOrigin: '20px 20px' }}
        />
        <path
          ref={shouldersRef}
          d="M11.5 30c1.8-4.2 5.1-6.2 8.5-6.2s6.7 2 8.5 6.2"
          className={styles.featureLine}
          style={{ transformBox: 'view-box', transformOrigin: '20px 20px' }}
        />
        {/* Tick déplacé plus en bas et à gauche à l'intérieur du cercle */}
        <path
          ref={tickRef}
          d="M12.5 22.5l3.5 3.5 7-8"
          className={styles.featureLine}
          style={{ transformBox: 'view-box', transformOrigin: '20px 20px', color: tickColor }}
          transform="translate(10, -2) scale(0.6)"
        />
      </svg>
    </span>
  );
}
