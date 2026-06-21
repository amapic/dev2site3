"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function NewGenesisTextDemoPage() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const bgPath = "/monet/arbre.jpg";
  const maskPath = "/monet/image%20(1).png";

  // ratio cache/bg : cache = bg * ratio
  const ratioX = 10.52 / 11.94; // x scale (cache relative to bg)
  const ratioY = 8.25 / 9.23; // y scale (cache relative to bg)

  const [overlayStyles, setOverlayStyles] = React.useState<React.CSSProperties>(
    {
      WebkitMaskImage: `url('${maskPath}')`,
      WebkitMaskSize: "contain",
      WebkitMaskPosition: "center",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskMode: "luminance",
      maskImage: `url('${maskPath}')`,
      maskSize: "contain",
      maskPosition: "center",
      maskRepeat: "no-repeat",
      maskMode: "luminance",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 2,
    },
  );

  const [sideLeftStyle, setSideLeftStyle] =
    React.useState<React.CSSProperties | null>(null);
  const [sideRightStyle, setSideRightStyle] =
    React.useState<React.CSSProperties | null>(null);

  // refs + state for video mask
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [videoMaskStyles, setVideoMaskStyles] =
    React.useState<React.CSSProperties | null>(null);
  const [videoOutlineStyle, setVideoOutlineStyle] =
    React.useState<React.CSSProperties | null>(null);

  // React.useEffect(() => {
  //   let mounted = true;

  //   const bgImg = new Image();
  //   bgImg.src = bgPath;

  //   function compute() {
  //     const container = containerRef.current;
  //     const cw = container?.clientWidth ?? window.innerWidth;
  //     const ch = container?.clientHeight ?? window.innerHeight;

  //     const bgW = bgImg.naturalWidth || 0;
  //     const bgH = bgImg.naturalHeight || 0;

  //     if (!bgW || !bgH) {
  //       // fallback: keep center/contain
  //       if (mounted) setOverlayStyles((s) => ({ ...s }));
  //       return;
  //     }

  //     const scale = Math.min(cw / bgW, ch / bgH);
  //     const renderedBgW = bgW * scale;
  //     const renderedBgH = bgH * scale;

  //     const maskW = renderedBgW * ratioX;
  //     const maskH = renderedBgH * ratioY;

  //     const posX = (cw - maskW) / 2;
  //     const posY = (ch - maskH) / 2;

  //     if (mounted) {
  //       setOverlayStyles((s) => ({
  //         ...s,
  //         WebkitMaskImage: `url('${maskPath}')`,
  //         WebkitMaskSize: `${Math.round(maskW)}px ${Math.round(maskH)}px`,
  //         WebkitMaskPosition: `${Math.round(posX)}px ${Math.round(posY)}px`,
  //         WebkitMaskRepeat: "no-repeat",
  //         WebkitMaskMode: "luminance",
  //         maskImage: `url('${maskPath}')`,
  //         maskSize: `${Math.round(maskW)}px ${Math.round(maskH)}px`,
  //         maskPosition: `${Math.round(posX)}px ${Math.round(posY)}px`,
  //         maskRepeat: "no-repeat",
  //         maskMode: "luminance",
  //       }));

  //       // compute side bands that fill left/right gaps (matching bg 'contain' rendering)
  //       const gapX = Math.max(0, Math.round((cw - renderedBgW) / 2));
  //       const gapYTop = Math.max(0, Math.round(posY));

  //       // sample image colors on a small canvas for pleasing pastels
  //       try {
  //         const sampleW = Math.min(240, bgW);
  //         const sampleH = Math.max(1, Math.round((sampleW * bgH) / bgW));
  //         const canvas = document.createElement("canvas");
  //         canvas.width = sampleW;
  //         canvas.height = sampleH;
  //         const ctx = canvas.getContext("2d");
  //         if (ctx) {
  //           ctx.drawImage(bgImg, 0, 0, sampleW, sampleH);
  //           const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;

  //           const sampleFraction = 0.12; // sample 12% from each side
  //           const sx = Math.max(1, Math.floor(sampleW * sampleFraction));

  //           let lR = 0,
  //             lG = 0,
  //             lB = 0,
  //             lCount = 0;
  //           let rR = 0,
  //             rG = 0,
  //             rB = 0,
  //             rCount = 0;

  //           for (let y = 0; y < sampleH; y++) {
  //             for (let x = 0; x < sx; x++) {
  //               const i = (y * sampleW + x) * 4;
  //               lR += imgData[i];
  //               lG += imgData[i + 1];
  //               lB += imgData[i + 2];
  //               lCount++;
  //             }
  //             for (let x = sampleW - sx; x < sampleW; x++) {
  //               const i = (y * sampleW + x) * 4;
  //               rR += imgData[i];
  //               rG += imgData[i + 1];
  //               rB += imgData[i + 2];
  //               rCount++;
  //             }
  //           }

  //           const avg = (v: number, c: number) => (c ? Math.round(v / c) : 200);
  //           const lAvgR = avg(lR, lCount),
  //             lAvgG = avg(lG, lCount),
  //             lAvgB = avg(lB, lCount);
  //           const rAvgR = avg(rR, rCount),
  //             rAvgG = avg(rG, rCount),
  //             rAvgB = avg(rB, rCount);

  //           const toPastel = (c: number, mix = 0.78) =>
  //             Math.round(c + (255 - c) * mix);
  //           const toPastel2 = (c: number, mix = 0.92) =>
  //             Math.round(c + (255 - c) * mix);

  //           const lP1 = toPastel(lAvgR),
  //             lP2 = toPastel(lAvgG),
  //             lP3 = toPastel(lAvgB);
  //           const lQ1 = toPastel2(lAvgR),
  //             lQ2 = toPastel2(lAvgG),
  //             lQ3 = toPastel2(lAvgB);

  //           const rP1 = toPastel(rAvgR),
  //             rP2 = toPastel(rAvgG),
  //             rP3 = toPastel(rAvgB);
  //           const rQ1 = toPastel2(rAvgR),
  //             rQ2 = toPastel2(rAvgG),
  //             rQ3 = toPastel2(rAvgB);

  //           const leftGrad = `linear-gradient(180deg, rgba(${lP1},${lP2},${lP3},0.98) 0%, rgba(${lQ1},${lQ2},${lQ3},0.98) 100%)`;
  //           const rightGrad = `linear-gradient(180deg, rgba(${rP1},${rP2},${rP3},0.98) 0%, rgba(${rQ1},${rQ2},${rQ3},0.98) 100%)`;

  //           setSideLeftStyle({
  //             position: "absolute",
  //             top: 0,
  //             left: 0,
  //             width: `${gapX}px`,
  //             height: "100%",
  //             backgroundImage: leftGrad,
  //             filter: "blur(28px)",
  //             transform: "scaleX(1.06)",
  //             zIndex: 1,
  //             pointerEvents: "none",
  //           });

  //           setSideRightStyle({
  //             position: "absolute",
  //             top: 0,
  //             right: 0,
  //             width: `${gapX}px`,
  //             height: "100%",
  //             backgroundImage: rightGrad,
  //             filter: "blur(28px)",
  //             transform: "scaleX(1.06)",
  //             zIndex: 1,
  //             pointerEvents: "none",
  //           });
  //         }
  //       } catch (e) {
  //         // ignore canvas errors, keep no side styles
  //       }
  //       // draw outline for the video mask area (for visual debug)
  //       // setVideoOutlineStyle({
  //       //   position: "absolute",
  //       //   left: `${Math.round(posX)}px`,
  //       //   top: `${Math.round(posY)}px`,
  //       //   width: `${Math.round(maskW)}px`,
  //       //   height: `${Math.round(maskH)}px`,
  //       //   border: "3px solid rgba(255,255,255,0.9)",
  //       //   boxSizing: "border-box",
  //       //   zIndex: 4,
  //       //   pointerEvents: "none",
  //       // });
  //     }
  //   }

  //   const onResize = () => compute();

  //   bgImg.onload = () => compute();
  //   window.addEventListener("resize", onResize);

  //   // also run immediately in case image cached
  //   if (bgImg.complete) compute();

  //   return () => {
  //     mounted = false;
  //     window.removeEventListener("resize", onResize);
  //   };
  // }, [bgPath, maskPath]);

  // draw video frames into a canvas and use its dataURL as mask-image
  // Improved: compute canvas size from the computed mask size (overlayStyles.maskSize),
  // enable image smoothing high quality and throttle updates to ~24fps to reduce pixelation.
  // React.useEffect(() => {
  //   const v = videoRef.current;
  //   const c = canvasRef.current;
  //   if (!v || !c) return;

  //   let intervalId: number | null = null;
  //   const ctx = c.getContext("2d");
  //   let lastObjectUrl: string | null = null;

  //   function parseMaskSize(maskSize: any) {
  //     if (!maskSize || typeof maskSize !== "string") return null;
  //     const parts = maskSize.split(/\s+/);
  //     if (!parts.length) return null;
  //     const w = parts[0].replace("px", "");
  //     const h = parts[1] ? parts[1].replace("px", "") : null;
  //     return { w: parseInt(w, 10) || null, h: h ? parseInt(h, 10) : null };
  //   }

  //   function updateCanvasSize() {
  //     const dpr = window.devicePixelRatio || 1;
  //     // try to use overlayStyles.maskSize (set by the compute() effect) when available
  //     const parsed = parseMaskSize((overlayStyles as any)?.maskSize);
  //     let targetW = 320;
  //     if (parsed && parsed.w) {
  //       // scale by devicePixelRatio for crispness on high-DPI screens
  //       targetW = Math.min(Math.max(Math.round(parsed.w * dpr), 160), 1280);
  //     } else if (v.videoWidth) {
  //       targetW = Math.min(Math.max(Math.round(v.videoWidth * dpr), 160), 1280);
  //     }
  //     const aspect =
  //       v.videoHeight && v.videoWidth ? v.videoHeight / v.videoWidth : 1;
  //     c.width = Math.max(2, Math.round(targetW));
  //     c.height = Math.max(2, Math.round(targetW * aspect));
  //     if (ctx) {
  //       ctx.imageSmoothingEnabled = true;
  //       try {
  //         ctx.imageSmoothingQuality = "high";
  //       } catch (e) {}
  //     }
  //   }

  //   function tick() {
  //     try {
  //       if (ctx && v.readyState >= 2) {
  //         updateCanvasSize();
  //         ctx.clearRect(0, 0, c.width, c.height);
  //         ctx.drawImage(v, 0, 0, c.width, c.height);
  //         // Prefer toBlob + object URL with JPEG to reduce per-frame payload size
  //         if (typeof c.toBlob === "function") {
  //           try {
  //             c.toBlob(
  //               (blob) => {
  //                 if (!blob) return;
  //                 const url = URL.createObjectURL(blob);
  //                 // set styles and revoke previous URL to avoid leaks
  //                 setVideoMaskStyles(() => {
  //                   try {
  //                     if (lastObjectUrl && lastObjectUrl !== url)
  //                       URL.revokeObjectURL(lastObjectUrl);
  //                   } catch (e) {}
  //                   lastObjectUrl = url;
  //                   return {
  //                     WebkitMaskImage: `url('${url}')`,
  //                     maskImage: `url('${url}')`,
  //                     WebkitMaskRepeat: "no-repeat",
  //                     maskRepeat: "no-repeat",
  //                     WebkitMaskMode: "luminance",
  //                     maskMode: "luminance",
  //                   };
  //                 });
  //               },
  //               "image/jpeg",
  //               0.7,
  //             );
  //           } catch (e) {
  //             // fallback to dataURL if toBlob fails
  //             const dataUrl = c.toDataURL("image/png");
  //             setVideoMaskStyles(() => ({
  //               WebkitMaskImage: `url('${dataUrl}')`,
  //               maskImage: `url('${dataUrl}')`,
  //               WebkitMaskRepeat: "no-repeat",
  //               maskRepeat: "no-repeat",
  //               WebkitMaskMode: "luminance",
  //               maskMode: "luminance",
  //             }));
  //           }
  //         } else {
  //           const dataUrl = c.toDataURL("image/png");
  //           setVideoMaskStyles(() => ({
  //             WebkitMaskImage: `url('${dataUrl}')`,
  //             maskImage: `url('${dataUrl}')`,
  //             WebkitMaskRepeat: "no-repeat",
  //             maskRepeat: "no-repeat",
  //             WebkitMaskMode: "luminance",
  //             maskMode: "luminance",
  //           }));
  //         }
  //       }
  //     } catch (e) {
  //       // drawing may fail if video is cross-origin without CORS headers
  //     }
  //   }

  //   const onLoaded = () => {
  //     updateCanvasSize();
  //   };

  //   v.addEventListener("loadedmetadata", onLoaded);
  //   v.play().catch(() => {});

  //   // throttle to ~24fps
  //   const fps = 16;
  //   intervalId = window.setInterval(tick, Math.round(1000 / fps));
  //   // run one immediately
  //   tick();

  //   return () => {
  //     if (intervalId) window.clearInterval(intervalId);
  //     v.removeEventListener("loadedmetadata", onLoaded);
  //     try {
  //       if (lastObjectUrl) {
  //         URL.revokeObjectURL(lastObjectUrl);
  //         lastObjectUrl = null;
  //       }
  //     } catch (e) {}
  //   };
  // }, [videoRef, canvasRef, overlayStyles]);

  return (
    <>
      {/* <div className="w-full h-screen overflow-hidden bg-[url('/monet/fond_monet.webp')] bg-cover bg-center bg-no-repeat"> */}
        {/* <div
          id="aaa"
          className="relative w-full h-screen flex items-center justify-center bg-[url('/monet/monet_yellowfield.jpg')] bg-contain bg-center bg-no-repeat"
        > */}
          {/* left/right pastel side fills */}
          {/* {sideLeftStyle && <div style={sideLeftStyle} />} */}
          {/* {sideRightStyle && <div style={sideRightStyle} />} */}

          {/* Overlay: same sizing/positioning as background (mask uses contain/center) */}
          {/* <div style={overlayStyles} className="overlay">
            <div className="slidingText text-[36vw] md:text-[16rem] leading-none font-extrabold uppercase text-white text-center">
              Avec 3 pinceaux, apprennez à peindre à votre rythme, et laissez
              libre cours à votre imagination.
            </div>
          </div>
        </div>
      </div> */}
      {/* <div
        id="aaa"
        className="relative w-full h-screen flex items-center justify-center bg-[url('/monet/monet_yellowfield.jpg')] bg-contain bg-center bg-no-repeat"
      > */}
        {/* left/right pastel side fills */}
        {/* {sideLeftStyle && <div style={sideLeftStyle} />} */}
        {/* {sideRightStyle && <div style={sideRightStyle} />} */}

        {/* Overlay: same sizing/positioning as background (mask uses contain/center) */}
        {/* <div style={overlayStyles} className="overlay">
          <div className="slidingText text-[36vw] md:text-[16rem] leading-none font-extrabold uppercase text-white text-center">
            Avec 3 pinceaux, apprennez à peindre à votre rythme, et laissez
            libre cours à votre imagination.
          </div>
        </div>
      </div> */}
      <div className="w-full h-screen overflow-hidden bg-[url('/monet/fond_monet.webp')] bg-cover bg-center bg-no-repeat">
        <div
          id="testvideo"
          className="relative w-full h-screen flex items-center justify-center bg-[url('/monet/nympheas.jpg')] bg-cover bg-center bg-no-repeat"
        >
          {/* hidden video and canvas used to generate mask frames */}
          <video
            ref={videoRef}
            src="/monet/output561_cut.webm"
            muted
            // loop
            playsInline
            autoPlay
            style={{ display: "none" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* left/right pastel side fills (optional) */}
          {/* {sideLeftStyle && <div style={sideLeftStyle} />} */}
          {/* {sideRightStyle && <div style={sideRightStyle} />} */}

          {/* Overlay: merge static overlayStyles with videoMaskStyles (if present) */}
          <div
            style={{ ...(overlayStyles as any), ...(videoMaskStyles || {}) }}
            className="overlay w-full"
          >
            <div className="slidingText text-[36vw] md:text-[16rem] leading-none font-extrabold uppercase text-white text-center">
              Test vidéogedgjhdggggggggdghdghdhd
              <br /> fgdfhdh
            </div>
          </div>
          {/* {videoOutlineStyle && <div style={videoOutlineStyle} />} */}
        </div>
      </div>
      {/* <div className="w-full h-screen overflow-hidden relative bg-[url('/monet/nympheas.jpg')] bg-cover bg-center bg-no-repeat">
        

        <div className="slidingText text-blue-600/100 text-[36vw] md:text-[16rem] leading-none font-extrabold uppercase text-center">
          Test vidéo
          <br /> fgdfhdh
          <video
            className="absolute top-0 left-0 w-full h-full object-cover"
            ref={videoRef}
            src="/monet/output561.webm"
            muted
            loop
            playsInline
            autoPlay
          />
        </div>

      </div> */}
    </>
  );
}
