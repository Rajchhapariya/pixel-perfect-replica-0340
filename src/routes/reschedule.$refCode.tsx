import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Droplets,
  MapPin,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { money } from "@/lib/booking";
import {
  confirmReschedule,
  getBookingForReschedule,
  INITIAL_SEED_BOOKINGS,
} from "@/lib/bookings.functions";

export const Route = createFileRoute("/reschedule/$refCode")({
  head: () => ({
    meta: [
      { title: "Priority Weather Reschedule — Apex Detail Works" },
      {
        name: "description",
        content:
          "Austin weather delay priority replacement slot selection. $50 deposit fully preserved.",
      },
      { property: "og:site_name", content: "Apex Detail Works" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Priority Weather Reschedule — Apex Detail Works" },
      {
        property: "og:description",
        content:
          "Austin weather delay priority replacement slot selection. $50 deposit fully preserved.",
      },
    ],
  }),
  component: ReschedulePage,
});

const REPLACEMENT_SLOTS = [
  {
    id: "rep-1",
    label: "Friday, Oct 3 — 09:00 AM",
    note: "Post-Storm Clear Skies Guaranteed · Austin Metro",
    tag: "Next Available",
  },
  {
    id: "rep-2",
    label: "Friday, Oct 3 — 01:30 PM",
    note: "Afternoon Sun Window · Austin Metro",
    tag: "Clear Skies",
  },
  {
    id: "rep-3",
    label: "Saturday, Oct 4 — 10:00 AM",
    note: "Weekend Dedicated Ceramic Cure Window",
    tag: "Weekend Priority",
  },
  {
    id: "rep-4",
    label: "Tuesday, Oct 7 — 09:00 AM",
    note: "78704 Green Route Cluster Window",
    tag: "Green Route",
  },
];

function ReschedulePage() {
  const { refCode } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking-reschedule", refCode],
    queryFn: async () => {
      try {
        const found = await getBookingForReschedule({ data: { ref_code: refCode } });
        return found ?? INITIAL_SEED_BOOKINGS[0];
      } catch {
        const match = INITIAL_SEED_BOOKINGS.find(
          (b) => b.ref_code.toLowerCase() === (refCode ?? "").toLowerCase(),
        );
        return match ?? INITIAL_SEED_BOOKINGS[0] ?? null;
      }
    },
    staleTime: 5000,
  });

  const [selectedSlot, setSelectedSlot] = useState<string>(
    REPLACEMENT_SLOTS[0]?.label ?? "Friday, Oct 3 — 09:00 AM",
  );
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);

  const currentRef = booking?.ref_code ?? refCode ?? "ADW-78704-89";
  const customerName = booking?.customer_name ?? "Valued Client";
  const vehicle = booking?.vehicle_model ?? "Premium Vehicle";
  const packageName = booking?.package_name ?? "Ceramic Paint Correction";
  const sector =
    booking?.sector_name ?? (booking?.zip_code ? `Austin TX ${booking.zip_code}` : "Austin Metro");
  const originalSlot = booking?.slot_datetime ?? "Thursday 09:00 AM";

  async function handleConfirm() {
    if (!selectedSlot) {
      toast.error("Please select a replacement arrival window.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmReschedule({
        data: {
          ref_code: currentRef,
          new_slot_datetime: selectedSlot,
        },
      });

      setConfirmedSlot(selectedSlot);
      setIsCompleted(true);
      await queryClient.invalidateQueries({ queryKey: ["booking-reschedule"] });
      await queryClient.invalidateQueries({ queryKey: ["hud-bookings"] });
      toast.success(`Rescheduled to ${selectedSlot}!`);
    } catch {
      toast.error("Failed to confirm reschedule. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleCalendar() {
    const slotText = confirmedSlot ?? selectedSlot;
    const title = `Apex Detail Works — ${packageName} (Rescheduled)`;
    const details = `Cole Ramsey — Apex Detail Works Van 01.\nReference Code: ${currentRef}\nVehicle: ${vehicle}\nService: ${packageName}\nReplacement Arrival Window: ${slotText}\nWeather Hold: Resolved\nDeposit Status: $50 Held & Applied\nContact: (512) 555-0142`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title,
    )}&details=${encodeURIComponent(details)}&location=${encodeURIComponent("Austin, TX Metro")}`;
    window.open(url, "_blank");
    toast.success("Google Calendar event link opened.");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-32 pt-8 sm:px-6">
      {/* Top back link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-cyan transition-colors"
        >
          ← Apex Detail Works
        </Link>
        <span className="font-mono text-[11px] text-cyan bg-cyan/10 border border-cyan/20 px-2 py-0.5 rounded">
          Van 01 Operations
        </span>
      </div>

      {isLoading ? (
        <div className="surface p-8 text-center text-muted-foreground font-mono text-sm">
          Loading reservation details for #{refCode}...
        </div>
      ) : isCompleted ? (
        /* Confirmed Success State */
        <div className="surface overflow-hidden relative border border-emerald/40">
          <div className="h-[6px] w-full bg-gradient-to-r from-emerald via-teal-400 to-cyan" />
          <div className="p-6 sm:p-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald" strokeWidth={1.6} />
            <h1 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Replacement Slot Confirmed
            </h1>
            <p className="mt-1 font-mono text-xs text-emerald tracking-wide flex items-center justify-center gap-1.5">
              <Zap className="h-3.5 w-3.5 fill-emerald text-emerald shrink-0" />
              <span>Priority Weather Reschedule Complete</span>
            </p>
            <p className="mt-1 font-mono text-sm text-cyan font-bold tracking-wide">
              Reference: {currentRef}
            </p>

            <div className="mt-6 rounded-lg border border-border bg-card/60 p-4 text-left">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground font-mono">Client</dt>
                  <dd className="font-semibold text-foreground mt-0.5">{customerName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-mono">Vehicle</dt>
                  <dd className="font-semibold text-foreground mt-0.5">{vehicle}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-mono">Service</dt>
                  <dd className="font-semibold text-foreground mt-0.5">{packageName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-mono">Service Location</dt>
                  <dd className="font-semibold text-foreground mt-0.5">{sector}</dd>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-border">
                  <dt className="text-muted-foreground font-mono">New Confirmed Arrival Window</dt>
                  <dd className="text-sm font-bold text-cyan font-mono mt-0.5">
                    {confirmedSlot ?? selectedSlot}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground font-mono">Deposit Status</dt>
                  <dd className="text-xs text-emerald font-semibold mt-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>$50 Deposit Successfully Transferred — No Cancellation Fees</span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleGoogleCalendar}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-cyan"
              >
                <CalendarPlus className="h-4 w-4 text-cyan" />
                Add to Google Calendar
              </button>
              <Link
                to="/hud"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                View HUD Operations Deck →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Active Reschedule Form */
        <div className="space-y-6">
          {/* Weather Alert Banner */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-amber-300 font-mono uppercase tracking-wider">
                  Travis County Flash Rain Advisory · Free Weather Hold
                </h2>
                <p className="mt-1 text-xs text-foreground/80 leading-relaxed">
                  Hi {customerName}, 85% precipitation is forecasted in Austin on Thursday. Ceramic
                  coatings require controlled dry curing and cannot be applied in high humidity or
                  rain. Cole has reserved these priority replacement arrival windows for you.
                </p>
                <div className="mt-2.5 inline-flex items-center gap-2 text-[11px] font-mono text-emerald">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>
                    Your $50 deposit is protected and applies 100% to your replacement slot.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Booking Card */}
          <div className="surface p-5 sm:p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan" />
                <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                  Affected Appointment
                </span>
              </div>
              <span className="font-mono text-xs text-cyan bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">
                #{currentRef}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground font-mono">Vehicle</span>
                <span className="font-semibold text-foreground">{vehicle}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground font-mono">Service</span>
                <span className="font-semibold text-foreground">{packageName}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground font-mono">Location</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-cyan shrink-0" />
                  {sector}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground font-mono">Original Scheduled Slot</span>
                <span className="font-mono text-amber-400 flex items-center gap-1 font-semibold">
                  <Droplets className="h-3 w-3 shrink-0" />
                  {originalSlot} (Rain Delayed)
                </span>
              </div>
            </div>
          </div>

          {/* Slot Selection */}
          <div className="surface p-5 sm:p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan" />
                <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                  Select Priority Replacement Slot
                </h3>
              </div>
              <span className="text-[11px] font-mono text-dim">Van 01 Reserved</span>
            </div>

            <div className="space-y-2.5">
              {REPLACEMENT_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot.label;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.label)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-cyan bg-cyan/10 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                        : "border-border bg-card/60 hover:border-cyan/40 hover:bg-card"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs sm:text-sm font-bold text-foreground">
                          {slot.label}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {slot.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {slot.note}
                      </p>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-cyan bg-cyan" : "border-border"
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-mono text-dim text-center sm:text-left">
                Cole Ramsey · Mobile Van 01 · Austin, TX
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleConfirm()}
                className="btn-primary hover:btn-primary-hover w-full sm:w-auto px-6 py-2.5 text-xs font-semibold justify-center disabled:opacity-60"
              >
                {submitting ? "Confirming Slot..." : "Confirm Replacement Slot"}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
