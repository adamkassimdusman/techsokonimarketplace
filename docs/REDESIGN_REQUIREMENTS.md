# TECH SOKONI MARKETPLACE — PREMIUM UI/UX REDESIGN, INTERACTIVITY AND FEATURE ENHANCEMENT

## 1. Your role

Act as a senior product designer, award-winning UI/UX designer, frontend engineer, full-stack engineer, interaction designer and marketplace product strategist.

You are working on an existing Tech Sokoni Marketplace application.

The foundational marketplace is already being developed. However, the current visual design, layout, user experience and interactivity are not satisfactory.

Your assignment is to transform the existing application into a polished, premium, intuitive and highly interactive marketplace that feels like a professionally designed commercial product.

This is not a request to change a few colours or add animations to the existing interface.

Conduct a comprehensive product design and user experience overhaul.

## 2. Research and competitor analysis

Before implementing the redesign, study the following websites:

- https://motifiti.co.ke/
- https://jiji.co.ke/
- https://www.backmarket.com/
- https://swappa.com/
- https://www.techsokoni.com/

Use available browser automation, Playwright, screenshots and developer tools to inspect these websites on desktop and mobile where accessible.

Study their:

- Homepage layouts
- Search functionality
- Navigation systems
- Product discovery
- Filtering experiences
- Listing cards
- Product details pages
- Seller profiles
- Dealer storefronts
- Seller onboarding
- Listing creation
- Pricing information
- Promotional features
- Mobile navigation
- Customer interaction
- Trust-building elements

Pay particular attention to Motifiti's specialised marketplace experience, dealer discovery, structured listings, pricing filters and market data features.

Study Jiji's marketplace usability, listing discovery, seller communication and account management.

Study Back Market's electronics-focused presentation and product condition communication.

Do not copy their source code, branding, copyrighted visual assets or exact layouts.

Use these references to create an original Tech Sokoni Marketplace experience.

If any reference website cannot be accessed, document the limitation and continue with accessible references.

## 3. Audit the existing application

Before modifying the codebase:

- Read AGENTS.md and existing project documentation.
- Inspect the current application architecture.
- Identify all existing routes.
- Review existing components.
- Inspect the database schema.
- Understand authentication and permissions.
- Identify completed and incomplete functionality.
- Review the current design system.
- Run the application locally.
- Capture screenshots of important pages.
- Test the current experience on desktop, tablet and mobile.

Identify problems relating to:

- Poor visual hierarchy
- Inconsistent spacing
- Weak typography
- Cluttered layouts
- Excessive whitespace
- Oversized components
- Unprofessional product cards
- Poor mobile responsiveness
- Weak calls to action
- Unnecessary navigation complexity
- Inconsistent colours
- Unclear user journeys
- Missing loading states
- Non-functional interactions
- Accessibility problems
- Poor form usability
- Weak trust signals

Create docs/UI_UX_AUDIT.md documenting the findings and proposed improvements.

Do not delete working backend functionality or reset the database.

Preserve existing user data and completed features.

## 4. Overall visual direction

The marketplace must feel like a premium technology commerce platform designed specifically for Kenya.

The design should communicate:

- Trust
- Reliability
- Professionalism
- Technology expertise
- Simplicity
- Affordability
- Transparency

The final website should not look like a generic AI-generated SaaS template.

Avoid:

- Excessive gradients
- Excessive rounded containers
- Unnecessary glassmorphism
- Generic purple and blue AI-themed interfaces
- Oversized hero sections
- Excessive decorative icons
- Random floating illustrations
- Repetitive card-based sections
- Unnecessary badges
- Large empty areas
- Excessive shadows
- Unnecessary animations
- Inconsistent component styling
- Emojis used as primary interface icons

Use deliberate typography, clean lines, subtle borders, high-quality laptop photography and consistent spacing.

Use the existing Tech Sokoni brand identity as the foundation, improving it where necessary without losing brand recognition.

## 5. Establish a professional design system

Create a centralised design system covering:

- Primary brand colour
- Secondary brand colour
- Accent colours
- Neutral colour palette
- Background colours
- Surface colours
- Text hierarchy
- Success states
- Warning states
- Error states
- Verification colours
- Border styles
- Shadows
- Spacing scale
- Border radius
- Typography scale
- Iconography
- Animation durations
- Responsive breakpoints

