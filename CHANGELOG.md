# Changelog

## 2026-11-24 — independent local MVP development milestone
- Created Next.js application, provisional design system and responsive public/private pages.
- Added PostgreSQL schema, restricted application role, row policies, ownership trigger and indexes.
- Added local persistent PGlite and external PostgreSQL adapter.
- Implemented account, listing/photo, catalogue, favourite, conversation, offer, inspection-request and moderation flows.
- Added security/database/browser tests and persistent engineering documentation.
- No deployment, fake inventory, verification badges or financial integrations.

## Workflow verification milestone
- Added isolated four-account browser workflow harness with a disposable database.
- Added shared offer/inspection domain operations and seven workflow tests.
- Fixed occupied-slot visibility and reserved-buyer inspection booking.
- Added safe retries for offers, booking requests and concurrent conversation creation.
- Made initial schema setup atomic and added migration 3.
- Added migration 4 to prevent reservation bypass and reopening terminal listing states.
- Added persistent inspection status feedback after a successful booking.

## Reservation release milestone
- Added confirmed cancellation for either reservation participant, private reasons, audit history and notifications.
- Return released listings to moderation; preserve appointments and offer history.
- Added six automated release cases, including replay and privacy checks, plus browser release coverage.
- Added a direct Listing approvals navigation link for administrators.

## 2026-11-25 — Super admin and client interaction backend
Added audited admin access management, operator super-admin bootstrap, private client support and staff replies, conversation reports/blocking, unread indicators/read controls and authenticated interaction counts. Added access-control and browser integration coverage.

## 2026-11-25 — Premium marketplace redesign, core delivery
- Added audit/reference research, an original teal/navy design system, compact desktop discovery header and safe-area mobile navigation.
- Rebuilt homepage and listing cards; added URL-driven mobile filters, active chips, grid/list views, specification facets and conventional natural-phrase interpretation.
- Added full-screen/zoom/swipe/keyboard photo gallery, persisted save state, four-item comparison tray and differences-only table.
- Improved dealer discovery/store search, mobile conversation navigation, quick replies and visible-page polling.
- Added owner-only incomplete text draft recovery and safe photo previews/reorder/removal. Existing accounts, listings and admin permissions preserved.
- Added transparent laptop finder and minimum-sample asking-price insights; no fake inventory or verification.
- Migrations 7/8 preserve public projection/private draft boundaries. Advanced trust, monetisation, saved-search events and PWA remain staged follow-ups.

## 26 November 2026 — hosted database startup
- Added PostgreSQL cold-start migration locking, atomic rollback/retry, managed-owner role membership and explicit SQL asset tracing for Vercel.
- Reject filesystem-backed database startup on Vercel and document the required hosted PostgreSQL/APP_URL setup.

## 27 November 2026 — reliable hosted listing uploads
- Resize photos before transport to stay below Vercel request limits; retain server validation and metadata stripping.
- Exclude files and serial numbers from text autosave, and preserve the form on interrupted submissions.
- Verify oversized original photo batches, retry behavior and saved media on desktop and mobile.
