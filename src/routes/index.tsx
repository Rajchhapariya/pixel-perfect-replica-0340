import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, CheckCircle2, MapPin, ShieldCheck, Sparkles, Star, X, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Apex Detail Works — Book Your Austin Mobile Detail in 90 Seconds",
      },
      {
        name: "description",
        content:
          "Cole's mobile detailing van serves Austin metro. Scope your vehicle, lock your price, hold your slot — no phone tag, no callbacks.",
      },
      {
        property: "og:title",
        content: "Apex Detail Works — Austin Mobile Detailing",
      },
      {
        property: "og:description",
        content: "Scope your vehicle, lock your price, hold your slot in 90 seconds. No callbacks required.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/* ─── Animated counter hook ─── */
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

/* ─── Stat card ─── */
function StatCard({
  value,
  unit,
  prefix,
  label,
  sub,
  accent,
  watermark,
}: {
  value: number;
  unit?: string;
  prefix?: string;
  label: string;
  sub: string;
  accent: "cyan" | "emerald" | "amber";
  watermark: string;
}) {
  const { count, ref } = useCounter(value);
  const glowColors = {
    cyan: "var(--cyan)",
    emerald: "var(--emerald)",
    amber: "var(--amber)",
  };
  const softColors = {
    cyan: "var(--cyan-soft)",
    emerald: "var(--emerald-soft)",
    amber: "var(--amber-soft)",
  };
  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className="stat-card"
      style={
        {
          "--accent-color": glowColors[accent],
          "--accent-soft": softColors[accent],
        } as React.CSSProperties
      }
    >
      <div className="stat-card-watermark" aria-hidden="true">
        {watermark}
      </div>
      <div className="stat-card-top-bar" />
      <p className="stat-card-value">
        {prefix}
        {count}
        {unit}
      </p>
      <h3 className="stat-card-label">{label}</h3>
      <p className="stat-card-sub">{sub}</p>
    </article>
  );
}

/* ─── Service pill ─── */
function ServicePill({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <span className="service-pill">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

/* ─── Review card ─── */
function ReviewCard({ name, vehicle, text, zip }: { name: string; vehicle: string; text: string; zip: string }) {
  return (
    <div className="review-card">
      <div className="review-stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber text-amber" />
        ))}
      </div>
      <p className="review-text">"{text}"</p>
      <div className="review-meta">
        <span className="review-name">{name}</span>
        <span className="review-vehicle">
          {vehicle} · {zip}
        </span>
      </div>
    </div>
  );
}

