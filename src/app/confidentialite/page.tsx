import Link from "next/link";
import styles from "../legal-page.module.css";

export default function ConfidentialitePage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Donnees et vie privee</p>
          <h1 className={styles.title}>Politique de confidentialite</h1>
          <p className={styles.lead}>
            Cette politique de confidentialite decrit la collecte, l&apos;usage,
            la conservation et la protection des donnees personnelles.
            Derniere mise a jour : 04/05/2025.
          </p>
        </section>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2>1. Introduction</h2>
            <p>
              La presente politique precise la maniere dont nous collectons,
              utilisons et protegeons les informations transmises lors de
              l&apos;utilisation du site.
            </p>
          </section>

          <section className={styles.card}>
            <h2>2. Collecte des informations</h2>
            <ul>
              <li>Nom et prenom</li>
              <li>Adresse email</li>
              <li>Numero de telephone</li>
              <li>Informations demographiques</li>
              <li>Informations utiles aux enquetes client et aux offres</li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>3. Utilisation des informations</h2>
            <ul>
              <li>Gestion de votre compte</li>
              <li>Amelioration des services</li>
              <li>Communication marketing avec votre consentement</li>
              <li>Analyse statistique</li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>4. Protection des informations</h2>
            <p>
              Nous mettons en place des mesures de securite adaptees afin de
              proteger vos donnees personnelles. Les informations sensibles
              transmises en ligne sont protegees par des mecanismes de
              chiffrement adaptes.
            </p>
          </section>

          <section className={styles.card}>
            <h2>5. Cookies</h2>
            <p>
              Le site utilise des cookies de session et persistants pour
              ameliorer l&apos;experience utilisateur.
            </p>
            <ul>
              <li>Cookies necessaires au fonctionnement du site</li>
              <li>Cookies analytiques</li>
              <li>Cookies de preferences</li>
              <li>Cookies publicitaires, le cas echeant</li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>6. Vos droits RGPD</h2>
            <ul>
              <li>Droit d&apos;acces</li>
              <li>Droit de rectification</li>
              <li>Droit a l&apos;effacement</li>
              <li>Droit a la limitation du traitement</li>
              <li>Droit a la portabilite des donnees</li>
              <li>Droit d&apos;opposition</li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>7. Partage des informations</h2>
            <p>
              Nous ne vendons ni n&apos;echangeons vos informations personnelles.
              Certaines donnees peuvent etre partagees avec des prestataires de
              confiance strictement necessaires a l&apos;exploitation du site, sous
              engagement de confidentialite.
            </p>
          </section>

          <section className={styles.card}>
            <h2>8. Conservation des donnees</h2>
            <p>
              Les donnees sont conservees uniquement pendant la duree necessaire
              aux finalites de traitement, dans le respect des obligations
              legales, comptables et de reporting.
            </p>
          </section>

          <section className={`${styles.card} ${styles.cardFull}`}>
            <h2>9. Contact</h2>
            <div className={styles.meta}>
              <p>Email : amo@dev2site.net</p>
              <p>Telephone : 06 88 91 80 19</p>
            </div>
          </section>
        </div>

        <Link href="/" className={styles.backHome}>
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
