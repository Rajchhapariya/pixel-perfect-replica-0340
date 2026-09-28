import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  CloudRain,
  Image as ImageIcon,
  Info,
  MapPin,
  Mic,
  Phone,
  Route as RouteIcon,
  Smile,
  Star,
  Truck,
  Video,
  X,
  Zap,
} from "lucide-react";
import { PACKAGES, VEHICLE_OPTIONS, formatDuration, money, type VehicleClass } from "@/lib/booking";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    const src = typeof search["src"] === "string" ? search["src"] : undefined;
    return src !== undefined ? { src } : {};
  },
  head: () => ({
    meta: [
      { title: "Apex Detail Works — Austin Mobile Auto Detailing" },
      {
        name: "description",
        content:
          "Cole Ramsey's autonomous mobile detailing rig for Austin, TX. 90-second booking, MoPac route clustering, zero phone tag, $50 locked deposit hold.",
      },
      { property: "og:title", content: "Apex Detail Works — Austin Mobile Detailing" },
      {
        property: "og:description",
        content:
          "Scope your vehicle, lock your price, hold your slot in 90 seconds. No callbacks required.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/** Counts from 0 to `target` over `duration` ms once the ref enters the viewport. */
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// 6 phases: 0=idle, 1=customer msg, 2=seen tick, 3=typing dots, 4=reply, 5=second customer reaction
type DmPhase = 0 | 1 | 2 | 3 | 4 | 5;

function DmSimulator() {
  const [phase, setPhase] = useState<DmPhase>(0);
  const [loopKey, setLoopKey] = useState(0); // triggers re-mount for infinite loop

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => setPhase(3), 3600);
    const t4 = setTimeout(() => setPhase(4), 5200);
    const t5 = setTimeout(() => setPhase(5), 7500);
    const tReset = setTimeout(() => {
      setPhase(0);
      setLoopKey((k) => k + 1);
    }, 10500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(tReset);
    };
  }, [loopKey]);

  return (
    <div
      className="w-full max-w-[292px] h-[636px] rounded-[44px] border-[3px] border-[#2c2e35] bg-[#0c0d12] p-2 shadow-[0_35px_75px_rgba(0,0,0,0.98),0_0_50px_rgba(239,68,68,0.12)] ring-1 ring-white/10 flex flex-col justify-between select-none relative overflow-hidden"
      aria-label="Instagram DM simulation"
    >
      {/* Realme GT Neo 3T Top Bezel & Status Bar (6.62" 120Hz FHD+ AMOLED) */}
      <div className="shrink-0 flex items-center justify-between px-3 pt-1 pb-1 text-white select-none">
        {/* Top-Left Punch Hole Camera & Time */}
        <div className="flex items-center gap-2">
          {/* Realme GT Neo 3T Punch Hole Selfie Camera */}
          <div className="h-3 w-3 rounded-full bg-black ring-[1.5px] ring-[#1f222d] flex items-center justify-center shadow-inner">
            <div className="h-1 w-1 rounded-full bg-[#081524] ring-[0.5px] ring-[#3b82f6]/40" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight text-white/90">9:14</span>
        </div>

        {/* Status Icons: 120Hz badge, Wi-Fi, Battery */}
        <div className="flex items-center gap-1.5 text-white/80">
          <span className="text-[7.5px] font-mono font-bold px-1 py-0.5 rounded bg-white/10 text-white/70 leading-none">
            120Hz
          </span>
          <svg className="h-2.5 w-2.5 fill-current text-white/90" viewBox="0 0 24 24">
            <path d="M12 3c-4.97 0-9.42 2.06-12 5.38l12 12.62 12-12.62c-2.58-3.32-7.03-5.38-12-5.38z" />
          </svg>
          <div className="flex items-center gap-0.5">
            <div className="h-2.5 w-3.5 rounded-[2px] border border-white/70 p-[1px] flex items-center">
              <div className="h-full w-2 bg-white/90 rounded-[0.5px]" />
            </div>
            <div className="h-1 w-[1px] bg-white/70 rounded-r-[0.5px]" />
          </div>
        </div>
      </div>

      {/* Instagram DM Screen (True AMOLED Black) */}
      <div className="flex-1 flex flex-col justify-between rounded-[36px] bg-black overflow-hidden border border-white/5 relative">
        {/* Instagram Header: Back Arrow, Filled Profile Logo to the LEFT of apexdetailworks, Info Icon on Right */}
        <div className="shrink-0 flex items-center justify-between px-3 pt-2.5 pb-2.5 border-b border-[#1c1c1c] bg-black">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              className="p-1 -ml-1 text-white hover:opacity-80 transition-opacity shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 stroke-[2]" />
            </button>

            {/* Profile Avatar with Apex Detail Works Shield Logo (edge-to-edge filled) */}
            <div className="relative shrink-0">
              <div
                className="h-9 w-9 rounded-full p-[1.5px]"
                style={{
                  background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                }}
              >
                <div className="h-full w-full rounded-full bg-black p-[1px] overflow-hidden">
                  <img
                    src="/brand/apex-mark.png"
                    alt="Apex Detail Works"
                    className="h-full w-full object-cover filter drop-shadow scale-[1.05]"
                  />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#20c15e] border-[1.5px] border-black" />
            </div>

            {/* Username & Verified Badge & Status */}
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1 leading-tight">
                <span className="text-white text-[12px] font-bold truncate">Apex Detail Works</span>
                <svg className="h-3 w-3 text-[#0095f6] fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <p className="text-[#8e8e8e] text-[9.5px] leading-tight mt-0.5">
                apexdetailworks · Active now
              </p>
            </div>
          </div>

          {/* Instagram Info Icon (i) in circle - exactly matching user screenshot */}
          <button
            type="button"
            className="hover:opacity-80 transition-opacity p-1 text-white shrink-0"
            aria-label="Thread Info"
          >
            <Info className="h-5 w-5 stroke-[1.8]" />
          </button>
        </div>

        {/* Chat message thread - AMOLED black background */}
        <div className="flex-1 px-3 py-2 flex flex-col gap-2.5 justify-end overflow-hidden bg-black">
          {/* Timestamp */}
          {phase >= 1 && (
            <p className="dm-animate-in text-center text-[9.5px] text-[#737373] mb-0.5 font-normal">
              Today 9:14 AM
            </p>
          )}

          {/* 1. Customer's message (YOU) — RIGHT SIDE, Instagram Blue Pill */}
          {phase >= 1 && (
            <div className="dm-animate-out flex flex-col items-end gap-0.5 max-w-[84%] ml-auto">
              <div className="rounded-[18px] rounded-br-[4px] px-3.5 py-2 text-[11px] font-normal text-white leading-[1.45] bg-[#3797f0] shadow-sm">
                hey do you have anything open this week? need a full detail on my F-150 before the
                weekend 🙏
              </div>
              {/* Seen receipt — appears at phase 2 */}
              {phase >= 2 && (
                <p className="dm-animate-out text-[9px] text-[#8e8e8e] text-right pr-1 leading-none">
                  Seen · 9:14 AM
                </p>
              )}
            </div>
          )}

          {/* 2. Typing indicator (Apex Bot) — LEFT SIDE, incoming grey bubble with Apex logo avatar */}
          {phase === 3 && (
            <div className="dm-animate-in flex items-end gap-1.5 max-w-[80%]">
              <div className="h-[24px] w-[24px] rounded-full flex-shrink-0 bg-black border border-white/15 overflow-hidden flex items-center justify-center mb-0.5 shadow-sm">
                <img src="/brand/apex-mark.png" alt="Apex" className="h-full w-full object-cover" />
              </div>
              <div className="rounded-[18px] rounded-bl-[4px] px-3.5 py-2.5 bg-[#262626]">
                <div className="apex-typing-dots">
                  <span style={{ background: "rgba(255,255,255,0.85)" }} />
                  <span style={{ background: "rgba(255,255,255,0.85)" }} />
                  <span style={{ background: "rgba(255,255,255,0.85)" }} />
                </div>
              </div>
            </div>
          )}

          {/* 3. Apex Auto-Reply (Autonomous Engine) — LEFT SIDE, incoming grey bubble with Apex logo avatar */}
          {phase >= 4 && (
            <div className="dm-animate-in flex items-end gap-1.5 max-w-[88%]">
              <div className="h-[24px] w-[24px] rounded-full flex-shrink-0 bg-black border border-white/15 overflow-hidden flex items-center justify-center mb-0.5 shadow-sm">
                <img src="/brand/apex-mark.png" alt="Apex" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="rounded-[18px] rounded-bl-[4px] px-3.5 py-2.5 text-[11px] text-white leading-[1.45] bg-[#262626]">
                  hey! gloves on all day — can&apos;t stop to text mid-job 🧤 use my booking link
                  below, takes 90 sec, price locked, slot held. no back-and-forth needed
                  <Link
                    to="/book"
                    className="mt-2 flex items-center justify-between rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white transition-all group"
                  >
                    <span className="flex items-center gap-1 text-amber-400">
                      <Zap className="h-3 w-3 fill-current" />
                      <span>Lock Slot (90 sec)</span>
                    </span>
                    <span className="text-white/70 group-hover:text-white transition-colors">
                      Book →
                    </span>
                  </Link>
                </div>
                <p className="text-[8.5px] text-[#8e8e8e] pl-1 flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span>Automated · Apex Autonomous Engine</span>
                </p>
              </div>
            </div>
          )}

          {/* 4. Customer replies (YOU) — RIGHT SIDE, Instagram Blue Pill */}
          {phase >= 5 && (
            <div className="dm-animate-out flex justify-end max-w-[74%] ml-auto">
              <div className="rounded-[18px] rounded-br-[4px] px-3.5 py-2 text-[11px] font-normal text-white leading-[1.45] bg-[#3797f0] shadow-sm">
                ok booking now, thanks 🤙
              </div>
            </div>
          )}
        </div>

        {/* Instagram Message Input Bar & Android Gesture Indicator */}
        <div className="shrink-0 px-3 pb-2 pt-2 bg-black border-t border-[#1a1a1a]">
          {/* Pill input container matching user screenshot */}
          <div className="rounded-full border border-[#2c2c2c] bg-[#141414] px-3.5 py-1.5 flex items-center justify-between gap-2">
            {/* Blinking cursor and Message... placeholder */}
            <Link
              to="/book"
              className="flex-1 min-w-0 flex items-center text-[11px] text-[#737373] hover:text-white/80 transition-colors"
            >
              <span className="inline-block w-[1.5px] h-3.5 bg-white/90 mr-1 animate-pulse" />
              <span className="truncate">Message...</span>
            </Link>

            {/* Right icons: Mic, Image, Smile (exact match to screenshot) */}
            <div className="flex items-center gap-2.5 text-white/90 shrink-0">
              <button
                type="button"
                aria-label="Voice Message"
                className="hover:text-white transition-colors p-0.5"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Send Photo"
                className="hover:text-white transition-colors p-0.5"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Stickers & Emojis"
                className="hover:text-white transition-colors p-0.5"
              >
                <Smile className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Android Home Gesture Indicator Bar (Realme GT Neo 3T) */}
          <div className="w-24 h-1 rounded-full bg-white/35 mx-auto mt-2 mb-0.5" />
        </div>
      </div>
    </div>
  );
}

function EditorialReview({
  name,
  vehicle,
  text,
  zip,
  service,
  initials,
  avatarColor,
}: {
  name: string;
  vehicle: string;
  text: string;
  zip: string;
  service: string;
  initials: string;
  avatarColor: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0c121e]/70 p-6 flex flex-col justify-between transition-colors hover:border-cyan/40 backdrop-blur-sm shadow-xl">
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-white/8 pb-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-mono text-[10px] uppercase text-cyan font-bold tracking-wider">
            {service}
          </span>
        </div>
        <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          &ldquo;{text}&rdquo;
        </p>
      </div>
      <div className="mt-6 pt-3 border-t border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
            style={{ background: avatarColor }}
          >
            {initials}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{name}</p>
            <p className="font-mono text-[10px] text-slate-500">{vehicle}</p>
          </div>
        </div>
        <span className="font-mono text-[10px] text-slate-600">{zip}</span>
      </div>
    </div>
  );
}

function InstagramBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 border-b border-amber/30 bg-amber/10 px-4 py-3 text-[0.8rem] text-amber-300"
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
        <span>
          You clicked from Instagram.{" "}
          <strong className="font-semibold text-amber-200">Cole is mid-job right now</strong> — this
          form books you directly. No phone tag, no callback.
        </span>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss Instagram banner"
        className="shrink-0 rounded p-0.5 text-amber-400 hover:text-amber-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function StatCell({
  target,
  suffix,
  em,
  label,
}: {
  target: number;
  suffix?: string;
  em: string;
  label: string;
}) {
  const { count, ref } = useCountUp(target);
  return (
    <div ref={ref} className="apex-stat-cell">
      <div className="apex-stat-num">
        {suffix}
        {count}
        <em>{em}</em>
      </div>
      <div className="apex-stat-label">{label}</div>
    </div>
  );
}

function Landing() {
  const { src } = useSearch({ from: "/" });
  const fromInstagram = src === "instagram";
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showBanner = fromInstagram && !bannerDismissed;

  const [previewTier, setPreviewTier] = useState<VehicleClass>("sedan");
  const selectedVehicleTier =
    VEHICLE_OPTIONS.find((v) => v.id === previewTier) ?? VEHICLE_OPTIONS[0]!;

  return (
    <main className="bg-background text-foreground overflow-hidden">
      {showBanner && <InstagramBanner onDismiss={() => setBannerDismissed(true)} />}
      <section className="apex-hero-v2">
        <div className="apex-grid-floor" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2.5">
            <span className="block w-10 h-px bg-gradient-to-r from-transparent to-red-500" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-red-400">
              Austin Metro · Van 01 · Zero Hookups
            </span>
            <span className="block w-10 h-px bg-gradient-to-l from-transparent to-red-500" />
          </div>
          <h1 className="apex-display">
            <span className="block">Austin&apos;s Mobile</span>
            <span className="apex-display-accent">Detailing Rig.</span>
            <span className="block">Comes to You.</span>
          </h1>
          <p className="apex-hero-sub">
            Cole Ramsey arrives with 85 gallons of pure deionized water and onboard power. Scoped to
            your vehicle, price locked, slot held in 90 seconds. No phone tag required.
          </p>
          <div className="apex-cta-row">
            <Link
              to="/book"
              search={fromInstagram ? { src: "instagram" } : {}}
              className="btn-primary hover:btn-primary-hover inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold rounded-xl shadow-xl transition-all"
              id="hero-cta-btn"
            >
              <span>Book Your Slot — 90 Seconds</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/hud"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/4 px-5 py-3 font-mono text-xs font-semibold text-slate-400 backdrop-blur-sm transition-colors hover:border-cyan/50 hover:text-white"
            >
              <span>Cole&apos;s Operations HUD</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="apex-stat-strip">
            <StatCell target={18} em=" leads" label="Auto-triaged this week" />
            <StatCell target={0} suffix="$" em=" lost" label="No-show revenue lost" />
            <StatCell target={90} em="s" label="Average booking time" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="apex-eyebrow">The Problem Cole Solved</span>
            <h2 className="apex-section-h2">
              Why 85% of mobile detailing leads die in the Instagram DMs.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              When Cole is wet-sanding or applying 9H ceramic coating, chemical gloves stay on for 4
              hours straight. Touching a phone transfers abrasive compound grit to client paint. By
              the time he texts back at 8 PM, the client already booked elsewhere.
            </p>
            <div className="space-y-4 pt-4 border-t border-white/8">
              {[
                {
                  num: "01",
                  title: "Glove Lockout",
                  desc: "Customer texts asking for a weekend slot. Cole cannot touch the phone mid-compound.",
                },
                {
                  num: "02",
                  title: "Instant Autonomous Reply",
                  desc: "Apex auto-replies in 3 seconds with a direct, vehicle-scoped booking engine. Zero haggling.",
                },
                {
                  num: "03",
                  title: "Route Cluster + Card Hold",
                  desc: "Customer picks an arrival window matching Cole's geographic route, authorizes a $50 deposit, and receives an Apple Wallet pass.",
                },
              ].map((step) => (
                <div key={step.num} className="flex gap-4 items-start">
                  <span className="font-mono text-xs font-bold text-cyan rounded-md border border-cyan/30 bg-cyan/8 px-2.5 py-1 shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Inline Before / After Comparison — always visible */}
            <div className="pt-4 border-t border-white/8">
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
                <span className="text-rose-400">Before — Manual</span>
                <span className="text-emerald-400">After — Apex Engine</span>
              </div>
              <div className="space-y-1.5">
                {[
                  ["8–10 DMs over 48 hrs", "90 sec from IG tap to confirmed"],
                  ["Price haggled via text", "Dynamic quote, no negotiation"],
                  ["Cross-town MoPac zig-zag", "Geo-clustered within 5mi sector"],
                  ["1 hr texting when rain hits", "1-click batch reschedule"],
                  ["No-show, no recourse", "$50 card hold every slot"],
                ].map(([before, after]) => (
                  <div key={before} className="grid grid-cols-2 gap-1.5">
                    <p className="rounded-lg border border-rose-500/20 bg-rose-500/8 px-2.5 py-2 text-[11px] text-rose-300/80">
                      {before}
                    </p>
                    <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-2 text-[11px] text-emerald-300/80">
                      {after}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("apex:open-drawer"))}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-secondary/50 px-3 py-1.5 font-mono text-[11px] font-semibold text-muted-foreground transition-colors hover:border-cyan hover:text-foreground"
              >
                <span>Open Full Comparison Drawer</span>
                <ArrowRight className="h-3 w-3 text-cyan" />
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[296px] drop-shadow-[0_40px_60px_rgba(0,0,0,0.9)]">
              <DmSimulator />
            </div>
          </div>
        </div>
      </section>

      <hr className="apex-hr mx-4 sm:mx-6" />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="apex-eyebrow">Transparent Vehicle Scoping</span>
            <h2 className="apex-section-h2">Mobile Detailing Packages.</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg">
              Prices scale with vehicle surface area. No on-site haggling, no unexpected add-ons.
            </p>
          </div>
          <div className="flex items-center rounded-xl border border-white/8 bg-[#0c121e]/90 p-1.5 backdrop-blur-md shrink-0">
            {VEHICLE_OPTIONS.map((v) => {
              const active = previewTier === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setPreviewTier(v.id)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs font-semibold transition-all ${active ? "bg-cyan text-[#07090e] shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {v.id === "suv_full" ? (
                    <Truck className="h-3.5 w-3.5" />
                  ) : (
                    <Car className="h-3.5 w-3.5" />
                  )}
                  <span>{v.title.split("&")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => {
            const calculatedPrice = Math.round(pkg.price * selectedVehicleTier.multiplier);
            const calculatedMinutes = Math.round(pkg.minutes * selectedVehicleTier.multiplier);
            const isFeatured = pkg.id === "ceramic";
            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border p-6 flex flex-col justify-between backdrop-blur-md transition-all ${isFeatured ? "border-cyan bg-[#0c121e] shadow-[0_0_40px_rgba(239,68,68,0.15)] ring-1 ring-cyan" : "border-white/8 bg-[#0a0e18]/80 hover:border-white/18"}`}
              >
                {isFeatured && (
                  <span className="absolute -top-3 right-6 rounded-md bg-cyan px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#07090e] uppercase tracking-wider">
                    Signature Finish
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-white/8 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{pkg.name}</h3>
                      <p className="font-mono text-xs text-muted-foreground mt-0.5">
                        {formatDuration(calculatedMinutes)} runtime
                      </p>
                    </div>
                  </div>
                  <div className="my-5 flex items-baseline gap-1.5">
                    <span className="font-mono text-4xl font-black text-white">
                      {money(calculatedPrice)}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      / {selectedVehicleTier.tag}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pkg.description}</p>
                  <div className="mt-6 pt-4 border-t border-white/8 space-y-2 text-xs font-mono text-slate-300">
                    {(
                      pkg.features ?? [
                        "0-TDS Deionized Water Wash",
                        "Onboard Battery Rig (No Hookup)",
                        "Austin Geo-Clustered Arrival",
                      ]
                    ).map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-cyan shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-white/8">
                  <Link
                    to="/book"
                    search={{
                      package: pkg.id,
                      vehicle: previewTier,
                      ...(fromInstagram ? { src: "instagram" } : {}),
                    }}
                    className={`inline-flex items-center justify-center gap-2 w-full rounded-xl py-3 text-xs font-bold transition-all ${isFeatured ? "btn-primary hover:btn-primary-hover shadow-lg" : "border border-white/12 bg-secondary/60 text-foreground hover:border-cyan hover:text-cyan"}`}
                  >
                    <span>{pkg.ctaLabel ?? `Book ${pkg.name.split(" ")[0]}`}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <hr className="apex-hr mx-4 sm:mx-6" />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="apex-eyebrow">Built for the Business Owner</span>
            <h2 className="apex-section-h2">
              Cole&apos;s Operations Cockpit.
              <br />
              <span className="text-cyan">Van 01 Command HUD.</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
              A live dashboard built for Cole — not the customer. Route deck auto-clustered by
              Austin zip sector, one-click weather storm reschedule for all affected ceramic
              appointments, deposit tracking, and a live inbound audit stream. Zero phone calls
              required.
            </p>
            <ul className="space-y-3 text-sm font-mono">
              {[
                {
                  icon: RouteIcon,
                  text: "MoPac geo-clustered route deck — stops sequenced to cut drive time",
                  color: "text-cyan",
                },
                {
                  icon: CloudRain,
                  text: "1-click Travis County flash storm reschedule dispatch",
                  color: "text-amber-400",
                },
                {
                  icon: Zap,
                  text: "Live inbound triage feed — auto-syncs every 30 seconds",
                  color: "text-emerald-400",
                },
                {
                  icon: MapPin,
                  text: "Status controls: En Route SMS, Job Started, Complete & Invoice",
                  color: "text-slate-400",
                },
              ].map(({ icon: Icon, text, color }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                  <span className="text-xs text-muted-foreground leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/hud"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-secondary/60 px-5 py-3 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:border-cyan hover:text-foreground"
            >
              <span>Open Owner Operations Cockpit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Link to="/hud" className="apex-hud-showcase block group">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
              <div className="flex items-center gap-2.5">
                <img
                  src="/brand/apex-mark.png"
                  alt="Apex Detail Works"
                  className="h-7 w-7 object-contain drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)]"
                  width={28}
                  height={28}
                />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
                  Field Operations Console · Van 01
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 border border-white/8 rounded-full px-2 py-0.5">
                LIVE
              </span>
            </div>
            <div className="grid grid-cols-3 border-b border-white/8">
              {[
                { label: "Confirmed", val: "3", accent: "text-cyan" },
                { label: "Revenue", val: "$1,340", accent: "text-emerald-400" },
                { label: "Deposit Held", val: "$150", accent: "text-amber-400" },
              ].map(({ label, val, accent }) => (
                <div key={label} className="px-4 py-4 border-r border-white/8 last:border-r-0">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
                    {label}
                  </p>
                  <p className={`font-mono text-xl font-black mt-1 ${accent}`}>{val}</p>
                </div>
              ))}
            </div>
            <div className="p-4 space-y-2">
              {[
                {
                  time: "9:00 AM",
                  name: "Marcus T.",
                  zip: "78704 · SoCo",
                  pkg: "Full Paint Correction",
                  price: "$480",
                },
                {
                  time: "1:30 PM",
                  name: "Devin R.",
                  zip: "78701 · Downtown",
                  pkg: "Stage-2 Ceramic",
                  price: "$560",
                },
                {
                  time: "4:00 PM",
                  name: "Priya S.",
                  zip: "78746 · Westlake",
                  pkg: "Interior + Quartz",
                  price: "$300",
                },
              ].map((stop, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/6 bg-white/2 px-3.5 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-[10px] text-cyan shrink-0 font-bold">
                      {stop.time}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{stop.name}</p>
                      <p className="font-mono text-[10px] text-slate-500 truncate">
                        {stop.pkg} · {stop.zip}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground shrink-0">
                    {stop.price}
                  </span>
                </div>
              ))}
              <div className="pt-2 text-center">
                <span className="font-mono text-[10px] text-slate-500 group-hover:text-cyan transition-colors">
                  Click to open full Operations HUD ?
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <hr className="apex-hr mx-4 sm:mx-6" />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="apex-eyebrow">Field Verified</span>
            <h2 className="apex-section-h2">Austin owners who skip the callbacks.</h2>
          </div>
          <span className="font-mono text-xs text-slate-600">
            Serving 78701 · 78704 · 78746 · 78759 · MoPac Corridors
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <EditorialReview
            name="Marcus T."
            vehicle="2024 Ford F-150"
            zip="Austin · 78704"
            service="Full Paint Correction"
            initials="MT"
            avatarColor="linear-gradient(135deg,#1e3a5f,#2563eb)"
            text="Booked in two minutes on a Wednesday. Cole showed up on time in Van 01, and the black clearcoat looks deeper than the day I bought it from the dealer."
          />
          <EditorialReview
            name="Devin R."
            vehicle="2021 BMW M3"
            zip="Downtown · 78701"
            service="Stage-2 Ceramic Finish"
            initials="DR"
            avatarColor="linear-gradient(135deg,#3b0764,#7c3aed)"
            text="The online booking engine is the cleanest system I've used for any trade service. Price was locked the instant I clicked, and the no-show deposit gave total peace of mind."
          />
          <EditorialReview
            name="Priya S."
            vehicle="2023 Porsche Macan S"
            zip="Westlake · 78746"
            service="Interior + Quartz Matrix"
            initials="PS"
            avatarColor="linear-gradient(135deg,#7f1d1d,#dc2626)"
            text="Zero back-and-forth texting. Cole arrived with 85 gallons of deionized water and his own power — didn't even need my hose. Flawless execution."
          />
        </div>
      </section>

      <section className="border-t border-white/8 bg-gradient-to-b from-[#05070c] to-[#07090e] py-24 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-3xl space-y-5">
          <span className="apex-eyebrow">Austin Metro Field Allocation</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Your Van 01 slot is waiting.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Confirmed in 90 seconds. Vehicle scoped. Price locked. $50 deposit held. Zero phone tag.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/book"
              search={fromInstagram ? { src: "instagram" } : {}}
              className="btn-primary hover:btn-primary-hover inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold shadow-xl rounded-xl"
              id="footer-cta-btn"
            >
              <span>Book Now — Lock Your Price</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/hud"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-card/60 px-6 py-4 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:border-cyan hover:text-foreground"
            >
              <span>View Cole&apos;s Operations HUD</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#04060a] pt-14 pb-16 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
            <div className="md:col-span-6 space-y-4">
              <Link
                to="/"
                className="inline-block transition-opacity hover:opacity-95"
                aria-label="Apex Detail Works Home"
              >
                <img
                  src="/brand/apex-logo.png"
                  alt="Apex Detail Works"
                  className="h-12 sm:h-[60px] w-auto max-w-[230px] sm:max-w-[270px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] transition-transform duration-200 hover:scale-[1.02] mix-blend-screen"
                  height={60}
                />
              </Link>
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                Autonomous booking, MoPac route clustering, and high-gloss multi-stage paint
                correction for Austin&apos;s most discerning vehicle owners.
              </p>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-600">
                <span className="relative flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20c15e] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20c15e]" />
                  </span>
                  Van 01 Active
                </span>
                <span>·</span>
                <span>Austin, TX Metro</span>
                <span>·</span>
                <span>(512) 555-0142</span>
              </div>
            </div>
            <div className="md:col-span-6 grid grid-cols-2 gap-8 font-mono text-xs sm:gap-12">
              <div>
                <p className="font-bold uppercase tracking-wider text-foreground">Navigation</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link to="/" className="hover:text-cyan transition-colors">
                      Customer Experience
                    </Link>
                  </li>
                  <li>
                    <Link to="/book" className="hover:text-cyan transition-colors">
                      Book Service (90s)
                    </Link>
                  </li>
                  <li>
                    <Link to="/hud" className="hover:text-cyan transition-colors">
                      Operations Cockpit (HUD)
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-foreground">
                  Service Clusters
                </p>
                <ul className="mt-3 space-y-2 text-slate-600">
                  <li>Central &amp; Downtown (78701)</li>
                  <li>South Congress &amp; SoCo (78704)</li>
                  <li>Westlake Hills (78746)</li>
                  <li>Domain &amp; North Austin</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/8 pt-6 text-[11px] text-slate-600 font-mono">
            <p>
              &copy; {new Date().getFullYear()} Apex Detail Works LLC · All Rights Reserved · Built
              for Austin, TX
            </p>
            <p className="text-right">Autonomous Booking &amp; Weather-Aware Operations Engine</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
