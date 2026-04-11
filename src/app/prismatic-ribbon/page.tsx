import PrismaticRibbonCanvas from "@/components/prismatic-ribbon-canvas";

export default function PrismaticRibbonPage() {
  return (
    <main className="prismatic-page" aria-label="Composition triangulaire abstraite">
      <section className="prismatic-stage">
        <PrismaticRibbonCanvas />
      </section>
    </main>
  );
}