Consider modern fonts such as Inter, Geist, Manrope or Plus Jakarta Sans, selecting one that complements the existing brand.

Use a consistent icon library such as Lucide.

Create reusable components for:

- Buttons
- Inputs
- Search fields
- Dropdown menus
- Select controls
- Filter chips
- Tooltips
- Dialogs
- Bottom sheets
- Tabs
- Product cards
- Seller cards
- Verification badges
- Toast notifications
- Skeleton loaders
- Pagination
- Empty states
- Error states
- Data tables
- Form controls

Use design tokens and CSS variables rather than hardcoding different visual values throughout the codebase.

Ensure consistent styling across public pages, user dashboards and administration interfaces.

## 6. Redesign the header and navigation

Create a compact, elegant marketplace header.

### Desktop navigation

Include:

- Tech Sokoni Marketplace logo
- Prominent global search
- Location selector
- Browse Laptops
- Verified Laptops
- Dealers
- Market Insights
- Messages
- Favourites
- Notifications
- Account dropdown
- Prominent Sell a Laptop button

Do not overcrowd the navigation. Place secondary actions inside appropriate dropdown menus.

The header should remain accessible while browsing without occupying unnecessary screen space.

### Mobile navigation

Implement a professional mobile bottom navigation bar with:

- Home
- Explore
- Sell
- Messages
- Account

Give the Sell action appropriate visual emphasis.

Include a compact mobile header with the logo, search access and notifications.

Respect mobile safe areas.

Ensure navigation does not obstruct content or important actions.

## 7. Completely redesign the homepage

The homepage must prioritise marketplace activity and product discovery.

Do not create a landing page that forces users to scroll through multiple marketing sections before seeing laptops.

### Compact hero section

Suggested headline:

Find your next laptop.

Supporting text:

Discover laptops from private sellers and trusted dealers across Kenya.

Include:

- Intelligent search bar
- Budget selector
- Location selector
- Search button
- Sell Your Laptop action

Allow buyers to search naturally using phrases such as:

- HP EliteBook under 30K
- Lenovo ThinkPad with 16GB RAM
- Dell Core i7 in Nairobi
- Laptop for engineering
- Gaming laptop under 80K

Implement structured search and keyword interpretation using actual inventory.

Do not pretend conventional search is an AI system.

### Quick discovery controls

Immediately below the search area, provide compact interactive navigation for:

- HP
- Lenovo
- Dell
- Apple
- ASUS
- Acer
- Other brands

Use appropriate brand assets only where their use is permitted.

### Browse by budget

Create quick filters for:

- Under KSh 20,000
- KSh 20,000–30,000
- KSh 30,000–50,000
- KSh 50,000–75,000
- Above KSh 75,000

Selecting a budget should immediately display or navigate to relevant inventory.

### Browse by intended use

Provide a visually engaging discovery experience for:

- Students
- Office work
- Programming
- Engineering
- Architecture
- Graphic design
- Video editing
- Gaming
- Remote work
- Business

Use attractive, consistent illustrations or photographs where they materially improve usability.

Ensure these categories map to real recommendation criteria rather than arbitrary labels.

### Marketplace feed

Display:

- Recently listed laptops
- Verified laptops
- Featured listings
- Affordable laptops
- Recently reduced prices
- Recommended laptops
- Popular searches

Only render data-dependent sections when sufficient genuine inventory exists.

Do not populate production sections with fabricated listings.

### Trust section

Create a compact explanation of:

- Seller verification
- Professional inspections
- Safe meeting arrangements
- Buyer and seller protection

Link each item to a dedicated explanation page.

Do not imply payment protection is operational if the integration is not active.

### Additional homepage sections

- Featured dealer storefronts
- Sell your unused laptop
- Laptop price insights
- Educational buying guides
- Frequently asked questions
- Comprehensive footer

The homepage should remain balanced and focused on helping users buy or sell quickly.

## 8. Redesign laptop listing cards

Laptop cards are one of the most important components of this application.

Create compact, information-rich, visually consistent cards that make comparing laptops effortless.

Each card should display:

