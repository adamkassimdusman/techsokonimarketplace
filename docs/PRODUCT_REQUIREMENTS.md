# MASTER DEVELOPMENT PROMPT — TECH SOKONI MARKETPLACE

## 1. Role and responsibilities

Act as my senior full-stack software engineer, software architect, UI/UX designer, database architect, cybersecurity engineer and product development lead.

Your responsibility is to design, develop, test and prepare for deployment a production-quality, scalable, mobile-first laptop marketplace targeting the Kenyan market, with the ability to expand across East Africa.

Do not build a generic e-commerce template. Build a distinctive, trustworthy, modern marketplace with real functionality, a reliable backend and a premium user experience.

Work autonomously within the approved development scope. Make sensible technical decisions, document them, and do not stop at creating a development plan. Begin implementation.

## 2. Project overview

**Project name:** Tech Sokoni Marketplace

**Parent brand:** Tech Sokoni

**Existing website:** https://www.techsokoni.com

**Proposed marketplace domain:** market.techsokoni.com

**Primary market:** Kenya

**Initial launch location:** Nairobi

**Currency:** Kenyan Shillings (KES)

**Slogan:** Buy with confidence. Sell with trust.

Tech Sokoni Marketplace is a specialised peer-to-peer and business-to-consumer marketplace where individuals, laptop dealers, businesses and organisations can list laptops for sale and interested buyers can discover, compare, inspect and purchase them.

The concept is similar to Jiji but exclusively focused on laptops and supported by professional verification, transparent technical specifications, seller reputation, secure transactions and technical expertise.

The platform's primary competitive advantage must be trust.

## 3. Core business objectives

Build a platform that:

- Allows individuals to sell their used laptops.
- Allows laptop dealers to create digital storefronts.
- Helps buyers discover laptops matching their budgets and requirements.
- Reduces fraudulent listings and misleading specifications.
- Facilitates professional laptop inspections.
- Provides a safe environment for buyers and sellers to transact.
- Generates revenue without Tech Sokoni purchasing every laptop in advance.
- Supports future expansion into desktops, monitors, accessories and other electronics.
- Establishes Tech Sokoni as a trusted technology marketplace in Kenya.

## 4. Existing website and brand integration

Before writing code:

1. Inspect the existing repository and development environment.
2. Review https://www.techsokoni.com where accessible.
3. Identify the current brand colours, typography, spacing, logo, design language and component styling.
4. Use these elements to create a consistent but distinctive marketplace experience.
5. Determine whether the marketplace should share services with the existing store or operate independently.

Do not modify, delete or break the existing Tech Sokoni retail website.

If starting from an existing repository, understand its architecture before making changes.

Keep Tech Sokoni-owned inventory clearly distinguishable from third-party seller inventory.

## 5. Recommended technology stack

Use the existing project stack if it is suitable. Otherwise, consider:

**Frontend**

- Next.js with App Router
- TypeScript in strict mode
- Tailwind CSS
- shadcn/ui or accessible custom components
- Framer Motion or lightweight motion utilities

**Backend**

- Next.js server-side APIs and server actions
- PostgreSQL
- Supabase for database, authentication and storage where appropriate
- Zod for input validation

**Infrastructure**

- Vercel for application deployment
- Supabase Storage or an appropriate object-storage provider
- PostgreSQL full-text search initially
- Resend or an equivalent transactional email provider
- A rate-limiting solution
- Error monitoring and structured application logging

**Future integrations**

- M-Pesa Daraja API
- Appropriately authorised payment providers supporting marketplace settlement
- SMS and WhatsApp notifications
- AI-powered laptop recommendations
- AI-powered pricing estimates

Prioritise affordability, maintainability, security and scalability.

Verify compatibility of dependencies against their current official documentation.

Do not unnecessarily overengineer the initial application.

## 6. UI/UX design requirements

Create a premium, professional, modern marketplace interface.

Take inspiration from the usability of:

- Jiji
- Back Market
- Swappa
- Amazon
- Airbnb
- eBay

Do not directly copy any competitor's design.

The website should feel like a professionally designed technology marketplace, not an AI-generated website template.

### Design principles

