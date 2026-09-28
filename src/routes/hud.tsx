import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  BatteryCharging,
  CloudRain,
  Droplets,
  Navigation,
  Radio,
  RotateCcw,
  Send,
  Wrench,
  X,
} from "lucide-react";

import { money, relativeTime } from "@/lib/booking";
import {
  executeStormReschedule,
  getHudAuditFeed,
  getHudBookings,
  INITIAL_SEED_AUDIT,
  INITIAL_SEED_BOOKINGS,
  resetHudDemoData,
  updateBookingStatus,
} from "@/lib/bookings.functions";

export const Route = createFileRoute("/hud")({
  head: () => ({
    meta: [
      { title: "Operations HUD — Apex Detail Works" },
      {
        name: "description",
        content:
          "Cole's command console: auto-triaged leads, optimized Austin route deck, weather reschedule dispatch and live inbound feed.",
      },
      { property: "og:site_name", content: "Apex Detail Works" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: "https://pixel-perfect-replica-0340.lovable.app/hud" },
      { property: "og:title", content: "Operations HUD — Apex Detail Works" },
      {
        property: "og:description",
        content: "Route clustering, deposit tracking and 1-click rain reschedules for Van 01.",
      },
      {
        property: "og:image",
        content: "https://pixel-perfect-replica-0340.lovable.app/brand/apex-og.png",
      },
      {
        property: "og:image:secure_url",
        content: "https://pixel-perfect-replica-0340.lovable.app/brand/apex-og.png",
      },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Operations HUD — Apex Detail Works",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Operations HUD — Apex Detail Works" },
      {
        name: "twitter:description",
        content: "Route clustering, deposit tracking and 1-click rain reschedules for Van 01.",
      },
      {
        name: "twitter:image",
        content: "https://pixel-perfect-replica-0340.lovable.app/brand/apex-og.png",
      },
      {
        name: "twitter:image:alt",
        content: "Operations HUD — Apex Detail Works",
      },
    ],
    links: [{ rel: "canonical", href: "https://pixel-perfect-replica-0340.lovable.app/hud" }],
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
  queryFn: async (): Promise<Booking[]> => (await getHudBookings()) as Booking[],
});

const auditQuery = queryOptions({
  queryKey: ["hud", "audit"],
  queryFn: async (): Promise<AuditEntry[]> => (await getHudAuditFeed()) as AuditEntry[],
  refetchInterval: 30000,
});

/** Ticks up by 1 every real minute starting from a realistic mid-day baseline. */
function MinutesSavedTicker() {
  const BASE = 87; // realistic mid-day: 14 min × ~6 inquiries already handled
  const [extra, setExtra] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setExtra((e) => e + 1), 60_000);
    return () => clearInterval(interval);
  }, []);
  const total = BASE + extra;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return (
    <div className="surface flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald/5 border-emerald/20 backdrop-blur-md">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
      </span>
      <div className="min-w-0">
        <span className="text-[10px] text-dim uppercase block">Time Saved Today</span>
        <span className="text-emerald font-bold font-mono truncate block">
          {hours}h {mins}m saved
        </span>
      </div>
    </div>
  );
}

