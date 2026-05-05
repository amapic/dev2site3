import HeroSection from "@/components/hero-section";
import SignatureAmauryPichat from "@/components/signature-amaury-pichat";
import YellowLines from "@/components/yellow-lines";
import SiteFooter from "@/components/site-footer";
import HeroPosterSection from "@/components/hero-poster-section";
import LocationMapSection from "@/components/location-map-section";
import PortfolioAccompagnementSections from "@/components/portfolio-accompagnement-sections";
import { HeroPreciseSection } from "@/app/hero-precise/page";

export default function Home() {
  return (
    <main className="w-full bg-[var(--page-background)] text-[var(--em-ink)]">
      <HeroSection />

      <HeroPreciseSection asSection />

      <PortfolioAccompagnementSections />

      {/* <section className="home-section px-0 py-0" aria-label="Section 4 hero poster sans bandes">
        <HeroPosterSection />
      </section> */}

      {/* <section className="home-section trend-bento-section px-6 py-14 sm:px-10 lg:px-14" aria-label="Section tendance bento editorial">
        <div className="mx-auto w-full max-w-7xl">
          <p className="trend-kicker">Tendance 01 - Bento editorial</p>
          <div className="trend-bento-grid">
            <article className="trend-bento-card trend-bento-card-main">
              <p className="trend-chip">Direction visuelle</p>
              <h2>Cartes asymetriques, hiarchie nette, impact immediat.</h2>
              <p>
                Les interfaces se structurent comme des blocs magazine: un hero
                fort, des modules satellites, beaucoup d&apos;air et des angles
                assumes.
              </p>
            </article>
            <article className="trend-bento-card">
              <p className="trend-chip">Micro detail</p>
              <p>
                Bords plus epais, badges stickers, ombres dures: un rendu plus
                physique, moins lisse.
              </p>
            </article>
            <article className="trend-bento-card">
              <p className="trend-chip">Usage</p>
              <p>
                Parfait pour landing startup, studio, SaaS premium et homepage
                de campagne.
              </p>
            </article>
          </div>
        </div>
      </section> */}

      {/* <section className="home-section trend-glass-section px-6 py-14 sm:px-10 lg:px-14" aria-label="Section tendance glass blur">
        <div className="mx-auto w-full max-w-7xl">
          <p className="trend-kicker trend-kicker-light">Tendance 02 - Glass layers</p>
          <div className="trend-glass-wrap">
            <div className="trend-glass-orb trend-glass-orb-a" aria-hidden="true" />
            <div className="trend-glass-orb trend-glass-orb-b" aria-hidden="true" />

            <article className="trend-glass-panel">
              <h2>Transparence, flou, profondeur: UI plus sensorielle.</h2>
              <p>
                Le glassmorphism revient avec plus de sobriete: des couches
                translucides, un contraste propre et un fond atmospherique qui
                garde la lisibilite.
              </p>
            </article>
          </div>
        </div>
      </section> */}

      {/* <section className="home-section trend-marquee-section px-0 py-0" aria-label="Section tendance typo marquee">
        <div className="trend-marquee-track" aria-hidden="true">
          <span>TYPOGRAPHIE FORTE</span>
          <span>SCROLL NARRATIF</span>
          <span>RHYTHME EDITORIAL</span>
          <span>TYPOGRAPHIE FORTE</span>
          <span>SCROLL NARRATIF</span>
          <span>RHYTHME EDITORIAL</span>
        </div>
        <div className="trend-marquee-content px-6 py-14 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-7xl">
            <p className="trend-kicker">Tendance 03 - Kinetic typography</p>
            <h2>
              Le texte devient matiere visuelle, pas juste un contenu a lire.
            </h2>
            <p>
              Gros corps, repetition, mouvement horizontal lent: ideal pour
              imposer un ton de marque des le premier scroll.
            </p>
          </div>
        </div>
      </section> */}

      {/* <section className="home-section signature-section px-6 py-14 sm:px-10 lg:px-14" aria-label="Signature animee Amaury PICHAT">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="space-y-4">
            <p className="trend-kicker">Signature SVG</p>
            <h2 className="signature-title">
              Une signature animee qui s&apos;ecrit toute seule.
            </h2>
            <p className="signature-copy">
              Version autonome, sans font externe imposee: le rendu reste leger,
              facile a reutiliser et suffisamment proche d&apos;une signature
              editoriale elegante.
            </p>
          </div>

          <div className="signature-panel">
            <SignatureAmauryPichat />
          </div>
        </div>
      </section> */}

      {/* <section className="home-section section-gradient px-6 py-14 sm:px-10 lg:px-14 relative overflow-hidden" aria-label="Section gradient avec lignes jaunes animees">
        <div className="mx-auto w-full max-w-7xl">
          <div className="space-y-6">
            <p className="trend-kicker">Effet Design 04 - Yellow Lines</p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Lignes jaunes tracées progressivement, effet de dessin animé.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-black/70">
              Un SVG avec gradients radiaux et clip-path animé crée un effet de révélation progressive, idéal pour guider l&apos;œil et créer du suspense visuel sur landing pages ou sections transitions.
            </p>
          </div>
        </div>
        <div className="relative mt-10 h-[28rem] w-full overflow-hidden sm:h-[34rem] lg:h-[40rem]">
          <YellowLines />
        </div>
      </section> */}

      <section className="home-section px-0 py-0" aria-label="Section contact et adresse">
        <LocationMapSection />
      </section>

      <SiteFooter />
    </main>
  );
}
