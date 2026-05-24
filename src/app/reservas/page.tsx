"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabs } from "@/components/layout/mobile-tabs";
import { NeoButton } from "@/components/ui/neo-button";
import {
  COURTS,
  BOOKING_HOURS,
  BOOKING_GRID,
  BOOKING_MOBILE_SLOTS,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { BookingState } from "@/lib/types";

/* ── helpers ─────────────────────────────────────────────────── */

function cellLabel(state: BookingState) {
  if (state === 1) return "TU";
  return null;
}

function priceForHours(count: number) {
  return `${count * 6} €`; // e.g. "12 €"
}

function durationLabel(count: number) {
  return `${count}h`;
}

/* ── page component ──────────────────────────────────────────── */

export default function ReservasPage() {
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [selectedHours, setSelectedHours] = useState<number[]>([]);
  const [selectedMobileSlot, setSelectedMobileSlot] = useState<number | null>(
    null,
  );

  /* Desktop grid: toggle hour cell if it is free (state 0) */
  function toggleDesktopCell(courtIdx: number, hourIdx: number) {
    const state = BOOKING_GRID[courtIdx][hourIdx];
    if (state !== 0) return; // only free cells are clickable

    setSelectedCourt(courtIdx);
    setSelectedHours((prev) => {
      if (prev.includes(hourIdx)) {
        const next = prev.filter((h) => h !== hourIdx);
        if (next.length === 0) setSelectedCourt(null);
        return next;
      }
      return [...prev, hourIdx].sort((a, b) => a - b);
    });
  }

  /* Derive cell state with user selection overlaid */
  function resolvedState(courtIdx: number, hourIdx: number): BookingState {
    if (courtIdx === selectedCourt && selectedHours.includes(hourIdx)) return 1;
    return BOOKING_GRID[courtIdx][hourIdx];
  }

  /* Desktop summary info */
  const hasDesktopSelection = selectedCourt !== null && selectedHours.length > 0;
  const desktopSummary = hasDesktopSelection
    ? {
        court: COURTS[selectedCourt!].name,
        from: `${BOOKING_HOURS[selectedHours[0]]}:00`,
        to: `${Number(BOOKING_HOURS[selectedHours[selectedHours.length - 1]]) + 1}:00`,
        duration: durationLabel(selectedHours.length),
        price: priceForHours(selectedHours.length),
      }
    : null;

  /* Mobile summary info */
  const hasMobileSelection =
    selectedCourt !== null && selectedMobileSlot !== null;
  const mobileSummary = hasMobileSelection
    ? {
        court: COURTS[selectedCourt!].name,
        slot: BOOKING_MOBILE_SLOTS[selectedMobileSlot!],
        price: "9 €",
      }
    : null;

  return (
    <>
      <SiteHeader variant="paper" active="Pistas" />

      <main className="min-h-screen bg-paper pb-28 md:pb-0">
        {/* ── DESKTOP VIEW ─────────────────────────────────── */}
        <section className="hidden md:block">
          {/* Date nav + legend */}
          <div className="flex items-center justify-between border-b-[1.5px] border-ink bg-paper px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                aria-label="Dia anterior"
                className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-ink text-sm font-bold text-ink transition-colors hover:bg-fill-alt"
              >
                &larr;
              </button>
              <span className="text-sm font-bold text-ink">Mar 20</span>
              <button
                aria-label="Dia siguiente"
                className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-ink text-sm font-bold text-ink transition-colors hover:bg-fill-alt"
              >
                &rarr;
              </button>
              <span className="ml-2 text-sm text-ink-2">
                Martes 20 de mayo
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4">
              <LegendDot color="bg-fill border-muted" label="libre" />
              <LegendDot color="bg-[#cfe8ff] border-[#cfe8ff]" label="pachanga" />
              <LegendDot color="bg-fill-alt border-fill-alt" label="reservada" />
              <LegendDot color="bg-lime border-lime-deep" label="tu seleccion" />
            </div>
          </div>

          {/* Booking grid */}
          <div className="overflow-x-auto px-6 py-5">
            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: `120px repeat(${BOOKING_HOURS.length}, minmax(56px, 1fr))`,
              }}
            >
              {/* Header row: empty corner + hour labels */}
              <div />
              {BOOKING_HOURS.map((h) => (
                <div
                  key={h}
                  className="flex h-7 items-center justify-center text-xs font-bold text-muted"
                >
                  {h}:00
                </div>
              ))}

              {/* Court rows */}
              {COURTS.map((court, ci) => (
                <>
                  {/* Court label */}
                  <div
                    key={`label-${court.id}`}
                    className="flex h-9 items-center text-sm font-bold text-ink"
                  >
                    {court.name}
                  </div>

                  {/* Hour cells */}
                  {BOOKING_HOURS.map((_, hi) => {
                    const state = resolvedState(ci, hi);
                    return (
                      <button
                        key={`${court.id}-${hi}`}
                        disabled={state === 2 || state === 3}
                        onClick={() => toggleDesktopCell(ci, hi)}
                        className={cn(
                          "flex h-9 items-center justify-center rounded text-[10px] font-semibold transition-colors",
                          state === 0 &&
                            "border border-dashed border-muted/50 bg-transparent hover:border-lime hover:bg-lime/20",
                          state === 1 &&
                            "border-2 border-lime-deep bg-lime text-ink-2",
                          state === 2 &&
                            "border border-dashed border-[#cfe8ff] bg-[#cfe8ff] text-ink-2 cursor-default",
                          state === 3 &&
                            "border border-dashed border-fill-alt bg-fill-alt text-muted cursor-default",
                        )}
                      >
                        {cellLabel(state)}
                      </button>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          {/* Selection summary bar */}
          {desktopSummary && (
            <div className="mx-6 mb-6 flex items-center justify-between rounded-xl border-2 border-lime-deep bg-lime-soft px-5 py-3">
              <div className="flex items-center gap-4 text-sm text-ink">
                <span className="font-bold">{desktopSummary.court}</span>
                <span className="text-ink-2">
                  {desktopSummary.from} &ndash; {desktopSummary.to}
                </span>
                <span className="text-ink-2">{desktopSummary.duration}</span>
                <span className="font-bold text-ink">
                  {desktopSummary.price}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <NeoButton variant="ghost" size="sm">
                  Crear pachanga aqui
                </NeoButton>
                <NeoButton variant="primary" size="sm">
                  Reservar
                </NeoButton>
              </div>
            </div>
          )}
        </section>

        {/* ── MOBILE VIEW ──────────────────────────────────── */}
        <section className="md:hidden">
          {/* Title + date nav */}
          <div className="border-b-[1.5px] border-ink bg-paper px-4 py-4">
            <h1 className="text-lg font-extrabold text-ink">Reservar pista</h1>
            <div className="mt-2 flex items-center gap-3">
              <button
                aria-label="Dia anterior"
                className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-ink text-xs font-bold text-ink"
              >
                &larr;
              </button>
              <span className="text-sm font-bold text-ink">Mar 20</span>
              <button
                aria-label="Dia siguiente"
                className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-ink text-xs font-bold text-ink"
              >
                &rarr;
              </button>
              <span className="ml-1 text-sm text-ink-2">
                Martes 20 de mayo
              </span>
            </div>
          </div>

          <div className="space-y-6 px-4 py-5">
            {/* Step 1: Court selection */}
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
                1. Pista
              </h2>
              <div className="mt-2 flex gap-2">
                {COURTS.map((court, i) => (
                  <button
                    key={court.id}
                    onClick={() => setSelectedCourt(i)}
                    className={cn(
                      "flex h-10 flex-1 items-center justify-center rounded-full border-[1.5px] text-sm font-bold transition-colors",
                      selectedCourt === i
                        ? "border-lime-deep bg-lime text-ink"
                        : "border-ink bg-fill text-ink hover:bg-paper-alt",
                    )}
                  >
                    P{i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Time slot selection */}
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-widest2 text-muted">
                2. Franja
              </h2>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {BOOKING_MOBILE_SLOTS.map((slot, i) => {
                  /* Mark slot index 3 (19:00) as occupied for demo */
                  const isOccupied = i === 3;
                  const isSelected = selectedMobileSlot === i && !isOccupied;

                  return (
                    <button
                      key={slot}
                      disabled={isOccupied}
                      onClick={() => setSelectedMobileSlot(i)}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-lg border-[1.5px] text-sm font-semibold transition-colors",
                        isOccupied &&
                          "border-fill-alt bg-fill-alt text-muted line-through cursor-default",
                        isSelected &&
                          "border-lime-deep bg-lime text-ink",
                        !isOccupied &&
                          !isSelected &&
                          "border-ink bg-fill text-ink hover:bg-paper-alt",
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky bottom summary */}
          {mobileSummary && (
            <div className="fixed inset-x-0 bottom-14 z-20 border-t-[1.5px] border-ink bg-paper px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-ink">
                  {mobileSummary.court}
                </span>
                <span className="text-ink-2">{mobileSummary.slot}</span>
                <span className="font-bold text-ink">{mobileSummary.price}</span>
              </div>
              <NeoButton variant="primary" size="md" full>
                Reservar pista
              </NeoButton>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
      <MobileTabs active="Pistas" />
    </>
  );
}

/* ── small sub-components ────────────────────────────────────── */

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn("inline-block h-3 w-3 rounded border", color)}
      />
      <span className="text-xs text-ink-2">{label}</span>
    </div>
  );
}
