"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type FilterValue = "*" | ".site-marchand" | ".portfolio" | ".site-institutionnel";

type IsotopeApi = {
  arrange: (options?: { filter?: string }) => void;
  layout: () => void;
  destroy: () => void;
};

type IsotopeConstructor = new (
  element: Element,
  options?: {
    itemSelector?: string;
    layoutMode?: string;
    percentPosition?: boolean;
  }
) => IsotopeApi;

type Project = {
  title: string;
  category: string;
  className: "Site Marchand" | "PortFolio" | "Site Institutionnel";
  tone: "sun" | "night" | "mint" | "sand" | "ice" | "ember";
  image: string;
  description: string;
  overlayDescription: string;
  details: string[];
};

type FloatingRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const OVERLAY_TRANSITION_MS = 560;
const CURSOR_PULL_MAX_PX = 0;
const CURSOR_PULL_LERP = 0.12;
const CURSOR_PULL_EPSILON = 0.08;

const filters: Array<{ label: string; value: FilterValue }> = [
  { label: "Tout", value: "*" },
  { label: "Site Marchand", value: ".site-marchand" },
  { label: "PortFolio", value: ".portfolio" },
  { label: "Site Institutionnel", value: ".site-institutionnel" },
];

const projects: Project[] = [
  {
    title: "Groupe Leonie",
    category: "Branding",
    className: "Site Institutionnel",
    tone: "sun",
    image: "/img_site/groupeleonie.webp",
    description: "Site corporate au ton doux, avec une direction visuelle claire et rassurante.",
    overlayDescription:
      "Un site corporate pense pour rassurer des interlocuteurs institutionnels et valoriser la dimension humaine de la marque. La lecture reste simple, avec un ton editorial sobre et des reperes visuels constants.",
    details: ["Architecture corporate claire", "Hero et sections de confiance", "Pages institutionnelles a finaliser"],
  },
  {
    title: "U-Consulting",
    category: "Digital",
    className: "Site Institutionnel",
    tone: "night",
    image: "/img_site/uconsulting.webp",
    description: "Experience web avec animation de particules reactive au parcours utilisateur.",
    overlayDescription:
      "Une presence digitale orientee performance, avec une animation de fond qui accompagne le parcours sans nuire a la lisibilite. L'ensemble privilegie un rendu premium, direct et credible.",
    details: ["Animation particules contextualisee", "Parcours services et expertises", "Blocs conversion a enrichir"],
  },
  {
    title: "Portfolio de designer UX UI",
    category: "Motion",
    className: "PortFolio",
    tone: "mint",
    image: "/img_site/giulia.webp",
    description: "Portfolio orienté produit et interface, avec une lecture claire des cas d'usage.",
    overlayDescription:
      "Un portfolio structure autour de cas concrets, du cadrage UX jusqu'aux interfaces finales. Chaque projet met en avant la methode, les decisions de design et l'impact produit.",
    details: ["Etudes de cas UI/UX", "Process design et decisions", "Resultats et livrables a preciser"],
  },
  {
    title: "Site Marchand Shopify",
    category: "Site Marchand",
    className: "Site Marchand",
    tone: "sand",
    image: "/img_site/stanleygrant.webp",
    description: "Direction graphique tech avec contraste marque et parti-pris contemporain.",
    overlayDescription:
      "Une boutique Shopify concue pour vendre rapidement, avec une identite marque nette et des parcours courts. L'objectif est de combiner desir produit, clarte des fiches et efficacite commerciale.",
    details: ["Parcours e-commerce optimise", "Fiches produits orientees conversion", "Tunnel d'achat et upsell a finaliser"],
  },
  {
    title: "Portfolio de photographe",
    category: "PortFolio",
    className: "PortFolio",
    tone: "ice",
    image: "/img_site/pierrebazin.jpg",
    description: "Portfolio de photographe minimaliste, centre sur l'essentiel avec une grille Isotope fluide.",
    overlayDescription:
      "Le site met l'image au premier plan: navigation epuree, rythme visuel stable et filtrage Isotope pour explorer les series sans distraction. L'interface reste volontairement sobre pour laisser respirer les photos.",
    details: ["Grille Isotope en plein focus", "Navigation visuelle sans surcharge", "Series et categories a enrichir"],
  },
  {
    title: "Site professionel",
    category: "Site Institutionnel",
    className: "Site Institutionnel",
    tone: "ember",
    image: "/img_site/mariedurand.jpg",
    description: "Conception d'un site vitrine clair, rapide et lisible pour presenter l'activite.",
    overlayDescription:
      "Un site vitrine corporate concu pour presenter une activite avec clarte, credibilite et rapidite d'acces a l'information. Le design privilegie la lisibilite sur desktop comme sur mobile.",
    details: ["Socle de pages essentielles", "Ton de marque et identite visuelle", "Messages cles et CTA a finaliser"],
  },
];

