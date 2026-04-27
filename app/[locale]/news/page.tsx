import Link from "next/link";
import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";
import {getAllNews} from "@/lib/news";

export default async function NewsPage({
  params
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const news = await getAllNews(locale);

  return (
    <main className="bg-light px-5 pb-20 pt-32 text-dark">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-semibold">
          {locale === "ru" ? "Новости" : locale === "zh" ? "新闻" : "News"}
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {news.map((item) => (
            <Link
              key={item.slug}
              href={`/${locale}/news/${item.slug}`}
              className="rounded border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-accent"
            >
              <time className="text-sm text-neutral-500">{item.date}</time>
              <h2 className="mt-4 text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{item.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
