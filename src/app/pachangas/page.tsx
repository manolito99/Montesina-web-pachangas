"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { PachangaCard } from "@/components/ui/pachanga-card";
import { FilterChip } from "@/components/ui/filter-chip";
import { NeoCheckbox } from "@/components/ui/neo-checkbox";
import { LevelBalls } from "@/components/ui/level-balls";
import { NeoButton } from "@/components/ui/neo-button";
import { Fab } from "@/components/ui/fab";
import type { Category } from "@/lib/types";

interface ApiPachanga {
  id: string;
  category: Category;
  date: string;
  duration: number;
  court: { name: string; type: string };
  levelMin: number;
  levelMax: number;
  maxPlayers: number;
  price: string;
  notes: string | null;
  status: string;
  organizer: { name: string };
  _count: { participations: number };
}

function formatPachanga(p: ApiPachanga) {
  const d = new Date(p.date);
  const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const dayLabel = isToday ? "HOY" : isTomorrow ? "MAÑ" : days[d.getDay()] + " " + d.getDate();
  const time = d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  const filled = p._count.participations;

  return {
    id: p.id,
    cat: p.category,
    date: `${dayLabel} · ${time}`,
    time: `${time} · ${p.duration}min`,
    pista: `${p.court.name} · ${p.court.type.toLowerCase()}`,
    nivel: p.levelMin,
    filled,
    max: p.maxPlayers,
    organizer: p.organizer.name,
    price: `${parseFloat(p.price)}€`,
    accent: isToday && filled < p.maxPlayers,
  };
}

const CATS: { label: string; value: Category | null }[] = [
  { label: "Todas", value: null },
  { label: "Masculino", value: "M" },
  { label: "Femenino", value: "F" },
  { label: "Mixto", value: "X" },
];

export default function PachangasPage() {
  const [cat, setCat] = useState<Category | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("Hoy");
  const [onlyFree, setOnlyFree] = useState(true);
  const [levelRange] = useState<[number, number]>([1, 5]);
  const [pachangas, setPachangas] = useState<ReturnType<typeof formatPachanga>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pachangas")
      .then((r) => r.json())
      .then((data: ApiPachanga[]) => setPachangas(data.map(formatPachanga)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = pachangas.filter((p) => {
    if (cat && p.cat !== cat) return false;
    if (onlyFree && p.filled >= p.max) return false;
    if (p.nivel < levelRange[0] || p.nivel > levelRange[1]) return false;
    return true;
  });

  return (
    <>
      <SiteHeader variant="paper" active="Pachangas" />
      <main className="min-h-screen">
        <CategoryBar cat={cat} setCat={setCat} count={filtered.length} />

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
          <FilterSidebar
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onlyFree={onlyFree}
            setOnlyFree={setOnlyFree}
          />
          <PachangaGrid items={filtered} loading={loading} />
        </div>
      </main>
      <SiteFooter />
      <Fab href="/pachangas/nueva" />
      <MobileTabs active="Pachangas" />
    </>
  );
}

function CategoryBar({
  cat,
  setCat,
  count,
}: {
  cat: Category | null;
  setCat: (c: Category | null) => void;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto border-b-[1.5px] border-ink bg-paper px-4 py-3 md:px-6">
      {CATS.map((c) => (
        <FilterChip
          key={c.label}
          label={c.label}
          active={cat === c.value}
          onClick={() => setCat(c.value)}
        />
      ))}
      <span className="ml-auto whitespace-nowrap font-hand text-sm text-muted">
        {count} pachangas
      </span>
    </div>
  );
}

function FilterSidebar({
  dateFilter,
  setDateFilter,
  onlyFree,
  setOnlyFree,
}: {
  dateFilter: string;
  setDateFilter: (d: string) => void;
  onlyFree: boolean;
  setOnlyFree: (v: boolean) => void;
}) {
  return (
    <div className="hidden border-r-[1.5px] border-ink bg-paper-alt p-5 md:block">
      <div className="text-sm font-bold text-ink">Filtros</div>

      <div className="mt-5">
        <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
          Fecha
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {["Hoy", "Mañana", "Esta semana", "Elegir…"].map((d) => (
            <NeoCheckbox
              key={d}
              label={d}
              checked={dateFilter === d}
              onChange={() => setDateFilter(d)}
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
          Nivel
        </div>
        <div className="mt-2 flex items-center gap-2">
          <LevelBalls value={2} size={12} />
          <span className="font-hand text-xs text-ink-2">2 — 4</span>
        </div>
        <div className="relative mt-2 h-1 rounded-sm border border-ink bg-fill">
          <div className="absolute inset-y-[-1px] left-[20%] right-[20%] rounded-sm border border-ink bg-lime" />
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
          Plazas
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <NeoCheckbox
            label="Con plaza libre"
            checked={onlyFree}
            onChange={setOnlyFree}
          />
          <NeoCheckbox label="Lista de espera" checked={false} />
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
          Pista
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <NeoCheckbox label="Indoor" checked={false} />
          <NeoCheckbox label="Outdoor" checked={false} />
        </div>
      </div>

      <div className="mt-6">
        <NeoButton variant="ghost" size="sm" full>
          Limpiar filtros
        </NeoButton>
      </div>
    </div>
  );
}

function PachangaGrid({ items, loading }: { items: ReturnType<typeof formatPachanga>[]; loading: boolean }) {
  return (
    <div className="bg-paper p-4 md:p-5">
      {/* Mobile: title + filter toggle */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <h1 className="text-lg font-extrabold text-ink">Pachangas</h1>
        <span className="font-hand text-sm text-muted">⏷ filtros</span>
      </div>

      {loading ? (
        <div className="py-16 text-center font-hand text-muted">
          Cargando pachangas...
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg font-bold text-ink">Sin pachangas</p>
          <p className="mt-1 font-hand text-sm text-muted">Sé el primero en crear una</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
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
              href={`/pachangas/${p.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
