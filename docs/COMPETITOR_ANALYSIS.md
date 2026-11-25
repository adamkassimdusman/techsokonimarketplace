# Marketplace reference research

Research date: 25 November 2026. This is design research, not a verification of competitors' commercial claims. No competitor assets, branding, inventory, source code or exact page layouts are reused.

## Method and access

Read public pages using the web reader and captured rendered Chromium screenshots at 1440×1000 and 390×844. Initial narrow captures resize the desktop browser; they are responsive viewport checks, not proof of device-specific behavior. A separate Pixel 7 context was also captured and visually inspected for Jiji. No account creation, messages, purchases or seller submissions were performed. Authenticated dashboards/onboarding could not be audited end to end.

Reference screenshots and raw access observations are under `work/reference-research/` in the task workspace, outside the source archive. Screenshot evidence is for internal comparison, not replacement marketplace imagery.

| Reference | Public text access | Rendered browser access |
| --- | --- | --- |
| Motifiti | Homepage, dealer directory, storefront, vehicle details and market data read | Homepage desktop/mobile captured; dealer/detail desktop captures also inspected; detail images had not populated at capture time |
| Jiji | Laptop category and its extensive facets read | Desktop and narrow viewport captured; Pixel 7 capture inspected separately |
| Back Market | Homepage and laptop category read | Homepage desktop/mobile captured |
| Swappa | Laptop directory and Latitude 5420 listing table read | Browser returned HTTP 403 Cloudflare verification; screenshots document the obstacle, not a successful product-page visual audit |
| Tech Sokoni retail | HTTP 402 | HTTP 402, “Deployment Paused”; no reliable current retail branding or product presentation could be inspected |

## Motifiti: focused inventory discovery

The homepage brings search, budget and other filters before the stock feed. Brand shortcuts are compact, rather than separate promotional sections. Cards prioritise actual photographs and structured specifications; sort and pagination remain visible. The dealer directory has a name search, location selection and stock counts. Storefronts continue the same filtering model within one seller's stock. Sources: [homepage](https://motifiti.co.ke/), [dealers](https://motifiti.co.ke/dealers), [example storefront](https://motifiti.co.ke/store/hashi-cars/).

Its market-data page distinguishes asking prices and buyer budgets, explains the median in ordinary language, and discloses observation/date thresholds. Its details page exposes reference, specifications, expandable photography, quick enquiry prompts and a transaction-safety reminder. Sources: [market data](https://motifiti.co.ke/car-prices-in-kenya), [example details](https://motifiti.co.ke/vehicle/xcollins/xcoki08f).

**Tech Sokoni application:** keep the first screen useful for shopping; combine text search with budget/location; put dealers beside product discovery. For future insights, group compatible configurations and show sample size/date/asking-price labels. Do not manufacture history from the current snapshot.

## Jiji: practical faceted search

The laptop category exposes county, price bands and price inputs, brand, condition, RAM, processor and storage. Many options display matching counts. This makes the product vocabulary discoverable even when visitors do not know the exact model. Sources: [laptop category](https://jiji.co.ke/computers-and-laptops), [homepage](https://jiji.co.ke/).

The observed desktop layout is dense and strongly prioritises listing discovery. Resizing that same desktop document to 390px left the sidebar dominating the capture. A fresh Pixel 7 context correctly presented horizontally accessible filter controls, a sort/view bar and two-column product cards. This difference demonstrates why viewport-only testing is insufficient.

**Tech Sokoni application:** show the useful specification facets, active selections and a clear reset action; retain query state in the URL. On mobile, move advanced controls into an accessible panel instead of placing a long sidebar before results. Keep promotion and verification meanings distinct.

## Back Market: condition clarity and electronics presentation

The captured homepage uses a strong search area, category navigation and generous device photography. Its laptop category distinguishes configurations in titles and explains cosmetic grading separately from functional expectations. Warranty and returns claims link to supporting information. Sources: [homepage](https://www.backmarket.com/en-us), [laptops](https://www.backmarket.com/en-us/l/macbook-and-laptops/02661471-d1ce-4d43-88e3-4bc4b7d4c8d6).

**Tech Sokoni application:** use coherent image ratios, a restrained type hierarchy and concise specification summaries. Explain condition and battery provenance at the point of decision. Do not import Back Market's warranty/refurbishment/payment promises into an unconfigured marketplace. Its large seasonal campaign hero and mobile install prompt are not appropriate patterns for this brief's inventory-first priority.

## Swappa: compare like-for-like devices

The laptop directory exposes model families. A model-specific page presents many offers with price, condition, RAM, storage, processor, seller and location in a repeatable structure; clear-filter and preview options are visible in the public text. Sources: [laptops](https://swappa.com/laptops), [Latitude 5420 offers](https://swappa.com/listings/dell-latitude-5420).

**Tech Sokoni application:** use consistent card/spec ordering and comparison columns so buyers can distinguish offers without decoding descriptions. Preserve exact CPU details; “i7” alone is not a performance conclusion. The security challenge prevents claims about inspected live visual behavior or completed seller onboarding.

## Original design decisions

- Retain Tech Sokoni's established local teal/navy identity until authentic retail assets are accessible.
- Use a compact search-led introduction and product feed ahead of marketing.
- Build one reusable product information hierarchy across cards, details, comparisons and seller stock.
- Put routine buying/selling actions in mobile navigation; keep administrative controls within account navigation.
- Use actual data only. Hide dependent promotional/review sections when records do not exist; explain unavailable services clearly.
- Use minimal motion, visible focus, readable control sizes, reserved image dimensions and accessible overlays.

These are recommendations derived from the reference review, not claims that implementation or accessibility verification is complete.
