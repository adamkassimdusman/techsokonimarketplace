# Tech Sokoni design system — redesign v2

## Direction
An original inventory-first Kenyan laptop marketplace. Retain recognisable teal/navy identity; current retail assets could not be inspected because techsokoni.com returns HTTP 402. No competitor assets or layouts copied. No stock photography is presented as marketplace inventory.

## Tokens
Canonical redesign tokens are in app/redesign.css, loaded after the original compatibility stylesheet while existing backend pages are retained.

| Role | Token/value |
| --- | --- |
| Brand/action | --teal / --color-brand #086c5c |
| Deep surface | --deep #122f38 |
| Main text | --ink / --color-text #172c35 |
| Secondary text | --muted / --color-secondary #586a73 |
| Canvas / surface | #f7f8f8 / white |
| Dividers | --line #dce3e4 |
| Soft brand | --mint #e9f3ef |
| Success / warning / error / info | #186145 / #775617 / #a32e35 / #265b76 |
| Spacing | 4, 8, 12, 16, 24, 32, 48px |
| Radius | 5px controls, 9px panels, 14px large dialogs |
| Motion | 140ms feedback, 200ms normal; disabled for reduced motion |
| Popover shadow | 0 12px 32px #142c3a18 |

Typography: modern system sans stack (Inter when installed, then platform UI fonts). No third-party font request or unlicensed bundled font. Headings use compact tracking, responsive 30–48px main titles, 22–29px section titles. Body 16px, controls 14–16px, supplementary metadata 12–13px where space allows. Extremely narrow product grids become single-column rather than reducing essential text further.

## Layout
1440px content envelope, 32px desktop / 20px tablet / 16px phone gutters. Compact sticky desktop header; account menu contains administrative links. Mobile header preserves search and notifications, with safe-area Home/Explore/Sell/Messages/Account navigation. Content includes bottom padding. Comparison tray sits above mobile navigation.

Product cards use 4:3 image spaces, restrained borders, model/price/hardware hierarchy, seller/location, reversible save and compare controls. Grids use four columns wide, three smaller desktop, two phone where readable, one below 360px. List view remains a separate working URL preference.

## Reusable UI
- Navigation and account/location menus: components/navigation.tsx.
- Dialog with native focus trapping, Escape and backdrop handling: components/ui.tsx.
- Progressive URL query forms, sort and mobile filter sheet: components/search-controls.tsx.
- Product cards and filter fields: components/catalog.tsx.
- Persisted save state: components/save-button.tsx.
- Four-item comparison selection/tray: components/comparison.tsx.
- Difference-only comparison: components/compare-table.tsx.
- Keyboard/swipe/fullscreen/zoom gallery: components/gallery.tsx.
- Safe photo selection, preview, ordering/removal: components/photo-uploader.tsx.
- Suggested messages and visibility-aware polling: components/message-composer.tsx.
- Finder steps: components/laptop-finder.tsx.
- Existing ActionForm preserves mutation success/error announcements.

## Accessibility and truthfulness
Use semantic elements, visible focus, native form labels, button names and min 44px main touch targets. Status/error messages use live regions. Verification is never inferred from dealer status, paid placement or account registration. Unconfigured verification/checkout remains explicitly unavailable. No performance advantages are inferred from CPU branding alone.

This is an implementation target, not WCAG certification. Screen-reader/manual assistive-technology testing, physical low-end Android testing and field Core Web Vitals remain outstanding. Test and screenshot evidence is recorded in IMPLEMENTATION_STATUS.
