"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const TITLE_LINES = [
  ["Agence", "web", "augmentee."],
  ["Un", "texte", "qui", "apparait."],
] as const;

const PILLARS = [
  {
    label: "Tempo",
    text: "Le titre arrive ligne par ligne avec un leger decalage pour donner une sensation plus editoriale que purement technique.",
  },
  {
    label: "Contraste",
    text: "Le sous-titre et les cartes se revelent ensuite avec une translation verticale courte et une opacite progressive.",
  },
  {
    label: "Usage",
    text: "La demo sert de base reutilisable pour un hero, une intro de section ou un bloc manifeste un peu premium.",
  },
] as const;

export default function NewGenesisTextDemoPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    const heroNode = document.getElementById("newgenesis-demo-hero");
    const detailNode = document.getElementById("newgenesis-demo-details");

    if (!heroNode && !detailNode) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          if (entry.target.id === "newgenesis-demo-hero") {
            setHeroVisible(true);
          }

          if (entry.target.id === "newgenesis-demo-details") {
            setDetailVisible(true);
          }

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    if (heroNode) {
      observer.observe(heroNode);
    }

    if (detailNode) {
      observer.observe(detailNode);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className={styles.page}>
      <section
        id="newgenesis-demo-hero"
        className={`${styles.hero} ${heroVisible ? styles.isVisible : ""}`}
        aria-label="Demo d apparition de texte inspiree de NewGenesis"
      >
        <div className={styles.heroFrame}>
          <p className={styles.eyebrow}>NewGenesis inspired text reveal</p>

          <h1 className={styles.title}>
            {TITLE_LINES.map((line, lineIndex) => (
              <span key={line.join("-")} className={styles.titleLine}>
                {line.map((word, wordIndex) => (
                  <span
                    key={word}
                    className={styles.wordMask}
                    style={{
                      "--delay": `${0.08 + lineIndex * 0.28 + wordIndex * 0.08}s`,
                    } as React.CSSProperties}
                  >
                    <span className={styles.word}>{word}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <div className={styles.leadWrap}>
            <p className={styles.lead}>
              Une demo simple pour reproduire un effet d apparition typographique: des mots masques, un decalage
              vertical court, puis un texte secondaire qui entre avec un rythme plus doux.
            </p>
          </div>

          <div className={styles.ctaRow}>
            <a href="#details" className={styles.primaryCta}>
              Voir le detail
            </a>
            <span className={styles.secondaryNote}>Apparition au chargement puis au scroll</span>
          </div>
        </div>
      </section>

      <section
        id="newgenesis-demo-details"
        className={`${styles.detailSection} ${detailVisible ? styles.isVisible : ""}`}
        aria-label="Explication du rythme d animation"
      >
        <a id="details" className={styles.anchor} aria-hidden="true" />
        <div className={styles.detailHeader}>
          <p className={styles.sectionKicker}>Construction</p>
          <h2 className={styles.sectionTitle}>Un enchainement sobre, mais tres lisible.</h2>
          <p className={styles.sectionText}>
            Le principe est volontairement minimal: masquer chaque mot, animer sa montee avec une opacite couplee,
            puis faire suivre les blocs de texte et cartes avec une latence legerement plus longue.
          </p>
        </div>

        <div className={styles.cardGrid}>
          {PILLARS.map((item, index) => (
            <article
              key={item.label}
              className={styles.card}
              style={{ "--delay": `${0.12 + index * 0.12}s` } as React.CSSProperties}
            >
              <p className={styles.cardLabel}>{item.label}</p>
              <p className={styles.cardText}>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}