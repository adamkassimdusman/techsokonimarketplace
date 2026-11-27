# Deployment preparation

The owner deployed to Vercel and requested repair of the hosted database on 26 November 2026. The production origin is https://techsokonimarketplace.vercel.app.

## Local preview
`npm ci`; copy `.env.example` to `.env.local`; `npm run dev`. Open http://localhost:3000. Do not run the CLI admin command while the PGlite server process is running. Preserve `.data` between local sessions; it contains account/listing state and is not source.

## Configuration needed from owner
- Confirm production origin `https://market.techsokoni.com` and retail-brand logo/colours.
- PostgreSQL service and a DATABASE_URL kept in deployment secret storage, with TLS as required by provider. Never expose it via NEXT_PUBLIC.
- Transactional email provider key, verified MAIL_FROM and password recovery origin APP_URL.
- Actual approved inspection business locations, operating hours and staffing. Add real slots through admin; no address is invented.
- Production auth/MFA choice, object-storage provider and retention policy.
- Professional review of marketplace/privacy/seller/inspection terms and consumer/payment obligations.

## Before hosting on Vercel or equivalent
1. Finish launch blockers in SECURITY and IMPLEMENTATION_STATUS, especially private object-storage upload at scale, administrative MFA, email ownership and workflow tests.
2. Provision staging PostgreSQL after approval. Run the numbered migrations in `db/` in order (001 through 009 at this milestone) with migration credentials. The current server bootstrap applies migrations atomically on one checked-out connection under a PostgreSQL transaction advisory lock. Concurrent cold starts serialize safely, failed migrations roll back, and initialization can retry. Migration 009 explicitly grants the trusted database owner membership in the restricted NOLOGIN marketplace_app role, required on managed PostgreSQL. All SQL files are included in Next output tracing. A dedicated release migration job and separate migration/runtime credentials remain future hardening.
3. Do not set LOCAL_DATABASE in hosted production. Set DATABASE_URL, APP_URL (HTTPS) and email variables. Configure provider TLS properly; never disable certificate verification.
4. Run lint/typecheck/unit/database/browser tests and build against staging. Test cross-account data access against the real server database and storage.
5. Configure monitoring, backup/restore, retention, edge rate/request-size limits and session/security policy. Test password recovery and administrator access under HTTPS.
6. Obtain approval for publication. Set domain DNS and deploy. Smoke-test signup/login, listing upload/moderation/search, message/offer, booking and media revocation.
7. Keep payments/identity verification/certificates unavailable until actually implemented and approved.

No payment API keys are required for the current local application. No customer funds are accepted. No production availability claim should be made from local test results alone.

## Vercel database repair

Importing the repository does not upload the local `.data/postgres` database or `.env.local`. The original Vercel project had no environment variables and no connected database.

Connect a dedicated Neon PostgreSQL database through Vercel Storage (the Free plan was selected), scoped to Production. The integration injects sensitive `DATABASE_URL` and related variables. Add the non-secret `APP_URL=https://techsokonimarketplace.vercel.app`. Redeploy after changing variables. Never enable `LOCAL_DATABASE` or use `/tmp` as persistent hosted storage. The application rejects that fallback on Vercel.

Local and hosted users are separate. Register on the hosted site; local passwords and role assignments were not uploaded. Grant hosted administrators only after the owner confirms the registered account. Neon Auth is not used by the application: existing server-side password/session authentication remains in place. Preview deployments need their own isolated database connection before testing authenticated behavior.

Useful provider references: [Vercel storage integrations](https://vercel.com/docs/marketplace-storage), [Neon managed roles](https://neon.com/docs/manage/roles).

## Photo uploads on Vercel
Photos are now resized in the browser to at most 280 KiB each before entering the submission. Ten photos fit within the application's 3 MiB image budget, leaving room below the default 4.5 MB Vercel request limit for form fields. Next server actions accept at most 4 MiB. The server still decodes, validates and re-encodes every photo. Text autosave sends only allowlisted public text fields, never images or serial numbers. Interrupted saves display an inline error and preserve form values/files for a retry. Direct object storage remains a scaling improvement, not a prerequisite for these bounded uploads. [Vercel payload limits](https://vercel.com/docs/functions/limitations).
