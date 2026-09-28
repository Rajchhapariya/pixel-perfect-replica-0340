export type VehicleClass = "sedan" | "suv_mid" | "suv_full";

export interface VehicleOption {
  id: VehicleClass;
  title: string;
  examples: string;
  multiplier: number;
  tag: string;
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: "sedan",
    title: "Coupe & Compact Sedan",
    examples: "Porsche 911, Tesla Model 3, BMW 3 Series, Mazda MX-5",
    multiplier: 1.0,
    tag: "Base Scale",
  },
  {
    id: "suv_mid",
    title: "Mid-Size Crossover & SUV",
    examples: "BMW X5, Audi Q5, Porsche Macan, Subaru Outback",
    multiplier: 1.25,
    tag: "1.25x Scale",
  },
  {
    id: "suv_full",
    title: "Full-Size 3-Row SUV & Truck",
    examples: "Ford F-150, Chevy Suburban, Cadillac Escalade, Rivian R1T",
    multiplier: 1.55,
    tag: "1.55x Scale",
  },
];

export interface PackageOption {
  id: string;
  name: string;
  price: number;
  minutes: number;
  description: string;
  features?: string[];
  ctaLabel?: string;
}

export const PACKAGES: PackageOption[] = [
  {
    id: "express",
    name: "Express Foam & Seal",
    price: 140,
    minutes: 90,
    description:
      "Decontamination wash, wheel clean, tire dress, exterior spray seal. Paint does not get touched.",
    features: [
      "Touchless Snow Foam & Hand Wash",
      "Wheel Decon & Tire Dressing",
      "3-Month Hydrophobic Polymer Seal",
    ],
    ctaLabel: "Book Express Wash",
  },
  {
    id: "interior",
    name: "Interior Steam & Deep Extraction",
    price: 220,
    minutes: 150,
    description:
      "Hot water extraction, leather conditioning, ozone deodorization, carpet shampoo, door jambs.",
    features: [
      "Hot Water Extraction & Shampoo",
      "Heated Leather Steam & Conditioning",
      "Ozone Odor & Anti-Bacterial Purge",
    ],
    ctaLabel: "Book Interior Detail",
  },
  {
    id: "ceramic",
    name: "1-Stage Paint Correction + Ceramic Coating",
    price: 450,
    minutes: 240,
    description:
      "Machine compound swirl removal, rotary polish, iron decontamination, 9H ceramic hydrophobic bond.",
    features: [
      "Machine Compound Swirl & Scratch Polish",
      "9H Hydrophobic Ceramic Bond (2-Year)",
      "Iron Decontamination & Clay Bar Prep",
    ],
    ctaLabel: "Book Ceramic Coating",
  },
];

export interface AddonOption {
  id: string;
  name: string;
  price: number;
  minutes: number;
  description: string;
}

export const ADDONS: AddonOption[] = [
  {
    id: "pet_hair",
    name: "Heavy Pet / Dog Hair Removal",
    price: 50,
    minutes: 45,
    description:
      "Specialty rubber stone brushing and fiber purge via shop vac. Essential for golden retrievers.",
  },
  {
    id: "car_seat",
    name: "Child Safety Seat Steam Sanitization",
    price: 35,
    minutes: 30,
    description:
      "Non-toxic enzymatic antibacterial deep clean. Includes harness and buckle wipe-down.",
  },
  {
    id: "water_spot",
    name: "Hard Water Spot & Glass Mineral Removal",
    price: 65,
    minutes: 40,
    description: "Citric acid treatment followed by clay bar decontamination and glass polish.",
  },
];

export const TRAVEL_SURCHARGE = 15;
export const TANK_SURCHARGE = 15;
export const DEPOSIT = 50;

export interface SlotOption {
  id: string;
  label: string;
  day: string;
  time: string;
  green: boolean;
}

const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function nextWeekday(from: Date, targetDay: number, weeksAhead = 0): Date {
  const date = new Date(from);
  const diff = (targetDay - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + diff + weeksAhead * 7);
  return date;
}

function fmt(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function buildSlots(greenDay?: string): SlotOption[] {
  const now = new Date();
  const tuesday = nextWeekday(now, 2);
  const wednesday = nextWeekday(now, 3);
  const friday = nextWeekday(now, 5, 1);

  const raw = [
    { date: tuesday, time: "09:00 AM", dayName: "Tuesday" },
    { date: tuesday, time: "01:30 PM", dayName: "Tuesday" },
    { date: wednesday, time: "10:00 AM", dayName: "Wednesday" },
    { date: friday, time: "09:00 AM", dayName: "Friday" },
  ];

  return raw.map((slot, index) => ({
    id: `slot-${index}`,
    label: `${fmt(slot.date)} — ${slot.time}`,
    day: slot.dayName,
    time: slot.time,
    green: Boolean(greenDay) && greenDay === slot.dayName,
  }));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

export function money(value: number): string {
  return `$${Math.round(value)}`;
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export const WEEKDAY_NAMES = WEEKDAY;
