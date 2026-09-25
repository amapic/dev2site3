"use client";

import styles from "./page.module.css";
import MeshyFbxViewer from "@/components/meshy-fbx-viewer";

export default function MeshyModelPage() {
  return (
    <main className={styles.page}>
      <div className={styles.overlay}>
        <p className={styles.kicker}>Visualiseur FBX</p>
        <h1 className={styles.title}>Meshy AI — Out From Out Where</h1>
        <p className={styles.hint}>
          Glissez pour tourner · Scroll pour zoomer · Double-clic pour réinitialiser
        </p>
      </div>

      <div className={styles.scene}>
        <MeshyFbxViewer />
      </div>
    </main>
  );
}
