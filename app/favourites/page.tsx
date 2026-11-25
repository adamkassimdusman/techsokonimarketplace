import { requireUser } from "@/lib/auth";
import { transaction } from "@/lib/db";
import type { Listing } from "@/lib/catalog";
import { ListingCard } from "@/components/catalog";
export const metadata = {
  title: "Saved laptops",
  robots: { index: false, follow: false },
};
export default async function Favourites() {
  const user = await requireUser();
  const rows = await transaction(user, (q) =>
    q<Listing>(
      "SELECT l.*,true saved,(SELECT id FROM images WHERE listing_id=l.id ORDER BY position LIMIT 1) image_id FROM favourites f JOIN listings l ON l.id=f.listing_id WHERE f.user_id=$1 LIMIT 100",
      [user.id],
    ),
  );
  return (
    <div className="wrap section">
      <h1>Saved for a second look.</h1>
      {!rows.length && (
        <p>
          No available saved laptops yet. Save a listing from the marketplace to
          find it here.
        </p>
      )}
      <div className="listing-grid">
        {rows.map((l) => (
          <div key={l.id}>
            <ListingCard item={l} />
          </div>
        ))}
      </div>
    </div>
  );
}
