# Apex Detail Works — Austin Mobile Auto Detailing Engine

Apex Detail Works is an autonomous mobile auto detailing web application engineered for **Cole Ramsey**, an independent mobile detailer in **Austin, Texas**.

The system solves the trade-specific **"Nitrile Glove Lockout"** dilemma: when an operator's hands are coated in compound and chemical ceramics for hours at a time, inbound inquiries often go unanswered and are lost to delayed callbacks. Apex Detail Works autonomously converts inbound leads into confirmed, route-clustered bookings with locked pricing and card holds in under 90 seconds—eliminating phone tag and manual texting without taking gloves off.

---

## Business Scenario & Core Problem

- **Operator:** Cole Ramsey — Sole Proprietor & Master Detailer, Van 01 Rig.
- **Service Area:** Greater Austin, Texas metro corridors (78701 Downtown, 78704 South Congress/SoCo, 78746 Westlake Hills, 78759 Domain, 78738 Lakeway/Bee Cave).
- **The Problem:** 85% of mobile detailing leads originate via direct messages and phone calls while the detailer is actively polishing or curing a ceramic coat. Touching a phone transfers abrasive compound grit to client paintwork. By the time the operator can respond hours later, potential clients have booked elsewhere.
- **The Solution:** A high-conversion autonomous booking engine coupled with an operator cockpit (HUD). Inbound leads are guided through a transparent, 5-step self-service workflow that enforces vehicle sizing scales, checks site readiness, waives travel surcharges for active geographic clusters, and locks the appointment with a $50 authorization hold.

> **Note on Operational Metrics:** Figures displayed in the UI (e.g., "$900 in deposits secured", "42 text conversations eliminated", "18 leads auto-triaged", "3 stops sequenced") represent **simulated demo scenario data** designed to illustrate the workflow impact and contrast manual texting against autonomous booking.

---

## Application Architecture & Routes

The application consists of three dedicated routes:

### 1. Customer Landing Experience (`/`)

- **Brand & Visuals:** Dark obsidian automotive aesthetic featuring Apex Detail Works insignia, clear hierarchy, and value proposition.
- **Simulated DM Conversion:** A Realme GT Neo 3T AMOLED phone frame demonstrating the core inbound inquiry flow: customer requests a weekend slot → automated reply issues instant route-matched link → slot locked in seconds.
- **Transparent Package Catalog:** Live previews of detailing packages dynamically scaled by vehicle surface area.
- **Before vs. After Comparison Matrix & Drawer:** Side-by-side breakdown comparing traditional manual communication against the Apex engine, backed by a global floating impact drawer.
- **Austin Service Sectors:** Overview of active MoPac and I-35 service clusters.

### 2. Autonomous Customer Booking Flow (`/book`)

- **Step 1 — Vehicle Sizing:** Select between Coupe & Compact Sedan (1.0× base), Mid-Size Crossover & SUV (1.25× scale), and Full-Size 3-Row SUV & Truck (1.55× scale) with an optional vehicle preset dropdown.
- **Step 2 — Package & Real-World Condition Flags:** Select core packages (_Express Foam & Seal_, _Interior Steam & Deep Extraction_, _1-Stage Paint Correction + Ceramic Coating_) and toggle condition flags (_Heavy Pet Hair_, _Child Safety Seat Sanitization_, _Hard Water Spot Removal_) with real-time price and runtime calculation.
- **Step 3 — Austin Metro Geofence & Cluster Sequencing:** Validates postal codes against Austin metro boundaries (`786xx` / `787xx`). Matching active sector clusters waives the $15 cross-town travel surcharge. Available arrival windows are rendered through a visual calendar.
- **Step 4 — 3-Point Site Readiness Pre-Flight:** Pre-flight checklist confirming a level parking surface (<10° grade), exterior water spigot (with a $15 onboard deionized tank fallback), and vehicle accessibility. Validates customer contact details with strict 10-digit phone enforcement.
- **Step 5 — Deposit Hold & Confirmation Pass:** Itemized order breakdown and simulated card authorization for a $50 hold. Generates a confirmed appointment pass (`ADW-78704-xx`), one-click **Add to Google Calendar** URL, digital **Apple Wallet** pass modal, and state reset.

### 3. Owner Operations Cockpit (`/hud`)

