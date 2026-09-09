"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TriangleConstellationCanvas, {
  type TriangleConstellationCanvasHandle,
} from "./triangle-constellation-canvas";

gsap.registerPlugin(ScrollTrigger);

const PHASES = [
  {
    number: "01",
    title: "Attirer de nouveaux clients",
    description: "Votre site devient un aimant : SEO, contenus et parcours pensés pour capter une audience qualifiée.",
    position: "left",
  },
  {
    number: "02",
    title: "Mesurer chaque retour",
    description: "Analytics, conversions, comportements : nous installons les bons indicateurs pour piloter votre croissance.",
    position: "bottom",
  },
  {
    number: "03",
    title: "Accompagner sur le long terme",
    description: "Évolutions, optimisations, conseils : votre site reste vivant et performant bien après sa mise en ligne.",
    position: "right",
  },
];

export default function TriangleConstellationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<TriangleConstellationCanvasHandle>(null);
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;

    // Respect des préférences de réduction de mouvement
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      canvasRef.current?.setProgress(1);
      phaseRefs.current.forEach((phase) => {
        if (phase) gsap.set(phase, { opacity: 1, y: 0 });
      });
      if (progressRef.current) {
        progressRef.current.style.transform = "scaleX(1)";
      }
      return;
    }

    const ctx = gsap.context(() => {
      // Pin du bloc sticky sur toute la hauteur de la section
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: sticky,
        pinSpacing: false,
        scrub: 1,
        onUpdate: (self) => {
          canvasRef.current?.setProgress(self.progress);

          // Barre de progression visuelle
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });

      // Animation des 3 phases textuelles
      phaseRefs.current.forEach((phase, index) => {
        if (!phase) return;

        const startProgress = 0.26 + index * 0.22;
        const endProgress = startProgress + 0.18;

        gsap.set(phase, { opacity: 0, y: 24 });

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const visibleT = gsap.utils.clamp(0, 1, (p - startProgress) / (endProgress - startProgress));
            const eased = gsap.parseEase("power2.out")(visibleT);
            gsap.set(phase, {
              opacity: eased,
              y: 24 * (1 - eased),
            });
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="triangle-constellation-section"
      aria-label="Section avantages avec animation de constellation triangulaire"
    >
      <div ref={stickyRef} className="triangle-constellation-sticky">
        <TriangleConstellationCanvas ref={canvasRef} />

        <div className="triangle-constellation-overlay">
          <div className="triangle-constellation-header">
            <p className="triangle-constellation-kicker">Pourquoi travailler avec Dev2Site ?</p>
            <h2 className="triangle-constellation-title">Trois piliers, un seul objectif</h2>
          </div>

          <div className="triangle-constellation-phases">
            {PHASES.map((phase, index) => (
              <div
                key={phase.number}
                ref={(el) => { phaseRefs.current[index] = el; }}
                className={`triangle-constellation-phase triangle-constellation-phase--${phase.position}`}
              >
                <span className="triangle-constellation-phase__number">{phase.number}</span>
                <h3 className="triangle-constellation-phase__title">{phase.title}</h3>
                <p className="triangle-constellation-phase__description">{phase.description}</p>
              </div>
            ))}
          </div>

          <div ref={progressRef} className="triangle-constellation-progress" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
