import HalftoneSphereCanvas from "@/components/halftone-sphere-canvas";

export default function HalftoneSpherePage() {
  return (
    <main className="halftone-page">
      <section className="halftone-stage" aria-label="Sphere halftone en perspective">
        <HalftoneSphereCanvas />
        <div className="halftone-overlay">
          <p>Three.js halftone sphere</p>
          <h1>Sphere en perspective composee de cercles reguliers.</h1>
        </div>
      </section>
    </main>
  );
}
