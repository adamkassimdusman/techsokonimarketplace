CREATE OR REPLACE FUNCTION guard_listing() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF current_user='marketplace_app' AND NOT app_admin() THEN
  IF NEW.seller_id<>OLD.seller_id THEN RAISE EXCEPTION 'Cannot transfer ownership'; END IF;
  IF OLD.status IN ('sold','archived','suspended') AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'This listing cannot be changed'; END IF;
  IF OLD.status='reserved' AND NEW.status<>'sold' AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'Reservation must not be bypassed'; END IF;
  IF NEW.status NOT IN ('draft','pending','sold','archived') AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'Moderation required'; END IF;
 END IF;
 RETURN NEW;
END $$;
INSERT INTO migrations VALUES(4);
