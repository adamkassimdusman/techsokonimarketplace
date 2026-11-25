# Security model and limitations

Implemented: salted scrypt password hashes, timing-safe comparison, random 256-bit session tokens stored as SHA-256 digests, HttpOnly/SameSite cookies, Secure cookies when APP_URL uses HTTPS, 7-day session expiry, reset-token expiry and single-use consumption, session revocation on reset/logout, parameterised queries, server-side Zod validation, output escaping, Next.js action origin checks, restricted DB role and RLS, database rate limits, owner/participant/admin checks, bounded re-encoded photos and private media delivery, security headers, audited moderation/admin grants. Protected payments cannot be invoked: there is no payment route.

Admin roles are granted by an operator command only, never by frontend input. The admin cannot approve their own listing. Public seller projections exclude emails and credentials. The application collects no national ID documents. Serial numbers reside in a separate owner-only table; encryption at rest must be supplied by the production database/storage provider.

Important unresolved launch controls:
- Administrative MFA/step-up authentication and a super-admin role are not implemented.
- Email ownership confirmation/OTP are not implemented. Account signup never confers verification.
- CSP currently allows inline scripts/styles for Next.js; implement nonce-based CSP and test the production flow before launch.
- Confirm trusted proxy handling before using IP-derived rate limits, add edge request-size limits/CAPTCHA and distributed abuse response.
- Configure database backup/restore, encryption, retention/erasure workflows, secrets management, log redaction, monitoring and incident response.
- Move migration privileges out of runtime; test external PostgreSQL with separate principals.
- Add message blocking/reporting, general idempotency keys beyond offers/bookings/conversations, richer audit/status history, inspection cancellation/rebooking and offer withdrawal workflow.
- Verify transactional SMTP sender/domain and provider callbacks in sandbox. No production secrets are available here.
- Storage-in-database is suitable for the local milestone, not a scalable upload architecture. Vercel request limits require direct-to-private-object-storage uploads before hosted release.

No claim of legal compliance. All legal text is draft and requires Kenyan professional review, confirmed business details and actual operational policies. Regulated payments require separate legal/provider approvals.

Reservation release accepts the session user only, requires confirmation/reason and locks listing then offer. It cannot reopen sold or suspended listings. Unique release records and immutable participant-visible receipts prevent duplicated release effects; old retries cannot touch newer reservations. Release reasons are not written into notification or audit text.

## Client interaction access
Super-admin role assignment is operator-only. The UI requires existing super-admin identity, current-password verification and confirmation before changing ordinary admin roles. Target sessions are revoked. Support requests/replies are owner/staff-only; reports require membership and consent in the action. Blocks stop messages at a database trigger and offers at the domain layer. Read-only interaction JSON uses cookie authentication and no-store. Admin MFA, full historical pagination and independent PostgreSQL contention tests are still required before launch.
