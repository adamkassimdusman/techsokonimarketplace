CREATE TABLE listing_drafts(user_id uuid PRIMARY KEY REFERENCES users ON DELETE CASCADE,fields jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(fields)='object'),revision bigint NOT NULL,updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE listing_drafts ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON listing_drafts TO marketplace_app;
CREATE POLICY own_listing_draft ON listing_drafts USING(user_id=app_user()) WITH CHECK(user_id=app_user());
CREATE POLICY image_owner_delete ON images FOR DELETE USING(EXISTS(SELECT 1 FROM listings l WHERE l.id=listing_id AND l.seller_id=app_user() AND l.status IN ('draft','pending')));
INSERT INTO migrations VALUES(8);
