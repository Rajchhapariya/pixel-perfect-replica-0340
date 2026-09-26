import { useState } from "react";
import { Info, X } from "lucide-react";

const ROWS: Array<[string, string]> = [
  ["8-10 Instagram DMs over 48 hours", "90 seconds from IG tap to confirmed booking"],
  ["Price negotiated via text message", "Dynamic real-time quote, no haggling"],
  ["Dog hair discovered on arrival", "Pre-scoped and priced in Step 2"],
  ["Cross-town MoPac zig-zag daily", "Geo-clustered within 5-mile sector"],
  ["1 hour texting clients when rain hits", "1-click dispatch to all affected jobs"],
  ["Forgotten pre-flight, wasted arrival", "3-point site check gates every booking"],
  ["No-show, no recourse", "$50 card hold on every confirmed slot"],
];

export function BeforeAfterDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-border-strong bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-[var(--shadow-card)] transition-colors hover:border-cyan"
      >
        <Info className="h-4 w-4 text-cyan" />
        Before vs After — Manual vs Apex
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <h2 className="text-lg font-bold">What we actually replaced.</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cole&apos;s manual process against the Apex Detail Engine.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3 pb-2 text-[11px] font-bold uppercase tracking-widest">
                <span className="text-rose">Before — Manual</span>
                <span className="text-emerald">After — Apex Engine</span>
              </div>
              <div className="space-y-2">
                {ROWS.map(([before, after]) => (
                  <div key={before} className="grid grid-cols-2 gap-3">
                    <p className="rounded-lg border border-rose/25 bg-rose-soft p-3 text-xs text-muted-foreground">
                      {before}
                    </p>
                    <p className="rounded-lg border border-emerald/25 bg-emerald-soft p-3 text-xs text-foreground">
                      {after}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="font-mono text-xl text-cyan">42</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    unstructured text conversations eliminated this month
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="font-mono text-xl text-emerald">$900</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    in deposits secured across 18 bookings — $0 lost to no-shows
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
