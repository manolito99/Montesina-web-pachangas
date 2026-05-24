"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FlatLogo from "@/assets/logo-montesina-flat.svg";
import { LogoReveal } from "@/components/layout/logo-reveal";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NeoLinkButton } from "@/components/ui/neo-button";
import { PachangaCard } from "@/components/ui/pachanga-card";

interface ApiPachanga {
  id: string;
  category: "M" | "F" | "X";
  date: string;
  duration: number;
  court: { name: string; type: string };
  maxPlayers: number;
  price: string;
  organizer: { name: string };
  _count: { participations: number };
}

function formatPachanga(p: ApiPachanga) {
  const d = new Date(p.date);
  const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const dayLabel = isToday ? "HOY" : isTomorrow ? "MAÑ" : days[d.getDay()];
  const time = d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  const filled = p._count.participations;

  return {
    id: p.id,
    cat: p.category,
    date: `${dayLabel} · ${time}`,
    time: `${time} · ${p.duration}min`,
    pista: `${p.court.name} · ${p.court.type.toLowerCase()}`,
    nivel: 3,
    filled,
    max: p.maxPlayers,
    organizer: p.organizer.name,
    price: `${parseFloat(p.price)}€`,
    accent: isToday && filled < p.maxPlayers,
  };
}

export default function Home() {
  const [pachangas, setPachangas] = useState<ReturnType<typeof formatPachanga>[]>([]);

  useEffect(() => {
    fetch("/api/pachangas")
      .then((r) => r.json())
      .then((data: ApiPachanga[]) => {
        const now = new Date();
        const upcoming = data
          .filter((p) => new Date(p.date) >= now)
          .slice(0, 3)
          .map(formatPachanga);
        setPachangas(upcoming);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <SiteHeader variant="navy-fade" />
      <main className="pb-12">
        <MobileHero />
        <DesktopHero />
        <FeaturedSection pachangas={pachangas} />
      </main>
      <SiteFooter />
      <div className="bg-paper-alt px-6 pb-6 text-center">
        <a href="https://pachangasmontesina.cc/politica-de-privacidad" className="text-xs text-muted underline hover:text-ink">
          Politica de Privacidad
        </a>
        {" · "}
        <a href="https://pachangasmontesina.cc/condiciones" className="text-xs text-muted underline hover:text-ink">
          Condiciones del Servicio
        </a>
      </div>
      <MobileTabs active="Inicio" />
    </>
  );
}

function MobileHero() {
  return (
    <section className="bg-navy px-6 pb-10 pt-20 text-foam md:hidden">
      <p className="font-hand text-xs uppercase tracking-widest2 text-lime">
        MONTESIÑA PADEL CLUB · SINCE &apos;94
      </p>

      <div className="my-10 flex justify-center">
        <FlatLogo
          className="h-44 w-44 text-lime drop-shadow-[0_0_36px_rgba(212,242,92,0.4)]"
          aria-hidden
        />
      </div>

      <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight">
        Juega. Apúntate.
        <br />
        <span className="text-lime">Compite.</span>
      </h1>
      <p className="mt-3 max-w-sm text-sm text-foam-muted">
        Pachangas de pádel del club, organizadas entre socios. Masculino,
        femenino y mixto.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <NeoLinkButton href="/pachangas" variant="primary" full>
          Apuntarme a una pachanga →
        </NeoLinkButton>
        <NeoLinkButton href="/pachangas/nueva" variant="outlineLime" full>
          Crear pachanga
        </NeoLinkButton>
      </div>
    </section>
  );
}

function DesktopHero() {
  return (
    <section className="relative hidden bg-navy-deep md:block">
      <div className="container relative z-10 pt-12 text-center">
        <p className="font-hand text-sm text-lime tracking-widest2">
          MONTESIÑA PADEL CLUB · SINCE &apos;94
        </p>
      </div>

      <LogoReveal
        mode="navy"
        tagline=""
        showScrollHint
        trackHeight="180vh"
      />

      <div className="container relative z-10 -mt-44 text-center">
        <h1 className="text-6xl font-extrabold leading-[1.05] tracking-tight text-foam">
          Juega. Apúntate. <span className="text-lime">Compite.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-balance text-foam-muted text-lg">
          Pachangas de pádel del club, organizadas entre socios. Masculino,
          femenino y mixto.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <NeoLinkButton href="/pachangas" variant="primary" size="lg">
            Apuntarme a una pachanga →
          </NeoLinkButton>
          <NeoLinkButton href="/pachangas/nueva" variant="outlineLime" size="lg">
            Crear pachanga
          </NeoLinkButton>
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({ pachangas }: { pachangas: ReturnType<typeof formatPachanga>[] }) {
  return (
    <section className="border-t-[1.5px] border-ink bg-paper-alt px-6 py-16">
      <div className="container">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-ink md:text-2xl">
            Próximas pachangas
          </h2>
          <Link
            href="/pachangas"
            className="font-hand text-sm text-ink-2 transition-colors hover:text-lime-deep"
          >
            ver todas →
          </Link>
        </div>

        {pachangas.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted">No hay pachangas programadas.</p>
            <Link href="/pachangas/nueva" className="mt-2 inline-block font-hand text-sm font-bold text-lime-deep">
              Crea la primera →
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {pachangas.map((p) => (
              <li key={p.id}>
                <PachangaCard
                  cat={p.cat}
                  date={p.date}
                  time={p.time}
                  pista={p.pista}
                  nivel={p.nivel}
                  filled={p.filled}
                  max={p.max}
                  organizer={p.organizer}
                  price={p.price}
                  accent={p.accent}
                  href={`/pachangas/${p.id}`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
