"use client";

import { useEffect, useState } from "react";
import {
  isPushSupported,
  getCurrentSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPush,
} from "@/lib/push-client";
import { NeoButton } from "@/components/ui/neo-button";
import { cn } from "@/lib/utils";

type Status = "loading" | "unsupported" | "default" | "denied" | "subscribed";

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
      setStatus(sub ? "subscribed" : "default");
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
    </div>
  );
}
