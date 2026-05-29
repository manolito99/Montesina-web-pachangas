"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { CatChip } from "@/components/ui/cat-chip";
import { LevelBalls } from "@/components/ui/level-balls";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { AvatarRow } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CourtFromApi {
  id: string;
  name: string;
  type: "INDOOR" | "OUTDOOR";
  location: string | null;
  address: string | null;
  isClub: boolean;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Category = "M" | "F" | "X";

interface WizardState {
  step: 1 | 2 | 3 | 4;
  category: Category | null;
  date: string | null;
  timeSlot: string | null;
  duration: number;
  court: string | null;
  levelMin: number;
  levelMax: number;
  players: 2 | 4;
  price: string;
  notes: string;
}

/* ------------------------------------------------------------------ */
/*  Dynamic day & time options                                         */
/* ------------------------------------------------------------------ */

const DAY_NAMES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"] as const;

function buildDayOptions(): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayName = i === 0 ? "HOY" : i === 1 ? "MAÑANA" : DAY_NAMES[d.getDay()];
    const num = d.getDate();
    const iso = d.toISOString().split("T")[0];
    days.push({ label: `${dayName} ${num}`, value: iso });
  }
  return days;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function addMinutes(h: number, m: number, mins: number): [number, number] {
  const total = h * 60 + m + mins;
  return [Math.floor(total / 60) % 24, total % 60];
}

