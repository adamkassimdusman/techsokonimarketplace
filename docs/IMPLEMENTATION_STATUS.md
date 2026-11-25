# Implementation status — 24 November 2026 (Africa/Nairobi)

## Milestone
Substantial local Phase 1 implementation with persistent data and working vertical slices. **Phase 1 acceptance is not complete; public production launch is not approved.** No live retail changes, infrastructure purchases, hosting registration or deployment were performed.

## Completed

| Slice | Implemented behavior |
| --- | --- |
| Foundation | Next.js App Router, strict TypeScript, reusable forms/cards, responsive custom design, dependency lockfile |
| Public experience | Homepage, conventional full-text search, combined URL filters, pagination, price/date sorting, details/gallery, comparison selectors, public profiles/dealer directory, trust/help pages |
| Accounts | Registration, salted password hashes, session login/logout, profile editing, configurable email recovery, server-controlled admin role |
| Selling | Seven-step form, ownership declaration, specifications/faults, draft persistence, edits, price conversion, pending review, status management |
| Photos | 5–10 photos on submission, file/type/pixel checks, actual decoder validation, metadata removal, WebP conversion, authenticated delivery |
| Buyer tools | Favourites, listing conversations, messages, offers/counteroffers, expiry, accepted reservation and competing-offer expiry |
| Inspections | Admin-created real locations/slots, requester booking, unique slot constraint, administrator confirmation |
| Moderation | Protected admin page, genuine database counts, approve/reject/suspend with reason, reports, audit entries, no self-approval |
| Notifications | Private message, offer, moderation and inspection status notices |
| Security | Database row policies, role-restricted queries, parameterised SQL, server validation, account rate limits, private serial storage, action origin checks, secure headers |
| SEO | Server-rendered public content, titles/descriptions/canonicals, sitemap, robots; private dashboard indexing disabled |
| Continuity | README, AGENTS, original requirements, schema/architecture/design/security/roadmap/deployment/decisions and changelog |

## Database migrations

1. `db/001_initial.sql`: 18 tables, keys, checks, search/browse indexes, restricted role and row policies, moderation guard.
2. `db/002_participant_access_notifications.sql`: accepted buyers retain access to reserved listings; private message/inspection notifications via restricted trigger functions.

Local `.data/postgres` persists across restarts. No real inventory was seeded. Automated browser tests created clearly named private test accounts, drafts and synthetic photo fixtures. These are excluded from the source archive along with all runtime data and `.env.local`.

## Verification

- Strict TypeScript: passed.
- ESLint: passed, zero errors/warnings after final fixes. Native img is intentionally allowed only for authenticated, pre-encoded photo components; see ARCHITECTURE.
- Vitest: **22 passed** across database/security/image tests.
- Production build: passed, 20 routes emitted (19 dynamic and one static robots route).
- Playwright: **4 passed** against the production-mode localhost server (desktop/mobile browsing, combined filters, registration, admin denial, draft creation, edit-price correctness, five-photo persistence, authenticated media and access denial after logout). The runner reported all passes, then the process/server received SIGTERM during teardown (exit 143). A fresh preview was started separately after testing.
- Visual QA: desktop 1440px and mobile 390px screenshots reviewed. Fixed cramped mobile selling panel. No horizontal homepage overflow in browser tests.
- Dependency audit at final dependency installation: **0 vulnerabilities** reported (404 installed packages). This is not a penetration test.

Tests exercise salts/password mismatch, opaque token digests, parameterised combined search, invalid inputs, public/private listing boundaries, hidden serials, cross-account conversations, spoofed messages, ownership/moderation bypass prevention, role escalation prevention, favourite uniqueness, direct offer-write denial, double-booking rejection, private notifications, accepted-buyer visibility, image metadata stripping and invalid/oversize image rejection.

Fixed during QA: first-run database directory creation; sitemap erroneously opening local DB during build; draft submission intent; price units on edit; mobile CTA width; browser label selectors; reserved buyer visibility. Development-mode cold compilation caused additional browser timeouts; final acceptance is run against the built local server.

## Original Phase 1 limitations (see later milestones for resolved items)

