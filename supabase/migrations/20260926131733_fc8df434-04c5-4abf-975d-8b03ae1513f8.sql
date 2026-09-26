create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  ref_code text not null,
  customer_name text,
  customer_phone text,
  vehicle_class text not null,
  vehicle_model text,
  package_name text not null,
  base_price numeric not null,
  addons_price numeric not null default 0,
  total_price numeric not null,
  duration_minutes integer not null,
  zip_code text not null,
  sector_name text,
  slot_datetime text not null,
  green_route boolean not null default false,
  pre_flight_passed boolean not null default false,
  deposit_held boolean not null default false,
  status text not null default 'confirmed'
);

create table public.audit_log (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  event_type text not null,
  booking_ref text,
  message text not null,
  source text not null default 'system'
);

create table public.route_zones (
  id uuid default gen_random_uuid() primary key,
  zip_code text not null,
  sector_name text not null,
  green_route_day text not null,
  discount_active boolean not null default true
);

grant select, insert, update on public.bookings to anon, authenticated;
grant all on public.bookings to service_role;
grant select, insert on public.audit_log to anon, authenticated;
grant all on public.audit_log to service_role;
grant select on public.route_zones to anon, authenticated;
grant all on public.route_zones to service_role;

alter table public.bookings enable row level security;
alter table public.audit_log enable row level security;
alter table public.route_zones enable row level security;

create policy "Anyone can view bookings" on public.bookings for select using (true);
create policy "Anyone can create bookings" on public.bookings for insert with check (true);
create policy "Anyone can update bookings" on public.bookings for update using (true) with check (true);

create policy "Anyone can view audit log" on public.audit_log for select using (true);
create policy "Anyone can add audit entries" on public.audit_log for insert with check (true);

create policy "Anyone can view route zones" on public.route_zones for select using (true);

insert into public.route_zones (zip_code, sector_name, green_route_day, discount_active) values
  ('78704', 'South Congress / SoCo', 'Tuesday', true),
  ('78701', 'Downtown Austin', 'Wednesday', true),
  ('78746', 'Westlake Hills', 'Thursday', true),
  ('78759', 'North Austin / Domain', 'Monday', true),
  ('78738', 'Lakeway / Bee Cave', 'Friday', true);

insert into public.audit_log (event_type, booking_ref, message, source) values
  ('BOOKING_CONFIRMED', 'ADW-78704-89', '2024 Ford F-150 booked in Round Rock. $380 total. $50 deposit captured. Green route accepted.', 'instagram_bio'),
  ('BOOKING_CONFIRMED', 'ADW-78701-90', '2021 BMW M3 booked in Downtown (78701). Paint correction selected. Driveway pre-flight passed.', 'direct_link'),
  ('SMS_DISPATCHED', 'ADW-78704-91', 'Pre-arrival SMS automatically triggered for 09:00 AM South Congress appointment.', 'system');

insert into public.bookings (ref_code, customer_name, customer_phone, vehicle_class, vehicle_model, package_name, base_price, addons_price, total_price, duration_minutes, zip_code, sector_name, slot_datetime, green_route, pre_flight_passed, deposit_held, status) values
  ('ADW-78704-89', 'Marcus', '+15125550142', 'suv_full', '2024 Ford F-150', 'Interior Steam & Deep Extraction', 220, 50, 380, 195, '78704', 'South Congress / SoCo', '09:00 AM - 12:15 PM', true, true, true, 'confirmed'),
  ('ADW-78701-90', 'Devin', '+15125550188', 'sedan', '2021 BMW M3', '1-Stage Paint Correction + 2-Year Ceramic Coating', 450, 0, 435, 240, '78701', 'Downtown Austin', '12:45 PM - 04:45 PM', true, true, true, 'confirmed'),
  ('ADW-78746-91', 'Priya', '+15125550119', 'suv_mid', '2023 Porsche Macan S', 'Express Foam & Seal', 140, 65, 220, 130, '78746', 'Westlake Hills', '05:15 PM - 07:25 PM', false, true, true, 'confirmed');