- Mobile-first responsive layouts.
- Clean typography.
- Consistent design system.
- Strong visual hierarchy.
- High-quality product photography.
- Professional laptop listing cards.
- Minimal but purposeful animations.
- Fast page transitions.
- Skeleton loading states.
- Accessible colour contrast.
- Clear calls to action.
- Meaningful empty states.
- Functional error and success messages.
- Dark mode if it fits the existing Tech Sokoni brand.
- No excessive gradients, unnecessary glassmorphism or decorative clutter.
- Avoid oversized hero sections that hide the actual marketplace inventory.

Design for Kenyan users accessing the platform through affordable smartphones and limited mobile data.

Optimise images, scripts and loading performance accordingly.

## 7. User roles and permissions

Implement role-based access control.

### Guest

- Browse laptop listings.
- Search and filter.
- View public seller profiles.
- Compare laptops.
- View inspection certificates.
- Register or sign in.

### Registered buyer

- Save favourite laptops.
- Contact sellers.
- Make offers.
- Book inspections.
- Report suspicious listings.
- Manage enquiries.
- Submit eligible reviews.
- Create laptop requests in a later phase.
- Purchase through protected checkout when available.

### Individual seller

- Create and manage listings.
- Upload real laptop photographs.
- Receive enquiries and offers.
- Schedule inspections.
- Manage listing status.
- View basic analytics.
- Request consignment services.

### Dealer

- Create a business storefront.
- Manage multiple laptop listings.
- Manage inventory.
- View customer enquiries.
- Access advanced analytics based on subscription.
- Manage business verification.
- Purchase promotional services.

### Inspector

- View assigned inspection appointments.
- Record inspection results.
- Upload supporting photographs.
- Document faults.
- Generate inspection certificates.
- Submit reports for approval.

### Administrator

- Manage users.
- Moderate listings.
- Review seller verification.
- Manage inspections.
- Manage reports and disputes.
- Configure fees.
- Monitor marketplace activity.
- Manage subscriptions.
- Review audit logs.

### Super administrator

- Manage administrative roles.
- Configure platform-wide settings.
- Control sensitive operations.
- Manage security and permissions.
- Review financial records.

Users may act as both buyers and sellers without needing separate accounts.

Enforce permissions on the server and database, not merely by hiding frontend elements.

## 8. Homepage

Create a high-converting marketplace homepage.

### Navigation

- Tech Sokoni Marketplace logo
- Search bar
- Browse Laptops
- Sell a Laptop
- Verified Laptops
- Dealers
- How It Works
- Favourites
- Messages
- Notifications
- Account
- Prominent Sell Your Laptop button

### Hero section

Headline:

**Find your next laptop. Sell your old one. Trade with confidence.**

Supporting text:

Discover laptops from individuals and trusted dealers across Kenya. Compare specifications, verify condition and buy with confidence.

Primary CTA: Browse Laptops

Secondary CTA: Sell Your Laptop

Include an intelligent search field supporting queries such as:

- HP EliteBook under 35K
- Lenovo ThinkPad 16GB RAM
- Laptop for engineering
- Dell Core i7 in Nairobi

Use conventional search and structured filters initially. Implement genuinely functional AI-assisted search in a later phase.

### Homepage sections

- Browse by brand
- Browse by budget
- Browse by intended use
- Recently listed laptops
- Physically verified laptops
- Featured listings
- Recommended laptops
- Verified dealers
- How Tech Sokoni verification works
- Sell your unused laptop
- Buyer and seller safety information
- Frequently asked questions
- Educational articles
- Footer

### Browse by budget

- Under KSh 20,000
- KSh 20,000–30,000
- KSh 30,000–50,000
- KSh 50,000–75,000
- KSh 75,000–100,000
- Above KSh 100,000

### Browse by use

- Students
- Office work
- Programming
- Engineering
- Architecture
- Graphic design
- Video editing
- Gaming
- Forex trading
- Remote work
- Business professionals

## 9. Laptop marketplace and search

Build a comprehensive marketplace browsing experience.

Implement functional filters for:

