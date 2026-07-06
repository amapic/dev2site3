"use client";

import { createPortal } from "react-dom";
import type { FormEvent } from "react";
import { useEffect, useState, useCallback } from "react";
import { Archivo_Black } from "next/font/google";
import PrismaticRibbonCanvas from "@/components/prismatic-ribbon-canvas";
import HeroMarqueeScroll from "@/components/hero-marquee-scroll";

const HUD_TAGS = ["SEO technique", "Lighthouse", "Instagram", "Chatbot IA", "Tracking"];

const DELIVERY_STEPS = [
  { label: "Cadrage", value: "J+02", detail: "audit, architecture, objectifs" },
  { label: "Design", value: "J+05", detail: "maquettes et prototypes" },
  { label: "Build", value: "J+12", detail: "Next.js, CMS, automatisations" },
  { label: "Launch", value: "J+14", detail: "SEO, analytics, QA final" },
];

const BAR_METRICS = [
  { label: "SEO interne", value: 92, detail: "structure, maillage, balises" },
  { label: "SEO externe", value: 81, detail: "backlinks, mentions, autorité" },
  { label: "Instagram", value: 76, detail: "contenu, rétention, portée" },
  { label: "Tracking", value: 89, detail: "mesure, conversions, pilotage" },
];

const BOT_METRICS = [
  { label: "Chatbot IA", value: 96, detail: "réponses instantanées et qualification" },
  { label: "Automatisation", value: 88, detail: "relances, formulaires, CRM" },
  { label: "Support client", value: 84, detail: "FAQ, prise de contact, tri des demandes" },
];

const KPI_STRIP = [
  { value: "2 semaines", label: "temps moyen de mise en ligne" },
  { value: "+31%", label: "trafic SEO cible sur 90 jours" },
  { value: "98%", label: "score lighthouse" },
  { value: "4.9/5", label: "clarté perçue des interfaces" },
];

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});

