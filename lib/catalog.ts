import { transaction, service } from "./db";
import { searchQuery } from "./validation";
import { currentUser } from "./auth";
export type Listing = Record<string, unknown> & {
  id: string;
  seller_id: string;
  brand: string;
  model: string;
  cpu: string;
  ram: number;
  storage: number;
  storage_type: string;
  gpu: string;
  screen: string;
  condition: string;
  faults: string;
  description: string;
  price: number;
  county: string;
  town: string;
  battery: number | null;
  warranty: string;
  negotiable: boolean;
  delivery: boolean;
  status: string;
  moderation_note: string;
  created_at: string;
  image_id: string | null;
  seller_name: string;
  seller_type: string;
  saved?: boolean;
};
export async function catalog(params: Record<string, string | undefined> = {}) {
  const { where, values, sort, page } = searchQuery(params);
  const user = await currentUser();
  return transaction(user, async (q) => {
    const count = (
      await q<{ count: string }>(
        `SELECT count(*) FROM listings l WHERE ${where}`,
        values,
      )
    )[0];
    const rows = await q<Listing>(
      `SELECT l.*,s.name seller_name,s.seller_type,(SELECT id FROM images WHERE listing_id=l.id ORDER BY position LIMIT 1) image_id,EXISTS(SELECT 1 FROM favourites f WHERE f.listing_id=l.id AND f.user_id=app_user()) saved FROM listings l LEFT JOIN public_sellers() s ON s.id=l.seller_id WHERE ${where} ORDER BY ${sort},l.id LIMIT 12 OFFSET ${(page - 1) * 12}`,
      values,
    );
    return { rows, total: Number(count.count), page };
  });
}
export async function listing(id: string) {
  const user = await currentUser();
  const row = await transaction(
    user,
    async (q) =>
      (await q<Listing>("SELECT * FROM listings WHERE id=$1", [id]))[0],
  );
  if (!row) return null;
  const seller = await service(
    async (q) =>
      (
        await q<{ name: string; seller_type: string }>(
          "SELECT name,seller_type FROM users WHERE id=$1",
          [row.seller_id],
        )
      )[0],
  );
  return { ...row, seller_name: seller.name, seller_type: seller.seller_type };
}
