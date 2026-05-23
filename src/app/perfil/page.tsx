"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabs } from "@/components/mobile-tabs";
import { Avatar } from "@/components/ui/avatar";
import { LevelBalls } from "@/components/ui/level-balls";
import { PachangaCard } from "@/components/ui/pachanga-card";
import { PageTabs } from "@/components/ui/page-tabs";
import { StatBox } from "@/components/ui/stat-box";
import { NeoLinkButton } from "@/components/ui/neo-button";
import { CURRENT_USER, PACHANGAS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const DESKTOP_TABS = [
  { label: "Próximas", count: 3 },
  { label: "Creadas", count: 8 },
  { label: "Historial" },
  { label: "Estadísticas" },
];

const MOBILE_TABS = [
  { label: "Próx.", count: 3 },
  { label: "Creadas", count: 8 },
  { label: "Hist." },
];

const upcomingPachangas = [
  { ...PACHANGAS[0], organizer: "Tú" },
  PACHANGAS[1],
  PACHANGAS[2],
];

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState(0);
  const user = CURRENT_USER;

  return (
    <>
      <SiteHeader variant="paper" />

      {/* ── Mobile header ── */}
      <section className="relative bg-navy px-4 pb-6 pt-8 text-center md:hidden">
        <button
          type="button"
          className="absolute right-4 top-4 font-hand text-lg text-lime"
          aria-label="Ajustes"
        >
          ⚙
        </button>

        <div className="flex justify-center">
          <Avatar label={user.initial} size={64} lime />
        </div>
        <h1 className="mt-3 text-lg font-extrabold text-foam">
          {user.name}
        </h1>
        <p className="mt-0.5 text-xs text-foam/70">
          socio desde {user.memberSince}
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span className="text-xs font-medium text-foam/80">Nivel</span>
          <LevelBalls value={user.level} size={9} />
        </div>
      </section>

      {/* ── Mobile stat row ── */}
      <div className="grid grid-cols-3 border-b border-dashed border-muted/70 bg-paper md:hidden">
        {[
          { value: user.stats.played, label: "jugados" },
          { value: user.stats.created, label: "creadas" },
          { value: user.stats.attendance, label: "asist." },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center border-r border-dashed border-muted/70 py-3 last:border-r-0"
          >
            <span className="text-lg font-extrabold text-ink">{s.value}</span>
            <span className="text-[10px] font-medium uppercase tracking-widest2 text-muted">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Desktop header ── */}
      <section className="hidden border-b border-dashed border-muted/70 bg-paper md:block">
        <div className="container py-8">
          <div className="flex items-start gap-6">
            <Avatar label={user.initial} size={86} lime />

            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-ink">
                {user.name}
              </h1>
              <p className="mt-0.5 text-sm text-ink-2">{user.email}</p>
              <p className="mt-0.5 text-xs text-muted">
                socio desde {user.memberSince}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
                  Nivel <LevelBalls value={user.level} size={10} />
                </span>
                <span className="text-xs text-ink-2">
                  {user.gender === "H" ? "Hombre" : "Mujer"}
                </span>
                <span className="font-hand text-sm text-lime-deep">
                  {user.stats.played} partidos jugados
                </span>
              </div>
            </div>

            <NeoLinkButton href="/perfil/editar" variant="ghost" size="sm">
              Editar perfil
            </NeoLinkButton>
          </div>
        </div>
      </section>

      <main className="min-h-screen">
        {/* ── Tabs ── */}
        <div className="md:hidden">
          <PageTabs tabs={MOBILE_TABS} active={activeTab} onChange={setActiveTab} />
        </div>
        <div className="hidden md:block">
          <div className="container">
            <PageTabs tabs={DESKTOP_TABS} active={activeTab} onChange={setActiveTab} />
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="bg-paper-alt p-4 md:p-6">
          <div className="container">
            {/* Section label */}
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest2 text-muted">
              Esta semana
            </p>

            {/* Pachanga cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingPachangas.map((p) => (
                <PachangaCard
                  key={p.id}
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
                  avatars={p.avatars}
                  href={`/pachangas/${p.id}`}
                  compact={activeTab === 0 && true}
                />
              ))}
            </div>

            {/* Stats grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatBox label="Partidos jugados">
                {user.stats.played}
              </StatBox>
              <StatBox label="Este mes">
                {user.stats.thisMonth}
              </StatBox>
              <StatBox label="Asistencia">
                {user.stats.attendance}
              </StatBox>
              <StatBox label="Categ. favorita">
                {user.stats.favCategory}
              </StatBox>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileTabs active="Yo" />
    </>
  );
}
