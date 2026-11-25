import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { transaction } from "@/lib/db";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return new Response("Not found", { status: 404 });
  const user = await currentUser();
  const image = await transaction(
    user,
    async (q) =>
      (
        await q<{ data: Uint8Array }>("SELECT data FROM images WHERE id=$1", [
          id,
        ])
      )[0],
  );
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