- High-quality actual product photograph
- Favourite icon
- Relevant condition label
- Laptop brand and model
- Price in Kenyan Shillings
- Processor model
- RAM
- SSD or storage capacity
- Location
- Seller type or name
- Verification status
- Listing age where useful

Display battery health when available, with a clear distinction between seller-declared and independently verified measurements.

### Card visual hierarchy

1. Product photograph
2. Price and laptop model
3. Essential specifications
4. Condition and trust information
5. Seller and location

Keep card heights consistent without unnecessarily truncating important information.

Use aligned image aspect ratios while preserving actual device photographs.

### Interactive behaviour

- Smooth, subtle hover effects on desktop
- Favourite toggle
- Quick comparison selection
- Photo navigation where multiple images exist
- Quick-view dialog where appropriate
- Accessible tooltip explanations
- Seller profile links

Use immediate feedback when a laptop is saved or added to comparison.

Do not make hover-dependent functionality inaccessible to mobile users.

Do not place too many competing buttons on each listing card.

### Responsive product grid

Aim for:

- Four or five columns on sufficiently wide desktop screens
- Three columns on smaller desktops
- Two or three columns on tablets
- Two columns on mobile where readability permits
- One column on narrow devices where necessary

Choose responsive column counts based on actual content readability, not arbitrary device labels.

## 9. Advanced marketplace browsing experience

Create a professional marketplace results page inspired by the practicality of Motifiti.

### Desktop experience

Use a structured layout with:

- Filter sidebar
- Results header
- Search field
- Active filter chips
- Sort control
- Grid/list view switch
- Product results
- Pagination

### Mobile experience

Use a sticky or easily accessible control bar containing:

- Filters
- Sort
- View options
- Results count

Open advanced filters inside an accessible mobile bottom sheet or full-screen filter panel.

### Filters

Support:

- Price range slider
- Minimum and maximum price inputs
- Brand
- Laptop series
- Model
- Processor manufacturer
- Processor model
- Processor generation where meaningful
- RAM
- Storage
- Dedicated graphics
- Screen size
- Touchscreen
- Convertible form factor
- Condition
- Battery health
- Warranty
- Location
- Private seller
- Dealer
- Verified seller
- Physically inspected laptop
- Negotiable price

Include a visible Clear All Filters action.

Display the applied filter count.

Where practical, show the number of matching laptops alongside relevant filter options.

Update search results efficiently without unnecessary full-page reloads.

Synchronise filters with URL parameters.

Preserve browsing position and selected filters when users return from a product page.

### Sorting

Include:

- Newest listings
- Price low to high
- Price high to low
- Relevance
- Verified laptops
- Recently reduced price
- Most viewed

Sponsored listings must be clearly labelled and must not silently override user-selected sorting.

## 10. Interactive laptop comparison

Develop a polished comparison feature.

Allow users to select two to four laptops from the marketplace.

When laptops are selected, show a compact comparison tray that does not obstruct browsing.

The comparison page should include:

- Product photographs
- Model names
- Prices
- CPU models
- RAM
- Storage
- Graphics
- Screen size
- Display resolution
- Battery health
- Condition
- Warranty
- Seller type
- Inspection status
- Location

Provide an option to highlight differences only.

Make the comparison table horizontally scrollable on smaller screens while preserving readable row labels.

Where reliable data is available, highlight meaningful advantages.

Do not make performance claims based solely on processor branding such as Core i7 versus Core i5.

Consider processor generation, exact model, power class and other relevant factors.

Allow users to remove products or replace them directly from the comparison interface.

## 11. Redesign the product details page

Create an immersive but practical product page.

### Desktop layout

- Large product image gallery on the left
- Price, key information and seller actions on the right
- Detailed specifications and condition information below

### Product image gallery

Include:

- Main photograph
- Thumbnail navigation
- Image counter
- Full-screen image viewer
- Zoom functionality
- Swipe navigation on mobile
- Keyboard navigation

### Primary product information

Display:

- Laptop model
- Price
- Negotiable status
- Condition
- Location
- Listing date
- Listing reference
- Verification status

### Quick specification summary

Use a compact structured layout for:

- Processor
- RAM
- Storage
- Graphics
- Display
- Battery health

### Detailed content sections

