"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { CatChip, CATEGORY_LABEL } from "@/components/ui/cat-chip";
import { LevelBalls } from "@/components/ui/level-balls";
import { Avatar, AvatarRow } from "@/components/ui/avatar";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { StatBox } from "@/components/ui/stat-box";
import { ChatMessage } from "@/components/ui/chat-message";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   Types (match API response shape)
   ────────────────────────────────────────────── */

interface Court {
  id: string;
  name: string;
  type: "INDOOR" | "OUTDOOR";
}

interface UserBasic {
  id: string;
  name: string;
  level: number;
}

interface Participation {
  id: string;
  userId: string | null;
  guestName: string | null;
  status: "CONFIRMED" | "WAITLIST" | "CANCELLED";
  position: number | null;
  user: (UserBasic & { gender: "MALE" | "FEMALE" }) | null;
}

// Display helpers para soportar tanto usuarios registrados como externos (guests)
function pName(p: Participation): string {
  return p.user?.name ?? p.guestName ?? "?";
}
function pLevel(p: Participation): number {
  return p.user?.level ?? 3;
}
function pGender(p: Participation): "MALE" | "FEMALE" | null {
  return p.user?.gender ?? null;
}
function isGuest(p: Participation): boolean {
  return !p.userId && !!p.guestName;
}

interface ChatMsg {
  id: string;
  text: string;
  userId: string;
  user: { id: string; name: string };
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
}

interface PachangaData {
  id: string;
  category: "M" | "F" | "X";
  date: string;
  duration: number;
  courtId: string;
  court: Court;
  levelMin: number;
  levelMax: number;
  maxPlayers: number;
  price: string;
  notes: string | null;
  status: "OPEN" | "FULL" | "CANCELLED" | "FINISHED";
  organizerId: string;
  organizer: UserBasic;
  participations: Participation[];
  chatMessages: ChatMsg[];
  createdAt: string;
}

/* ──────────────────────────────────────────────
   Constants & helpers
   ────────────────────────────────────────────── */

// userId comes from session, passed into components

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"] as const;

function formatDateRange(iso: string, durationMinutes: number): string {
  const d = new Date(iso);
  const dayName = DAY_NAMES[d.getDay()];
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const end = new Date(d.getTime() + durationMinutes * 60_000);
  const ehh = String(end.getHours()).padStart(2, "0");
  const emm = String(end.getMinutes()).padStart(2, "0");
  return `${dayName} ${day} · ${hh}:${mm} — ${ehh}:${emm}`;
}

function formatPrice(decimal: string): string {
  const n = parseFloat(decimal);
  return Number.isInteger(n) ? `${n}€` : `${n.toFixed(2)}€`;
}

function initial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function formatChatTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const MONTH_SHORT = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"] as const;

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return "Hoy";
  if (sameDay(d, yesterday)) return "Ayer";
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

const CAT_EMOJI: Record<string, string> = { M: "♂️", F: "♀️", X: "🔀" };
const CAT_NAME: Record<string, string> = { M: "Masculino", F: "Femenino", X: "Mixto" };

function buildShareText(data: PachangaData, plazasLibres: number): string {
  const date = formatDateRange(data.date, data.duration);
  const court = `${data.court.name} (${data.court.type.toLowerCase()})`;
  const cat = CAT_NAME[data.category] || data.category;
  const emoji = CAT_EMOJI[data.category] || "🎾";
  const price = formatPrice(data.price);
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/pachangas/${data.id}`;

  return [
    `${emoji} *Pachanga ${cat}*`,
    `📅 ${date}`,
    `📍 ${court}`,
    `💰 ${price}/jugador`,
    `👥 ${plazasLibres > 0 ? `Quedan ${plazasLibres} plaza${plazasLibres !== 1 ? "s" : ""}` : "COMPLETO (lista de espera)"}`,
    data.notes ? `📝 ${data.notes}` : "",
    "",
    `Apúntate aquí: ${link}`,
  ].filter(Boolean).join("\n");
}

function buildWhatsAppUrl(data: PachangaData, plazasLibres: number): string {
  return `https://wa.me/?text=${encodeURIComponent(buildShareText(data, plazasLibres))}`;
}

/* ──────────────────────────────────────────────
   Page component
   ────────────────────────────────────────────── */

