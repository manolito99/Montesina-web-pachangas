"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { CatChip } from "@/components/ui/cat-chip";
import { LevelBalls } from "@/components/ui/level-balls";
import { Avatar } from "@/components/ui/avatar";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { StatBox } from "@/components/ui/stat-box";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/lib/admin";

/* ──────────────────────────────────────────────
   Types (match API response shape)
   ────────────────────────────────────────────── */

interface TournamentData {
  id: string;
  name: string;
  format: "AMERICANO" | "MEXICANO" | "PERSONALIZADO";
  category: "M" | "F" | "X";
  status: "DRAFT" | "OPEN" | "IN_PROGRESS" | "FINISHED";
  pointsPerMatch: number;
  freeScoring: boolean;
  matchDurationMin: number | null;
  courtIds: string[];
  currentRound: number;
  organizerId: string;
  organizer: { id: string; name: string };
  players: {
    id: string;
    totalPoints: number;
    user: { id: string; name: string; level: number; gender: string };
  }[];
  rounds: {
    id: string;
    roundNumber: number;
    matches: {
      id: string;
      courtIndex: number;
      scoreTeamA: number | null;
      scoreTeamB: number | null;
      completed: boolean;
      player1: { user: { name: string } };
      player2: { user: { name: string } };
      player3: { user: { name: string } };
      player4: { user: { name: string } };
    }[];
  }[];
}

/* ──────────────────────────────────────────────
   Constants & helpers
   ────────────────────────────────────────────── */

const FORMAT_LABEL: Record<string, string> = {
  AMERICANO: "Americano",
  MEXICANO: "Mexicano",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  OPEN: "Abierto",
  IN_PROGRESS: "En curso",
  FINISHED: "Finalizado",
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-fill text-muted",
  OPEN: "bg-lime text-ink",
  IN_PROGRESS: "bg-cat-masc text-ink",
  FINISHED: "bg-ink text-paper",
};