- Overview
- Technical specifications
- Physical condition
- Known defects
- Battery and charger
- Warranty
- Inspection report
- Seller information
- Delivery and collection

Use tabs or section navigation only where they improve content discovery.

### Sticky action panel

Provide appropriate primary and secondary actions:

- Chat with Seller
- Make an Offer
- Book an Inspection
- Save
- Compare
- Share

Display secure checkout only when the required integration is operational.

On mobile, provide a compact sticky action bar for the most important buyer actions.

### Seller information panel

Include:

- Seller name
- Profile photograph or business logo
- Account age
- Verification status
- Available listings
- Eligible customer reviews
- Seller type
- General location
- Response information when reliable

### Trust and safety

Clearly communicate which information is seller-declared and which has been independently verified.

Include accessible links to report a listing, understand inspection limitations and learn about safe transactions.

## 12. Motifiti-inspired dealer directory

Create a dedicated dealer directory.

Allow buyers to discover laptop dealers independently of individual listings.

### Dealer filters

- County
- Town
- Business verification
- Available brands
- Available inventory
- Warranty offered
- Physical shop availability

### Dealer storefront cards

Display:

- Business name
- Logo
- General location
- Verification status
- Available listings count
- Genuine reviews where available
- View Store button

### Individual storefront pages

Each dealer should have a shareable URL.

Include:

- Custom cover image
- Business logo
- Business description
- General location
- Opening hours where provided
- Contact options
- Verification information
- Available laptop inventory
- Store-specific search and filters
- Eligible customer reviews
- Favourite or follow dealer functionality where implemented

Allow dealers to manage storefront information through their dashboard.

Keep paid subscription status separate from identity verification.

## 13. Market Insights and laptop price intelligence

Create a dedicated Market Insights section inspired by Motifiti's market data concept.

This should become one of Tech Sokoni's distinctive features.

Potential capabilities:

- Average laptop asking prices
- Median listing prices
- Price ranges by brand and model
- Price distribution by condition
- Price trends over time
- Recently reduced prices
- Number of active listings
- Popular laptop models
- Recently sold laptops where transaction data is reliable

### Example model insight page

HP EliteBook 840 G8

- Median asking price
- Available listings
- Typical price range
- Configuration differences
- Condition breakdown
- Price history when sufficient data exists

Use responsive charts and interactive filters.

Always show the number of observations, relevant date range and whether the data represents asking prices or completed transactions.

Avoid misleading averages based on incompatible configurations.

If insufficient genuine marketplace data exists, display an appropriate insufficient-data state.

Never fabricate market statistics, historical sales or price movements.

## 14. Interactive laptop finder

Create a guided laptop recommendation experience.

Provide a Find My Laptop action on the homepage.

Use a multi-step questionnaire:

### Step 1: Budget

Select a maximum budget or price range.

### Step 2: Intended use

- Office
- University
- Programming
- Engineering
- Gaming
- Video editing
- Graphic design
- Everyday use

### Step 3: Preferences

- Brand
- Portability
- Screen size
- Touchscreen
- Battery priorities
- Performance priorities

### Step 4: Recommendations

Recommend suitable laptops from current marketplace inventory.

Each recommendation must explain:

- Why the laptop fits
- Relevant specifications
- Important trade-offs
- Price
- Condition
- Verification status

Allow users to modify their answers without restarting the entire questionnaire.

Begin with transparent rules-based recommendations.

AI integration may be introduced later if useful.

## 15. Redesign the seller onboarding experience

Selling a laptop should feel straightforward.

Reduce friction without sacrificing listing quality or fraud prevention.

Create a guided multi-step listing wizard.

Include:

- Visible progress indicator
- Automatic draft saving
- Previous and next navigation
- Clear validation messages
- Helpful examples
- Conditional form fields
- Listing preview
- Mobile-friendly input controls

### Step 1: Identify your laptop

Provide searchable brand, series and model selectors.

Where reliable reference specifications exist, prefill appropriate suggested values but allow the seller to confirm or correct them.

### Step 2: Add specifications

Use understandable fields and explanations.

Help sellers locate their processor, RAM and storage information.

### Step 3: Condition and defects

Guide sellers through condition assessment.

Provide optional help explaining battery health and common laptop faults.

