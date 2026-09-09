"use client";

import styles from "./page.module.css";
import { useState } from "react";
import PlantWindSceneWrapper from "./scene";

export default function PlantWindPage() {
  const [cameraInfo, setCameraInfo] = useState<{ position: number[]; rotation: number[] } | null>(null);

  return (
    <main className={styles.page}>
      <div className={styles.sceneShell}>
        <PlantWindSceneWrapper onCameraInfo={setCameraInfo} />
      </div>

      <div className={styles.overlay}>
        <p className={styles.kicker}>Vertex Shader Deformation</p>
        <h1 className={styles.title}>Plante au vent</h1>
        {cameraInfo ? (
          <div style={{ marginTop: 8, color: "#0f1118", fontSize: 12 }}>
            <div>Cam pos: {cameraInfo.position.map((n) => n.toFixed(2)).join(", ")}</div>
            <div>Cam rot: {cameraInfo.rotation.map((n) => n.toFixed(2)).join(", ")}</div>
          </div>
        ) : null}
        <p className={styles.copy}>
          Simulation d'ondulation sans squelette ni morph target.
          Le vertex shader déplace les sommets en fonction de leur hauteur.
        </p>
      </div>
    </main>
  );
}