- A complete isolated seller/admin/two-buyer browser scenario now exercises publication, messaging, competing offers, reserved-device inspection and confirmation. Final rerun results are recorded in the latest milestone below. Multi-connection PostgreSQL contention remains untested.
- Production auth hardening: admin MFA/step-up, confirmed email ownership, email provider sandbox, full password-reset E2E. Recovery is honestly unavailable without credentials.
- Private object-storage uploads, responsive photo variants and remove/reorder controls. Current BYTEA upload pipeline is real but not suited to Vercel request-size limits or production scale.
- Complete specification fields and filters: CPU generation, touchscreen/convertible, dedicated GPU memory, precise display/processor facets, warranty/delivery/seller type filtering and use-case taxonomy remain incomplete.
- Drafts currently require complete validated text/specification/ownership fields; partial-field draft autosave is not implemented.
- Message blocking/reporting, unread counters and explicit mark-read controls are implemented. Polling/realtime updates and notification preferences remain pending. Message history shows the latest 200 entries and needs pagination.
- Offer retries, repeated acceptance/rejection, matching booking retries and conversation-start uniqueness now have duplicate protection. General mutation idempotency keys, image-edit concurrency, offer withdrawal still needs implementation. Audited reservation release is implemented for the seller and accepted buyer. Reserved listings cannot be resubmitted by sellers; sold/archived/suspended records cannot be reopened by them.
- Inspection rescheduling/cancellation, inspector assignment/checklists and certificates are not implemented. Slots are configured individually, not by recurring operating hours. Occupied slots are now excluded through a limited database projection that does not expose private booking records. Accepted buyers can book reserved devices.
- Admin currently shows bounded lists, not full paginated/searchable management modules. Listing status history, exports, audit retention and configurable listing limits remain pending.
- Comparison offers up to 100 recent available listings. Public seller lists show up to 12 published listings without pagination.
- No real verification, ratings, purchase reviews, payment collection, orders, protected checkout, subscriptions, AI recommendations or monetisation.
- No performance load test, complete WCAG audit, external PostgreSQL deployment test, backup/restore drill or legal compliance certification.
- Exact brand alignment awaits accessible retail branding assets; the existing website returned HTTP 402 during inspection.

## Owner configuration required

Production PostgreSQL and storage/auth choices; verified email sender/key; approved real inspection locations/hours; brand assets; professional legal review. See DEPLOYMENT for exact environment variables and launch sequence. No credentials are needed to use the current local PGlite preview.

## Exact next implementation step

Implement confirmed email ownership and admin MFA; add complete interaction history pagination. Run simultaneous transaction tests against a separate PostgreSQL service before production release.

## Local handoff

Preview: http://127.0.0.1:3000 (production-mode local server). For editing, stop that server and run npm run dev. The source archive excludes dependencies, build caches, database state, test traces and local environment values. Desktop/mobile preview PNGs accompany the source.

## Latest milestone — workflow verification

- Added an isolated localhost:3100 test server backed by a fresh temporary database, four accounts and random test credentials. Existing preview data is not used.
- Extracted shared offer/inspection domain functions used by server actions and integration tests.
- Added migration 3 for genuinely available slots and reserved-buyer inspection permission.
- Added migration 4 to prevent resubmission of reserved devices and reopening terminal seller states.
- Fixed disappearing booking success feedback by showing persistent appointment status on the listing.
- Made initial schema creation transactional and avoided bundling local database files.
- Verification: **30 automated tests passed**, and the complete isolated four-account browser scenario passed (1 test, 1.4 minutes). Strict TypeScript, ESLint and the final production build all passed with no reported errors or build warnings. The earlier desktop/mobile smoke suite remains recorded above; it was not rerun for this milestone.

## Reservation release milestone — 25 November 2026

