import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type {Locale} from "@/i18n/routing";
import type {NewsItem} from "@/lib/types";

const newsDir = path.join(process.cwd(), "content", "news");

export async function getAllNews(locale: Locale): Promise<NewsItem[]> {
  const files = await fs.readdir(newsDir);
  const items = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const source = await fs.readFile(path.join(newsDir, file), "utf8");
        const {data} = matter(source);
        return {
          slug: String(data.slug),
          locale: data.locale as Locale,
          title: String(data.title),
          date: String(data.date),
          excerpt: String(data.excerpt),
          cover: data.cover ? String(data.cover) : undefined
        };
      })
  );

  return items
    .filter((item) => item.locale === locale)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getLatestNews(locale: Locale, limit: number) {
  const items = await getAllNews(locale);
  return items.slice(0, limit);
}

export async function getNewsBySlug(locale: Locale, slug: string) {
  const files = await fs.readdir(newsDir);

  for (const file of files) {
    if (!file.endsWith(".mdx")) {
      continue;
    }

    const source = await fs.readFile(path.join(newsDir, file), "utf8");
    const parsed = matter(source);

    if (parsed.data.locale === locale && parsed.data.slug === slug) {
      return {
        item: {
          slug: String(parsed.data.slug),
          locale: parsed.data.locale as Locale,
          title: String(parsed.data.title),
          date: String(parsed.data.date),
          excerpt: String(parsed.data.excerpt),
          cover: parsed.data.cover ? String(parsed.data.cover) : undefined
        },
        content: parsed.content
      };
    }
  }

  return null;
}
