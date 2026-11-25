import Link from "next/link";
export default function Policies() {
  return (
    <div className="narrow section">
      <h1>Marketplace policies</h1>
      <p>Drafts requiring professional review before launch.</p>
      {[
        "terms",
        "privacy",
        "seller-agreement",
        "buyer-protection",
        "listing-policy",
        "prohibited-items",
        "refund-disputes",
        "inspection-terms",
        "community-guidelines",
      ].map((p) => (
        <p key={p}>
          <Link href={"/policies/" + p}>{p.replaceAll("-", " ")}</Link>
        </p>
      ))}
    </div>
  );
}
