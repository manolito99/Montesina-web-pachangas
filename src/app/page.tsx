import Link from "next/link";
import FlatLogo from "@/assets/logo-montesina-flat.svg";
import { LogoReveal } from "@/components/layout/logo-reveal";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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

export default function Home() {
  return (
    <>
      <SiteHeader variant="navy-fade" />
      <main className="pb-12">
        <MobileHero />
        <DesktopHero />
        <FeaturedSection />
      </main>
      <SiteFooter />
      <MobileTabs active="Inicio" />
    </>
  );
}

function MobileHero() {
  return (
    <section className="bg-navy px-6 pb-10 pt-20 text-foam md:hidden">
      <p className="font-hand text-xs uppercase tracking-widest2 text-lime">
        MONTESIÑA PADEL CLUB · SINCE &apos;94
      </p>

      <div className="my-10 flex justify-center">
        <FlatLogo
          className="h-44 w-44 text-lime drop-shadow-[0_0_36px_rgba(212,242,92,0.4)]"
          aria-hidden
        />
      </div>

      <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight">
        Juega. Apúntate.
        <br />
        <span className="text-lime">Compite.</span>
      </h1>
      <p className="mt-3 max-w-sm text-sm text-foam-muted">
        Pachangas de pádel del club, organizadas entre socios. Masculino,
        femenino y mixto.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <NeoLinkButton href="/pachangas" variant="primary" full>
          Apuntarme a una pachanga →
        </NeoLinkButton>
        <NeoLinkButton href="/pachangas/nueva" variant="outlineLime" full>
          Crear pachanga
        </NeoLinkButton>
      </div>
    </section>
  );
}

function DesktopHero() {
  return (
    <section className="relative hidden bg-navy-deep md:block">
      <div className="container relative z-10 pt-12 text-center">
        <p className="font-hand text-sm text-lime tracking-widest2">
          MONTESIÑA PADEL CLUB · SINCE &apos;94
        </p>
      </div>

      <LogoReveal
        mode="navy"
        tagline=""
        showScrollHint
        trackHeight="180vh"
      />

      <div className="container relative z-10 -mt-44 text-center">
        <h1 className="text-6xl font-extrabold leading-[1.05] tracking-tight text-foam">
          Juega. Apúntate. <span className="text-lime">Compite.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-balance text-foam-muted text-lg">
          Pachangas de pádel del club, organizadas entre socios. Masculino,
          femenino y mixto.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <NeoLinkButton href="/pachangas" variant="primary" size="lg">
            Apuntarme a una pachanga →
          </NeoLinkButton>
          <NeoLinkButton href="/pachangas/nueva" variant="outlineLime" size="lg">
            Crear pachanga
          </NeoLinkButton>
        </div>
      </div>
    </section>
  );
}

function FeaturedSection() {
  return (
    <section className="border-t-[1.5px] border-ink bg-paper-alt px-6 py-16">
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
