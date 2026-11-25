# UI/UX audit — 25 November 2026

## Scope and evidence
Reviewed AGENTS, architecture, schema migrations 1–6, authentication/roles, design system, all App Router paths, catalog components, listing wizard, messaging, dashboard and domain workflows before editing application code. Public screenshots are in ../redesign/before relative to the project; scripts/redesign-capture.mjs measures overflow at 320, 360, 390, 430, 768, 1024 and 1440px. Authenticated screenshots use the isolated integration database and clearly synthetic test inventory, never the owner's account. Captures without access to a real published listing do not constitute product-card visual verification.

## Findings and priorities
1. Homepage: oversized three-line hero, decorative laptop illustration, trust strip and large brand tiles push inventory far below discovery. Replace with a concise search/budget/location panel, horizontal brand and budget links, then actual inventory.
2. Mobile navigation: horizontally scrolling desktop nav hides key destinations; message icon disappears at narrow widths. Add five-destination safe-area bottom navigation and compact sticky header.
3. Search results: filters precede results on mobile and require long scrolling. Use one shared filter form in a desktop sidebar/mobile modal sheet, URL-synchronised controls, removable chips, immediate results navigation, count, sort and grid/list choices.
4. Cards: controls compete with details, comparison only sends one item, save state is not visible, seller identity is missing. Prioritise photo/model/price, concise hardware, seller/location; persistent reversible save control and four-item comparison tray.
5. Details: all full-size images are stacked, no selected gallery image, zoom or keyboard/swipe controls. Add bounded main gallery, thumbnails, fullscreen dialog and keyboard/swipe navigation. Retain actual photographs and honest seller-declared condition.
6. Forms: consistent labels exist, but wizard has no photograph previews/reordering and partial drafts are not persisted. Separate these functional improvements from visual styling; do not advertise autosave before implementation.
7. Private areas: working backend but text-heavy layout, weak grouping and generic missing-page feedback for role denial. Preserve role checks; give useful restricted-access explanations.
8. Trust: current disclaimers are accurate but repeated and visually heavy. Consolidate into compact context-specific disclosure and detailed explanations. Do not invent verified stock or payment protection.
9. Type/spacing: current Arial stack, large title spacing, mixed rounded containers and excessive vertical space. Retain recognisable teal/navy identity with a systematic type scale, moderate radii, compact controls and semantic tokens.
10. Accessibility/performance: existing skip link, labels and focus styles are a useful foundation. Add modal focus management/Escape, minimum touch areas, reduced-motion transitions, reserved image dimensions. No WCAG or Core Web Vitals certification claimed.

## Architecture and preservation
Next App Router, server-rendered catalog, client islands for controls, authenticated server actions and SQL row policies. Public catalog only returns published inventory. Private sessions, roles, uploads, reservations and inspections remain authoritative. Local PGlite is single-process. Never reset .data or seed live inventory. External paid services, identity verification, certificates and push delivery are unavailable until implemented/configured.

## Delivery order
Stage 1: tokens, navigation, reusable UI and audit/research.
Stage 2: homepage, cards, search/filter controls, details/gallery, favourites.
Stage 3: comparison, seller/dealer discovery, wizard and messaging improvements.
Stage 4: honest trust/inspection/service states; no unsupported certificates or paid activation.
Stage 5: transparent finder/asking-price insights and carefully scoped saved discovery/PWA.
Stage 6: isolated domain/browser tests, before/after captures, responsive and keyboard checks, build/lint/types. Record exact coverage and unfinished capabilities in IMPLEMENTATION_STATUS.
