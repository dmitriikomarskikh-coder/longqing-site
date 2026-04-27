import type {MetadataRoute} from "next";
import brands from "@/content/brands.json";
import categories from "@/content/category-pages.json";
import {stockItems} from "@/content/stock-items";
import {locales} from "@/i18n/routing";
import type {Brand} from "@/lib/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longqingtrade.com";
  const staticPaths = ["", "/brands", "/news", "/contacts", "/privacy", "/terms"];
  const brandPaths = (brands as Brand[]).map((brand) => `/brands/${brand.slug}`);
  const categoryPaths = (categories as Array<{slug: string}>).map(
    (category) => `/categories/${category.slug}`
  );
  const stockPaths = stockItems
    .filter((item) => item.slug === "forsunka-mtu-x52407500053")
    .map((item) => `/ru/stock/${item.slug}`);
  const paths = [...staticPaths, ...brandPaths, ...categoryPaths];

  return [
    ...locales.flatMap((locale) =>
      paths.map((path) => ({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: new Date()
      }))
    ),
    ...stockPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date()
    }))
  ];
}