- Migration 5 adds the released offer state and participant-private release records (actor, reason, timestamp and unique offer reference).
- Seller or accepted buyer must supply a reason and explicitly confirm. Server identity, membership and listing/offer state are checked inside a row-locked transaction.
- Release returns the listing to pending moderation, records an audit event and notifies both participants. Existing inspection appointments remain unchanged and this is disclosed before confirmation.
- Retries preserve the original release record and cannot cancel a later reservation. Sold/suspended listings and unaccepted offers cannot be released.
- Persistent release receipts remain visible in the conversation; amounts and previous offers are preserved. Release reasons are not public.
- Admin accounts now have a Listing approvals navigation link to `/admin#listing-moderation`. No account roles were granted during this milestone.
- Verification: **36 automated tests passed**; the complete isolated four-account browser journey passed, including cancellation at 390px mobile width, private release receipts, return to moderation and preservation of the confirmed appointment. Production build, TypeScript and ESLint passed. The duplicated cancellation control discovered during browser QA was removed.


## Super admin and client interactions — 25 November 2026

- Migration 6 adds super-admin roles, support tickets/replies, conversation reports, blocks and per-account read positions. New tables have restricted grants and row policies.
- Super admins grant/remove ordinary admin access with password confirmation, explicit confirmation, audit events and session revocation. Super-admin roles remain operator-managed; no live account has been promoted.
- `/support` provides private client requests and replies. `/admin/interactions` provides staff replies, closure and reported-conversation review. Moderators see private messages only through submitted conversation reports in this console.
- Messages expose blocking, consent-based reports, unread indicators and explicit read controls. The database rejects blocked messages; domain functions reject new offers/acceptance while blocked. Reservation release remains available.
- The authenticated, non-cached `GET /api/interactions` returns only the current user's unread and open support counts.
- Role changes and staff operations are audited. Existing local data is preserved. No production deployment or external integration was performed.
- Limits: manual refresh, latest 200 conversation messages, 50 client tickets, 200 client ticket messages, 20 staff tickets per page, 20 open reports, 100 staff accounts and 50 access audit events. Full history navigation and PostgreSQL contention verification remain pending.
- Verification: **41 automated tests passed**; both isolated browser scenarios passed (the support/access scenario was rerun after correcting test form-reset handling). Checks cover mobile support, staff replies/closure, wrong-password rejection, role grants/removal and session revocation, plus the existing seller/approval/offer/inspection/release flow with unread controls, blocking and report resolution. Strict TypeScript, ESLint and production build passed. The operator bootstrap was separately verified against a disposable database. Desktop super-admin and mobile support screenshots were visually reviewed. Local preview returns HTTP 200; unauthenticated interaction API returns 401.


## Premium redesign core milestone — verified 25 November 2026
The full staged scope and exact remaining work are tracked in REDESIGN_PROGRESS.md; the original redesign brief is preserved. This delivery rebuilds the visual foundation and core browsing experience, with selected buyer/seller and discovery improvements. It is not a claim that all six stages or Phase 1 launch acceptance are finished.

- Original inventory-first home, compact navigation, safe-area mobile tabs, shared tokens and reusable interactive controls.
- Natural phrase parsing into visible URL filters, mobile filter dialog, budget slider/fields, specification filters, sorting and grid/list views.
- Revised real-photo cards, favourites state, four-way comparison/differences, fullscreen/zoom/swipe/keyboard gallery.
- Dealer discovery and store inventory filtering, quick replies and visible-page messaging polling.
- Private incomplete text-draft recovery, photo previews/reorder/removal, transactional image updates with concurrent-change detection. No owner account or live inventory reset.
- Rules-based laptop finder and actual-data asking-price insights requiring five comparable observations; empty states remain honest.
- Migrations 7/8 add a limited public seller projection and private draft workspace/photo delete policy.
- Earlier statement that no live account had been promoted applied to the previous milestone; the owner subsequently requested and received super-admin access. This redesign preserves that access.
- Verification: 45 unit/database tests, all three isolated integration scenarios and four desktop/mobile smoke tests passed. ESLint, strict TypeScript and production build passed. Final evidence is recorded in REDESIGN_PROGRESS.md.
- Performance: the final local cold-start homepage sample showed 19.55 s LCP during database initialisation under concurrent QA load; seven other desktop/Android samples were 0.81–1.54 s. Reserving loading-page height removed the previously observed layout shift: all eight final samples had 0 CLS. These are local observations, not field Core Web Vitals; INP is unmeasured. Production database/storage and cold-start work remains required.