- Brand
- Model
- Price range
- Processor manufacturer
- Exact processor model
- Processor generation where applicable
- RAM capacity
- Storage capacity
- Storage type
- Graphics card
- Dedicated GPU memory
- Screen size
- Screen resolution
- Touchscreen
- Convertible or x360
- Laptop condition
- Battery health
- Warranty availability
- Seller type
- Verification status
- County
- Town
- Delivery availability

Support multiple filters simultaneously.

Persist filters in URL query parameters so filtered search results can be shared.

### Sorting

- Recently listed
- Lowest price
- Highest price
- Relevance
- Most viewed
- Physically verified
- Best value when sufficient reliable pricing data exists

Include pagination or accessible incremental loading.

Ensure search and filtering are performed efficiently on the server.

## 10. Laptop listing cards

Each listing card should display:

- Actual laptop photograph
- Brand and model
- Selling price in KES
- Processor
- RAM
- Storage
- Condition
- Location
- Seller type
- Verification status
- Warranty, where available
- Battery health, where verified or declared
- Favourite button
- Compare button
- Featured label where applicable
- Listing date or relative listing age

Clearly distinguish seller-provided specifications from independently verified specifications.

Never display fake verification badges, ratings, discounts or product availability.

## 11. Individual product page

Create a comprehensive laptop details page.

Include:

- Image gallery
- Image zoom
- Laptop title
- Selling price
- Negotiable or fixed price indicator
- Full technical specifications
- Condition description
- Declared faults
- Battery information
- Warranty information
- Inspection certificate where available
- Seller information
- Seller reputation
- Seller verification status
- Location
- Delivery information
- Similar laptops
- Safety recommendations

### Buyer actions

- Contact Seller
- Make an Offer
- Book Inspection
- Save Laptop
- Compare
- Report Listing
- Buy Securely, only when protected payments are operational

Where an integration is unavailable, use an honest coming-soon state rather than simulating functionality.

## 12. Seller listing creation workflow

Create a multi-step listing wizard.

### Step 1: Laptop identification

- Brand
- Product family
- Model
- Model number
- Serial number, private and restricted
- Manufacture year, if known

Support common laptop product families such as HP EliteBook, HP ProBook, HP ZBook, Lenovo ThinkPad, Lenovo Yoga, Dell Latitude, Dell Precision, Apple MacBook, ASUS and Acer.

### Step 2: Technical specifications

- Exact CPU model
- RAM
- RAM upgradeability, if known
- SSD or HDD
- Storage capacity
- Dedicated GPU
- GPU memory
- Screen size
- Screen resolution
- Touchscreen
- Operating system
- Battery health, if available
- Battery cycle count, if available
- Charger availability

### Step 3: Condition

- Brand new
- Refurbished
- Ex-UK or imported used
- Locally used
- For parts or repair

These classifications should not substitute for a detailed condition assessment.

Require sellers to disclose:

- Scratches
- Dents
- Screen defects
- Keyboard defects
- Battery problems
- Charging problems
- Missing components
- Previous repairs
- BIOS locks
- Corporate device management locks
- Any other known issues

### Step 4: Photographs

Allow approximately 5–10 photographs per listing.

Encourage photographs of:

- Front
- Back
- Screen powered on
- Keyboard
- Ports
- Physical defects
- Charger
- System specifications

Require actual device photographs for used laptops.

Remove unnecessary image metadata, validate file types, restrict file sizes and optimise uploaded images.

Warn users not to upload documents or images exposing private information.

### Step 5: Pricing and location

- Selling price
- Negotiable or fixed price
- County
- Town
- General pickup location
- Delivery availability

Never require sellers to expose their private residential address publicly.

### Step 6: Ownership declaration

Require sellers to confirm:

- They legally own the laptop or are authorised to sell it.
- The laptop is not knowingly stolen.
- The information provided is accurate.
- Known faults have been disclosed.
- They accept the marketplace terms.

### Step 7: Preview and publish

Allow sellers to preview and edit their listing before submitting it.

Support listing states:

- Draft
- Pending review
- Published
- Reserved
- Sold
- Rejected
- Suspended
- Expired
- Archived

Use appropriate moderation workflows before publication.

## 13. Trust and verification system

This is the most important component of the marketplace.

