import Link from "next/link";
export default function NotFound() {
  return (
    <div className="narrow section">
      <h1>This page isn’t available.</h1>
      <p>The listing may be private, removed or unavailable to your account.</p>
      <Link href="/marketplace" className="button">
        Back to the marketplace
      </Link>
    </div>
  );
}
