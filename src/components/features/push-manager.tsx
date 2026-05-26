"use client";

import { useEffect, useState } from "react";
import {
  isPushSupported,
  getCurrentSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPush,
} from "@/lib/services/push-client";
import { NeoButton } from "@/components/ui/neo-button";
import { cn } from "@/lib/utils";

type Status = "loading" | "unsupported" | "default" | "denied" | "subscribed";

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

export function PushManager({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    getCurrentSubscription().then((sub) => {
      if (sub) {
        setStatus("subscribed");
        // Re-sync subscription with server on every load
        fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        }).catch(() => {});
      } else {
        setStatus("default");
      }
    });
  }, []);

  async function handleSubscribe() {
    try {
      await subscribeToPush();
      setStatus("subscribed");
      setMessage("Notificaciones activadas");
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.includes("denied")
      ) {
        setStatus("denied");
        setMessage("Permiso denegado por el navegador");
      } else {
        setMessage("Error al activar notificaciones");
      }
    }
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleUnsubscribe() {
    await unsubscribeFromPush();
    setStatus("default");
    setMessage("Notificaciones desactivadas");
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleTestPush() {
    setSending(true);
    try {
      const result = await sendTestPush({
        title: "Pachanga en 1 hora",
        body: "Tu pachanga empieza a las 19:00 en Pista 1 outdoor. 3 confirmados, falta 1.",
        url: "/pachangas/1",
      });
      if (result.sent > 0) {
        setMessage(`Enviada a ${result.sent} dispositivo(s)`);
      } else if (result.failed > 0) {
        setMessage(`Fallo al enviar (${result.failed} error(es)). Mira la consola.`);
      } else {
        setMessage("No hay suscripciones activas. Desactiva y vuelve a activar.");
      }
    } catch {
      setMessage("Error de red al enviar la notificación");
    }
    setSending(false);
    setTimeout(() => setMessage(""), 3000);
  }

  if (status === "loading") return null;

  return (
    <div
      className={cn(
        "rounded-lg border-[1.5px] border-ink bg-fill p-4",
        className,
      )}
    >
      <div className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
        Notificaciones push
      </div>

      {status === "unsupported" && (
        <p className="mt-2 text-sm text-ink-2">
          Tu navegador no soporta notificaciones push.
        </p>
      )}

      {status === "denied" && (
        <p className="mt-2 text-sm text-ink-2">
          Las notificaciones están bloqueadas. Actívalas desde la configuración
          del navegador.
        </p>
      )}

      {status === "default" && (
        <div className="mt-3">
          <p className="text-sm text-ink-2">
            Recibe avisos de pachangas, recordatorios y plazas libres.
          </p>
          <div className="mt-3">
            <NeoButton
              variant="primary"
              size="sm"
              onClick={handleSubscribe}
            >
              Activar notificaciones
            </NeoButton>
          </div>
        </div>
      )}

      {status === "subscribed" && (
        <div className="mt-3">
          <p className="text-sm text-lime-deep font-semibold">
            ✓ Notificaciones activas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <NeoButton
              variant="primary"
              size="sm"
              onClick={handleTestPush}
              disabled={sending}
            >
              {sending ? "Enviando…" : "Enviar push de prueba"}
            </NeoButton>
            <NeoButton
              variant="ghost"
              size="sm"
              onClick={handleUnsubscribe}
            >
              Desactivar
            </NeoButton>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-2 font-hand text-sm text-lime-deep">{message}</p>
      )}

      {!isStandalone() && <InstallHint />}
    </div>
  );
}

function InstallHint() {
  const [open, setOpen] = useState(false);
  const ios = isIOS();
  const android = isAndroid();

  return (
    <div className="mt-4 rounded-lg border-[1.5px] border-dashed border-muted bg-paper-alt p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-2">
          {ios
            ? "En iPhone, instala la app para recibir notificaciones."
            : "Instala la app para no perderte ninguna notificacion."}
        </p>
        <button
          onClick={() => setOpen(!open)}
          className="ml-2 shrink-0 text-xs font-bold text-lime-deep underline"
        >
          {open ? "Cerrar" : "Saber mas"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2.5">
          {ios ? (
            <>
              <HintStep n={1} text='Abre esta pagina en Safari' />
              <HintStep n={2} text='Pulsa el icono de compartir (cuadrado con flecha)' />
              <HintStep n={3} text='Baja y pulsa "Añadir a pantalla de inicio"' />
              <HintStep n={4} text='Pulsa "Añadir"' />
              <HintStep n={5} text='Abre la app y activa notificaciones en Ajustes > Notificaciones > Montesiña' />
            </>
          ) : android ? (
            <>
              <HintStep n={1} text='Pulsa el menu (tres puntos) del navegador' />
              <HintStep n={2} text='Pulsa "Instalar aplicacion"' />
              <HintStep n={3} text='Confirma y se añadira a tu pantalla de inicio' />
            </>
          ) : (
            <>
              <HintStep n={1} text='En Chrome, pulsa el icono de instalar en la barra de URL' />
              <HintStep n={2} text='O ve al menu > "Instalar Montesiña Padel"' />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function HintStep({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-[10px] font-bold text-ink">
        {n}
      </span>
      <span className="text-xs text-ink">{text}</span>
    </div>
  );
}
