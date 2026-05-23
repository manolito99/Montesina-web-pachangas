import Link from "next/link";
import FlatLogo from "@/assets/logo-montesina-flat.svg";
import StagLogo from "@/assets/logo-montesina.svg";
import { NeoInput } from "@/components/ui/neo-input";
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

      <form className="mt-8 flex flex-col gap-3">
        <NeoInput label="Email" placeholder="tu@correo.com" type="email" name="email" />
        <NeoInput label="Contraseña" placeholder="••••••••" type="password" name="password" />

        <div className="mt-1 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border-[1.2px] border-ink bg-fill" />
            Recordarme
          </label>
          <span className="font-hand text-sm text-muted">
            ¿olvidaste tu contraseña?
          </span>
        </div>

        <div className="mt-5">
          <NeoButton type="submit" variant="primary" full>
            Entrar →
          </NeoButton>
        </div>
      </form>
    </div>
  );
}
