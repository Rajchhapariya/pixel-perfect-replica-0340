import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const VEHICLE_CLASSES = ["sedan", "suv_mid", "suv_full"] as const;
const BOOKING_STATUSES = [
  "en_route",
  "in_progress",
  "completed",
  "rescheduled",
  "confirmed",
] as const;

// Austin Metro zone configurations
const SEED_ZONES: Record<
  string,
  { zip_code: string; sector_name: string; green_route_day: string }
> = {
  "78704": { zip_code: "78704", sector_name: "South Congress / SoCo", green_route_day: "Tuesday" },
  "78701": { zip_code: "78701", sector_name: "Downtown Austin", green_route_day: "Wednesday" },
  "78746": { zip_code: "78746", sector_name: "Westlake Hills", green_route_day: "Thursday" },
  "78759": { zip_code: "78759", sector_name: "North Austin / Domain", green_route_day: "Monday" },
  "78738": { zip_code: "78738", sector_name: "Lakeway / Bee Cave", green_route_day: "Friday" },
};

interface StoredBooking {
  id: string;
  created_at: string;
  ref_code: string;
  customer_name: string | null;
  customer_phone?: string | null;
  vehicle_class?: string;
  vehicle_model: string | null;
  package_name: string;
  base_price?: number;
  addons_price?: number;
  total_price: number;
  duration_minutes?: number;
  zip_code: string;
  sector_name: string | null;
  slot_datetime: string;
  green_route?: boolean;
  pre_flight_passed?: boolean;
  deposit_held?: boolean;
  status: string;
}

interface StoredAudit {
  id: string;
  created_at: string;
  event_type: string;
  booking_ref: string | null;
  message: string;
  source: string;
}

export const INITIAL_SEED_BOOKINGS: StoredBooking[] = [
  {
    id: "b1111111-1111-4111-8111-111111111111",
    created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    ref_code: "ADW-78704-89",
    customer_name: "Marcus T.",
    customer_phone: "5125550189",
    vehicle_class: "suv_full",
    vehicle_model: "2024 Ford F-150",
    package_name: "Interior Steam & Deep Extraction",
    base_price: 220,
    addons_price: 50,
    total_price: 255,
    duration_minutes: 195,
    zip_code: "78704",
    sector_name: "South Congress / SoCo",
    slot_datetime: "Tuesday 09:00 AM",
    green_route: true,
    pre_flight_passed: true,
    deposit_held: true,
    status: "confirmed",
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    created_at: new Date(Date.now() - 118 * 60 * 1000).toISOString(),
    ref_code: "ADW-78701-90",
    customer_name: "Devin R.",
    customer_phone: "5125550190",
    vehicle_class: "sedan",
    vehicle_model: "2021 BMW M3",
    package_name: "1-Stage Paint Correction + Ceramic Coating",
    base_price: 450,
    addons_price: 65,
    total_price: 500,
    duration_minutes: 280,
    zip_code: "78701",
    sector_name: "Downtown Austin",
    slot_datetime: "Wednesday 01:30 PM",
    green_route: false,
    pre_flight_passed: true,
    deposit_held: true,
    status: "confirmed",
  },
  {
    id: "b3333333-3333-4333-8333-333333333333",
    created_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    ref_code: "ADW-78746-91",
    customer_name: "Priya S.",
    customer_phone: "5125550191",
    vehicle_class: "suv_mid",
    vehicle_model: "2023 Porsche Macan S",
    package_name: "Express Foam & Seal",
    base_price: 140,
    addons_price: 0,
    total_price: 140,
    duration_minutes: 90,
    zip_code: "78746",
    sector_name: "Westlake Hills",
    slot_datetime: "Thursday 09:00 AM",
    green_route: true,
    pre_flight_passed: true,
    deposit_held: true,
    status: "confirmed",
  },
];

