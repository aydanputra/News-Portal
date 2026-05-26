import type { MetadataRoute } from "next";

function stripTrailingSlash(url: string) {
  return String(url || "").replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/preview", "/debug-font"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
