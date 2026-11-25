# Architecture

## Independent service boundary
The supplied directory had no application, framework or user source. The retail URL returned HTTP 402 to the web reader. No existing service contracts or brand source were available. Marketplace therefore runs independently; shared authentication/inventory is intentionally not assumed. Any future retail import must mark merchant ownership explicitly and use an approved API.

Next.js 16 App Router renders public pages on the server. Server actions perform validated mutations; Next.js same-origin checks protect action submissions. React escapes ordinary user content. There is no raw HTML rendering. Custom CSS avoids an unnecessary styling/runtime dependency and uses a compact system-font design.

## Data access
`lib/db.ts` wraps every operation in a transaction. User-scoped queries SET LOCAL ROLE marketplace_app and set transaction-local user ID/role from the authenticated server session. The role has no access to the users/password table. RLS limits record visibility and inserts. A trigger rejects unmoderated seller publication or owner transfers. Connection release/reset happens after commit/rollback.

Service queries bypass RLS for authentication, public seller projections, admin operations and transactional offers. These are the critical trust boundary: explicit account/role/participant checks are mandatory. Credentials never reach the client. Production pool connections belong to a dedicated service principal; restrict network reachability.

Local PGlite uses actual PostgreSQL semantics, persists under .data and serialises transactions in one Node process. It is not a production distributed database. Production uses `pg`; provider credentials are not yet available. Initial migration is currently applied automatically if the migrations table is absent. Separate deployment migration execution and least-privilege runtime credentials before production.

## Media
Photos are decoded with Sharp, bounded to 25 million input pixels, rotated, resized to 1600px and encoded as WebP without source metadata. Original uploads are discarded. Up to 10 photos, 5 MB each. BYTEA storage gives transactional consistency and access-controlled delivery for this local milestone. Authenticated media routes return private/no-store to avoid leaking withdrawn or draft images. Move to private object storage plus signed variants and managed lifecycle before scale; this is deliberately not misrepresented as configured Supabase Storage.

## External boundaries
No payment provider, identity/OTP provider or remote database is connected. Email recovery has a server-side Resend integration which is disabled without API key/from-address; it has not been live-tested. No protected checkout or fund custody code exists. No full certificate feature exists yet. AI search is not simulated.

## Concurrency
Local transactions are serialised; production uses row locks for offers. Accepted offers lock the listing, update offer status and reserve the listing atomically. All other pending offers on that listing expire. Inspection slot uniqueness protects double booking. Favourites/conversation unique keys protect common duplicate inserts. Conversation creation now handles uniqueness races with a conflict-safe insert and fresh read. Offers and identical booking requests support safe retries. General mutation idempotency remains hardening work.

Images intentionally use native img elements: authenticated private routes must receive browser cookies, while Next image optimisation may not forward them. Uploads are already resized/WebP encoded; a signed responsive variant pipeline is the production follow-up.

Inspection availability is a fixed SECURITY DEFINER projection without requester information. Service booking locks the eligible listing and slot, returns the existing booking for identical retries and rejects competing requests. Migration 4 prevents seller transitions that bypass a reservation.

Reservation release locks listing then offer, checks membership and explicit confirmation, inserts one release record, moves the accepted offer to released, moves the listing to pending and appends audit/notifications in one transaction. Old release retries return without touching newer reservations. Appointments are separate records and remain unchanged.

## Premium redesign architecture
Public routes remain server-rendered with small client islands for native dialogs, navigation, filter navigation, saved state, comparison, gallery and photo selection. QueryForm uses Next router navigation and URL parameters, so filters/sort/view are shareable and normal browser history works. Conventional keyword interpretation is in lib/discovery.ts; no AI service is implied.

Migration 7 exposes only id/name/seller_type/created_at through public_sellers for accounts with published stock. The function has a fixed search_path and restricted execute grant. Catalog still constrains status=published while per-account favourite state uses RLS.

Migration 8 adds an owner-only JSON text-draft workspace and owner-only deletion of photos while a listing is draft/pending. Autosave whitelists public listing fields and excludes serials/files/identity claims. Revisions reject stale autosaves. Actual publication still requires the full schema, ownership confirmation and five real photographs. Existing photo order/removal is checked against owned IDs and performed transactionally after the listing lock; a changed photo set fails rather than silently replacing concurrent edits. Successful save uses a receipt and a fresh edit link to avoid re-submitting stale browser files.

Comparison stores only publicly supplied listing IDs/names in browser localStorage (up to four); details are always reloaded from published database records. It never stores messages, credentials or private laptop serials. Gallery media continues to use authenticated no-store routes and native img to preserve session cookies; photo previews use object URLs released on unmount.

Messages refresh every 15 seconds only while the page is visible and online, with an explicit manual refresh control. This is polling, not WebSockets or guaranteed real-time delivery. Mobile conversation-detail visibility rules are scoped to messaging, not the shared support layout.

Market insights group identical brand/model/CPU text/RAM/storage/type/condition and require five active observations. Values describe asking prices and list observation dates; they do not imply sales history. Finder recommendations are disclosed minimum-spec filters, not benchmark-based performance claims.
