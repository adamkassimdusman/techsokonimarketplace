# Tech Sokoni Marketplace

Independent, local-first implementation of the Tech Sokoni laptop marketplace brief. **Development milestone, not approved for public launch.** No changes have been made to the retail website. No remote infrastructure has been provisioned.

## Run locally

Requires Node.js 22+ and npm. From this directory:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. LOCAL_DATABASE=1 creates a persistent PostgreSQL-compatible PGlite database in `.data/postgres`. There is no seed inventory, preset password or public demonstration account. Register an account to begin. Local runtime data and credentials are git-ignored. Never run two processes against the same PGlite data directory.

## Implemented vertical slices

- Responsive server-rendered homepage, searchable and shareable catalogue, detail pages, public profiles and basic comparison.
- Password registration/login/logout, server-side sessions, configurable email password recovery, profile editing.
- Seven-step listing form, drafts, editing, 5–10 actual photo requirement on submission, metadata-stripped WebP images, moderation before publication.
- Favourites, listing conversations, messages, offers/counteroffers, transactional acceptance and reservations.
- Inspection requests against administrator-created future slots; one booking per slot.
- Role-protected moderation, real metrics, reports, audit trail and in-app message/offer/inspection/moderation notifications.
- Database row policies, validation, rate limits, secure headers, private serial storage and private image access.
- SEO metadata, sitemap, robots, accessible loading/error/empty states and draft policy pages.

## Checks

```sh
npm run build
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run e2e
# Full four-account workflow in a fresh disposable database on port 3100:
npm run build
npm run integration
```

Browser tests create explicitly labelled private test accounts and drafts. The integration suite publishes synthetic fixtures only inside its disposable database. Database tests use isolated memory databases.

## Super-administrator bootstrap

Start the latest app once so migrations apply, then register your own account at http://localhost:3000/account?mode=register. Stop the local server (Ctrl+C in its terminal). From this project directory run:

```sh
node --env-file=.env.local scripts/admin.mjs your-account@example.com --super-admin
```

Restart with `npm run start` (after `npm run build`) or `npm run dev`, then sign in again. Open http://localhost:3000/super-admin to grant or remove **admin** access for an existing registered email. Confirm with your own password and the checkbox. Changes revoke the affected account's sessions and are audited. Super admins can also perform all admin operations.

Only the operator command grants **super-admin** access; the website cannot grant or remove that role. Omitting `--super-admin` grants ordinary admin access. Registration/profile forms never accept roles. There is no default administrator or shared password. Never run the command while another process has the same local PGlite database open.

## Main source map

- `app/`: App Router pages, server actions, authenticated media delivery and SEO routes.
- `components/`: listing form, cards, filters and progressive action feedback.
- `lib/`: data access, authentication, input validation and password/session primitives.
- `db/001_initial.sql`: schema, indexes, row policies and moderation trigger.
- `tests/`: security, database policy and desktop/mobile browser tests.
- `docs/`: original brief, architecture, decisions, security, deployment and next steps.

Read `docs/IMPLEMENTATION_STATUS.md` for verified results and the exact next development step. Public launch requires the unresolved work in `docs/DEPLOYMENT.md` and legal/brand review.

## Isolated workflow testing

`npm run integration` starts its own production server on 127.0.0.1:3100 and a fresh temporary PGlite database. The seller, admin, super admin and two buyers exist only there. Their randomly generated test credentials are stored in ignored `.data/integration-credentials.json`; no production account or development database is modified. Test fixtures must never be copied into real inventory. An existing server on port 3100 causes the test command to refuse startup.

## Listing approvals

Open `http://localhost:3000/admin#listing-moderation` while signed into an administrator account, or choose **Account → Listing approvals** on desktop (or Administration from your dashboard). Review photos/specifications/faults, choose Approve publication / Reject / Suspend, enter a reason and confirm the review. Administrators cannot approve their own listings. Ordinary accounts cannot access this page; there is no default administrator password. Use the operator bootstrap procedure above to grant a registered account access, with the local server stopped.

## Release an accepted reservation

Open the listing conversation under Messages, expand **Cancel this reservation**, enter a reason and confirm. Either participant may release the hold. The laptop returns to moderation, both parties receive notifications, and a private receipt remains in the conversation. Existing inspections are not cancelled. No payment or refund is recorded.


## Client interaction backend

- Clients: http://localhost:3000/support — open a private support request, read staff replies and reply while open.
- Staff: http://localhost:3000/admin/interactions — reply to clients, close requests, inspect explicitly reported conversations and resolve reports.
- Messages: block/unblock another participant, report a conversation with consent to moderator review, see unread totals and mark displayed messages read. Blocking prevents new messages and offers in both directions; existing reservations may still be released.
- `GET /api/interactions`: session-authenticated JSON containing only the signed-in account's `unreadMessages` and `openSupportRequests` counts. Unauthenticated requests return 401; responses are not cached.
- Mutations use authenticated Next server actions and database transactions; client-supplied account IDs/roles are never trusted. Migration 6 stores roles, blocks, reports, read positions, tickets and replies. Staff replies and resolutions have audit records.

Messages refresh every 15 seconds while visible and online, with a manual refresh action; support still uses refresh. WebSocket delivery is not implemented. Message/support history and staff/report lists are bounded; complete historical pagination remains future work.


## Premium redesign
Open the local preview at http://localhost:3000. The new homepage prioritises search and actual inventory. Mobile navigation exposes Home, Explore, Sell, Messages and Account; administrative links remain role-protected inside Account/dashboard.

- Search accepts phrases such as “HP EliteBook under 30K”, “ThinkPad with 16GB RAM” and “Dell Core i7 in Nairobi”, then exposes ordinary filters.
- Product galleries support thumbnails, keyboard/swipe navigation, fullscreen and zoom. Select up to four listings for comparison and show only differing specifications.
- New-listing text fields autosave privately; serials and photos save only through the full listing action. Photo selection supports previews, ordering and removal; saved edits retain existing image IDs.
- Finder: /finder. Asking-price insights: /insights. No price statistics appear without at least five matching configurations.
- Full stage-by-stage delivered/remaining scope, modified files, screenshots and limitations: docs/REDESIGN_PROGRESS.md. Visual evidence is in the sibling outputs/redesign folder.
- Both npm run e2e and npm run integration now use disposable databases on port 3100. Run them sequentially after a build; never use the owner preview database for tests.
