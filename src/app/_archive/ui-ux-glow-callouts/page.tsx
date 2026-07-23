"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./page.module.css";

type Callout = {
  id: string;
  title: string;
  text: string;
  cardTop: string;
  cardLeft: string;
  path: string;
  delay: string;
};

const callouts: Callout[] = [
  {
    id: "research",
    title: "Recherche terrain",
    text: "Les interviews et analytics alimentent une priorisation claire des besoins.",
    cardTop: "12%",
    cardLeft: "6%",
    path: "M 250 194 L 176 194 L 120 128",
    delay: "0s",
  },
  {
    id: "flow",
    title: "Flux utilisateur",
    text: "Les ecrans critiques sont relies par un parcours simple et mesurable.",
    cardTop: "8%",
    cardLeft: "68%",
    path: "M 620 172 L 730 172 L 838 116",
    delay: "0.5s",
  },
  {
    id: "micro",
    title: "Micro-interactions",
    text: "Les etats hover et focus donnent un feedback visible sans surcharge.",
    cardTop: "64%",
    cardLeft: "66%",
    path: "M 650 372 L 760 372 L 842 438",
    delay: "1s",
  },
  {
    id: "conversion",
    title: "Zone de conversion",
    text: "Le CTA principal est place dans la zone de contraste maximal.",
    cardTop: "70%",
    cardLeft: "7%",
    path: "M 338 418 L 226 418 L 130 486",
    delay: "1.5s",
  },
];

const backgrounds = ["/image (9).webp", "/image22.png"];

export default function UiUxGlowCalloutsPage() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((previous) => (previous + 1) % backgrounds.length);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.stage} aria-label="Schema UI UX avec annotations lumineuses">
        <div className={styles.bgCarousel} aria-hidden="true">
          {backgrounds.map((image, index) => (
            <div
              key={image}
              className={`${styles.bgSlide} ${activeStep === index ? styles.bgSlideActive : ""}`}
              style={{ backgroundImage: `url("${image}")` }}
            />
          ))}
        </div>

        <svg className={styles.links} viewBox="0 0 1000 620" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <filter id="calloutGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {callouts.map((item) => (
            <g key={item.id}>
              <path
                d={item.path}
                pathLength={1}
                className={styles.linkPath}
                style={{ ["--delay" as const]: item.delay } as CSSProperties}
              />
              <path
                d={item.path}
                pathLength={1}
                className={styles.linkBeam}
                style={{ ["--delay" as const]: item.delay } as CSSProperties}
                filter="url(#calloutGlow)"
              />
            </g>
          ))}
        </svg>

        {callouts.map((item) => (
          <article
            key={item.id}
            className={styles.callout}
            style={{
              top: item.cardTop,
              left: item.cardLeft,
              ["--delay" as const]: item.delay,
            } as CSSProperties}
          >
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