Develop a system called **Tech Sokoni Trust**.

### Phone verification

Confirm phone ownership through a legitimate OTP provider when available.

Do not represent ordinary registration as successful phone verification.

### Verified seller

Support:

- Identity verification
- Business registration verification
- Physical shop verification where appropriate
- Administrative review
- Verification approval or rejection
- Verification expiry and revocation

Keep identity documents private.

Implement strict access controls, limited retention, administrative audit logging and appropriate encryption.

Where possible, use a suitable identity verification provider instead of storing raw identity documents.

### Physically verified laptop

A laptop receives this status only after a genuine physical inspection by an authorised inspector.

Verification must never be automatically awarded because someone pays a fee.

Verification states should include:

- Not inspected
- Inspection requested
- Inspection scheduled
- Inspection in progress
- Inspection passed
- Inspection failed
- Inspection expired
- Reinspection required

Material changes to a verified listing must trigger an appropriate review or reinspection.

## 14. Laptop inspection management

Create an inspection booking and management system.

### Booking process

1. Buyer or seller selects a laptop.
2. User chooses an available inspection location and time.
3. User submits an inspection request.
4. Administrator assigns an inspector.
5. Inspector conducts the assessment.
6. Inspector records findings.
7. Report is reviewed and published.
8. Buyer and seller receive appropriate notifications.

### Inspection checklist

- Confirm model and serial number
- Verify processor
- Verify RAM
- Verify storage capacity
- Storage health
- Battery design capacity
- Battery full charge capacity
- Battery cycle count
- Battery health percentage
- Screen condition
- Dead pixels and display defects
- Touchscreen functionality
- Keyboard
- Touchpad
- Webcam
- Microphone
- Speakers
- Wi-Fi
- Bluetooth
- USB ports
- USB-C ports
- HDMI or DisplayPort
- Charging port
- Charger
- Hinges
- Physical condition
- BIOS password status
- Corporate management restrictions
- Ownership evidence
- Signs of previous repairs
- Thermal performance where practical
- Other disclosed faults

Support Pass, Fail, Not Tested and Not Applicable responses.

Calculate battery health using full charge capacity divided by design capacity multiplied by 100 where reliable measurements are available.

Document testing limitations.

### Digital inspection certificate

Generate a unique inspection certificate containing:

- Certificate ID
- Laptop brand and model
- Verified specifications
- Battery assessment
- Physical condition
- Inspection results
- Disclosed faults
- Inspector reference
- Inspection date
- Validity status
- QR code
- Public certificate verification URL

Mask sensitive serial-number information in public certificates.

Certificates must be stored in the database and must not be merely static images.

Allow administrators to revoke invalid or outdated certificates.

Clearly communicate that inspection reflects the device's condition at the time of testing and does not guarantee future reliability or legal ownership.

## 15. Safe meeting and transaction centre

Allow buyers and sellers to arrange transactions at an approved Tech Sokoni location.

Features:

- Book a safe meeting
- Select an available location
- Choose appointment date and time
- Notify both parties
- Generate booking reference
- Track appointment status
- Confirm transaction completion

Allow administrators to configure office locations and operating hours.

Do not hardcode an unconfirmed office address.

Provide optional laptop inspection during appointments.

## 16. Buyer and seller messaging

Build an internal messaging system.

Features:

- Conversations associated with listings
- Buyer-to-seller communication
- Offer negotiation
- Unread message indicators
- Message timestamps
- Block user
- Report conversation
- Appropriate spam protection
- Rate limiting
- Notification preferences

Automatically display transaction safety reminders when appropriate.

Warn against advance payments to unknown sellers, sharing OTPs and accepting fake payment confirmation messages.

Do not expose private phone numbers without the account owner's permission.

## 17. Offers and negotiation

Allow buyers to submit a price offer.

Example:

Listed price: KSh 40,000

Buyer offer: KSh 36,000

Seller may:

- Accept
- Reject
- Counteroffer

Maintain offer history and expiry dates.

Accepted offers must not automatically be treated as paid transactions.

Implement safeguards against duplicate acceptance and conflicting reservations.

## 18. Seller reputation

Build a transparent reputation system.

Display:

