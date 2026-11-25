import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/super-admin",
        "/support",
        "/api",
        "/admin",
        "/messages",
        "/account",
        "/sell",
        "/favourites",
        "/compare",
        "/policies",
        "/marketplace?",
      ],
    },
    sitemap: (process.env.APP_URL ?? "http://localhost:3000") + "/sitemap.xml",
  };
}
