ALTER TABLE offers DROP CONSTRAINT offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check CHECK(status IN ('pending','accepted','rejected','expired','released'));
CREATE TABLE reservation_releases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 offer_id uuid NOT NULL UNIQUE REFERENCES offers,
 actor_id uuid NOT NULL REFERENCES users,
 reason text NOT NULL CHECK(length(reason) BETWEEN 10 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE reservation_releases ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON reservation_releases TO marketplace_app;
CREATE POLICY release_participant_read ON reservation_releases FOR SELECT USING(
 EXISTS(SELECT 1 FROM offers o WHERE o.id=offer_id) OR app_admin()
);
INSERT INTO migrations VALUES(5);