- Account creation date
- Verified identity status
- Business verification status
- Completed transactions recorded by the platform
- Customer ratings
- Eligible customer reviews
- Response rate
- Average response time, when sufficient data exists

Only eligible completed transactions should generate purchase reviews.

Implement review reporting, moderation and safeguards against self-reviews and fraudulent ratings.

Do not fabricate ratings for new sellers.

## 19. Revenue and monetisation system

Design the database and application architecture to support the following revenue streams.

All prices must be editable through the admin dashboard.

### Free listings

Allow individual sellers to publish a configurable number of basic listings for free.

### Featured listings

Suggested introductory pricing:

- Seven-day listing boost: KSh 200
- Premium homepage placement: KSh 500
- Urgent sale promotion: configurable

Clearly label paid promotional placement.

Do not allow payments to influence independent verification outcomes.

### Laptop inspections

Suggested starting fees:

- Basic inspection: KSh 500
- Comprehensive inspection: KSh 1,000

Allow administrators to configure inspection packages and their scope.

### Protected transaction commission

Future starting commission: 4% of the completed laptop transaction value.

Allow configuration of:

- Percentage commission
- Fixed fees
- Minimum commission
- Maximum commission
- Buyer-paid or seller-paid fees
- Promotional discounts

Display all applicable fees before transaction confirmation.

### Dealer subscriptions

**Free plan — KSh 0 per month**

- Five active listings
- Basic seller profile
- Standard enquiries

**Business plan — KSh 1,500 per month**

- Fifty active listings
- Dealer storefront
- Basic analytics
- Three monthly listing boosts

**Premium plan — KSh 3,500 per month**

- Configurable higher listing limits
- Advanced analytics
- Priority support
- Ten monthly listing boosts

Subscription limits and benefits must be configurable.

Support promotional free trials.

### Consignment services

Allow sellers to request that Tech Sokoni sell their laptops on their behalf.

Suggested commission: 5–10%.

Workflow:

- Submit consignment request
- Review laptop details
- Arrange physical inspection
- Agree on selling price
- Sign or accept a consignment agreement
- Record inventory custody
- Publish listing
- Complete sale
- Calculate seller payout

### Delivery coordination

Support configurable delivery service charges and margins.

Clearly disclose delivery costs before confirmation.

## 20. Protected payments — future phase

Architect the application to support secure marketplace payments.

Potential future integrations include M-Pesa and appropriately authorised marketplace payment providers.

The proposed protected purchase workflow is:

1. Buyer initiates a purchase.
2. Order and applicable fees are calculated.
3. Buyer pays through an appropriate payment partner.
4. Payment is independently confirmed using authenticated provider callbacks.
5. Laptop is inspected where required.
6. Laptop is delivered or collected.
7. Buyer accepts the device or raises a dispute within the agreed period.
8. Payment partner settles funds according to the agreed transaction terms.

Important:

- Do not implement an unlicensed escrow wallet.
- Do not hold customer funds directly in an ordinary Tech Sokoni account as an escrow service.
- Do not implement real fund custody until the legal requirements and provider capabilities are confirmed.
- Never mark a payment as successful based only on a frontend response or uploaded payment screenshot.
- Verify webhook authenticity.
- Implement idempotency.
- Prevent duplicate payment processing.
- Maintain an auditable transaction ledger.
- Use accurate monetary calculations with integer minor units or suitable decimal types.
- Separate sandbox and production environments.
- Never expose payment secrets to the client.

Keep protected checkout disabled behind a feature flag until it is genuinely operational and approved.

## 21. Buyer request marketplace

Design for a future feature allowing buyers to post laptop requirements.

Example:

- Budget: KSh 30,000–40,000
- Intended use: Programming
- Minimum RAM: 16GB
- Minimum storage: 256GB SSD
- Preferred brands: HP or Lenovo
- Location: Nairobi

Sellers can submit relevant offers.

Include request expiry, moderation, spam prevention and seller eligibility rules.

## 22. AI-powered features — future phase

Prepare the architecture for the following features without making them dependencies of the MVP.

### AI laptop finder

Recommend laptops from actual available marketplace inventory based on:

