"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-16 animate-pulse rounded-full bg-fill" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-8 items-center rounded-full border-[1.5px] border-ink bg-lime px-3 text-xs font-bold text-ink shadow-neo-sm transition-transform hover:translate-x-px hover:translate-y-px hover:shadow-none"
      >
        Entrar
      </Link>
    );
  }

  const initials = session.user.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/perfil"
        className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-ink bg-lime text-xs font-bold text-ink"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="hidden text-xs font-medium text-muted hover:text-ink md:block"
      >
        Salir
      </button>
    </div>
  );
}

export function UserMenuNavy() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-16 animate-pulse rounded-full bg-navy" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-8 items-center rounded-full border-[1.5px] border-lime px-3 text-xs font-bold text-lime transition-colors hover:bg-lime hover:text-navy"
      >
        Entrar
      </Link>
    );
  }

  const initials = session.user.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/perfil"
        className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-lime bg-lime text-xs font-bold text-ink"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </Link>
    </div>
  );
}