### Step 4: Upload photographs

Implement:

- Drag and drop
- Mobile camera upload
- Image previews
- Upload progress
- Reordering
- Cover photo selection
- Image deletion
- Image compression
- Clear file validation

### Step 5: Set your price

Show relevant comparable asking prices if enough reliable data exists.

Display pricing guidance without guaranteeing a sale.

### Step 6: Location and selling preferences

Include:

- General location
- Negotiable price
- Delivery options
- Inspection preference
- Safe meeting preference

### Step 7: Review and submit

Provide a live preview showing exactly how the listing will appear to buyers.

Display clear publication and moderation status.

Do not force sellers through unnecessary fields that are irrelevant to their listing.

## 16. Improve messaging and negotiation

Create a modern messaging experience comparable to established marketplace applications.

### Desktop

Use a split layout containing:

- Conversation list
- Active conversation
- Related laptop information

### Mobile

Use dedicated conversation list and conversation detail screens.

### Messaging features

- Real-time updates where infrastructure supports them
- Unread indicators
- Conversation search
- Message timestamps
- Image attachments where safe
- Quick replies
- Offer cards
- Block and report
- Delivery and read status where reliable

Suggested quick replies:

- Is this laptop still available?
- What is your best price?
- What is the battery health?
- Can I inspect the laptop?
- Where are you located?
- Does it come with a charger?

### Offer interaction

Create structured offer cards showing:

- Listed price
- Offered price
- Offer status
- Counteroffer
- Accept
- Decline

Prevent duplicate or conflicting acceptance.

Clearly distinguish accepted offers from paid or completed transactions.

## 17. Favourites, saved searches and notifications

Create a polished personal discovery experience.

Users should be able to:

- Save laptops
- Remove favourites
- Save searches
- Save preferred filters
- Follow dealers where implemented
- Receive price-drop notifications
- Receive notifications for matching new listings

Example saved search:

HP EliteBook, 16GB RAM, under KSh 35,000, Nairobi.

Allow users to configure notification frequency and opt out.

Use real backend events for notifications.

Do not simulate price drops or create fake alerts.

## 18. Improve Tech Sokoni Trust

Make trust and verification visible throughout the interface without cluttering every page.

Clearly distinguish:

- Phone verified
- Identity verified
- Business verified
- Physically inspected laptop
- Sponsored listing

Each badge must have an accessible explanation.

Do not display verification statuses unless the corresponding process has genuinely been completed.

### Inspection booking

Create an intuitive inspection booking experience with:

- Laptop selection
- Inspection package
- Service description
- Available location
- Available date and time
- Transparent fee
- Booking confirmation
- Booking reference
- Appointment tracking

### Digital inspection certificate

Redesign the inspection certificate to feel professional and credible.

Include:

- Laptop identity
- Inspection date
- Verified specifications
- Battery health
- Storage health
- Component tests
- Physical condition
- Known defects
- Certificate status
- QR verification
- Inspection limitations

Provide public certificate verification without exposing sensitive personal data or full serial numbers.

## 19. Improve user dashboards

Redesign buyer, seller, dealer and inspector dashboards.

Avoid generic administration templates that simply display random charts and statistics.

### Seller dashboard

Prioritise practical actions:

- Create listing
- Manage active listings
- Respond to enquiries
- Review offers
- Mark laptop sold
- Edit price
- Book inspection
- Promote listing
- View listing performance

Display genuine metrics such as:

- Listing views
- Favourites
- Enquiries
- Offers
- Active listings
- Recorded sales

### Buyer dashboard

Focus on:

- Saved laptops
- Recent searches
- Messages
- Offers
- Inspection bookings
- Notifications
- Account settings

### Dealer dashboard

Include:

- Inventory overview
- Storefront management
- Listing performance
- Enquiry management
- Subscription information
- Promotion management
- Business verification

All statistics must originate from genuine application records.

## 20. Improve monetisation user experience

Create professional, transparent interfaces for paid services.

Include:

- Listing promotions
- Featured listings
- Dealer subscriptions
- Inspection packages
- Consignment services

### Listing promotion interface

Allow sellers to understand:

- Available promotion options
- Promotion duration
- Placement
- Price
- Start and end dates

