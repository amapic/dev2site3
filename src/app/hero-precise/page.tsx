"use client";

import styles from './page.module.css';
import CrystalBurstCanvas from '@/components/crystal-burst-canvas';
import { useState, useEffect, useRef } from 'react';

import localFont from 'next/font/local';

const playfair = localFont({
  src: '../../../public/font/PlayfairDisplay-Bold avec deco.woff2',
  variable: '--font-playfair-regular',
  display: 'swap',
});

type FeatureKind = 'design' | 'tech' | 'performance' | 'support';

function FeatureIcon({ kind }: { kind: FeatureKind }) {
  if (kind === 'design') {
    return (
      <span className={`${styles.featureIcon} ${styles.featureIconDesign}`} aria-hidden="true">
        <svg viewBox="0 0 40 40" className={styles.featureIconSvg}>
          <circle cx="20" cy="20" r="16" className={styles.iconRing} />
          <circle cx="20" cy="20" r="7.5" className={styles.iconLine} />
          <path d="M20 6v5M20 29v5M6 20h5M29 20h5" className={styles.iconLine} />
          <circle cx="20" cy="20" r="2.6" className={styles.iconFill} />
        </svg>
      </span>
    );
  }

  if (kind === 'tech') {
    return (
      <span className={`${styles.featureIcon} ${styles.featureIconTech}`} aria-hidden="true">
        <svg viewBox="0 0 40 40" className={styles.featureIconSvg}>
          <circle cx="20" cy="20" r="16" className={styles.iconRing} />
          <path d="M16 12l-5 8 5 8M24 12l5 8-5 8" className={styles.iconLine} />
          <path d="M21.5 11l-3 18" className={styles.iconLineSoft} />
        </svg>
      </span>
    );
  }

  if (kind === 'performance') {
    return (
      <span className={`${styles.featureIcon} ${styles.featureIconPerformance}`} aria-hidden="true">
        <svg viewBox="0 0 40 40" className={styles.featureIconSvg}>
          <circle cx="20" cy="20" r="16" className={styles.iconRing} />
          <path d="M13 27v-5M20 27v-9M27 27V14" className={styles.iconLine} />
          <path d="M12 16l6-4 5 3 7-5" className={styles.iconLine} />
          <path d="M26.5 9.5H31v4.5" className={styles.iconLineSoft} />
        </svg>
      </span>
    );
  }

  return (
    <span className={`${styles.featureIcon} ${styles.featureIconSupport}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" className={styles.featureIconSvg}>
        <circle cx="20" cy="20" r="16" className={styles.iconRing} />
        <circle cx="20" cy="15" r="4.4" className={styles.iconLine} />
        <path d="M11.5 30c1.8-4.2 5.1-6.2 8.5-6.2s6.7 2 8.5 6.2" className={styles.iconLine} />
        <path d="M30 13l2.4 2.4 3.6-4.2" className={styles.iconLineSoft} />
      </svg>
    </span>
  );
}

export default function HeroPrecisePage() {
  return <HeroPreciseSection />;
}

type HeroPreciseSectionProps = {
  asSection?: boolean;
};

function useInView<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

const INITIAL_CAMERA_INFO = {
  position: [-0.51, 0.24, 0.75],
  polar: 1.5,
  azimuthal: 2.72,
};

export function HeroPreciseSection({ asSection = false }: HeroPreciseSectionProps) {
  const Wrapper = asSection ? 'section' : 'main';
  const { ref: wrapperRef, isInView } = useInView<HTMLElement>(0.3);
  const [model, setModel] = useState<'crystal' | 'plant'>('crystal');
  const [framesUnlocked, setFramesUnlocked] = useState(false);
  const [isLoadingPlant, setIsLoadingPlant] = useState(false);
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent;
    const chrome = /Chrome/.test(ua) && !/Edg|OPR|SamsungBrowser/.test(ua);
    setIsChrome(chrome);
  }, []);

  // Preload plant model on mount so it's ready when user switches
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');
    const loader = new GLTFLoader();
    loader.preload?.('/model/PlantOrchid001_Blender_Cyclesjjj.glb') ?? loader.load('/model/PlantOrchid001_Blender_Cyclesjjj.glb', () => {});
  }, []);

  // Disable page scroll when camera is unlocked
  useEffect(() => {
    if (framesUnlocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [framesUnlocked]);

  return (
    <Wrapper ref={wrapperRef} className={styles.page} id ="hellooo">
      <section className={`${styles.hero} ${isInView ? styles.heroVisible : ''}`}>
          <CrystalBurstCanvas
            className={`${styles.crystalBg} ${styles.revealCanvas}`}
            modelMode={model}
            animate={framesUnlocked}
            initialCameraPosition={[INITIAL_CAMERA_INFO.position[0], INITIAL_CAMERA_INFO.position[1], INITIAL_CAMERA_INFO.position[2]]}
            initialPolarAngle={INITIAL_CAMERA_INFO.polar}
            initialAzimuthalAngle={INITIAL_CAMERA_INFO.azimuthal}
            onLoadingChange={setIsLoadingPlant}
          />
          {isLoadingPlant ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                paddingTop: '15vh',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '5px solid rgba(0, 169, 198, 0.25)',
                  borderTopColor: '#00a9c6',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : null}
          <div className={`${styles.left} ${styles.reveal}`}>
          <span className={styles.sideLabel}>Design - Developpence - Performance</span>

          <header className={styles.brand}>
            <div className={styles.brandName}>
              <span>  </span>
              <span className={styles.brandAccent}> </span>
              <span>  </span>
            </div>
            <div className={styles.brandTag}>Direction creative digitale</div>
          </header>

          <h1 className={`${styles.title} ${playfair.className} `}>
            {model === 'plant' ? (
              <>
                <span className={isChrome ? playfair.className : ''}>Un </span>
                <span className={styles.titleGradient}>site</span>
                <br />
                <span className={styles.titleGradient}>responsable</span>
              </>
            ) : (
              <>
                <span className={isChrome ? playfair.className : ''}>Un </span>
                <span className={styles.titleGradient}>site</span>
                <br />
                <span className={styles.titleGradient}>efficace...</span>
              </>
            )}
          </h1>

          <div className={styles.baselineRow}>
            {model === 'plant' ? (
              <>
                <p className={styles.baseline}>ne pollue pas, il</p>
                <p className={styles.baselineStrong}>perdure.</p>
              </>
            ) : (
              <>
                <p className={styles.baseline}>n'est jamais le fruit du</p>
                <p className={styles.baselineStrong}>hasard.</p>
              </>
            )}
          </div>

          <div className={styles.separator} />

          {model === 'plant' ? (
            <p className={styles.description}>
              Depuis <span className={styles.highlightBlue}>5 ans</span>, je concois des sites sur mesure,
              pensés pour être <strong>légers, durables et respectueux</strong> de
              <span className={styles.highlightYellow}> l'environnement</span>.
              <br />
              Hébergement 100 % énergie renouvelable — Green Web Foundation : 94/100.
            </p>
          ) : (
            <p className={styles.description}>
              Depuis <span className={styles.highlightBlue}>5 ans</span>, je concois des sites sur mesure,
              penses pour <strong>attirer, convaincre et generer</strong> des
              <span className={styles.highlightYellow}> resultats concrets</span>.
            </p>
          )}

    
        </div>

        <aside className={styles.right}>
          <div className={`${styles.rightTag} ${styles.reveal} ${styles.revealDelay1}`}>
            Des sites qui font
            <strong>la difference.</strong>

            <div style={{ marginTop: 12 }}>
              <button
                aria-label={model === 'plant' ? 'Afficher la forme' : 'Afficher la plante'}
                onClick={() => {
                  setFramesUnlocked(true);
                  setModel((m) => (m === 'plant' ? 'crystal' : 'plant'));
                }}
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '2px 8px 2px 4px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  pointerEvents: 'auto',
                }}
              >
                <img
                  src="/image%20(2).png"
                  alt="orchidée"
                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 4 }}
                />
                <span style={{ fontSize: 24 }}>{model === 'plant' ? 'Des sites efficaces' : 'Des sites verts'}</span>
              </button>

            </div>
          </div>

          <div className={styles.rightBackdrop} />
          <div className={styles.rightLines} />
        </aside>

        <div className={`${styles.bottomStrip} ${styles.reveal} ${styles.revealDelay2}`}>
          <article className={styles.feature}>
            <FeatureIcon kind="design" />
            <div>
              <h3 className={styles.featureTitle}>Design sur mesure</h3>
              <p className={styles.featureText}>Des interfaces uniques, pensees pour votre identite.</p>
              <div className={styles.featureDetail}>
                <img
                  className={styles.featureDetailVideo}
                  src="/515443-PIOR9O-202.png"
                  alt=""
                  aria-hidden="true"
                />
                <p>Processus créatif, maquettes, prototypes et livrables détaillés.</p>
              </div>
            </div>
          </article>

          <article className={styles.feature}>
            <FeatureIcon kind="tech" />
            <div>
              <h3 className={styles.featureTitle}>Technologies modernes</h3>
              <p className={styles.featureText}>Des sites rapides, securises et optimises pour durer.</p>
              <div className={styles.featureDetail}>
                <img
                  className={styles.featureDetailVideo}
                  src="/515443-PIOR9O-202.png"
                  alt=""
                  aria-hidden="true"
                />
                <p>Utilisation de React, Next.js, optimisation SEO et performances.</p>
              </div>
            </div>
          </article>

          <article className={styles.feature}>
            <FeatureIcon kind="performance" />
            <div>
              <h3 className={styles.featureTitle}>Oriente performance</h3>
              <p className={styles.featureText}>Chaque detail est pense pour maximiser vos conversions.</p>
              <div className={styles.featureDetail}>
                <img
                  className={styles.featureDetailVideo}
                  src="/515443-PIOR9O-202.png"
                  alt=""
                  aria-hidden="true"
                />
                <p>Analyse de performance, temps de chargement, Core Web Vitals.</p>
              </div>
            </div>
          </article>

          <article className={styles.feature}>
            <FeatureIcon kind="support" />
            <div>
              <h3 className={styles.featureTitle}>Accompagnement personnalise</h3>
              <p className={styles.featureText}>A vos cotes a chaque etape, meme apres la mise en ligne.</p>
              <div className={styles.featureDetail}>
                <img
                  className={styles.featureDetailVideo}
                  src="/515443-PIOR9O-202.png"
                  alt=""
                  aria-hidden="true"
                />
                <p>Support continu, maintenance, evolutions et conseils post‑lancement.</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </Wrapper>
  );
}