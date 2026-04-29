type FooterLink = {
  label: string;
  href: string;
};

type FooterGroup = {
  title: string;
  links: FooterLink[];
};

const footerGroups: FooterGroup[] = [
  {
    title: "Navigation",
    links: [
      { label: "Lien 01", href: "#" },
      { label: "Lien 02", href: "#" },
      { label: "Lien 03", href: "#" },
      { label: "Lien 04", href: "#" },
      { label: "Lien 05", href: "#" },
      { label: "Lien 06", href: "#" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Service 01", href: "#" },
      { label: "Service 02", href: "#" },
      { label: "Service 03", href: "#" },
    ],
  },
  {
    title: "Expertise",
    links: [{ label: "Expertise 01", href: "#" }],
  },
];

const partnerMarks = ["ANG", "ADM", "WN", "CJD", "CII"];

export default function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Pied de page principal">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <section className="site-footer__identity" aria-label="Identite">
            <p className="site-footer__brand">Dev2Site</p>

            <a className="site-footer__pill" href="#">
              amo@dev2site.fr
            </a>
            <a className="site-footer__pill site-footer__pill--small" href="#">
              +33 (0)6 88 91 80 19
            </a>

            <div className="site-footer__social" aria-label="Reseaux sociaux">
              <a href="#" aria-label="LinkedIn">LI</a>
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="X">X</a>
              <a href="#" aria-label="GitHub">GH</a>
            </div>
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

          {footerGroups.map((group) => (
            <nav key={group.title} className="site-footer__links" aria-label={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="site-footer__meta">
          <a href="/mentions-legales">Mentions legales</a>
          <a href="/confidentialite">Politique de confidentialite</a>
        </div>

        <div className="site-footer__line" aria-hidden="true" />

        <div className="site-footer__partners" aria-label="Partenaires">
          {partnerMarks.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </div>
      </div>

      <a className="site-footer__backtop" href="#top" aria-label="Retour en haut">
        ↑
      </a>
    </footer>
  );
}
