import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ArrowRight, Instagram, MapPinned, ShieldCheck, Timer } from "lucide-react";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    src: typeof search["src"] === "string" ? (search["src"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Apex Detail Works — Book Your Austin Mobile Detail in 90 Seconds" },
      {
        name: "description",
        content:
          "Cole's mobile detailing van serves Austin metro. Scope your vehicle, lock your price, hold your slot — no phone tag, no callbacks.",
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

const PROOF = [
  {
    accent: "cyan",
    metric: "18 Inquiries Auto-Booked This Week",
    sub: "0 manual texts sent by Cole",
    Icon: Instagram,
  },
  {
    accent: "emerald",
    metric: "7.2 Transit Hours Saved",
    sub: "Route clustering keeps Cole in your neighborhood",
    Icon: MapPinned,
  },
  {
    accent: "amber",
    metric: "$0 No-Show Revenue Lost",
    sub: "$50 deposit hold on every booking",
    Icon: ShieldCheck,
  },
] as const;

function Landing() {
  const { src } = useSearch({ from: "/" });

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-10 sm:px-6">
      {src === "instagram" ? (
        <div className="mb-8 rounded-xl border border-amber/40 bg-amber-soft px-4 py-3 text-sm text-amber">
          You clicked from Instagram. Cole is on a job right now — this form books you directly
          without any callback.
        </div>
      ) : null}

      <section className="flex flex-col items-center py-14 text-center sm:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
          Austin Mobile Detailing — No Callbacks
        </p>
        <h1 className="mt-5 max-w-4xl text-[2.6rem] font-black leading-[1.03] tracking-tight text-foreground sm:text-6xl lg:text-[4.5rem]">
          Book Your Detail. No Phone Tag. No Waiting.
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Cole&apos;s booked solid — but this form gets you a confirmed slot in 90 seconds. Vehicle
          scoped, price locked, deposit held. Done.
        </p>

        <Link
          to="/book"
          className="btn-primary hover:btn-primary-hover mt-9 inline-flex w-full items-center justify-center gap-2 px-7 py-4 text-base sm:w-auto"
        >
          Get My Free Quote in 90 Seconds
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="mt-4 flex items-center gap-2 font-mono text-xs text-dim">
          <Timer className="h-3.5 w-3.5" />
          Average completion time: 1 min 28 sec
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {PROOF.map(({ accent, metric, sub, Icon }) => (
          <article
            key={metric}
            className={`surface p-5 ${
              accent === "cyan"
                ? "border-t-2 border-t-cyan"
                : accent === "emerald"
                  ? "border-t-2 border-t-emerald"
                  : "border-t-2 border-t-amber"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                accent === "cyan"
                  ? "text-cyan"
                  : accent === "emerald"
                    ? "text-emerald"
                    : "text-amber"
              }`}
            />
            <h2 className="mt-4 text-base font-bold leading-snug text-foreground">{metric}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
