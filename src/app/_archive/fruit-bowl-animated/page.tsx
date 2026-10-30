import styles from "./page.module.css";
import FruitBowlAnimatedScene from "./scene";

export default function FruitBowlAnimatedPage() {
  return (
    <main className={styles.page}>
      <div className={styles.sceneShell}>
        <FruitBowlAnimatedScene />
      </div>

      <div className={styles.overlay}>
        <p className={styles.kicker}>Interactive 3D Demo</p>
        <h1 className={styles.title}>Fruit Bowl Collection</h1>
        <p className={styles.copy}>
          Explorez le modèle 3D avec animation individuelle de chaque sous-maillage.
          Survolez les fruits pour voir leurs animations uniques.
        </p>
      </div>
    </main>
  );
}