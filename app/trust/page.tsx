import Link from "next/link";
export const metadata = { title: "Tech Sokoni Trust" };
export default function Trust() {
  return (
    <div className="narrow section">
      <div className="eyebrow">TECH SOKONI TRUST</div>
      <h1>Confidence comes from clarity.</h1>
      <h2 id="inspections">A declaration is not an inspection.</h2>
      <p>
        Listings show information provided by the seller. We do not call a
        laptop physically verified without an authorised inspection and an
        approved report. Digital certification is planned for the next
        development phase.
      </p>
      <h2 id="verification">A profile is not a verified identity.</h2>
      <p>
        Registration and choosing a dealer profile do not verify phone
        ownership, identity or business registration. No verification badges are
        awarded automatically.
      </p>
      <h2 id="safe-meetings">Take your time before paying.</h2>
      <p>
        Meet in a safe public business location. Check the exact model, battery,
        screen, keyboard, ports, charger and any device-management or BIOS
        locks. Ask for evidence of ownership.
      </p>
      <p>
        Never share an OTP. Never trust a payment screenshot. Confirm payments
        independently. Protected checkout is not currently operational.
      </p>
      <Link href="/marketplace" className="button">
        Explore laptops
      </Link>
    </div>
  );
}
