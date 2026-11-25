# Deployment preparation

No public deployment is authorised or performed in this session.

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
1. Finish launch blockers in SECURITY and IMPLEMENTATION_STATUS, especially direct private object-storage upload (55 MB action requests exceed normal serverless upload limits), administrative MFA, email ownership and workflow tests.
2. Provision staging PostgreSQL after approval. Run the numbered migrations in `db/` in order (001 through 008 at this milestone) with migration credentials. Configure restricted runtime credentials and verify role switching; avoid automatic migrations in multi-instance production.
3. Do not set LOCAL_DATABASE in hosted production. Set DATABASE_URL, APP_URL (HTTPS) and email variables. Configure provider TLS properly; never disable certificate verification.
4. Run lint/typecheck/unit/database/browser tests and build against staging. Test cross-account data access against the real server database and storage.
5. Configure monitoring, backup/restore, retention, edge rate/request-size limits and session/security policy. Test password recovery and administrator access under HTTPS.
6. Obtain approval for publication. Set domain DNS and deploy. Smoke-test signup/login, listing upload/moderation/search, message/offer, booking and media revocation.
7. Keep payments/identity verification/certificates unavailable until actually implemented and approved.

No payment API keys are required for the current local application. No customer funds are accepted. No production availability claim should be made from local test results alone.
