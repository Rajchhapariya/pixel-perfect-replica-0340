DROP POLICY "Anyone can update bookings" ON public.bookings;
DROP POLICY "Anyone can create bookings" ON public.bookings;
DROP POLICY "Anyone can view bookings" ON public.bookings;
DROP POLICY "Anyone can add audit entries" ON public.audit_log;
DROP POLICY "Anyone can view audit log" ON public.audit_log;
DROP POLICY "Anyone can view route zones" ON public.route_zones;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.bookings FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.audit_log FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.route_zones FROM anon, authenticated;