function initial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/* ──────────────────────────────────────────────
   Page component
   ────────────────────────────────────────────── */

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id ?? null;

  const [data, setData] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTournament = useCallback(async () => {
    try {
      const res = await fetch(`/api/torneos/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const json: TournamentData = await res.json();
      setData(json);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  /* ── Organizer actions ── */
  const promptNumCourts = (defaultN: number): number | null => {
    const input = window.prompt("¿Cuántas pistas para esta ronda? (1-20)", String(defaultN));
    if (input === null) return null;
    const n = parseInt(input, 10);
    if (isNaN(n) || n < 1 || n > 20) {
      alert("Numero invalido");
      return null;
    }
    return n;
  };

  const handleStart = async () => {
    if (!data) return;
    const isCustom = data.format === "PERSONALIZADO";
    const defaultCourts = data.courtIds.length || 1;
    const numCourts = isCustom ? promptNumCourts(defaultCourts) : defaultCourts;
    if (numCourts === null) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/torneos/${id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numCourts }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "No se pudo iniciar el torneo");
        return;
      }
      await fetchTournament();
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateRound = async () => {
    if (!data) return;
    const isCustom = data.format === "PERSONALIZADO";
    const defaultCourts = data.courtIds.length || 1;
    const numCourts = isCustom ? promptNumCourts(defaultCourts) : defaultCourts;
    if (numCourts === null) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/torneos/${id}/rounds/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numCourts }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "No se pudo generar la siguiente ronda");
        return;
      }
      await fetchTournament();
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!confirm("Finalizar el torneo? No se podran generar mas rondas.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/torneos/${id}/finish`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "No se pudo finalizar el torneo");
        return;
      }
      await fetchTournament();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Eliminar este torneo? Esta accion no se puede deshacer.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/torneos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "No se pudo eliminar el torneo");
        return;
      }
      window.location.href = "/torneos";
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveScore = async (matchId: string, scoreA: number, scoreB: number) => {
    try {
      const res = await fetch(`/api/torneos/${id}/matches/${matchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scoreTeamA: scoreA, scoreTeamB: scoreB }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "No se pudo guardar el resultado");
        return;
      }
      await fetchTournament();
    } catch {
      alert("Error al guardar el resultado");
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <SiteHeader variant="paper" active="Pachangas" />
        <main className="flex min-h-[60vh] items-center justify-center bg-paper">
          <div className="flex flex-col items-center gap-3">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-ink border-t-transparent" />
            <p className="font-hand text-sm text-muted">Cargando torneo...</p>
          </div>
        </main>
        <SiteFooter />
        <MobileTabs active="Pachangas" />
      </>
    );
  }

  /* ── Not found state ── */
  if (notFound || !data) {
    return (
      <>
        <SiteHeader variant="paper" active="Pachangas" />
        <main className="flex min-h-[60vh] items-center justify-center bg-paper">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-ink">Torneo no encontrado</p>
            <p className="mt-2 font-hand text-muted">
              El torneo que buscas no existe o fue eliminado.
            </p>
            <Link
              href="/torneos"
              className="mt-4 inline-block font-semibold text-lime-deep underline"
            >
              Volver al listado
            </Link>
          </div>
        </main>
        <SiteFooter />
        <MobileTabs active="Pachangas" />
      </>
    );
  }

  /* ── Derived values ── */
  const userIsAdmin = isAdmin(session?.user?.email);
  const isOrganizer = currentUserId === data.organizerId;
  const canManage = isOrganizer || userIsAdmin;
  const currentRoundData = data.rounds.find((r) => r.roundNumber === data.currentRound);
  const allCurrentMatchesCompleted = currentRoundData
    ? currentRoundData.matches.every((m) => m.completed)
    : false;

  return (
    <>
      <SiteHeader variant="paper" active="Pachangas" />

      {/* ── Mobile top bar ── */}
      <div className="flex items-center gap-3 border-b-[1.5px] border-ink bg-paper px-4 py-3 md:hidden">
        <Link href="/torneos" className="text-ink" aria-label="Volver">
          <span className="text-lg font-bold">&larr;</span>
        </Link>
        <span className="text-sm font-bold text-ink">
          Torneo &middot; #{data.id.slice(0, 6)}
        </span>
      </div>

      <main className="min-h-screen bg-paper">
        {/* ── Desktop breadcrumb ── */}
        <div className="hidden border-b-[1.5px] border-ink bg-paper px-6 py-3 md:block">
          <Link
            href="/torneos"
            className="font-hand text-sm text-muted hover:text-ink"
          >
            &larr; volver al listado
          </Link>
        </div>

        {/* ── Two-column layout (desktop) ── */}
        <div className="md:grid md:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="p-4 md:p-6">
            <TournamentMainContent
              data={data}
              isOrganizer={isOrganizer}
              onSaveScore={handleSaveScore}
            />
          </div>

          {/* Sidebar (desktop) */}
          <aside className="hidden border-l-[1.5px] border-ink md:block">
            <TournamentSidebar
              data={data}
              isOrganizer={isOrganizer}
              canManage={canManage}
              actionLoading={actionLoading}
              allCurrentMatchesCompleted={allCurrentMatchesCompleted}
              onStart={handleStart}
              onGenerateRound={handleGenerateRound}
              onFinish={handleFinish}
              onDelete={handleDelete}
            />
          </aside>
        </div>

        {/* ── Mobile organizer actions + player list ── */}
        <div className="border-t-[1.5px] border-ink p-4 md:hidden">
          <OrganizerActions
            data={data}
            isOrganizer={isOrganizer}
            actionLoading={actionLoading}
            allCurrentMatchesCompleted={allCurrentMatchesCompleted}
            onStart={handleStart}
            onGenerateRound={handleGenerateRound}
            onFinish={handleFinish}
          />
          <div className="mt-4">
            <PlayerListSection players={data.players} />
          </div>
          {canManage && (
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="mt-4 text-xs font-semibold text-rose-600 underline hover:text-rose-800 disabled:opacity-50"
            >
              Eliminar torneo
            </button>
          )}
        </div>
      </main>

      <SiteFooter />
      <MobileTabs active="Pachangas" />
    </>
  );
}

/* ──────────────────────────────────────────────
   Main content
   ────────────────────────────────────────────── */

function TournamentMainContent({
  data,
  isOrganizer,
  onSaveScore,
}: {
  data: TournamentData;
  isOrganizer: boolean;
  onSaveScore: (matchId: string, scoreA: number, scoreB: number) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"clasificacion" | "rondas">("clasificacion");

  return (
    <div className="space-y-5">
      {/* Top row: chips + status */}
      <div className="flex flex-wrap items-center gap-2">
        <CatChip cat={data.category} />
        <span className="rounded border-[1.2px] border-ink bg-fill px-2 py-px text-[11px] font-bold uppercase tracking-widest2 text-ink">
          {FORMAT_LABEL[data.format] || data.format}
        </span>
        <span
          className={cn(
            "rounded border-[1.2px] border-ink px-2 py-px text-[11px] font-bold uppercase tracking-widest2",
            STATUS_STYLE[data.status],
          )}
        >
          {STATUS_LABEL[data.status] || data.status}
        </span>
        <span className="ml-auto text-xs font-hand text-muted">
          organiza {data.organizer.name}
        </span>
      </div>

      {/* Tournament name */}
      <div>
        <h1 className="text-xl font-extrabold text-ink md:text-2xl">
          {data.name}
        </h1>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="Formato">
          {FORMAT_LABEL[data.format] || data.format}
        </StatBox>
        <StatBox label="Puntos/partido">
          {data.pointsPerMatch}
        </StatBox>
        <StatBox label="Jugadores">
          {data.players.length}
        </StatBox>
        <StatBox label="Ronda actual">
          {data.currentRound > 0 ? data.currentRound : "-"}
        </StatBox>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 rounded-lg border-[1.5px] border-ink bg-fill p-1">
        <button
          onClick={() => setActiveTab("clasificacion")}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-bold transition-all",
            activeTab === "clasificacion"
              ? "bg-lime text-ink shadow-neo-sm"
              : "text-muted hover:text-ink",
          )}
        >
          Clasificacion
        </button>
        <button
          onClick={() => setActiveTab("rondas")}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-sm font-bold transition-all",
            activeTab === "rondas"
              ? "bg-lime text-ink shadow-neo-sm"
              : "text-muted hover:text-ink",
          )}
        >
          Rondas
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "clasificacion" ? (
        <LeaderboardTab players={data.players} />
      ) : (
        <RoundsTab
          rounds={data.rounds}
          pointsPerMatch={data.pointsPerMatch}
          freeScoring={data.freeScoring}
          matchDurationMin={data.matchDurationMin}
          isOrganizer={isOrganizer}
          onSaveScore={onSaveScore}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Leaderboard tab
   ────────────────────────────────────────────── */

const PODIUM_BORDER: Record<number, string> = {
  1: "border-[#FFD700]",
  2: "border-[#C0C0C0]",
  3: "border-[#CD7F32]",
};

const PODIUM_BG: Record<number, string> = {
  1: "bg-[#FFD700]/10",
  2: "bg-[#C0C0C0]/10",
  3: "bg-[#CD7F32]/10",
};

function LeaderboardTab({
  players,
}: {
  players: TournamentData["players"];
}) {
  const sorted = [...players].sort((a, b) => b.totalPoints - a.totalPoints);

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border-[1.5px] border-dashed border-muted p-6 text-center">
        <p className="font-hand text-sm text-muted">
          No hay jugadores inscritos todavia.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-[1.5px] border-ink p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        CLASIFICACION &middot; {sorted.length} jugadores
      </div>

      <div className="mt-3 space-y-2">
        {sorted.map((player, idx) => {
          const position = idx + 1;
          const isTop3 = position <= 3;

          return (
            <div
              key={player.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border-[1.5px] px-3 py-2.5 transition-colors",
                isTop3
                  ? cn(
                      "border-[2px]",
                      PODIUM_BORDER[position],
                      PODIUM_BG[position],
                    )
                  : "border-ink bg-fill",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold",
                  position === 1 && "bg-[#FFD700] text-ink",
                  position === 2 && "bg-[#C0C0C0] text-ink",
                  position === 3 && "bg-[#CD7F32] text-white",
                  position > 3 && "bg-fill text-muted border-[1.2px] border-ink",
                )}
              >
                {position}
              </span>
              <Avatar label={initial(player.user.name)} size={28} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink">
                  {player.user.name}
                </div>
                <LevelBalls value={player.user.level} size={8} />
              </div>
              <span className="text-base font-extrabold text-ink">
                {player.totalPoints}
                <span className="ml-0.5 text-[10px] font-normal text-muted">pts</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Rounds tab
   ────────────────────────────────────────────── */

function RoundsTab({
  rounds,
  pointsPerMatch,
  freeScoring,
  matchDurationMin,
  isOrganizer,
  onSaveScore,
}: {
  rounds: TournamentData["rounds"];
  pointsPerMatch: number;
  freeScoring: boolean;
  matchDurationMin: number | null;
  isOrganizer: boolean;
  onSaveScore: (matchId: string, scoreA: number, scoreB: number) => Promise<void>;
}) {
  const sortedRounds = [...rounds].sort((a, b) => b.roundNumber - a.roundNumber);

  if (sortedRounds.length === 0) {
    return (
      <div className="rounded-lg border-[1.5px] border-dashed border-muted p-6 text-center">
        <p className="font-hand text-sm text-muted">
          No se han generado rondas todavia. El organizador debe iniciar el torneo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRounds.map((round) => {
        const allCompleted = round.matches.every((m) => m.completed);

        return (
          <div
            key={round.id}
            className="rounded-lg border-[1.5px] border-ink bg-fill"
          >
            {/* Round header */}
            <div className="flex items-center justify-between border-b-[1.5px] border-ink px-4 py-3">
              <span className="text-sm font-extrabold text-ink">
                Ronda {round.roundNumber}
              </span>
              <span
                className={cn(
                  "rounded px-2 py-px text-[10px] font-bold uppercase tracking-widest2",
                  allCompleted
                    ? "bg-lime text-ink"
                    : "bg-fill border-[1.2px] border-ink text-muted",
                )}
              >
                {allCompleted ? "Completada" : "Pendiente"}
              </span>
            </div>

            {/* Matches */}
            <div className="divide-y-[1px] divide-ink/20">
              {round.matches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  pointsPerMatch={pointsPerMatch}
                  freeScoring={freeScoring}
                  matchDurationMin={matchDurationMin}
                  isOrganizer={isOrganizer}
                  onSaveScore={onSaveScore}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Match row (with inline score input)
   ────────────────────────────────────────────── */

function MatchRow({
  match,
  pointsPerMatch,
  freeScoring,
  matchDurationMin,
  isOrganizer,
  onSaveScore,
}: {
  match: TournamentData["rounds"][number]["matches"][number];
  pointsPerMatch: number;
  freeScoring: boolean;
  matchDurationMin: number | null;
  isOrganizer: boolean;
  onSaveScore: (matchId: string, scoreA: number, scoreB: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [scoreA, setScoreA] = useState<string>("");
  const [scoreBFree, setScoreBFree] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // For non-free scoring, scoreB is auto-calculated
  const numA = parseInt(scoreA, 10);
  const scoreBAuto = !isNaN(numA) && numA >= 0 && numA <= pointsPerMatch
    ? String(pointsPerMatch - numA)
    : "";
  const scoreB = freeScoring ? scoreBFree : scoreBAuto;

  const handleSave = async () => {
    const a = parseInt(scoreA, 10);
    const b = parseInt(scoreB, 10);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) {
      alert("Introduce numeros validos para ambos equipos");
      return;
    }
    if (!freeScoring && a + b !== pointsPerMatch) {
      alert(`Los puntos deben sumar ${pointsPerMatch}`);
      return;
    }
    setSaving(true);
    await onSaveScore(match.id, a, b);
    setSaving(false);
    setEditing(false);
  };

  const teamANames = `${match.player1.user.name} / ${match.player2.user.name}`;
  const teamBNames = `${match.player3.user.name} / ${match.player4.user.name}`;

  return (
    <div className="px-4 py-3">
      {/* Teams */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 text-right">
          <span className="text-sm font-bold text-ink">{teamANames}</span>
        </div>

        {/* Score display */}
        <div className="flex-shrink-0">
          {match.completed ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-lime-deep bg-lime/10 px-3 py-1 text-sm font-extrabold text-ink">
              {match.scoreTeamA} - {match.scoreTeamB}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border-[1.5px] border-dashed border-muted px-3 py-1 text-sm font-bold text-muted">
              &mdash;
            </span>
          )}
        </div>

        {/* Team B */}
        <div className="min-w-0 flex-1">
          <span className="text-sm font-bold text-ink">{teamBNames}</span>
        </div>
      </div>

      {/* Court label */}
      <div className="mt-1 text-center">
        <span className="text-[10px] font-hand text-muted">
          Pista {match.courtIndex + 1}
        </span>
      </div>

      {/* Organizer score entry */}
      {isOrganizer && !match.completed && (
        <div className="mt-3">
          {editing ? (
            <div className="rounded-lg border-[1.5px] border-lime-deep bg-lime-soft/30 p-3">
              <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest2 text-muted">
                {freeScoring ? "Juegos ganados por cada equipo" : `Puntos de cada equipo (suman ${pointsPerMatch})`}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="text-center">
                  <p className="mb-1 text-[10px] text-muted truncate max-w-[100px]">{match.player1.user.name.split(" ")[0]} / {match.player2.user.name.split(" ")[0]}</p>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={scoreA}
                    onChange={(e) => setScoreA(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-16 rounded-lg border-[2px] border-ink bg-paper px-2 py-2 text-center text-lg font-extrabold text-ink focus:border-lime-deep focus:outline-none"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <span className="mt-4 text-lg font-bold text-muted">-</span>
                <div className="text-center">
                  <p className="mb-1 text-[10px] text-muted truncate max-w-[100px]">{match.player3.user.name.split(" ")[0]} / {match.player4.user.name.split(" ")[0]}</p>
                  {freeScoring ? (
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={scoreBFree}
                      onChange={(e) => setScoreBFree(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-16 rounded-lg border-[2px] border-ink bg-paper px-2 py-2 text-center text-lg font-extrabold text-ink focus:border-lime-deep focus:outline-none"
                      placeholder="0"
                    />
                  ) : (
                    <div className="w-16 rounded-lg border-[2px] border-dashed border-muted bg-fill px-2 py-2 text-center text-lg font-extrabold text-muted">
                      {scoreB || "—"}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-center gap-2">
                <NeoButton size="sm" variant="primary" disabled={saving || !scoreA || !scoreB} onClick={handleSave}>
                  {saving ? "Guardando..." : "Guardar resultado"}
                </NeoButton>
                <NeoButton size="sm" variant="ghost" disabled={saving} onClick={() => { setEditing(false); setScoreA(""); setScoreBFree(""); }}>
                  Cancelar
                </NeoButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {matchDurationMin && <MatchTimer matchId={match.id} durationMin={matchDurationMin} />}
              <NeoButton size="sm" variant="ghost" onClick={() => setEditing(true)}>
                Anotar resultado
              </NeoButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Sidebar (desktop)
   ────────────────────────────────────────────── */

function TournamentSidebar({
  data,
  isOrganizer,
  canManage,
  actionLoading,
  allCurrentMatchesCompleted,
  onStart,
  onGenerateRound,
  onFinish,
  onDelete,
}: {
  data: TournamentData;
  isOrganizer: boolean;
  canManage: boolean;
  actionLoading: boolean;
  allCurrentMatchesCompleted: boolean;
  onStart: () => void;
  onGenerateRound: () => void;
  onFinish: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col divide-y-[1.5px] divide-ink">
      <OrganizerActions
        data={data}
        isOrganizer={isOrganizer}
        actionLoading={actionLoading}
        allCurrentMatchesCompleted={allCurrentMatchesCompleted}
        onStart={onStart}
        onGenerateRound={onGenerateRound}
        onFinish={onFinish}
      />
      <PlayerListSection players={data.players} />
      {canManage && (
        <div className="p-4">
          <button
            onClick={onDelete}
            disabled={actionLoading}
            className="text-xs font-semibold text-rose-600 underline hover:text-rose-800 disabled:opacity-50"
          >
            Eliminar torneo
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Organizer actions
   ────────────────────────────────────────────── */

function OrganizerActions({
  data,
  isOrganizer,
  actionLoading,
  allCurrentMatchesCompleted,
  onStart,
  onGenerateRound,
  onFinish,
}: {
  data: TournamentData;
  isOrganizer: boolean;
  actionLoading: boolean;
  allCurrentMatchesCompleted: boolean;
  onStart: () => void;
  onGenerateRound: () => void;
  onFinish: () => void;
}) {
  if (!isOrganizer) return null;

  return (
    <div className="p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        ACCIONES DEL ORGANIZADOR
      </div>

      <div className="mt-3 space-y-2">
        {(data.status === "DRAFT" || data.status === "OPEN") && (
          <NeoButton
            variant="primary"
            full
            disabled={actionLoading}
            onClick={onStart}
          >
            {actionLoading ? "Iniciando..." : "Iniciar torneo"}
          </NeoButton>
        )}

        {data.status === "IN_PROGRESS" && allCurrentMatchesCompleted && (
          <NeoButton
            variant="primary"
            full
            disabled={actionLoading}
            onClick={onGenerateRound}
          >
            {actionLoading ? "Generando..." : "Generar siguiente ronda"}
          </NeoButton>
        )}

        {data.status === "IN_PROGRESS" && (
          <NeoButton
            variant="ghost"
            full
            disabled={actionLoading}
            onClick={onFinish}
          >
            {actionLoading ? "Finalizando..." : "Finalizar torneo"}
          </NeoButton>
        )}

        {data.status === "FINISHED" && (
          <NeoCard flat className="p-3 text-center">
            <p className="font-hand text-sm text-muted">
              Torneo finalizado
            </p>
          </NeoCard>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Player list section
   ────────────────────────────────────────────── */

function PlayerListSection({
  players,
}: {
  players: TournamentData["players"];
}) {
  return (
    <div className="p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        JUGADORES &middot; {players.length}
      </div>

      {players.length === 0 ? (
        <p className="mt-2 font-hand text-xs text-muted">
          No hay jugadores inscritos todavia.
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-2.5">
              <Avatar label={initial(player.user.name)} size={28} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink">
                  {player.user.name}
                </div>
                <LevelBalls value={player.user.level} size={8} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Match timer (localStorage-backed countdown) */
function MatchTimer({ matchId, durationMin }: { matchId: string; durationMin: number }) {
  const STORAGE_KEY = `match-timer-${matchId}`;
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setStartedAt(parseInt(saved, 10));
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  function start() {
    const ts = Date.now();
    localStorage.setItem(STORAGE_KEY, String(ts));
    setStartedAt(ts);
    setNow(ts);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setStartedAt(null);
  }

  if (!startedAt) {
    return (
      <button
        type="button"
        onClick={start}
        className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-ink bg-fill px-3 py-1 text-xs font-bold text-ink hover:bg-paper-alt"
      >
        Iniciar timer ({durationMin}min)
      </button>
    );
  }

  const elapsedMs = now - startedAt;
  const totalMs = durationMin * 60 * 1000;
  const remainingMs = totalMs - elapsedMs;
  const expired = remainingMs <= 0;
  const absMs = Math.abs(remainingMs);
  const mins = Math.floor(absMs / 60000);
  const secs = Math.floor((absMs % 60000) / 1000);
  const display = (expired ? "+" : "") + mins + ":" + String(secs).padStart(2, "0");

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border-[1.5px] px-3 py-1 text-xs font-bold tabular-nums",
          expired
            ? "border-rose-600 bg-rose-100 text-rose-700 animate-pulse"
            : "border-lime-deep bg-lime-soft text-ink"
        )}
      >
        {display}
      </span>
      <button
        type="button"
        onClick={reset}
        className="text-[10px] text-muted underline hover:text-ink"
      >
        reset
      </button>
    </div>
  );
}
