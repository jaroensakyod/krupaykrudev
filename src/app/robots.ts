import type { MetadataRoute } from "next";

// TASK-128: SEO QA — private areas ห้าม index, empty search เป็น NOINDEX แล้วในหน้า
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3210";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/api", "/checkout", "/cart", "/account", "/orders", "/login", "/register"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
