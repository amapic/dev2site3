"use client";

import { useState } from "react";
import { Archivo_Black } from "next/font/google";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});

export default function TitleBlotDemo() {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <section className="title-blot-demo" aria-label="Demo effet tache de buvard">
      <div className="title-blot-demo__content">
        <p className="title-blot-demo__kicker">Demo animation</p>

        <h1
          key={replayKey}
          className={`box-logo title-blot-reveal title-blot-reveal-demo ${archivoBlack.className}`}
        >
          DEV2SITE3
        </h1>

        <p className="title-blot-demo__copy">
          Animation tache de buvard sur le titre uniquement. Le rendu final reste identique.
        </p>

        <button
          type="button"
          className="title-blot-demo__button"
          onClick={() => setReplayKey((value) => value + 1)}
        >
          Rejouer l&apos;animation
        </button>
      </div>
    </section>
  );
}
