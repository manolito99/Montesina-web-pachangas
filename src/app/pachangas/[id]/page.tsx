"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
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
  userId: string;
  status: "CONFIRMED" | "WAITLIST" | "CANCELLED";
  position: number | null;
  user: UserBasic & { gender: "MALE" | "FEMALE" };
}

interface ChatMsg {
  id: string;
  text: string;
  userId: string;
  user: { id: string; name: string };
  createdAt: string;
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
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id ?? null;

  const [data, setData] = useState<PachangaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPachanga = useCallback(async () => {
    try {
      const res = await fetch(`/api/pachangas/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const json: PachangaData = await res.json();
      setData(json);
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

  /* ── Join handler ── */
  const handleJoin = async () => {
    if (!currentUserId) {
      window.location.href = `/login?callbackUrl=/pachangas/${id}`;
      return;
    }
    setActionLoading(true);
    try {
      await fetch(`/api/pachangas/${id}/join`, { method: "POST" });
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
  const avatarLabels = confirmed.map((p) => initial(p.user.name));

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
            />
          </div>

          {/* ════ Sidebar (desktop) ════ */}
          <aside className="hidden border-l-[1.5px] border-ink md:block">
            <Sidebar
              data={data}
              waitlist={waitlist}
              isCompleto={isCompleto}
              currentUserId={currentUserId}
            />
          </aside>
        </div>

        {/* ── Mobile chat section ── */}
        <div className="border-t-[1.5px] border-ink p-4 md:hidden">
          <ChatSection chatMessages={data.chatMessages} currentUserId={currentUserId} />
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
      <PlayersSection confirmed={confirmed} maxPlayers={data.maxPlayers} isCompleto={isCompleto} />

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
  const males = confirmed.filter((p) => p.user.gender === "MALE");
  const females = confirmed.filter((p) => p.user.gender === "FEMALE");
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
                label={initial(p.user.name)}
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
                label={initial(p.user.name)}
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
        {typeof navigator !== "undefined" && "share" in navigator && (
          <NeoButton size="sm" variant="ghost" onClick={handleNativeShare}>
            Compartir...
          </NeoButton>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Sidebar (desktop)
   ────────────────────────────────────────────── */

function Sidebar({
  data,
  waitlist,
  isCompleto,
  currentUserId,
}: {
  data: PachangaData;
  waitlist: Participation[];
  isCompleto: boolean;
  currentUserId: string | null;
}) {
  return (
    <div className="flex flex-col divide-y-[1.5px] divide-ink">
      <WaitlistSection waitlist={waitlist} isCompleto={isCompleto} />
      <ChatSection chatMessages={data.chatMessages} currentUserId={currentUserId} />
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
}: {
  confirmed: Participation[];
  maxPlayers: number;
  isCompleto: boolean;
}) {
  const emptySlots = Math.max(maxPlayers - confirmed.length, 0);

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
                label={initial(p.user.name)}
                size={28}
                lime={isCompleto}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink">
                  {p.user.name}
                </div>
                <LevelBalls value={p.user.level} size={8} />
              </div>
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
              <Avatar label={initial(entry.user.name)} size={28} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink">
                  {entry.user.name}
                </div>
                <LevelBalls value={entry.user.level} size={8} />
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

function ChatSection({ chatMessages, currentUserId }: { chatMessages: ChatMsg[]; currentUserId: string | null }) {
  return (
    <div className="p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        CHAT &middot; {chatMessages.length}
      </div>

      {chatMessages.length === 0 ? (
        <p className="mt-2 font-hand text-xs text-muted">
          Aun no hay mensajes.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {chatMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              who={msg.user.name}
              text={msg.text}
              time={formatChatTime(msg.createdAt)}
              mine={msg.userId === currentUserId}
            />
          ))}
        </div>
      )}

      {/* Chat input placeholder (non-functional) */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 rounded-full border-[1.5px] border-ink bg-fill px-3 py-2 text-xs text-muted">
          Escribe un mensaje...
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-ink bg-lime text-sm font-bold text-ink">
          &uarr;
        </span>
      </div>
    </div>
  );
}
