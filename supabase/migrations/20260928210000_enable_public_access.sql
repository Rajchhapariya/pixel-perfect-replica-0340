-- Ensure public and authenticated access to bookings, audit_log, and route_zones
grant select, insert, update on public.bookings to anon, authenticated;
grant all on public.bookings to service_role;

grant select, insert on public.audit_log to anon, authenticated;
grant all on public.audit_log to service_role;

grant select on public.route_zones to anon, authenticated;
grant all on public.route_zones to service_role;

-- Enable RLS
alter table public.bookings enable row level security;
alter table public.audit_log enable row level security;
alter table public.route_zones enable row level security;

-- Idempotent RLS policies for anonymous & authenticated operations
drop policy if exists "Anyone can view bookings" on public.bookings;
create policy "Anyone can view bookings" on public.bookings for select using (true);

drop policy if exists "Anyone can create bookings" on public.bookings;
create policy "Anyone can create bookings" on public.bookings for insert with check (true);

drop policy if exists "Anyone can update bookings" on public.bookings;
create policy "Anyone can update bookings" on public.bookings for update using (true) with check (true);

drop policy if exists "Anyone can view audit log" on public.audit_log;
create policy "Anyone can view audit log" on public.audit_log for select using (true);

drop policy if exists "Anyone can add audit entries" on public.audit_log;
create policy "Anyone can add audit entries" on public.audit_log for insert with check (true);

drop policy if exists "Anyone can view route zones" on public.route_zones;
create policy "Anyone can view route zones" on public.route_zones for select using (true);
