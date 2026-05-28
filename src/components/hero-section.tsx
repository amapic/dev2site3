"use client";

import { useState, useCallback } from "react";
import { Archivo_Black } from "next/font/google";
import PrismaticRibbonCanvas from "@/components/prismatic-ribbon-canvas";
import HeroMarqueeScroll from "@/components/hero-marquee-scroll";

const NAV_ROWS: Array<{
  subtitle: string;
  baseBg: string;
  items: Array<{ label: string; hoverBg: string }>;
}> = [
  {
    subtitle: "Type de site",
    baseBg: "#c94357",
    items: [
      { label: "Vitrine", hoverBg: "#7d2f57" },
      { label: "E-commerce", hoverBg: "#e95f67" },
      { label: "Portfolio", hoverBg: "#e28b62" },
    ],
  },
  {
    subtitle: "Services délivrés",
    baseBg: "#2a5f86",
    items: [
      { label: "Design UI", hoverBg: "#2f7f97" },
      { label: "Développement", hoverBg: "#1b436d" },
      { label: "SEO & Perf.", hoverBg: "#46a9a2" },
    ],
  },
  {
    subtitle: "Notre approche de la conception de site",
    baseBg: "#3a2a59",
    items: [
      { label: "Stratégie", hoverBg: "#5f7fb0" },
      { label: "Itération", hoverBg: "#6e5ea8" },
      { label: "Livraison", hoverBg: "#2e5a88" },
    ],
  },
];

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});

export default function HeroSection() {
  const [isReady, setIsReady] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [cameraZoom, setCameraZoom] = useState(1);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleZoomChange = useCallback((zoomFactor: number) => {
    setCameraZoom((prev) => (Math.abs(prev - zoomFactor) < 0.01 ? prev : zoomFactor));
  }, []);

  return (
    <section
      className="h-[100vh] home-section home-hero px-6 py-10 sm:px-10 lg:px-14 relative overflow-hidden pb-16"
      aria-label="Section hero avec elements graphiques"
    >
      {/* Loading overlay — visible until canvas first renders */}
      {/* <div
        className={`hero-loading-screen${isReady ? " hero-loading-screen--hidden" : ""}`}
        aria-hidden="true"
      >
        <span className="hero-loading-dot" />
      </div> */}

      {/* Image background for mobile/tablet */}
      <div
        className="hero-section-img-bg absolute inset-0 h-full w-full bg-cover bg-center lg:hidden"
        style={{ backgroundImage: "url('/fond section 1.JPG')" }}
        aria-hidden="true"
      />

      {/* Canvas background (desktop only) */}
      <div className="hero-prismatic-bg hidden lg:block" aria-hidden="true">
        <PrismaticRibbonCanvas
          transparent
          className="hero-prismatic-bg__canvas"
          onReady={handleReady}
          onZoomChange={handleZoomChange}
          initialZoomFactor={1.2}
        />
      </div>

      {/* Hero content — revealed once canvas is ready */}
      <div
        className={`hero-grid mx-auto grid h-full w-full max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start hero-content-reveal${isReady ? " hero-content-reveal--visible" : ""}`}
      >
        <div className="flex flex-col justify-center gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-black/60">
            Direction creative digitale
          </p>

          <h1
            className={`box-logo box-logo--gradient w-fit ${archivoBlack.className}`}
            aria-label="Titre style skate inspire"
          >
            Dev2Site
          </h1>

          <p className="max-w-2xl text-lg leading-8 text-black/80 sm:text-xl">
            Dev2Site conçoit des sites web sur mesure, rapides, soignés et
            pensés pour mettre en valeur votre activité.
          </p>

        
        </div>

        {/* <div className="hero-panel flex h-full min-h-[18rem] flex-col justify-center gap-3 rounded-[1.35rem] border border-white/25 p-4 sm:p-5 lg:min-h-[24rem] lg:rounded-[1.6rem]">
          {NAV_ROWS.map((row) => (
            <div key={row.subtitle} className="flex flex-col gap-1">
              <p className="pl-1 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#2d4562]/65 sm:text-[13px]">
                {row.subtitle}
              </p>
              <div className="hero-menu-track flex items-stretch gap-[2px] overflow-hidden rounded-[0.72rem] p-[2px]">
                {row.items.map((item, i) => {
                  const key = `${row.subtitle}-${item.label}`;
                  const isHovered = hoveredKey === key;
                  const baseColor = isHovered ? item.hoverBg : row.baseBg;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onMouseEnter={() => setHoveredKey(key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      className="hero-menu-chip relative flex flex-1 items-center justify-center py-3 text-[1.06rem] font-semibold text-white transition-colors duration-200"
                      style={{
                        backgroundColor: baseColor,
                        backgroundImage:
                          "linear-gradient(162deg, rgba(255,255,255,0.14), rgba(0,0,0,0.12)), radial-gradient(circle at 22% 16%, rgba(255,255,255,0.2), transparent 44%)",
                        transform: "skewX(-10deg)",
                        marginLeft: i === 0 ? "-0.58rem" : undefined,
                        marginRight: i === row.items.length - 1 ? "-0.58rem" : undefined,
                      }}
                    >
                      <span style={{ transform: "skewX(10deg)", display: "inline-block", textShadow: "0 1px 0 rgba(0,0,0,0.18)" }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div> */}
      </div>
      
      <HeroMarqueeScroll />
    </section>
  );
}
