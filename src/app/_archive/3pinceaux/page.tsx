"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./page.module.css";
// Police importée via `page.module.css`

export default function NewGenesisTextDemoPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [useVideo, setUseVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  return (
    <main className={styles.page}>
      {/* <section
        id="newgenesis-demo-hero"
        className={`${styles.hero} `}
        aria-label="Demo d apparition de texte inspiree de NewGenesis"
      > */}
      {/* <div className="bg-[url('/atelier3pinceaux/image(2).webp')] bg-cover bg-center h-screen w-full flex  items-center justify-center">
          <h1 className={styles.heroTitle}>3 pinceaux</h1>
          <p className={styles.heroSubtitle}>
            Un projet de peinture collaborative en ligne
          </p>
        </div> */}
      <div className="relative h-screen w-full flex-row items-end justify-end">
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 bg-[url('/atelier3pinceaux/upscale.webp')] bg-cover bg-center transition-opacity duration-0 ${
              useVideo && videoReady ? "opacity-0" : "opacity-100"
            }`}
          />

          <video
            ref={videoRef}
            src="/atelier3pinceaux/a.mp4"
            muted
            loop
            preload="auto"
            playsInline
            poster="/atelier3pinceaux/upscale.webp"
            onCanPlayThrough={() => setVideoReady(true)}
            className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-0 ${
              useVideo && videoReady ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        </div>

        <div className="absolute top-4 right-4 z-10 text-left">
          <h1 className={styles.heroTitle}>3 pinceaux</h1>
          <p className={styles.heroSubtitle}>Un projet de peinture collaborative en ligne</p>
        </div>
        <div className="relative z-10 flex flex-col items-end justify-end h-full w-full p-8">
          <nav className={`${styles.navv} absolute top-[55%] right-0 p-4 mr-[7vw] w-[200px]`}>
            
            <ul className="flex-row  ">
              <li
                className={`text-right mb-[50px] text-4xl flex flex-row cursor-pointer`}
                onClick={(e) => {
                  e.preventDefault();
                  setUseVideo(true);
                  const v = videoRef.current;
                  if (v) {
                    const p = v.play();
                    if (p && typeof p.catch === "function") p.catch(() => {});
                  }
                }}
              >
                {/* <div className={styles.navItemBg} /> */}
                {/* <div className={styles.navItemContent}> */}
                  {/* <svg
                    className="w-10 h-10 inline-block align-middle mr-3 text-[#F6C445] pointer-events-none flex-shrink-0"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <rect
                      x="6"
                      y="6"
                      width="88"
                      height="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={8}
                      strokeLinejoin="round"
                    />
                  </svg> */}
                  <video
                   className="w-20 h-20  inline-block align-middle  mr-3 text-[#F6C445] pointer-events-none flex-shrink-0"
                   src="/atelier3pinceaux/outputcrop.mp4"
                   autoPlay
                   loop
                   muted
                  //  alt="Accueil"
                  />
                  <a
                    href="#newgenesis-demo-hero"
                    className="text-[#F6C445] pointer-events-none mt-6"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    Accueil
                  </a>
                {/* </div> */}
              </li>
              <li className={`text-right mb-[50px] text-4xl ${styles.navItem}`}>
                <div className={styles.navItemBg} />
                <div className={styles.navItemContent}>
                  <svg
                    className="w-10 h-10 inline-block align-middle mr-3 text-[#7EC8FF] pointer-events-none flex-shrink-0"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <rect
                      x="6"
                      y="6"
                      width="88"
                      height="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={8}
                      strokeLinejoin="round"
                    />
                  </svg>
                  <a href="#details" className="text-[#7EC8FF]">
                    Adulte
                  </a>
                </div>
              </li>
              <li className={`text-right mb-[50px] text-4xl ${styles.navItem}`}>
                <div className={styles.navItemBg} />
                <div className={styles.navItemContent}>
                  <svg
                    className="w-10 h-10 inline-block align-middle mr-3 text-[#1e3d57] pointer-events-none flex-shrink-0"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <rect
                      x="6"
                      y="6"
                      width="88"
                      height="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={8}
                      strokeLinejoin="round"
                    />
                  </svg>
                  <a href="#details" className="text-[#1e3d57]">
                    Enfant
                  </a>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <section
        id="details"
        className=" min-h-screen w-full  px-6 py-16 text-[#1f1a17] md:px-12 bg-[url('/atelier3pinceaux/image(33).webp')]"
        aria-label="Section contact atelier 3 pinceaux"
        // bg-[#f3ead8]
        // bg-[url('/atelier3pinceaux/image(2).webp')]
      >
        
        <div className="bg-[url('/atelier3pinceaux/1741976-texture-de-papier-propre-gratuit-photo.jpg')] bg-cover p-6  px-40 pb-52 relative z-1 mx-auto grid w-[80%] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <img
          src="/atelier3pinceaux/L_rouge.png"
          alt="Atelier de peinture avec des enfants et des adultes, dans un espace lumineux et convivial"
          className="z-0 absolute left-[-20px] top-[30px]  object-cover h-[90%] w-[100%)] pointer-events-none"
        />
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-[#7EC8FF]">Contact</p>
            <h2 className="text-5xl uppercase leading-none text-[#1e3d57] md:text-7xl">
              L&apos;atelier des 3 pinceaux a Lyon
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-[#3f352f] md:text-xl">
              Envie de reserver un atelier, de poser une question sur les cours adultes ou enfants,
              ou simplement de venir decouvrir le lieu ? L&apos;atelier des 3 pinceaux vous accueille
              au coeur de Lyon dans un espace pense pour la pratique, la curiosite et les projets en groupe.
            </p>
            <div className="space-y-4 text-lg leading-relaxed text-[#3f352f]">
              <p>
                <span className="font-semibold text-[#1e3d57]">Adresse :</span> 8 rue Sully, 69006 Lyon
              </p>
              <p>
                <span className="font-semibold text-[#1e3d57]">Acces :</span>{" "}Metro, velo ou voiture, l&apos;atelier est facile d&apos;acces pour vos seances en semaine comme le week-end.
              </p>
              <p>
                <span className="font-semibold text-[#1e3d57]">Horaires :</span>{" "}du lundi au vendredi, de 9h a 18h.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=8+rue+Sully+69006+Lyon"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-[#1e3d57] px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-[#152c40]"
              >
                Ouvrir dans Google Maps
              </a>
              <a
                href="mailto:amaurypichat@gmail.com"
                className="inline-flex items-center rounded-full border border-[#7EC8FF] px-6 py-3 text-sm uppercase tracking-[0.2em] text-[#7EC8FF] transition hover:bg-[#7EC8FF] hover:text-white"
              >
                Nous ecrire
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
            <iframe
              title="Carte vers l'atelier des 3 pinceaux, 8 rue Sully, 69006 Lyon"
              src="https://maps.google.com/maps?q=8%20rue%20Sully%2069006%20Lyon&z=15&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[460px] w-full border-0"
            />
          </div>
        </div>
      </section>
      {/* </section> */}
    </main>
  );
}
