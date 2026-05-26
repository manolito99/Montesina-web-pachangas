"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LevelBalls } from "@/components/ui/level-balls";
import { NeoButton } from "@/components/ui/neo-button";

export function CompleteProfile() {
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | null>(null);
  const [level, setLevel] = useState(3);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user && !data.user.profileCompleted) {
          setShow(true);
        }
      })
      .catch(() => {});
  }, [status]);

  if (!show) return null;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, level }),
      });
      if (res.ok) {
        setShow(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4">
      <div className="w-full max-w-sm rounded-xl border-[2px] border-ink bg-paper p-6 shadow-neo">
        <h2 className="text-lg font-extrabold text-ink">Completa tu perfil</h2>
        <p className="mt-1 font-hand text-sm text-muted">
          Necesitamos saber tu genero y nivel para organizar las pachangas correctamente.
        </p>

        <div className="mt-5">
          <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
            Genero
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
                  "rounded-full border-[1.2px] px-4 py-2 text-sm font-semibold",
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

        <div className="mt-5">
          <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
            Nivel de juego
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLevel(Math.max(1, level - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full border-[1.2px] border-ink bg-fill text-sm font-bold"
              >
                -
              </button>
              <LevelBalls value={level} size={16} />
              <button
                type="button"
                onClick={() => setLevel(Math.min(5, level + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full border-[1.2px] border-ink bg-fill text-sm font-bold"
              >
                +
              </button>
            </div>
            <span className="font-hand text-sm text-ink-2">
              nivel {level}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <NeoButton onClick={handleSave} disabled={saving || !gender} className="w-full">
            {saving ? "Guardando..." : !gender ? "Selecciona tu genero" : "Guardar"}
          </NeoButton>
        </div>
      </div>
    </div>
  );
}
