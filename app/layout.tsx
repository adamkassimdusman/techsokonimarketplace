import { Navigation } from "@/components/navigation";
import { ComparisonTray } from "@/components/comparison";
import type { Metadata } from "next";
import Link from "next/link";
import { transaction } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import "./globals.css";
import "./redesign.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Tech Sokoni Marketplace | Buy with confidence",
    template: "%s | Tech Sokoni Marketplace",
  },
  description:
    "Discover, compare and sell laptops across Kenya. Transparent specifications, honest condition reports and a marketplace built around trust.",
};
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const unread = user
    ? await transaction(user, async (q) =>
        Number(
          (
            await q<{ n: string }>(
              "SELECT count(*) n FROM messages m LEFT JOIN conversation_reads r ON r.conversation_id=m.conversation_id AND r.user_id=$1 WHERE m.sender_id<>$1 AND m.seq>coalesce(r.last_seq,0)",
              [user.id],
            )
          )[0].n,
        ),
      )
    : 0;
  const notifications = user
    ? await transaction(user, async (q) =>
        Number(
          (
            await q<{ n: string }>(
              "SELECT count(*) n FROM notifications WHERE read_at IS NULL",
            )
          )[0].n,
        ),
      )
    : 0;
  return (
    <html lang="en-KE" data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Navigation
          name={user?.name}
          role={user?.role}
          unread={unread}
          notifications={notifications}
        />
        <main id="main">{children}</main>
        <ComparisonTray />
        <footer>
          <div className="footer-grid">
            <div>
              <Link href="/" className="logo">
                tech<span className="teal">sokoni</span>
              </Link>
              <p>
                A better way to find your next laptop.
                <br />
                Built around transparency. Made for Kenya.
              </p>
            </div>
            <div>
              <strong>Marketplace</strong>
              <Link href="/marketplace">Browse laptops</Link>
              <Link href="/sell">Sell your laptop</Link>
              <Link href="/trust">Trust & safety</Link>
              <Link href="/dealers">Dealer directory</Link>
              <Link href="/insights">Market insights</Link>
              <Link href="/support">Help & support</Link>
            </div>
            <div>
              <strong>Policies · review drafts</strong>
              <Link href="/policies/terms">Terms & conditions</Link>
              <Link href="/policies/privacy">Privacy policy</Link>
              <Link href="/policies/inspection-terms">Inspection terms</Link>
              <Link href="/policies">All policies</Link>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} Tech Sokoni Marketplace{" "}
            <span>Protected checkout is not available.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
