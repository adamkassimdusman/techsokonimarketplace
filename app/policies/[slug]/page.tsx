import { notFound } from "next/navigation";
const policies: Record<string, [string, string]> = {
  terms: [
    "Terms and Conditions",
    "Users must provide accurate listing information, act lawfully and respect other members. Tech Sokoni may moderate or remove listings. Account creation does not establish seller verification. Protected payments are unavailable. Final liability, governing-law, complaints, age eligibility and consumer-rights provisions require counsel approval.",
  ],
  privacy: [
    "Privacy Policy",
    "The application stores account details, listing information, uploaded photos, messages, offers, bookings and security logs. Public profiles exclude email addresses and private serial numbers. Photos are re-encoded to remove metadata. Data-controller contact, lawful bases, retention periods, processor agreements, access/deletion procedures and international-transfer disclosures must be confirmed before launch.",
  ],
  "seller-agreement": [
    "Seller Agreement",
    "You must own the device or be authorised to sell it. Do not knowingly list stolen, counterfeit or unlawfully locked equipment. Supply accurate specifications, real photographs and all known defects, repairs and device restrictions. Do not publish residential addresses, identity documents or secrets. Listings require moderation.",
  ],
  "buyer-protection": [
    "Buyer Protection Policy",
    "Protected checkout and a platform payment guarantee are not available. Verify seller claims, inspect devices and independently confirm payments. Do not transfer funds in advance to unknown sellers. Final protection terms depend on an approved payment partner and require professional review.",
  ],
  "listing-policy": [
    "Listing Policy",
    "List laptops only. Use actual photographs, accurate prices and complete hardware specifications. Disclose all defects and ownership restrictions. No false verification claims or misleading promotions. Administrators can reject or suspend listings.",
  ],
  "prohibited-items": [
    "Prohibited Items Policy",
    "Do not list stolen or counterfeit devices, unlawfully obtained equipment, devices you are not authorised to sell, malware or access credentials. Disclose BIOS and corporate-management restrictions.",
  ],
  "refund-disputes": [
    "Refund and Dispute Policy",
    "The MVP does not process payments, refunds or payouts. Discuss warranty and return arrangements with the seller before transacting. Report suspicious listings using the reporting form. Statutory consumer rights and the formal dispute procedure need legal review before launch.",
  ],
  "inspection-terms": [
    "Inspection Terms",
    "An inspection reflects the device condition and accessible tests at the time of examination. It does not guarantee future reliability or legal ownership. Booking requests require confirmation. No location or slot is offered until configured. Test scope, fees, limitations, cancellation rights and certificate validity require confirmation before commercial inspections.",
  ],
  "community-guidelines": [
    "Community Guidelines",
    "Be respectful. Do not harass, impersonate others, spam or solicit OTPs. Keep enquiries relevant to the laptop. Report suspicious listings. Moderation is subject to human review.",
  ],
};
export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}
export default async function Policy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = policies[slug];
  if (!p) notFound();
  return (
    <div className="narrow section">
      <p className="notice">
        DRAFT — Requires professional legal review before public launch. This is
        not a claim of legal compliance.
      </p>
      <h1>{p[0]}</h1>
      <p>{p[1]}</p>
    </div>
  );
}
