import type { MetadataRoute } from "next";
import { getPublishedChapters } from "@/lib/chapters";

const routes = [
  "",
  "/about",
  "/competition",
  "/competition/rules",
  "/judging",
  "/national-symposium",
  "/chapters",
  "/register",
  "/donate",
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const chapters = await getPublishedChapters();
  return [...routes, ...chapters.map((c) => `/chapters/${c.slug}`)].map((route) => ({
    url: "https://asers.org" + route,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
