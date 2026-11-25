# Engineering decisions

2026-11-24, Africa/Nairobi:
1. Empty project → separate application under outputs/tech-sokoni. Existing retail website untouched.
2. Retail fetch failed with HTTP 402 → provisional design; do not infer brand colours from unavailable content.
3. Next.js + React + strict TypeScript, verified against official current documentation. Lockfile records exact installed versions.
4. Server-rendered pages and native forms reduce client runtime. Custom CSS is adequate without Tailwind/shadcn setup.
5. Persistent PGlite for usable local PostgreSQL semantics without credentials. pg adapter for hosted PostgreSQL. Local database not a production substitute.
6. Credential-based auth for independent local workflow; no fake Supabase auth. Native sessions require MFA/email-confirmation hardening before launch. Supabase Auth remains a migration option.
7. BYTEA re-encoded images provide real transactional local storage; production object-store upload path deferred.
8. No demo product inventory. CSS illustration does not imply availability. Browser-created test data remains private and clearly labelled.
9. Financial services absent/disabled; no pricing claims or provider simulation.
10. User brief explicitly requires local work and approval before publication; no Sites project or hosting registration created.

References reviewed:
- https://nextjs.org/docs/app/getting-started/installation
- https://nextjs.org/docs/app/api-reference/functions/cookies
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://pglite.dev/docs/
- https://nodejs.org/api/crypto.html

Resend send API reviewed: https://resend.com/docs/api-reference/emails/send-email . Sandbox delivery remains untested until credentials are supplied.

## Workflow verification milestone

- Run the complete four-account browser journey on port 3100 with a unique temporary database and random credentials, never against the owner preview database.
- Extract offer and booking domain operations so database integration tests execute the same code as server actions.
- Serialize negotiation with the listing row lock and booking with listing/slot locks. Retried matching pending offers, repeated accepted/rejected decisions and identical bookings have no duplicate effect.
- Resolve occupied-slot visibility through a fixed database projection; keep appointment records private.
- Local PGlite tests prove transactional state transitions and constraints, but do not establish multi-connection PostgreSQL lock behaviour. External PostgreSQL concurrency testing remains required before release.

## Reservation release

Either the seller or accepted buyer may release a reservation without requiring the other party to remain responsive. Explicit confirmation and a shared reason are required. Relisting requires moderation, and appointments are not implicitly cancelled. Persist a release record and retain the offer amount/history; deny release for sold/suspended devices. Admin approval navigation is visible only to administrators; no default admin password or automatic role promotion.

## Super-admin access and client support
Super admins are bootstrapped by the operator, while ordinary administrator access can be managed in the authenticated super-admin screen after password confirmation. Roles cannot be self-selected. Role changes revoke sessions and are audited. Client support is stored in PostgreSQL with owner/staff access. Conversation reports require explicit disclosure consent; staff are shown reported conversations, not a general message browser. Blocking is symmetric for new messages/offers and does not prevent releasing reservations. Read markers use monotonic message sequences bounded to stored messages.
