import confetti from "canvas-confetti";
import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Car,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  Smartphone,
  Truck,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { createBooking, lookupZone } from "@/lib/bookings.functions";
import {
  ADDONS,
  DEPOSIT,
  PACKAGES,
  TANK_SURCHARGE,
  TRAVEL_SURCHARGE,
  VEHICLE_OPTIONS,
  buildSlots,
  formatDuration,
  money,
  type VehicleClass,
} from "@/lib/booking";
import { VehiclePresetDropdown } from "@/components/vehicle-preset-dropdown";
import { VisualBookingCalendar } from "@/components/visual-booking-calendar";

interface BookSearch {
  package?: string;
  vehicle?: VehicleClass;
  src?: string;
}

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>): BookSearch => {
    const pkg = typeof search["package"] === "string" ? search["package"] : undefined;
    const vehicle =
      search["vehicle"] === "sedan" ||
      search["vehicle"] === "suv_mid" ||
      search["vehicle"] === "suv_full"
        ? (search["vehicle"] as VehicleClass)
        : undefined;
    const src = typeof search["src"] === "string" ? search["src"] : undefined;
    return {
      ...(pkg ? { package: pkg } : {}),
      ...(vehicle ? { vehicle } : {}),
      ...(src ? { src } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Book a Detail — Apex Detail Works Austin" },
      {
        name: "description",
        content:
          "Five quick steps: scope your vehicle, pick a package, match a route cluster, confirm site readiness, hold your slot with a $50 authorization.",
      },
      { property: "og:site_name", content: "Apex Detail Works" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: "https://pixel-perfect-replica-0340.lovable.app/book" },
      { property: "og:title", content: "Book a Detail — Apex Detail Works Austin" },
      {
        property: "og:description",
        content:
          "Confirmed Austin mobile detailing slot in 90 seconds. Scope vehicle size, lock package price, deposit held.",
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
        content: "Book a Detail — Apex Detail Works Austin",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Book a Detail — Apex Detail Works Austin" },
      {
        name: "twitter:description",
        content:
          "Confirmed Austin mobile detailing slot in 90 seconds. Price locked, deposit held.",
      },
      {
        name: "twitter:image",
        content: "https://pixel-perfect-replica-0340.lovable.app/brand/apex-og.png",
      },
      {
        name: "twitter:image:alt",
        content: "Book a Detail — Apex Detail Works Austin",
      },
    ],
    links: [{ rel: "canonical", href: "https://pixel-perfect-replica-0340.lovable.app/book" }],
  }),
  component: BookingWizard,
});

const STEPS = ["Vehicle", "Package", "Location", "Pre-Flight", "Deposit"];

interface ZoneMatch {
  zip_code: string;
  sector_name: string;
  green_route_day: string;
}

function formatElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${s}s`;
}

function BookingWizard() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const initialVehicle = search.vehicle ?? null;
  const initialPackage =
    search.package && PACKAGES.some((p) => p.id === search.package) ? search.package : "interior";

  const [step, setStep] = useState(initialVehicle ? 2 : 1);
  const [stepDir, setStepDir] = useState<"forward" | "back">("forward");
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef<number>(Date.now());
  const [confirmed, setConfirmed] = useState<null | {
    refCode: string;
    vehicle: string;
    packageName: string;
    slot: string;
    total: number;
    bookedInSeconds: number;
  }>(null);

  const [vehicleClass, setVehicleClass] = useState<VehicleClass | null>(initialVehicle);
  const [vehicleModel, setVehicleModel] = useState("");
  const [packageId, setPackageId] = useState(initialPackage);
  const [addonIds, setAddonIds] = useState<string[]>([]);

  const [zipCode, setZipCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [zone, setZone] = useState<ZoneMatch | null>(null);
  const [zoneChecked, setZoneChecked] = useState(false);
  const [slotId, setSlotId] = useState("");

  const [preFlight, setPreFlight] = useState({ level: false, water: false, access: false });
  const [useTank, setUseTank] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const vehicle = VEHICLE_OPTIONS.find((v) => v.id === vehicleClass) ?? null;
  const pkg = PACKAGES.find((p) => p.id === packageId) ?? PACKAGES[1]!;
  const activeAddons = ADDONS.filter((a) => addonIds.includes(a.id));
  const greenRoute = Boolean(zone);

  const slots = useMemo(() => buildSlots(zone?.green_route_day), [zone]);
  const selectedSlot = slots.find((s) => s.id === slotId) ?? null;

  const multiplier = vehicle?.multiplier ?? 1;
  const basePrice = Math.round(pkg.price * multiplier);
  const addonsPrice =
    activeAddons.reduce((sum, a) => sum + a.price, 0) + (useTank ? TANK_SURCHARGE : 0);
  const isAustin = /^(786|787)\d{2}$/.test(zipCode.trim());
  const travelFee = zoneChecked && isAustin && !greenRoute ? TRAVEL_SURCHARGE : 0;
  const total = Math.round(basePrice + addonsPrice + travelFee);
  const duration =
    Math.round(pkg.minutes * multiplier) + activeAddons.reduce((sum, a) => sum + a.minutes, 0);

  const preFlightPassed = preFlight.level && preFlight.water && preFlight.access;
  const isPhoneValid = /^\d{10}$/.test(customerPhone.trim());

  const canContinue =
    (step === 1 && vehicleClass !== null) ||
    (step === 2 && Boolean(packageId)) ||
    (step === 3 && zoneChecked && isAustin && Boolean(slotId)) ||
    (step === 4 && preFlightPassed && customerName.trim() !== "" && isPhoneValid);

  function toggleAddon(id: string) {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function checkZipDirect(zip: string) {
    const validAustin = /^(786|787)\d{2}$/.test(zip.trim());
    if (!validAustin) {
      setChecking(false);
      setZoneChecked(true);
      setZone(null);
      setSlotId("");
      toast.error(`Postal code ${zip} is outside Cole's Austin, TX service area.`);
      return;
    }

    setChecking(true);
    let data: ZoneMatch | null = null;
    try {
      data = (await lookupZone({ data: { zip } })) as ZoneMatch | null;
    } catch {
      setChecking(false);
      setZoneChecked(true);
      toast.error("Could not check route clusters. Try again.");
      return;
    }
    setChecking(false);
    setZoneChecked(true);
    setSlotId("");
    if (data) {
      setZone(data as ZoneMatch);
      toast.success(
        `Route clustered — ${data.sector_name}. $${TRAVEL_SURCHARGE} travel surcharge waived.`,
      );
    } else {
      setZone(null);
      toast.info(
        `Austin metro location verified. $${TRAVEL_SURCHARGE} cross-town transit buffer applies.`,
      );
    }
  }

  async function checkZip() {
    const zip = zipCode.trim();
    if (zip.length < 5) {
      toast.error("Enter a 5-digit Austin area zip code.");
      return;
    }
    await checkZipDirect(zip);
  }

  async function confirmBooking() {
    setSubmitting(true);
    const refCode = `ADW-${zipCode.trim()}-${Math.floor(Math.random() * 90) + 10}`;
    const vehicleLabel = vehicleModel.trim() || vehicle?.title || "Vehicle";

    try {
      await createBooking({
        data: {
          ref_code: refCode,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          vehicle_class: vehicleClass ?? "sedan",
          vehicle_model: vehicleModel.trim() || null,
          package_name: pkg.name,
          base_price: basePrice,
          addons_price: addonsPrice,
          total_price: total,
          duration_minutes: duration,
          zip_code: zipCode.trim(),
          sector_name: zone?.sector_name ?? null,
          slot_datetime: selectedSlot?.label ?? "",
          green_route: greenRoute,
          pre_flight_passed: preFlightPassed,
          deposit_held: true,
          audit_message: `${vehicleLabel} booked in ${zone?.sector_name ?? zipCode.trim()}. ${pkg.name}. ${money(total)} total. $${DEPOSIT} deposit captured.`,
        },
      });
    } catch {
      setSubmitting(false);
      toast.error("Booking could not be locked. Please try again.");
      return;
    }

    const bookedInSeconds = Math.floor((Date.now() - startTime.current) / 1000);
    setSubmitting(false);
    setConfirmed({
      refCode,
      vehicle: vehicleLabel,
      packageName: pkg.name,
      slot: selectedSlot?.label ?? "",
      total,
      bookedInSeconds,
    });
    toast.success(
      `Appointment ${refCode} locked in ${formatElapsed(bookedInSeconds)}. $${DEPOSIT} authorization held.`,
    );
  }

  function resetAll() {
    setConfirmed(null);
    setStep(1);
    setVehicleClass(null);
    setVehicleModel("");
    setPackageId("interior");
    setAddonIds([]);
    setZipCode("");
    setZone(null);
    setZoneChecked(false);
    setSlotId("");
    setPreFlight({ level: false, water: false, access: false });
    setUseTank(false);
    setCustomerName("");
    setCustomerPhone("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardName("");
    void navigate({ to: "/book", search: {} });
  }

  if (confirmed) {
    return <ConfirmationPass data={confirmed} onReset={resetAll} />;
  }

  function goNext() {
    setStepDir("forward");
    setStep((s) => Math.min(5, s + 1));
  }
  function goBack() {
    setStepDir("back");
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-44 pt-10 sm:px-6">
      <ProgressBar step={step} />

      <div className="hidden sm:flex items-center gap-2.5 mt-4 rounded-lg border border-white/8 bg-card/40 px-4 py-2.5 text-xs text-muted-foreground">
        <Smartphone className="h-4 w-4 text-cyan shrink-0" />
        <span>
          Built for the customer tapping your Instagram bio on their phone —{" "}
          <strong className="text-foreground font-semibold">works flawlessly on mobile</strong>.
          Full booking in under 90 seconds, no calling, no texting.
        </span>
      </div>

      {step === 1 ? (
        <section
          key={step}
          className={`mt-10 ${stepDir === "forward" ? "step-enter-right" : "step-enter-left"}`}
        >
          <StepHeading
            title="What are we working on today?"
            sub="Size determines chemical volume and rotary polishing time — no surprises on arrival."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {VEHICLE_OPTIONS.map((option) => {
              const active = vehicleClass === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setVehicleClass(option.id)}
                  className={`surface apex-vehicle-card relative p-4 sm:p-5 text-left transition-all hover:border-border-strong ${
                    active ? "surface-active active ring-1 ring-cyan" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg border border-border bg-secondary/70 p-2.5 text-cyan">
                      {option.id === "suv_full" ? (
                        <Truck className="h-6 w-6" />
                      ) : (
                        <Car className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold ${
                        active
                          ? "border border-cyan bg-cyan-soft text-cyan"
                          : "border border-border bg-secondary text-dim"
                      }`}
                    >
                      {option.tag}
                    </span>
                  </div>

                  <h3 className="mt-3 sm:mt-4 text-base font-bold text-foreground">
                    {option.title}
                  </h3>
                  <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-muted-foreground">
                    {option.examples}
                  </p>

                  <div className="mt-3 sm:mt-4 flex items-center gap-1.5 font-mono text-[11px] text-dim">
                    <span className="text-cyan font-bold tracking-wider">SCALE:</span>
                    <span>{option.multiplier}x base</span>
                  </div>
                </button>
              );
            })}
          </div>

          <VehiclePresetDropdown
            vehicleModel={vehicleModel}
            onChangeModel={setVehicleModel}
            onSelectClass={(cls) => setVehicleClass(cls)}
          />
        </section>
      ) : null}

      {step === 2 ? (
        <section
          key={step}
          className={`mt-10 ${stepDir === "forward" ? "step-enter-right" : "step-enter-left"}`}
        >
          <StepHeading
            title="Choose your service package."
            sub="Prices update in real time as you flag vehicle conditions — no surprise charges on arrival."
          />
          <div className="mt-6 space-y-3">
            {PACKAGES.map((option) => {
              const active = packageId === option.id;
              const pkgAdjusted = Math.round(option.price * multiplier);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPackageId(option.id)}
                  className={`surface flex w-full items-start gap-3 sm:gap-4 p-4 sm:p-5 text-left transition-all hover:border-border-strong ${
                    active ? "surface-active ring-1 ring-cyan" : ""
                  }`}
                >
                  <span
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      active ? "border-cyan bg-cyan" : "border-border-strong bg-secondary"
                    }`}
                  >
                    {active ? (
                      <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} />
                    ) : null}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm sm:text-base font-bold text-foreground">
                        {option.name}
                      </span>
                      <span className="font-mono text-xs sm:text-sm text-cyan font-semibold">
                        {money(pkgAdjusted)}{" "}
                        <span className="text-[11px] sm:text-xs text-muted-foreground font-normal">
                          · {Math.round(option.minutes * multiplier)} mins
                        </span>
                      </span>
                    </span>
                    <span className="mt-1.5 sm:mt-2 block text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="my-8 flex items-center gap-2 sm:gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-dim font-mono text-center">
              Real-World Condition Flags (toggle all that apply)
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            {ADDONS.map((addon) => {
              const active = addonIds.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  className={`surface flex items-start justify-between gap-3 sm:gap-4 p-4 sm:p-5 transition-all ${
                    active ? "surface-active" : ""
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {addon.name}{" "}
                      <span className="font-mono text-cyan ml-2 text-xs">
                        +{money(addon.price)} · +{addon.minutes} min
                      </span>
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {addon.description}
                    </p>
                  </div>
                  <Switch
                    checked={active}
                    onChange={() => toggleAddon(addon.id)}
                    label={addon.name}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section
          key={step}
          className={`mt-10 ${stepDir === "forward" ? "step-enter-right" : "step-enter-left"}`}
        >
          <StepHeading
            title="Where are you located?"
            sub="Cole's van operates in geographic sectors to cut cross-town MoPac and I-35 transit. Booking in his active sector waives the $15 travel surcharge."
          />

          <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-mono text-[10px] sm:text-[11px] text-dim w-full sm:w-auto">
              Quick Austin Sectors:
            </span>
            {[
              { zip: "78704", name: "South Congress" },
              { zip: "78701", name: "Downtown" },
              { zip: "78746", name: "Westlake Hills" },
              { zip: "78759", name: "Domain" },
              { zip: "78738", name: "Lakeway" },
            ].map((sector) => (
              <button
                key={sector.zip}
                type="button"
                onClick={() => {
                  setZipCode(sector.zip);
                  setZoneChecked(false);
                  setZone(null);
                  setTimeout(() => {
                    void checkZipDirect(sector.zip);
                  }, 50);
                }}
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] sm:text-[11px] transition-colors ${
                  zipCode === sector.zip
                    ? "border-cyan bg-cyan-soft text-cyan"
                    : "border-border bg-secondary/60 text-muted-foreground hover:border-cyan/40 hover:text-foreground"
                }`}
              >
                {sector.zip} · {sector.name}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:gap-3 sm:flex-row">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
              <input
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5));
                  setZoneChecked(false);
                  setZone(null);
                }}
                inputMode="numeric"
                placeholder="Enter 5-digit zip (e.g. 78704)"
                className="w-full rounded-lg border border-border bg-card py-3.5 sm:py-4 pl-11 pr-4 font-mono text-base sm:text-lg outline-none transition-colors placeholder:text-dim focus:border-cyan focus:shadow-[var(--shadow-glow)]"
              />
            </div>
            <button
              type="button"
              onClick={() => void checkZip()}
              className="btn-primary hover:btn-primary-hover inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 text-xs sm:text-sm min-h-[44px]"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Check Cluster
            </button>
          </div>

          {zoneChecked && isAustin && zone ? (
            <div className="mt-4 rounded-xl border border-emerald/40 bg-emerald-soft p-4 text-sm text-emerald flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Route Cluster Match — {zone.sector_name}</span>
                <p className="mt-0.5 text-xs text-emerald/90">
                  Cole's van is already servicing your neighborhood on {zone.green_route_day}. The
                  $15 cross-town travel surcharge is waived automatically.
                </p>
              </div>
            </div>
          ) : null}

          {zoneChecked && isAustin && !zone ? (
            <div className="mt-4 rounded-xl border border-amber/40 bg-amber-soft p-4 text-sm text-amber flex items-start gap-3">
              <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  Outside Primary Cluster Zone (Austin Metro Fringe)
                </span>
                <p className="mt-0.5 text-xs text-amber/90">
                  Standard $15 MoPac/I-35 travel buffer applies. Slots are still available for
                  booking.
                </p>
              </div>
            </div>
          ) : null}

          {zoneChecked && !isAustin ? (
            <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Outside Austin Metro Service Area</span>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Cole Ramsey's mobile rig operates exclusively within the Greater Austin, TX metro
                  area (Travis, Williamson, and Hays counties — zip codes starting with{" "}
                  <strong className="text-foreground font-mono">787</strong> or{" "}
                  <strong className="text-foreground font-mono">786</strong>).
                </p>
                <div className="mt-2.5 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs">
                  <span className="text-amber font-mono">Postal code &quot;{zipCode}&quot;</span> is
                  outside our physical mobile van radius. Please choose an Austin area zip code or
                  select one of the quick sectors above.
                </div>
              </div>
            </div>
          ) : null}

          {zoneChecked && isAustin ? (
            <VisualBookingCalendar
              slots={slots}
              slotId={slotId}
              onSelectSlot={setSlotId}
              greenRouteDay={zone?.green_route_day}
              sectorName={zone?.sector_name}
            />
          ) : null}
        </section>
      ) : null}

      {step === 4 ? (
        <section
          key={step}
          className={`mt-10 ${stepDir === "forward" ? "step-enter-right" : "step-enter-left"}`}
        >
          <StepHeading
            title="Quick site readiness check."
            sub="Cole drives up to 35 minutes per appointment. These 3 points prevent wasted arrival trips."
          />

          <div className="mt-6 space-y-3">
            <CheckRow
              checked={preFlight.level}
              onToggle={() => setPreFlight((p) => ({ ...p, level: !p.level }))}
              title="Level parking surface available"
              detail="Driveway grade under 10 degrees or flat residential street. Wash mats and jack stands cannot be placed on steep driveways."
            />
            <CheckRow
              checked={preFlight.water}
              onToggle={() => setPreFlight((p) => ({ ...p, water: !p.water }))}
              title="Exterior water spigot within 75 feet"
              detail="Van carries a DI filtration system and 100-gallon onboard tank — but a spigot is always preferred."
            >
              <label className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
                <Switch
                  checked={useTank}
                  onChange={() => setUseTank((v) => !v)}
                  label="Use onboard tank"
                />
                <span className="text-xs text-muted-foreground">
                  No outdoor spigot available — use van&apos;s onboard tank{" "}
                  <span className="font-mono text-amber">(+$15)</span>
                </span>
              </label>
            </CheckRow>
            <CheckRow
              checked={preFlight.access}
              onToggle={() => setPreFlight((p) => ({ ...p, access: !p.access }))}
              title="Vehicle will be accessible on arrival"
              detail="Vehicle unlocked or key in a porch lockbox. Cole cannot wait more than 10 minutes on arrival."
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="customer-first-name" className="block text-sm font-semibold">
                Your first name
              </label>
              <input
                id="customer-first-name"
                name="firstName"
                autoComplete="given-name"
                required
                aria-required="true"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Cole"
                className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-dim focus:border-cyan"
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="block text-sm font-semibold">
                Mobile number for SMS confirmation
              </label>
              <div className="mt-2 flex overflow-hidden rounded-lg border border-border bg-card focus-within:border-cyan">
                <span className="flex items-center border-r border-border px-3 font-mono text-sm text-dim">
                  +1
                </span>
                <input
                  id="customer-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel-national"
                  required
                  aria-required="true"
                  aria-invalid={customerPhone.length > 0 && customerPhone.length < 10}
                  aria-describedby={
                    customerPhone.length > 0 && customerPhone.length < 10
                      ? "phone-error"
                      : undefined
                  }
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode="numeric"
                  placeholder="5125550142"
                  className="w-full bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-dim"
                />
              </div>
              {customerPhone.length > 0 && customerPhone.length < 10 ? (
                <span
                  id="phone-error"
                  role="alert"
                  className="mt-1.5 block font-mono text-[11px] text-amber"
                >
                  10-digit number required ({customerPhone.length}/10 digits entered)
                </span>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {step === 5 ? (
        <section
          key={step}
          className={`mt-10 grid gap-6 lg:grid-cols-[1fr_360px] ${
            stepDir === "forward" ? "step-enter-right" : "step-enter-left"
          }`}
        >
          <div className="order-2 lg:order-1">
            <StepHeading
              title="Secure $50 Hold — No Charge Until Service Day"
              sub="Your card is authorized, not charged. The balance is due when Cole completes the detail."
            />
            <div className="surface mt-6 space-y-4 p-4 sm:p-5">
              <div>
                <label
                  htmlFor="card-number"
                  className="block text-xs font-semibold uppercase tracking-wider text-dim"
                >
                  Card number
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3.5 sm:px-4 focus-within:border-cyan">
                  <CreditCard className="h-4 w-4 text-dim shrink-0" />
                  <input
                    id="card-number"
                    name="cardNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    required
                    aria-required="true"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-transparent py-3 font-mono text-sm outline-none placeholder:text-dim"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="card-expiry"
                    className="block text-xs font-semibold uppercase tracking-wider text-dim"
                  >
                    Expiry
                  </label>
                  <input
                    id="card-expiry"
                    name="cardExpiry"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    required
                    aria-required="true"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="09/28"
                    className="mt-2 w-full rounded-lg border border-border bg-secondary/40 px-3.5 sm:px-4 py-3 font-mono text-sm outline-none placeholder:text-dim focus:border-cyan"
                  />
                </div>
                <div>
                  <label
                    htmlFor="card-cvc"
                    className="block text-xs font-semibold uppercase tracking-wider text-dim"
                  >
                    CVC
                  </label>
                  <input
                    id="card-cvc"
                    name="cardCvc"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    required
                    aria-required="true"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="mt-2 w-full rounded-lg border border-border bg-secondary/40 px-3.5 sm:px-4 py-3 font-mono text-sm outline-none placeholder:text-dim focus:border-cyan"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="card-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-dim"
                >
                  Cardholder name
                </label>
                <input
                  id="card-name"
                  name="cardName"
                  type="text"
                  autoComplete="cc-name"
                  required
                  aria-required="true"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Name as printed on card"
                  className="mt-2 w-full rounded-lg border border-border bg-secondary/40 px-3.5 sm:px-4 py-3 text-sm outline-none placeholder:text-dim focus:border-cyan"
                />
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => void confirmBooking()}
                className="btn-primary hover:btn-primary-hover mt-2 inline-flex w-full items-center justify-center gap-2 px-4 py-3.5 sm:px-6 sm:py-4 text-xs sm:text-sm font-bold disabled:opacity-60 min-h-[44px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                Authorize $50 &amp; Lock My Slot
              </button>
            </div>
          </div>

          <aside className="surface order-1 h-fit p-4 sm:p-5 lg:order-2">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-dim">
              Order summary
            </h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Line label={vehicle?.title ?? "Vehicle"} value={`${multiplier}x`} />
              <Line label={pkg.name} value={money(basePrice)} />
              {activeAddons.map((a) => (
                <Line key={a.id} label={a.name} value={`+${money(a.price)}`} />
              ))}
              {useTank ? (
                <Line label="Onboard water tank" value={`+${money(TANK_SURCHARGE)}`} />
              ) : null}
              {greenRoute ? (
                <Line
                  label="Green Route discount"
                  value={`-${money(TRAVEL_SURCHARGE)}`}
                  accent="emerald"
                />
              ) : (
                <Line label="Travel buffer" value={`+${money(TRAVEL_SURCHARGE)}`} accent="amber" />
              )}
            </dl>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <Line label="Total" value={money(total)} strong />
              <Line label="Deposit today" value={money(DEPOSIT)} accent="cyan" />
              <Line label="Balance on completion" value={money(total - DEPOSIT)} />
            </div>
            <p className="mt-4 font-mono text-[11px] text-dim">
              {selectedSlot?.label ?? "Slot pending"} · {formatDuration(duration)}
            </p>
          </aside>
        </section>
      ) : null}

      <StickyBar
        step={step}
        duration={duration}
        total={total}
        startTime={startTime.current}
        canContinue={Boolean(canContinue)}
        onBack={goBack}
        onNext={goNext}
      />
    </main>
  );
}

function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-1.5 sm:mt-2 max-w-3xl text-xs sm:text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <nav aria-label="Booking steps" className="w-full">
      <ol className="flex items-center w-full" role="list">
        {STEPS.map((label, index) => {
          const num = index + 1;
          const done = num < step;
          const active = num === step;
          return (
            <li
              key={label}
              className="flex flex-1 items-center last:flex-none"
              aria-current={active ? "step" : undefined}
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-7 w-7 xs:h-8 xs:w-8 items-center justify-center rounded-full border font-mono text-[11px] xs:text-xs transition-colors ${
                    done
                      ? "border-emerald bg-emerald-soft text-emerald"
                      : active
                        ? "border-cyan bg-cyan-soft text-cyan font-bold"
                        : "border-border text-dim"
                  }`}
                  aria-hidden="true"
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : num}
                </span>
                <span
                  className={`text-[9.5px] xs:text-[11px] block max-w-[48px] xs:max-w-none truncate text-center ${
                    active ? "text-foreground font-semibold" : "text-dim"
                  }`}
                >
                  <span className="sr-only">Step {num}: </span>
                  {label}
                </span>
              </div>
              {num < STEPS.length ? (
                <span
                  className={`mx-1 xs:mx-2 h-px flex-1 ${done ? "bg-emerald" : "bg-border"}`}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
        checked ? "border-cyan bg-cyan" : "border-border bg-secondary"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-foreground transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
        style={{ height: 18, width: 18 }}
      />
    </button>
  );
}

function CheckRow({
  checked,
  onToggle,
  title,
  detail,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`surface p-4 sm:p-5 ${checked ? "surface-active" : ""}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className="flex w-full items-start gap-4 text-left"
      >
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
            checked ? "border-emerald bg-emerald" : "border-border-strong"
          }`}
          aria-hidden="true"
        >
          {checked ? <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} /> : null}
        </span>
        <span>
          <span className="block text-sm font-bold">{title}</span>
          <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
            {detail}
          </span>
        </span>
      </button>
      {children}
    </div>
  );
}

function Line({
  label,
  value,
  accent,
  strong,
}: {
  label: string;
  value: string;
  accent?: "cyan" | "emerald" | "amber";
  strong?: boolean;
}) {
  const color =
    accent === "cyan"
      ? "text-cyan"
      : accent === "emerald"
        ? "text-emerald"
        : accent === "amber"
          ? "text-amber"
          : strong
            ? "text-foreground"
            : "text-muted-foreground";
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={`text-xs ${strong ? "font-bold text-foreground" : "text-muted-foreground"}`}>
        {label}
      </dt>
      <dd className={`font-mono text-sm ${color} ${strong ? "text-base font-bold" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function StickyBar({
  step,
  duration,
  total,
  startTime,
  canContinue,
  onBack,
  onNext,
}: {
  step: number;
  duration: number;
  total: number;
  startTime: number;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (step === 5) return null;

  const elapsedStr = formatElapsed(elapsed);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 text-[12px] sm:gap-4 sm:px-6 sm:py-4 sm:text-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
            <span
              className={`inline-flex items-center font-mono text-[10px] sm:text-[11px] truncate ${
                elapsed > 90 ? "text-amber" : "text-emerald"
              }`}
            >
              <Clock className="h-3 w-3 mr-1 shrink-0" />
              <span>{elapsedStr} elapsed</span>
            </span>
            <span className="font-mono text-[10px] text-dim hidden sm:inline">·</span>
            <span className="font-mono text-[10px] text-dim hidden sm:inline truncate">
              Est: {formatDuration(duration)}
            </span>
            {elapsed <= 90 && (
              <span className="font-mono text-[10px] text-emerald hidden sm:inline-flex items-center gap-1">
                <span>· on track</span>
                <Check className="h-2.5 w-2.5 stroke-[2.5]" />
              </span>
            )}
          </div>
          <p className="font-mono text-sm font-bold text-cyan sm:text-lg">Total: {money(total)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-sm min-h-[38px]"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Back</span>
            </button>
          ) : null}
          <button
            type="button"
            disabled={!canContinue}
            onClick={onNext}
            className="btn-primary hover:btn-primary-hover inline-flex items-center justify-center gap-1 px-3.5 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 sm:gap-1.5 sm:px-6 sm:py-2.5 sm:text-sm shadow-md min-h-[38px]"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmationPass({
  data,
  onReset,
}: {
  data: {
    refCode: string;
    vehicle: string;
    packageName: string;
    slot: string;
    total: number;
    bookedInSeconds: number;
  };
  onReset: () => void;
}) {
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (!showWalletModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowWalletModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showWalletModal]);

  useEffect(() => {
    const colors = ["#ef4444", "#10b981", "#f59e0b", "#ffffff"];
    const end = Date.now() + 1400;
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        gravity: 1.1,
        scalar: 0.85,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        gravity: 1.1,
        scalar: 0.85,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  function handleGoogleCalendar() {
    const title = `Apex Detail Works — ${data.packageName}`;
    const details = `Cole Ramsey — Apex Detail Works Van 01.\nReference Code: ${data.refCode}\nVehicle: ${data.vehicle}\nPackage: ${data.packageName}\nArrival Window: ${data.slot}\nDeposit Held: $${DEPOSIT}\nBalance Due on Completion: ${money(data.total - DEPOSIT)}\nContact: (512) 555-0142`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title,
    )}&details=${encodeURIComponent(details)}&location=${encodeURIComponent("Austin, TX Metro")}`;
    window.open(url, "_blank");
    toast.success("Google Calendar event link opened.");
  }

  function handleWalletPass() {
    setShowWalletModal(true);
    toast.success("Digital Apple Wallet pass ready.");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-32 pt-10 sm:px-6">
      <div className="surface confirm-card overflow-hidden relative">
        <div className="h-[6px] w-full bg-gradient-to-r from-red-600 via-red-400 to-rose-500" />
        <span className="absolute top-4 right-5 font-mono text-[10px] text-dim">
          #{data.refCode}
        </span>
        <div className="p-7 text-center">
          <CheckCircle2
            className="confirm-check mx-auto h-14 w-14 text-emerald"
            strokeWidth={1.6}
          />
          <h1 className="mt-5 text-3xl font-black tracking-tight text-foreground">
            You&apos;re Booked.
          </h1>
          <p className="mt-2 font-mono text-[11px] text-emerald tracking-wide flex items-center justify-center gap-1.5">
            <Zap className="h-3.5 w-3.5 fill-emerald text-emerald shrink-0" />
            <span>Confirmed in {formatElapsed(data.bookedInSeconds)}</span>
            {data.bookedInSeconds <= 90 ? (
              <span className="inline-flex items-center gap-1">
                — under 90s goal <Check className="h-3 w-3 stroke-[2.5]" />
              </span>
            ) : null}
          </p>
          <p className="confirm-ref mt-1 font-mono text-sm text-cyan font-bold tracking-wide">
            Reference: {data.refCode}
          </p>

          <dl className="mt-7 grid grid-cols-2 gap-3 text-left">
            <Cell label="Vehicle" value={data.vehicle} />
            <Cell label="Package" value={data.packageName} />
            <Cell label="Arrival Window" value={data.slot} />
            <Cell label="Total Due on Completion" value={money(data.total - DEPOSIT)} />
          </dl>

          <div className="mt-7 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleGoogleCalendar}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-cyan"
            >
              <CalendarPlus className="h-4 w-4 text-cyan" />
              Add to Google Calendar
            </button>
            <button
              type="button"
              onClick={handleWalletPass}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-cyan"
            >
              <Wallet className="h-4 w-4 text-cyan" />
              Save to Apple Wallet
            </button>
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-xs font-semibold text-dim"
            >
              <MessageSquare className="h-4 w-4 text-emerald" />
              SMS Confirmation Sent
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-secondary/30 p-3 text-left">
            <p className="font-mono text-[10px] text-dim mb-1 uppercase tracking-widest">
              Before vs After
            </p>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-rose line-through">
                Old way: 48hrs · 10 DMs · no deposit · 1-in-3 no-show
              </span>
              <span className="font-mono text-[10px] text-emerald">
                → Apex: {formatElapsed(data.bookedInSeconds)} · confirmed · $50 held · 0 no-shows
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Cole will text you 30 minutes before arrival. Changes? Text directly:{" "}
            <span className="font-mono text-foreground font-semibold">(512) 555-0142</span>
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Book another vehicle
            </button>
            <Link
              to="/hud"
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-card px-4 py-2 text-xs font-mono text-dim transition-colors hover:border-cyan hover:text-foreground"
            >
              <span>Switch to Cole's Operations Cockpit (HUD)</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {showWalletModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-pass-modal-title"
        >
          <button
            type="button"
            aria-label="Close pass dialog"
            onClick={() => setShowWalletModal(false)}
            className="absolute inset-0 bg-background/85 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-cyan/40 bg-[#0a0f1d] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <picture>
                  <source srcSet="/brand/apex-mark.webp" type="image/webp" />
                  <img
                    src="/brand/apex-mark.png"
                    alt="Apex Detail Works"
                    className="h-6 w-6 object-contain drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)]"
                    width={24}
                    height={24}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span
                  id="wallet-pass-modal-title"
                  className="font-mono text-xs font-bold uppercase tracking-widest text-cyan"
                >
                  APEX DETAIL WORKS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald border-l border-emerald/40 pl-2.5 font-bold">
                  Confirmed Pass
                </span>
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Close pass dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="my-5 space-y-3 font-mono text-xs">
              <div>
                <p className="text-[10px] uppercase text-dim">Customer Reference</p>
                <p className="text-base font-bold text-foreground">{data.refCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] uppercase text-dim">Vehicle</p>
                  <p className="text-foreground truncate">{data.vehicle}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-dim">Deposit Hold</p>
                  <p className="text-emerald font-bold">$50.00 (Secured)</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase text-dim">Service Package</p>
                <p className="text-cyan">{data.packageName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-dim">Arrival Window</p>
                <p className="text-foreground">{data.slot}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/40 p-4 text-center">
              <div className="flex items-center justify-center gap-[1px] h-10 px-2">
                {Array.from({ length: 52 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-foreground/75 rounded-[0.5px]"
                    style={{
                      width: [1, 2, 1, 3, 1, 2, 1, 1, 3, 2][i % 10],
                      height: i % 7 === 0 ? "100%" : "75%",
                    }}
                  />
                ))}
              </div>
              <p className="mt-2 font-mono text-[9px] text-dim tracking-[0.3em]">
                {data.refCode} · AUSTIN TX
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowWalletModal(false)}
              className="btn-primary hover:btn-primary-hover mt-5 w-full py-2.5 text-xs"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-dim font-mono">
        {label}
      </dt>
      <dd className="mt-1.5 font-mono text-xs text-foreground font-semibold">{value}</dd>
    </div>
  );
}
