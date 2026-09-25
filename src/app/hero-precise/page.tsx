"use client";

import styles from './page.module.css';
import CrystalBurstCanvas from '@/components/crystal-burst-canvas';
import { useState, useEffect, useRef } from 'react';
import FeatureIconTarget_2 from '../../../public/svg/FeatureIconTarget_2';
import FeatureIconCode_2 from '../../../public/svg/FeatureIconCode_2';
import FeatureIconGrowth_2 from '../../../public/svg/FeatureIconGrowth_2';
import FeatureIconSupport_2 from '../../../public/svg/FeatureIconSupport_2';

import localFont from 'next/font/local';

const playfair = localFont({
  src: '../../../public/font/PlayfairDisplay-Bold avec deco.woff2',
  variable: '--font-playfair-regular',
  display: 'swap',
});

type FeatureKind = 'design' | 'tech' | 'performance' | 'support';

function FeatureIcon({ kind, isHovered }: { kind: FeatureKind; isHovered?: boolean }) {
  if (kind === 'design') {
    return <FeatureIconTarget_2 active={isHovered ?? false} color="var(--em-yellow, #e9a506)" />;
  }

  if (kind === 'tech') {
    return <FeatureIconCode_2 active={isHovered ?? false} color="#8a5dd6" />;
  }

  if (kind === 'performance') {
    return <FeatureIconGrowth_2 active={isHovered ?? false} color="var(--em-blue, #003d82)" />;
  }

  return <FeatureIconSupport_2 active={isHovered ?? false} color="var(--em-cyan, #05d9e8)" tickColor="#7ed321" />;
}

export default function HeroPrecisePage() {
  return <HeroPreciseSection />;
}

type HeroPreciseSectionProps = {
  asSection?: boolean;
};

function FeatureCard({ kind, title, text }: { kind: FeatureKind; title: string; text: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={styles.feature}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <FeatureIcon kind={kind} isHovered={isHovered} />
      <div>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureText}>{text}</p>
      </div>
    </article>
  );
}

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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const ua = navigator.userAgent;
    const chrome = /Chrome/.test(ua) && !/Edg|OPR|SamsungBrowser/.test(ua);
    setIsChrome(chrome);
  }, []);

  // Auto-switch panel disabled: the canvas stays on the model chosen by the user.
  useEffect(() => {
    setProgress(0);
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
            <>
              <p className={styles.description}>
                Depuis <span className={styles.highlightBlue}>5 ans</span>, je concois des sites sur mesure,
                pensés pour être <strong>légers, durables et respectueux</strong> de
                <span className={styles.highlightYellow}> l'environnement</span>.
              </p>
              <p className={styles.greenHosting}>
                Hébergement 100 % énergie renouvelable — Green Web Foundation : 94/100.
              </p>
            </>
          ) : (
            <p className={styles.description}>
              Chaque projet est pensé sur mesure pour <strong>attirer, convaincre et générer</strong> des
              <span className={styles.highlightYellow}> résultats concrets</span>.
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
          <FeatureCard
            kind="design"
            title="Design sur mesure"
            text="Desss interfaces uniques, pensees pour votre identite."
          />
          <FeatureCard
            kind="tech"
            title="Technologies modernes"
            text="Des sites rapides, securises et optimises pour durer."
          />
          <FeatureCard
            kind="performance"
            title="Oriente performance"
            text="Chaque detail est pense pour maximiser vos conversions."
          />
          <FeatureCard
            kind="support"
            title="Accompagnement personnalise"
            text="A vos cotes a chaque etape, meme apres la mise en ligne."
          />
        </div>
      </section>
    </Wrapper>
  );
}