"use client";

import styles from "./page.module.css";
import SampleOutScene from "@/components/sample-out-scene";

export default function AmonTobinSamplePage() {
  return (
    <main className={styles.page}>
      <div className={styles.scene}>
        <SampleOutScene />
      </div>

      <div className={styles.overlay}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.artist}>Amon Tobin</h1>
            <p className={styles.album}>Out From Out Where</p>
          </div>
          <div className={styles.meta}>
            <div>Dev2Site reconstruction</div>
            <div>WebGL / React Three Fiber</div>
            <div>sample_2026-09-16T164117.285.glb</div>
          </div>
        </header>

        <div className={styles.centerHint}>
          <p className={styles.hint}>Glissez · Zoomez · Laissez tourner</p>
        </div>

        <footer className={styles.footer}>
          <div className={styles.tracklist}>
            <strong>01</strong> <span>Back From Space</span>
            <strong>02</strong> <span>Verbal</span>
            <strong>03</strong> <span>Chronic Tronic</span>
            <strong>04</strong> <span>Searchers</span>
            <strong>05</strong> <span>Hey Blondie</span>
            <strong>06</strong> <span>Rosies</span>
          </div>
          <div className={styles.barcode} aria-hidden="true" />
        </footer>
      </div>
    </main>
  );
}
