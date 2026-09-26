import { Link, useRouterState } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHud = pathname.startsWith("/hud");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyan" strokeWidth={2.4} />
          <span className="text-sm font-bold tracking-[0.14em] text-foreground sm:text-base">
            APEX DETAIL WORKS
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-border bg-card p-1 text-xs font-semibold">
            <Link
              to="/"
              className={`rounded-full px-3 py-1.5 transition-colors ${
                isHud ? "text-muted-foreground hover:text-foreground" : "bg-secondary text-cyan"
              }`}
            >
              Customer View
            </Link>
            <Link
              to="/hud"
              className={`rounded-full px-3 py-1.5 transition-colors ${
                isHud ? "bg-secondary text-amber" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cole&apos;s HUD
            </Link>
          </div>

          <span
            className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] sm:flex ${
              isHud
                ? "border-amber/40 bg-amber-soft text-amber"
                : "border-emerald/40 bg-emerald-soft text-emerald"
            }`}
          >
            <span
              className={`pulse-dot h-1.5 w-1.5 rounded-full ${isHud ? "bg-amber" : "bg-emerald"}`}
            />
            {isHud ? "Operations Console — Van 01" : "Van 01 Active — Austin Metro"}
          </span>
        </div>
      </div>
    </header>
  );
}
