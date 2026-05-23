import Link from "next/link";
import { LogoReveal } from "@/components/logo-reveal";
import { MobileTabs } from "@/components/mobile-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NeoLinkButton } from "@/components/ui/neo-button";
import { PachangaCard } from "@/components/ui/pachanga-card";

const FEATURED = [
  { id: "1", cat: "X" as const, date: "HOY · 19:00", filled: 3, accent: true },
  {
    id: "2",
    cat: "M" as const,
    date: "MAÑ · 20:30",
    pista: "Pista 1 · outdoor",
    nivel: 4,
    filled: 2,
    organizer: "Carlos R.",
  },
  {
    id: "3",
    cat: "F" as const,
    date: "JUE · 18:00",
    pista: "Pista 2 · indoor",
    nivel: 2,
    filled: 4,
    max: 4,
    organizer: "Lucía V.",
  },
];

export default function HomeA() {
  return (
    <>
      <SiteHeader variant="paper" />
      <main className="pb-12">
        <SectionHero />
        <FeaturedSection />
      </main>
      <SiteFooter />
      <MobileTabs active="Inicio" />
    </>
  );
}

function SectionHero() {
  return (
    <section className="relative">
      <div className="container relative z-10 pt-12 text-center">
        <p className="font-hand text-sm text-muted tracking-widest2">
          MONTESIÑA PADEL CLUB · SINCE &apos;94
        </p>
      </div>

      <LogoReveal
        mode="paper"
        tagline=""
        showScrollHint={false}
        trackHeight="220vh"
      />

      <div className="container relative z-10 -mt-32 text-center">
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
          Juega. Apúntate. <span className="text-lime-deep">Compite.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-balance text-ink-2 md:text-lg">
          Pachangas de pádel del club, organizadas entre socios. Masculino,
          femenino y mixto.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <NeoLinkButton href="/pachangas" variant="primary" size="lg">
            Apuntarme a una pachanga →
          </NeoLinkButton>
          <NeoLinkButton href="/pachangas/nueva" variant="ghost" size="lg">
            Crear pachanga
          </NeoLinkButton>
        </div>
      </div>
    </section>
  );
}

function FeaturedSection() {
  return (
    <section className="border-t border-dashed border-muted/70 bg-paper-alt px-6 py-16">
      <div className="container">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-ink md:text-2xl">
            Próximas pachangas
          </h2>
          <Link
            href="/pachangas"
            className="font-hand text-sm text-ink-2 transition-colors hover:text-lime-deep"
          >
            ver todas →
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {FEATURED.map((m) => (
            <li key={m.id}>
              <PachangaCard {...m} href={`/pachangas/${m.id}`} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
