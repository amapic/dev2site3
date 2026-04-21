"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/accompagnement-poster/page.module.css";

const STEPS = [
  {
    ghost: "CONTACT",
    kicker: "Étape 01 • premier échange",
    title: "Découverte",
    lead: "On échange sur le besoin, les objectifs, l’univers visuel et les priorités du projet pour poser une base claire.",
    badge: "Contact",
    image: "/carroussel/image%20(1).png",
  },
  {
    ghost: "CADRAGE",
    kicker: "Étape 02 • structure du projet",
    title: "Cadrage",
    lead: "On définit les parcours, les contenus, la hiérarchie et le cadre technique pour lancer la réalisation efficacement.",
    badge: "Cadrage",
    image: "/carroussel/image%20(4drgksrjk).png",
  },
  {
    ghost: "DESIGN",
    kicker: "Étape 03 • direction UI/UX",
    title: "Design UI",
    lead: "Les maquettes prennent forme avec un système visuel cohérent, lisible et aligné avec l’image de marque.",
    badge: "Design",
    image: "/carroussel/girl%20poen.png",
  },
  {
    ghost: "BUILD",
    kicker: "Étape 04 • intégration et développement",
    title: "Production",
    lead: "Le site est intégré proprement, optimisé et testé pour garantir une expérience fluide sur tous les écrans.",
    badge: "Dév",
    image: "/carroussel/girl%20poen.png",
  },
  {
    ghost: "GO LIVE",
    kicker: "Étape 05 • livraison finale",
    title: "Lancement",
    lead: "La mise en ligne se fait dans de bonnes conditions, avec les derniers réglages, les vérifications et la prise en main.",
    badge: "Livraison",
    image: "/carroussel/girl%20poen.png",
  },
] as const;

type Phase = "idle" | "out" | "in";

export default function AccompagnementPosterSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const handleSelect = (nextIndex: number) => {
    if (nextIndex === activeIndex || phase === "out") {
      return;
    }

    clearTimers();
    setPhase("out");

    timersRef.current.push(
      window.setTimeout(() => {
        setActiveIndex(nextIndex);
        setPhase("in");

        timersRef.current.push(
          window.setTimeout(() => {
            setPhase("idle");
          }, 1000),
        );
      }, 1000),
    );
  };

  const step = STEPS[activeIndex];
  const ghostMotionClass = phase === "out" ? styles.ghostMotionExit : phase === "in" ? styles.ghostMotionEnter : "";
  const titleMotionClass = phase === "out" ? styles.titleMotionExit : phase === "in" ? styles.titleMotionEnter : "";
  const copyMotionClass = phase === "out" ? styles.copyMetaExit : phase === "in" ? styles.copyMetaEnter : "";
  const imageMotionClass = phase === "out" ? styles.imageExit : phase === "in" ? styles.imageEnter : "";

  return (
    <div className={styles.page}>
      <section className={styles.stage} aria-label="Poster visuel pour carrousel">
        <article className={styles.poster}>
          <div
            className={`${styles.imageLayer} ${imageMotionClass}`}
            style={{ backgroundImage: `url("${step.image}")` }}
            aria-hidden="true"
          />

          <div className={styles.topBands} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className={styles.cornerMark} aria-hidden="true">
            <span className={styles.cornerMarkSymbol}>✦</span>
            <span className={styles.cornerMarkLabel}>Template</span>
          </div>

          <span  className={`${styles.ghostWord} AAA ${ghostMotionClass}`} aria-hidden="true">
            {step.ghost}
          </span>

          <div className={styles.posterGrid}>
            <div className={styles.cutoutZone}>
              <div className={styles.cutoutAura} aria-hidden="true" />
              <div className={styles.sticker}>{step.badge}</div>
            </div>

            <div className={styles.copyBlock}>
              <div className={`${styles.copyMeta} ${copyMotionClass}`}>
                <p className={styles.kicker}>{step.kicker}</p>
              </div>

              <div className={`${styles.titleMotion} ${titleMotionClass}`}>
                <h2 className={styles.title}>{step.title}</h2>
              </div>

              <div className={`${styles.copyMeta} ${copyMotionClass}`}>
                <p className={styles.lead}>{step.lead}</p>
              </div>
            </div>
          </div>

          <nav className={styles.dotsNav} aria-label="Navigation du carrousel">
            {STEPS.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Aller à l’étape ${index + 1}`}
                aria-pressed={index === activeIndex}
                className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
                onClick={() => handleSelect(index)}
              />
            ))}
          </nav>

          <div className={styles.bottomBands} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </article>
      </section>
    </div>
  );
}