- **Van 01 Telemetry:** Real-time monitoring of equipment levels (85-gallon deionized pure water tank, 94% battery inverter bank, 52 dB whisper generator, active geographic corridor, and simulated time-saved ticker).
- **Today's Sequenced Route Deck:** Visual stops clustered to eliminate cross-town MoPac traffic, complete with arrival windows, pricing, and 1-click status actions (_En Route SMS_, _Job Started_, _Complete & Invoice_) that trigger toast notifications.
- **Austin Weather Contingency:** Dedicated _Simulate Flash Storm_ trigger opening a Travis County precipitation warning dialog with a 1-click batch reschedule dispatch.
- **Live Inbound Triage Feed:** Continuous audit stream logging confirmed bookings, status changes, and automated SMS dispatches.
- **Demo Controls:** One-click demo state reset restoring baseline Austin appointments and audit stream.

---

## Technology Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (Full-stack React SSR built on Vite and Nitro)
- **Routing:** [TanStack Router](https://tanstack.com/router) with strict file-based routing and search parameter validation
- **State & Query Management:** [TanStack React Query](https://tanstack.com/query)
- **Styling:** Vanilla CSS & Tailwind CSS v4 design tokens (Obsidian `#07090e`, Crimson `#ef4444`, Deep Amber `#f59e0b`, Emerald `#10b981`)
- **Icons:** [Lucide React](https://lucide.dev)
- **Database & Integrations:** [Supabase](https://supabase.com) (PostgreSQL tables for `bookings`, `audit_log`, and `route_zones` with Row Level Security)
- **Testing:** [Playwright](https://playwright.dev) (Headless end-to-end browser test harness)

---

## Local Development

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation & Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd pixel-perfect-replica-0340
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:8080`.

---

## Verification & Quality Assurance

The codebase includes an automated end-to-end Playwright test suite (`e2e-audit.cjs`) that deterministically verifies all customer and owner workflows without external network dependencies.

### Running Verification Commands

```bash
# 1. ESLint & code formatting
npm run lint

# 2. TypeScript strict typecheck
npx tsc --noEmit

# 3. Production SSR and Nitro build
npm run build

# 4. Playwright End-to-End Test Suite (requires dev server running on :8080)
node e2e-audit.cjs
```

### Current Verification Status

| Suite                       | Status             | Details                                                        |
| :-------------------------- | :----------------- | :------------------------------------------------------------- |
| **Playwright E2E Suite**    | **39 / 39 PASSED** | 100% deterministic test pass across all core workflows         |
| **TypeScript Typecheck**    | **PASSED**         | 0 type errors with strict checking                             |
| **ESLint (`npm run lint`)** | **PASSED**         | 0 lint errors, 0 warnings                                      |
| **Production Build**        | **PASSED**         | Full Nitro server & SSR client bundle generated in < 2 seconds |

---

## Responsive Viewport Coverage

The application has been verified across 7 responsive device breakpoints with automated assertions ensuring **zero horizontal overflow** (`document.documentElement.scrollWidth <= window.innerWidth`) on `/`, `/book`, and `/hud`:

- **320 × 800** — Compact Mobile (iPhone SE)
- **375 × 812** — Standard Mobile (iPhone Mini)
- **390 × 844** — iPhone 14 / modern iOS
- **430 × 932** — iPhone Pro Max / large mobile
- **768 × 1024** — Tablet / iPad portrait
- **1280 × 800** — Laptop / small desktop
- **1440 × 900** — Large desktop monitor

---

## Technical SEO, GEO & AI Search Discoverability

- **Structured Data:** Embedded Schema.org `AutoRepair` JSON-LD in `__root.tsx` declaring business identity, Austin TX geofence (`78701`, `78704`, `78746`, `78759`, `78738`), owner Cole Ramsey, and genuine service package catalog without fabricated reviews or ratings.
- **Open Graph & Twitter Cards:** Configured with custom 1200×630 social card (`/brand/apex-og.png`) rendered in Obsidian and Crimson palette.
- **Sitemap & Robots:** Clean XML sitemap located at `public/sitemap.xml` mapping `/`, `/book`, and `/hud`, declared in `public/robots.txt`.
- **Semantic HTML:** Distinct `h1` on all pages, descriptive `alt` tags on all images, and accessible ARIA attributes on modals, switches, and tabs.

---

## Brand Assets Directory

All production brand assets reside in `public/brand/`:

- `public/brand/apex-logo.png` / `apex-logo.webp` — Primary wordmark badge
- `public/brand/apex-mark.png` / `apex-mark.webp` — High-DPI shield icon
- `public/brand/apex-og.png` — 1200×630 Open Graph & Twitter share preview
- `public/favicon.svg`, `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` — Centered vector and raster favicons
