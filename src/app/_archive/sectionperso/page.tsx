"use client";

import Image from "next/image";

/**
 * Section "à propos / photo" — même esprit visuel que le reste du site
 * (fond sombre, eyebrow en petites majuscules, typographie condensée).
 *
 * À personnaliser :
 * - Utilise une image déjà présente dans `/public`
 * - Adapte les 3 chiffres (statItems) avec tes vraies infos
 * - Adapte le texte à ta voix
 */

const statItems = [
  { value: "5 ans", label: "à concevoir des sites pour de vrais clients" },
  { value: "100%", label: "des projets suivis par moi, du premier échange à la mise en ligne" },
  { value: "< 24h", label: "délai de réponse à un message" },
];

export default function SectionAuteur() {
  return (
    <section className="auteur">
      <div className="auteur__inner">
        <p className="auteur__eyebrow">Direction creative digitale</p>

        <div className="auteur__grid">
          <div className="auteur__photo-wrap">
            <div className="auteur__photo-frame">
              <Image
                src="/image22.png"
                alt="Portrait de l'auteur de Dev2Site"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="auteur__photo"
                priority
                unoptimized
              />
            </div>
            <span className="auteur__badge">Pas un side project</span>
          </div>

          <div className="auteur__content">
            <h2 className="auteur__title">
              Derrière chaque site,
              <br />
              il y a quelqu&apos;un.
            </h2>

            <p className="auteur__text">
              Pas d&apos;agence anonyme, pas de sous-traitance à l&apos;autre bout du monde.
              Je conçois, je développe et je suis chaque projet personnellement,
              du premier échange jusqu&apos;à la mise en ligne — et après.
            </p>

            <p className="auteur__text auteur__text--muted">
              Montrer mon visage ici, ce n&apos;est pas un détail : c&apos;est un
              engagement. Vous savez à qui vous parlez, et vous savez que ce projet
              compte autant pour moi que pour vous.
            </p>

            <ul className="auteur__stats">
              {statItems.map((item) => (
                <li key={item.label} className="auteur__stat">
                  <span className="auteur__stat-value">{item.value}</span>
                  <span className="auteur__stat-label">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auteur {
          background: #0b0b0c;
          color: #f5f4f1;
          padding: 96px 24px;
        }

        .auteur__inner {
          max-width: 1080px;
          margin: 0 auto;
        }

        .auteur__eyebrow {
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8b8b87;
          margin: 0 0 40px;
          font-weight: 600;
        }

        .auteur__grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 64px;
          align-items: start;
        }

        .auteur__photo-wrap {
          position: relative;
        }

        .auteur__photo-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(245, 244, 241, 0.12);
          filter: grayscale(15%) contrast(1.05);
        }

        .auteur__photo {
          object-fit: cover;
        }

        .auteur__badge {
          position: absolute;
          left: 16px;
          bottom: -16px;
          background: #f5f4f1;
          color: #0b0b0c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 8px 14px;
          border-radius: 2px;
        }

        .auteur__title {
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.15;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 24px;
        }

        .auteur__text {
          font-size: 16px;
          line-height: 1.65;
          color: #d8d7d2;
          margin: 0 0 20px;
          max-width: 52ch;
        }

        .auteur__text--muted {
          color: #a3a29d;
        }

        .auteur__stats {
          list-style: none;
          display: flex;
          gap: 32px;
          padding: 32px 0 0;
          margin: 24px 0 0;
          border-top: 1px solid rgba(245, 244, 241, 0.12);
          flex-wrap: wrap;
        }

        .auteur__stat {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 180px;
        }

        .auteur__stat-value {
          font-size: 22px;
          font-weight: 700;
        }

        .auteur__stat-label {
          font-size: 13px;
          color: #8b8b87;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .auteur {
            padding: 64px 20px;
          }
          .auteur__grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .auteur__photo-frame {
            max-width: 280px;
            margin: 0 auto;
          }
          .auteur__stats {
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}