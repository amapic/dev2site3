"use client";

import { useEffect } from "react";

export default function Section2FontDebug() {
  useEffect(() => {
    const base = document.querySelector(".section2-title-base") as HTMLElement | null;
    const overlay = document.querySelector(".section2-title-overlay") as HTMLElement | null;

    if (!base || !overlay) {
      console.log("[section2-font-debug] elements not found");
      return;
    }

    const baseStyle = window.getComputedStyle(base);
    const overlayStyle = window.getComputedStyle(overlay);

    console.log("[section2-font-debug] base font-family:", baseStyle.fontFamily);
    console.log("[section2-font-debug] overlay font-family:", overlayStyle.fontFamily);
    console.log("[section2-font-debug] base color:", baseStyle.color);
    console.log("[section2-font-debug] overlay color:", overlayStyle.color);
    console.log("[section2-font-debug] overlay transform:", overlayStyle.transform);
  }, []);

  return null;
}