export default function IsotopeGallery() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isotopeRef = useRef<IsotopeApi | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hoverTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const detailRevealTimeoutRef = useRef<number | null>(null);
  const pullStateRef = useRef<
    Record<
      string,
      {
        currentX: number;
        currentY: number;
        targetX: number;
        targetY: number;
        rafId: number | null;
        card: HTMLDivElement | null;
      }
    >
  >({});
  const [activeFilter, setActiveFilter] = useState<FilterValue>("*");
  const [isotopeReady, setIsotopeReady] = useState(false);
  const [overlayProject, setOverlayProject] = useState<Project | null>(null);
  const [overlayRect, setOverlayRect] = useState<FloatingRect | null>(null);
  const [overlayExpanded, setOverlayExpanded] = useState(false);
  const [overlayDetailsVisible, setOverlayDetailsVisible] = useState(false);

  useEffect(() => {
    if (!isotopeReady || !gridRef.current) {
      return;
    }

    const IsotopeCtor = (window as Window & { Isotope?: IsotopeConstructor })
      .Isotope;

    if (!IsotopeCtor) {
      return;
    }

    const instance = new IsotopeCtor(gridRef.current, {
      itemSelector: ".isotope-card",
      layoutMode: "fitRows",
      percentPosition: true,
    });

    isotopeRef.current = instance;

    return () => {
      isotopeRef.current?.destroy();
      isotopeRef.current = null;
    };
  }, [isotopeReady]);

  useEffect(() => {
    isotopeRef.current?.arrange({ filter: activeFilter });
  }, [activeFilter]);

  useEffect(() => {
    const handleResize = () => {
      isotopeRef.current?.layout();

      if (overlayProject) {
        closeOverlay();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [overlayProject]);

  useEffect(() => {
    return () => {
      clearHoverTimer();
      clearCloseTimer();
      clearDetailRevealTimer();

      Object.values(pullStateRef.current).forEach((state) => {
        if (state.rafId !== null) {
          window.cancelAnimationFrame(state.rafId);
          state.rafId = null;
        }
      });
    };
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    projects.forEach((project) => {
      const wrapper = wrapperRefs.current[project.title];
      if (!wrapper) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("card-entered");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(wrapper);
      observers.push(observer);
    });
    return () => { observers.forEach((o) => o.disconnect()); };
  }, []);

  useEffect(() => {
    if (overlayProject) {
      closeOverlay(false);
    }
  }, [activeFilter]);

  function clearHoverTimer() {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }

  function clearCloseTimer() {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function clearDetailRevealTimer() {
    if (detailRevealTimeoutRef.current !== null) {
      window.clearTimeout(detailRevealTimeoutRef.current);
      detailRevealTimeoutRef.current = null;
    }
  }

  function getPullState(projectTitle: string, card: HTMLDivElement) {
    if (!pullStateRef.current[projectTitle]) {
      pullStateRef.current[projectTitle] = {
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        rafId: null,
        card,
      };
    }

    pullStateRef.current[projectTitle].card = card;
    return pullStateRef.current[projectTitle];
  }

  function setCardPullTarget(projectTitle: string, card: HTMLDivElement, targetX: number, targetY: number) {
    const state = getPullState(projectTitle, card);
    state.targetX = targetX;
    state.targetY = targetY;

    if (state.rafId !== null) {
      return;
    }

    const animate = () => {
      const s = pullStateRef.current[projectTitle];

      if (!s || !s.card) {
        return;
      }

      s.currentX += (s.targetX - s.currentX) * CURSOR_PULL_LERP;
      s.currentY += (s.targetY - s.currentY) * CURSOR_PULL_LERP;

      s.card.style.setProperty("--cursor-pull-x", `${s.currentX.toFixed(2)}px`);
      s.card.style.setProperty("--cursor-pull-y", `${s.currentY.toFixed(2)}px`);

      const doneX = Math.abs(s.targetX - s.currentX) < CURSOR_PULL_EPSILON;
      const doneY = Math.abs(s.targetY - s.currentY) < CURSOR_PULL_EPSILON;

      if (doneX && doneY) {
        s.currentX = s.targetX;
        s.currentY = s.targetY;
        s.card.style.setProperty("--cursor-pull-x", `${s.currentX.toFixed(2)}px`);
        s.card.style.setProperty("--cursor-pull-y", `${s.currentY.toFixed(2)}px`);
        s.rafId = null;
        return;
      }

      s.rafId = window.requestAnimationFrame(animate);
    };

    state.rafId = window.requestAnimationFrame(animate);
  }

  function getSourceRect(projectTitle: string): FloatingRect | null {
    const element = cardRefs.current[projectTitle];

    if (!element) {
      return null;
    }

    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }

  function getTargetRect(sourceRect: FloatingRect): FloatingRect {
    const margin = 32;
    const width = Math.min(sourceRect.width * 2, window.innerWidth - margin * 2, 920);
    const height = Math.min(sourceRect.height * 2, window.innerHeight - margin * 2, 860);

    return {
      width,
      height,
      left: Math.max(margin, (window.innerWidth - width) / 2),
      top: Math.max(24, (window.innerHeight - height) / 2),
    };
  }

  function scheduleExpand(project: Project) {
    if (overlayProject) {
      return;
    }

    openOverlay(project);
  }

  function openOverlay(project: Project) {
    clearHoverTimer();
    clearCloseTimer();
    clearDetailRevealTimer();

    const sourceRect = getSourceRect(project.title);

    if (!sourceRect) {
      return;
    }

    setOverlayProject(project);
    setOverlayRect(sourceRect);
    setOverlayExpanded(false);
    setOverlayDetailsVisible(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setOverlayRect(getTargetRect(sourceRect));
        setOverlayExpanded(true);
        detailRevealTimeoutRef.current = window.setTimeout(() => {
          setOverlayDetailsVisible(true);
          detailRevealTimeoutRef.current = null;
        }, OVERLAY_TRANSITION_MS);
      });
    });
  }

  function closeOverlay(animate = true) {
    if (!overlayProject) {
      return;
    }

    clearHoverTimer();
    clearCloseTimer();
    clearDetailRevealTimer();
    setOverlayDetailsVisible(false);

    if (!animate) {
      setOverlayExpanded(false);
      setOverlayProject(null);
      setOverlayRect(null);
      return;
    }

    const sourceRect = getSourceRect(overlayProject.title);

    if (sourceRect) {
      setOverlayRect(sourceRect);
    }

    setOverlayExpanded(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      setOverlayProject(null);
      setOverlayRect(null);
      closeTimeoutRef.current = null;
    }, OVERLAY_TRANSITION_MS);
  }

  function renderProjectCard(project: Project, options?: {
    expanded?: boolean;
    overlay?: boolean;
    interactive?: boolean;
    revealExtra?: boolean;
    onClose?: () => void;
    wrapperRef?: (el: HTMLDivElement | null) => void;
  }) {
    const expanded = options?.expanded ?? false;
    const overlay = options?.overlay ?? false;
    const interactive = options?.interactive ?? false;
    const revealExtra = options?.revealExtra ?? expanded;

    const card = (
      <div
        className={`project-card project-card-shell relative h-full overflow-hidden rounded-[2rem] border border-black/15 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.09)] transition-[padding,box-shadow] duration-500 ${
          expanded ? "project-card-shell-expanded sm:p-8" : ""
        } ${interactive ? "project-card-interactive" : ""}`}
        data-tone={project.tone}
        data-expanded={expanded ? "true" : "false"}
      >
        {overlay && options?.onClose ? (
          <button
            type="button"
            aria-label="Fermer la carte"
            onClick={options.onClose}
            className={`absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-black/12 bg-white/88 text-2xl leading-none text-black/80 shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-105 hover:bg-white ${
              expanded ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            ×
          </button>
        ) : null}

        <div className="project-card-core flex h-full flex-col">
          <div className={`project-card-media mb-5 overflow-hidden rounded-2xl border border-black/10 bg-white/70 ${expanded ? "h-[38vh] min-h-[18rem] project-card-media-expanded" : "h-40"}`}>
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className={`project-card-meta-row flex items-start justify-between gap-4 ${expanded ? "mb-4" : "mb-6"}`}>
            <span className="project-card-category" data-tone={project.tone}>
              <span className="project-card-category__label">{project.category}</span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55">
              {expanded ? "Apercu etendu" : "2026"}
            </span>
          </div>

          <div className="project-card-text-block space-y-4">
            <h3 className={`font-black uppercase leading-none tracking-[-0.05em] text-[var(--em-ink)] transition-[font-size] duration-500 ${expanded ? "text-4xl sm:text-5xl" : "text-3xl"}`}>
              {project.title}
            </h3>
            <p className={`leading-7 text-black/80 transition-[font-size] duration-500 ${expanded ? "max-w-2xl text-base sm:text-lg" : "text-sm sm:text-base"}`}>
              {project.description}
            </p>
          </div>

          {overlay ? (
            <div className={`project-card-extra ${revealExtra ? "project-card-extra-expanded" : ""}`}>
              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div className="space-y-4">
                  <p className="max-w-2xl text-sm leading-7 text-black/68 sm:text-base">
                    {project.overlayDescription}
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-black/10 bg-white/62 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-black/50">
                    Plus d'info
                  </p>
                  <ul className="space-y-3 text-sm leading-6 text-black/78 sm:text-base">
                    {project.details.map((detail) => (
                      <li key={detail} className="border-b border-black/8 pb-3 last:border-b-0 last:pb-0">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
    return overlay ? card : (
      <div ref={options?.wrapperRef} className="card-enter-wrapper h-full">{card}</div>
    );
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsotopeReady(true)}
      />

      <div className="isotope-gallery-shell mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" style={{ backgroundImage: "url('/fond jaune 2.png')", backgroundSize: "auto 100%", backgroundPosition: "center center", backgroundRepeat: "no-repeat" }}>
          <div className="max-w-2xl space-y-4 rounded-2xl p-6" >
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-black/60">
              Selection isotope
            </p>
            <h2 className="text-4xl font-black uppercase leading-none tracking-[-0.06em] text-[var(--em-ink)] sm:text-5xl lg:text-6xl">
              Une grille filtrable, rapide et responsive.
            </h2>
            <p className="max-w-xl text-base leading-7 text-black/75 sm:text-lg">
              Les cartes se reordonnent sans casser la lecture mobile. Les
              filtres restent tactiles, lisibles et stables sur petit comme
              grand ecran.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition ${
                    isActive
                      ? "border-[#c8960a] bg-[#ffc837] text-[#1a1200] shadow-[0_2px_12px_rgba(255,200,55,0.45)]"
                      : "border-black/20 bg-white/80 text-black/70 hover:border-[#ffc837] hover:bg-[#fff8e0]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="isotope-grain-band" aria-hidden="true" />
          <div ref={gridRef} className="isotope-grid pt-4">
          {projects.map((project) => {
            const isExpanded = overlayProject?.title === project.title;

            return (
              <article
                key={project.title}
                className={`isotope-card ${project.className} w-full px-2 pb-6 md:w-1/2 xl:w-1/3`}
              >
                <div
                  ref={(element) => {
                    cardRefs.current[project.title] = element;
                  }}
                  onClick={() => scheduleExpand(project)}
                  onMouseMove={(event) => {
                    if (isExpanded) {
                      return;
                    }

                    const currentTarget = event.currentTarget;
                    const card = currentTarget.querySelector(".project-card-interactive") as HTMLDivElement | null;

                    if (!card) {
                      return;
                    }

                    const rect = currentTarget.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const nx = (event.clientX - centerX) / Math.max(1, rect.width / 2);
                    const ny = (event.clientY - centerY) / Math.max(1, rect.height / 2);
                    const clampedX = Math.max(-1, Math.min(1, nx));
                    const clampedY = Math.max(-1, Math.min(1, ny));
                    const pullX = clampedX * CURSOR_PULL_MAX_PX;
                    const pullY = clampedY * CURSOR_PULL_MAX_PX;

                    setCardPullTarget(project.title, card, pullX, pullY);
                  }}
                  onMouseLeave={() => {
                    if (!isExpanded) {
                      clearHoverTimer();
                    }

                    const card = cardRefs.current[project.title]?.querySelector(".project-card-interactive") as HTMLDivElement | null;
                    if (card) {
                      setCardPullTarget(project.title, card, 0, 0);
                    }
                  }}
                  className={`card-enter-perspective group h-full cursor-pointer ${
                    isExpanded ? "invisible" : ""
                  }`}
                >
                  {renderProjectCard(project, {
                    interactive: true,
                    wrapperRef: (el) => { wrapperRefs.current[project.title] = el; },
                  })}
                </div>
              </article>
            );
          })}
          </div>
        </div>
      </div>

      {overlayProject && overlayRect ? (
        <>
          <div
            onClick={() => closeOverlay()}
            className={`fixed inset-0 z-40 bg-[rgba(250,251,252,0.2)] backdrop-blur-[1px] transition-opacity duration-500 ${
              overlayExpanded ? "pointer-events-auto cursor-pointer opacity-100" : "pointer-events-none opacity-0"
            }`}
          />

          <div className="pointer-events-none fixed inset-0 z-50">
            <article
              className="pointer-events-auto absolute"
              style={{
                top: overlayRect.top,
                left: overlayRect.left,
                width: overlayRect.width,
                height: overlayRect.height,
                transition: `top ${OVERLAY_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), left ${OVERLAY_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), width ${OVERLAY_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), height ${OVERLAY_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              {renderProjectCard(overlayProject, {
                expanded: overlayExpanded,
                overlay: true,
                revealExtra: overlayDetailsVisible,
                onClose: () => closeOverlay(),
              })}
            </article>
          </div>
        </>
      ) : null}
    </>
  );
}