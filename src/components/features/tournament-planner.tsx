"use client";

import { useMemo, useState } from "react";
import { NeoButton } from "@/components/ui/neo-button";
import { cn } from "@/lib/utils";

export interface ScheduleBlock {
  /** "HH:MM" en hora local */
  time: string;
  rounds: number;
  /** Nombres de pista separados por coma */
  courts: string;
}

export interface SchedulePayload {
  matchDurationMin: number;
  restBetweenMin: number;
  blocks: { startsAt: string; rounds: number; courtNames: string[] }[];
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseCourts(raw: string): string[] {
  return raw.split(",").map((c) => c.trim()).filter(Boolean);
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Planificador de cuadrante: el organizador define bloques horarios (hora de
 * inicio, cuantas rondas y que pistas) y al aceptar se generan TODAS las rondas
 * de golpe, cada una con su hora y su pista.
 */
export function TournamentPlanner({
  playerCount,
  defaultDurationMin,
  defaultCourts,
  saving,
  onCancel,
  onConfirm,
}: {
  playerCount: number;
  defaultDurationMin: number | null;
  defaultCourts: string[];
  saving: boolean;
  onCancel: () => void;
  onConfirm: (schedule: SchedulePayload) => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [durationMin, setDurationMin] = useState(String(defaultDurationMin ?? 20));
  // 5 min entre rondas: cambiar de pista, beber agua y apuntar el resultado
  const [restMin, setRestMin] = useState("5");
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([
    { time: "18:30", rounds: 3, courts: defaultCourts.join(", ") || "Pista 1, Pista 2" },
  ]);

  const patchBlock = (idx: number, patch: Partial<ScheduleBlock>) =>
    setBlocks((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));

  /* ── Vista previa: horas reales, partidos por jugador y si el reparto es exacto ── */
  const preview = useMemo(() => {
    const duration = parseInt(durationMin, 10);
    const rest = parseInt(restMin, 10);
    if (isNaN(duration) || duration < 1 || isNaN(rest) || rest < 0) return null;

    const rows: { round: number; start: Date; end: Date; courts: string[] }[] = [];
    let round = 0;
    let slots = 0;
    for (const b of blocks) {
      const courts = parseCourts(b.courts);
      const base = new Date(`${date}T${b.time}:00`);
      if (isNaN(base.getTime()) || courts.length === 0 || b.rounds < 1) return null;
      for (let i = 0; i < b.rounds; i++) {
        round++;
        const start = new Date(base.getTime() + i * (duration + rest) * 60_000);
        rows.push({
          round,
          start,
          end: new Date(start.getTime() + duration * 60_000),
          courts,
        });
        slots += Math.min(Math.floor(playerCount / 4), courts.length) * 4;
      }
    }
    if (rows.length === 0) return null;

    const perPlayer = playerCount > 0 ? slots / playerCount : 0;
    return {
      rows,
      totalRounds: rows.length,
      totalMatches: slots / 4,
      perPlayer,
      exact: playerCount > 0 && slots % playerCount === 0,
      endsAt: rows[rows.length - 1].end,
    };
  }, [blocks, date, durationMin, restMin, playerCount]);

  const handleConfirm = () => {
    const duration = parseInt(durationMin, 10);
    const rest = parseInt(restMin, 10);
    onConfirm({
      matchDurationMin: duration,
      restBetweenMin: rest,
      blocks: blocks.map((b) => ({
        startsAt: new Date(`${date}T${b.time}:00`).toISOString(),
        rounds: b.rounds,
        courtNames: parseCourts(b.courts),
      })),
    });
  };

  const inputCls =
    "w-full rounded-lg border-[1.5px] border-ink bg-paper px-3 py-2 text-sm font-semibold text-ink focus:border-lime-deep focus:outline-none";
  const labelCls = "mb-1 block text-[10px] font-bold uppercase tracking-widest2 text-muted";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 md:items-center md:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border-[1.5px] border-ink bg-paper md:max-w-lg md:rounded-2xl">
        <div className="sticky top-0 z-10 border-b-[1.5px] border-ink bg-paper px-4 py-3">
          <h2 className="text-base font-extrabold text-ink">Planificar el cuadrante</h2>
          <p className="mt-0.5 font-hand text-xs text-muted">
            Se generan todas las rondas de golpe con su hora y su pista.
          </p>
        </div>

        <div className="space-y-4 p-4">
          {/* Fecha y tiempos */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <label className={labelCls}>Dia del torneo</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Duracion partido</label>
              <input
                type="tel"
                inputMode="numeric"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value.replace(/[^0-9]/g, ""))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Descanso</label>
              <input
                type="tel"
                inputMode="numeric"
                value={restMin}
                onChange={(e) => setRestMin(e.target.value.replace(/[^0-9]/g, ""))}
                className={inputCls}
              />
            </div>
          </div>

          {/* Bloques */}
          <div className="space-y-3">
            {blocks.map((b, idx) => (
              <div key={idx} className="rounded-lg border-[1.5px] border-ink bg-fill p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
                    Bloque {idx + 1}
                  </span>
                  {blocks.length > 1 && (
                    <button
                      onClick={() => setBlocks((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-[11px] font-semibold text-rose-600 underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Empieza</label>
                    <input
                      type="time"
                      value={b.time}
                      onChange={(e) => patchBlock(idx, { time: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Rondas</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={b.rounds || ""}
                      onChange={(e) => patchBlock(idx, { rounds: parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0 })}
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Pistas (separadas por coma)</label>
                    <input
                      type="text"
                      value={b.courts}
                      onChange={(e) => patchBlock(idx, { courts: e.target.value })}
                      placeholder="Pabellon, Lebron"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                setBlocks((prev) => [
                  ...prev,
                  { time: "20:00", rounds: 3, courts: prev[prev.length - 1]?.courts ?? "" },
                ])
              }
              className="w-full rounded-lg border-[1.5px] border-dashed border-muted py-2 text-xs font-bold text-muted hover:border-ink hover:text-ink"
            >
              + Anadir bloque horario
            </button>
          </div>

          {/* Vista previa */}
          {preview && (
            <div className="rounded-lg border-[1.5px] border-ink bg-lime-soft/30 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest2 text-muted">Vista previa</p>
              <p className="mt-1 text-sm font-bold text-ink">
                {preview.totalRounds} rondas &middot; {preview.totalMatches} partidos &middot; termina a las {fmtTime(preview.endsAt)}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs font-semibold",
                  preview.exact ? "text-lime-deep" : "text-amber-700",
                )}
              >
                {preview.exact
                  ? `Todos juegan ${preview.perPlayer} partidos exactos`
                  : `Reparto desigual: ~${preview.perPlayer.toFixed(1)} partidos por jugador (unos juegan mas que otros)`}
              </p>
              <div className="mt-2 max-h-40 space-y-0.5 overflow-y-auto">
                {preview.rows.map((r) => (
                  <p key={r.round} className="font-hand text-xs text-ink">
                    R{r.round} &middot; {fmtTime(r.start)}&ndash;{fmtTime(r.end)} &middot; {r.courts.join(" + ")}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="sticky bottom-0 flex gap-2 border-t-[1.5px] border-ink bg-paper px-4 py-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <NeoButton variant="ghost" size="md" disabled={saving} onClick={onCancel}>
            Cancelar
          </NeoButton>
          <NeoButton
            variant="primary"
            size="md"
            full
            disabled={saving || !preview}
            onClick={handleConfirm}
          >
            {saving ? "Generando cuadrante..." : "Generar cuadrante e iniciar"}
          </NeoButton>
        </div>
      </div>
    </div>
  );
}
