import AccompagnementPosterSection from "@/components/accompagnement-poster-section";
import IsotopeGallery from "@/components/isotope-gallery";

export default function PortfolioAccompagnementSections() {
  return (
    <>
      <section
        id="portfolio"
        className="home-section portfolio-section-bg min-h-[120vh] px-0 py-12 sm:px-10 lg:px-14"
        aria-label="Section portfolio"
      >
        <IsotopeGallery />
      </section>

      <section
        className="relative isolate z-30 -mt-px overflow-visible px-0 py-0"
        aria-label="Section accompagnement poster"
      >
        <AccompagnementPosterSection />
      </section>
    </>
  );
}