- Budget
- Intended use
- Portability
- Battery requirements
- Software requirements
- Performance needs
- Preferred brands

Provide understandable recommendation reasons and important trade-offs.

### AI price estimator

Estimate reasonable laptop pricing using:

- Comparable listings
- Historical completed transactions where available
- Processor model
- RAM
- Storage
- Physical condition
- Battery condition
- Device age
- Warranty

Clearly distinguish estimated prices from confirmed market data.

### AI listing assistant

Help sellers:

- Improve listing titles
- Format technical specifications
- Write accurate descriptions
- Identify missing information

Never invent specifications or hide known defects.

### AI fraud detection

Identify listings for human review based on:

- Suspicious pricing
- Duplicate photographs
- Repeated serial-number submissions
- Unusual posting activity
- Inconsistent specifications
- Previous confirmed policy violations

Do not automatically accuse sellers of fraud solely because an AI system flags them.

Treat all user-generated content as untrusted input and defend AI integrations against prompt injection.

## 23. User dashboards

### Buyer dashboard

- Saved laptops
- Recent searches
- Conversations
- Submitted offers
- Inspection appointments
- Orders when available
- Notifications
- Reviews
- Account settings

### Seller dashboard

- Active listings
- Draft listings
- Pending listings
- Sold laptops
- Listing views
- Customer enquiries
- Offers
- Inspection requests
- Promotional purchases
- Seller profile
- Verification status

### Dealer dashboard

- Inventory management
- Storefront management
- Bulk listing uploads in a later phase
- Sales analytics
- Subscription management
- Listing performance
- Customer enquiries
- Business verification

### Inspector dashboard

- Assigned inspections
- Upcoming appointments
- Completed inspections
- Inspection checklist
- Report submission
- Certificate status

## 24. Admin dashboard

Create a comprehensive, protected admin dashboard.

### Overview

Show real database-derived metrics:

- Total registered users
- Active buyers
- Active sellers
- Verified sellers
- Active listings
- Pending listings
- Sold laptops
- Completed inspections
- Pending inspections
- Reported listings
- Active dealers
- Revenue where payment records exist

### Management modules

- User management
- Seller management
- Dealer management
- Listing moderation
- Inspection management
- Certificate management
- Appointment management
- Reports and complaints
- Disputes
- Subscription management
- Featured listings
- Revenue records
- Payment records
- Categories and brands
- Platform settings
- Notification templates
- Audit logs

Provide pagination, search, filters, status updates and appropriate export functionality.

Require additional confirmation for destructive or financially sensitive operations.

Record important administrative actions in audit logs.

## 25. Database architecture

Create a properly normalised PostgreSQL database.

Consider entities for:

- Users
- Profiles
- Roles
- User roles
- Seller profiles
- Dealer storefronts
- Seller verifications
- Brands
- Laptop families
- Laptop models
- Listings
- Listing specifications
- Listing images
- Listing status history
- Favourites
- Comparisons
- Conversations
- Conversation participants
- Messages
- Offers
- Inspection packages
- Inspection appointments
- Inspection reports
- Inspection checklist results
- Inspection certificates
- Safe meeting appointments
- Reviews
- Buyer requests
- Buyer request offers
- Subscription plans
- Subscriptions
- Listing promotions
- Consignment requests
- Orders
- Payment transactions
- Payout records
- Refund records
- Disputes
- Reports
- Notifications
- Platform settings
- Audit logs

Create database migrations, foreign keys, constraints, indexes and appropriate uniqueness rules.

Use row-level security if supported by the selected architecture.

Design for reliable transactions, concurrency and clear ownership of records.

Do not create unnecessary tables for features that have not yet been implemented; document the future schema as part of the architecture.

## 26. Security requirements

Treat security as a core product requirement.

Implement:

- Secure authentication
- Server-side authorisation
- Role-based access control
- Database access policies
- Input validation
- Output escaping
- CSRF protection where applicable
- XSS protection
- SQL injection prevention
- Rate limiting
- Secure session handling
- Password reset functionality
- Secure file uploads
- Private storage for sensitive documents
- Webhook verification
- Environment variable management
- Audit logging
- Administrative MFA where supported
- Dependency vulnerability checks
- Protection against broken object-level authorisation
- Secure HTTP headers
- Appropriate content security policies