export default function HeroSection() {
  const [isReady, setIsReady] = useState(false);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [contactMessage, setContactMessage] = useState("");

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleZoomChange = useCallback((zoomFactor: number) => {
    setCameraZoom((prev) => (Math.abs(prev - zoomFactor) < 0.01 ? prev : zoomFactor));
  }, []);

  const handleContactSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const subject = encodeURIComponent("Contact Dev2Site");
      const body = encodeURIComponent(contactMessage.trim() || "Bonjour, je souhaite échanger sur mon projet.");

      window.location.href = `mailto:amo@dev2site.net?subject=${subject}&body=${body}`;
    },
    [contactMessage],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isContactModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsContactModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isContactModalOpen]);

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
        className={`hero-grid hero-dashboard-shell mx-auto grid h-full w-full max-w-7xl gap-8 hero-content-reveal${isReady ? " hero-content-reveal--visible" : ""}`}
      >
        <div className="hero-dashboard-intro">
          <div className="hero-dashboard-intro-inner flex flex-col gap-5">
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

            {/* <div className="hero-tech-tags" aria-label="Expertises mises en avant">
              {HUD_TAGS.map((tag) => (
                <span key={tag} className="hero-tech-tag">
                  {tag}
                </span>
              ))}
            </div> */}
          </div>

          <div className="hero-contact-zone" aria-label="Contact rapide">
            <button
              type="button"
              className="hero-contact-circle-link"
              aria-label="Ouvrir le contact Dev2Site"
              onClick={() => setIsContactModalOpen(true)}
            >
              <div className="hero-badge-circle" aria-hidden="false">
                <svg viewBox="0 0 240 240" className="hero-badge-svg" role="img" focusable="false">
                  <defs>
                    <linearGradient id="heroLogoGradient" gradientTransform="rotate(135)">
                      <stop offset="0%" stopColor="var(--logo-yellow)" />
                      <stop offset="42%" stopColor="var(--logo-blue)" />
                      <stop offset="78%" stopColor="var(--logo-cyan)" />
                      <stop offset="100%" stopColor="#a6f7ff" />
                    </linearGradient>
                    <linearGradient id="heroLogoGradientSoft" gradientTransform="rotate(30)">
                      <stop offset="0%" stopColor="rgba(255, 200, 55, 0.26)" />
                      <stop offset="55%" stopColor="rgba(0, 61, 130, 0.24)" />
                      <stop offset="100%" stopColor="rgba(0, 212, 212, 0.3)" />
                    </linearGradient>
                    <path id="heroCirclePath" d="M120,120 m-88,0 a88,88 0 1,0 176,0 a88,88 0 1,0 -176,0" />
                  </defs>
                  <circle cx="120" cy="120" r="104" className="hero-badge-glow" fill="url(#heroLogoGradientSoft)" />
                  <circle cx="120" cy="120" r="94" className="hero-badge-orbit hero-badge-orbit--one" />
                  <circle cx="120" cy="120" r="88" className="hero-badge-ring" stroke="url(#heroLogoGradient)" strokeWidth="1" />
                  <text className="hero-badge-text" aria-hidden="true">
                    <textPath href="#heroCirclePath" startOffset="0">
                      {"CONTACT · EMAIL · TÉL · ".repeat(4)}
                    </textPath>
                  </text>
                  <circle cx="120" cy="120" r="44" className="hero-badge-center" />
                  <circle cx="120" cy="120" r="58" className="hero-badge-orbit hero-badge-orbit--two" />
                  <text x="120" y="126" className="hero-badge-center-label" textAnchor="middle" fill="url(#heroLogoGradient)">
                    Contact
                  </text>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div className="hero-tech-hud" aria-label="Tableau de bord des prestations du studio">
          <article className="hero-hud-card hero-hud-card--timeline">
            <div className="hero-hud-card__header hero-hud-card__header--full">
              <div className="hero-hud-card__titlezone">
                <p className="hero-hud-card__eyebrow">Prestation 1</p>
                <strong>2 semaines</strong>
                <span className="hero-hud-card__subtitle">temps moyen de mise en ligne</span>
              </div>
              <p className="hero-hud-card__title">Temps de réalisation</p>
            </div>

            <div className="hero-hud-timeline">
              {DELIVERY_STEPS.map((step) => (
                <div key={step.label} className="hero-hud-timeline__step">
                  <span className="hero-hud-timeline__value">{step.value}</span>
                  <div>
                    <p className="hero-hud-timeline__label">{step.label}</p>
                    <p className="hero-hud-timeline__detail">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="hero-hud-card hero-hud-card--bars">
            <div className="hero-hud-card__header hero-hud-card__header--stacked">
              <div className="hero-hud-card__titlezone">
                <p className="hero-hud-card__eyebrow">Prestation 2</p>
                <strong>SEO</strong>
                <span className="hero-hud-card__subtitle">interne, externe, Instagram, contenu, tracking</span>
              </div>
              <p className="hero-hud-card__title">SEO & visibilité</p>
            </div>

            <div className="hero-hud-bars" role="img" aria-label="Graphique des leviers SEO interne, SEO externe, Instagram et tracking">
              {BAR_METRICS.map((metric) => (
                <div key={metric.label} className="hero-hud-bar">
                  <div className="hero-hud-bar__meta">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                  <div className="hero-hud-bar__track">
                    <span className="hero-hud-bar__fill" style={{ width: `${metric.value}%` }} />
                  </div>
                  <p className="hero-hud-bar__detail">{metric.detail}</p>
                </div>
              ))}
            </div>

            <div className="hero-hud-signal">
              <span className="hero-hud-signal__dot" />
              <span>SEO multi-canaux en pilotage continu</span>
            </div>
          </article>

          <article className="hero-hud-card hero-hud-card--pies">
            <div className="hero-hud-card__header hero-hud-card__header--stacked">
              <div className="hero-hud-card__titlezone">
                <p className="hero-hud-card__eyebrow">Prestation 3</p>
                <strong>Bots</strong>
                <span className="hero-hud-card__subtitle">création, qualification, automatisation et support</span>
              </div>
              <p className="hero-hud-card__title">Création de bots</p>
            </div>

            <div className="hero-hud-bot-list">
              {BOT_METRICS.map((metric) => (
                <div key={metric.label} className="hero-hud-bot-item">
                  <div className="hero-hud-bot-item__meta">
                    <span>{metric.label}</span>
                    <strong>{metric.value}%</strong>
                  </div>
                  <div className="hero-hud-bot-item__track">
                    <span className="hero-hud-bot-item__fill" style={{ width: `${metric.value}%` }} />
                  </div>
                  <p className="hero-hud-bot-item__detail">{metric.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="hero-hud-card hero-hud-card--strip">
            {KPI_STRIP.map((metric) => (
              <div key={metric.label} className="hero-hud-kpi">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </article>
        </div>
      </div>

      {isMounted && isContactModalOpen
        ? createPortal(
            <div className="hero-contact-modal" role="dialog" aria-modal="true" aria-labelledby="heroContactModalTitle">
              <button
                type="button"
                className="hero-contact-modal__backdrop"
                aria-label="Fermer le contact"
                onClick={() => setIsContactModalOpen(false)}
              />

              <div className="hero-contact-modal__panel">
                <div className="hero-contact-modal__header">
                  <p className="hero-contact-modal__kicker">Contact rapide</p>
                  <button type="button" className="hero-contact-modal__close" onClick={() => setIsContactModalOpen(false)}>
                    Fermer
                  </button>
                </div>

                <h2 id="heroContactModalTitle" className="hero-contact-modal__title">
                  Parlons de votre prochain site
                </h2>

                <p className="hero-contact-modal__copy">
                  Réponse directe par mail ou téléphone pour cadrer le projet, le délai et le niveau de finition attendu.
                </p>

                <form className="hero-contact-modal__form" onSubmit={handleContactSubmit}>
                  <label className="hero-contact-modal__label" htmlFor="heroContactMessage">
                    Votre message
                  </label>
                  <textarea
                    id="heroContactMessage"
                    className="hero-contact-modal__textarea"
                    value={contactMessage}
                    onChange={(event) => setContactMessage(event.target.value)}
                    placeholder="Expliquez votre besoin, votre délai ou le type de site souhaité..."
                    rows={5}
                  />

                  <div className="hero-contact-modal__actions">
                    <button type="submit" className="hero-contact-modal__submit">
                      Envoyer
                    </button>
                    <a className="hero-contact-modal__link" href="tel:+33688918019">
                      <span>Téléphone</span>
                      <strong>06 88 91 80 19</strong>
                    </a>
                  </div>

                  <a className="hero-contact-modal__mail-link" href="mailto:amo@dev2site.net">
                    <span>Mail direct</span>
                    <strong>amo@dev2site.net</strong>
                  </a>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
      
      <HeroMarqueeScroll />
    </section>
  );
}
