"use client";

import { useEffect, useState } from "react";
import { NeoButton } from "@/components/ui/neo-button";
import { cn } from "@/lib/utils";

type Step = "install" | "notifications" | null;

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches
    || ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone);
}

const STORAGE_KEY = "montesina-onboarding-done";

export function InstallPrompt() {
  const [step, setStep] = useState<Step>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (/bot|crawl|spider|slurp|googlebot/i.test(navigator.userAgent)) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (isStandalone()) return;

    // Small delay so it doesn't flash on first paint
    const timer = setTimeout(() => setStep("install"), 1500);

    // Android: capture the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  function handleNext() {
    setStep("notifications");
  }

  async function handleEnableNotifications() {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    handleDismiss();
  }

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setStep(null);
  }

  async function handleAndroidInstall() {
    if (deferredPrompt && "prompt" in deferredPrompt) {
      (deferredPrompt as { prompt: () => void }).prompt();
    }
    handleNext();
  }

  if (!step) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm md:items-center">
      <div
        className={cn(
          "mx-4 mb-4 w-full max-w-md rounded-2xl border-[1.5px] border-ink bg-paper p-6 shadow-neo-lg md:mb-0",
          "animate-fade-up",
        )}
      >
        {step === "install" && <InstallStep
          isIOSDevice={isIOS()}
          isAndroidDevice={isAndroid()}
          hasDeferredPrompt={!!deferredPrompt}
          onAndroidInstall={handleAndroidInstall}
          onNext={handleNext}
          onDismiss={handleDismiss}
        />}
        {step === "notifications" && <NotificationsStep
          onEnable={handleEnableNotifications}
          onDismiss={handleDismiss}
        />}
      </div>
    </div>
  );
}

function InstallStep({
  isIOSDevice,
  isAndroidDevice,
  hasDeferredPrompt,
  onAndroidInstall,
  onNext,
  onDismiss,
}: {
  isIOSDevice: boolean;
  isAndroidDevice: boolean;
  hasDeferredPrompt: boolean;
  onAndroidInstall: () => void;
  onNext: () => void;
  onDismiss: () => void;
}) {
  return (
    <>
      <div className="text-center">
        <span className="text-3xl">📲</span>
        <h2 className="mt-3 text-lg font-extrabold text-ink">
          Instala Montesiña como app
        </h2>
        <p className="mt-2 text-sm text-ink-2">
          Accede más rápido, recibe notificaciones y úsala como una app nativa.
        </p>
      </div>

      <div className="mt-5 rounded-lg border-[1.5px] border-dashed border-muted bg-fill p-4">
        {isIOSDevice ? (
          <div className="space-y-3">
            <StepItem n={1} text='Pulsa los 3 puntos ··· abajo a la derecha en Safari' icon="···" />
            <StepItem n={2} text='Pulsa "Compartir" (abajo a la derecha)' icon="↑" />
            <StepItem n={3} text='Pulsa "Ver más" y busca "Añadir a pantalla de inicio"' icon="＋" />
            <StepItem n={4} text='Pulsa "Añadir" y se instalará' icon="✓" />
            <StepItem n={5} text='Abre la app desde el icono y activa las notificaciones' icon="🔔" />
          </div>
        ) : isAndroidDevice ? (
          hasDeferredPrompt ? (
            <div className="text-center">
              <p className="text-sm text-ink-2">
                Pulsa el botón para instalar la app directamente.
              </p>
              <div className="mt-3">
                <NeoButton variant="primary" size="sm" onClick={onAndroidInstall}>
                  Instalar app
                </NeoButton>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <StepItem n={1} text='Pulsa el menú ⋮ del navegador' icon="⋮" />
              <StepItem n={2} text='"Instalar aplicación"' icon="📱" />
              <StepItem n={3} text='Confirma y se añadirá al inicio' icon="✓" />
            </div>
          )
        ) : (
          <div className="space-y-3">
            <StepItem n={1} text='En Chrome, pulsa el icono de instalar en la barra de URL' icon="⊕" />
            <StepItem n={2} text='O ve a ⋮ → "Instalar Montesiña Padel"' icon="📱" />
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <NeoButton variant="primary" size="sm" full onClick={onNext}>
          Siguiente →
        </NeoButton>
        <NeoButton variant="ghost" size="sm" onClick={onDismiss}>
          Ahora no
        </NeoButton>
      </div>
    </>
  );
}

function NotificationsStep({
  onEnable,
  onDismiss,
}: {
  onEnable: () => void;
  onDismiss: () => void;
}) {
  const supported = typeof window !== "undefined" && "Notification" in window;
  const alreadyGranted = supported && Notification.permission === "granted";

  return (
    <>
      <div className="text-center">
        <span className="text-3xl">🔔</span>
        <h2 className="mt-3 text-lg font-extrabold text-ink">
          Activa las notificaciones
        </h2>
        <p className="mt-2 text-sm text-ink-2">
          Te avisamos cuando se cree una pachanga que te interese, cuando alguien se apunte o como recordatorio antes de jugar.
        </p>
      </div>

      <div className="mt-5 rounded-lg border-[1.5px] border-dashed border-muted bg-fill p-4">
        <div className="space-y-2.5">
          <BenefitItem icon="🏸" text="Nuevas pachangas en tu nivel y categoría" />
          <BenefitItem icon="👥" text="Alguien se apunta a tu pachanga" />
          <BenefitItem icon="🔓" text="Se libera una plaza en una pachanga llena" />
          <BenefitItem icon="⏰" text="Recordatorio antes de jugar" />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-lime-soft p-3">
        <p className="text-xs text-ink-2">
          <strong>Importante en iPhone:</strong> las notificaciones solo funcionan si instalas la app desde Safari (paso anterior). Después de instalar, actívalas desde Ajustes → Notificaciones → Montesiña.
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        {!alreadyGranted && supported ? (
          <NeoButton variant="primary" size="sm" full onClick={onEnable}>
            Activar notificaciones
          </NeoButton>
        ) : alreadyGranted ? (
          <NeoButton variant="primary" size="sm" full onClick={onDismiss}>
            ✓ Ya están activas — Continuar
          </NeoButton>
        ) : (
          <NeoButton variant="primary" size="sm" full onClick={onDismiss}>
            Entendido
          </NeoButton>
        )}
        <NeoButton variant="ghost" size="sm" onClick={onDismiss}>
          Saltar
        </NeoButton>
      </div>
    </>
  );
}

function StepItem({ n, text, icon }: { n: number; text: string; icon: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink bg-lime text-xs font-bold text-ink">
        {n}
      </span>
      <span className="flex-1 text-sm text-ink">{text}</span>
      <span className="text-lg">{icon}</span>
    </div>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-base">{icon}</span>
      <span className="text-sm text-ink">{text}</span>
    </div>
  );
}
