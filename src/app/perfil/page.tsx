"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { LevelBalls } from "@/components/ui/level-balls";
import { PachangaCard } from "@/components/ui/pachanga-card";
import { PageTabs } from "@/components/ui/page-tabs";
import { StatBox } from "@/components/ui/stat-box";
import { NeoButton } from "@/components/ui/neo-button";
import { cn } from "@/lib/utils";
import { getFontSize, setFontSize } from "@/components/features/font-size-provider";

interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  gender: "MALE" | "FEMALE";
  level: number;
  createdAt: string;
}

interface ProfileStats {
  played: number;
  created: number;
  thisMonth: number;
  attendance: string;
  favCategory: string;
}

interface ApiPachanga {
  id: string;
  category: "M" | "F" | "X";
  date: string;
  duration: number;
  court: { name: string; type: string };
  maxPlayers: number;
  price: string;
  organizer: { id: string; name: string };
  _count: { participations: number };
}

interface ProfileData {
  user: ProfileUser;
  stats: ProfileStats;
  upcoming: ApiPachanga[];
  created: ApiPachanga[];
}

function formatPachanga(p: ApiPachanga, userId: string) {
  const d = new Date(p.date);
  const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const dayLabel = isToday ? "HOY" : `${days[d.getDay()]} ${d.getDate()}`;
  const time = d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  return {
    id: p.id,
    cat: p.category,
    date: `${dayLabel} · ${time}`,
    time: `${time} · ${p.duration}min`,
    pista: `${p.court.name} · ${p.court.type.toLowerCase()}`,
    nivel: 3,
    filled: p._count.participations,
    max: p.maxPlayers,
    organizer: p.organizer.id === userId ? "Tú" : p.organizer.name,
    price: `${parseFloat(p.price)}€`,
    accent: isToday,
  };
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const DESKTOP_TABS = [
  { label: "Próximas" },
  { label: "Creadas" },
  { label: "Estadísticas" },
];

const MOBILE_TABS_LIST = [
  { label: "Próx." },
  { label: "Creadas" },
  { label: "Stats" },
];

export default function PerfilPage() {
  const { data: session, status: authStatus } = useSession();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setLoading(false);
      return;
    }
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authStatus]);

  if (authStatus === "loading" || loading) {
    return (
      <>
        <SiteHeader variant="paper" />
        <main className="flex min-h-[60vh] items-center justify-center bg-paper">
          <p className="font-hand text-muted">Cargando perfil...</p>
        </main>
        <SiteFooter />
        <MobileTabs active="Yo" />
      </>
    );
  }

  if (authStatus !== "authenticated" || !data) {
    return (
      <>
        <SiteHeader variant="paper" />
        <main className="flex min-h-[60vh] items-center justify-center bg-paper">
          <div className="text-center">
            <p className="text-lg font-bold text-ink">Inicia sesión</p>
            <p className="mt-1 text-sm text-muted">Para ver tu perfil necesitas una cuenta.</p>
            <Link href="/login" className="mt-3 inline-block text-sm font-bold text-lime-deep">
              Entrar →
            </Link>
          </div>
        </main>
        <SiteFooter />
        <MobileTabs active="Yo" />
      </>
    );
  }

  const { user, stats, upcoming, created } = data;
  const memberYear = new Date(user.createdAt).getFullYear();

  return (
    <>
      <SiteHeader variant="paper" />

      {/* ── Mobile header ── */}
      <section className="relative bg-navy px-4 pb-6 pt-8 text-center md:hidden">
        <div className="flex justify-center">
          {user.image ? (
            <img src={user.image} alt="" className="h-16 w-16 rounded-full border-2 border-lime" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-lime bg-lime text-lg font-bold text-ink">
              {initials(user.name)}
            </div>
          )}
        </div>
        <h1 className="mt-3 text-lg font-extrabold text-foam">
          {user.name || "Sin nombre"}
        </h1>
        <p className="mt-0.5 text-xs text-foam/70">
          socio desde {memberYear}
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span className="text-xs font-medium text-foam/80">Nivel</span>
          <LevelBalls value={user.level} size={9} />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-3 text-xs text-foam/50 underline"
        >
          Cerrar sesión
        </button>
      </section>

      {/* ── Mobile stat row ── */}
      <div className="grid grid-cols-3 border-b border-dashed border-muted/70 bg-paper md:hidden">
        {[
          { value: stats.played, label: "jugados" },
          { value: stats.created, label: "creadas" },
          { value: stats.attendance, label: "asist." },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center border-r border-dashed border-muted/70 py-3 last:border-r-0"
          >
            <span className="text-lg font-extrabold text-ink">{s.value}</span>
            <span className="text-[10px] font-medium uppercase tracking-widest2 text-muted">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Desktop header ── */}
      <section className="hidden border-b border-dashed border-muted/70 bg-paper md:block">
        <div className="container py-8">
          <div className="flex items-start gap-6">
            {user.image ? (
              <img src={user.image} alt="" className="h-20 w-20 rounded-full border-2 border-lime" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-lime bg-lime text-2xl font-bold text-ink">
                {initials(user.name)}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-ink">
                {user.name || "Sin nombre"}
              </h1>
              <p className="mt-0.5 text-sm text-ink-2">{user.email}</p>
              <p className="mt-0.5 text-xs text-muted">
                socio desde {memberYear}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
                  Nivel <LevelBalls value={user.level} size={10} />
                </span>
                <span className="text-xs text-ink-2">
                  {user.gender === "MALE" ? "Hombre" : "Mujer"}
                </span>
                <span className="font-hand text-sm text-lime-deep">
                  {stats.played} partidos jugados
                </span>
              </div>
            </div>

            <NeoButton variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Cerrar sesión
            </NeoButton>
          </div>
        </div>
      </section>

      <main className="min-h-screen">
        {/* ── Tabs ── */}
        <div className="md:hidden">
          <PageTabs tabs={MOBILE_TABS_LIST} active={activeTab} onChange={setActiveTab} />
        </div>
        <div className="hidden md:block">
          <div className="container">
            <PageTabs tabs={DESKTOP_TABS} active={activeTab} onChange={setActiveTab} />
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="bg-paper-alt p-4 md:p-6">
          <div className="container">
            {activeTab === 0 && (
              <PachangaList
                pachangas={upcoming}
                userId={user.id}
                emptyText="No tienes pachangas próximas"
              />
            )}
            {activeTab === 1 && (
              <PachangaList
                pachangas={created}
                userId={user.id}
                emptyText="No has creado ninguna pachanga"
              />
            )}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatBox label="Partidos jugados">{stats.played}</StatBox>
                  <StatBox label="Este mes">{stats.thisMonth}</StatBox>
                  <StatBox label="Asistencia">{stats.attendance}</StatBox>
                  <StatBox label="Categ. favorita">{stats.favCategory}</StatBox>
                  <StatBox label="Pachangas creadas">{stats.created}</StatBox>
                  <StatBox label="Nivel">{user.level}</StatBox>
                </div>
                <FontSizeSelector />
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileTabs active="Yo" />
    </>
  );
}

function PachangaList({
  pachangas,
  userId,
  emptyText,
}: {
  pachangas: ApiPachanga[];
  userId: string;
  emptyText: string;
}) {
  if (pachangas.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted">{emptyText}</p>
        <Link href="/pachangas/nueva" className="mt-2 inline-block text-sm font-bold text-lime-deep">
          Crear pachanga →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pachangas.map((p) => {
        const f = formatPachanga(p, userId);
        return (
          <PachangaCard
            key={f.id}
            cat={f.cat}
            date={f.date}
            time={f.time}
            pista={f.pista}
            nivel={f.nivel}
            filled={f.filled}
            max={f.max}
            organizer={f.organizer}
            price={f.price}
            accent={f.accent}
            href={`/pachangas/${f.id}`}
          />
        );
      })}
    </div>
  );
}

const FONT_OPTIONS = [
  { value: "normal", label: "Normal", preview: "Aa" },
  { value: "grande", label: "Grande", preview: "Aa" },
  { value: "muy-grande", label: "Muy grande", preview: "Aa" },
] as const;

function FontSizeSelector() {
  const [current, setCurrent] = useState("normal");

  useEffect(() => {
    setCurrent(getFontSize());
  }, []);

  function handleChange(size: string) {
    setCurrent(size);
    setFontSize(size);
  }

  return (
    <div className="rounded-lg border-[1.5px] border-ink bg-fill p-4">
      <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
        Tamaño de texto
      </div>
      <div className="mt-3 flex gap-2">
        {FONT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg border-[1.5px] px-3 py-3 transition-all",
              current === opt.value
                ? "border-lime-deep bg-lime-soft font-bold"
                : "border-ink bg-paper",
            )}
          >
            <span
              className={cn(
                "font-bold text-ink",
                opt.value === "normal" && "text-sm",
                opt.value === "grande" && "text-lg",
                opt.value === "muy-grande" && "text-xl",
              )}
            >
              {opt.preview}
            </span>
            <span className="text-[10px] text-muted">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
