import Link from "next/link";
import styles from "../legal-page.module.css";

export default function MentionsLegalesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Informations legales</p>
          <h1 className={styles.title}>Mentions legales</h1>
          <p className={styles.lead}>
            Cette page reprend les mentions legales du site, avec les informations
            d&apos;edition, d&apos;hebergement, de propriete intellectuelle et de
            responsabilite.
          </p>
        </section>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2>1. Editeur du site</h2>
            <div className={styles.meta}>
              <p>dev</p>
              <p>SIRET : 98330171400017</p>
              <p>Directeur de la publication : Amaury PICHAT</p>
              <p>Contact : amaurypichat@gmail.com</p>
            </div>
          </section>

          <section className={styles.card}>
            <h2>2. Hebergement</h2>
            <div className={styles.meta}>
              <p>DIGITAL OCEAN</p>
              <p>2 rue de la soie, 75010 PARIS</p>
            </div>
          </section>

          <section className={styles.card}>
            <h2>3. Propriete intellectuelle</h2>
            <p>
              L&apos;ensemble du site releve de la legislation francaise et
              internationale sur le droit d&apos;auteur et la propriete
              intellectuelle. Tous les droits de reproduction sont reserves,
              y compris pour les documents telechargeables, les illustrations et
              les photographies.
            </p>
          </section>

          <section className={styles.card}>
            <h2>4. Protection des donnees personnelles</h2>
            <p>
              Conformement au RGPD, vous disposez d&apos;un droit d&apos;acces,
              de rectification, de suppression et d&apos;opposition sur vos
              donnees personnelles.
            </p>
            <p>Pour exercer ces droits : amaurypichat@gmail.com</p>
          </section>

          <section className={styles.card}>
            <h2>5. Cookies</h2>
            <p>
              Ce site utilise des cookies pour ameliorer l&apos;experience
              utilisateur. En continuant la navigation, vous acceptez leur
              utilisation selon les regles en vigueur.
            </p>
          </section>

          <section className={styles.card}>
            <h2>6. Limitation de responsabilite</h2>
            <p>
              La responsabilite de l&apos;editeur ne peut etre engagee en cas de
              defaillance, panne, difficulte ou interruption de fonctionnement du
              service, empechant l&apos;acces au site ou a certaines
              fonctionnalites.
            </p>
          </section>

          <section className={styles.card}>
            <h2>7. Liens hypertextes</h2>
            <p>
              Le site peut contenir des liens vers des sites tiers. L&apos;editeur
              ne controle pas leur contenu et decline toute responsabilite quant
              aux risques eventuels lies a ces ressources externes.
            </p>
          </section>

          <section className={styles.card}>
            <h2>8. Droit applicable et juridiction competente</h2>
            <p>
              Tout litige lie a l&apos;utilisation du site est soumis au droit
              francais. Les tribunaux competents de Lyon sont seuls habilites a
              traiter les differends.
            </p>
          </section>
        </div>

        <Link href="/" className={styles.backHome}>
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
