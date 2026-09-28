import { Link, useRouterState } from "@tanstack/react-router";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHud = pathname.startsWith("/hud");
  const isBook = pathname.startsWith("/book");

  return (
    <header className="relative z-30 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 xs:px-4 sm:px-6 sm:py-2.5">
        {/* Left — Brand Logo */}
        <Link
          to="/"
          className="group flex items-center transition-opacity hover:opacity-95 shrink-0"
          aria-label="Apex Detail Works Home"
        >
          <img
            src="/brand/apex-logo.png"
            alt="Apex Detail Works"
            className="h-9 xs:h-11 sm:h-[50px] w-auto max-w-[135px] xs:max-w-[190px] sm:max-w-[250px] object-contain drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover:scale-[1.02] mix-blend-screen"
            height={50}
          />
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-3 shrink-0">
          {/* Van 01 live status badge */}
          <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] font-semibold text-slate-300 md:flex">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isHud ? "bg-amber" : "bg-emerald"}`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${isHud ? "bg-amber" : "bg-emerald"}`}
              />
            </span>
            <span>{isHud ? "Van 01 · Cockpit" : "Van 01 · Austin Active"}</span>
          </span>

          {/* View switcher */}
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5 xs:p-1 text-[11px] xs:text-xs font-semibold">
            <Link
              to="/"
              className={`rounded-md px-2 py-1 xs:px-3 xs:py-1.5 transition-colors ${
                !isHud && !isBook
                  ? "bg-secondary text-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="xs:hidden">Client</span>
              <span className="hidden xs:inline">Customer View</span>
            </Link>
            <Link
              to="/hud"
              className={`rounded-md px-2 py-1 xs:px-3 xs:py-1.5 transition-colors ${
                isHud ? "bg-secondary text-amber" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="xs:hidden">HUD</span>
              <span className="hidden xs:inline">Cole&apos;s HUD</span>
            </Link>
          </div>

          {/* Book CTA */}
          <Link
            to="/book"
            className="btn-primary hover:btn-primary-hover hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-md"
          >
            Book Van 01
          </Link>
        </div>
      </div>
    </header>
  );
}
