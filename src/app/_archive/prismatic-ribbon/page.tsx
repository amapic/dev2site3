import PrismaticRibbonCanvas from "@/components/prismatic-ribbon-canvas";

export default function PrismaticRibbonPage() {
  return (
    <main className="w-full h-screen" aria-label="Composition triangulaire abstraite">
      <PrismaticRibbonCanvas transparent className="w-full h-full" />
    </main>
  );
}
