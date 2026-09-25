"use client";

import { useEffect, useState } from "react";
import styles from "./glitch.module.css";

const STYLES = [
  { font: "var(--font-geist-color)", color: "#39ff14" },
  { font: "var(--font-playfair)", color: "#ff2a6d" },
  { font: "var(--font-liebeheide)", color: "#05d9e8" },
  { font: "var(--font-grahamo)", color: "#f7f7ff" },
  { font: "var(--font-rando-posca)", color: "#ffae00" },
];

export default function GlitchPage() {
  const [index, setIndex] = useState(0);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      const timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % STYLES.length);
        setGlitching(false);
      }, 350);
      return () => clearTimeout(timeout);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const current = STYLES[index];

  return (
    <main className={styles.wrapper}>
      <h1
        className={`${styles.glitch} ${glitching ? styles.active : ""}`}
        style={{ fontFamily: current.font, color: current.color }}
        data-text="DEV2SITE"
      >
        DEV2SITE
      </h1>
    </main>
  );
}
