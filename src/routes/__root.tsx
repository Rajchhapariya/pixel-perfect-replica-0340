import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ScrollRestoration,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AmbientBackground } from "../components/ambient-background";
import { SiteHeader } from "../components/site-header";
import { BeforeAfterDrawer } from "../components/before-after-drawer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-5">
        <p className="font-mono text-xs font-bold tracking-widest uppercase text-cyan">
          Apex Detail Works
        </p>
        <h1 className="text-8xl font-black text-foreground tracking-tight">404</h1>
        <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-cyan to-transparent" />
        <h2 className="text-xl font-semibold text-foreground">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          This route doesn&apos;t exist. Cole&apos;s Van 01 is out on MoPac — try booking a slot
          instead.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary hover:btn-primary-hover inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl shadow-lg"
          >
            Return Home
          </Link>
          <Link
            to="/book"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-card/60 px-6 py-3 text-sm font-semibold text-muted-foreground hover:border-cyan hover:text-foreground transition-colors"
          >
            Book Van 01
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <p className="font-mono text-xs font-bold tracking-widest uppercase text-cyan">
          Apex Detail Works
        </p>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Something went wrong</h1>
        <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-cyan to-transparent" />
        <p className="text-sm text-muted-foreground">
          An error occurred. Try refreshing or head back home — Cole&apos;s booking engine is still
          live.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary hover:btn-primary-hover inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl shadow-lg"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-card/60 px-6 py-3 text-sm font-semibold text-muted-foreground hover:border-cyan hover:text-foreground transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#07090e" },
      { title: "Apex Detail Works — Austin Mobile Auto Detailing" },
      {
        name: "description",
        content:
          "Book a mobile detail in Austin in 90 seconds. Vehicle scoped, price locked, deposit held.",
      },
      { name: "author", content: "Apex Detail Works" },
      { property: "og:title", content: "Apex Detail Works — Austin Mobile Auto Detailing" },
      {
        property: "og:description",
        content:
          "Book a mobile detail in Austin in 90 seconds. Vehicle scoped, price locked, deposit held.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.svg?v=4", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-32.png?v=4", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16.png?v=4", type: "image/png", sizes: "16x16" },
      { rel: "shortcut icon", href: "/favicon.ico?v=4" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=4", sizes: "180x180" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    resetScroll();
    window.addEventListener("pageshow", resetScroll);
    return () => {
      window.removeEventListener("pageshow", resetScroll);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AmbientBackground />
      <SiteHeader />
      <Outlet />
      <BeforeAfterDrawer />
      <ScrollRestoration />
      <Toaster theme="dark" position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
