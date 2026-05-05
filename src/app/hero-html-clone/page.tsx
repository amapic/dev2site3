import Image from 'next/image';
import { Inter, Playfair_Display } from 'next/font/google';
import styles from './page.module.css';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '600'] });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600'] });

export default function HeroHtmlClonePage() {
  return (
    <main className={`${styles.page} ${inter.className}`}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.subtitle}>DIRECTION CREATIVE DIGITALE</p>

          <h1 className={`${styles.title} ${playfair.className} box-logo`}>
            Un <span className={styles.gradientText}>site</span>
            <br />
            <span className={styles.gradientText}>efficace</span>
          </h1>

          <p className={styles.baseline}>
            n&apos;est jamais le fruit du <strong>hasard.</strong>
          </p>

          <p className={styles.description}>
            Depuis <strong>5 ans</strong>, je concois des sites sur mesure, penses pour{' '}
            <strong>attirer, convaincre et generer</strong> des resultats concrets.
          </p>

          <button type="button" className={styles.cta}>
            Decouvrir mon approche →
          </button>
        </div>

        <Image
          src="/hero-shape.svg"
          alt=""
          width={900}
          height={700}
          className={styles.heroShape}
          priority
        />
      </section>
    </main>
  );
}
