import { Link, useRouterState } from "@tanstack/react-router";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHud = pathname.startsWith("/hud");
  const isBook = pathname.startsWith("/book");

  return (
    <header className="relative z-30 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 xs:px-4 sm:px-6 sm:py-3.5">
        {/* Left — Brand Logo */}
        <Link
          to="/"
          className="group flex items-center transition-opacity hover:opacity-95 shrink-0"
          aria-label="Apex Detail Works Home"
        >
          <picture>
            <source srcSet="/brand/apex-logo.webp" type="image/webp" />
            <img
              src="/brand/apex-logo.png"
              alt="Apex Detail Works"
              className="h-10 xs:h-12 sm:h-[58px] md:h-[60px] w-auto max-w-[155px] xs:max-w-[210px] sm:max-w-[290px] md:max-w-[305px] object-contain drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover:scale-[1.02] mix-blend-screen"
              width={165}
              height={60}
              loading="eager"
              decoding="async"
            />
          </picture>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3.5 shrink-0">
          {/* Van 01 live status badge */}
          <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-xs font-semibold text-slate-300 md:flex">
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
          <nav
            aria-label="Views"
            className="flex items-center rounded-lg border border-border bg-card p-1 text-xs sm:text-[12.5px] font-semibold"
          >
            <Link
              to="/"
              aria-current={!isHud && !isBook ? "page" : undefined}
              className={`rounded-md px-2.5 py-1.5 xs:px-3.5 xs:py-2 transition-colors ${
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
              aria-current={isHud ? "page" : undefined}
              className={`rounded-md px-2.5 py-1.5 xs:px-3.5 xs:py-2 transition-colors ${
                isHud ? "bg-secondary text-amber" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="xs:hidden">HUD</span>
              <span className="hidden xs:inline">Cole&apos;s HUD</span>
            </Link>
          </nav>

          {/* Book CTA */}
          <Link
            to="/book"
            className="btn-primary hover:btn-primary-hover hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-bold rounded-xl shadow-md min-h-[40px]"
          >
            Book Van 01
          </Link>
        </div>
      </div>
    </header>
  );
}
