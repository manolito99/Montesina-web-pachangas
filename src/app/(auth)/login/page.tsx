"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FlatLogo from "@/assets/logo-montesina-flat.svg";
import StagLogo from "@/assets/logo-montesina.svg";
import { NeoButton } from "@/components/ui/neo-button";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <BrandPanel />
      <FormPanel />
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="hidden flex-col justify-between bg-navy p-10 text-foam md:flex lg:p-16">
      <FlatLogo className="h-7 w-7 text-lime" aria-hidden />
      <div className="flex justify-center">
        <StagLogo className="h-52 w-auto text-lime drop-shadow-[0_0_36px_rgba(212,242,92,0.4)]" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold">Bienvenido al club.</h2>
        <p className="mt-1 text-sm text-foam-muted">
          Apúntate a pachangas, reserva pistas, organiza tus partidos.
        </p>
      </div>
    </div>
  );
}

function FormPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/pachangas");
      router.refresh();
    }
  }

  async function handleGoogleSignIn() {
    await signIn("google", { callbackUrl: "/pachangas" });
  }

  return (
    <div className="flex flex-col justify-center bg-paper px-6 py-16 md:px-12 lg:px-20">
      <div className="mb-8 flex justify-center md:hidden">
        <FlatLogo className="h-10 w-10 text-lime-deep" aria-hidden />
      </div>

      <h1 className="text-2xl font-extrabold text-ink">Entrar</h1>
      <p className="mt-1 text-sm text-ink-2">
        ¿Aún no eres socio?{" "}
        <Link href="/registro" className="font-bold text-lime-deep">
          Crea tu cuenta →
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
            Contraseña
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="mt-1 block w-full rounded-md border-[1.5px] border-ink bg-fill px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-lime"
          />
        </label>

        {error && (
          <p className="text-sm font-semibold text-rose">{error}</p>
        )}

        <div className="mt-2">
          <NeoButton type="submit" variant="primary" full disabled={loading}>
            {loading ? "Entrando…" : "Entrar →"}
          </NeoButton>
        </div>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-muted/40" />
          <span className="text-xs text-muted">o continuar con</span>
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
  );
}
