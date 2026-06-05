"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./location-map-section.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function LocationMapSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;

    const inners = Array.from(el.querySelectorAll<HTMLElement>("[data-line-inner]"));
    if (inners.length === 0) return;

    // état initial : texte caché sous le masque
    gsap.set(inners, { yPercent: 110 });

    const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1.4, paused: true });
    tl.to(inners, { yPercent: 0, duration: 0.85, ease: "power3.out", stagger: 0.13 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top center",
      onEnter: () => tl.play(),
    });

    // recalcul après hydratation complète
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(id);
      tl.kill();
      st.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.wrap} aria-label="Section adresse et plan">
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.badge}>Adresse</p>
          <h2 ref={titleRef} className={styles.title}>
            <span className={styles.lineWrap}>
              <span className={styles.lineInner} data-line-inner>Venez nous</span>
            </span>
            <span className={styles.lineWrap}>
              <span className={styles.lineInner} data-line-inner>rencontrer au bureau</span>
            </span>
          </h2>
          <p className={styles.copy}>
            Passez nous voir directement a l&apos;adresse suivante.
          </p>
          <p className={styles.address}>
            8 rue Sully, 69006 Lyon
          </p>
          <a
            className={styles.link}
            href="https://www.google.com/maps/search/?api=1&query=8+rue+Sully+69006+Lyon"
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
            title="Carte vers 8 rue Sully, 69006 Lyon"
            src="https://maps.google.com/maps?q=8%20rue%20Sully%2069006%20Lyon&z=15&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
