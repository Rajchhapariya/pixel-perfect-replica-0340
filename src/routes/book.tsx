import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Car,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  Truck,
  Wallet,
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

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Detail — Apex Detail Works Austin" },
      {
        name: "description",
        content:
          "Five quick steps: scope your vehicle, pick a package, match a route cluster, confirm site readiness, hold your slot with a $50 authorization.",
      },
      { property: "og:title", content: "Book a Detail — Apex Detail Works Austin" },
      {
        property: "og:description",
        content: "Confirmed Austin detailing slot in 90 seconds. Price locked, deposit held.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingWizard,
});

const STEPS = ["Vehicle", "Package", "Location", "Pre-Flight", "Deposit"];

interface ZoneMatch {
  zip_code: string;
  sector_name: string;
  green_route_day: string;
}

function BookingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<null | {
    refCode: string;
    vehicle: string;
    packageName: string;
    slot: string;
    total: number;
  }>(null);

  const [vehicleClass, setVehicleClass] = useState<VehicleClass | null>(null);
  const [vehicleModel, setVehicleModel] = useState("");
  const [packageId, setPackageId] = useState("interior");
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
  const basePrice = pkg.price * multiplier;
  const addonsPrice = activeAddons.reduce((sum, a) => sum + a.price, 0) + (useTank ? TANK_SURCHARGE : 0);
  const travelFee = zoneChecked && !greenRoute ? TRAVEL_SURCHARGE : 0;
  const total = basePrice + addonsPrice + travelFee;
  const duration =
    Math.round(pkg.minutes * multiplier) + activeAddons.reduce((sum, a) => sum + a.minutes, 0);

  const preFlightPassed = preFlight.level && preFlight.water && preFlight.access;

  const canContinue =
    (step === 1 && vehicleClass !== null) ||
    (step === 2 && Boolean(packageId)) ||
    (step === 3 && zoneChecked && Boolean(slotId)) ||
    (step === 4 && preFlightPassed && customerName.trim() !== "" && customerPhone.trim() !== "");

  function toggleAddon(id: string) {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function checkZip() {
    const zip = zipCode.trim();
    if (zip.length < 5) {
      toast.error("Enter a 5-digit Austin area zip code.");
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
    }
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

    setSubmitting(false);
    setConfirmed({
      refCode,
      vehicle: vehicleLabel,
      packageName: pkg.name,
      slot: selectedSlot?.label ?? "",
      total,
    });
    toast.success(
      `Appointment ${refCode} locked. $${DEPOSIT} authorization held. Cole will SMS you 30 minutes before arrival.`,
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
    void navigate({ to: "/book" });
  }

  if (confirmed) {
    return <ConfirmationPass data={confirmed} onReset={resetAll} />;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-44 pt-8 sm:px-6">
      <ProgressBar step={step} />

      {step === 1 ? (
        <section className="mt-10">
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
                  className={`surface p-5 text-left transition-all hover:border-border-strong ${active ? "surface-active" : ""}`}
                >
                  {option.id === "suv_full" ? (
                    <Truck className="h-5 w-5 text-cyan" />
                  ) : (
                    <Car className="h-5 w-5 text-cyan" />
                  )}
                  <h3 className="mt-3 text-base font-bold">{option.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {option.examples}
                  </p>
                  <span className="mt-4 inline-block rounded-full border border-border bg-secondary px-2.5 py-1 font-mono text-[11px] text-dim">
                    {option.tag}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="mt-8 block">
            <span className="text-sm font-semibold">Vehicle Year, Make &amp; Model (optional)</span>
            <input
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="e.g. 2023 Porsche Macan S"
              className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm outline-none transition-colors placeholder:text-dim focus:border-cyan"
            />
          </label>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="mt-10">
          <StepHeading
            title="Choose your service package."
            sub="Prices update in real time as you flag vehicle conditions — no surprise charges on arrival."
          />
          <div className="mt-6 space-y-3">
            {PACKAGES.map((option) => {
              const active = packageId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPackageId(option.id)}
                  className={`surface flex w-full items-start gap-4 p-5 text-left transition-all hover:border-border-strong ${active ? "surface-active" : ""}`}
                >
                  <span
                    className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? "border-cyan bg-cyan" : "border-border-strong"}`}
                  >
                    {active ? <Check className="h-3 w-3 text-background" strokeWidth={3} /> : null}
                  </span>
                  <span className="flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-base font-bold">{option.name}</span>
                      <span className="font-mono text-sm text-cyan">
                        {money(option.price)} · {option.minutes} mins
                      </span>
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="my-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-dim">
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
                  className={`surface flex items-start justify-between gap-4 p-5 ${active ? "surface-active" : ""}`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold">
                      {addon.name}{" "}
                      <span className="font-mono text-cyan">
                        +{money(addon.price)}, +{addon.minutes} mins
                      </span>
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {addon.description}
                    </p>
                  </div>
                  <Switch checked={active} onChange={() => toggleAddon(addon.id)} label={addon.name} />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="mt-10">
          <StepHeading
            title="Where are you located?"
            sub="Cole's van operates in geographic sectors to cut cross-town MoPac and I-35 transit. Booking in his active sector waives the $15 travel surcharge."
          />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
                placeholder="78704"
                className="w-full rounded-lg border border-border bg-card py-4 pl-11 pr-4 font-mono text-lg outline-none transition-colors placeholder:text-dim focus:border-cyan focus:shadow-[var(--shadow-glow)]"
              />
            </div>
            <button
              type="button"
              onClick={() => void checkZip()}
              className="btn-primary hover:btn-primary-hover inline-flex items-center justify-center gap-2 px-6 py-4 text-sm"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Check Availability
            </button>
          </div>

          {zoneChecked && zone ? (
            <div className="mt-4 rounded-xl border border-emerald/40 bg-emerald-soft p-4 text-sm text-emerald">
              Route Cluster Match — {zone.sector_name}. Cole&apos;s van is already servicing your
              neighborhood on {zone.green_route_day}. $15 travel surcharge waived automatically.
            </div>
          ) : null}
          {zoneChecked && !zone ? (
            <div className="mt-4 rounded-xl border border-amber/40 bg-amber-soft p-4 text-sm text-amber">
              Your area is outside Cole&apos;s current cluster zones. Standard $15 travel buffer
              applies. Slots still available.
            </div>
          ) : null}

          {zoneChecked ? (
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-dim">
                Available arrival windows
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {slots.map((slot) => {
                  const active = slotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSlotId(slot.id)}
                      className={`surface p-4 text-left transition-all hover:border-border-strong ${active ? "surface-active" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-mono text-sm text-foreground">{slot.label}</p>
                        {active ? <Check className="h-4 w-4 shrink-0 text-cyan" /> : null}
                      </div>
                      {slot.green ? (
                        <span className="mt-3 inline-block rounded-full border border-emerald/40 bg-emerald-soft px-2 py-1 text-[10px] font-semibold text-emerald">
                          Green Route — Travel Fee Waived
                        </span>
                      ) : (
                        <span className="mt-3 inline-block text-[11px] text-dim">Standard</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="mt-10">
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
            <label className="block">
              <span className="text-sm font-semibold">Your first name</span>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Cole"
                className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-dim focus:border-cyan"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Mobile number for SMS confirmation</span>
              <div className="mt-2 flex overflow-hidden rounded-lg border border-border bg-card focus-within:border-cyan">
                <span className="flex items-center border-r border-border px-3 font-mono text-sm text-dim">
                  +1
                </span>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode="numeric"
                  placeholder="5125550142"
                  className="w-full bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-dim"
                />
              </div>
            </label>
          </div>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="order-2 lg:order-1">
            <StepHeading
              title="Secure $50 Hold — No Charge Until Service Day"
              sub="Your card is authorized, not charged. The balance is due when Cole completes the detail."
            />
            <div className="surface mt-6 space-y-4 p-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-dim">
                  Card number
                </span>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-4 focus-within:border-cyan">
                  <CreditCard className="h-4 w-4 text-dim" />
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-transparent py-3 font-mono text-sm outline-none placeholder:text-dim"
                  />
                </div>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-dim">
                    Expiry
                  </span>
                  <input
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="09/28"
                    className="mt-2 w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 font-mono text-sm outline-none placeholder:text-dim focus:border-cyan"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-dim">
                    CVC
                  </span>
                  <input
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="mt-2 w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 font-mono text-sm outline-none placeholder:text-dim focus:border-cyan"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-dim">
                  Cardholder name
                </span>
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Name as printed on card"
                  className="mt-2 w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm outline-none placeholder:text-dim focus:border-cyan"
                />
              </label>

              <button
                type="button"
                disabled={submitting}
                onClick={() => void confirmBooking()}
                className="btn-primary hover:btn-primary-hover mt-2 inline-flex w-full items-center justify-center gap-2 px-6 py-4 text-sm disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Authorize $50 &amp; Lock My Slot
              </button>
            </div>
          </div>

          <aside className="surface order-1 h-fit p-5 lg:order-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-dim">Order summary</h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Line label={vehicle?.title ?? "Vehicle"} value={`${multiplier}x`} />
              <Line label={pkg.name} value={money(basePrice)} />
              {activeAddons.map((a) => (
                <Line key={a.id} label={a.name} value={`+${money(a.price)}`} />
              ))}
              {useTank ? <Line label="Onboard water tank" value={`+${money(TANK_SURCHARGE)}`} /> : null}
              {greenRoute ? (
                <Line label="Green Route discount" value={`-${money(TRAVEL_SURCHARGE)}`} accent="emerald" />
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
        canContinue={Boolean(canContinue)}
        onBack={() => setStep((s) => Math.max(1, s - 1))}
        onNext={() => setStep((s) => Math.min(5, s + 1))}
      />
    </main>
  );
}

function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, index) => {
        const num = index + 1;
        const done = num < step;
        const active = num === step;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs ${
                  done
                    ? "border-emerald bg-emerald-soft text-emerald"
                    : active
                      ? "border-cyan bg-cyan-soft text-cyan"
                      : "border-border text-dim"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : num}
              </span>
              <span
                className={`hidden text-[11px] sm:block ${active ? "text-foreground" : "text-dim"}`}
              >
                {label}
              </span>
            </div>
            {num < STEPS.length ? (
              <span className={`mx-2 h-px flex-1 ${done ? "bg-emerald" : "bg-border"}`} />
            ) : null}
          </div>
        );
      })}
    </div>
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
    <div className={`surface p-5 ${checked ? "surface-active" : ""}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-4 text-left">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
            checked ? "border-emerald bg-emerald" : "border-border-strong"
          }`}
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
  canContinue,
  onBack,
  onNext,
}: {
  step: number;
  duration: number;
  total: number;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  if (step === 5) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p className="font-mono text-[11px] text-dim">
            Estimated Time: {formatDuration(duration)}
          </p>
          <p className="font-mono text-lg font-bold text-cyan">Total: {money(total)}</p>
        </div>
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : null}
          <button
            type="button"
            disabled={!canContinue}
            onClick={onNext}
            className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2 px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
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
  data: { refCode: string; vehicle: string; packageName: string; slot: string; total: number };
  onReset: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-32 pt-12 sm:px-6">
      <div className="surface overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-cyan to-emerald" />
        <div className="p-7 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald" strokeWidth={1.6} />
          <h1 className="mt-5 text-3xl font-black tracking-tight">You&apos;re Booked.</h1>
          <p className="mt-3 font-mono text-sm text-cyan">Reference: {data.refCode}</p>

          <dl className="mt-7 grid grid-cols-2 gap-3 text-left">
            <Cell label="Vehicle" value={data.vehicle} />
            <Cell label="Package" value={data.packageName} />
            <Cell label="Arrival Window" value={data.slot} />
            <Cell label="Total Due on Completion" value={money(data.total - DEPOSIT)} />
          </dl>

          <div className="mt-7 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-xs font-semibold transition-colors hover:border-cyan"
            >
              <CalendarPlus className="h-4 w-4 text-cyan" />
              Add to Google Calendar
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-xs font-semibold transition-colors hover:border-cyan"
            >
              <Wallet className="h-4 w-4 text-cyan" />
              Save to Apple Wallet
            </button>
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-xs font-semibold text-dim"
            >
              <MessageSquare className="h-4 w-4" />
              SMS Confirmation Sent
            </button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Cole will text you 30 minutes before arrival. Any changes? Text directly:{" "}
            <span className="font-mono text-foreground">(512) 555-0142</span>
          </p>

          <button
            type="button"
            onClick={onReset}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan hover:underline"
          >
            View another booking
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="mt-3">
            <Link to="/hud" className="text-xs text-dim hover:text-muted-foreground">
              Open Cole&apos;s operations HUD
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-dim">{label}</dt>
      <dd className="mt-1.5 font-mono text-xs text-foreground">{value}</dd>
    </div>
  );
}
