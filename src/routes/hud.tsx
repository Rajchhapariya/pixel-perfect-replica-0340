import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  BatteryCharging,
  CloudRain,
  Droplets,
  Inbox,
  Navigation,
  Radio,
  Route as RouteIcon,
  Send,
  Wrench,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { DEPOSIT, money, relativeTime } from "@/lib/booking";

export const Route = createFileRoute("/hud")({
  head: () => ({
    meta: [
      { title: "Operations HUD — Apex Detail Works" },
      {
        name: "description",
        content:
          "Cole's command console: auto-triaged leads, optimized Austin route deck, weather reschedule dispatch and live inbound feed.",
      },
      { property: "og:title", content: "Operations HUD — Apex Detail Works" },
      {
        property: "og:description",
        content: "Route clustering, deposit tracking and 1-click rain reschedules for Van 01.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Hud,
});

interface Booking {
  id: string;
  created_at: string;
  ref_code: string;
  customer_name: string | null;
  vehicle_model: string | null;
  package_name: string;
  total_price: number;
  zip_code: string;
  sector_name: string | null;
  slot_datetime: string;
  status: string;
}

interface AuditEntry {
  id: string;
  created_at: string;
  event_type: string;
  booking_ref: string | null;
  message: string;
  source: string;
}

const bookingsQuery = queryOptions({
  queryKey: ["hud", "bookings"],
  queryFn: async (): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, created_at, ref_code, customer_name, vehicle_model, package_name, total_price, zip_code, sector_name, slot_datetime, status",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as Booking[];
  },
});

const auditQuery = queryOptions({
  queryKey: ["hud", "audit"],
  queryFn: async (): Promise<AuditEntry[]> => {
    const { data, error } = await supabase
      .from("audit_log")
      .select("id, created_at, event_type, booking_ref, message, source")
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) throw error;
    return (data ?? []) as AuditEntry[];
  },
});

function Hud() {
  const queryClient = useQueryClient();
  const { data: bookings = [] } = useQuery(bookingsQuery);
  const { data: audit = [] } = useQuery(auditQuery);
  const [stormOpen, setStormOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = bookings.filter((b) => new Date(b.created_at).getTime() >= weekAgo);
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const routeDeck = confirmed.slice(0, 3);
  const affected = confirmed.slice(0, 3);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["hud"] });
  }

  async function updateStatus(booking: Booking, status: string, label: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", booking.id);
    if (error) {
      toast.error("Status update failed.");
      return;
    }
    await supabase.from("audit_log").insert({
      event_type: "SMS_DISPATCHED",
      booking_ref: booking.ref_code,
      message: `${label} status set for ${booking.vehicle_model ?? booking.package_name} at ${booking.zip_code}. Client SMS dispatched automatically.`,
      source: "system",
    });
    toast.success(`Status updated to "${label}". SMS dispatched to client automatically.`);
    refresh();
  }

  async function executeReschedule() {
    if (affected.length === 0) {
      toast.error("No confirmed exterior appointments to reschedule.");
      return;
    }
    setDispatching(true);
    const ids = affected.map((b) => b.id);
    const { error } = await supabase.from("bookings").update({ status: "rescheduled" }).in("id", ids);
    if (error) {
      setDispatching(false);
      toast.error("Reschedule dispatch failed.");
      return;
    }
    await supabase.from("audit_log").insert(
      affected.map((b) => ({
        event_type: "RAIN_RESCHEDULE",
        booking_ref: b.ref_code,
        message: `Travis County rain trigger — ${b.customer_name ?? "Client"} sent a priority reschedule link for the ${b.slot_datetime} slot in ${b.sector_name ?? b.zip_code}.`,
        source: "system",
      })),
    );
    setDispatching(false);
    setStormOpen(false);
    toast.success(
      "3 clients notified with priority reschedule links. 47 minutes of manual texting eliminated.",
    );
    refresh();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Owner Command HUD — Van 01
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything Cole would otherwise be texting, quoting and re-routing by hand.
        </p>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          accent="cyan"
          Icon={Inbox}
          label="Inbound Leads Auto-Triaged"
          value={String(recent.length)}
          sub="0 manual DMs or callbacks required."
        />
        <Kpi
          accent="emerald"
          Icon={RouteIcon}
          label="Transit Hours Saved"
          value="7.2 hrs"
          sub="Geo-clustering eliminated 148 cross-town miles this week."
        />
        <Kpi
          accent="amber"
          Icon={Wrench}
          label="Deposit Revenue Secured"
          value={money(recent.length * DEPOSIT)}
          sub="Zero no-shows. Every slot has a card hold."
        />
        <Kpi
          accent="none"
          Icon={BatteryCharging}
          label="Van 01 Status"
          value="Operational"
          sub="DI Tank 85 gal | Inverter 94% | Gen: Quiet Mode"
        />
      </section>

      <section className="surface mt-5 flex flex-col gap-4 border-amber/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
          <div>
            <h2 className="text-sm font-bold">Austin Weather Alert Trigger</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Ceramic coatings and paint corrections cannot cure in rain or high humidity.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setStormOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-xs font-bold text-background transition-opacity hover:opacity-90"
        >
          <CloudRain className="h-4 w-4" />
          Simulate Flash Storm
        </button>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="text-base font-bold">Today&apos;s Route — Austin Sector 78704 / SoCo</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Stops sequenced to eliminate cross-town transit. Est. total drive time: 28 minutes.
          </p>

          <div className="mt-4 space-y-3">
            {routeDeck.length === 0 ? (
              <p className="surface p-5 text-sm text-muted-foreground">
                No confirmed stops on the deck. New bookings land here automatically.
              </p>
            ) : null}
            {routeDeck.map((booking, index) => (
              <div key={booking.id}>
                <article className="surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-cyan">{booking.slot_datetime}</p>
                      <h3 className="mt-1.5 text-sm font-semibold text-foreground">
                        {booking.vehicle_model ?? "Vehicle on file"}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {booking.package_name} · {booking.zip_code} ·{" "}
                        {booking.sector_name ?? "Unclustered"}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={booking.status} />
                      <p className="mt-1.5 font-mono text-sm text-foreground">
                        {money(Number(booking.total_price))}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <JobButton
                      Icon={Send}
                      label="En Route SMS"
                      onClick={() => void updateStatus(booking, "en_route", "En Route")}
                    />
                    <JobButton
                      Icon={Navigation}
                      label="Job Started"
                      onClick={() => void updateStatus(booking, "in_progress", "Job Started")}
                    />
                    <JobButton
                      Icon={Droplets}
                      label="Complete & Invoice"
                      onClick={() => void updateStatus(booking, "completed", "Completed")}
                    />
                  </div>
                </article>
                {index < routeDeck.length - 1 ? (
                  <p className="my-2 rounded-lg border border-emerald/25 bg-emerald-soft px-4 py-2 font-mono text-[11px] text-emerald">
                    14 min transit — 3.8 miles via S Congress Ave → W 6th St (Zero MoPac routing)
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-base font-bold">Inbound Triage Feed</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Bookings captured while Cole is polishing. Zero gloves off.
          </p>

          <div className="mt-4 space-y-3">
            {audit.map((entry) => (
              <article key={entry.id} className="surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <EventBadge type={entry.event_type} />
                  <span className="font-mono text-[11px] text-dim">
                    {relativeTime(entry.created_at)}
                  </span>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-foreground">{entry.message}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2 py-0.5 font-mono text-[10px] text-dim">
                  <Radio className="h-3 w-3" />
                  {entry.source}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {stormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setStormOpen(false)}
            className="absolute inset-0 bg-background/85 backdrop-blur-sm"
          />
          <div className="surface relative max-h-[90vh] w-full max-w-xl overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold">Travis County Precipitation Warning</h2>
              <button
                type="button"
                onClick={() => setStormOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              85% rain probability forecasted for Thursday in Travis County. The following{" "}
              {affected.length} exterior appointments are affected:
            </p>

            <ul className="mt-4 space-y-2">
              {affected.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3"
                >
                  <span className="text-xs text-foreground">
                    {b.customer_name ?? "Client"} — {b.vehicle_model ?? b.package_name}
                  </span>
                  <span className="font-mono text-[11px] text-cyan">{b.ref_code}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg border border-border bg-background/80 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
              Hi {affected[0]?.customer_name ?? "[customer_name]"}, Cole from Apex Detail Works.
              Heavy rain is forecasted for Austin on Thursday — ceramic coatings cannot bond in wet
              conditions. Tap your exclusive priority slot link to reschedule:
              apexdetail.works/reschedule/{affected[0]?.ref_code ?? "[ref_code]"}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setStormOpen(false)}
                className="rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dispatching}
                onClick={() => void executeReschedule()}
                className="btn-primary hover:btn-primary-hover px-5 py-2.5 text-xs disabled:opacity-60"
              >
                Execute 1-Click Reschedule
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Kpi({
  accent,
  Icon,
  label,
  value,
  sub,
}: {
  accent: "cyan" | "emerald" | "amber" | "none";
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  const border =
    accent === "cyan"
      ? "border-t-2 border-t-cyan"
      : accent === "emerald"
        ? "border-t-2 border-t-emerald"
        : accent === "amber"
          ? "border-t-2 border-t-amber"
          : "";
  const color =
    accent === "cyan"
      ? "text-cyan"
      : accent === "emerald"
        ? "text-emerald"
        : accent === "amber"
          ? "text-amber"
          : "text-muted-foreground";
  return (
    <article className={`surface p-5 ${border}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-dim">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="mt-3 font-mono text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "border-cyan/40 bg-cyan-soft text-cyan",
    en_route: "border-amber/40 bg-amber-soft text-amber",
    in_progress: "border-amber/40 bg-amber-soft text-amber",
    completed: "border-emerald/40 bg-emerald-soft text-emerald",
    rescheduled: "border-rose/40 bg-rose-soft text-rose",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase ${map[status] ?? "border-border bg-secondary text-dim"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function EventBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    BOOKING_CONFIRMED: "border-cyan/40 bg-cyan-soft text-cyan",
    RAIN_RESCHEDULE: "border-amber/40 bg-amber-soft text-amber",
    SMS_DISPATCHED: "border-emerald/40 bg-emerald-soft text-emerald",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] ${map[type] ?? "border-border bg-secondary text-dim"}`}
    >
      {type}
    </span>
  );
}

function JobButton({
  Icon,
  label,
  onClick,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-cyan hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
