import Link from "next/link";
import FlatLogo from "@/assets/logo-montesina-flat.svg";
import { MobileTabs } from "@/components/mobile-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CatChip, type Category } from "@/components/ui/cat-chip";
import { LevelBalls } from "@/components/ui/level-balls";
import { AvatarRow } from "@/components/ui/avatar";
import { NeoLinkButton } from "@/components/ui/neo-button";
import { cn } from "@/lib/utils";

interface AgendaItem {
  time: string;
  cat: Category;
  filled: number;
  max: number;
  pista: string;
  nivel: number;
  accent?: boolean;
}

const AGENDA: AgendaItem[] = [
  { time: "17:30", cat: "M", filled: 4, max: 4, pista: "P3 indoor", nivel: 3 },
  { time: "19:00", cat: "X", filled: 3, max: 4, pista: "P1 outdoor", nivel: 3, accent: true },
  { time: "20:30", cat: "F", filled: 2, max: 4, pista: "P2 indoor", nivel: 2 },
  { time: "22:00", cat: "M", filled: 1, max: 4, pista: "P4 outdoor", nivel: 4 },
];

export default function HomeB() {
  return (
    <>
      <SiteHeader variant="paper" active="Pachangas" />
      <main>
        <section className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-2">
          <NavyPanel />
          <AgendaPanel />
        </section>
      </main>
      <SiteFooter />
      <MobileTabs active="Inicio" />
    </>
  );
}

function NavyPanel() {
  return (
    <div className="relative flex flex-col justify-between bg-navy px-8 py-12 text-foam md:px-12 md:py-16">
      <p className="font-hand text-xs uppercase tracking-widest2 text-lime">
        EL CLUB · ABIERTO
      </p>

      <div className="my-12 flex justify-center md:my-16 md:justify-start">
        <FlatLogo className="h-44 w-44 text-lime drop-shadow-[0_0_36px_rgba(212,242,92,0.4)] md:h-56 md:w-56" aria-hidden />
      </div>

      <div>
        <h1 className="text-4xl font-extrabold leading-none tracking-tight md:text-5xl">
          Pachangas
          <br />
          <span className="text-lime">todos los días.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm text-foam-muted md:text-base">
          Organizadas entre socios. M / F / Mixto. Apúntate en 2 toques.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <NeoLinkButton href="/pachangas/nueva" variant="primary">
            Crear pachanga
          </NeoLinkButton>
          <NeoLinkButton href="/reservas" variant="outlineLime">
            Reservar pista
          </NeoLinkButton>
        </div>
      </div>
    </div>
  );
}

function AgendaPanel() {
  return (
    <div className="border-t-[1.5px] border-ink bg-paper px-6 py-10 md:border-l-[1.5px] md:border-t-0 md:px-10 md:py-14">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-ink md:text-xl">
          Hoy · martes 20
        </h2>
        <span className="font-hand text-xs text-muted">
          3 con plazas libres
        </span>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {AGENDA.map((p) => (
          <AgendaRow key={p.time} item={p} />
        ))}
      </ul>

      <Link
        href="/pachangas"
        className="mt-8 inline-block font-hand text-sm text-ink-2 transition-colors hover:text-lime-deep"
      >
        ver toda la semana →
      </Link>
    </div>
  );
}

function AgendaRow({ item }: { item: AgendaItem }) {
  const full = item.filled === item.max;
  const avatars = ["M", "A", "J", "K"].slice(0, item.filled);
  return (
    <li
      className={cn(
        "grid grid-cols-[60px_1fr_auto] items-center gap-3 rounded-md border-[1.5px] bg-fill p-3",
        item.accent ? "border-[2px] border-lime-deep shadow-neo-lime" : "border-ink shadow-neo-sm",
      )}
    >
      <div>
        <div className="text-lg font-extrabold text-ink">{item.time}</div>
        <div className="font-hand text-[11px] text-muted">90 min</div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <CatChip cat={item.cat} sm />
          <span className="text-xs text-ink-2">{item.pista}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <LevelBalls value={item.nivel} size={8} />
          <AvatarRow avatars={avatars} empty={item.max - item.filled} size={18} />
        </div>
      </div>
      <span
        className={cn(
          "text-xs font-bold tracking-wide",
          full ? "text-muted" : "text-lime-deep",
        )}
      >
        {full ? "LLENO" : "APUNTARME"}
      </span>
    </li>
  );
}