Do not promise a guaranteed sale or fabricate potential view counts.

### Dealer subscription interface

Build a clean subscription comparison experience.

Clearly explain:

- Listing allowances
- Storefront features
- Analytics
- Promotion benefits
- Monthly prices
- Renewal terms

All prices and package limits must come from configurable backend settings.

Do not hardcode fees throughout multiple frontend pages.

Keep paid activation disabled until the relevant payment services are configured.

## 21. Interactive microanimations

Add high-quality microinteractions throughout the marketplace.

Use Framer Motion, CSS transitions or the existing motion library where appropriate.

Implement:

- Subtle button feedback
- Product card hover transitions
- Favourite toggle animations
- Filter selection transitions
- Smooth accordion expansion
- Dialog entrance and exit
- Bottom-sheet transitions
- Image gallery transitions
- Comparison tray animation
- Progress indicator transitions
- Toast notifications
- Skeleton loaders
- Optimistic UI for suitable reversible actions

Animation must serve a purpose.

Use fast, natural transitions, generally around 120–250 milliseconds for ordinary interactions.

Avoid:

- Slow page entrance animations
- Constant floating effects
- Unnecessary parallax
- Dramatic card movement
- Animating every heading
- Layout shifts during loading
- Animation that delays essential actions

Respect prefers-reduced-motion.

Ensure the website remains smooth on lower-powered mobile devices.

## 22. Mobile-first optimisation

Treat the mobile website as a primary product, not a reduced version of the desktop experience.

Test at representative widths including:

- 320px
- 360px
- 390px
- 430px
- 768px
- 1024px
- 1440px

Ensure:

- No unintended horizontal scrolling
- Readable typography
- Appropriate touch target sizes
- Comfortable form controls
- Accessible mobile filters
- Swipe-enabled galleries
- Functional mobile navigation
- Proper keyboard behaviour
- Responsive tables
- Sticky actions that do not cover content
- Reliable image uploads from mobile cameras

Consider users with slower internet connections and low-cost Android devices.

Optimise image sizes and avoid unnecessary JavaScript.

## 23. Progressive Web App experience

Where appropriate, prepare the marketplace to function as an installable Progressive Web App.

Consider:

- Web app manifest
- Appropriate application icons
- Installable experience
- Standalone display mode
- Offline fallback page
- Carefully controlled public asset caching
- Push notifications where supported and explicitly enabled

Do not cache sensitive private information, payment details or authenticated messages in unsafe offline storage.

Ensure marketplace inventory is not incorrectly presented as currently available when cached data is stale.

Do not interrupt visitors with aggressive installation prompts.

## 24. Accessibility and usability

Target WCAG 2.2 AA wherever practical.

Implement:

- Semantic HTML
- Visible focus indicators
- Keyboard navigation
- Accessible dialogs
- Correct form labels
- Accessible validation messages
- Appropriate colour contrast
- Meaningful image descriptions
- Screen-reader announcements
- Reduced-motion support
- Logical focus management
- Accessible filter controls

Do not rely solely on colour to communicate verification or error status.

## 25. Performance requirements

Maintain fast loading times despite the improved visual design.

Optimise:

- Images
- Font loading
- JavaScript bundles
- Server-side queries
- Rendering strategies
- Pagination
- Search requests
- Caching
- Component reuse

Use image placeholders and skeletons with reserved dimensions to prevent layout shifts.

Target good Core Web Vitals, including:

- LCP of 2.5 seconds or less
- INP of 200 milliseconds or less
- CLS of 0.1 or less

Measure these where supported rather than claiming success without evidence.

Do not sacrifice performance for unnecessary visual effects.

## 26. Functional interaction requirements

Every visible action must work correctly.

Do not create buttons merely for visual presentation.

Verify that:

- Search returns relevant listings.
- Filters update results correctly.
- Sorting works.
- Product cards open the correct listing.
- Favourites persist.
- Comparison works.
- Seller profiles display the correct information.
- Messages reach authorised recipients.
- Offers update correctly.
- Listing forms save correctly.
- Drafts persist.
- Image uploads work.
- Inspection booking uses actual availability.
- Notifications reflect real events.
- Mobile menus close correctly.
- Back navigation preserves user context.

Where functionality depends on unavailable services, provide a clear disabled or unavailable state.

