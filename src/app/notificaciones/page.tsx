"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { PushManager } from "@/components/features/push-manager";
import { NeoButton } from "@/components/ui/neo-button";
import { cn } from "@/lib/utils";

interface Prefs {
  newPachanga: boolean;
  onlyMyLevel: boolean;
  catMasculino: boolean;
  catFemenino: boolean;
  catMixto: boolean;
  plazaLibre: boolean;
  recordatorio: boolean;
  minutesBefore: number;
  alguienSeApunta: boolean;
  courtId: string | null;
}

interface CourtOption {
  id: string;
  name: string;
  isClub: boolean;
}

const DEFAULT_PREFS: Prefs = {
  newPachanga: true,
  onlyMyLevel: true,
  catMasculino: true,
  catFemenino: true,
  catMixto: true,
  plazaLibre: false,
  recordatorio: true,
  minutesBefore: 60,
  alguienSeApunta: true,
  courtId: null,
};

export default function NotificacionesPage() {
  const { data: session, status: authStatus } = useSession();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [courts, setCourts] = useState<CourtOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/courts")
      .then((r) => r.json())
      .then(setCourts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setLoading(false);
      return;
    }
    fetch("/api/notifications/prefs")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setPrefs({
            newPachanga: data.newPachanga,
            onlyMyLevel: data.onlyMyLevel,
            catMasculino: data.catMasculino,
            catFemenino: data.catFemenino,
            catMixto: data.catMixto,
            plazaLibre: data.plazaLibre,
            recordatorio: data.recordatorio,
            minutesBefore: data.minutesBefore,
            alguienSeApunta: data.alguienSeApunta,
            courtId: data.courtId,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authStatus]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/notifications/prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  }

  function toggle(key: keyof Prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <>
      <SiteHeader variant="paper" />

      <main className="min-h-screen bg-paper p-4 md:p-6">
        <div className="container max-w-2xl">
          <h1 className="text-2xl font-extrabold text-ink">Notificaciones</h1>

          <PushManager className="mt-4" />

          {authStatus !== "authenticated" ? (
            <div className="mt-6 rounded-lg border-[1.5px] border-dashed border-muted p-6 text-center">
              <p className="text-sm text-ink-2">
                Inicia sesión para configurar tus preferencias de notificación.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-block text-sm font-bold text-lime-deep"
              >
                Entrar →
              </Link>
            </div>
          ) : loading ? (
            <div className="mt-6 text-center font-hand text-muted">
              Cargando preferencias...
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* ── Sección: Nuevas pachangas ── */}
              <PrefsSection title="Nuevas pachangas" icon="🏸">
                <ToggleRow
                  label="Avísame cuando se cree una pachanga nueva"
                  checked={prefs.newPachanga}
                  onChange={() => toggle("newPachanga")}
                />

                {prefs.newPachanga && (
                  <div className="ml-6 mt-3 space-y-3 border-l-2 border-lime pl-4">
                    <ToggleRow
                      label="Solo pachangas en mi rango de nivel"
                      checked={prefs.onlyMyLevel}
                      onChange={() => toggle("onlyMyLevel")}
                      small
                    />

                    <div>
                      <p className="text-xs font-semibold text-ink-2">Categorías:</p>
                      <div className="mt-1.5 flex gap-2">
                        <CatToggle label="Masculino" color="bg-cat-masc" checked={prefs.catMasculino} onChange={() => toggle("catMasculino")} />
                        <CatToggle label="Femenino" color="bg-cat-fem" checked={prefs.catFemenino} onChange={() => toggle("catFemenino")} />
                        <CatToggle label="Mixto" color="bg-cat-mix" checked={prefs.catMixto} onChange={() => toggle("catMixto")} />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-ink-2">Pista preferida:</p>
                      <select
                        value={prefs.courtId ?? ""}
                        onChange={(e) => setPrefs((p) => ({ ...p, courtId: e.target.value || null }))}
                        className="mt-1.5 rounded-md border-[1.5px] border-ink bg-fill px-3 py-1.5 text-xs text-ink"
                      >
                        <option value="">Cualquier pista</option>
                        {courts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.isClub ? "(club)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </PrefsSection>

              {/* ── Sección: Plaza libre ── */}
              <PrefsSection title="Plazas libres" icon="🔓">
                <ToggleRow
                  label="Avísame cuando se libere una plaza en una pachanga llena"
                  checked={prefs.plazaLibre}
                  onChange={() => toggle("plazaLibre")}
                />
              </PrefsSection>

              {/* ── Sección: Mis pachangas ── */}
              <PrefsSection title="Mis pachangas" icon="👥">
                <ToggleRow
                  label="Avísame cuando alguien se apunte a una pachanga que he creado"
                  checked={prefs.alguienSeApunta}
                  onChange={() => toggle("alguienSeApunta")}
                />
              </PrefsSection>

              {/* ── Sección: Recordatorios ── */}
              <PrefsSection title="Recordatorios" icon="⏰">
                <ToggleRow
                  label="Recuérdame antes de una pachanga a la que estoy apuntado"
                  checked={prefs.recordatorio}
                  onChange={() => toggle("recordatorio")}
                />

                {prefs.recordatorio && (
                  <div className="ml-6 mt-3 border-l-2 border-lime pl-4">
                    <p className="text-xs font-semibold text-ink-2">¿Cuánto antes?</p>
                    <div className="mt-1.5 flex gap-2">
                      {[
                        { value: 30, label: "30 min" },
                        { value: 60, label: "1 hora" },
                        { value: 120, label: "2 horas" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPrefs((p) => ({ ...p, minutesBefore: opt.value }))}
                          className={cn(
                            "rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                            prefs.minutesBefore === opt.value
                              ? "border-lime-deep bg-lime text-ink"
                              : "border-ink bg-fill text-ink",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </PrefsSection>

              {/* ── Guardar ── */}
              <div className="flex items-center gap-3 pt-2">
                <NeoButton
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Guardando…" : "Guardar preferencias"}
                </NeoButton>
                {saved && (
                  <span className="font-hand text-sm text-lime-deep">
                    ✓ Guardado
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
      <MobileTabs active="Inicio" />
    </>
  );
}

function PrefsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border-[1.5px] border-ink bg-fill p-4">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-bold text-ink">{title}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  small,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  small?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative inline-flex shrink-0 rounded-full border-[1.5px] border-ink transition-colors",
          small ? "h-5 w-9" : "h-6 w-10",
          checked ? "bg-lime" : "bg-fill-alt",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 rounded-full border-[1.2px] border-ink bg-fill transition-transform",
            small ? "h-3.5 w-3.5" : "h-4 w-4",
            checked
              ? small ? "translate-x-[15px]" : "translate-x-[17px]"
              : "translate-x-0.5",
          )}
        />
      </button>
      <span className={cn("text-ink", small ? "text-xs" : "text-sm")}>
        {label}
      </span>
    </label>
  );
}

function CatToggle({
  label,
  color,
  checked,
  onChange,
}: {
  label: string;
  color: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-bold transition-all",
        checked
          ? "border-ink bg-fill text-ink"
          : "border-muted/50 bg-fill text-muted line-through opacity-50",
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </button>
  );
}
