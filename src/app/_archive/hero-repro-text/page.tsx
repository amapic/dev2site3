import styles from './page.module.css';

type FeatureIconKind = 'design' | 'tech' | 'performance' | 'support';

function FeatureIcon({ kind }: { kind: FeatureIconKind }) {
  if (kind === 'design') {
    return (
      <span className={`${styles.featureIcon} ${styles.featureIconDesign}`} aria-hidden="true">
        <svg viewBox="0 0 36 36" className={styles.featureIconSvg}>
          <circle cx="18" cy="18" r="15" className={styles.featureRing} />
          <circle cx="18" cy="18" r="8" className={styles.featureLine} />
          <path d="M18 6v5M18 25v5M6 18h5M25 18h5" className={styles.featureLine} />
          <circle cx="18" cy="18" r="2.5" className={styles.featureFill} />
        </svg>
      </span>
    );
  }

  if (kind === 'tech') {
    return (
      <span className={`${styles.featureIcon} ${styles.featureIconTech}`} aria-hidden="true">
        <svg viewBox="0 0 36 36" className={styles.featureIconSvg}>
          <circle cx="18" cy="18" r="15" className={styles.featureRing} />
          <path d="M14 11l-5 7 5 7M22 11l5 7-5 7" className={styles.featureLine} />
          <path d="M19.5 10l-3 16" className={styles.featureLineSoft} />
        </svg>
      </span>
    );
  }

  if (kind === 'performance') {
    return (
      <span className={`${styles.featureIcon} ${styles.featureIconPerformance}`} aria-hidden="true">
        <svg viewBox="0 0 36 36" className={styles.featureIconSvg}>
          <circle cx="18" cy="18" r="15" className={styles.featureRing} />
          <path d="M11 24v-4M18 24v-8M25 24v-11" className={styles.featureLine} />
          <path d="M10 14l5-4 5 3 6-5" className={styles.featureLine} />
          <path d="M24.5 8H28v3.5" className={styles.featureLineSoft} />
        </svg>
      </span>
    );
  }

  return (
    <span className={`${styles.featureIcon} ${styles.featureIconSupport}`} aria-hidden="true">
      <svg viewBox="0 0 36 36" className={styles.featureIconSvg}>
        <circle cx="18" cy="18" r="15" className={styles.featureRing} />
        <circle cx="18" cy="13" r="4" className={styles.featureLine} />
        <path d="M10 26c1.6-3.8 4.5-5.6 8-5.6s6.4 1.8 8 5.6" className={styles.featureLine} />
        <path d="M27.5 10.5l2 2 3-3" className={styles.featureLineSoft} />
      </svg>
    </span>
  );
}

export default function HeroReproTextPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.left}>
          <span className={styles.sideLabel}>Design · Developpence · Performance</span>

          <header className={styles.brandBox}>
            <h1 className={styles.brand}>
              <span className={styles.brandDark}>DEV</span>
              <span className={styles.brandBlue}>2SITE</span>
            </h1>
            <p className={styles.brandTag}>Direction creative digitale</p>
          </header>

          <h2 className={styles.mainTitle}>
            <span className={styles.titleSolid}>Un </span>
            <span className={styles.titleGradient}>site</span>
            <br />
            <span className={styles.titleGradient}>efficace</span>
          </h2>

          <p className={styles.subtitle}>
            N'est jamais le fruit du <span className={styles.subtitleStrong}>hasard.</span>
          </p>

          <div className={styles.separator} />

          <p className={styles.pitch}>
            Depuis <span className={styles.pitchBlue}>5 ans</span>, je concois des sites sur mesure, penses pour
            <span className={styles.pitchStrong}> attirer, convaincre et generer</span> des
            <span className={styles.pitchUnderline}> resultats concrets.</span>
          </p>

          <button type="button" className={styles.cta}>
            Decouvrir mon approche <span className={styles.ctaArrow}>→</span>
          </button>
        </div>

        <aside className={styles.right}>
          <div className={styles.rightDecor} />
          <p className={styles.rightSlogan}>
            Des sites qui font
            <strong>la difference.</strong>
          </p>

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
        </aside>
      </section>
    </main>
  );
}
