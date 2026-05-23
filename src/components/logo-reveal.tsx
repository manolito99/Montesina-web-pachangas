"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import StagLogo from "@/assets/logo-montesina.svg";
import { cn } from "@/lib/utils";

export type LogoRevealMode = "navy" | "paper";

interface LogoRevealProps {
  mode?: LogoRevealMode;
  /**
   * Tagline displayed after the logo composes. Pass falsy to hide.
   */
  tagline?: string;
  /**
   * Show the "↓ scroll" hint near the bottom of the sticky frame.
   */
  showScrollHint?: boolean;
  className?: string;
  /**
   * Total scroll-track height as a CSS length. The bigger, the slower the
   * reveal. Default 260vh.
   */
  trackHeight?: string;
}

/**
 * Scroll-linked logo composition.
 *
 * The full SVG is rendered three times, each layer clipped to a different
 * region of the stag — the antlers (top), the left half of the head, and the
 * right half. As the user scrolls through the sticky section each layer is
 * revealed in sequence, and the composed logo gains opacity, scale and lime
 * glow as a whole.
 *
 * `mode='navy'` paints the section as a navy radial gradient (variant C);
 * `mode='paper'` keeps the surrounding paper background (variant A).
 */
export function LogoReveal({
  mode = "navy",
  tagline = "Montesiña · Padel",
  showScrollHint = true,
  className,
  trackHeight = "260vh",
}: LogoRevealProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const p = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.35,
  });

  const opacity = useTransform(p, [0, 0.25, 0.7], [0, 1, 1]);
  const scale = useTransform(p, [0, 0.55], [0.82, 1]);
  const blurPx = useTransform(p, [0, 0.4], [8, 0]);
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);
  const glow = useTransform(
    p,
    [0, 0.5, 1],
    [
      "drop-shadow(0 0 0 rgba(212,242,92,0))",
      mode === "navy"
        ? "drop-shadow(0 0 24px rgba(212,242,92,0.55))"
        : "drop-shadow(0 0 18px rgba(159,201,60,0.45))",
      mode === "navy"
        ? "drop-shadow(0 0 48px rgba(212,242,92,0.7))"
        : "drop-shadow(0 0 32px rgba(159,201,60,0.55))",
    ],
  );

  const antlersY = useTransform(p, [0, 0.35], [-32, 0]);
  const antlersOpacity = useTransform(p, [0, 0.18, 0.4], [0, 1, 1]);
  const leftX = useTransform(p, [0.15, 0.5], [-36, 0]);
  const leftOpacity = useTransform(p, [0.15, 0.45], [0, 1]);
  const rightX = useTransform(p, [0.25, 0.6], [36, 0]);
  const rightOpacity = useTransform(p, [0.25, 0.55], [0, 1]);

  const heroOpacity = useTransform(p, [0.7, 0.95], [1, 0]);
  const haloOpacity = useTransform(p, [0, 0.6], [0, 1]);
  const taglineOpacity = useTransform(p, [0.45, 0.7], [0, 1]);
  const taglineY = useTransform(p, [0.45, 0.7], [16, 0]);

  const isNavy = mode === "navy";

  if (prefersReducedMotion) {
    return (
      <section
        ref={sectionRef}
        aria-label="Identidad de marca"
        className={cn(
          "relative flex min-h-[60vh] items-center justify-center px-6 py-24",
          isNavy && "bg-radial-navy text-foam",
          className,
        )}
      >
        <div className="flex flex-col items-center text-center">
          <StagLogo className="h-[320px] w-auto drop-shadow-[0_0_36px_rgba(212,242,92,0.5)]" />
          {tagline && (
            <p
              className={cn(
                "mt-6 max-w-md text-balance",
                isNavy ? "text-foam-muted" : "text-ink-2",
              )}
            >
              {tagline}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Reveal del logo Montesiña"
      className={cn("relative", isNavy && "bg-navy-deep", className)}
      style={{ height: trackHeight }}
    >
      <div
        className={cn(
          "sticky top-0 flex h-screen items-center justify-center overflow-hidden",
          isNavy ? "bg-radial-navy text-foam" : "bg-paper",
        )}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: haloOpacity,
            background: isNavy
              ? "radial-gradient(40% 40% at 50% 45%, rgba(212,242,92,0.18) 0%, rgba(15,26,46,0) 70%)"
              : "radial-gradient(40% 40% at 50% 45%, rgba(159,201,60,0.14) 0%, rgba(245,242,234,0) 70%)",
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative flex flex-col items-center"
        >
          <motion.div
            style={{ opacity, scale, filter }}
            className="relative h-[clamp(260px,55vh,520px)] aspect-[1138/1447]"
          >
            <motion.div style={{ filter: glow }} className="absolute inset-0">
              <LogoLayer
                clipPath="inset(0 0 58% 0)"
                style={{ y: antlersY, opacity: antlersOpacity }}
              />
              <LogoLayer
                clipPath="polygon(0% 42%, 50% 42%, 50% 100%, 0% 100%)"
                style={{ x: leftX, opacity: leftOpacity }}
              />
              <LogoLayer
                clipPath="polygon(50% 42%, 100% 42%, 100% 100%, 50% 100%)"
                style={{ x: rightX, opacity: rightOpacity }}
              />
            </motion.div>
          </motion.div>

          {tagline && (
            <motion.p
              style={{ opacity: taglineOpacity, y: taglineY }}
              className={cn(
                "mt-8 text-balance text-center text-sm uppercase tracking-[0.32em]",
                isNavy ? "text-foam-muted" : "text-muted",
              )}
            >
              {tagline}
            </motion.p>
          )}
        </motion.div>

        {showScrollHint && <ScrollHint progress={p} mode={mode} />}
      </div>
    </section>
  );
}

function LogoLayer({
  clipPath,
  style,
}: {
  clipPath: string;
  style: { x?: MotionValue<number>; y?: MotionValue<number>; opacity: MotionValue<number> };
}) {
  return (
    <motion.div
      aria-hidden
      style={{ ...style, clipPath, WebkitClipPath: clipPath }}
      className="absolute inset-0"
    >
      <StagLogo className="h-full w-full" />
    </motion.div>
  );
}

function ScrollHint({
  progress,
  mode,
}: {
  progress: MotionValue<number>;
  mode: LogoRevealMode;
}) {
  const opacity = useTransform(progress, [0, 0.15, 0.3], [1, 1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className={cn(
        "absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-hand text-xs",
        mode === "navy" ? "text-lime" : "text-muted",
      )}
    >
      <span>↓ scroll</span>
      <span
        className={cn(
          "block h-8 w-px",
          mode === "navy"
            ? "bg-gradient-to-b from-lime to-transparent"
            : "bg-gradient-to-b from-muted to-transparent",
        )}
      />
    </motion.div>
  );
}