export const INITIAL_SEED_AUDIT: StoredAudit[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    event_type: "BOOKING_CONFIRMED",
    booking_ref: "ADW-78704-89",
    message:
      "2024 Ford F-150 booked in South Congress (78704). $255 total. $50 deposit captured. Green route day — $15 surcharge waived.",
    source: "instagram_bio",
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    created_at: new Date(Date.now() - 118 * 60 * 1000).toISOString(),
    event_type: "BOOKING_CONFIRMED",
    booking_ref: "ADW-78701-90",
    message:
      "2021 BMW M3 booked in Downtown Austin (78701). Paint correction + ceramic coating. Driveway pre-flight passed.",
    source: "direct_link",
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    created_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    event_type: "SMS_DISPATCHED",
    booking_ref: "ADW-78746-91",
    message: "Pre-arrival SMS automatically triggered for 09:00 AM Westlake Hills appointment.",
    source: "system",
  },
];

const memoryBookings: StoredBooking[] = INITIAL_SEED_BOOKINGS.map((b) => ({ ...b }));
const memoryAudit: StoredAudit[] = INITIAL_SEED_AUDIT.map((a) => ({ ...a }));

// Helper to obtain a working Supabase client safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSupabase(): Promise<any> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (supabaseAdmin && typeof supabaseAdmin.from === "function") {
      return supabaseAdmin;
    }
  } catch {
    // supabaseAdmin unavailable in this execution context
  }
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    return supabase;
  } catch {
    return null;
  }
}

const createBookingSchema = z.object({
  ref_code: z.string().regex(/^ADW-\d{5}-\d{2}$/),
  customer_name: z.string().trim().min(1).max(80),
  customer_phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/),
  vehicle_class: z.enum(VEHICLE_CLASSES),
  vehicle_model: z.string().trim().max(80).nullable(),
  package_name: z.string().trim().min(1).max(80),
  base_price: z.number().min(0).max(100000),
  addons_price: z.number().min(0).max(100000),
  total_price: z.number().min(0).max(100000),
  duration_minutes: z.number().int().min(1).max(1440),
  zip_code: z.string().regex(/^\d{5}$/),
  sector_name: z.string().trim().max(80).nullable(),
  slot_datetime: z.string().trim().min(1).max(80),
  green_route: z.boolean(),
  pre_flight_passed: z.boolean(),
  deposit_held: z.boolean(),
  audit_message: z.string().trim().min(1).max(500),
});

export const lookupZone = createServerFn({ method: "GET" })
  .validator((data) => z.object({ zip: z.string().regex(/^\d{5}$/) }).parse(data))
  .handler(async ({ data }) => {
    try {
      const client = await getSupabase();
      if (client) {
        const { data: zone, error } = await client
          .from("route_zones")
          .select("zip_code, sector_name, green_route_day")
          .eq("zip_code", data.zip)
          .maybeSingle();
        if (!error && zone) return zone;
      }
    } catch {
      // Fallback to Austin seed zones
    }
    return SEED_ZONES[data.zip] ?? null;
  });

export const createBooking = createServerFn({ method: "POST" })
  .validator((data) => createBookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { audit_message, ...booking } = data;
    const newId = `b${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const nowIso = new Date().toISOString();

    const record: StoredBooking = {
      ...booking,
      id: newId,
      created_at: nowIso,
      status: "confirmed",
    };

    // Store in-memory for zero-delay instant feedback
    memoryBookings.unshift(record);

    const auditEntry: StoredAudit = {
      id: `a${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      created_at: nowIso,
      event_type: "BOOKING_CONFIRMED",
      booking_ref: data.ref_code,
      message: audit_message,
      source: "direct_link",
    };
    memoryAudit.unshift(auditEntry);

    try {
      const client = await getSupabase();
      if (client) {
        await client.from("bookings").insert({
          ...booking,
          status: "confirmed",
        });

        await client.from("audit_log").insert({
          event_type: "BOOKING_CONFIRMED",
          booking_ref: data.ref_code,
          message: audit_message,
          source: "direct_link",
        });
      }
    } catch (err) {
      console.warn("Supabase insert notice (persisted to session memory):", err);
    }

    return { ok: true, ref_code: data.ref_code };
  });

export const getHudBookings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const client = await getSupabase();
    if (client) {
      const { data, error } = await client
        .from("bookings")
        .select(
          "id, created_at, ref_code, customer_name, vehicle_model, package_name, total_price, zip_code, sector_name, slot_datetime, status",
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("getHudBookings fallback to seed data:", err);
  }
  return memoryBookings;
});

