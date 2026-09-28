import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Check, Clock, Route as RouteIcon } from "lucide-react";
import type { SlotOption } from "@/lib/booking";

interface VisualBookingCalendarProps {
  slots: SlotOption[];
  slotId: string;
  onSelectSlot: (slotId: string) => void;
  greenRouteDay?: string | undefined;
  sectorName?: string | undefined;
}

// Generate a stable fake viewer count per slot ID (deterministic)
function getViewers(slotId: string): number {
  const hash = slotId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash % 3) + 1; // 1, 2, or 3
}

export function VisualBookingCalendar({
  slots,
  slotId,
  onSelectSlot,
  greenRouteDay,
  sectorName,
}: VisualBookingCalendarProps) {
  // Extract distinct days from available slots
  const days = useMemo(() => {
    const map = new Map<string, SlotOption[]>();
    for (const slot of slots) {
      const existing = map.get(slot.day) || [];
      existing.push(slot);
      map.set(slot.day, existing);
    }
    return Array.from(map.entries()).map(([dayName, daySlots]) => {
      const isGreen = Boolean(
        greenRouteDay && greenRouteDay.toLowerCase() === dayName.toLowerCase(),
      );
      // derive formatted date from label if present: "Tuesday, Oct 7 — 09:00 AM"
      const datePart = daySlots[0]?.label.split(" — ")[0] || dayName;
      return {
        dayName,
        datePart,
        slots: daySlots,
        isGreen,
      };
    });
  }, [slots, greenRouteDay]);

  // Find day containing currently selected slot, or default to first day
  const selectedDayName = useMemo(() => {
    const matchedSlot = slots.find((s) => s.id === slotId);
    if (matchedSlot) return matchedSlot.day;
    return days[0]?.dayName ?? "";
  }, [slots, slotId, days]);

  const [activeDay, setActiveDay] = useState<string>(selectedDayName);

  // Sync activeDay if slots change
  const currentDay = days.find((d) => d.dayName === (activeDay || selectedDayName)) || days[0];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-cyan" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              Austin Operations Calendar · Sequenced Windows
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a target service date to view Cole Ramsey&apos;s arrival timeframes.
          </p>
        </div>

        {greenRouteDay && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald/40 bg-emerald-soft px-3 py-1.5 font-mono text-xs text-emerald">
            <RouteIcon className="h-3.5 w-3.5 text-emerald" />
            <span>Green Route Active: {greenRouteDay}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {days.map((day) => {
          const isSelected = currentDay?.dayName === day.dayName;
          const hasSelectedSlot = day.slots.some((s) => s.id === slotId);

          return (
            <button
              key={day.dayName}
              type="button"
              onClick={() => setActiveDay(day.dayName)}
              className={`group relative rounded-xl border p-4 text-left transition-all backdrop-blur-sm ${
                isSelected
                  ? "border-cyan bg-cyan-soft/30 shadow-[0_0_20px_rgba(239,68,68,0.18)] ring-1 ring-cyan"
                  : "border-border bg-card/60 hover:border-border-strong hover:bg-card"
              }`}
            >
              {day.isGreen && (
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald border-b border-emerald/40 pb-0.5">
                    $15 Waived
                  </span>
                  <span className="font-mono text-[9px] text-emerald/80 uppercase">
                    Cluster Match
                  </span>
                </div>
              )}

              <p className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                {day.dayName}
              </p>
              <p className="mt-1 text-sm font-bold text-foreground truncate">{day.datePart}</p>

              <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-dim">
                <span>{day.slots.length} windows</span>
                {hasSelectedSlot && (
                  <span className="text-cyan font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Selected
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {currentDay && (
        <div className="rounded-xl border border-border/80 bg-[#0c121e]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Available Windows for {currentDay.datePart}
            </span>
            <span className="font-mono text-[11px] text-dim">
              {sectorName ? `Austin Sector: ${sectorName}` : "Standard Austin Metro"}
            </span>
          </div>

          <p className="font-mono text-[10px] text-amber mb-3 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />⚠ Only{" "}
            {Math.max(2, 7 - new Date().getDay())} route-optimized windows remaining this week for
            your sector
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentDay.slots.map((slot) => {
              const active = slotId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelectSlot(slot.id)}
                  className={`flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-cyan bg-cyan-soft/40 shadow-[0_0_24px_rgba(239,68,68,0.22)] ring-1 ring-cyan"
                      : "border-border bg-card/70 hover:border-border-strong hover:bg-card"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Clock className="h-4 w-4 text-cyan shrink-0" />
                      <span className="font-mono text-sm font-bold text-foreground">
                        {slot.time} Arrival Window
                      </span>
                      <span className="font-mono text-[9px] text-rose flex items-center gap-1 ml-auto sm:ml-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse" />
                        {getViewers(slot.id)} viewing
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{slot.label}</p>
                    {slot.green ? (
                      <p className="font-mono text-[11px] font-semibold text-emerald">
                        Green Route · $15 Cross-Town Surcharge Waived
                      </p>
                    ) : (
                      <p className="font-mono text-[11px] text-dim">
                        Standard Transit · Van 01 Dispatched
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-colors ${
                        active
                          ? "border-cyan bg-cyan text-background"
                          : "border-border bg-secondary text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
