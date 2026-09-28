import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Info, X, XCircle } from "lucide-react";

const ROWS: Array<[string, string]> = [
  ["8–10 Instagram DMs over 48 hours", "90 seconds from IG tap to confirmed booking"],
  ["Price negotiated via text message", "Dynamic real-time quote, no haggling"],
  ["Dog hair discovered on arrival", "Pre-scoped and priced in Step 2"],
  ["Cross-town MoPac zig-zag daily", "Geo-clustered within 5-mile sector"],
  ["1 hour texting clients when rain hits", "1-click dispatch to all affected jobs"],
  ["Forgotten pre-flight, wasted arrival", "3-point site check gates every booking"],
  ["No-show, no recourse", "$50 card hold on every confirmed slot"],
];

export function BeforeAfterDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isBook = pathname.startsWith("/book");

  // Listen for programmatic opens from other parts of the page
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("apex:open-drawer", handleOpen);
    return () => window.removeEventListener("apex:open-drawer", handleOpen);
  }, []);

  // Mount/unmount with animation
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      setMounted(true);
    } else {
      t = setTimeout(() => setMounted(false), 310);
    }
    return () => clearTimeout(t);
  }, [open]);

  const isVisible = open || mounted;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Before vs After comparison"
        className={`fixed ${
          isBook ? "bottom-20 right-4 sm:bottom-24 sm:right-6" : "bottom-6 right-5"
        } z-30 flex items-center gap-2 rounded-full border border-white/15 bg-card/90 px-4 py-2.5 text-xs font-semibold text-muted-foreground shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-200 hover:border-cyan/50 hover:text-foreground hover:shadow-[0_4px_24px_rgba(239,68,68,0.18)] group`}
      >
        <Info className="h-3.5 w-3.5 shrink-0 text-cyan group-hover:text-cyan transition-colors" />
        <span>Before vs After — Manual vs Apex</span>
        <ArrowRight className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </button>

      {isVisible && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          aria-label="Before vs After comparison"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: open ? 1 : 0 }}
            onClick={() => setOpen(false)}
          />

          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-card border-l border-border shadow-[var(--shadow-card)] transition-transform duration-300 ease-in-out"
            style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
          >
            <div className="h-[3px] w-full bg-gradient-to-r from-cyan via-red-500 to-amber flex-shrink-0" />

            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan mb-1">
                  Apex Detail Engine · Impact Report
                </p>
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  What we actually replaced.
                </h2>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Cole&apos;s manual process against the Apex Detail Engine — side by side.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground flex-shrink-0 mt-0.5"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-rose flex-shrink-0" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose">
                    Before — Manual
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald flex-shrink-0" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald">
                    After — Apex Engine
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {ROWS.map(([before, after], i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-rose/20 bg-rose/5 px-3 py-2.5 text-xs text-muted-foreground leading-relaxed">
                      {before}
                    </div>
                    <div className="rounded-xl border border-emerald/25 bg-emerald/5 px-3 py-2.5 text-xs text-foreground leading-relaxed font-medium">
                      {after}
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-6 h-px bg-border" />

              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                This Month — Van 01 Austin
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-4">
                  <p className="font-mono text-3xl font-black text-cyan leading-none">42</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    unstructured text conversations eliminated
                  </p>
                </div>
                <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-4">
                  <p className="font-mono text-3xl font-black text-emerald leading-none">$900</p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    in deposits secured — $0 lost to no-shows
                  </p>
                </div>
                <div className="rounded-xl border border-amber/20 bg-amber/5 p-4">
                  <p className="font-mono text-3xl font-black text-amber leading-none">
                    47<span className="text-lg">m</span>
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    of manual texting cut per rain delay event
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/30 p-4">
                  <p className="font-mono text-3xl font-black text-foreground leading-none">
                    2.5<span className="text-lg">h</span>
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    unpaid transit eliminated by route clustering
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border px-6 py-4 flex-shrink-0">
              <p className="font-mono text-[10px] text-muted-foreground">
                Real problem. Real data. Built for Cole Ramsey — Apex Detail Works · Austin, TX
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
