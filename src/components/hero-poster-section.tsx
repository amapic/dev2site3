import styles from "@/app/accompagnement-poster/page.module.css";

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
    subtitle: "Services delivres",
    baseBg: "#2a5f86",
    items: [
      { label: "Design UI", hoverBg: "#2f7f97" },
      { label: "Developpement", hoverBg: "#1b436d" },
      { label: "SEO & Perf.", hoverBg: "#46a9a2" },
    ],
  },
  {
    subtitle: "Notre approche de la conception de site",
    baseBg: "#3a2a59",
    items: [
      { label: "Strategie", hoverBg: "#5f7fb0" },
      { label: "Iteration", hoverBg: "#6e5ea8" },
      { label: "Livraison", hoverBg: "#2e5a88" },
    ],
  },
];

const ISOTOPE_FILTERS = ["Tout", "Site Marchand", "PortFolio", "Site Institutionnel"];

export default function HeroPosterSection() {
  return (
    <div className={styles.page}>
      <section className={styles.stage} aria-label="Section hero en poster editorial">
        <div className="isotope-gallery-shell mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 sm:px-10 lg:px-14">
          <div
            className="bg-fond-jaune-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl space-y-4 rounded-2xl p-6">
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
              {ISOTOPE_FILTERS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition ${
                    index === 0
                      ? "border-[#c8960a] bg-[#ffc837] text-[#1a1200] shadow-[0_2px_12px_rgba(255,200,55,0.45)]"
                      : "border-black/20 bg-white/80 text-black/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <article className={styles.poster}>
          <div
            className={styles.imageLayer}
            style={{
              backgroundImage:
                'url("/two-smart-multiethnic-business-people-working-together-laptop-talking-job-news-office-shot-211677023-pastel-polygon.jpg")',
              left: "-1rem",
              top: "52%",
              width: "min(60vw, 56rem)",
              opacity: 0.94,
            }}
            aria-hidden="true"
          />

          <div className={styles.cornerMark} aria-hidden="true">
            <span className={styles.cornerMarkSymbol}>✦</span>
            <span className={styles.cornerMarkLabel}>Hero</span>
          </div>

          <span className={styles.ghostWord} style={{ top: "17%", left: "29%" }} aria-hidden="true">
            DEV2SITE3
          </span>

          <div className={styles.posterGrid}>
            <div className={styles.cutoutZone}>
              <div className={styles.cutoutAura} aria-hidden="true" />
              <div className={styles.sticker}>Direction creative</div>
            </div>

            <div className={styles.copyBlock}>
              <div className={styles.copyMeta}>
                <p className={styles.kicker}>Section 04 • hero editorial</p>
              </div>

              <div className={styles.titleMotion}>
                <h2 className={styles.title}>DEV2SITE3</h2>
              </div>

              <div className={styles.copyMeta}>
                <p className={styles.lead}>
                  Une premiere section manifeste, puis une seconde section pleine
                  hauteur avec une grille Isotope responsive pour filtrer les
                  projets sans casser le rythme visuel.
                </p>
              </div>

              <p className="w-fit rounded-full border border-black/15 bg-white/72 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/65">
                Avant la partie isotope
              </p>

              <div className="mt-3 grid gap-4">
                {NAV_ROWS.map((row) => (
                  <div key={row.subtitle} className="flex flex-col gap-1">
                    <p className="pl-1 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#2d4562]/65 sm:text-[13px]">
                      {row.subtitle}
                    </p>
                    <div className="flex items-stretch gap-[2px] overflow-hidden rounded-[0.72rem] p-[2px]">
                      {row.items.map((item, index) => (
                        <div
                          key={item.label}
                          className="relative flex flex-1 items-center justify-center py-3 text-[1.06rem] font-semibold text-white"
                          style={{
                            backgroundColor: row.baseBg,
                            backgroundImage:
                              "linear-gradient(162deg, rgba(255,255,255,0.14), rgba(0,0,0,0.12)), radial-gradient(circle at 22% 16%, rgba(255,255,255,0.2), transparent 44%)",
                            transform: "skewX(-10deg)",
                            marginLeft: index === 0 ? "-0.58rem" : undefined,
                            marginRight: index === row.items.length - 1 ? "-0.58rem" : undefined,
                          }}
                        >
                          <span style={{ transform: "skewX(10deg)", display: "inline-block", textShadow: "0 1px 0 rgba(0,0,0,0.18)" }}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}