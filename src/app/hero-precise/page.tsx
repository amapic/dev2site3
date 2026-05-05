import { Playfair_Display } from 'next/font/google';
import styles from './page.module.css';
import CrystalBurstCanvas from '@/components/crystal-burst-canvas';

type FeatureKind = 'design' | 'tech' | 'performance' | 'support';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'] });

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

export function HeroPreciseSection({ asSection = false }: HeroPreciseSectionProps) {
  const Wrapper = asSection ? 'section' : 'main';

  return (
    <Wrapper className={styles.page}>
      <section className={styles.hero}>
          <CrystalBurstCanvas className={styles.crystalBg} />
          <div className={styles.left}>
          <span className={styles.sideLabel}>Design - Developpence - Performance</span>

          <header className={styles.brand}>
            <div className={styles.brandName}>
              <span>DEV</span>
              <span className={styles.brandAccent}>2</span>
              <span>SITE</span>
            </div>
            <div className={styles.brandTag}>Direction creative digitale</div>
          </header>

          <h1 className={`${styles.title} ${playfair.className} `}>
            Un <span className={styles.titleGradient}>site</span>
            <br />
            <span className={styles.titleGradient}>efficace</span>
          </h1>

          <div className={styles.baselineRow}>
            <p className={styles.baseline}>n&apos;est jamais le fruit du</p>
            <p className={styles.baselineStrong}>hasard.</p>
          </div>

          <div className={styles.separator} />

          <p className={styles.description}>
            Depuis <span className={styles.highlightBlue}>5 ans</span>, je concois des sites sur mesure,
            penses pour <strong>attirer, convaincre et generer</strong> des
            <span className={styles.highlightYellow}> resultats concrets</span>.
          </p>

          <button type="button" className={styles.cta}>
            Decouvrir mon approche <span className={styles.ctaArrow}>→</span>
          </button>
        </div>

        <aside className={styles.right}>
          <div className={styles.rightTag}>
            Des sites qui font
            <strong>la difference.</strong>
          </div>
          <div className={styles.rightBackdrop} />
          <div className={styles.rightLines} />
        </aside>

        <div className={styles.bottomStrip}>
          <article className={styles.feature}>
            <FeatureIcon kind="design" />
            <div>
              <h3 className={styles.featureTitle}>Design sur mesure</h3>
              <p className={styles.featureText}>Des interfaces uniques, pensees pour votre identite.</p>
            </div>
          </article>

          <article className={styles.feature}>
            <FeatureIcon kind="tech" />
            <div>
              <h3 className={styles.featureTitle}>Technologies modernes</h3>
              <p className={styles.featureText}>Des sites rapides, securises et optimises pour durer.</p>
            </div>
          </article>

          <article className={styles.feature}>
            <FeatureIcon kind="performance" />
            <div>
              <h3 className={styles.featureTitle}>Oriente performance</h3>
              <p className={styles.featureText}>Chaque detail est pense pour maximiser vos conversions.</p>
            </div>
          </article>

          <article className={styles.feature}>
            <FeatureIcon kind="support" />
            <div>
              <h3 className={styles.featureTitle}>Accompagnement personnalise</h3>
              <p className={styles.featureText}>A vos cotes a chaque etape, meme apres la mise en ligne.</p>
            </div>
          </article>
        </div>
      </section>
    </Wrapper>
  );
}