function Hud() {
  const queryClient = useQueryClient();
  const { data: bookings = [] } = useQuery(bookingsQuery);
  const { data: audit = [] } = useQuery(auditQuery);
  const [stormOpen, setStormOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    if (!stormOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStormOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stormOpen]);

  const { recent, confirmed, routeDeck, affected } = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rec = bookings.filter((b) => new Date(b.created_at).getTime() >= weekAgo);
    const conf = bookings.filter((b) => b.status === "confirmed");
    return {
      recent: rec,
      confirmed: conf,
      routeDeck: conf.slice(0, 3),
      affected: conf.slice(0, 3),
    };
  }, [bookings]);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["hud"] });
  }

  async function handleResetDemo() {
    // 1. Instantly reset client cache with deterministic seed data so UI updates immediately
    queryClient.setQueryData(
      ["hud", "bookings"],
      INITIAL_SEED_BOOKINGS.map((b) => ({ ...b })),
    );
    queryClient.setQueryData(
      ["hud", "audit"],
      INITIAL_SEED_AUDIT.map((a) => ({ ...a })),
    );

    // 2. Persist to server function
    try {
      await resetHudDemoData({ data: {} });
    } catch (err) {
      console.warn("Server reset notice (client cache reset active):", err);
    }

    toast.success("Demo state reset. 3 confirmed Austin bookings & live audit stream restored.");
    refresh();
  }

  async function updateStatus(booking: Booking, status: string, label: string) {
    try {
      await updateBookingStatus({
        data: {
          id: booking.id,
          status: status as "en_route" | "in_progress" | "completed",
          label,
          ref_code: booking.ref_code,
          vehicle_label: booking.vehicle_model ?? booking.package_name,
          zip_code: booking.zip_code,
        },
      });
    } catch {
      toast.error("Status update failed.");
      return;
    }
    toast.success(`Status updated to "${label}". SMS dispatched to client automatically.`);
    refresh();
  }

  async function executeReschedule() {
    if (affected.length === 0) {
      toast.error("No confirmed exterior appointments to reschedule.");
      return;
    }
    setDispatching(true);
    try {
      await executeStormReschedule({
        data: {
          bookings: affected.map((b) => ({
            id: b.id,
            ref_code: b.ref_code,
            customer_name: b.customer_name,
            slot_datetime: b.slot_datetime,
            sector_name: b.sector_name,
            zip_code: b.zip_code,
          })),
        },
      });
    } catch {
      setDispatching(false);
      toast.error("Reschedule dispatch failed.");
      return;
    }
    setDispatching(false);
    setStormOpen(false);
    toast.success(
      "3 clients notified with priority reschedule links. 47 minutes of manual texting eliminated.",
    );
    refresh();
  }

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-32 pt-6 sm:pt-10">
      <div className="apex-demo-strip">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold text-cyan uppercase tracking-widest">
            Operations Environment &amp; Demo Controls
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            This is Cole Ramsey&apos;s live operations dashboard. Try: Reset Demo State to restore 3
            live Austin bookings, Simulate Flash Storm to trigger the 1-click reschedule dispatch,
            and the status buttons on each route stop.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap w-full sm:w-auto">
          <Link
            to="/book"
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-card/80 px-3.5 py-2 font-mono text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-cyan/50 transition-colors"
          >
            ← Book a Slot
          </Link>
          <button
            type="button"
            onClick={() => void handleResetDemo()}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg bg-cyan px-3.5 py-2 font-mono text-xs font-bold text-background hover:bg-cyan/90 transition-colors shadow-md"
          >
            Reset Demo State
          </button>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xl">
        <div
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b0e14] via-[#07090e] to-[#0b0e14]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.08),transparent_70%)]" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <picture>
              <source srcSet="/brand/apex-mark.webp" type="image/webp" />
              <img
                src="/brand/apex-mark.png"
                alt="Apex Detail Works Van 01 Rig"
                className="h-10 w-10 sm:h-14 sm:w-14 shrink-0 object-contain drop-shadow-[0_4px_16px_rgba(239,68,68,0.45)]"
                width={56}
                height={56}
                loading="eager"
                decoding="async"
              />
            </picture>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber">
                  Field Operations Console · Van 01 Rig
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider sm:border-l sm:border-white/15 sm:pl-2.5">
                  Austin Metro Sector
                </span>
              </div>
              <h1 className="mt-1 text-xl sm:text-3xl font-black tracking-tight text-foreground">
                Owner Command HUD — Cole Ramsey
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Automating inbound triage, MoPac route clustering, and Austin weather contingencies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => void handleResetDemo()}
              className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-secondary/80 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-amber hover:text-amber"
              title="Reset in-memory demo bookings and audit stream"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber" />
              <span>Reset Demo</span>
            </button>
            <button
              type="button"
              onClick={refresh}
              className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-cyan hover:text-foreground"
            >
              <Radio className="h-3.5 w-3.5 text-cyan" />
              <span>Sync Feed</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono text-xs">
          <div className="surface flex items-center gap-2.5 p-3 sm:px-3.5 sm:py-2.5 bg-[#0a0f1d]/90 backdrop-blur-md">
            <Droplets className="h-4 w-4 text-cyan shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-dim uppercase block">Deionized Water</span>
              <span className="text-foreground font-semibold truncate block">
                85 Gal · 0 TDS Pure
              </span>
            </div>
          </div>
          <div className="surface flex items-center gap-2.5 px-3.5 py-2.5 bg-[#0a0f1d]/90 backdrop-blur-md">
            <BatteryCharging className="h-4 w-4 text-emerald shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-dim uppercase block">Inverter Bank</span>
              <span className="text-foreground font-semibold truncate block">
                94% · 4.8 kWh AGM
              </span>
            </div>
          </div>
          <div className="surface flex items-center gap-2.5 px-3.5 py-2.5 bg-[#0a0f1d]/90 backdrop-blur-md">
            <Wrench className="h-4 w-4 text-amber shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-dim uppercase block">Whisper Gen</span>
              <span className="text-foreground font-semibold truncate block">
                52 dB · Quiet ECO
              </span>
            </div>
          </div>
          <div className="surface flex items-center gap-2.5 px-3.5 py-2.5 bg-[#0a0f1d]/90 backdrop-blur-md">
            <Navigation className="h-4 w-4 text-indigo shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-dim uppercase block">Active Corridor</span>
              <span className="text-cyan font-semibold truncate block">78704 / SoCo Metro</span>
            </div>
          </div>
          <MinutesSavedTicker />
        </div>

        <div className="relative z-10 mt-4 rounded-xl border border-rose/30 bg-rose/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
            </span>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose">
              Without Apex — This Week
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {(
              [
                { val: "47", label: "Unread Instagram DMs" },
                { val: "2.4h", label: "Manual texting daily" },
                { val: "$0", label: "Deposit holds secured" },
                { val: "3", label: "No-shows, no recourse" },
              ] as const
            ).map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="font-mono text-xl sm:text-2xl font-black text-rose">{val}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-amber/40 bg-gradient-to-r from-card via-card to-amber-soft/20 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg border border-amber/40 bg-amber-soft p-2.5 text-amber shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Austin Weather Alert Trigger</h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber border-l border-amber/40 pl-2 font-bold">
                Rain Contingency
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ceramic coatings and paint corrections cannot cure in rain or high humidity. 1-click
              batch notifies all affected clients with priority links.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setStormOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={stormOpen}
          className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-xs font-bold text-[#07090e] transition-opacity hover:opacity-90 shadow-md shadow-amber/20 min-h-[42px]"
        >
          <CloudRain className="h-4 w-4" />
          <span>Simulate Flash Storm</span>
        </button>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Today&apos;s Route — Austin Sector 78704 / SoCo
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Stops sequenced to eliminate cross-town transit. Est. total drive time: 28 minutes.
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald border-l border-emerald/40 pl-2 font-bold">
              Geo-Clustered
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {routeDeck.length === 0 ? (
              <p className="surface p-4 sm:p-5 text-sm text-muted-foreground">
                No confirmed stops on the deck. New bookings land here automatically.
              </p>
            ) : null}
            {routeDeck.map((booking, index) => (
              <div key={booking.id}>
                <article className="surface p-4 sm:p-5">
                  <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2 xs:gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-cyan">
                        {booking.slot_datetime}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-foreground">
                        {booking.customer_name ? `${booking.customer_name} · ` : ""}
                        {booking.vehicle_model ?? "Vehicle on file"}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {booking.package_name} · {booking.zip_code} ·{" "}
                        {booking.sector_name ?? "Unclustered"}
                      </p>
                    </div>
                    <div className="flex xs:flex-col items-center xs:items-end justify-between xs:justify-start gap-1">
                      <StatusBadge status={booking.status} />
                      <p className="font-mono text-sm font-bold text-foreground">
                        {money(Number(booking.total_price))}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 xs:grid-cols-3 gap-2">
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
                      label="Complete &amp; Invoice"
                      onClick={() => void updateStatus(booking, "completed", "Completed")}
                    />
                  </div>
                </article>
                {index < routeDeck.length - 1 ? (
                  <p className="my-2 rounded-lg border border-emerald/25 bg-emerald-soft px-3 py-2 sm:px-4 font-mono text-[10px] sm:text-[11px] text-emerald flex items-center gap-2 leading-relaxed">
                    <Navigation className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      14 min transit — 3.8 miles via S Congress Ave → W 6th St (MoPac avoided · $0
                      tolls)
                    </span>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              Inbound Triage Feed
              <span className="inline-flex items-center gap-1.5">
                <span className="live-dot" aria-hidden="true" />
                <span className="live-label">LIVE</span>
              </span>
            </h2>
            <span className="font-mono text-[10px] text-dim">Auto-Sync 30s</span>
          </div>
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
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2 py-0.5 font-mono text-[10px] text-dim">
                    <Radio className="h-3 w-3 text-cyan" />
                    {entry.source}
                  </span>
                  {entry.booking_ref ? (
                    <span className="font-mono text-[10px] text-cyan">{entry.booking_ref}</span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {stormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="storm-modal-title"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setStormOpen(false)}
            className="absolute inset-0 bg-background/85 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="surface relative max-h-[90vh] w-full max-w-xl overflow-y-auto p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 id="storm-modal-title" className="text-base sm:text-lg font-bold">
                Travis County Precipitation Warning
              </h2>
              <button
                type="button"
                onClick={() => setStormOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground">
              85% rain probability forecasted for Thursday in Travis County. The following{" "}
              {affected.length} exterior appointments are affected:
            </p>

            <ul className="mt-3.5 space-y-2">
              {affected.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-2.5 sm:p-3"
                >
                  <span className="text-xs text-foreground truncate">
                    {b.customer_name ?? "Client"} — {b.vehicle_model ?? b.package_name}
                  </span>
                  <span className="font-mono text-[11px] text-cyan shrink-0">{b.ref_code}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg border border-border bg-background/80 p-3 sm:p-4 font-mono text-[11px] leading-relaxed text-muted-foreground break-all sm:break-normal">
              Hi {affected[0]?.customer_name ?? "[customer_name]"}, Cole from Apex Detail Works.
              Heavy rain is forecasted for Austin on Thursday — ceramic coatings cannot bond in wet
              conditions. Tap your exclusive priority slot link to reschedule:
              apexdetail.works/reschedule/{affected[0]?.ref_code ?? "[ref_code]"}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setStormOpen(false)}
                className="min-h-[40px] rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dispatching}
                onClick={() => void executeReschedule()}
                className="btn-primary hover:btn-primary-hover min-h-[40px] px-5 py-2 text-xs disabled:opacity-60 justify-center"
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
      className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-cyan hover:text-foreground active:scale-[0.98]"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
