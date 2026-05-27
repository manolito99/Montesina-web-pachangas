"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Category = "M" | "F" | "X";
type Format = "AMERICANO" | "MEXICANO";

interface PlayerInfo {
  id: string;
  name: string;
  level: number;
  gender: string;
}

interface CourtFromApi {
  id: string;
  name: string;
  type: "INDOOR" | "OUTDOOR";
  location: string | null;
  address: string | null;
  isClub: boolean;
}

interface WizardState {
  step: 1 | 2 | 3 | 4;
  format: Format | null;
  category: Category | null;
  name: string;
  pointsPerMatch: 21 | 24 | 32;
  courtIds: string[];
  notes: string;
  playerIds: string[];
  players: PlayerInfo[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEP_LABELS = ["Formato", "Configuracion", "Jugadores", "Resumen"];

const CATEGORY_META: Record<Category, { label: string; desc: string }> = {
  M: { label: "Masculino", desc: "Solo hombres" },
  F: { label: "Femenino", desc: "Solo mujeres" },
  X: { label: "Mixto", desc: "Hombres y mujeres" },
};

const FORMAT_META: Record<Format, { label: string; desc: string }> = {
  AMERICANO: {
    label: "Americano",
    desc: "Parejas rotativas, todos contra todos",
  },
  MEXICANO: {
    label: "Mexicano",
    desc: "Parejas por nivel tras cada ronda",
  },
};

const POINTS_OPTIONS: (21 | 24 | 32)[] = [21, 24, 32];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function canAdvance(s: WizardState): boolean {
  switch (s.step) {
    case 1:
      return s.format !== null && s.category !== null;
    case 2:
      return s.name.trim().length > 0;
    case 3:
      return s.players.length >= 4;
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
/*  Step 1 — Formato y Categoria                                       */
/* ------------------------------------------------------------------ */

function Step1({
  format,
  setFormat,
  category,
  setCategory,
  userGender,
}: {
  format: Format | null;
  setFormat: (f: Format) => void;
  category: Category | null;
  setCategory: (c: Category) => void;
  userGender: "MALE" | "FEMALE";
}) {
  const cats: Category[] = userGender === "MALE" ? ["M", "X"] : ["F", "X"];

  return (
    <div className="space-y-8">
      {/* Format selection */}
      <div>
        <p className="mb-4 text-center text-sm font-semibold text-ink-2">
          Elige el formato del torneo
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(["AMERICANO", "MEXICANO"] as const).map((f) => {
            const selected = format === f;
            const meta = FORMAT_META[f];
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-lg border-[1.5px] p-6 text-center transition-all",
                  selected
                    ? "border-[2px] border-lime-deep bg-lime-soft shadow-neo-lime"
                    : "border-ink bg-fill hover:bg-paper-alt",
                )}
              >
                {selected && (
                  <span className="absolute right-3 top-3 text-xs text-lime-deep">
                    &#10003;
                  </span>
                )}
                <span className="text-2xl font-extrabold text-ink">
                  {f === "AMERICANO" ? "🏆" : "🌶️"}
                </span>
                <span className="text-base font-bold text-ink">
                  {meta.label}
                </span>
                <span className="text-xs text-muted">{meta.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category selection */}
      <div>
        <p className="mb-4 text-center text-sm font-semibold text-ink-2">
          Categoria
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Configuracion                                             */
/* ------------------------------------------------------------------ */

function Step2({
  name,
  setName,
  pointsPerMatch,
  setPointsPerMatch,
  courtIds,
  toggleCourt,
  notes,
  setNotes,
  courts,
}: {
  name: string;
  setName: (v: string) => void;
  pointsPerMatch: 21 | 24 | 32;
  setPointsPerMatch: (v: 21 | 24 | 32) => void;
  courtIds: string[];
  toggleCourt: (id: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  courts: CourtFromApi[];
}) {
  const clubCourts = courts.filter((c) => c.isClub);
  const customCourts = courts.filter((c) => !c.isClub);

  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <label className="block font-sans">
          <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
            Nombre del torneo
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Americano del sabado"
            className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime focus:ring-offset-1"
          />
        </label>
      </div>

      {/* Points per match */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-2">
          Puntos por partido
        </p>
        <div className="flex gap-2">
          {POINTS_OPTIONS.map((pts) => (
            <button
              key={pts}
              type="button"
              onClick={() => setPointsPerMatch(pts)}
              className={cn(
                "rounded-full border-[1.5px] px-4 py-1.5 text-xs font-semibold transition-all",
                pointsPerMatch === pts
                  ? "border-lime-deep bg-lime text-ink"
                  : "border-ink bg-fill text-ink hover:bg-paper-alt",
              )}
            >
              {pts} pts
            </button>
          ))}
        </div>
      </div>

      {/* Courts multi-select */}
      <div>
        <p className="mb-3 text-sm font-semibold text-ink-2">
          Pistas (puedes elegir varias)
        </p>

        {clubCourts.length > 0 && (
          <div className="mb-2">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest2 text-muted">
              Pistas del club
            </p>
            <div className="flex flex-col gap-2">
              {clubCourts.map((c) => (
                <CourtCheckbox
                  key={c.id}
                  court={c}
                  checked={courtIds.includes(c.id)}
                  onToggle={toggleCourt}
                />
              ))}
            </div>
          </div>
        )}

        {customCourts.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest2 text-muted">
              Otras pistas
            </p>
            <div className="flex flex-col gap-2">
              {customCourts.map((c) => (
                <CourtCheckbox
                  key={c.id}
                  court={c}
                  checked={courtIds.includes(c.id)}
                  onToggle={toggleCourt}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block font-sans">
          <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
            Notas (opcional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ej: Traer pelotas. Empezamos puntuales."
            className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime focus:ring-offset-1"
          />
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Court checkbox row                                                 */
/* ------------------------------------------------------------------ */

function CourtCheckbox({
  court,
  checked,
  onToggle,
}: {
  court: CourtFromApi;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(court.id)}
      className={cn(
        "flex items-center gap-3 rounded-lg border-[1.5px] p-3 text-left transition-all",
        checked
          ? "border-[2px] border-lime-deep bg-lime-soft shadow-neo-lime"
          : "border-ink bg-fill hover:bg-paper-alt",
      )}
    >
      {/* Checkbox indicator */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-[1.5px]",
          checked
            ? "border-lime-deep bg-lime text-ink"
            : "border-ink bg-fill",
        )}
      >
        {checked && <span className="text-[10px] font-bold">&#10003;</span>}
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border-[1.2px] border-ink bg-paper-alt text-xs font-bold text-muted">
        {court.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink truncate">
            {court.name}
          </span>
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
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Jugadores                                                 */
/* ------------------------------------------------------------------ */

function Step3({
  category,
  players,
  addPlayer,
  removePlayer,
  organizerName,
}: {
  category: Category | null;
  players: PlayerInfo[];
  addPlayer: (p: PlayerInfo) => void;
  removePlayer: (id: string) => void;
  organizerName: string;
}) {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState<PlayerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const genderParam =
      category === "M" ? "MALE" : category === "F" ? "FEMALE" : "";
    const url = `/api/users/search?q=${genderParam ? `&gender=${genderParam}` : ""}`;
    fetch(url)
      .then((r) => r.ok ? r.json() : [])
      .then(setAllUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  const playerIdSet = new Set(players.map((p) => p.id));
  const q = query.trim().toLowerCase();
  const results = allUsers.filter((u) =>
    !playerIdSet.has(u.id) && (!q || u.name.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div>
        <label className="block font-sans">
          <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
            Buscar jugadores
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre del jugador..."
            className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime focus:ring-offset-1"
          />
        </label>
      </div>

      {/* Available players */}
      {loading ? (
        <p className="text-xs text-muted">Cargando jugadores...</p>
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => addPlayer(user)}
              className="flex items-center gap-3 rounded-lg border-[1.5px] border-ink bg-fill p-3 text-left transition-all hover:bg-paper-alt"
            >
              <Avatar
                label={user.name.charAt(0).toUpperCase()}
                size={36}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-ink truncate block">
                  {user.name}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  Nivel <LevelBalls value={user.level} size={8} />
                </span>
              </div>
              <span className="text-xs font-semibold text-lime-deep">
                + Agregar
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted">
          {allUsers.length === 0 ? "No hay jugadores registrados." : "Todos los jugadores ya estan en la lista."}
        </p>
      )}

      {/* Selected players */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-2">
          Jugadores seleccionados ({players.length})
        </p>
        {players.length < 4 && (
          <p className="mb-3 text-xs text-muted">
            Minimo 4 jugadores para crear el torneo.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {/* Organizer is always first and cannot be removed */}
          <div className="flex items-center gap-3 rounded-lg border-[1.5px] border-ink bg-fill p-3">
            <Avatar
              label={organizerName.charAt(0).toUpperCase()}
              size={36}
              lime
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-ink truncate block">
                {organizerName}
              </span>
              <span className="text-xs text-muted">Organizador</span>
            </div>
          </div>

          {/* Other selected players */}
          {players
            .filter((_, idx) => idx > 0)
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border-[1.5px] border-ink bg-fill p-3"
              >
                <Avatar
                  label={p.name.charAt(0).toUpperCase()}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-ink truncate block">
                    {p.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    Nivel <LevelBalls value={p.level} size={8} />
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removePlayer(p.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-[1.2px] border-ink bg-fill text-xs font-bold text-ink hover:bg-paper-alt"
                  aria-label={`Quitar a ${p.name}`}
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Resumen                                                   */
/* ------------------------------------------------------------------ */

function Step4({
  state,
  courts,
}: {
  state: WizardState;
  courts: CourtFromApi[];
}) {
  const selectedCourts = courts.filter((c) => state.courtIds.includes(c.id));

  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest2 text-muted">
        RESUMEN DEL TORNEO
      </p>
      <NeoCard accent className="space-y-4 p-5">
        {/* Name */}
        <p className="text-lg font-extrabold text-ink">
          {state.name || "Sin nombre"}
        </p>

        {/* Format */}
        <div className="flex items-center gap-2">
          <span className="rounded border-[1.5px] border-ink bg-paper-alt px-2 py-0.5 text-xs font-bold text-ink">
            {state.format ?? "---"}
          </span>
          {state.category && <CatChip cat={state.category} />}
        </div>

        {/* Points */}
        <p className="text-sm text-ink-2">
          <span className="font-semibold">{state.pointsPerMatch}</span> puntos
          por partido
        </p>

        {/* Courts */}
        {selectedCourts.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest2 text-muted">
              Pistas
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCourts.map((c) => (
                <span
                  key={c.id}
                  className="rounded border-[1.2px] border-ink bg-paper-alt px-2 py-0.5 text-xs font-semibold text-ink"
                >
                  {c.name}
                  {c.isClub && (
                    <span className="ml-1 text-[9px] text-lime-deep">
                      CLUB
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Players */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest2 text-muted">
            Jugadores ({state.players.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {state.players.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <Avatar
                  label={p.name.charAt(0).toUpperCase()}
                  size={24}
                  lime={idx === 0}
                />
                <span className="text-xs font-semibold text-ink">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {state.notes.trim() && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest2 text-muted">
              Notas
            </p>
            <p className="text-sm text-ink-2">{state.notes}</p>
          </div>
        )}
      </NeoCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function NuevoTorneoPage() {
  const router = useRouter();
  const { status: authStatus, data: session } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/torneos/nuevo");
    }
  }, [authStatus, router]);

  const [state, setState] = useState<WizardState>({
    step: 1,
    format: null,
    category: null,
    name: "",
    pointsPerMatch: 21,
    courtIds: [],
    notes: "",
    playerIds: [],
    players: [],
  });
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [courts, setCourts] = useState<CourtFromApi[]>([]);
  const [userGender, setUserGender] = useState<"MALE" | "FEMALE">("MALE");
  const [organizerName, setOrganizerName] = useState("Yo");
  const [organizerLoaded, setOrganizerLoaded] = useState(false);

  // Fetch user profile to get gender and organizer info
  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.user?.gender) setUserGender(data.user.gender);
          if (data.user?.name) setOrganizerName(data.user.name);
          if (data.user?.id && !organizerLoaded) {
            setState((prev) => {
              // Only set organizer if not already set
              if (prev.players.length === 0) {
                return {
                  ...prev,
                  playerIds: [data.user.id],
                  players: [
                    {
                      id: data.user.id,
                      name: data.user.name ?? "Yo",
                      level: data.user.level ?? 3,
                      gender: data.user.gender ?? "MALE",
                    },
                  ],
                };
              }
              return prev;
            });
            setOrganizerLoaded(true);
          }
        })
        .catch(() => {});
    }
  }, [authStatus, organizerLoaded]);

  // Fetch courts
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

  const toggleCourt = useCallback((courtId: string) => {
    setState((prev) => {
      const exists = prev.courtIds.includes(courtId);
      return {
        ...prev,
        courtIds: exists
          ? prev.courtIds.filter((id) => id !== courtId)
          : [...prev.courtIds, courtId],
      };
    });
  }, []);

  const addPlayer = useCallback((player: PlayerInfo) => {
    setState((prev) => {
      if (prev.playerIds.includes(player.id)) return prev;
      return {
        ...prev,
        playerIds: [...prev.playerIds, player.id],
        players: [...prev.players, player],
      };
    });
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setState((prev) => {
      // Cannot remove the organizer (index 0)
      if (prev.players.length > 0 && prev.players[0].id === playerId) {
        return prev;
      }
      return {
        ...prev,
        playerIds: prev.playerIds.filter((id) => id !== playerId),
        players: prev.players.filter((p) => p.id !== playerId),
      };
    });
  }, []);

  async function handlePublish() {
    setPublishing(true);
    setError("");

    try {
      const res = await fetch("/api/torneos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name.trim(),
          format: state.format,
          category: state.category,
          pointsPerMatch: state.pointsPerMatch,
          courtIds: state.courtIds,
          notes: state.notes.trim() || null,
          playerIds: state.playerIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear el torneo");
      }

      const torneo = await res.json();
      router.push(`/torneos/${torneo.id}`);
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

      <main className="min-h-screen bg-paper pb-40">
        {/* Top bar */}
        <div className="container py-4">
          <Link
            href="/pachangas"
            className="text-sm font-medium text-ink-2 hover:text-ink"
          >
            &larr; cancelar
          </Link>
          <h1 className="mt-2 text-xl font-extrabold text-ink">
            Nuevo torneo
          </h1>
        </div>

        {/* Step indicator */}
        <StepIndicator step={state.step} />

        {/* Step content */}
        <div className="container">
          {state.step === 1 && (
            <Step1
              format={state.format}
              setFormat={(f) => patch({ format: f })}
              category={state.category}
              setCategory={(c) => patch({ category: c })}
              userGender={userGender}
            />
          )}
          {state.step === 2 && (
            <Step2
              name={state.name}
              setName={(v) => patch({ name: v })}
              pointsPerMatch={state.pointsPerMatch}
              setPointsPerMatch={(v) => patch({ pointsPerMatch: v })}
              courtIds={state.courtIds}
              toggleCourt={toggleCourt}
              notes={state.notes}
              setNotes={(v) => patch({ notes: v })}
              courts={courts}
            />
          )}
          {state.step === 3 && (
            <Step3
              category={state.category}
              players={state.players}
              addPlayer={addPlayer}
              removePlayer={removePlayer}
              organizerName={organizerName}
            />
          )}
          {state.step === 4 && (
            <Step4 state={state} courts={courts} />
          )}
        </div>
      </main>

      {/* Sticky footer bar — bottom-[68px] on mobile to clear body padding for tab bar */}
      <div className="fixed inset-x-0 bottom-[68px] z-30 border-t-[1.5px] border-ink bg-paper md:bottom-0">
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
                {publishing ? "Creando..." : "Crear torneo ✓"}
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
