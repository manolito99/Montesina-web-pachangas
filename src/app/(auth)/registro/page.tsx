import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { NeoInput } from "@/components/ui/neo-input";
import { NeoButton } from "@/components/ui/neo-button";
import { LevelBalls } from "@/components/ui/level-balls";

export default function RegistroPage() {
  return (
    <>
      <SiteHeader variant="paper" />
      <main className="bg-paper px-6 py-10 md:py-16">
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Solo socios del club Montesiña.
          </p>

          <form className="mt-8">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <NeoInput label="Nombre" placeholder="Javi" name="nombre" />
              <NeoInput label="Apellido" placeholder="González" name="apellido" />
              <NeoInput label="Email" placeholder="javi@correo.com" type="email" name="email" />
              <NeoInput label="Contraseña" placeholder="mínimo 8 caracteres" type="password" name="password" />
            </div>

            <div className="mt-6">
              <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
                Género
              </div>
              <div className="mt-2 flex gap-2">
                {["Hombre", "Mujer", "Prefiero no decir"].map((g, i) => (
                  <span
                    key={g}
                    className={`rounded-full border-[1.2px] px-3 py-1.5 text-xs font-semibold ${
                      i === 0
                        ? "border-ink bg-lime font-bold"
                        : "border-ink bg-fill"
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
                Nivel de juego
              </div>
              <div className="mt-2 flex items-center gap-4">
                <LevelBalls value={3} size={16} />
                <span className="font-hand text-sm text-ink-2">
                  nivel 3 · intermedio
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <NeoButton type="submit" variant="primary">
                Crear cuenta →
              </NeoButton>
              <span className="font-hand text-sm text-muted">
                ya tengo cuenta ·{" "}
                <Link href="/login" className="font-bold text-lime-deep">
                  entrar
                </Link>
              </span>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