export const getHudAuditFeed = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const client = await getSupabase();
    if (client) {
      const { data, error } = await client
        .from("audit_log")
        .select("id, created_at, event_type, booking_ref, message, source")
        .order("created_at", { ascending: false })
        .limit(8);
      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("getHudAuditFeed fallback to seed feed:", err);
  }
  return memoryAudit.slice(0, 8);
});

export const updateBookingStatus = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        id: z.string(),
        status: z.enum(BOOKING_STATUSES),
        label: z.string().trim().min(1).max(40),
        ref_code: z.string().trim().min(1).max(40),
        vehicle_label: z.string().trim().max(120),
        zip_code: z.string().regex(/^\d{5}$/),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    // Update in-memory state
    const target = memoryBookings.find((b) => b.id === data.id || b.ref_code === data.ref_code);
    if (target) {
      target.status = data.status;
    }

    const auditMessage = `${data.label} status set for ${data.vehicle_label} at ${data.zip_code}. Client SMS dispatched automatically.`;
    memoryAudit.unshift({
      id: `a${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      created_at: new Date().toISOString(),
      event_type: "SMS_DISPATCHED",
      booking_ref: data.ref_code,
      message: auditMessage,
      source: "system",
    });

    try {
      const client = await getSupabase();
      if (client) {
        await client.from("bookings").update({ status: data.status }).eq("id", data.id);
        await client.from("audit_log").insert({
          event_type: "SMS_DISPATCHED",
          booking_ref: data.ref_code,
          message: auditMessage,
          source: "system",
        });
      }
    } catch (err) {
      console.warn("updateBookingStatus remote notice:", err);
    }

    return { ok: true };
  });

export const executeStormReschedule = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        bookings: z
          .array(
            z.object({
              id: z.string(),
              ref_code: z.string().trim().min(1).max(40),
              customer_name: z.string().trim().max(80).nullable(),
              slot_datetime: z.string().trim().max(80),
              sector_name: z.string().trim().max(80).nullable(),
              zip_code: z.string().regex(/^\d{5}$/),
            }),
          )
          .min(1)
          .max(10),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const ids = data.bookings.map((b) => b.id);
    const refs = data.bookings.map((b) => b.ref_code);

    // Update in-memory state
    memoryBookings.forEach((b) => {
      if (ids.includes(b.id) || refs.includes(b.ref_code)) {
        b.status = "rescheduled";
      }
    });

    const nowIso = new Date().toISOString();
    data.bookings.forEach((b) => {
      memoryAudit.unshift({
        id: `a${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        created_at: nowIso,
        event_type: "RAIN_RESCHEDULE",
        booking_ref: b.ref_code,
        message: `Travis County rain trigger — ${b.customer_name ?? "Client"} sent a priority reschedule link for the ${b.slot_datetime} slot in ${b.sector_name ?? b.zip_code}.`,
        source: "system",
      });
    });

    try {
      const client = await getSupabase();
      if (client) {
        await client.from("bookings").update({ status: "rescheduled" }).in("id", ids);
        await client.from("audit_log").insert(
          data.bookings.map((b) => ({
            event_type: "RAIN_RESCHEDULE",
            booking_ref: b.ref_code,
            message: `Travis County rain trigger — ${b.customer_name ?? "Client"} sent a priority reschedule link for the ${b.slot_datetime} slot in ${b.sector_name ?? b.zip_code}.`,
            source: "system",
          })),
        );
      }
    } catch (err) {
      console.warn("executeStormReschedule remote notice:", err);
    }

    return { ok: true };
  });

export const resetHudDemoData = createServerFn({ method: "POST" })
  .validator((data?: unknown) => data ?? {})
  .handler(async () => {
    // Reset in-memory arrays to pure initial seed state
    memoryBookings.length = 0;
    INITIAL_SEED_BOOKINGS.forEach((b) => memoryBookings.push({ ...b }));
    memoryAudit.length = 0;
    INITIAL_SEED_AUDIT.forEach((a) => memoryAudit.push({ ...a }));

    try {
      const client = await getSupabase();
      if (client) {
        await client
          .from("bookings")
          .update({ status: "confirmed" })
          .in("ref_code", ["ADW-78704-89", "ADW-78701-90", "ADW-78746-91"]);
      }
    } catch {
      // Ignored
    }

    return { ok: true, count: memoryBookings.length };
  });
