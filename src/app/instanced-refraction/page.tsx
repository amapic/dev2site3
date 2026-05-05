import styles from "./page.module.css";
import InstancedRefractionScene from "./scene";

export default function InstancedRefractionPage() {
  return (
    <main className={styles.page}>
      <div className={styles.sceneShell}>
        <InstancedRefractionScene />
      </div>

      <div className={styles.overlay}>
        <p className={styles.kicker}>Recovered sandbox demo</p>
        <h1 className={styles.title}>Instanced refraction</h1>
        <p className={styles.copy}>
          Portage du CodeSandbox dans une route Next.js locale, avec scene React Three Fiber,
          collisions Rapier, bloom et modele GLB local.
        </p>
      </div>
    </main>
  );
}