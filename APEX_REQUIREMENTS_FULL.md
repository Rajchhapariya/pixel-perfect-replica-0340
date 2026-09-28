# Apex Detail Works — Full Product Requirements Document

## Lovable x Contra Challenge ($25,000 Prize Pool)

> **Mission:** Build an enterprise-grade, two-sided SaaS application that turns an inbound customer inquiry for a mobile auto-detailing business into a confirmed, deposit-secured booking — with zero manual effort from the owner. This is not a landing page template. It is a fully functional, production-quality product that demonstrates real problem-solving, real data persistence, and a UI that stands alongside Vercel, Linear, and Contra in design quality.

---

## 1. Competition Context & Judging Criteria

### Challenge Source

- **Platform:** Contra x Lovable Challenge
- **Prize Pool:** $25,000 total ($12,500 first place, $7,500 second, $2,500 third, $2,500 social)
- **Partner Requirement:** Lovable Expert Partner Program application submitted (DONE)

### Judging Criteria (Ranked by Weight)

| Rank | Criterion                  | What Judges Actually Look For                                                                                                                             |
| :--- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Problem-Solving Impact** | Does it genuinely turn "can I book with you?" into "you're booked"? Is the inquiry context visible? Is the booking confirmed with no manual owner action? |
| 2    | **Owner-Effort Reduction** | How many hours of manual work are removed per day? Is it quantified? Does it show concrete automation (not just a form)?                                  |
| 3    | **Craft & Execution**      | Is the UI polished to a product-company standard? Does every route work end-to-end? Is data persisted and real? Is it responsive on mobile?               |
| 4    | **Storytelling**           | Is the before/after contrast clear and emotionally resonant? Does the demo flow show the value in under 3 minutes?                                        |

### Judges

- **Felix Haas** — Design @ Lovable: Evaluates visual hierarchy, typography, micro-interactions, and UI polish.
- **Vikas Bhagat** — Product & Marketing @ Lovable: Evaluates practical product-market fit and operational realism.
- **Alex Hao** — Social @ Lovable: Evaluates narrative hook strength, video clarity, and shareability.
- **Allison Nulty** — Head of Product @ Contra: Evaluates solo operator empowerment and reduction of administrative overhead.

---

## 2. Business Archetype — Apex Detail Works

### Identity

- **Business Name:** Apex Detail Works
- **Location:** Austin, Texas (Travis & Williamson Counties)
- **Owner/Operator:** Cole Ramsey — Master Detailer & Ceramic Coating Specialist
- **Vehicle:** Custom Mercedes Sprinter Van — 100-gallon DI water tank, quiet inverter generator, hot water extractor, rotary polisher, pressure washer

### The Five Real Problems Cole Has (Build the entire app around solving these)

**Problem 1 — The Nitrile Glove Lockout:**
Cole works 7–9 hours daily wearing chemical-resistant gloves. He physically cannot answer his phone or reply to Instagram DMs without stopping work, stripping gloves, and washing hands. By the time he responds hours later, 65% of leads have already booked a competitor. This is the core narrative — the customer-side of the app exists to solve this.

**Problem 2 — Scoping Ambiguity ("How Much For a Detail?"):**
Every inquiry requires 8–10 back-and-forth messages because customers never give enough information. Vehicle class, interior condition, and paint condition all affect price and duration. A static Calendly form fails because it cannot scope the job.

**Problem 3 — Route Fragmentation ("The Zig-Zag Tax"):**
Austin traffic across MoPac Expressway and I-35 is among the worst in the US. If Cole takes Round Rock (North) at 9 AM, Westlake (Southwest) at 1 PM, and Pflugerville (Northeast) at 5 PM, he burns 2.5 hours and $45 in fuel on unpaid transit. Geo-clustering by zip code sector solves this.

**Problem 4 — The Driveway Surprise:**
Cole drives 35 minutes to a residential address and finds: a 25-degree incline driveway where wash mats cannot sit safely, a locked car with no key, or no outdoor water spigot. A pre-flight gate in the booking flow eliminates this.

**Problem 5 — Texas Flash Storm Reschedule Chaos:**
Austin experiences sudden convective thunderstorms. Ceramic coatings cannot bond in rain or high humidity. When a storm hits, Cole spends 45–60 minutes individually texting 4–6 clients. One-click mass rescheduling eliminates this.

### One-Line Problem Statement (Use on Contra submission form)

> **Apex Detail Works** — Converts inbound Austin Instagram DMs for a solo mobile detailer into confirmed, deposit-secured bookings in 90 seconds, eliminating 2+ hours of daily text quoting and clustering jobs by neighborhood to cut 2.5 hours of unpaid drive time per day.

---

## 3. Tech Stack

