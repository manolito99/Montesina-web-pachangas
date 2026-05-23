import Link from "next/link";
import FlatLogo from "@/assets/logo-montesina-flat.svg";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NeoCard } from "@/components/ui/neo-card";

const VARIANTS = [
  {
    id: "a",
    href: "/home-a",
    title: "A · Clásico paper",
    description:
      "Hero centrado en paper con el logo grande y el reveal al scroll. Bajo el hero, una grid de 3 próximas pachangas.",
    palette: ["bg-paper", "bg-paper-alt", "bg-lime", "bg-ink"],
    tag: "minimalista",
  },
  {
    id: "b",
    href: "/home-b",
    title: "B · Split navy + paper",
    description:
      "Mitad izquierda navy con el headline lime, mitad derecha paper con la agenda densa de hoy. Brand + utilidad en partes iguales.",
    palette: ["bg-navy", "bg-lime", "bg-paper", "bg-cat-fem"],
    tag: "utilitario",
  },
  {
    id: "c",
    href: "/home-c",
    title: "C · Inmersivo navy",
    description:
      "Hero full-bleed navy con el reveal del logo protagonista. Tras el hero, sección paper con contadores por categoría.",
    palette: ["bg-navy-deep", "bg-navy", "bg-lime", "bg-paper"],
    tag: "dramático",
  },
];

export default function ChooserPage() {
  return (
    <>
      <SiteHeader variant="paper" />
      <main className="px-6 py-12 md:py-20">
        <div className="container">
          <div className="max-w-2xl">
            <p className="font-hand text-sm text-muted tracking-widest2">
              MONTESIÑA · DIRECCIÓN VISUAL
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
              Elige la variante de Home
            </h1>
            <p className="mt-4 text-balance text-ink-2 md:text-lg">
              Tres aproximaciones al mismo objetivo: presentar el club y llevar
              al socio a apuntarse a una pachanga. Abre cada una en vivo y
              dime cuál sube a producción.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {VARIANTS.map((v) => (
              <li key={v.id}>
                <Link href={v.href} className="group block">
                  <NeoCard className="h-full overflow-hidden transition-transform group-hover:-translate-y-0.5 group-hover:shadow-neo-lg">
                    <VariantPreview id={v.id} />
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-ink">
                          {v.title}
                        </h2>
                        <span className="font-hand text-xs uppercase tracking-widest2 text-lime-deep">
                          {v.tag}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-ink-2">{v.description}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          {v.palette.map((c, i) => (
                            <span
                              key={i}
                              className={`h-3 w-3 rounded-full border border-ink ${c}`}
                              aria-hidden
                            />
                          ))}
                        </div>
                        <span className="ml-auto font-hand text-sm text-lime-deep">
                          ver →
                        </span>
                      </div>
                    </div>
                  </NeoCard>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-16 rounded-lg border border-dashed border-muted/70 bg-fill/60 p-6 text-sm text-ink-2">
            <p className="font-hand text-base">
              💡 Cuando decidas, la variante elegida se mueve a <code>/</code> y
              las otras dos se borran (o se dejan accesibles para A/B testing).
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function VariantPreview({ id }: { id: string }) {
  if (id === "a") {
    return (
      <div className="h-44 bg-paper p-5 flex flex-col items-center justify-center border-b-[1.5px] border-ink">
        <FlatLogo className="h-10 w-10 text-lime-deep" aria-hidden />
        <div className="mt-3 h-2 w-32 rounded bg-ink/80" />
        <div className="mt-1.5 h-1.5 w-20 rounded bg-muted/70" />
        <div className="mt-3 flex gap-2">
          <span className="h-5 w-16 rounded-full border border-ink bg-lime" />
          <span className="h-5 w-16 rounded-full border border-ink bg-paper-alt" />
        </div>
      </div>
    );
  }
  if (id === "b") {
    return (
      <div className="grid h-44 grid-cols-2 border-b-[1.5px] border-ink">
        <div className="flex flex-col items-start justify-between bg-navy p-3">
          <FlatLogo className="h-8 w-8 text-lime" aria-hidden />
          <div>
            <div className="h-2 w-16 rounded bg-lime" />
            <div className="mt-1 h-2 w-12 rounded bg-foam-muted" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 bg-paper p-3">
          <div className="h-3 rounded bg-fill border border-ink" />
          <div className="h-3 rounded bg-fill border-[2px] border-lime-deep" />
          <div className="h-3 rounded bg-fill border border-ink" />
          <div className="h-3 rounded bg-fill border border-ink" />
        </div>
      </div>
    );
  }
  // c
  return (
    <div className="relative h-44 overflow-hidden border-b-[1.5px] border-ink bg-radial-navy">
      <div className="absolute inset-0 flex items-center justify-center">
        <FlatLogo
          className="h-16 w-16 text-lime drop-shadow-[0_0_18px_rgba(212,242,92,0.6)]"
          aria-hidden
        />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-hand text-[10px] text-lime">
        ↓ scroll
      </div>
    </div>
  );
}