Never trust permissions, prices, verification states or user roles supplied by the frontend.

Never commit passwords, API keys, service credentials or production secrets into source control.

Do not expose service-role database credentials in frontend code.

Do not log national IDs, access tokens, payment secrets or sensitive personal data.

## 27. Kenyan compliance considerations

Design with Kenya's regulatory environment in mind, including:

- Data Protection Act, 2019
- Applicable ODPC requirements
- Consumer protection obligations
- Electronic transaction requirements
- Marketplace terms and conditions
- Seller ownership declarations
- Privacy policies
- Payment services regulations
- Tax and record-keeping obligations

Verify applicable current legal requirements before enabling regulated features.

Do not claim that the platform is legally compliant simply because these features are implemented.

Prepare draft pages for:

- Terms and Conditions
- Privacy Policy
- Seller Agreement
- Buyer Protection Policy
- Listing Policy
- Prohibited Items Policy
- Refund and Dispute Policy
- Inspection Terms
- Community Guidelines

Mark legal documents as requiring professional review before public launch.

## 28. SEO and discoverability

Implement strong technical SEO.

Features:

- Server-rendered public listing pages
- Dynamic page titles
- Meta descriptions
- Canonical URLs
- Open Graph metadata
- Social media sharing previews
- XML sitemap
- Robots configuration
- Breadcrumbs
- Relevant structured data
- Product and offer schema where eligible
- Clean listing slugs
- Brand landing pages
- Location landing pages where sufficient genuine inventory exists

Example URLs:

- /marketplace
- /laptops/hp
- /laptops/lenovo
- /laptops/dell
- /laptops/nairobi
- /laptop/hp-elitebook-840-g8-unique-id
- /dealers/store-name
- /verify/certificate-id

Prevent indexing of private dashboards, internal search spam, draft listings and sensitive information.

Do not generate fake reviews or inaccurate structured data.

## 29. Performance and accessibility

Optimise the application for:

- Mobile devices
- Slow internet connections
- Efficient database queries
- Responsive images
- Lazy loading
- Pagination
- Server rendering
- Appropriate caching
- Bundle size
- Core Web Vitals
- Keyboard accessibility
- Screen-reader compatibility
- Reduced-motion preferences

Aim for WCAG 2.2 AA accessibility where practical.

Avoid unnecessarily loading all marketplace listings at once.

## 30. Notifications

Implement in-app notifications for:

- New messages
- New offers
- Counteroffers
- Accepted offers
- Listing approvals
- Listing rejections
- Inspection bookings
- Inspection results
- Appointment changes
- Verification updates

Support future email, SMS and WhatsApp integrations.

Respect user notification preferences and consent.

## 31. Testing requirements

Write meaningful automated tests.

Use appropriate tools such as Vitest and Playwright.

Test:

- User registration
- Authentication
- Authorisation
- Seller listing creation
- Listing editing
- Image uploads
- Marketplace search
- Combined filtering
- Seller enquiries
- Offer negotiation
- Inspection booking
- Certificate creation
- Certificate verification
- Listing moderation
- Admin access restrictions
- Private document access
- Cross-account data isolation
- Duplicate form submissions
- Mobile responsiveness
- Invalid input handling

Test payment integrations separately in their official sandbox before any production activation.

Run linting, TypeScript checks, unit tests, end-to-end tests and production builds.

Fix critical failures rather than simply documenting them.

## 32. Development phases

### Phase 1 — Functional MVP

Build and complete this phase first.

Required deliverables:

1. Project architecture and design system
2. Responsive homepage
3. Authentication and user profiles
4. Seller onboarding
5. Laptop listing creation and management
6. Secure image uploads
7. Marketplace search and filtering
8. Product details pages
9. Favourites
10. Public seller profiles
11. Buyer-to-seller messaging
12. Basic offer negotiation
13. Inspection booking
14. Administrative listing moderation
15. Basic admin dashboard
16. Database security policies
17. SEO foundations
18. Automated tests
19. Deployment documentation

The MVP must be genuinely usable without protected payment integration.

