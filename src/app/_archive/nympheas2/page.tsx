"use client";

import React from "react";

export default function NympheasPage() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const slidingTextRef = React.useRef<HTMLDivElement | null>(null);
  const lastObjectUrlRef = React.useRef<string | null>(null);
  const frameLoadingRef = React.useRef(false);

  // overlay base styles (no image mask)
  const overlayBaseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 2,
  };

  // draw video frames to a hidden canvas and create a blob/url to use
  // as the background texture for the text (animated "video inside text").
 

  return (
    <>
      {/* <div className="w-full h-screen overflow-hidden"> */}
        
      <div id="touchepas" className="w-screen h-screen overflow-hidden bg-red-500 ">
        <div className="relative w-screen h-screen text-white bg-green-500 text-[36vw] md:text-[16rem] leading-none font-extrabold uppercase text-cente">
          <br></br>
          <br></br>
          cocuocuc
          <video
            //   ref={videoRef}
            src="/monet/outputcutfondu_cut_vers_white.webm"
            muted
            loop
            playsInline
            autoPlay
            className="w-full h-screen object-cover"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              opacity: 1,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </>
  );
}
