import styles from "./location-map-section.module.css";

export default function LocationMapSection() {
  return (
    <section className={styles.wrap} aria-label="Section adresse et plan">
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.badge}>Adresse</p>
          <h2 className={styles.title}>
            Venez nous
            <br />
            rencontrer au bureau
          </h2>
          <p className={styles.copy}>
            Passez nous voir directement a l&apos;adresse suivante.
          </p>
          <p className={styles.address}>
            8 rue Sully
          </p>
          <a
            className={styles.link}
            href="https://www.google.com/maps/search/?api=1&query=8+rue+sully"
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir dans Google Maps
          </a>

          <p className={styles.hoursTitle}>Horaires</p>
          <p className={styles.hours}>Lundi - Vendredi : 9h - 18h</p>
        </div>

        <div className={styles.mapCard}>
          <iframe
            title="Carte vers 8 rue Sully"
            src="https://maps.google.com/maps?q=8%20rue%20sully&z=15&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
