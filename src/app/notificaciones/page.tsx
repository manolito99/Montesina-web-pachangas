"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { FilterChip } from "@/components/ui/filter-chip";
import { PushManager } from "@/components/features/push-manager";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICON_BG: Record<string, string> = {
  ok: "bg-lime",
  warn: "bg-[#ffd9b3]",
  lime: "bg-lime",
  neutral: "bg-fill",
};

type Filter = "all" | "unread" | "reminder";

const FILTERS: { label: string; value: Filter }[] = [
  { label: `Todas (${NOTIFICATIONS.length})`, value: "all" },
  {
    label: `Sin leer (${NOTIFICATIONS.filter((n) => !n.read).length})`,
    value: "unread",
  },
  { label: "Recordatorios", value: "reminder" },
];

export default function NotificacionesPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = NOTIFICATIONS.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "reminder") return n.icon === "⏰";
    return true;
  });

  return (
    <>
      <SiteHeader variant="paper" />

      <main className="min-h-screen bg-paper p-4 md:p-6">
        <div className="container max-w-2xl">
          <h1 className="text-2xl font-extrabold text-ink">Notificaciones</h1>

          <PushManager className="mt-4" />

          {/* Filter chips */}
          <div className="mt-4 flex gap-2">
            {FILTERS.map((f) => (
              <FilterChip
                key={f.value}
                label={f.label}
                active={filter === f.value}
                onClick={() => setFilter(f.value)}
              />
            ))}
          </div>

          {/* Notification list */}
          <div className="mt-5 overflow-hidden rounded-lg border-[1.5px] border-ink bg-fill">
            {filtered.map((n, i) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3",
                  i > 0 && "border-t border-fill-alt",
                  !n.read ? "bg-lime-soft" : "bg-fill",
                )}
              >
                {/* Icon circle */}
                <span
                  className={cn(
                    "mt-0.5 flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-ink",
                    ICON_BG[n.kind] ?? "bg-fill",
                  )}
                  style={{ width: 26, height: 26 }}
                  aria-hidden
                >
                  {n.icon}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm text-ink",
                      !n.read ? "font-bold" : "font-normal",
                    )}
                  >
                    {n.text}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">{n.time}</p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-lime-deep"
                    aria-label="Sin leer"
                  />
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center font-hand text-sm text-muted">
                No hay notificaciones en este filtro.
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileTabs active="Inicio" />
    </>
  );
}
