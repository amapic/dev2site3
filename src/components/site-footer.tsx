import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Pied de page principal">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <section className="site-footer__identity" aria-label="Identite">
            <p className="site-footer__brand">Dev<span className="site-footer__brand-2">2</span>Site</p>
            <p className="site-footer__copy">
              Dev2Site conçoit des sites web sur mesure, rapides, soignés et
              pensés pour mettre en valeur votre activité.
            </p>

            <a className="site-footer__pill" href="mailto:amo@dev2site.net">
              amo@dev2site.net
            </a>
            <a className="site-footer__pill site-footer__pill--small" href="tel:+33688918019">
              +33 (0)6 88 91 80 19
            </a>

          </section>

          <section className="site-footer__coords" aria-label="Coordonnees">
            <h3>Coordonnees</h3>
            <p>
              8 rue Sully
              <br />
              69006 Lyon
              <br />
              France
            </p>
            <p>
              Du lundi au vendredi
              <br />
              De 9h00 a 18h00
            </p>
          </section>

          <section className="site-footer__social-panel" aria-label="Reseaux sociaux">
            <h3>Reseaux</h3>
            <div className="site-footer__social site-footer__social--large">
              <a href="https://www.linkedin.com/company/107937126" target="_blank" rel="noreferrer">
                <img
                  src="/logo/LinkedIn_icon.svg"
                  alt="LinkedIn"
                  className="site-footer__social-logo site-footer__social-logo--linkedin"
                />
              </a>
              <a href="https://www.instagram.com/dev2site" target="_blank" rel="noreferrer">
                <img
                  src="/logo/insta.png"
                  alt="Instagram"
                  className="site-footer__social-logo site-footer__social-logo--instagram"
                />
              </a>
            </div>
          </section>
        </div>

        <div className="site-footer__meta">
          <Link href="/mentions-legales">Mentions legales</Link>
          <Link href="/confidentialite">Politique de confidentialite</Link>
        </div>

        <div className="site-footer__line" aria-hidden="true" />
      </div>

      <a className="site-footer__backtop" href="#top" aria-label="Retour en haut">
        ↑
      </a>
    </footer>
  );
}
