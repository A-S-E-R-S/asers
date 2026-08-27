import type { MetadataRoute } from "next";

const routes = [
  "",
  "/about",
  "/competition",
  "/judging",
  "/national-symposium",
  "/chapters",
  "/chapters/new-jersey",
  "/donate",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: "https://asers.org" + route,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
