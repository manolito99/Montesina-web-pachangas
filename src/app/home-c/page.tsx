import Link from "next/link";
import { LogoReveal } from "@/components/logo-reveal";
import { MobileTabs } from "@/components/mobile-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CatChip, type Category, CATEGORY_LABEL } from "@/components/ui/cat-chip";
import { NeoCard } from "@/components/ui/neo-card";
import { PachangaCard } from "@/components/ui/pachanga-card";

const CATEGORIES: { cat: Category; n: number }[] = [
  { cat: "M", n: 7 },
  { cat: "F", n: 4 },
  { cat: "X", n: 9 },
];

const FEATURED = [
  { id: "1", cat: "X" as const, date: "HOY · 19:00", filled: 3, accent: true },
  {
    id: "2",
    cat: "M" as const,
    date: "HOY · 20:30",
    pista: "P1 · outdoor",
    nivel: 4,
    filled: 2,
    organizer: "Carlos R.",
  },
  {
    id: "3",
    cat: "F" as const,
    date: "MAÑ · 18:00",
    pista: "P2 · indoor",
    nivel: 2,
    filled: 3,
    organizer: "Lucía V.",
  },
];

export default function HomeC() {
  return (
    <>
      <SiteHeader variant="navy-fade" />
      <main>
        <LogoReveal mode="navy" tagline="EST. 1994 · Pádel · pachangas · pistas" />
        <CategoriesSection />
        <FeaturedSection />
      </main>
      <SiteFooter />
      <MobileTabs active="Inicio" />
    </>
  );
}

function CategoriesSection() {
  return (
    <section className="border-t-[1.5px] border-ink bg-paper px-6 py-16 md:py-24">
      <div className="container">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink md:text-4xl">
          ¿Para hoy o para esta semana?
        </h2>
        <p className="mt-2 text-sm text-ink-2 md:text-base">
          Tres tipos de partido. Apúntate o crea el tuyo.
        </p>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <li key={c.cat}>
              <Link
                href={`/pachangas?cat=${c.cat}`}
                className="group block"
              >
                <NeoCard className="h-full p-6 transition-transform group-hover:-translate-y-0.5 group-hover:shadow-neo-lg">
                  <CatChip cat={c.cat} />
                  <div className="mt-3 text-4xl font-extrabold text-ink">
                    {c.n}
                  </div>
                  <div className="text-xs text-ink-2">partidos esta semana</div>
                  <div className="mt-4 font-hand text-sm text-lime-deep">
                    ver {CATEGORY_LABEL[c.cat].toLowerCase()} →
                  </div>
                </NeoCard>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeaturedSection() {
  return (
    <section className="bg-paper-alt px-6 py-16">
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