### Phase 2 — Trust and initial monetisation

- Seller verification
- Full inspector dashboard
- Digital inspection certificates
- QR certificate verification
- Safe meeting appointments
- Dealer storefronts
- Featured listings
- Inspection packages
- Seller reputation
- Consignment requests
- Payment collection for ordinary platform service fees after provider configuration

### Phase 3 — Marketplace commerce

- Dealer subscriptions
- Protected payments
- Orders
- Delivery coordination
- Transaction commissions
- Refunds
- Disputes
- Payout management

Do not activate regulated payment functionality without the required approvals and provider capabilities.

### Phase 4 — Advanced marketplace

- AI laptop finder
- AI price estimation
- AI listing assistant
- Fraud detection
- Buyer requests
- Bulk inventory uploads
- Trade-ins
- Advanced analytics
- Expansion to additional Kenyan towns
- Additional electronics categories

## 33. Project documentation and continuity

Maintain the following documentation in the repository:

- README.md
- AGENTS.md
- docs/PRODUCT_REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DATABASE_SCHEMA.md
- docs/DESIGN_SYSTEM.md
- docs/SECURITY.md
- docs/ROADMAP.md
- docs/IMPLEMENTATION_STATUS.md
- docs/DEPLOYMENT.md
- docs/DECISIONS.md
- CHANGELOG.md
- .env.example

AGENTS.md must contain persistent instructions for future Codex sessions, including architecture, coding conventions, security rules and development procedures.

Update IMPLEMENTATION_STATUS.md after every completed development milestone.

Clearly record:

- Completed features
- Remaining tasks
- Known bugs
- Pending integrations
- Database migrations
- Test results
- Technical decisions
- Exact next implementation step

This is important because development may continue across multiple Codex sessions or different computers.

Never store secrets in project documentation.

## 34. Development operating rules

- Inspect the repository before modifying anything.
- Preserve existing user changes.
- Do not perform destructive operations without approval.
- Do not modify the live Tech Sokoni website without approval.
- Use reusable components.
- Maintain clean, modular and typed code.
- Avoid unnecessary dependencies.
- Use official documentation for integrations.
- Do not build non-functional buttons.
- Do not use fake backend responses in production.
- Do not hardcode dashboard statistics.
- Do not use lorem ipsum.
- Do not fabricate customer testimonials.
- Do not fabricate verified sellers.
- Do not invent available inventory.
- Clearly identify development-only demonstration data.
- Implement proper loading, empty, error and success states.
- Validate features on mobile and desktop.
- Keep paid services and financial integrations disabled until configured.
- Never deploy publicly, purchase services or make irreversible infrastructure changes without approval.
- Keep future features modular and behind appropriate feature flags.

## 35. Initial execution instructions

Start working immediately.

First:

1. Inspect the current working directory and repository.
2. Identify available frameworks, dependencies and development tools.
3. Review the existing Tech Sokoni brand where accessible.
4. Determine the appropriate architecture.
5. Create persistent product and engineering documentation.
6. Initialise the application if the repository is empty.
7. Establish the design system.
8. Implement the database foundation.
9. Build the homepage and core marketplace browsing experience.
10. Implement the seller listing workflow.
11. Implement authentication and account management.
12. Implement the administration and moderation foundations.
13. Test the completed functionality.
14. Start the local development server when the environment supports it.

Do not stop after producing a plan or architecture document.

Implement Phase 1 incrementally, completing functional vertical slices of the application.

When credentials or external services are unavailable, document the exact configuration required and continue with independent features. Use clearly identified local development fixtures or sandbox integrations where appropriate.

At the end of each development session, provide:

- Summary of what was built
- Files created or modified
- Database changes
- Test results
- Security considerations
- Known limitations
- Configuration required from me
- Local preview URL, if available
- Exact next development step

## Final product vision

Build Tech Sokoni Marketplace into Kenya's most trusted specialised laptop marketplace, connecting buyers, individual sellers, laptop dealers and businesses through transparent specifications, professional inspections, trustworthy seller profiles and secure transaction infrastructure.

Prioritise trust, genuine functionality, affordability, performance and excellent user experience throughout development.

Begin implementation now.