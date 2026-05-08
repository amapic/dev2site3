import styles from "./page.module.css";
import PlantWindSceneWrapper from "./scene";

export default function PlantWindPage() {
  return (
    <main className={styles.page}>
      <div className={styles.sceneShell}>
        <PlantWindSceneWrapper />
      </div>

      <div className={styles.overlay}>
        <p className={styles.kicker}>Vertex Shader Deformation</p>
        <h1 className={styles.title}>Plante au vent</h1>
        <p className={styles.copy}>
          Simulation d'ondulation sans squelette ni morph target.
          Le vertex shader déplace les sommets en fonction de leur hauteur.
        </p>
      </div>
    </main>
  );
}