| Layer     | Technology                             | Notes                                                     |
| :-------- | :------------------------------------- | :-------------------------------------------------------- |
| Framework | React + TypeScript                     | Functional components only                                |
| Routing   | React Router v6                        | 3 routes: `/`, `/book`, `/hud`                            |
| Styling   | Vanilla CSS with CSS custom properties | No Tailwind. Pure CSS using the token system in Section 5 |
| Database  | Supabase (PostgreSQL)                  | 3 tables: `bookings`, `audit_log`, `route_zones`          |
| Icons     | Lucide React                           | Zero emojis anywhere                                      |
| Toasts    | Sonner                                 | For all action confirmation feedback                      |
| Fonts     | Google Fonts: Inter + JetBrains Mono   | Via `<link>` in HTML head                                 |
| Build     | Vite + TypeScript                      | Standard setup                                            |

---

## 4. Supabase Database Schema

### Table 1: `bookings`

```sql
create table bookings (
  id              uuid        default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  ref_code        text        not null,
  customer_name   text,
  customer_phone  text,
  vehicle_class   text        not null,
  vehicle_model   text,
  package_name    text        not null,
  base_price      numeric     not null,
  addons_price    numeric     default 0,
  total_price     numeric     not null,
  duration_mins   integer     not null,
  zip_code        text        not null,
  sector_name     text,
  slot_datetime   text        not null,
  green_route     boolean     default false,
  pre_flight_pass boolean     default false,
  deposit_held    boolean     default true,
  status          text        default 'confirmed'
);
```

### Table 2: `audit_log`

```sql
create table audit_log (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  event_type  text        not null,
  booking_ref text,
  message     text        not null,
  source      text        default 'system'
);
```

### Table 3: `route_zones`

```sql
create table route_zones (
  id               uuid    default gen_random_uuid() primary key,
  zip_code         text    not null,
  sector_name      text    not null,
  green_route_day  text    not null,
  discount_active  boolean default true
);
```

### Seed Data — `route_zones`

```sql
insert into route_zones (zip_code, sector_name, green_route_day) values
  ('78704', 'South Congress / SoCo', 'Tuesday'),
  ('78701', 'Downtown Austin',       'Wednesday'),
  ('78746', 'Westlake Hills',        'Thursday'),
  ('78759', 'North Austin / Domain', 'Monday'),
  ('78738', 'Lakeway / Bee Cave',    'Friday');
```

### Seed Data — `bookings` (3 demo records)

```sql
insert into bookings
  (ref_code, customer_name, vehicle_class, vehicle_model, package_name,
   base_price, addons_price, total_price, duration_mins,
   zip_code, sector_name, slot_datetime, green_route, pre_flight_pass, deposit_held, status)
values
  ('ADW-78704-89', 'Marcus T.', 'suv_full', '2024 Ford F-150',
   'Interior Steam & Deep Extraction', 220, 50, 255, 195,
   '78704', 'South Congress / SoCo', '2024-10-01T09:00:00',
   true, true, true, 'confirmed'),

  ('ADW-78701-90', 'Devin R.', 'sedan', '2021 BMW M3',
   '1-Stage Paint Correction + Ceramic Coating', 450, 65, 500, 280,
   '78701', 'Downtown Austin', '2024-10-02T13:30:00',
   false, true, true, 'confirmed'),

  ('ADW-78746-91', 'Priya S.', 'suv_mid', '2023 Porsche Macan S',
   'Express Foam & Seal', 140, 0, 140, 90,
   '78746', 'Westlake Hills', '2024-10-03T09:00:00',
   true, true, true, 'confirmed');
```

### Seed Data — `audit_log`

```sql
insert into audit_log (event_type, booking_ref, message, source) values
  ('BOOKING_CONFIRMED', 'ADW-78704-89',
   '2024 Ford F-150 booked in South Congress (78704). $255 total. $50 deposit captured. Green route day — $15 surcharge waived.',
   'instagram_bio'),

  ('BOOKING_CONFIRMED', 'ADW-78701-90',
   '2021 BMW M3 booked in Downtown Austin (78701). Paint correction + ceramic coating. Driveway pre-flight passed.',
   'direct_link'),

  ('SMS_DISPATCHED', 'ADW-78746-91',
   'Pre-arrival SMS automatically triggered for 09:00 AM Westlake Hills appointment.',
   'system');
```

### Row-Level Security Policies

```sql
alter table bookings    enable row level security;
alter table audit_log   enable row level security;
alter table route_zones enable row level security;

create policy "public_read_bookings"  on bookings    for select using (true);
create policy "public_insert_bookings" on bookings   for insert with check (true);
create policy "public_update_bookings" on bookings   for update using (true);
create policy "public_read_audit"     on audit_log   for select using (true);
create policy "public_insert_audit"   on audit_log   for insert with check (true);
create policy "public_read_zones"     on route_zones for select using (true);
```

---

## 5. Design System

The entire application is built on this token system. No hardcoded hex values anywhere except in this section.

### Color Tokens (CSS Custom Properties)

