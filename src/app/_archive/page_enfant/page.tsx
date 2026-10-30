"use client";
// 265222461
import React, { useRef, useEffect } from "react";
// import styles from "./page.module.css";

import { gsap } from "gsap";
import * as THREE from "three";

export default function NewGenesisTextDemoPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    gsap.set(v, { x: 0, willChange: "transform" });

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(v, { x: 600, duration: 2 })
      .to(v, { x: -200, duration: 2, delay: 0.4 });

    tl.eventCallback("onComplete", () => {
      // swap source then play and add a small pulse animation
      try {
        v.src = "/atelier3pinceaux/a.mp4";
        v.load();
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } catch (e) {
        // ignore
      }
      gsap.fromTo(v, { scale: 1 }, { scale: 1.06, duration: 0.6, yoyo: true, repeat: 1 });
    });

    return () => {
      tl.kill();
      gsap.set(v, { x: 0 });
    };
  }, []);

  return (
    <>
      <style>{`
        @font-face {
          font-family: "OblikClassic W01 Black";
          src: url("/atelier3pinceaux/93b8101a0142bd5f6500ac6005ec06c1.woff2") format("woff2");
          font-display: swap;
        }
      `}</style>
      <div className="relative h-screen w-screen flex-row items-end justify-end bg-[url('/atelier3pinceaux/vg.jpg')] bg-contain bg-center bg-no-repeat">

        <video
          ref={videoRef}
          src="/atelier3pinceaux/a.mp4"
          className="absolute bottom-8 left-8 w-40 h-40 object-cover rounded-md shadow-lg"
          autoPlay
          muted
          loop
          playsInline
        />
        <div
          className="relative z-10 p-6 text-6xl text-white"
          style={{ fontFamily: '"OblikClassic W01 Black", sans-serif' }}
        >
          AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        </div>
      </div>
    </>
  );
}