function buildTimeSlots(): { label: string; value: string }[] {
  const starts = [
    [8, 0], [9, 30], [11, 0], [12, 30], [14, 0],
    [15, 30], [17, 0], [18, 30], [20, 0], [21, 30],
  ];
  return starts.map(([h, m]) => {
    const [eh, em] = addMinutes(h, m, 90);
    return {
      label: `${pad(h)}:${pad(m)} — ${pad(eh)}:${pad(em)}`,
      value: `${pad(h)}:${pad(m)}`,
    };
  });
}

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
  userGender,
}: {
  category: Category | null;
  setCategory: (c: Category) => void;
  userGender: "MALE" | "FEMALE";
}) {
  const cats: Category[] = userGender === "MALE" ? ["M", "X"] : ["F", "X"];

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
}: {
  date: string | null;
  setDate: (d: string) => void;
  timeSlot: string | null;
  setTimeSlot: (t: string) => void;
}) {
  const dayOptions = buildDayOptions();
  const timeSlots = buildTimeSlots();

  return (
    <div className="space-y-6">
      {/* Day pills */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-2">Elige día</p>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((d) => (
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

      {/* Time slot list */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-2">
          Franja horaria
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {timeSlots.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTimeSlot(t.value)}
              className={cn(
                "rounded-lg border-[1.5px] px-3 py-2.5 text-center text-sm font-semibold transition-all",
                timeSlot === t.value
                  ? "border-[2px] border-lime-deep bg-lime text-ink"
                  : "border-ink bg-fill text-ink hover:bg-paper-alt",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration info */}
      <p className="text-xs text-muted">
        Cada tramo dura 1h 30min (90 minutos).
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Court row                                                          */
/* ------------------------------------------------------------------ */

function CourtRow({
  court,
  selected,
  onSelect,
}: {
  court: CourtFromApi;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(court.id)}
      className={cn(
        "flex items-center gap-3 rounded-lg border-[1.5px] p-3 text-left transition-all",
        selected
          ? "border-[2px] border-lime-deep bg-lime-soft shadow-neo-lime"
          : "border-ink bg-fill hover:bg-paper-alt",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border-[1.2px] border-ink bg-paper-alt text-xs font-bold text-muted">
        {court.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink truncate">{court.name}</span>
          {court.isClub && (
            <span className="shrink-0 rounded border-[1px] border-lime-deep bg-lime-soft px-1.5 py-px text-[9px] font-bold text-lime-deep">
              CLUB
            </span>
          )}
        </div>
        <span className="text-xs text-muted">
          {court.type.toLowerCase()}
          {court.location && ` · ${court.location}`}
        </span>
      </div>
      {selected && <span className="text-xs text-lime-deep">✓</span>}
    </button>
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
  courts,
}: {
  court: string | null;
  setCourt: (c: string) => void;
  levelMin: number;
  setLevelMin: (n: number) => void;
  levelMax: number;
  setLevelMax: (n: number) => void;
  date: string | null;
  timeSlot: string | null;
  courts: CourtFromApi[];
}) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"INDOOR" | "OUTDOOR">("OUTDOOR");
  const [newLocation, setNewLocation] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreateCourt() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType,
          location: newLocation.trim() || null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        courts.push(created);
        setCourt(created.id);
        setShowNewForm(false);
        setNewName("");
        setNewLocation("");
      }
    } catch { /* ignore */ }
    setCreating(false);
  }

  const clubCourts = courts.filter((c) => c.isClub);
  const customCourts = courts.filter((c) => !c.isClub);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left — courts */}
      <div>
        <p className="mb-3 text-sm font-semibold text-ink-2">
          Pistas del club
        </p>
        <div className="flex flex-col gap-2">
          {clubCourts.map((c) => (
            <CourtRow key={c.id} court={c} selected={court === c.id} onSelect={setCourt} />
          ))}
        </div>

        {customCourts.length > 0 && (
          <>
            <p className="mb-2 mt-5 text-sm font-semibold text-ink-2">
              Otras pistas
            </p>
            <div className="flex flex-col gap-2">
              {customCourts.map((c) => (
                <CourtRow key={c.id} court={c} selected={court === c.id} onSelect={setCourt} />
              ))}
            </div>
          </>
        )}

        {!showNewForm ? (
          <button
            type="button"
            onClick={() => setShowNewForm(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-muted p-3 text-sm font-semibold text-muted transition-colors hover:border-ink hover:text-ink"
          >
            + Añadir otra pista
          </button>
        ) : (
          <div className="mt-3 rounded-lg border-[1.5px] border-ink bg-fill p-4 space-y-3">
            <p className="text-sm font-bold text-ink">Nueva pista</p>
            <input
              type="text"
              placeholder="Nombre de la pista"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-md border-[1.5px] border-ink bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-lime"
            />
            <div className="flex gap-2">
              {(["OUTDOOR", "INDOOR"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewType(t)}
                  className={cn(
                    "flex-1 rounded-full border-[1.5px] py-1.5 text-xs font-semibold",
                    newType === t ? "border-lime-deep bg-lime text-ink" : "border-ink bg-fill text-ink",
                  )}
                >
                  {t === "OUTDOOR" ? "Outdoor" : "Indoor"}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Ubicación (opcional)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full rounded-md border-[1.5px] border-ink bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-lime"
            />
            <div className="flex gap-2">
              <NeoButton size="sm" onClick={handleCreateCourt} disabled={!newName.trim() || creating}>
                {creating ? "Creando..." : "Crear pista"}
              </NeoButton>
              <NeoButton size="sm" variant="ghost" onClick={() => setShowNewForm(false)}>
                Cancelar
              </NeoButton>
            </div>
          </div>
        )}
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
  courts,
}: {
  state: WizardState;
  setPlayers: (p: 2 | 4) => void;
  setPrice: (v: string) => void;
  setNotes: (v: string) => void;
  courts: CourtFromApi[];
}) {
  const courtObj = courts.find((c) => c.id === state.court);

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
  const { status: authStatus } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/pachangas/nueva");
    }
  }, [authStatus, router]);

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
  const [courts, setCourts] = useState<CourtFromApi[]>([]);
  const [userGender, setUserGender] = useState<"MALE" | "FEMALE">("MALE");

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => { if (data.user?.gender) setUserGender(data.user.gender); })
        .catch(() => {});
    }
  }, [authStatus]);

  useEffect(() => {
    fetch("/api/courts")
      .then((r) => r.json())
      .then(setCourts)
      .catch(() => {});
  }, []);

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

    const [hours, minutes] = (state.timeSlot ?? "19:00").split(":").map(Number);
    const pachangaDate = new Date(state.date + "T00:00:00");
    pachangaDate.setHours(hours, minutes, 0, 0);

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

  if (authStatus !== "authenticated") {
    return (
      <>
        <SiteHeader variant="paper" />
        <main className="flex min-h-[60vh] items-center justify-center bg-paper">
          <p className="font-hand text-muted">Cargando...</p>
        </main>
        <SiteFooter />
        <MobileTabs active="Pachangas" />
      </>
    );
  }

  return (
    <>
      <SiteHeader variant="paper" />

      <main className="min-h-screen bg-paper pb-32">
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
              userGender={userGender}
            />
          )}
          {state.step === 2 && (
            <Step2
              date={state.date}
              setDate={(d) => patch({ date: d })}
              timeSlot={state.timeSlot}
              setTimeSlot={(t) => patch({ timeSlot: t })}
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
              courts={courts}
            />
          )}
          {state.step === 4 && (
            <Step4
              state={state}
              setPlayers={(p) => patch({ players: p })}
              setPrice={(v) => patch({ price: v })}
              setNotes={(v) => patch({ notes: v })}
              courts={courts}
            />
          )}
        </div>
      </main>

      {/* Sticky footer bar — pegado al borde inferior con padding safe-area para iPhones */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-[1.5px] border-ink bg-paper" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
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
