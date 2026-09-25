'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import styles from './page.module.css';

function FeatureIconTarget() {
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
    <svg viewBox="0 0 36 36" className={styles.iconSvg} onMouseEnter={handleHover}>
      <circle ref={ringRef} cx="18" cy="18" r="15" className={styles.ring} />
      <circle ref={innerRef} cx="18" cy="18" r="8" className={styles.line} />
      <path ref={ticksRef} d="M18 6v5M18 25v5M6 18h5M25 18h5" className={styles.line} />
      <circle ref={dotRef} cx="18" cy="18" r="2.5" className={styles.fill} />
    </svg>
  );
}

function FeatureIconCode() {
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
    <svg viewBox="0 0 36 36" className={styles.iconSvg} onMouseEnter={handleHover}>
      <circle ref={ringRef} cx="18" cy="18" r="15" className={styles.ring} />
      <path ref={bracketsRef} d="M14 11l-5 7 5 7M22 11l5 7-5 7" className={styles.line} />
      <path ref={slashRef} d="M19.5 10l-3 16" className={styles.lineSoft} />
    </svg>
  );
}

function Card({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className={styles.card} style={{ ['--accent' as string]: color }}>
      <div className={styles.preview}>{children}</div>
      <p className={styles.label}>{title}</p>
    </div>
  );
}

export default function SvgAnimPreviewPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Previsualisation des animations SVG</h1>
      <p className={styles.subtitle}>Passe la souris sur chaque icone pour voir l'animation GSAP.</p>

      <section className={styles.grid}>
        <Card title="FeatureIconTarget (design)" color="#e9a506">
          <FeatureIconTarget />
        </Card>

        <Card title="FeatureIconCode (tech)" color="#8a5dd6">
          <FeatureIconCode />
        </Card>
      </section>
    </main>
  );
}