Never misrepresent an unfinished feature as operational.

## 27. Product analytics

Introduce privacy-conscious analytics for important marketplace interactions.

Track appropriate events such as:

- Search performed
- Filter applied
- Listing viewed
- Listing saved
- Comparison started
- Seller contacted
- Offer submitted
- Inspection requested
- Listing creation started
- Listing submitted
- Listing published

Use these events to identify friction and improve conversion rates.

Do not include sensitive message contents, identity documents or private information in analytics payloads.

## 28. Testing and visual quality assurance

Use Playwright or equivalent browser testing tools.

Capture before-and-after screenshots of:

- Homepage
- Marketplace search results
- Product details
- Seller profile
- Dealer storefront
- Seller listing wizard
- Messaging
- Buyer dashboard
- Seller dashboard
- Inspection booking
- Mobile navigation

Test representative desktop and mobile viewport sizes.

Check:

- Visual consistency
- Responsive behaviour
- Typography
- Spacing
- Alignment
- Contrast
- Image presentation
- Overflow
- Form behaviour
- Error handling
- Loading states
- Interaction responsiveness

Run:

- Linting
- TypeScript checks
- Unit tests
- Integration tests
- End-to-end tests
- Production build

Fix regressions introduced by the redesign.

Do not claim that a page has been visually tested if no browser inspection or screenshot was performed.

## 29. Implementation priority

Implement in the following order.

### Stage 1: Visual foundation

- Existing application audit
- Competitor analysis
- Design system
- Typography and colours
- Reusable components
- Header and navigation
- Mobile navigation

### Stage 2: Core marketplace redesign

- Homepage
- Product listing cards
- Search and filter experience
- Product details page
- Responsive layouts
- Image galleries
- Favourites

### Stage 3: Buyer and seller experience

- Listing creation wizard
- Seller profiles
- Dealer directory
- Dealer storefronts
- Messaging
- Negotiation
- Product comparison

### Stage 4: Trust and monetisation

- Verification presentation
- Inspection booking
- Inspection certificates
- Promotion interfaces
- Dealer subscriptions
- Consignment experience

### Stage 5: Advanced discovery

- Market Insights
- Laptop Finder
- Saved searches
- Price-drop notifications
- Personalised recommendations
- Progressive Web App capabilities

### Stage 6: Final quality assurance

- Performance optimisation
- Accessibility
- Cross-device testing
- Security review
- Visual regression checks
- Production build validation

Complete each stage incrementally.

Do not attempt to create every advanced feature at the expense of the core user experience.

## 30. Documentation and continuity

Update existing documentation, including:

- AGENTS.md
- docs/DESIGN_SYSTEM.md
- docs/UI_UX_AUDIT.md
- docs/IMPLEMENTATION_STATUS.md
- docs/ROADMAP.md
- docs/ARCHITECTURE.md
- CHANGELOG.md

Create docs/COMPETITOR_ANALYSIS.md documenting the useful design patterns discovered during research.

Maintain a clear record of:

- Completed redesigns
- Components created
- Features improved
- Remaining work
- Known limitations
- Database changes
- Test results
- Design decisions
- Screenshot locations
- Exact next implementation steps

Ensure another Codex session can continue development without repeating the entire audit.

## 31. Final execution instructions

Start by opening and reviewing the current application.

Research the reference websites.

Capture screenshots of the existing interface.

Identify the most serious visual and usability problems.

Establish the improved design system.

Begin implementing the redesign immediately.

Do not stop after giving me a design proposal.

Do not rebuild working backend functionality unnecessarily.

Do not replace real data with mock data.

Do not deploy publicly or modify production infrastructure without my approval.

After each implementation stage, provide:

1. What was improved.
2. Which files were modified.
3. Which features are working.
4. Before-and-after screenshots where available.
5. Desktop and mobile preview details.
6. Test results.
7. Known issues.
8. Remaining work.
9. Exact next implementation step.

The final application should feel like a serious, established Kenyan marketplace capable of competing with major classifieds platforms.

The experience should be fast, visually sophisticated, interactive, intuitive and trustworthy.

Prioritise real functionality, design quality and user experience over the number of features implemented.

Begin the audit and implementation now.