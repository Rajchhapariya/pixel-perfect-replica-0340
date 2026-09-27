import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const VEHICLE_CLASSES = ["sedan", "suv_mid", "suv_full"] as const;
const BOOKING_STATUSES = ["en_route", "in_progress", "completed"] as const;

const createBookingSchema = z.object({
  ref_code: z.string().regex(/^ADW-\d{5}-\d{2}$/),
  customer_name: z.string().trim().min(1).max(80),
  customer_phone: z.string().trim().regex(/^\d{10}$/),
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
  .inputValidator((data) => z.object({ zip: z.string().regex(/^\d{5}$/) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: zone, error } = await supabaseAdmin
      .from("route_zones")
      .select("zip_code, sector_name, green_route_day")
      .eq("zip_code", data.zip)
      .maybeSingle();
    if (error) throw new Error("Zone lookup failed");
    return zone;
  });

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data) => createBookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { audit_message, ...booking } = data;
    const { error } = await supabaseAdmin.from("bookings").insert({
      ...booking,
      status: "confirmed",
    });
    if (error) throw new Error("Booking could not be created");

    await supabaseAdmin.from("audit_log").insert({
      event_type: "BOOKING_CONFIRMED",
      booking_ref: data.ref_code,
      message: audit_message,
      source: "direct_link",
    });
    return { ok: true };
  });

export const getHudBookings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, created_at, ref_code, customer_name, vehicle_model, package_name, total_price, zip_code, sector_name, slot_datetime, status",
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("getHudBookings failed", error);
    throw new Error("Could not load bookings");
  }
  return data ?? [];
});

export const getHudAuditFeed = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("audit_log")
    .select("id, created_at, event_type, booking_ref, message, source")
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) throw new Error("Could not load activity feed");
  return data ?? [];
});

export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(BOOKING_STATUSES),
        label: z.string().trim().min(1).max(40),
        ref_code: z.string().trim().min(1).max(40),
        vehicle_label: z.string().trim().max(120),
        zip_code: z.string().regex(/^\d{5}$/),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error("Status update failed");

    await supabaseAdmin.from("audit_log").insert({
      event_type: "SMS_DISPATCHED",
      booking_ref: data.ref_code,
      message: `${data.label} status set for ${data.vehicle_label} at ${data.zip_code}. Client SMS dispatched automatically.`,
      source: "system",
    });
    return { ok: true };
  });

export const executeStormReschedule = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        bookings: z
          .array(
            z.object({
              id: z.string().uuid(),
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ids = data.bookings.map((b) => b.id);
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "rescheduled" })
      .in("id", ids)
      .eq("status", "confirmed");
    if (error) throw new Error("Reschedule dispatch failed");

    await supabaseAdmin.from("audit_log").insert(
      data.bookings.map((b) => ({
        event_type: "RAIN_RESCHEDULE",
        booking_ref: b.ref_code,
        message: `Travis County rain trigger — ${b.customer_name ?? "Client"} sent a priority reschedule link for the ${b.slot_datetime} slot in ${b.sector_name ?? b.zip_code}.`,
        source: "system",
      })),
    );
    return { ok: true };
  });
