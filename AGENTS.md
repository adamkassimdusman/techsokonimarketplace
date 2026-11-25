# Persistent engineering instructions

This is the independent Tech Sokoni Marketplace, not the retail site. Preserve user changes. Do not deploy publicly, purchase services or change irreversible infrastructure without explicit approval.

## Architecture
Next.js App Router, React, strict TypeScript, custom responsive CSS, Zod, server-side PostgreSQL queries. PGlite is a persistent single-process LOCAL DEVELOPMENT adapter only; production uses pg and DATABASE_URL. Database access is never exposed to the browser. No Supabase service key or user-selectable role.

## Rules
- Never fabricate inventory, availability, ratings, testimonials, verification or successful payment.
- Listings begin draft/pending. Only admins approve, and admins cannot approve their own listings.
- Use integer minor units for money. User input in KSh is converted exactly once.
- Keep serial numbers private. No identity document collection exists in this milestone.
- User-scoped reads/writes use transaction(actor,...), which sets a restricted database role and local identity context. Service queries are privileged: require explicit server authorisation and parameterise all input.
- All new tables need constraints, indexes where justified and access policies. Add versioned migrations; never silently edit deployed migrations.
- Every privileged mutation needs an audit event. Never log credentials, tokens or serials.
- Offers reserve atomically and do not imply payment. Payment/certification/AI features remain unavailable.
- Re-encode uploaded photos with bounded dimensions/pixels. Do not trust MIME names or metadata.
- Never run concurrent processes on the same PGlite directory. Tests use their own database.
- Keep live user data and secrets out of Git. Preserve `.data`.

## Procedure
Read IMPLEMENTATION_STATUS before work. Use official integration documentation. Run TypeScript, lint, relevant tests and production build after meaningful changes. Browser-test desktop and mobile paths. Update status, decisions and changelog after each milestone with honest coverage and exact next step. No claims of production readiness or legal compliance based on this scaffold alone.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Isolated workflow suite
Run `npm run build` then `npm run integration` for the four-account journey. The harness uses port 3100, a unique temporary PGlite directory and ignored random test credentials; never point it at owner data or a real database. Do not run a build and a standalone TypeScript check simultaneously: build regenerates .next/types.

## Redesign continuity
The supplied premium redesign brief is preserved in docs/REDESIGN_REQUIREMENTS.md. Read UI_UX_AUDIT and COMPETITOR_ANALYSIS before further visual work. Use app/redesign.css tokens and existing client UI components; avoid reinstating the large marketing hero or mobile filter sidebar above results. Run smoke E2E only through the disposable port-3100 harness; playwright.config.ts now isolates tests from owner data. Both test suites need the latest production build. New migrations 7/8 preserve public seller projection boundaries and owner-only incomplete text drafts. No arbitrary verification badges, fake prices or seeded live inventory.
