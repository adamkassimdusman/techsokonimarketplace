-- Expose only unoccupied appointment slots, never other users' bookings.
CREATE FUNCTION available_inspection_slots() RETURNS TABLE(id uuid,name text,address text,starts_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
 SELECT s.id,l.name,l.address,s.starts_at FROM public.inspection_slots s
 JOIN public.locations l ON l.id=s.location_id
 WHERE l.active AND s.starts_at>now()
 AND NOT EXISTS(SELECT 1 FROM public.inspections i WHERE i.slot_id=s.id)
 ORDER BY s.starts_at LIMIT 30
$$;
REVOKE ALL ON FUNCTION available_inspection_slots() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION available_inspection_slots() TO marketplace_app;
DROP POLICY inspection_create ON inspections;
CREATE POLICY inspection_create ON inspections FOR INSERT WITH CHECK(
 requester_id=app_user() AND EXISTS(SELECT 1 FROM listings WHERE id=listing_id AND status IN ('published','reserved'))
 AND EXISTS(SELECT 1 FROM inspection_slots s JOIN locations l ON l.id=s.location_id WHERE s.id=slot_id AND s.starts_at>now() AND l.active)
);
INSERT INTO migrations VALUES(3);
