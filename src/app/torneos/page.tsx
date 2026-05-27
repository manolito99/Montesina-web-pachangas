"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { CatChip } from "@/components/ui/cat-chip";
import { NeoCard } from "@/components/ui/neo-card";
import { Fab } from "@/components/ui/fab";
import { FilterChip } from "@/components/ui/filter-chip";
import { cn } from "@/lib/utils";

interface TournamentItem {
  id: string;
  name: string;
  format: "AMERICANO" | "MEXICANO";
  category: "M" | "F" | "X";
  status: "DRAFT" | "OPEN" | "IN_PROGRESS" | "FINISHED";
  currentRound: number;
  createdAt: string;
  organizer: { name: string };
  _count: { players: number };
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  OPEN: "Abierto",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-fill-alt text-muted",
  OPEN: "bg-lime text-ink",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  FINISHED: "bg-ink text-paper",
};

export default function TorneosPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formatFilter, setFormatFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/torneos")
      .then((r) => r.json())
      .then(setTournaments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter((t) => {
    if (formatFilter && t.format !== formatFilter) return false;
    return true;
  });

  return (
    <>
      <SiteHeader variant="paper" active="Pachangas" />
      <main className="min-h-screen bg-paper">
        <div className="border-b-[1.5px] border-ink bg-fill px-4 py-3">
          <div className="container flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-ink">Torneos</h1>
            <span className="ml-auto text-xs text-muted">{filtered.length} torneos</span>
          </div>
          <div className="container mt-2 flex gap-2">
            <FilterChip label="Todos" active={!formatFilter} onClick={() => setFormatFilter(null)} />
            <FilterChip label="Americano" active={formatFilter === "AMERICANO"} onClick={() => setFormatFilter("AMERICANO")} />
            <FilterChip label="Mexicano" active={formatFilter === "MEXICANO"} onClick={() => setFormatFilter("MEXICANO")} />
          </div>
        </div>

        <div className="container p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-ink border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-bold text-ink">No hay torneos</p>
              <p className="mt-1 font-hand text-sm text-muted">Crea el primero!</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => (
                <Link key={t.id} href={`/torneos/${t.id}`}>
                  <NeoCard className="p-4 transition-shadow hover:shadow-neo">
                    <div className="flex items-center gap-2">
                      <CatChip cat={t.category} sm />
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_COLOR[t.status])}>
                        {STATUS_LABEL[t.status]}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-extrabold text-ink">{t.name}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                      <span>{t.format === "AMERICANO" ? "Americano" : "Mexicano"}</span>
                      <span>{t._count.players} jugadores</span>
                      {t.currentRound > 0 && <span>Ronda {t.currentRound}</span>}
                    </div>
                    <div className="mt-2 font-hand text-xs text-muted">
                      por {t.organizer.name}
                    </div>
                  </NeoCard>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
      <Fab href="/torneos/nuevo" />
      <MobileTabs />
    </>
  );
}
