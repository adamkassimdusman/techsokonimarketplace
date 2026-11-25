export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { transaction } from "@/lib/db";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const rows = await transaction(null, (q) =>
    q<{ id: string; updated_at: string }>(
      "SELECT id,updated_at FROM listings WHERE status='published' ORDER BY updated_at DESC LIMIT 5000",
    ),
  );
  return [
    { url: base },
    { url: base + "/marketplace" },
    { url: base + "/trust" },
    { url: base + "/dealers" },
    { url: base + "/finder" },
    { url: base + "/insights" },
    ...rows.map((l) => ({
      url: base + "/laptop/" + l.id,
      lastModified: new Date(l.updated_at),
    })),
  ];
}
