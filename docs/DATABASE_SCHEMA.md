# Database schema

Migration: `db/001_initial.sql` (version 1) and `db/002_participant_access_notifications.sql` (version 2). Version 2 adds accepted-buyer access to reserved listings and private message/inspection notifications.

| Tables | Purpose / boundaries |
| --- | --- |
| users | Email and password hash, public name/bio, server-controlled role, self-declared seller type |
| sessions, reset_tokens | Hashed random bearer tokens with expiry; service-only |
| rate_limits | Persistent fixed-window counters; service-only |
| listings | Public technical specs, KES minor-unit price, moderation and ownership; RLS |
| listing_private | Serial number; owner-only access via RLS |
| images | Re-encoded photo bytes and position; visibility follows listing RLS |
| favourites | Unique user/listing pair; owner-only |
| conversations | Unique listing/buyer pair; participant-only |
| messages | Sender, body, timestamp; participant-only, sender checked |
| offers | Minor-unit amount, expiry, status; participant reads; authorised service writes |
| locations, inspection_slots | Admin-controlled real locations and future availability |
| inspections | Requester/listing/unique slot; requester/admin reads |
| reports | Reporter/reason/listing; reporter/admin reads |
| notifications | Owner-scoped notices; service creates |
| audit_logs | Service-only append trail of privileged operations |
| migrations | Applied schema version |

UUID primary keys and foreign keys protect relationships. CHECK constraints protect currencies, dimensions, condition/status and ownership declaration. Full-text GIN index supports conventional keyword search; price/status/date and seller indexes support browsing. No speculative payments, subscriptions or certificates tables exist.

Future schema: approved inspection reports + typed checklist results + certificates with expiry/revocation; inspector assignments; verification-provider references; business storefront metadata; immutable listing status history; blocking and read receipts; subscriptions and entitlements; orders and append-only provider-event ledger. Design these with their actual workflows rather than unused tables.

The initial listing record groups one-to-one specifications; normalize brand/family/model reference catalogues when supported values and import rules are confirmed. Performance/load and external PostgreSQL migration tests remain required.

## Migration 3 — inspection availability

`003_booking_availability.sql` exposes a fixed, limited projection of genuinely unoccupied future appointment slots through a SECURITY DEFINER function. It does not expose requester identities or private appointments. The booking insert policy now also permits a reserved listing visible to the accepted buyer or seller.

## Migration 4 — reservation and terminal-state guard

`004_reservation_status_guard.sql` prevents a seller from bypassing a reservation with draft/pending/archive transitions. A reserved listing may be marked sold. Seller changes to sold, archived or suspended listings are denied. Audited reservation release is provided by migration 5 and its validated service workflow.

## Migration 5 — reservation release history

`005_reservation_releases.sql` adds `released` to offer states and creates `reservation_releases`, uniquely keyed by offer with actor, reason and timestamp. Restricted application-role users may only read records from their own conversations (administrators may read all); writes happen only through the validated transactional service operation.

## Migration 6 — client interactions and access
Users additionally accept super_admin; app_admin recognizes both staff roles. Messages have a monotonic seq. New tables: conversation_reads (user/conversation primary key, last_seq), user_blocks (blocker/blocked primary key), conversation_reports (one open report per reporter/conversation), support_tickets (owner, subject, open/closed), support_messages (ticket, actor, body). Restricted application role has SELECT-only grants and row policies on these tables; authenticated service functions perform writes. A trigger rejects messages between blocked pairs. Staff operations and role changes write audit_logs.

## Redesign migrations
7. public_sellers() is a read-only public projection for published-stock sellers. No email, authentication, roles or serial fields.
8. listing_drafts contains user_id, whitelisted JSON fields, monotonic client revision and updated_at, protected by owner-only RLS. Images receive an owner-only DELETE policy restricted to draft/pending parent listings; server validation controls retained IDs and ordering.

Migration 009 grants the trusted migration/database owner membership in `marketplace_app`, allowing `SET LOCAL ROLE` on managed PostgreSQL without superuser access. It does not modify website user roles.
