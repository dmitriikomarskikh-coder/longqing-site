import Link from "next/link";
import type {Locale} from "@/i18n/routing";
import type {NewsItem} from "@/lib/types";

export function NewsTeaser({
  locale,
  items
}: {
  locale: Locale;
  items: NewsItem[];
}) {
  return (
    <section className="bg-light px-5 pb-[60px] pt-[60px] text-dark">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {locale === "ru" ? "НОВОСТИ" : locale === "zh" ? "新闻" : "News"}
            </p>
            <h2 className="mt-3 text-4xl font-semibold md:text-5xl">
              {locale === "ru" ? "Новости" : locale === "zh" ? "新闻" : "News"}
            </h2>
          </div>
          <Link href={`/${locale}/news`} className="text-sm font-semibold text-accent">
            {locale === "ru" ? "Все публикации" : locale === "zh" ? "全部文章" : "All posts"}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/${locale}/news/${item.slug}`}
              className="rounded border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-accent"
            >
              <time className="text-sm text-neutral-500">{item.date}</time>
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{item.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