export default function PachangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id ?? null;

  const [data, setData] = useState<PachangaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Chat state (lifted from ChatSection so the input/messages are shared
  // between the mobile and desktop renders of the section)
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const lastSeenRef = useRef<string | null>(null);

  const fetchPachanga = useCallback(async () => {
    try {
      const res = await fetch(`/api/pachangas/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const json: PachangaData = await res.json();
      setData(json);
      setChatMessages((prev) => {
        // Preserve in-flight optimistic messages so a refetch (e.g. after
        // join/leave or a re-render) doesn't wipe out a message the user is
        // currently sending — POST may still need to find its tempId.
        const serverIds = new Set(json.chatMessages.map((m) => m.id));
        const pendingOrFailed = prev.filter(
          (m) => (m.pending || m.failed) && !serverIds.has(m.id),
        );
        return [...json.chatMessages, ...pendingOrFailed];
      });
      const lastServer = json.chatMessages[json.chatMessages.length - 1];
      if (lastServer && (!lastSeenRef.current || lastServer.createdAt > lastSeenRef.current)) {
        lastSeenRef.current = lastServer.createdAt;
      }
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPachanga();
  }, [fetchPachanga]);

  // Poll chat every 5s while tab is visible; refresh immediately on visibility change
  useEffect(() => {
    if (!id || notFound) return;

    let cancelled = false;

    async function tick() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const qs = lastSeenRef.current
          ? `?after=${encodeURIComponent(lastSeenRef.current)}`
          : "";
        const res = await fetch(`/api/pachangas/${id}/chat${qs}`);
        if (!res.ok) return;
        const json: { messages: ChatMsg[] } = await res.json();
        if (cancelled || !json.messages.length) return;
        setChatMessages((prev) => {
          const known = new Set(prev.map((m) => m.id));
          const fresh = json.messages.filter((m) => !known.has(m.id));
          if (!fresh.length) return prev;
          const next = [...prev, ...fresh];
          lastSeenRef.current = next[next.length - 1].createdAt;
          return next;
        });
      } catch {
        /* ignore — next tick retries */
      }
    }

    const interval = setInterval(tick, 5000);
    const onVisibility = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [id, notFound]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;
      const tempId = `tmp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      const nowIso = new Date().toISOString();
      const optimistic: ChatMsg = {
        id: tempId,
        text: trimmed,
        userId: currentUserId ?? "",
        user: { id: currentUserId ?? "", name: session?.user?.name ?? "Tú" },
        createdAt: nowIso,
        pending: true,
      };
      setChatMessages((prev) => [...prev, optimistic]);
      try {
        const res = await fetch(`/api/pachangas/${id}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });
        if (!res.ok) {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...m, pending: false, failed: true } : m,
            ),
          );
          return false;
        }
        const real: ChatMsg = await res.json();
        setChatMessages((prev) => {
          const withoutTmp = prev.filter((m) => m.id !== tempId);
          // If a concurrent fetch already merged the real message, don't dup it.
          if (withoutTmp.some((m) => m.id === real.id)) return withoutTmp;
          return [...withoutTmp, real];
        });
        lastSeenRef.current = real.createdAt;
        return true;
      } catch {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, pending: false, failed: true } : m,
          ),
        );
        return false;
      }
    },
    [id, currentUserId, session?.user?.name],
  );

  const retryMessage = useCallback(
    async (failedId: string) => {
      const msg = chatMessages.find((m) => m.id === failedId);
      if (!msg) return;
      setChatMessages((prev) => prev.filter((m) => m.id !== failedId));
      await sendMessage(msg.text);
    },
    [chatMessages, sendMessage],
  );

  /* ── Join handler ── */
  const handleJoin = async () => {
    if (!currentUserId) {
      window.location.href = `/login?callbackUrl=/pachangas/${id}`;
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pachangas/${id}/join`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "No se pudo apuntar");
        return;
      }
      await fetchPachanga();
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Leave handler ── */
  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/pachangas/${id}/join`, { method: "DELETE" });
      await fetchPachanga();
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Delete handler (organizer only) ── */
  const handleDelete = async () => {
    if (!confirm("¿Seguro que quieres eliminar esta pachanga? Se notificará a todos los apuntados.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pachangas/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/pachangas");
      } else {
        const err = await res.json();
        alert(err.error || "No se pudo eliminar");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Organizer: convert M or F to mixed (X) ── */
  const handleConvertToMixed = async () => {
    if (!data) return;
    const fromLabel = data.category === "M" ? "masculino" : "femenino";
    const newGender = data.category === "M" ? "Las mujeres" : "Los hombres";
    if (
      !confirm(
        `Esta pachanga ${fromLabel} pasará a mixta. ${newGender} del club también podrán apuntarse y se les avisará.\n\nNo se añaden plazas: los nuevos apuntados irán a lista de espera si está completa.\n\n¿Confirmas?`,
      )
    ) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pachangas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "X" }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "No se pudo convertir la pachanga");
        return;
      }
      await fetchPachanga();
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Organizer: add guest player ── */
  const handleAddGuest = async (name: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pachangas/${id}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "No se pudo añadir al externo");
        return false;
      }
      await fetchPachanga();
      return true;
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Organizer: remove a participant (registered user or guest) ── */
  const handleRemoveParticipation = async (participationId: string, name: string) => {
    if (!confirm(`¿Quitar a ${name} de la pachanga?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pachangas/${id}/participations/${participationId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "No se pudo quitar");
        return;
      }
      await fetchPachanga();
    } finally {
      setActionLoading(false);
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
            <p className="font-hand text-sm text-muted">Cargando pachanga...</p>
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
            <p className="text-2xl font-extrabold text-ink">Pachanga no encontrada</p>
            <p className="mt-2 font-hand text-muted">
              La pachanga que buscas no existe o fue eliminada.
            </p>
            <Link
              href="/pachangas"
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
  const confirmed = data.participations.filter((p) => p.status === "CONFIRMED");
  const waitlist = data.participations.filter((p) => p.status === "WAITLIST");
  const isCompleto = confirmed.length >= data.maxPlayers;
  const hasJoined = data.participations.some(
    (p) =>
      p.userId === currentUserId &&
      (p.status === "CONFIRMED" || p.status === "WAITLIST"),
  );
  const plazasLibres = data.maxPlayers - confirmed.length;
  const avatarLabels = confirmed.map((p) => initial(pName(p)));
  const isOrganizer = currentUserId === data.organizerId;
  const canPost = isOrganizer || hasJoined;

  return (
    <>
      <SiteHeader variant="paper" active="Pachangas" />

      {/* ── Mobile top bar ── */}
      <div className="flex items-center gap-3 border-b-[1.5px] border-ink bg-paper px-4 py-3 md:hidden">
        <Link href="/pachangas" className="text-ink" aria-label="Volver">
          <span className="text-lg font-bold">&larr;</span>
        </Link>
        <span className="text-sm font-bold text-ink">
          Pachanga &middot; #{data.id.slice(0, 6)}
        </span>
      </div>

      <main className="min-h-screen bg-paper">
        {/* ── Desktop breadcrumb ── */}
        <div className="hidden border-b-[1.5px] border-ink bg-paper px-6 py-3 md:block">
          <Link
            href="/pachangas"
            className="font-hand text-sm text-muted hover:text-ink"
          >
            &larr; volver al listado
          </Link>
        </div>

        {/* ── Two-column layout (desktop) ── */}
        <div className="md:grid md:grid-cols-[1fr_320px]">
          {/* ════ Main content ════ */}
          <div className="p-4 md:p-6">
            <MainContent
              data={data}
              confirmed={confirmed}
              isCompleto={isCompleto}
              hasJoined={hasJoined}
              plazasLibres={plazasLibres}
              avatarLabels={avatarLabels}
              waitlist={waitlist}
              actionLoading={actionLoading}
              onJoin={handleJoin}
              onLeave={handleLeave}
              isOrganizer={isOrganizer}
              onDelete={handleDelete}
              onConvertToMixed={handleConvertToMixed}
              onAddGuest={handleAddGuest}
              onRemoveParticipation={handleRemoveParticipation}
            />
          </div>

          {/* ════ Sidebar (desktop) ════ */}
          <aside className="hidden border-l-[1.5px] border-ink md:block">
            <Sidebar
              data={data}
              waitlist={waitlist}
              isCompleto={isCompleto}
              currentUserId={currentUserId}
              messages={chatMessages}
              canPost={canPost}
              isLoggedIn={!!currentUserId}
              onSend={sendMessage}
              onRetry={retryMessage}
            />
          </aside>
        </div>

        {/* ── Mobile chat section ── */}
        <div className="border-t-[1.5px] border-ink p-4 md:hidden">
          <ChatSection
            messages={chatMessages}
            currentUserId={currentUserId}
            canPost={canPost}
            isLoggedIn={!!currentUserId}
            onSend={sendMessage}
            onRetry={retryMessage}
          />
        </div>

        {/* ── Mobile sticky CTA ── */}
        <div className="sticky bottom-[56px] z-30 border-t-[1.5px] border-ink bg-paper px-4 py-3 md:hidden">
          <CtaBar
            isCompleto={isCompleto}
            hasJoined={hasJoined}
            plazasLibres={plazasLibres}
            waitlistCount={waitlist.length}
            actionLoading={actionLoading}
            onJoin={handleJoin}
            onLeave={handleLeave}
          />
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

function MainContent({
  data,
  confirmed,
  isCompleto,
  hasJoined,
  plazasLibres,
  avatarLabels,
  waitlist,
  actionLoading,
  onJoin,
  onLeave,
  isOrganizer,
  onDelete,
  onConvertToMixed,
  onAddGuest,
  onRemoveParticipation,
}: {
  data: PachangaData;
  confirmed: Participation[];
  isCompleto: boolean;
  hasJoined: boolean;
  plazasLibres: number;
  avatarLabels: string[];
  waitlist: Participation[];
  actionLoading: boolean;
  onJoin: () => void;
  onLeave: () => void;
  isOrganizer: boolean;
  onDelete: () => void;
  onConvertToMixed: () => void;
  onAddGuest: (name: string) => Promise<boolean>;
  onRemoveParticipation: (participationId: string, name: string) => Promise<void>;
}) {
  const dateDisplay = formatDateRange(data.date, data.duration);
  const courtDisplay = `${data.court.name} · ${data.court.type.toLowerCase()}`;
  const priceDisplay = formatPrice(data.price);

  return (
    <div className="space-y-5">
      {/* Top row: chip + id + organizer */}
      <div className="flex flex-wrap items-center gap-2">
        <CatChip cat={data.category} />
        {isCompleto && (
          <span className="rounded border-[1.2px] border-ink bg-ink px-2 py-px text-[11px] font-bold uppercase tracking-widest2 text-paper">
            COMPLETO
          </span>
        )}
        <span className="text-sm font-bold text-ink">
          Pachanga &middot; #{data.id.slice(0, 6)}
        </span>
        <span className="ml-auto text-xs font-hand text-muted">
          creada por {data.organizer.name}
        </span>
      </div>

      {/* Large heading: date */}
      <div>
        <h1 className="text-xl font-extrabold text-ink md:text-2xl">
          {dateDisplay}
        </h1>
        <p className="mt-0.5 text-sm text-ink-2">{courtDisplay}</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="Categoria">
          {CATEGORY_LABEL[data.category]}
        </StatBox>
        <StatBox label="Nivel">
          <LevelBalls value={data.levelMin} size={12} />
          {data.levelMin !== data.levelMax && (
            <span className="ml-1 text-xs text-muted">
              — <LevelBalls value={data.levelMax} size={12} />
            </span>
          )}
        </StatBox>
        <StatBox label="Plazas">
          <span className="flex items-center gap-2">
            <span>{confirmed.length}/{data.maxPlayers}</span>
            <AvatarRow
              avatars={avatarLabels}
              empty={plazasLibres > 0 ? plazasLibres : 0}
              size={20}
            />
          </span>
        </StatBox>
        <StatBox label="Precio">{priceDisplay}</StatBox>
      </div>

      {/* Confirmed players list */}
      <PlayersSection
        confirmed={confirmed}
        maxPlayers={data.maxPlayers}
        isCompleto={isCompleto}
        isOrganizer={isOrganizer}
        actionLoading={actionLoading}
        onAddGuest={onAddGuest}
        onRemove={onRemoveParticipation}
      />

      {/* Mixed balance card */}
      {data.category === "X" && (
        <MixedBalanceCard confirmed={confirmed} maxPlayers={data.maxPlayers} isCompleto={isCompleto} />
      )}

      {/* Organizer notes */}
      {data.notes && (
        <div className="rounded-md border-[1.5px] border-dashed border-muted p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
            Notas del organizador
          </div>
          <p className="mt-1 font-hand text-sm text-ink-2">{data.notes}</p>
        </div>
      )}

      {/* Share bar */}
      <ShareBar data={data} plazasLibres={plazasLibres} />

      {/* Organizer actions */}
      {isOrganizer && (
        <div className="flex flex-wrap items-center gap-4">
          {(data.category === "M" || data.category === "F") &&
            data.status !== "FINISHED" &&
            data.status !== "CANCELLED" && (
              <button
                onClick={onConvertToMixed}
                disabled={actionLoading}
                className="text-xs font-semibold text-lime-deep underline hover:text-ink"
              >
                🔀 Abrir a mixto
              </button>
            )}
          <button
            onClick={onDelete}
            disabled={actionLoading}
            className="text-xs font-semibold text-rose-600 underline hover:text-rose-800"
          >
            Eliminar pachanga
          </button>
        </div>
      )}

      {/* Desktop CTA row */}
      <div className="hidden items-center gap-3 md:flex">
        <CtaBar
          isCompleto={isCompleto}
          hasJoined={hasJoined}
          plazasLibres={plazasLibres}
          waitlistCount={waitlist.length}
          actionLoading={actionLoading}
          onJoin={onJoin}
          onLeave={onLeave}
        />
      </div>

      {/* Mobile waitlist (shown inline on mobile) */}
      {waitlist.length > 0 && (
        <div className="md:hidden">
          <WaitlistSection waitlist={waitlist} isCompleto={isCompleto} />
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Mixed balance card (cat "X")
   ────────────────────────────────────────────── */

function MixedBalanceCard({
  confirmed,
  maxPlayers,
  isCompleto,
}: {
  confirmed: Participation[];
  maxPlayers: number;
  isCompleto: boolean;
}) {
  const hTarget = Math.ceil(maxPlayers / 2);
  const mTarget = Math.floor(maxPlayers / 2);
  const males = confirmed.filter((p) => pGender(p) === "MALE");
  const females = confirmed.filter((p) => pGender(p) === "FEMALE");
  const hFilled = males.length;
  const mFilled = females.length;
  const hEmpty = Math.max(hTarget - hFilled, 0);
  const mEmpty = Math.max(mTarget - mFilled, 0);

  return (
    <NeoCard accent className="p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-lime-deep">
        Equilibrio mixto
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        {/* Hombres */}
        <div>
          <div className="text-xs font-bold text-ink">{hFilled}H</div>
          <div className="mt-1 flex gap-1.5">
            {males.map((p) => (
              <Avatar
                key={p.id}
                label={initial(pName(p))}
                size={28}
                lime={isCompleto}
              />
            ))}
            {Array.from({ length: hEmpty }).map((_, i) => (
              <Avatar key={`he-${i}`} label="+" size={28} dashed />
            ))}
          </div>
        </div>

        {/* Mujeres */}
        <div>
          <div className="text-xs font-bold text-ink">{mFilled}M</div>
          <div className="mt-1 flex gap-1.5">
            {females.map((p) => (
              <Avatar
                key={p.id}
                label={initial(pName(p))}
                size={28}
                lime={isCompleto}
              />
            ))}
            {Array.from({ length: mEmpty }).map((_, i) => (
              <Avatar key={`me-${i}`} label="+" size={28} dashed />
            ))}
          </div>
        </div>
      </div>
    </NeoCard>
  );
}

/* ──────────────────────────────────────────────
   CTA bar
   ────────────────────────────────────────────── */

function CtaBar({
  isCompleto,
  hasJoined,
  plazasLibres,
  waitlistCount,
  actionLoading,
  onJoin,
  onLeave,
}: {
  isCompleto: boolean;
  hasJoined: boolean;
  plazasLibres: number;
  waitlistCount: number;
  actionLoading: boolean;
  onJoin: () => void;
  onLeave: () => void;
}) {
  if (hasJoined) {
    return (
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <NeoButton
          variant="ghost"
          className="flex-shrink-0"
          disabled={actionLoading}
          onClick={onLeave}
        >
          {actionLoading ? "Saliendo..." : "Salir de la lista"}
        </NeoButton>
        <span className="font-hand text-xs text-muted">
          Estas apuntado/a
        </span>
      </div>
    );
  }

  if (isCompleto) {
    return (
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <NeoButton
          variant="primary"
          className="flex-shrink-0"
          disabled={actionLoading}
          onClick={onJoin}
        >
          {actionLoading ? "Apuntando..." : "Entrar en lista de espera"}
        </NeoButton>
        <span className="font-hand text-xs text-muted">
          {waitlistCount} en lista de espera
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <NeoButton
        variant="primary"
        className="flex-shrink-0"
        disabled={actionLoading}
        onClick={onJoin}
      >
        {actionLoading
          ? "Apuntando..."
          : `Apuntarme (queda ${plazasLibres} plaza${plazasLibres !== 1 ? "s" : ""})`}
      </NeoButton>
      <span className="font-hand text-xs text-muted">
        cancelacion hasta 12h antes
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Share bar
   ────────────────────────────────────────────── */

function ShareBar({ data, plazasLibres }: { data: PachangaData; plazasLibres: number }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined"
    ? `${window.location.origin}/pachangas/${data.id}`
    : `/pachangas/${data.id}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select a hidden input */
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pachanga ${CAT_NAME[data.category]}`,
          text: buildShareText(data, plazasLibres),
          url: link,
        });
        return;
      } catch { /* user cancelled */ }
    }
    window.open(buildWhatsAppUrl(data, plazasLibres), "_blank");
  }

  return (
    <div className="rounded-lg border-[1.5px] border-dashed border-muted bg-paper-alt p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        Compartir pachanga
      </div>

      <div className="mt-2 flex items-center gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 truncate rounded-md border-[1.5px] border-ink bg-fill px-3 py-2 text-xs text-ink"
          onFocus={(e) => e.target.select()}
        />
        <NeoButton size="sm" variant="ghost" onClick={handleCopy}>
          {copied ? "✓ Copiado" : "Copiar"}
        </NeoButton>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <NeoButton
          size="sm"
          variant="primary"
          onClick={() => window.open(buildWhatsAppUrl(data, plazasLibres), "_blank")}
          className="bg-[#25D366] border-[#25D366] text-white hover:bg-[#1da851]"
        >
          WhatsApp
        </NeoButton>
        <NeoButton size="sm" variant="ghost" onClick={() => downloadCalendarEvent(data)}>
          Añadir al calendario
        </NeoButton>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <NeoButton size="sm" variant="ghost" onClick={handleNativeShare}>
            Compartir...
          </NeoButton>
        )}
      </div>
    </div>
  );
}

function downloadCalendarEvent(data: PachangaData) {
  const catName = { M: "Masculino", F: "Femenino", X: "Mixto" }[data.category] || data.category;
  const start = new Date(data.date);
  const end = new Date(start.getTime() + data.duration * 60 * 1000);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Montesina Padel//ES",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Pachanga ${catName} - ${data.court.name}`,
    `DESCRIPTION:Pachanga de padel ${catName.toLowerCase()} en ${data.court.name}. ${data.maxPlayers} jugadores. ${data.price}€/jugador.`,
    `LOCATION:${data.court.name}`,
    `URL:${typeof window !== "undefined" ? `${window.location.origin}/pachangas/${data.id}` : ""}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Tu pachanga empieza en 1 hora",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pachanga-${data.id.slice(0, 6)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ──────────────────────────────────────────────
   Sidebar (desktop)
   ────────────────────────────────────────────── */

function Sidebar({
  waitlist,
  isCompleto,
  currentUserId,
  messages,
  canPost,
  isLoggedIn,
  onSend,
  onRetry,
}: {
  data: PachangaData;
  waitlist: Participation[];
  isCompleto: boolean;
  currentUserId: string | null;
  messages: ChatMsg[];
  canPost: boolean;
  isLoggedIn: boolean;
  onSend: (text: string) => Promise<boolean>;
  onRetry: (id: string) => void;
}) {
  return (
    <div className="flex flex-col divide-y-[1.5px] divide-ink">
      <WaitlistSection waitlist={waitlist} isCompleto={isCompleto} />
      <ChatSection
        messages={messages}
        currentUserId={currentUserId}
        canPost={canPost}
        isLoggedIn={isLoggedIn}
        onSend={onSend}
        onRetry={onRetry}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Confirmed players list
   ────────────────────────────────────────────── */

function PlayersSection({
  confirmed,
  maxPlayers,
  isCompleto,
  isOrganizer = false,
  actionLoading = false,
  onAddGuest,
  onRemove,
}: {
  confirmed: Participation[];
  maxPlayers: number;
  isCompleto: boolean;
  isOrganizer?: boolean;
  actionLoading?: boolean;
  onAddGuest?: (name: string) => Promise<boolean>;
  onRemove?: (participationId: string, name: string) => Promise<void>;
}) {
  const emptySlots = Math.max(maxPlayers - confirmed.length, 0);
  const [guestForm, setGuestForm] = useState(false);
  const [guestName, setGuestName] = useState("");

  async function handleAdd() {
    if (!onAddGuest) return;
    const trimmed = guestName.trim();
    if (!trimmed) return;
    const ok = await onAddGuest(trimmed);
    if (ok) {
      setGuestName("");
      setGuestForm(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border-[1.5px] border-ink p-4",
        isCompleto && "border-lime-deep bg-lime/5",
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        JUGADORES &middot; {confirmed.length}/{maxPlayers}
      </div>

      {confirmed.length === 0 ? (
        <p className="mt-2 font-hand text-xs text-muted">
          Nadie apuntado todavia. Se el primero!
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {confirmed.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2.5">
              <span className="w-5 text-center font-hand text-xs text-muted">
                {idx + 1}
              </span>
              <Avatar
                label={initial(pName(p))}
                size={28}
                lime={isCompleto}
                dashed={isGuest(p)}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate text-sm font-bold text-ink">{pName(p)}</span>
                  {isGuest(p) && (
                    <span className="shrink-0 rounded bg-fill-alt px-1.5 py-px text-[9px] font-bold uppercase tracking-widest2 text-muted">
                      Externo
                    </span>
                  )}
                </div>
                {!isGuest(p) && <LevelBalls value={pLevel(p)} size={8} />}
              </div>
              {isOrganizer && onRemove && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onRemove(p.id, pName(p))}
                  className="text-[10px] font-bold uppercase tracking-widest2 text-rose-600 underline hover:text-rose-800 disabled:opacity-50"
                  aria-label={`Quitar a ${pName(p)}`}
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {emptySlots > 0 && (
        <div className="mt-2.5 space-y-2.5">
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center gap-2.5">
              <span className="w-5 text-center font-hand text-xs text-muted">
                {confirmed.length + i + 1}
              </span>
              <Avatar label="?" size={28} dashed />
              <span className="font-hand text-xs text-muted">
                Plaza libre
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Añadir externo (solo organizador) */}
      {isOrganizer && onAddGuest && (
        <div className="mt-3 border-t border-dashed border-muted/50 pt-3">
          {guestForm ? (
            <div className="rounded-lg border-[1.5px] border-lime-deep bg-lime-soft/30 p-2 space-y-2">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                placeholder="Nombre del externo"
                maxLength={60}
                className="block w-full rounded-md border-[1.5px] border-ink bg-paper px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-lime"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={actionLoading || !guestName.trim()}
                  onClick={handleAdd}
                  className="flex-1 rounded-md border-[1.5px] border-ink bg-lime px-2 py-1 text-xs font-bold text-ink disabled:opacity-50"
                >
                  Añadir
                </button>
                <button
                  type="button"
                  onClick={() => { setGuestForm(false); setGuestName(""); }}
                  className="rounded-md border-[1.5px] border-ink bg-fill px-2 py-1 text-xs font-bold text-ink"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setGuestForm(true)}
              disabled={actionLoading}
              className="w-full rounded-lg border-[1.5px] border-dashed border-muted bg-fill p-2 text-xs font-semibold text-ink-2 hover:border-lime-deep hover:text-lime-deep disabled:opacity-50"
            >
              + Añadir externo (sin cuenta)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Waitlist section
   ────────────────────────────────────────────── */

function WaitlistSection({
  waitlist,
  isCompleto,
}: {
  waitlist: Participation[];
  isCompleto: boolean;
}) {
  return (
    <div
      className={cn(
        "p-4",
        isCompleto && "rounded-lg border-[1.5px] border-dashed border-lime-deep",
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        LISTA DE ESPERA &middot; {waitlist.length}
      </div>

      {waitlist.length === 0 ? (
        <p className="mt-2 font-hand text-xs text-muted">
          Nadie en espera todavia.
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {waitlist.map((entry, idx) => (
            <div key={entry.id} className="flex items-center gap-2.5">
              <span className="w-5 text-center font-hand text-xs text-muted">
                {entry.position ?? idx + 1}
              </span>
              <Avatar label={initial(pName(entry))} size={28} dashed={isGuest(entry)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate text-sm font-bold text-ink">{pName(entry)}</span>
                  {isGuest(entry) && (
                    <span className="shrink-0 rounded bg-fill-alt px-1.5 py-px text-[9px] font-bold uppercase tracking-widest2 text-muted">
                      Externo
                    </span>
                  )}
                </div>
                {!isGuest(entry) && <LevelBalls value={pLevel(entry)} size={8} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Chat section
   ────────────────────────────────────────────── */

function ChatSection({
  messages,
  currentUserId,
  canPost,
  isLoggedIn,
  onSend,
  onRetry,
}: {
  messages: ChatMsg[];
  currentUserId: string | null;
  canPost: boolean;
  isLoggedIn: boolean;
  onSend: (text: string) => Promise<boolean>;
  onRetry: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);

  // Pre-compute display flags: when prev msg is from the same author within
  // 5 min, hide the author footer on the previous one so the chain reads tighter.
  const decorated = useMemo(() => {
    return messages.map((m, i) => {
      const prev = i > 0 ? messages[i - 1] : null;
      const dayChanged =
        !prev || !sameDay(new Date(prev.createdAt), new Date(m.createdAt));
      const next = i < messages.length - 1 ? messages[i + 1] : null;
      const sameAuthorAsNext =
        next &&
        next.userId === m.userId &&
        Math.abs(
          new Date(next.createdAt).getTime() - new Date(m.createdAt).getTime(),
        ) < 5 * 60 * 1000 &&
        sameDay(new Date(next.createdAt), new Date(m.createdAt));
      return { msg: m, dayChanged, showWho: !sameAuthorAsNext };
    });
  }, [messages]);

  // Track whether the user is near the bottom; only auto-scroll if so.
  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending || !canPost) return;
    setSending(true);
    const toSend = draft;
    setDraft("");
    stickToBottomRef.current = true;
    await onSend(toSend);
    setSending(false);
  }

  return (
    <div className="p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        CHAT &middot; {messages.length}
      </div>

      {messages.length === 0 ? (
        <p className="mt-2 font-hand text-xs text-muted">
          Aun no hay mensajes.
        </p>
      ) : (
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="mt-3 max-h-[60vh] space-y-3 overflow-y-auto pr-1"
          data-testid="chat-scroller"
        >
          {decorated.map(({ msg, dayChanged, showWho }) => (
            <div key={msg.id}>
              {dayChanged && (
                <div className="my-2 flex items-center gap-2">
                  <div className="h-px flex-1 bg-muted/40" />
                  <span className="font-hand text-[10px] uppercase tracking-widest2 text-muted">
                    {formatDayLabel(msg.createdAt)}
                  </span>
                  <div className="h-px flex-1 bg-muted/40" />
                </div>
              )}
              <ChatMessage
                who={msg.user.name}
                text={msg.text}
                time={formatChatTime(msg.createdAt)}
                mine={msg.userId === currentUserId}
                pending={msg.pending}
                failed={msg.failed}
                showWho={showWho}
                onRetry={msg.failed ? () => onRetry(msg.id) : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {/* Chat input */}
      {!isLoggedIn ? (
        <div className="mt-4 rounded-full border-[1.5px] border-dashed border-muted px-3 py-2 text-center text-xs text-muted">
          <Link href="/login" className="font-semibold text-lime-deep underline">
            Inicia sesión
          </Link>{" "}
          para escribir
        </div>
      ) : !canPost ? (
        <div className="mt-4 rounded-full border-[1.5px] border-dashed border-muted px-3 py-2 text-center text-xs text-muted">
          Apúntate para participar en el chat
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe un mensaje..."
            maxLength={500}
            disabled={sending}
            aria-label="Escribir mensaje"
            data-testid="chat-input"
            className="flex-1 rounded-full border-[1.5px] border-ink bg-fill px-3 py-2 text-xs text-ink outline-none focus:border-lime-deep disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Enviar mensaje"
            data-testid="chat-send"
            className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-ink bg-lime text-sm font-bold text-ink transition-opacity disabled:opacity-50"
          >
            &uarr;
          </button>
        </form>
      )}
    </div>
  );
}
