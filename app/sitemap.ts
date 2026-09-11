import type { MetadataRoute } from "next";

const SITE_URL = "https://ucsdxcrs.web.app";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about-us/",
    "/program/",
    "/sponsors/",
    "/recruitment/",
    "/contact/",
    "/terms/",
    "/privacy/",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
