"use client";

import type { MouseEventHandler, ReactNode } from "react";

type ScrollEasing = "linear" | "easeInOut" | "easeOutCubic";

type SmoothScrollLinkProps = {
  targetId: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  // If provided, this exact duration is used.
  durationMs?: number;
  // Applied to the final target position (negative value for sticky headers).
  offsetPx?: number;
  easing?: ScrollEasing;
  // Used when durationMs is not provided.
  durationPerPixelMs?: number;
  minDurationMs?: number;
  maxDurationMs?: number;
  // If true, wheel/touch/keys do not interrupt the animation.
  lockUserScrollDuringAnimation?: boolean;
  // If false, user inputs during animation are ignored and animation continues.
  cancelOnUserScroll?: boolean;
};

function getEasingFunction(easing: ScrollEasing): (t: number) => number {
  if (easing === "linear") {
    return (t) => t;
  }

  if (easing === "easeOutCubic") {
    return (t) => 1 - Math.pow(1 - t, 3);
  }

  return (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
}

export default function SmoothScrollLink({
  targetId,
  className,
  children,
  ariaLabel,
  durationMs,
  offsetPx = 0,
  easing = "easeInOut",
  durationPerPixelMs = 1.6,
  minDurationMs = 700,
  maxDurationMs = 14000,
  lockUserScrollDuringAnimation = false,
  cancelOnUserScroll = true,
}: SmoothScrollLinkProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();

    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetTop = target.getBoundingClientRect().top + window.scrollY + offsetPx;
    const startY = window.scrollY;
    const distance = targetTop - startY;
    const autoDuration = Math.abs(distance) * durationPerPixelMs;
    const finalDuration =
      durationMs ?? Math.min(maxDurationMs, Math.max(minDurationMs, Math.round(autoDuration)));

    if (prefersReducedMotion || finalDuration <= 0) {
      window.scrollTo({ top: targetTop, behavior: "auto" });
      return;
    }

    const easingFn = getEasingFunction(easing);
    const startTime = performance.now();
    let cancelled = false;

    const preventDefaultInput = (inputEvent: Event) => {
      inputEvent.preventDefault();
    };

    const cancelAnimation = () => {
      if (cancelOnUserScroll) {
        cancelled = true;
      }
    };

    const cleanup = () => {
      if (lockUserScrollDuringAnimation) {
        window.removeEventListener("wheel", preventDefaultInput);
        window.removeEventListener("touchmove", preventDefaultInput);
        window.removeEventListener("keydown", preventDefaultInput);
      } else {
        window.removeEventListener("wheel", cancelAnimation);
        window.removeEventListener("touchmove", cancelAnimation);
        window.removeEventListener("keydown", cancelAnimation);
      }
    };

    if (lockUserScrollDuringAnimation) {
      window.addEventListener("wheel", preventDefaultInput, { passive: false });
      window.addEventListener("touchmove", preventDefaultInput, { passive: false });
      window.addEventListener("keydown", preventDefaultInput);
    } else {
      window.addEventListener("wheel", cancelAnimation, { passive: true });
      window.addEventListener("touchmove", cancelAnimation, { passive: true });
      window.addEventListener("keydown", cancelAnimation);
    }

    const step = (now: number) => {
      if (cancelled) {
        cleanup();
        return;
      }

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / finalDuration, 1);
      const eased = easingFn(progress);
      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        cleanup();
      }
    };

    window.requestAnimationFrame(step);
  };

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}