/* ─── Landing page ─── */
function Landing() {
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> | undefined });
  const isFromInstagram = search?.["src"] === "instagram";
  const [igBannerDismissed, setIgBannerDismissed] = useState(false);
  const showIgBanner = isFromInstagram && !igBannerDismissed;
  const igBannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showIgBanner) return;
    document.body.classList.add("ig-banner-open");
    if (igBannerRef.current) {
      document.documentElement.style.setProperty("--ig-banner-h", `${igBannerRef.current.offsetHeight}px`);
    }
    return () => {
      document.body.classList.remove("ig-banner-open");
      document.documentElement.style.removeProperty("--ig-banner-h");
    };
  }, [showIgBanner]);

  return (
    <main className="landing-root">
      {/* ── INSTAGRAM SOURCE BANNER ── */}
      {showIgBanner && (
        <div className="ig-banner" ref={igBannerRef} role="status">
          <p className="ig-banner-text">
            You clicked from Instagram. Cole is mid-job right now — this form books you directly
            without any phone tag.
          </p>
          <button
            type="button"
            className="ig-banner-close"
            aria-label="Dismiss banner"
            onClick={() => setIgBannerDismissed(true)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero-section">
        {/* Noise texture overlay */}
        <div className="hero-noise" aria-hidden="true" />

        {/* Car silhouette SVG ghost */}
        <div className="hero-car-ghost" aria-hidden="true">
          <svg viewBox="0 0 900 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-car-svg">
            <path
              d="M80 200 L120 160 L220 120 L360 100 L500 105 L620 115 L700 140 L760 165 L820 175 L820 200 Z"
              fill="url(#carBody)"
            />
            <path d="M220 120 L260 80 L400 68 L520 72 L580 80 L620 115 Z" fill="url(#carRoof)" />
            <circle cx="220" cy="207" r="38" fill="url(#wheelGrad)" />
            <circle cx="220" cy="207" r="22" fill="url(#rimGrad)" />
            <circle cx="660" cy="207" r="38" fill="url(#wheelGrad)" />
            <circle cx="660" cy="207" r="22" fill="url(#rimGrad)" />
            <defs>
              <linearGradient id="carBody" x1="80" y1="160" x2="820" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--cyan)" stopOpacity="0.22" />
                <stop offset="1" stopColor="var(--cyan)" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="carRoof" x1="220" y1="68" x2="620" y2="115" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--cyan)" stopOpacity="0.16" />
                <stop offset="1" stopColor="var(--cyan)" stopOpacity="0.04" />
              </linearGradient>
              <radialGradient id="wheelGrad" cx="50%" cy="50%" r="50%">
                <stop stopColor="var(--cyan)" stopOpacity="0.12" />
                <stop offset="1" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
                <stop stopColor="var(--cyan)" stopOpacity="0.07" />
                <stop offset="1" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Laser grid floor */}
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-content">
          {/* Eyebrow */}
          <div className="hero-eyebrow">
            <span className="eyebrow-rule" />
            <span className="eyebrow-text">Austin Mobile Detailing — No Callbacks</span>
            <span className="eyebrow-rule" />
          </div>

          {/* Headline */}
          <h1 className="hero-headline">
            <span className="headline-plain">Book Your Detail.</span>
            <br />
            <span className="headline-gradient">No Phone Tag.</span>
            <br />
            <span className="headline-plain">No Waiting.</span>
          </h1>

          {/* Sub */}
          <p className="hero-sub">
            Cole&apos;s booked solid — but this form confirms your slot in 90 seconds.
            <br className="hidden sm:block" />
            Vehicle scoped. Price locked. Deposit held. Done.
          </p>

          {/* Service pills */}
          <div className="hero-pills">
            <ServicePill icon={Zap} text="Maintenance Wash" />
            <ServicePill icon={ShieldCheck} text="Paint Correction" />
            <ServicePill icon={Sparkles} text="Ceramic Coating" />
            <ServicePill icon={MapPin} text="Austin Metro Only" />
          </div>

          {/* Instagram DM simulation strip */}
          <div className="dm-strip" aria-label="Instagram DM simulation">
            <p className="dm-strip-label">What happens when you DM @apexdetailworks</p>
            <div className="dm-bubble dm-bubble-in">
              Hey Cole, do you have anything open this week? Need a full detail on my F-150
            </div>
            <div className="dm-bubble dm-bubble-out">
              Hey! I don't answer DMs mid-job but my booking link handles it — price, slot,
              everything. Done in 90 seconds.
            </div>
            <div className="dm-strip-arrow" aria-hidden="true">
              <ArrowDown className="h-4 w-4" />
            </div>
          </div>

          {/* CTA */}
          <div className="hero-cta-wrap">
            <Link
              to="/book"
              search={isFromInstagram ? { src: "instagram" } : {}}
              className="cta-btn"
              id="hero-cta-btn"
            >
              <span className="cta-btn-shine" aria-hidden="true" />
              Get My Free Quote in 90 Seconds
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="cta-footnote">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
              <span>Average completion: 1 min 28 sec · $50 deposit holds your slot</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="trust-strip">
        <p className="trust-strip-text">
          Trusted by Porsche, BMW, Tesla &amp; Rivian owners across Austin&apos;s{" "}
          <span className="trust-zone">78701</span> · <span className="trust-zone">78704</span> ·{" "}
          <span className="trust-zone">78746</span> · <span className="trust-zone">78759</span> corridors
        </p>
      </div>

      {/* ── STATS ── */}
      <section className="stats-section">
        <StatCard
          value={18}
          label="Inquiries Auto-Booked This Week"
          sub="0 manual texts sent by Cole"
          accent="cyan"
          watermark="18"
        />
        <StatCard
          value={7}
          unit=".2 hrs"
          label="Transit Hours Saved"
          sub="Route clustering keeps Cole in your neighborhood"
          accent="emerald"
          watermark="7"
        />
        <StatCard
          value={0}
          prefix="$"
          label="No-Show Revenue Lost"
          sub="$50 deposit hold on every confirmed slot"
          accent="amber"
          watermark="$0"
        />
      </section>

      {/* ── BEFORE / AFTER TEASE ── */}
      <div className="before-after-tease">
        <button
          type="button"
          className="baf-tease-btn"
          onClick={() => {
            const btn = document.querySelector<HTMLButtonElement>("button[class*='fixed'][class*='bottom']");
            btn?.click();
          }}
        >
          See what Apex replaced — manual DMs vs. the engine
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── REVIEWS ── */}
      <section className="reviews-section">
        <ReviewCard
          name="Marcus T."
          vehicle="2024 Ford F-150"
          text="Booked in two minutes. Cole showed up on time, the truck looks like it just rolled off the lot."
          zip="78704"
        />
        <ReviewCard
          name="Devin R."
          vehicle="2021 BMW M3"
          text="Paint correction was flawless. The online booking flow is the cleanest I've seen for any service."
          zip="78701"
        />
        <ReviewCard
          name="Priya S."
          vehicle="2023 Porsche Macan S"
          text="No back-and-forth texting. Price was locked the second I clicked. Exactly what I needed."
          zip="78746"
        />
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta-section">
        <div className="final-cta-glow" aria-hidden="true" />
        <p className="final-cta-eyebrow">Ready to book?</p>
        <h2 className="final-cta-headline">Your slot is waiting.</h2>
        <p className="final-cta-sub">Confirmed in 90 seconds. No phone tag. No surprises on arrival.</p>
        <Link to="/book" className="cta-btn" id="footer-cta-btn">
          <span className="cta-btn-shine" aria-hidden="true" />
          Book Now — Lock Your Price
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
