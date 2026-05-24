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
import { getPachangaById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Pachanga } from "@/lib/types";

interface PageProps {
  params: { id: string };
}

export default function PachangaDetailPage({ params }: PageProps) {
  const pachanga = getPachangaById(params.id);

  if (!pachanga) {
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

  const isCompleto = pachanga.filled >= pachanga.max;
  const plazasLibres = pachanga.max - pachanga.filled;
  const waitlistCount = pachanga.waitlist?.length ?? 0;
  const chatCount = pachanga.chat?.length ?? 0;

  return (
    <>
      <SiteHeader variant="paper" active="Pachangas" />

      {/* ── Mobile top bar ── */}
      <div className="flex items-center gap-3 border-b-[1.5px] border-ink bg-paper px-4 py-3 md:hidden">
        <Link href="/pachangas" className="text-ink" aria-label="Volver">
          <span className="text-lg font-bold">←</span>
        </Link>
        <span className="text-sm font-bold text-ink">
          Pachanga #{pachanga.id}
        </span>
      </div>

      <main className="min-h-screen bg-paper">
        {/* ── Desktop breadcrumb ── */}
        <div className="hidden border-b-[1.5px] border-ink bg-paper px-6 py-3 md:block">
          <Link
            href="/pachangas"
            className="font-hand text-sm text-muted hover:text-ink"
          >
            ← volver al listado
          </Link>
        </div>

        {/* ── Two-column layout (desktop) ── */}
        <div className="md:grid md:grid-cols-[1fr_320px]">
          {/* ════ Main content ════ */}
          <div className="p-4 md:p-6">
            <MainContent pachanga={pachanga} isCompleto={isCompleto} />
          </div>

          {/* ════ Sidebar (desktop) ════ */}
          <aside className="hidden border-l-[1.5px] border-ink md:block">
            <Sidebar pachanga={pachanga} />
          </aside>
        </div>

        {/* ── Mobile chat section ── */}
        <div className="border-t-[1.5px] border-ink p-4 md:hidden">
          <ChatSection pachanga={pachanga} />
        </div>

        {/* ── Mobile sticky CTA ── */}
        <div className="sticky bottom-[56px] z-30 border-t-[1.5px] border-ink bg-paper px-4 py-3 md:hidden">
          <CtaBar pachanga={pachanga} isCompleto={isCompleto} plazasLibres={plazasLibres} />
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
  pachanga,
  isCompleto,
}: {
  pachanga: Pachanga;
  isCompleto: boolean;
}) {
  const plazasLibres = pachanga.max - pachanga.filled;

  return (
    <div className="space-y-5">
      {/* Top row: chip + id + organizer */}
      <div className="flex flex-wrap items-center gap-2">
        <CatChip cat={pachanga.cat} />
        {isCompleto && (
          <span className="rounded border-[1.2px] border-ink bg-ink px-2 py-px text-[11px] font-bold uppercase tracking-widest2 text-paper">
            COMPLETO
          </span>
        )}
        <span className="text-sm font-bold text-ink">
          Pachanga &middot; #{pachanga.id}
        </span>
        <span className="ml-auto text-xs font-hand text-muted">
          creada por {pachanga.organizer} &middot; hace 2 h
        </span>
      </div>

      {/* Large heading: date */}
      <div>
        <h1 className="text-xl font-extrabold text-ink md:text-2xl">
          {pachanga.date}
        </h1>
        <p className="mt-0.5 text-sm text-ink-2">{pachanga.pista}</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="Categoria">
          {CATEGORY_LABEL[pachanga.cat]}
        </StatBox>
        <StatBox label="Nivel">
          <LevelBalls value={pachanga.nivel} size={12} />
        </StatBox>
        <StatBox label="Plazas">
          <span className="flex items-center gap-2">
            <span>{pachanga.filled}/{pachanga.max}</span>
            <AvatarRow
              avatars={pachanga.avatars}
              empty={plazasLibres > 0 ? plazasLibres : 0}
              size={20}
            />
          </span>
        </StatBox>
        <StatBox label="Precio">{pachanga.price}</StatBox>
      </div>

      {/* Mixed balance card */}
      {pachanga.cat === "X" && (
        <MixedBalanceCard pachanga={pachanga} isCompleto={isCompleto} />
      )}

      {/* Organizer notes */}
      {pachanga.notes && (
        <div className="rounded-md border-[1.5px] border-dashed border-muted p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
            Notas del organizador
          </div>
          <p className="mt-1 font-hand text-sm text-ink-2">{pachanga.notes}</p>
        </div>
      )}

      {/* Desktop CTA row */}
      <div className="hidden items-center gap-3 md:flex">
        <CtaBar
          pachanga={pachanga}
          isCompleto={isCompleto}
          plazasLibres={plazasLibres}
        />
      </div>

      {/* Mobile waitlist (shown inline on mobile) */}
      {pachanga.waitlist && pachanga.waitlist.length > 0 && (
        <div className="md:hidden">
          <WaitlistSection pachanga={pachanga} isCompleto={isCompleto} />
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Mixed balance card (cat "X")
   ────────────────────────────────────────────── */

function MixedBalanceCard({
  pachanga,
  isCompleto,
}: {
  pachanga: Pachanga;
  isCompleto: boolean;
}) {
  // For a 4-player mixed match: 2H + 2M
  const hTarget = 2;
  const mTarget = 2;
  // Use first half of avatars as H, second half as M (mock heuristic)
  const hFilled = Math.min(Math.ceil(pachanga.filled / 2), hTarget);
  const mFilled = Math.min(pachanga.filled - hFilled, mTarget);
  const hEmpty = hTarget - hFilled;
  const mEmpty = mTarget - mFilled;

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
            {pachanga.avatars.slice(0, hFilled).map((a, i) => (
              <Avatar
                key={`h-${i}`}
                label={a}
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
            {pachanga.avatars.slice(hFilled, hFilled + mFilled).map((a, i) => (
              <Avatar
                key={`m-${i}`}
                label={a}
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
  pachanga,
  isCompleto,
  plazasLibres,
}: {
  pachanga: Pachanga;
  isCompleto: boolean;
  plazasLibres: number;
}) {
  if (isCompleto) {
    return (
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <NeoButton variant="ghost" className="flex-shrink-0">
          Salir de la lista
        </NeoButton>
        <span className="font-hand text-xs text-muted">
          {pachanga.waitlist?.length ?? 0} en lista de espera
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <NeoButton variant="primary" className="flex-shrink-0">
        Apuntarme (queda {plazasLibres} plaza{plazasLibres !== 1 ? "s" : ""})
      </NeoButton>
      <NeoButton variant="ghost" className="flex-shrink-0">
        Compartir
      </NeoButton>
      <span className="font-hand text-xs text-muted">
        cancelacion hasta 12h antes
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Sidebar (desktop)
   ────────────────────────────────────────────── */

function Sidebar({ pachanga }: { pachanga: Pachanga }) {
  const isCompleto = pachanga.filled >= pachanga.max;

  return (
    <div className="flex flex-col divide-y-[1.5px] divide-ink">
      {/* Waitlist section */}
      <WaitlistSection pachanga={pachanga} isCompleto={isCompleto} />

      {/* Chat section */}
      <ChatSection pachanga={pachanga} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Waitlist section
   ────────────────────────────────────────────── */

function WaitlistSection({
  pachanga,
  isCompleto,
}: {
  pachanga: Pachanga;
  isCompleto: boolean;
}) {
  const waitlistCount = pachanga.waitlist?.length ?? 0;

  return (
    <div
      className={cn(
        "p-4",
        isCompleto && "border-[1.5px] border-dashed border-lime-deep rounded-lg"
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        LISTA DE ESPERA &middot; {waitlistCount}
      </div>

      {waitlistCount === 0 ? (
        <p className="mt-2 font-hand text-xs text-muted">
          Nadie en espera todavia.
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {pachanga.waitlist!.map((entry) => (
            <div key={entry.position} className="flex items-center gap-2.5">
              <span className="w-5 text-center font-hand text-xs text-muted">
                {entry.position}
              </span>
              <Avatar label={entry.initial} size={28} />
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-bold text-ink">
                  {entry.name}
                </div>
                <LevelBalls value={entry.nivel} size={8} />
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

function ChatSection({ pachanga }: { pachanga: Pachanga }) {
  const chatCount = pachanga.chat?.length ?? 0;

  return (
    <div className="p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest2 text-muted">
        CHAT &middot; {chatCount}
      </div>

      {chatCount === 0 ? (
        <p className="mt-2 font-hand text-xs text-muted">
          Aun no hay mensajes.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {pachanga.chat!.map((msg, i) => (
            <ChatMessage
              key={i}
              who={msg.who}
              text={msg.text}
              time={msg.time}
              mine={msg.mine}
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