```css
:root {
  /* Backgrounds */
  --bg-base: #07090e;
  --bg-card: #0f172a;
  --bg-card-hover: #131f35;
  --bg-input: #111827;

  /* Borders */
  --border: #1e293b;
  --border-strong: #334155;
  --border-cyan: #06b6d4;

  /* Accent Colors */
  --cyan: #06b6d4;
  --cyan-dim: rgba(6, 182, 212, 0.12);
  --cyan-glow: rgba(6, 182, 212, 0.2);
  --emerald: #10b981;
  --emerald-dim: rgba(16, 185, 129, 0.12);
  --amber: #f59e0b;
  --amber-dim: rgba(245, 158, 11, 0.12);
  --rose: #f43f5e;
  --rose-dim: rgba(244, 63, 94, 0.12);
  --indigo: #6366f1;
  --indigo-dim: rgba(99, 102, 241, 0.08);

  /* Text */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-dim: #64748b;

  /* Shadows */
  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-glow-cyan: 0 0 0 1px var(--cyan), 0 0 24px var(--cyan-glow);
  --shadow-cta: 0 4px 18px rgba(6, 182, 212, 0.35);

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-pill: 999px;
}
```

### Typography Rules

- **All headings, body copy, labels, buttons:** `font-family: 'Inter', sans-serif`
- **Prices, ref codes, zip codes, timestamps, vehicle specs, metrics:** `font-family: 'JetBrains Mono', monospace`
- **Hero headline size:** `clamp(2.8rem, 6vw, 5rem)`, weight `900`, `letter-spacing: -0.025em`
- **Section headings:** `clamp(1.4rem, 3vw, 2rem)`, weight `700`
- **All text is Austin-specific and trade-specific — zero lorem ipsum**

### Strict Global Rules

- No emojis anywhere. Lucide React icons only.
- No generic words: "passionate", "leverage", "cutting-edge", "seamless", "vibrant"
- No Tailwind utility classes in CSS files — use the design token system above
- No hardcoded hex values outside the `:root` block

