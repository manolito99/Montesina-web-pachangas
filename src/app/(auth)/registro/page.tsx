"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { LevelBalls } from "@/components/ui/level-balls";
import { NeoButton } from "@/components/ui/neo-button";
import { cn } from "@/lib/utils";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [level, setLevel] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, gender, level }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear la cuenta");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/pachangas");
        router.refresh();
      }
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    await signIn("google", { callbackUrl: "/pachangas" });
  }

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

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">Nombre</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Javi González"
                  required
                  className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="javi@correo.com"
                  required
                  className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">Contraseña</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </label>
            </div>

            <div className="mt-6">
              <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
                Género
              </div>
              <div className="mt-2 flex gap-2">
                {([
                  { value: "MALE" as const, label: "Hombre" },
                  { value: "FEMALE" as const, label: "Mujer" },
                ]).map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(g.value)}
                    className={cn(
                      "rounded-full border-[1.2px] px-3 py-1.5 text-xs font-semibold",
                      gender === g.value
                        ? "border-ink bg-lime font-bold"
                        : "border-ink bg-fill",
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
                Nivel de juego
              </div>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLevel(Math.max(1, level - 1))}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-[1.2px] border-ink bg-fill text-xs font-bold"
                  >
                    -
                  </button>
                  <LevelBalls value={level} size={16} />
                  <button
                    type="button"
                    onClick={() => setLevel(Math.min(5, level + 1))}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-[1.2px] border-ink bg-fill text-xs font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="font-hand text-sm text-ink-2">
                  nivel {level}
                </span>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm font-semibold text-rose">{error}</p>
            )}

            <div className="mt-8">
              <NeoButton type="submit" variant="primary" disabled={loading}>
                {loading ? "Creando cuenta…" : "Crear cuenta →"}
              </NeoButton>
              <span className="ml-3 font-hand text-sm text-muted">
                ya tengo cuenta ·{" "}
                <Link href="/login" className="font-bold text-lime-deep">
                  entrar
                </Link>
              </span>
            </div>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted/40" />
              <span className="text-xs text-muted">o registrarse con</span>
              <div className="h-px flex-1 bg-muted/40" />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-ink bg-fill px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-alt"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
