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
          "Austin's premier autonomous mobile auto detailing rig. 90-second booking, route-clustered van transit, zero phone tag, $50 locked deposit hold.",
      },
      { name: "author", content: "Apex Detail Works" },
      {
        name: "keywords",
        content:
          "Austin mobile detailing, auto detailing Austin, ceramic coating Austin, mobile car wash, paint correction, Travis County auto detailing, Cole Ramsey",
      },

      /* Open Graph / Facebook / LinkedIn / WhatsApp */
      { property: "og:site_name", content: "Apex Detail Works" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: "https://pixel-perfect-replica-0340.lovable.app/" },
      { property: "og:title", content: "Apex Detail Works — Austin Mobile Auto Detailing" },
      {
        property: "og:description",
        content:
          "Scope your vehicle, lock your package price, and reserve route-optimized arrival windows in 90 seconds. 85-gal pure deionized water, silent inverter & 9H ceramic bond on board.",
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
        content: "Apex Detail Works — Austin's Autonomous Mobile Detailing Rig",
      },

      /* Twitter / X Cards */
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Apex Detail Works — Austin Mobile Auto Detailing" },
      {
        name: "twitter:description",
        content:
          "Austin's autonomous mobile auto detailing rig. 90-second booking, route-clustered van transit, $50 locked deposit hold.",
      },
      {
        name: "twitter:image",
        content: "https://pixel-perfect-replica-0340.lovable.app/brand/apex-og.png",
      },
      {
        name: "twitter:image:alt",
        content: "Apex Detail Works — Austin's Autonomous Mobile Detailing Rig",
      },
    ],
    links: [
      { rel: "canonical", href: "https://pixel-perfect-replica-0340.lovable.app/" },
      {
        rel: "image_src",
        href: "https://pixel-perfect-replica-0340.lovable.app/brand/apex-og.png",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
      { rel: "preload", href: "/brand/apex-logo.webp", as: "image", type: "image/webp" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.svg?v=5", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-32.png?v=5", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16.png?v=5", type: "image/png", sizes: "16x16" },
      { rel: "shortcut icon", href: "/favicon.ico?v=5" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=5", sizes: "180x180" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const APEX_SCHEMA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": ["AutoRepair", "LocalBusiness"],
  name: "Apex Detail Works",
  alternateName: "Apex Mobile Auto Detailing Austin",
  image: "https://pixel-perfect-replica-0340.lovable.app/brand/apex-og.png",
  logo: "https://pixel-perfect-replica-0340.lovable.app/brand/apex-logo.png",
  url: "https://pixel-perfect-replica-0340.lovable.app/",
  telephone: "+1-512-555-0142",
  priceRange: "$140 - $700",
  currenciesAccepted: "USD",
  paymentAccepted: "Credit Card, Debit Card",
  description:
    "Austin's premier autonomous mobile auto detailing rig. Sole proprietor and master detailer Cole Ramsey provides on-site deionized spot-free wash, multi-stage paint correction, 9H ceramic coatings, and interior steam extraction directly at customer locations with Van 01.",
  founder: {
    "@type": "Person",
    name: "Cole Ramsey",
    jobTitle: "Master Detailer & Founder",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Austin",
    addressRegion: "TX",
    postalCode: "78701",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  areaServed: [
    { "@type": "City", name: "Austin" },
    { "@type": "AdministrativeArea", name: "Travis County, Texas" },
    { "@type": "PostalCode", postalCode: "78701" },
    { "@type": "PostalCode", postalCode: "78704" },
    { "@type": "PostalCode", postalCode: "78746" },
    { "@type": "PostalCode", postalCode: "78759" },
    { "@type": "PostalCode", postalCode: "78738" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Austin Mobile Auto Detailing Packages",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Express Foam & Seal",
          description:
            "Decontamination wash, wheel clean, tire dress, and 3-month exterior hydrophobic polymer spray seal. Base price $140 for coupe/sedan, dynamically scaled by vehicle size (1.25x for mid-size SUV, 1.55x for 3-row truck).",
        },
        price: "140.00",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
        url: "https://pixel-perfect-replica-0340.lovable.app/book?package=express",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Interior Steam & Deep Extraction",
          description:
            "Hot water extraction, heated leather conditioning, ozone anti-bacterial purge, carpet shampoo, and door jambs. Base price $220 for coupe/sedan, dynamically scaled by vehicle size (1.25x for mid-size SUV, 1.55x for 3-row truck).",
        },
        price: "220.00",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
        url: "https://pixel-perfect-replica-0340.lovable.app/book?package=interior",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "1-Stage Paint Correction + Ceramic Coating",
          description:
            "Machine compound swirl removal, rotary polish, iron decontamination, and 2-year 9H ceramic hydrophobic bond. Base price $450 for coupe/sedan, dynamically scaled by vehicle size (1.25x for mid-size SUV, 1.55x for 3-row truck).",
        },
        price: "450.00",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
        url: "https://pixel-perfect-replica-0340.lovable.app/book?package=ceramic",
      },
    ],
  },
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://pixel-perfect-replica-0340.lovable.app/book",
      inLanguage: "en-US",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    result: {
      "@type": "Reservation",
      name: "Austin Mobile Auto Detailing Appointment",
    },
  },
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: APEX_SCHEMA_JSON }} />
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