### Card Base Style

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}
.card:hover {
  border-color: var(--border-strong);
}
.card.selected {
  border-color: var(--cyan);
  box-shadow: var(--shadow-glow-cyan);
}
```

### Primary CTA Button

```css
.btn-primary {
  background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
  color: #ffffff;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.85rem 1.75rem;
  box-shadow: var(--shadow-cta);
  cursor: pointer;
  transition:
    transform 150ms ease,
    opacity 150ms ease;
  position: relative;
  overflow: hidden;
}
.btn-primary:hover {
  transform: translateY(-2px);
  opacity: 0.93;
}
.btn-primary::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  transition: left 400ms ease;
}
.btn-primary:hover::before {
  left: 150%;
}
```

### Ambient Background (Fixed, All Pages)

```css
.ambient-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.ambient-bg::before {
  content: "";
  position: absolute;
  top: -200px;
  right: -200px;
  width: 700px;
  height: 700px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--cyan-dim) 0%, transparent 70%);
}
.ambient-bg::after {
  content: "";
  position: absolute;
  bottom: -200px;
  left: -200px;
  width: 700px;
  height: 700px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--indigo-dim) 0%, transparent 70%);
}
```

---

## 6. Application Architecture

### Route Structure

```
/       → Public Landing Page (Instagram Bio Entry Point)
/book   → 5-Step Customer Booking Wizard
/hud    → Owner Operations Command HUD (Cole's Dashboard)
```

### Global Layout Components (All Routes)

1. `<SiteHeader />` — Top navigation, logo, view switcher pill, status badge
2. `<AmbientBackground />` — Fixed gradient orbs behind all content
3. `<BeforeAfterDrawer />` — Floating pill + slide-over, ALL routes
4. `<Toaster />` — Sonner toast container at root level

### Booking State Shape

```typescript
interface BookingState {
  step: number;
  vehicleClass: "sedan" | "suv_mid" | "suv_full" | null;
  vehicleModel: string;
  packageName: string;
  basePrice: number;
  addonsPrice: number;
  addonMins: number;
  baseDuration: number;
  zipCode: string;
  sectorName: string;
  greenRoute: boolean;
  selectedSlot: string;
  preFlight: { level: boolean; water: boolean; access: boolean; tankUpgrade: boolean };
  customerName: string;
  customerPhone: string;
  refCode: string;
  confirmed: boolean;
}
```

### Pricing Logic

```typescript
const VEHICLE_MULTIPLIER = { sedan: 1.0, suv_mid: 1.25, suv_full: 1.55 };

const PACKAGES = [
  { name: "Express Foam & Seal", price: 140, duration: 90 },
  { name: "Interior Steam & Deep Extraction", price: 220, duration: 150 },
  { name: "1-Stage Paint Correction + Ceramic Coating", price: 450, duration: 240 },
];

const ADDONS = [
  { name: "Heavy Pet / Dog Hair Removal", price: 50, duration: 45 },
  { name: "Child Safety Seat Steam Sanitization", price: 35, duration: 30 },
  { name: "Hard Water Spot & Glass Mineral Removal", price: 65, duration: 40 },
];

const TRAVEL_SURCHARGE = 15; // Waived when green_route = true
const TANK_SURCHARGE = 15; // Added when no outdoor spigot
const DEPOSIT = 50;

const totalPrice = Math.round(
  basePrice * VEHICLE_MULTIPLIER[vehicleClass] +
    addonsPrice +
    (greenRoute ? 0 : TRAVEL_SURCHARGE) +
    (tankUpgrade ? TANK_SURCHARGE : 0),
);
```

---

## 7. Route 1 — Landing Page (`/`)

### Instagram Source Banner (Conditional)

Detect `?src=instagram` via `useSearchParams`. If present, render a slim banner above the header:

```
[Alert icon]  You clicked from Instagram. Cole is mid-job right now —
this form books you directly. No phone tag, no callback.   [X]
```

Styling: amber at 10% opacity background, amber `1px solid` bottom border, `0.8rem` Inter.

### Site Header

- Left: Shield icon + `APEX DETAIL WORKS` — `700` weight, `uppercase`, `0.14em` letter-spacing
- Right: Green pulsing status dot + `Van 01 Active — Austin Metro`

### Hero Section (Full viewport height, centered)

**Eyebrow tag:**

```
── AUSTIN MOBILE DETAILING — NO CALLBACKS ──
```

JetBrains Mono, `0.7rem`, `var(--cyan)`, `0.18em` letter-spacing, uppercase.

**Headline (3 lines, split spans):**

```
Book Your Detail.     ← var(--text-primary)
No Phone Tag.         ← gradient: var(--cyan) → #0284c7
No Waiting.           ← var(--text-primary)
```

Size: `clamp(2.8rem, 6vw, 5rem)`, weight `900`.

**Sub-headline:**

```
Cole's booked solid — but this form confirms your slot in 90 seconds.
Vehicle scoped. Price locked. Deposit held. Done.
```

`1.05rem`, `var(--text-muted)`, `max-width: 560px`, centered.

**Service Pills (horizontal row, 4 pills):**

- `<Zap />` Maintenance Wash
- `<ShieldCheck />` Paint Correction
- `<Sparkles />` Ceramic Coating
- `<MapPin />` Austin Metro Only

Each pill: `var(--bg-card)` background, `var(--border)` border, `var(--radius-pill)`, `var(--text-muted)`, `0.8rem`.

### Instagram DM Simulation Strip (CRITICAL for Judging Criterion #1)

A narrow card immediately above the CTA button (`max-width: 480px`, centered, `var(--bg-card)` background, `var(--border)` border, `var(--radius-lg)`).

Card header:

```
[MessageSquare icon 14px]  What happens when you DM @apexdetailworks
```

JetBrains Mono, `0.68rem`, `var(--text-dim)`.

Bubble 1 (customer, left-aligned, `var(--bg-input)` background, `border-radius: 4px 12px 12px 12px`):

```
Hey Cole, do you have anything open this week?
Need a full detail on my F-150 before the weekend.
```

Bubble 2 (Cole, right-aligned, `var(--cyan-dim)` background, cyan border 30% opacity, `border-radius: 12px 4px 12px 12px`):

```
Hey! I don't take DMs mid-job — gloves on all day.
Use my booking link below. Price, slot, confirmed in
90 seconds. No back-and-forth.
```

Below bubbles: a thin `var(--cyan)` downward arrow pointing toward the CTA button.

### Primary CTA Button

```
Get My Free Quote in 90 Seconds  →
```

Full-width on mobile, `max-width: 400px` centered on desktop. Navigates to `/book` (or `/book?src=instagram`).

Below button, trust line:

```
[CheckCircle2]  Average completion: 1 min 28 sec  ·  $50 deposit holds your slot
```

### Trust Strip (Full-width, border-top)

```
Trusted by Porsche · BMW · Tesla · Rivian owners across the
78701 · 78704 · 78746 · 78759 corridors
```

ZIP codes in JetBrains Mono, `var(--cyan)`.

### Stat Cards (3-column grid)

Each card: watermark background number + top accent bar + animated counter (IntersectionObserver triggers count from 0 to target over 1800ms on viewport entry).

| Card    | Value   | Label                           | Sub                                              |
| :------ | :------ | :------------------------------ | :----------------------------------------------- |
| Cyan    | 18      | Inquiries Auto-Booked This Week | 0 manual texts sent by Cole                      |
| Emerald | 7.2 hrs | Transit Hours Saved             | Route clustering keeps Cole in your neighborhood |
| Amber   | $0      | No-Show Revenue Lost            | $50 deposit hold on every confirmed slot         |

### Before/After Tease

```
[ See what Apex replaced — manual DMs vs. the engine  → ]
```

A muted pill button that opens the `<BeforeAfterDrawer />`.

### Review Cards (3 cards)

- Marcus T. · 2024 Ford F-150 · 78704 — `"Booked in two minutes. Cole showed up on time, the truck looks like it just rolled off the lot."`
- Devin R. · 2021 BMW M3 · 78701 — `"Paint correction was flawless. The online booking flow is the cleanest I've seen for any trade service."`
- Priya S. · 2023 Porsche Macan S · 78746 — `"No back-and-forth texting. Price was locked the second I clicked. Exactly what I needed."`

5-star rating row on each card. Name in `var(--text-primary)`, vehicle + zip in JetBrains Mono `var(--text-dim)`.

### Final CTA Repeat

```
READY TO BOOK?
Your slot is waiting.
Confirmed in 90 seconds. No phone tag. No surprises on arrival.
[ Book Now — Lock Your Price → ]
```

Radial glow behind this section: `var(--cyan-dim)` at 50% of viewport width, centered at bottom.

---

## 8. Route 2 — Customer Booking Wizard (`/book`)

### Persistent Layout Elements

- **Top progress bar:** 5 step dots connected by a line. Completed = `<CheckCircle2 />` emerald. Active = cyan. Future = dim.
- **Sticky bottom summary bar** (steps 1–4): Left = `Estimated Time: Xh Ym` + `Total: $XXX` (live updates). Right = Back (hidden step 1) + Continue (disabled until valid).

---

### Step 1 — Vehicle Classification

**Heading:** `What are we working on today?`
**Sub:** `Size determines chemical volume and rotary polishing time — no surprises on arrival.`

3 selection cards (3-column grid desktop, 1-column mobile):

| Card | Icon        | Title                       | Examples                                                  | Multiplier tag     |
| :--- | :---------- | :-------------------------- | :-------------------------------------------------------- | :----------------- |
| A    | `<Car />`   | Coupe & Compact Sedan       | Porsche 911, Tesla Model 3, BMW 3 Series, Mazda MX-5      | Base Scale — 1.0×  |
| B    | `<Truck />` | Mid-Size Crossover & SUV    | BMW X5, Audi Q5, Porsche Macan, Subaru Outback            | +25% Scale — 1.25× |
| C    | `<Truck />` | Full-Size 3-Row SUV & Truck | Ford F-150, Chevy Suburban, Cadillac Escalade, Rivian R1T | +55% Scale — 1.55× |

Selected card: cyan border + `var(--shadow-glow-cyan)`.

Below cards: text input `Vehicle Year, Make & Model (optional)`, placeholder `e.g. 2023 Porsche Macan S`.

Continue enabled when any card is selected.

---

### Step 2 — Package & Condition Scoping

**Heading:** `Choose your service package.`
**Sub:** `Prices update in real time as you flag vehicle conditions — no surprise charges on arrival.`

3 package radio cards (one selectable at a time):

| Package                                    | Price | Duration | Description                                                                                                     |
| :----------------------------------------- | :---- | :------- | :-------------------------------------------------------------------------------------------------------------- |
| Express Foam & Seal                        | $140  | 90 min   | Decontamination wash, wheel clean, tire dress, exterior spray seal. Paint not touched.                          |
| Interior Steam & Deep Extraction           | $220  | 150 min  | Hot water extraction, leather conditioning, ozone deodorization, carpet shampoo, door jambs. (Default selected) |
| 1-Stage Paint Correction + Ceramic Coating | $450  | 240 min  | Machine compound swirl removal, rotary polish, iron decontamination, 9H ceramic hydrophobic bond.               |

**Divider:** `Real-World Condition Flags — toggle all that apply`

3 addon toggles:

| Toggle                                  | Price | Duration | Sub                                               |
| :-------------------------------------- | :---- | :------- | :------------------------------------------------ |
| Heavy Pet / Dog Hair Removal            | +$50  | +45 min  | Specialty rubber stone brushing and fiber purge.  |
| Child Safety Seat Steam Sanitization    | +$35  | +30 min  | Non-toxic enzymatic antibacterial deep clean.     |
| Hard Water Spot & Glass Mineral Removal | +$65  | +40 min  | Citric acid treatment + clay bar decontamination. |

Bottom bar updates on every toggle.

---

### Step 3 — Austin Route Clustering & Slot Selection

**Heading:** `Where are you located?`
**Sub:** `Cole's van operates in geographic sectors to cut cross-town MoPac and I-35 transit. Booking in his active zone waives the $15 travel surcharge.`

**Zip code input:** Large, prominent. On blur or button click — query `route_zones` Supabase table.

**Match found:** Emerald banner:

```
[CheckCircle2]  Route Cluster Match — [sector_name]
Cole's van is already servicing your neighborhood on [green_route_day].
$15 travel surcharge waived automatically.
```

Sets `greenRoute = true`.

**No match:** Amber banner:

```
[AlertTriangle]  Your area is outside Cole's current cluster zones.
Standard $15 travel buffer applies. Slots still available.
```

Sets `greenRoute = false`.

**Slot Grid** (2-column mobile, 4-column desktop):

- 4 upcoming slots calculated from current week dates
- Slots matching `green_route_day` from Supabase: emerald badge `Green Route — Travel Fee Waived`
- Other slots: dim label `Standard`
- Selected slot: cyan border + check icon

---

### Step 4 — Site Pre-Flight Checklist

**Heading:** `Quick site readiness check.`
**Sub:** `Cole drives up to 35 minutes per appointment. Three quick confirmations prevent wasted arrival trips.`

3 interactive checkbox rows (all 3 required to proceed):

1. **Level parking surface available** — `Driveway grade under 10 degrees or flat residential street.`
2. **Exterior water spigot within 75 feet** — `Van carries 100-gallon DI tank — a spigot is always preferred.` Sub-toggle if unchecked: `No spigot — use van's onboard tank (+$15)` — adds `TANK_SURCHARGE` if selected.
3. **Vehicle will be accessible on arrival** — `Vehicle unlocked or key in porch lockbox. Cole cannot wait beyond 10 minutes.`

**Contact inputs (below checklist, both required):**

- `Your first name` — text input
- `Mobile number for SMS confirmation` — tel input with `+1` prefix badge

Continue button: disabled (`cursor: not-allowed`, reduced opacity) until all 3 checked AND name + phone filled.

---

### Step 5 — Deposit Authorization & Booking Pass

**Left column (form):**

Heading: `Authorize $50 deposit to lock your slot.`
Badge: `Secure $50 Hold — No Charge Until Service Day`

Stripe-style mock card form:

- Card number: `placeholder="4242 4242 4242 4242"`
- Expiry (half): `placeholder="MM / YY"`
- CVC (half): `placeholder="CVV"`
- Name: `placeholder="Name on card"`

Footnote in `var(--text-dim)`, `0.7rem`: `[Demo Mode — No real payment processed]`

**Right column (order summary):**

```
ORDER SUMMARY
───────────────────────────────
Vehicle class
Package name              $[basePrice × multiplier]
Addon 1 (if active)      +$XX
Addon 2 (if active)      +$XX
Travel surcharge          +$15  OR  Waived (emerald)
Tank upgrade (if active)  +$15
───────────────────────────────
Total                     $[totalPrice]
Deposit today             $50
Balance on completion     $[totalPrice - 50]
───────────────────────────────
Slot: [selected day/time]
```

**Primary button:** `Authorize $50 & Lock My Slot`

**On click — sequential actions:**

1. Show `<Loader2 />` spinner, disable button
2. Generate `refCode = 'ADW-' + zipCode + '-' + (Math.floor(Math.random() * 90) + 10)`
3. `INSERT` into Supabase `bookings` with all state values
4. `INSERT` into Supabase `audit_log` — `event_type='BOOKING_CONFIRMED'`
5. Show Sonner toast: `Appointment [refCode] locked. $50 authorization held.`
6. Transition to booking confirmation pass

---

### Booking Confirmation Pass (Step 5 Done State)

Entrance animation:

- Card: `opacity: 0 → 1` + `translateY: 24px → 0` over `400ms ease-out`
- Checkmark icon: `scale: 0 → 1` with `cubic-bezier(0.34, 1.56, 0.64, 1)` over `350ms`, `150ms` delay
- Ref code: `opacity: 0 → 1` + slight `translateY` with `200ms` delay

Content:

- `3px` cyan-to-emerald gradient top bar
- `<CheckCircle2 />` icon (animated)
- `You're Booked.` — `2rem`, weight `900`
- Ref code: `Reference: [refCode]` — JetBrains Mono
- Summary grid (2×2): Vehicle, Package, Arrival Window, Total on Completion
- 3 action buttons: `Add to Google Calendar` (`<CalendarPlus />`), `Save to Apple Wallet` (`<Wallet />`), `SMS Confirmation Sent` (disabled — `<MessageSquare />`)
- Footer: `Cole will text you 30 minutes before arrival. Changes? Text: (512) 555-0142`
- Reset link: `← Book another vehicle` — resets state, goes to step 1

---

## 9. Route 3 — Owner Command HUD (`/hud`)

### HUD Header Variant

- Same `<SiteHeader />` component
- Shows amber badge instead of green: `Cole's Cockpit — Van 01`
- View switcher: `[ Customer View ] | [ Cole's HUD ]` — HUD tab active

### Top KPI Strip (4 cards)

| Card                       | Border Color | Data                                                                          | Sub                                                      |
| :------------------------- | :----------- | :---------------------------------------------------------------------------- | :------------------------------------------------------- |
| Inbound Leads Auto-Triaged | cyan         | `SELECT COUNT(*) FROM bookings WHERE created_at >= now() - interval '7 days'` | 0 manual DMs or callbacks required                       |
| Transit Hours Saved        | emerald      | `7.2 hrs` (hardcoded for demo)                                                | Geo-clustering eliminated 148 cross-town miles this week |
| Deposit Revenue Secured    | amber        | `COUNT * $50` from above query                                                | Zero no-shows. Every slot has a card hold                |
| Van 01 Status              | default      | `DI Tank 85 gal                                                               | Inverter 94%                                             | Gen: Quiet Mode` | Icons: `<Droplets />` `<BatteryCharging />` `<Wrench />` |

4-column grid on desktop, 2×2 on tablet, 1-column on mobile.

---

### Austin Flash Storm Alert Panel

Amber-bordered panel below KPI strip.

**Left:** `<AlertTriangle />` amber + `Austin Weather Alert Trigger` + `Ceramic coatings and paint corrections cannot cure in rain or high humidity.`

**Right:** Button `Simulate Flash Storm` — amber fill, `<CloudRain />`

**Modal on click:**

Heading: `<CloudRain />  Travis County Precipitation Warning`

Body: `85% rain probability forecasted for Thursday in Travis County. The following exterior appointments are affected:`

Fetch and list: `SELECT * FROM bookings WHERE status='confirmed' LIMIT 3`
Each: `[ref_code] — [vehicle_model] — [sector_name] — [slot_datetime formatted]`

SMS Preview box (dark inset, JetBrains Mono):

```
Hi [customer_name], Cole from Apex Detail Works.
Heavy rain is forecasted for Austin on Thursday —
ceramic coatings cannot bond in wet conditions.
Tap your priority slot link to reschedule:
apexdetail.works/reschedule/[ref_code]
```

Buttons: `Cancel` + `Execute 1-Click Reschedule` (amber primary)

**On Execute:**

1. `UPDATE bookings SET status='rescheduled' WHERE id IN [first 3 confirmed booking IDs]`
2. `INSERT` 3 rows in `audit_log` — `event_type='RAIN_RESCHEDULE'`
3. Re-fetch audit log
4. Dismiss modal
5. Sonner toast: `3 clients notified with priority reschedule links. 47 minutes of manual texting eliminated.`

---

### HUD Main Grid — 2-Column Layout (60/40, desktop)

#### Left Column — Today's Optimized Route Deck

Heading: `Today's Route — Austin Sector 78704 / SoCo`
Sub: `Stops sequenced to eliminate cross-town transit. Est. total drive time: 28 minutes.`

**Fetch:** `SELECT * FROM bookings WHERE status='confirmed' ORDER BY slot_datetime ASC LIMIT 3`

Each **Job Stop Card**:

```
[time range — JetBrains Mono cyan]   [status badge]   [$total amber]
[vehicle_model — white, 600 weight]
[package_name]  ·  [zip_code]  ·  [sector_name]
──────────────────────────────────────────────────
[ En Route SMS ]  [ Job Started ]  [ Complete & Invoice ]
```

Between cards — transit buffer row (emerald-tinted):

```
[Navigation icon]  14 min transit — 3.8 miles via S Congress Ave → W 6th St
```

**Status button actions:**

- `En Route SMS` → `UPDATE status='en_route'` + toast
- `Job Started` → `UPDATE status='in_progress'` + toast
- `Complete & Invoice` → `UPDATE status='completed'` + toast

#### Right Column — Live Inbound Auto-Pilot Stream

Heading: `Inbound Triage Feed` + pulsing live badge (`8px` red dot + `LIVE` in JetBrains Mono `0.65rem`)

Sub: `Bookings captured while Cole is polishing. Zero gloves off.`

**Fetch:** `SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 6`
Auto-refresh every 30 seconds via `setInterval`.

Each entry:

```
[event_type badge]   [relative timestamp "4 mins ago" — dim mono]
[message text]
[source badge: instagram_bio / direct_link / system]
```

Event badge colors: `BOOKING_CONFIRMED` → cyan, `RAIN_RESCHEDULE` → amber, `SMS_DISPATCHED` → emerald.

---

## 10. Before/After Drawer (Global — All Routes)

Floating pill button: `bottom: 7rem; right: 1rem; z-index: 30`

```
[Info icon]  Before vs After — Manual vs Apex
```

Style: `var(--bg-card)` background, `var(--border-strong)` border, `var(--radius-pill)`. On hover: `border-color: var(--cyan)`.

**Slide-over animation:** `transform: translateX(100%) → translateX(0)` over `300ms ease`.
Backdrop: `rgba(0,0,0,0.60)` blur overlay — closes panel on click.
Panel width: `480px` desktop, full-width mobile.

**Content:**

Heading: `What we actually replaced.` Sub: `Cole's manual process against the Apex Detail Engine.`

Two-column comparison table:

| BEFORE — Manual                       | AFTER — Apex Engine                         |
| :------------------------------------ | :------------------------------------------ |
| 8–10 Instagram DMs over 48 hours      | 90 seconds from IG tap to confirmed booking |
| Price negotiated via text message     | Dynamic real-time quote, no haggling        |
| Dog hair discovered on arrival        | Pre-scoped and priced in Step 2             |
| Cross-town MoPac zig-zag daily        | Geo-clustered within 5-mile sector          |
| 1 hour texting clients when rain hits | 1-click dispatch to all affected jobs       |
| Forgotten pre-flight, wasted arrival  | 3-point site check gates every booking      |
| No-show, no recourse                  | $50 card hold on every confirmed slot       |

Left cells: `var(--rose-dim)` background, `var(--rose)` border 25% opacity.
Right cells: `var(--emerald-dim)` background, `var(--emerald)` border 25% opacity.

Bottom metrics:

```
42                                    $900
unstructured text conversations       in deposits secured across 18 bookings
eliminated this month                 $0 lost to no-shows
```

Values in JetBrains Mono, `1.8rem`. First is `var(--cyan)`, second is `var(--emerald)`.

---

## 11. Mobile Responsiveness Rules

| Route   | Breakpoint | Rule                                                                                               |
| :------ | :--------- | :------------------------------------------------------------------------------------------------- |
| `/`     | < 640px    | Hero headline `clamp(2rem, 8vw, 5rem)`, pills wrap, stat cards 1-column, CTA full-width            |
| `/book` | < 640px    | Vehicle cards 1-column, package cards 1-column, slot grid 2-column, step labels hide except active |
| `/book` | Any        | Sticky bottom bar always fixed at bottom, font-size `0.8rem` on mobile                             |
| `/hud`  | < 768px    | Main grid stacks vertically, route deck and audit feed full width                                  |
| `/hud`  | < 1024px   | KPI strip 2×2 grid                                                                                 |
| All     | < 480px    | Before/After drawer is full-width, no max-width                                                    |

---

## 12. Micro-Animations

### Card Selection

```css
.selectable-card {
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}
.selectable-card:hover {
  transform: translateY(-2px);
}
.selectable-card.selected {
  transform: translateY(-2px);
  border-color: var(--cyan);
  box-shadow: var(--shadow-glow-cyan);
}
```

### Progress Step Line Fill

When advancing a step: connecting line fills from `var(--border)` → `var(--emerald)` via `width: 0 → 100%` animation over `400ms`.

### Booking Confirmation Pass

```css
@keyframes passEnter {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes checkPop {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.booking-pass {
  animation: passEnter 400ms ease-out forwards;
}
.booking-pass .checkmark {
  animation: checkPop 350ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms both;
}
.booking-pass .ref-code {
  animation: fadeUp 300ms ease 200ms both;
}
```

### Animated Stat Counters

Use `IntersectionObserver` — count from `0` to target over `1800ms` with eased interpolation when card enters viewport.

### HUD Live Feed Auto-Refresh

```typescript
useEffect(() => {
  const interval = setInterval(fetchAuditLog, 30_000);
  return () => clearInterval(interval);
}, []);
```

---

## 13. Toast Messages (Sonner)

```typescript
// Booking confirmed:
toast.success(
  `Appointment ${refCode} locked. $50 authorization held. Cole will SMS you 30 minutes before arrival.`,
);

// Route cluster match:
toast.success(`Route clustered — South Austin sector. $15 travel surcharge waived.`);

// Rain delay executed:
toast.success(
  `3 clients notified with priority reschedule links. 47 minutes of manual texting eliminated.`,
);

// HUD job status update:
toast.success(`Status updated. SMS dispatched to client automatically.`);

// Any Supabase error:
toast.error(`Database error — check your Supabase connection.`);
```

---

## 14. Environment Variables

```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]
```

---

## 15. Final Build Checklist

- [ ] All 3 routes functional end-to-end (`/`, `/book`, `/hud`)
- [ ] `?src=instagram` banner + DM simulation strip visible on landing page
- [ ] 5-step wizard with live price calculation on every selection change
- [ ] Step 4 continue button locked until all 3 pre-flight boxes + name + phone filled
- [ ] Supabase `INSERT` on booking confirmation (bookings + audit_log)
- [ ] Supabase `SELECT` on HUD (live count + audit feed)
- [ ] Rain delay modal: 3 bookings listed, UPDATE + INSERT audit + toast on execute
- [ ] HUD job status buttons: UPDATE + toast on click
- [ ] Before/After drawer slide-over on all 3 routes
- [ ] Booking confirmation pass entrance animation
- [ ] Animated stat counters on landing page
- [ ] Pulsing LIVE badge on HUD audit feed
- [ ] Mobile responsive on 375px, 640px, and 768px viewports
- [ ] Zero emojis, zero lorem ipsum, zero placeholder text
- [ ] All copy is Austin-specific and auto-detailing trade-specific
- [ ] Lovable project URL set to Public
- [ ] Supabase tables + seed data live on production

---

## 16. Contra Submission Form Responses

**Business name:** Apex Detail Works

**Problem solved:**

> Converts inbound Austin Instagram DMs for a solo mobile detailer into confirmed, deposit-secured bookings in 90 seconds, eliminating 2+ hours of daily text quoting and clustering jobs by neighborhood to cut 2.5 hours of unpaid drive time per day.

**Social post (LinkedIn or X):**

```
I built a full-stack booking system for a solo mobile auto-detailer in Austin — in Lovable.

Cole was spending 2+ hours a day texting quotes via Instagram DMs. He wore
nitrile gloves all day and physically couldn't answer his phone.

Now: 90 seconds from an Instagram tap to a confirmed, deposit-secured booking.
Vehicle scoped, price locked, slot held.

The owner side is a two-screen operations HUD — route-clustered day schedule,
live booking feed, and a 1-click rain delay rescheduler that replaces 47 minutes
of manual texting with a single button press.

Built with Lovable + Supabase. Real data. Real bookings.

[your-lovable-project-url]

#lovablechallenge @Lovable
```
