"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { CatChip } from "@/components/ui/cat-chip";
import { LevelBalls } from "@/components/ui/level-balls";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { AvatarRow } from "@/components/ui/avatar";
import { COURTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Category = "M" | "F" | "X";

interface WizardState {
  step: 1 | 2 | 3 | 4;
  category: Category | null;
  date: string | null;
  timeSlot: string | null;
  duration: 60 | 90 | 120;
  court: string | null;
  levelMin: number;
  levelMax: number;
  players: 2 | 4;
  price: string;
  notes: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data for the wizard                                           */
/* ------------------------------------------------------------------ */

const DAY_OPTIONS = [
  { label: "MAR 20", value: "MAR 20" },
  { label: "MIE 21", value: "MIE 21" },
  { label: "JUE 22", value: "JUE 22" },
  { label: "VIE 23", value: "VIE 23" },
  { label: "SAB 24", value: "SAB 24" },
  { label: "DOM 25", value: "DOM 25" },
  { label: "LUN 26", value: "LUN 26" },
];

const TIME_OPTIONS = [
  { label: "17:00", value: "17:00", occupied: false },
  { label: "18:30", value: "18:30", occupied: false },
  { label: "19:00", value: "19:00", occupied: true },
  { label: "20:30", value: "20:30", occupied: false },
  { label: "22:00", value: "22:00", occupied: false },
];

const DURATION_OPTIONS: { label: string; value: 60 | 90 | 120 }[] = [
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
  { label: "120 min", value: 120 },
];

const CATEGORY_META: Record<
  Category,
  { label: string; desc: string }
> = {
  M: { label: "Masculino", desc: "4 hombres" },
  F: { label: "Femenino", desc: "4 mujeres" },
  X: { label: "Mixto", desc: "2H + 2M" },
};

const STEP_LABELS = ["Categoria", "Dia y hora", "Pista", "Resumen"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function canAdvance(s: WizardState): boolean {
  switch (s.step) {
    case 1:
      return s.category !== null;
    case 2:
      return s.date !== null && s.timeSlot !== null;
    case 3:
      return s.court !== null;
    case 4:
      return true;
    default:
      return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-start justify-center gap-0 px-4 py-6">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const isDone = step > num;
        const isActive = step === num;
        const isPending = step < num;

        return (
          <div key={num} className="flex items-start">
            {/* circle + label column */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  isDone && "border-[1.5px] border-ink bg-ink text-fill",
                  isActive && "border-[1.5px] border-ink bg-lime text-ink",
                  isPending && "border-[1.5px] border-ink bg-fill text-ink",
                )}
              >
                {isDone ? "✓" : num}
              </span>
              <span className="mt-1 text-[10px] text-muted">{label}</span>
            </div>

            {/* dashed connector */}
            {i < STEP_LABELS.length - 1 && (
              <div className="mt-3 w-8 border-t border-dashed border-ink md:w-12" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Categoria                                                 */
/* ------------------------------------------------------------------ */

function Step1({
  category,
  setCategory,
}: {
  category: Category | null;
  setCategory: (c: Category) => void;
}) {
  const cats: Category[] = ["M", "F", "X"];

  return (
    <div>
      <p className="mb-4 text-center text-sm font-semibold text-ink-2">
        ¿Que tipo de partido organizas?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {cats.map((c) => {
          const selected = category === c;
          const meta = CATEGORY_META[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-lg border-[1.5px] p-4 text-center transition-all",
                selected
                  ? "border-[2px] border-lime-deep bg-lime-soft shadow-neo-lime"
                  : "border-ink bg-fill hover:bg-paper-alt",
              )}
            >
              {selected && (
                <span className="absolute right-2 top-2 text-xs text-lime-deep">
                  &#10003;
                </span>
              )}
              <CatChip cat={c} />
              <span className="text-sm font-bold text-ink">{meta.label}</span>
              <span className="text-xs text-muted">{meta.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Dia y hora                                                */
/* ------------------------------------------------------------------ */

function Step2({
  date,
  setDate,
  timeSlot,
  setTimeSlot,
  duration,
  setDuration,
}: {
  date: string | null;
  setDate: (d: string) => void;
  timeSlot: string | null;
  setTimeSlot: (t: string) => void;
  duration: 60 | 90 | 120;
  setDuration: (d: 60 | 90 | 120) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Day pills */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-2">Elige dia</p>
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDate(d.value)}
              className={cn(
                "rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-all",
                date === d.value
                  ? "border-lime-deep bg-lime text-ink"
                  : "border-ink bg-fill text-ink hover:bg-paper-alt",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time slot pills */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-2">
          Franja horaria
        </p>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              disabled={t.occupied}
              onClick={() => setTimeSlot(t.value)}
              className={cn(
                "rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-all",
                t.occupied
                  ? "border-ink bg-fill-alt text-muted line-through opacity-60"
                  : timeSlot === t.value
                    ? "border-lime-deep bg-lime text-ink"
                    : "border-ink bg-fill text-ink hover:bg-paper-alt",
              )}
            >
              {t.label}
              {t.occupied && (
                <span className="ml-1 text-[10px] font-normal no-underline">
                  ocupada
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Duration pills */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-2">Duracion:</p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={cn(
                "rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-all",
                duration === d.value
                  ? "border-lime-deep bg-lime text-ink"
                  : "border-ink bg-fill text-ink hover:bg-paper-alt",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Pista y nivel                                             */
/* ------------------------------------------------------------------ */

function Step3({
  court,
  setCourt,
  levelMin,
  setLevelMin,
  levelMax,
  setLevelMax,
  date,
  timeSlot,
}: {
  court: string | null;
  setCourt: (c: string) => void;
  levelMin: number;
  setLevelMin: (n: number) => void;
  levelMax: number;
  setLevelMax: (n: number) => void;
  date: string | null;
  timeSlot: string | null;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left — courts */}
      <div>
        <p className="mb-3 text-sm font-semibold text-ink-2">
          Pistas disponibles{" "}
          <span className="text-muted">
            · {date ?? "—"} · {timeSlot ?? "—"}
          </span>
        </p>
        <div className="flex flex-col gap-2">
          {COURTS.map((c) => {
            const selected = court === c.id;
            const occupied = !c.free;
            return (
              <button
                key={c.id}
                type="button"
                disabled={occupied}
                onClick={() => setCourt(c.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-[1.5px] p-3 text-left transition-all",
                  occupied && "opacity-50",
                  selected
                    ? "border-[2px] border-lime-deep bg-lime-soft shadow-neo-lime"
                    : "border-ink bg-fill hover:bg-paper-alt",
                )}
              >
                {/* placeholder court icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border-[1.2px] border-ink bg-paper-alt text-xs font-bold text-muted">
                  {c.name.split(" ")[1]}
                </div>

                <div className="flex-1">
                  <span className="text-sm font-bold text-ink">{c.name}</span>
                  <span className="ml-2 text-xs text-muted">{c.type}</span>
                </div>

                {/* badge */}
                <span
                  className={cn(
                    "rounded-full border-[1.2px] px-2 py-0.5 text-[10px] font-bold uppercase",
                    c.free
                      ? "border-lime-deep bg-lime-soft text-lime-deep"
                      : "border-ink bg-fill-alt text-muted",
                  )}
                >
                  {c.free ? "LIBRE" : "OCUPADA"}
                </span>

                {selected && (
                  <span className="text-xs text-lime-deep">&#10003;</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right — level range */}
      <div>
        <p className="mb-3 text-sm font-semibold text-ink-2">
          Nivel objetivo (rango)
        </p>
        <NeoCard className="space-y-5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest2 text-muted">
                Min
              </p>
              <LevelBalls value={levelMin} size={12} />
              <p className="mt-1 font-hand text-xs text-ink-2">
                Nivel {levelMin}
              </p>
            </div>

            {/* range bar */}
            <div className="mx-3 flex-1">
              <div className="relative h-1 rounded-sm border border-ink bg-fill">
                <div
                  className="absolute inset-y-[-1px] rounded-sm border border-ink bg-lime"
                  style={{
                    left: `${((levelMin - 1) / 4) * 100}%`,
                    right: `${((5 - levelMax) / 4) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="text-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest2 text-muted">
                Max
              </p>
              <LevelBalls value={levelMax} size={12} />
              <p className="mt-1 font-hand text-xs text-ink-2">
                Nivel {levelMax}
              </p>
            </div>
          </div>

          {/* Level adjusters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLevelMin(Math.max(1, levelMin - 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full border-[1.2px] border-ink bg-fill text-xs font-bold text-ink hover:bg-paper-alt"
              >
                -
              </button>
              <span className="text-xs font-semibold text-ink">
                Min: {levelMin}
              </span>
              <button
                type="button"
                onClick={() =>
                  setLevelMin(Math.min(levelMax, levelMin + 1))
                }
                className="flex h-6 w-6 items-center justify-center rounded-full border-[1.2px] border-ink bg-fill text-xs font-bold text-ink hover:bg-paper-alt"
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setLevelMax(Math.max(levelMin, levelMax - 1))
                }
                className="flex h-6 w-6 items-center justify-center rounded-full border-[1.2px] border-ink bg-fill text-xs font-bold text-ink hover:bg-paper-alt"
              >
                -
              </button>
              <span className="text-xs font-semibold text-ink">
                Max: {levelMax}
              </span>
              <button
                type="button"
                onClick={() => setLevelMax(Math.min(5, levelMax + 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full border-[1.2px] border-ink bg-fill text-xs font-bold text-ink hover:bg-paper-alt"
              >
                +
              </button>
            </div>
          </div>

          <p className="text-xs text-muted">
            Solo veran y podran unirse jugadores dentro de este rango de
            nivel.
          </p>
        </NeoCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Plazas y notas                                            */
/* ------------------------------------------------------------------ */

function Step4({
  state,
  setPlayers,
  setPrice,
  setNotes,
}: {
  state: WizardState;
  setPlayers: (p: 2 | 4) => void;
  setPrice: (v: string) => void;
  setNotes: (v: string) => void;
}) {
  const courtObj = COURTS.find((c) => c.id === state.court);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left — plazas & notes */}
      <div className="space-y-5">
        {/* Players */}
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-2">Plazas</p>
          <div className="flex gap-2">
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPlayers(n)}
                className={cn(
                  "rounded-full border-[1.5px] px-4 py-1.5 text-xs font-semibold transition-all",
                  state.players === n
                    ? "border-lime-deep bg-lime text-ink"
                    : "border-ink bg-fill text-ink hover:bg-paper-alt",
                )}
              >
                {n} jugadores
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-2">
            Precio por jugador
          </p>
          <div className="flex items-center rounded-lg border-[1.5px] border-ink bg-fill px-4 py-2.5">
            <input
              type="text"
              value={state.price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted"
              placeholder="8,00"
            />
            <span className="ml-1 text-sm font-bold text-ink">&euro;</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-2">
            Notas (opcional)
          </p>
          <textarea
            value={state.notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ej: Llevo pelotas. Cancelo si llueve."
            className="w-full rounded-lg border-[1.5px] border-ink bg-fill px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
      </div>

      {/* Right — summary card */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest2 text-muted">
          RESUMEN
        </p>
        <NeoCard accent className="space-y-3 p-4">
          {/* Category chip */}
          {state.category && <CatChip cat={state.category} />}

          {/* Date & time heading */}
          <p className="text-sm font-bold text-ink">
            {state.date ?? "—"} · {state.timeSlot ?? "—"}
          </p>

          {/* Duration & court */}
          <p className="text-xs text-ink-2">
            {state.duration} min ·{" "}
            {courtObj ? `${courtObj.name} · ${courtObj.type}` : "—"}
          </p>

          {/* Level range */}
          <div className="flex items-center gap-2">
            <LevelBalls value={state.levelMin} size={10} />
            <span className="font-hand text-xs text-ink-2">—</span>
            <LevelBalls value={state.levelMax} size={10} />
          </div>

          {/* Avatars */}
          <div className="flex items-center gap-2">
            <AvatarRow
              avatars={["Yo"]}
              empty={state.players - 1}
              size={26}
            />
            <span className="text-xs text-muted">
              {state.players - 1} plaza{state.players - 1 !== 1 && "s"} libre
              {state.players - 1 !== 1 && "s"}
            </span>
          </div>

          {/* Price */}
          {state.price && (
            <p className="text-xs text-muted">
              Precio: {state.price} &euro; / jugador
            </p>
          )}
        </NeoCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function NuevaPachangaPage() {
  const router = useRouter();
  const [state, setState] = useState<WizardState>({
    step: 1,
    category: null,
    date: null,
    timeSlot: null,
    duration: 90,
    court: null,
    levelMin: 2,
    levelMax: 4,
    players: 4,
    price: "8,00",
    notes: "",
  });
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  function patch(partial: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function goNext() {
    if (state.step < 4) {
      patch({ step: (state.step + 1) as WizardState["step"] });
    }
  }

  function goBack() {
    if (state.step > 1) {
      patch({ step: (state.step - 1) as WizardState["step"] });
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError("");

    const selectedDay = DAY_OPTIONS.find((d) => d.value === state.date);
    const dayLabel = selectedDay?.label ?? "HOY";
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const dayNum = parseInt(dayLabel.split(" ")[1]) || now.getDate();
    const [hours, minutes] = (state.timeSlot ?? "19:00").split(":").map(Number);
    const pachangaDate = new Date(year, month, dayNum, hours, minutes);

    try {
      const res = await fetch("/api/pachangas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: state.category,
          date: pachangaDate.toISOString(),
          duration: state.duration,
          courtId: state.court,
          levelMin: state.levelMin,
          levelMax: state.levelMax,
          maxPlayers: state.players,
          price: parseFloat(state.price.replace(",", ".")) || 0,
          notes: state.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear");
      }

      const pachanga = await res.json();
      router.push(`/pachangas/${pachanga.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al publicar");
      setPublishing(false);
    }
  }

  return (
    <>
      <SiteHeader variant="paper" />

      <main className="min-h-screen bg-paper pb-28">
        {/* Top bar */}
        <div className="container py-4">
          <Link
            href="/pachangas"
            className="text-sm font-medium text-ink-2 hover:text-ink"
          >
            &larr; cancelar
          </Link>
          <h1 className="mt-2 text-xl font-extrabold text-ink">
            Nueva pachanga
          </h1>
        </div>

        {/* Step indicator */}
        <StepIndicator step={state.step} />

        {/* Step content */}
        <div className="container">
          {state.step === 1 && (
            <Step1
              category={state.category}
              setCategory={(c) => patch({ category: c })}
            />
          )}
          {state.step === 2 && (
            <Step2
              date={state.date}
              setDate={(d) => patch({ date: d })}
              timeSlot={state.timeSlot}
              setTimeSlot={(t) => patch({ timeSlot: t })}
              duration={state.duration}
              setDuration={(d) => patch({ duration: d })}
            />
          )}
          {state.step === 3 && (
            <Step3
              court={state.court}
              setCourt={(c) => patch({ court: c })}
              levelMin={state.levelMin}
              setLevelMin={(n) => patch({ levelMin: n })}
              levelMax={state.levelMax}
              setLevelMax={(n) => patch({ levelMax: n })}
              date={state.date}
              timeSlot={state.timeSlot}
            />
          )}
          {state.step === 4 && (
            <Step4
              state={state}
              setPlayers={(p) => patch({ players: p })}
              setPrice={(v) => patch({ price: v })}
              setNotes={(v) => patch({ notes: v })}
            />
          )}
        </div>
      </main>

      {/* Sticky footer bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-[1.5px] border-ink bg-paper">
        <div className="container flex items-center justify-between py-3">
          <span className="font-hand text-sm text-muted">
            paso {state.step} de 4
          </span>
          <div className="flex items-center gap-2">
            {state.step > 1 && (
              <NeoButton variant="ghost" size="sm" onClick={goBack}>
                Atras
              </NeoButton>
            )}
            {state.step < 4 ? (
              <NeoButton
                size="sm"
                disabled={!canAdvance(state)}
                onClick={goNext}
              >
                Siguiente
              </NeoButton>
            ) : (
              <NeoButton
                size="sm"
                disabled={!canAdvance(state) || publishing}
                onClick={handlePublish}
              >
                {publishing ? "Publicando…" : "Publicar pachanga ✓"}
              </NeoButton>
            )}
            {error && (
              <span className="text-xs text-rose">{error}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
