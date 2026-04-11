"use client";

import { useState, useCallback } from "react";
import { Archivo_Black } from "next/font/google";
import PrismaticRibbonCanvas from "@/components/prismatic-ribbon-canvas";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});

export default function HeroSection() {
  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  return (
    <section
      className="home-section home-hero px-6 py-10 sm:px-10 lg:px-14 relative overflow-hidden"
      aria-label="Section hero avec elements graphiques"
    >
      {/* Loading overlay — visible until canvas first renders */}
      <div
        className={`hero-loading-screen${isReady ? " hero-loading-screen--hidden" : ""}`}
        aria-hidden="true"
      >
        <span className="hero-loading-dot" />
      </div>

      {/* Canvas background */}
      <div className="hero-prismatic-bg" aria-hidden="true">
        <PrismaticRibbonCanvas
          transparent
          className="hero-prismatic-bg__canvas"
          onReady={handleReady}
        />
      </div>

      {/* Hero content — revealed once canvas is ready */}
      <div
        className={`hero-grid mx-auto grid h-full w-full max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end hero-content-reveal${isReady ? " hero-content-reveal--visible" : ""}`}
      >
        <div className="flex flex-col justify-center gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-black/60">
            Direction creative digitale
          </p>

          <h1
            className={`box-logo w-fit ${archivoBlack.className}`}
            aria-label="Titre style skate inspire"
          >
            DEV2SITE3
          </h1>

          <p className="max-w-2xl text-lg leading-8 text-black/80 sm:text-xl">
            Une premiere section manifeste, puis une seconde section pleine
            hauteur avec une grille Isotope responsive pour filtrer les
            projets sans casser le rythme visuel.
          </p>
        </div>

        <div className="hero-panel flex h-full min-h-[18rem] flex-col justify-end rounded-[2rem] border border-black/20 p-6 sm:p-8 lg:min-h-[24rem]">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-black/60">
            Focus
          </p>
          <div className="space-y-3">
            <p className="text-3xl font-black uppercase leading-none tracking-[-0.05em] text-[var(--em-ink)] sm:text-4xl">
              Sections 100vh.
            </p>
            <p className="max-w-md text-base leading-7 text-black/80">
              Hero editorial en haut, portfolio filtrable en dessous, avec un
              rendu adapte du mobile au desktop.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
