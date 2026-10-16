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
  const chapterRoutes = chapters.flatMap((c) => [
    `/chapters/${c.slug}`,
    `/chapters/${c.slug}/event`,
    `/chapters/${c.slug}/rules`,
    `/chapters/${c.slug}/photos`,
  ]);

  return [...routes, ...chapterRoutes].map((route) => ({
    url: "https://asers.org" + route,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
