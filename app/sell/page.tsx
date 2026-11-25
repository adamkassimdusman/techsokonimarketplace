import { requireUser } from "@/lib/auth";
import { transaction } from "@/lib/db";
import { ListingWizard } from "@/components/listing-wizard";
import type { Listing } from "@/lib/catalog";
import { notFound } from "next/navigation";
import { z } from "zod";
export const metadata = {
  title: "Sell your laptop",
  robots: { index: false, follow: false },
};
export default async function Sell({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireUser();
  const { edit } = await searchParams;
  let listing: Listing | undefined;
  let serial = "";
  let photos: { id: string }[] = [];
  const draft = await transaction(
    user,
    async (q) =>
      (
        await q<{ fields: Record<string, string> }>(
          "SELECT fields FROM listing_drafts WHERE user_id=$1",
          [user.id],
        )
      )[0],
  );
  if (edit) {
    if (!z.uuid().safeParse(edit).success) notFound();
    const data = await transaction(user, async (q) => ({
      listing: (
        await q<Listing>(
          "SELECT * FROM listings WHERE id=$1 AND seller_id=$2",
          [edit, user.id],
        )
      )[0],
      photos: await q<{ id: string }>(
        "SELECT id FROM images WHERE listing_id=$1 ORDER BY position",
        [edit],
      ),
      private: (
        await q<{ serial_number: string }>(
          "SELECT serial_number FROM listing_private WHERE listing_id=$1",
          [edit],
        )
      )[0],
    }));
    if (!data.listing) notFound();
    listing = data.listing;
    photos = data.photos;
    serial = data.private?.serial_number ?? "";
  }
  return (
    <div className="wrap section">
      <div className="eyebrow">A CLEAR LISTING BUILDS CONFIDENCE</div>
      <h1 className="page-title">
        {listing ? "Edit your listing" : "Give your laptop its next chapter."}
      </h1>
      <p>
        Be specific. Be honest. Help the next owner make an informed choice.
      </p>
      <ListingWizard
        listing={listing}
        serial={serial}
        existingPhotos={photos}
        draft={edit ? undefined : draft?.fields}
      />
    </div>
  );
}
