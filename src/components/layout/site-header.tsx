"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import FlatLogo from "@/assets/logo-montesina-flat.svg";
import { cn } from "@/lib/utils";

export type HeaderVariant = "paper" | "navy-fade";

interface SiteHeaderProps {
  variant?: HeaderVariant;
  active?: "Pachangas" | "Comunidad";
}

const NAV: { href: string; label: SiteHeaderProps["active"] }[] = [
  { href: "/pachangas", label: "Pachangas" },
  // { href: "/reservas", label: "Pistas" }, // oculto: reservas se gestionan fuera de la app
  { href: "/comunidad", label: "Comunidad" },
];

export function SiteHeader({ variant = "paper", active }: SiteHeaderProps) {
  if (variant === "navy-fade") return <NavyFadeHeader active={active} />;
  return <PaperHeader active={active} />;
}

function PaperHeader({ active }: { active?: SiteHeaderProps["active"] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-dashed border-muted/60 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="container flex h-14 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-ink" aria-label="Inicio">
          <FlatLogo className="h-6 w-6 text-ink" aria-hidden />
          <span className="text-sm font-bold tracking-widest2">MONTESIÑA</span>
        </Link>
        <DesktopNav active={active} className="hidden md:flex" />
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/notificaciones"
            aria-label="Notificaciones"
            className="font-hand text-sm text-muted transition-colors hover:text-ink"
          >
            🔔
          </Link>
          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-full border-[1.5px] border-ink bg-lime px-3 text-xs font-bold text-ink shadow-neo-sm transition-transform hover:translate-x-px hover:translate-y-px hover:shadow-none"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavyFadeHeader({ active }: { active?: SiteHeaderProps["active"] }) {
  const { scrollY } = useScroll();
  const paperOpacity = useTransform(scrollY, [0, 320, 520], [0, 0, 1]);
  const linkInk = useTransform(scrollY, [0, 320, 520], [0, 0, 1]);
  const borderOpacity = useTransform(scrollY, [400, 600], [0, 1]);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <motion.div
        aria-hidden
        style={{ opacity: paperOpacity }}
        className="absolute inset-0 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80"
      />
      <motion.div
        aria-hidden
        style={{ opacity: borderOpacity }}
        className="absolute inset-x-0 bottom-0 border-b border-dashed border-muted/70"
      />
      <div className="container relative flex h-16 items-center gap-4">
        <Link
          href="/"
          aria-label="Inicio"
          className="flex items-center gap-2"
        >
          {/* Two stacked logo+text layers: lime over navy, ink over paper */}
          <span className="relative inline-flex h-6 w-6">
            <FlatLogo className="absolute inset-0 h-6 w-6 text-lime" aria-hidden />
            <motion.span
              style={{ opacity: linkInk }}
              className="absolute inset-0 flex"
              aria-hidden
            >
              <FlatLogo className="h-6 w-6 text-ink" />
            </motion.span>
          </span>
          <span className="relative text-sm font-bold tracking-widest2">
            <span className="text-lime">MONTESIÑA</span>
            <motion.span
              style={{ opacity: linkInk }}
              className="absolute inset-0 text-ink"
            >
              MONTESIÑA
            </motion.span>
          </span>
        </Link>

        <DesktopNav active={active} className="hidden md:flex" tone="navy-fade" linkInk={linkInk} />

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/notificaciones"
            aria-label="Notificaciones"
            className="font-hand text-sm text-lime transition-colors hover:text-foam"
          >
            🔔
          </Link>
          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-full border-[1.5px] border-lime px-3 text-xs font-bold text-lime transition-colors hover:bg-lime hover:text-navy"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}

interface DesktopNavProps {
  active?: SiteHeaderProps["active"];
  className?: string;
  tone?: "paper" | "navy-fade";
  linkInk?: MotionValue<number>;
}

function DesktopNav({ active, className, tone = "paper", linkInk }: DesktopNavProps) {
  return (
    <nav className={cn("items-center gap-6", className)}>
      {NAV.map((item) => {
        const isActive = active === item.label;
        if (tone === "navy-fade") {
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative text-sm font-medium",
                isActive ? "text-lime" : "text-foam-muted hover:text-lime",
              )}
            >
              <span>{item.label}</span>
              {linkInk ? (
                <motion.span
                  aria-hidden
                  style={{ opacity: linkInk }}
                  className={cn(
                    "absolute inset-0",
                    isActive ? "text-ink" : "text-ink-2",
                  )}
                >
                  {item.label}
                </motion.span>
              ) : null}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-lime"
                />
              )}
            </Link>
          );
        }
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "relative text-sm font-medium transition-colors",
              isActive ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {item.label}
            {isActive && (
              <span aria-hidden className="absolute -bottom-1 left-0 right-0 h-[2px] bg-lime" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
