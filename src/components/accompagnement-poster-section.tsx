"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/accompagnement-poster/page.module.css";
import PrismaticRibbonBandCanvas from "@/components/prismatic-ribbon-band-canvas";

const STEPS = [
  {
    ghost: "CONTACT",
    kicker: "Étape 01 • prise de contact",
    title: "Premier échange",
    lead: "On fait connaissance, on parle de votre besoin, de vos objectifs et du contexte du projet pour poser une première base claire avant d’aller plus loin.",
    badge: "Contact",
    image: "/carroussel/image%20(1).png",
  },
  {
    ghost: "CADRAGE",
    kicker: "Étape 02 • cadrage du projet",
    title: "Cadrage",
    lead: "On réfléchit ensemble au périmètre, aux contenus, aux priorités et aux attentes pour que tout soit bien défini et validé entre vous et moi avant la production.",
    badge: "Cadrage",
    image: "/carroussel/image%20(4drgksrjk).png",
  },
  {
    ghost: "DEV",
    kicker: "Étape 03 • développement",
    title: "Développement",
    lead: "Je passe à la réalisation du site: intégration, développement des fonctionnalités, structure des pages et mise en place d’une base propre, rapide et fiable.",
    badge: "Dév",
    image: "/carroussel/image%20(30).png",
  },
  {
    ghost: "LAUNCH",
    kicker: "Étape 04 • mise en ligne",
    title: "Déploiement",
    lead: "Une fois le site prêt, je le déploie dans de bonnes conditions pour le mettre en ligne proprement, avec les derniers réglages et vérifications avant ouverture au public.",
    badge: "Mise en ligne",
    image: "/carroussel/image33ter.png",
  },
  {
    ghost: "SUIVI",
    kicker: "Étape 05 • accompagnement durable",
    title: "Suivi dans le temps",
    lead: "Le projet ne s’arrête pas à la mise en ligne: je peux vous accompagner ensuite pour les ajustements, les évolutions, la maintenance et la suite de votre présence en ligne.",
    badge: "Accompagnement",
    image: "/carroussel/image%20(32).png",
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
          }, 500),
        );
      }, 500),
    );
  };

  const step = STEPS[activeIndex];
  const ghostMotionClass = phase === "out" ? styles.ghostMotionExit : phase === "in" ? styles.ghostMotionEnter : "";
  const titleMotionClass = phase === "out" ? styles.titleMotionExit : phase === "in" ? styles.titleMotionEnter : "";
  const copyMotionClass = phase === "out" ? styles.copyMetaExit : phase === "in" ? styles.copyMetaEnter : "";
  const imageMotionClass = phase === "out" ? styles.imageExit : phase === "in" ? styles.imageEnter : "";

  return (
    <div className={styles.page}>
      <div className={styles.topBands} aria-hidden="true">
        <PrismaticRibbonBandCanvas transparent className={styles.bandCanvas} />
      </div>

      <section className={styles.intro} aria-label="Introduction a la section accompagnement">
        <div className={styles.introInner}>
          <p className={styles.introKicker}>Direction creative digitale</p>

          <h2
            className={`${styles.introTitle}  `}
            style={{ fontFamily: "'Playfair Display', 'Playfair Display Fallback', serif" }}
          >
            <span>
              Un projet web,
              <br />
              se construit avec methode
            </span>
          </h2>

          <p className={styles.introBaseline}>du premier echange a la mise en ligne.</p>

          <div className={styles.introSeparator} />

          <p className={styles.introText}>
            Chaque etape compte: cadrer le besoin, structurer les contenus,
            {/* designer avec justesse, developper proprement et deployer dans de
            bonnes conditions. Le carousel ci-dessous montre comment le projet
            avance de facon claire et concrete. */}
          </p>
        </div>
      </section>

      <section className={styles.stage} aria-label="Poster visuel pour carrousel">
        <article className={styles.poster}>
          <div
            className={`imagenb ${styles.imageLayer} ${imageMotionClass}`}
            style={{
              backgroundImage:
                activeIndex === 0
                  ? `image-set(url("/carroussel/image-1-400.avif") type("image/avif") 1x, url("/carroussel/image-1.avif") type("image/avif") 2x, url("/carroussel/image-1-400.webp") type("image/webp") 1x, url("/carroussel/image-1.webp") type("image/webp") 2x, url("/carroussel/image%20(1).png") type("image/png"))`
                  : `url("${step.image}")`,
            }}
            aria-hidden="true"
          />

          {/* <div className={styles.cornerMark} aria-hidden="true">
            <span className={styles.cornerMarkSymbol}>✦</span>
            <span className={styles.cornerMarkLabel}>Template</span>
          </div> */}

          <nav className={styles.dotsNav} aria-label="Navigation du carrousel">
            <span
              className={styles.dotTrail}
              style={{ "--dot-i": activeIndex } as React.CSSProperties}
              aria-hidden="true"
            />
            <span
              className={styles.dotGlider}
              style={{ "--dot-i": activeIndex } as React.CSSProperties}
              aria-hidden="true"
            />
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

          <span className={`${styles.ghostWord} ${ghostMotionClass}`} aria-hidden="true">
            {step.ghost}
          </span>

          <div className={styles.posterGrid}>
            <div className={styles.cutoutZone}>
              {/* <div className={styles.cutoutAura} aria-hidden="true" /> */}
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

          

          <div className={styles.bottomBands} aria-hidden="true">
            <PrismaticRibbonBandCanvas transparent className={`${styles.bandCanvas} ${styles.bandCanvasMirror}`} />
          </div>
        </article>
      </section>
    </div>
  );
}