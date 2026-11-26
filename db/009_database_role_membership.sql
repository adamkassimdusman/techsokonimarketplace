-- Managed PostgreSQL owners are not necessarily superusers. Allow the trusted
-- database login to SET LOCAL ROLE to the restricted, NOLOGIN application role.
-- This does not grant any website user administrator access.
GRANT marketplace_app TO CURRENT_USER;
INSERT INTO migrations(version) VALUES (9);
