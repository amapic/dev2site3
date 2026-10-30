"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Archivo_Black } from "next/font/google";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});

export default function BurnTitleAnimation() {
  const [isAnimating, setIsAnimating] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const title = titleRef.current;

    if (!canvas || !video || !title) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup canvas
    canvas.width = 1920;
    canvas.height = 200;

    let animationId = 0;
    const startTime = Date.now();

    const animate = () => {
      if (!isAnimating) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = (Date.now() - startTime) / 1000;
      const videoDuration = video.duration || 3;
      const progress = (elapsed % videoDuration) / videoDuration;

      // Seek video
      video.currentTime = progress * videoDuration;

      // Draw video to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get canvas as data URL and apply as mask
      const maskUrl = canvas.toDataURL("image/png");
      title.style.maskImage = `url("${maskUrl}")`;
      title.style.setProperty("-webkit-mask-image", `url("${maskUrl}")`);

      animationId = requestAnimationFrame(animate);
    };

    const handleLoadedMetadata = () => {
      animate();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      cancelAnimationFrame(animationId);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [isAnimating]);

  const handleReplay = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
  }, []);

  return (
    <div className="burn-title-container">
      <video
        ref={videoRef}
        src="/videoplayback.mp4"
        crossOrigin="anonymous"
        preload="metadata"
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div
        ref={titleRef}
        className={`burn-title ${archivoBlack.className}`}
      >
        DEV2SITE3
      </div>

      <button onClick={handleReplay} className="burn-replay-btn">
        Rejouer animation
      </button>
    </div>
  );
}
