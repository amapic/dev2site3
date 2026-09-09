import styles from "./page.module.css";
import { UiUxPrismBackground } from "@/components/ui-ux-prism-background";

export default function UiUxObjectsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.canvas} aria-label="Decor futuriste UI UX">
        <div className={styles.photoBase} aria-hidden="true" />
        <div className={styles.photoGhost} aria-hidden="true" />
        <div className={styles.colorVeil} aria-hidden="true" />
        <div className={styles.lightBloom} aria-hidden="true" />
        <UiUxPrismBackground className={styles.threeLayer} />
        <div className={styles.prismField} aria-hidden="true">
          <span className={`${styles.prism} ${styles.prismA}`} />
          <span className={`${styles.prism} ${styles.prismB}`} />
          <span className={`${styles.prism} ${styles.prismC}`} />
          <span className={`${styles.prism} ${styles.prismD}`} />
          <span className={`${styles.prism} ${styles.prismE}`} />
          <span className={`${styles.prism} ${styles.prismF}`} />
          <span className={`${styles.prism} ${styles.prismG}`} />
          <span className={`${styles.prism} ${styles.prismH}`} />
        </div>
        <div className={styles.traceLayer} aria-hidden="true">
          <div className={`${styles.trace} ${styles.traceA}`}>
            <span className={`${styles.seg} ${styles.h} ${styles.s1}`} />
            <span className={`${styles.seg} ${styles.v} ${styles.s2}`} />
            <span className={`${styles.seg} ${styles.h} ${styles.s3}`} />
            <span className={`${styles.seg} ${styles.v} ${styles.s4}`} />
            <span className={styles.endDot} />
          </div>

          <div className={`${styles.trace} ${styles.traceB}`}>
            <span className={`${styles.seg} ${styles.v} ${styles.s1}`} />
            <span className={`${styles.seg} ${styles.h} ${styles.s2}`} />
            <span className={`${styles.seg} ${styles.h} ${styles.s3}`} />
            <span className={styles.endDot} />
          </div>

          <div className={`${styles.trace} ${styles.traceC}`}>
            <span className={`${styles.seg} ${styles.h} ${styles.s1}`} />
            <span className={`${styles.seg} ${styles.v} ${styles.s2}`} />
            <span className={`${styles.seg} ${styles.h} ${styles.s3}`} />
            <span className={styles.endDot} />
          </div>
        </div>
        <div className={styles.finish} aria-hidden="true" />
      </section>
    </main>
  );
}
