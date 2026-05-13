import Link from "next/link";
import type {Metadata} from "next";
import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";
import {getAllNews} from "@/lib/news";

const metadata = {
  ru: {
    title: "Новости | LONGQING",
    description: "Новости LONGQING о поставках промышленного оборудования и запчастей для B2B-заказчиков."
  },
  en: {
    title: "News | LONGQING",
    description: "LONGQING news about industrial equipment and spare parts supply for B2B customers."
  },
  zh: {
    title: "新闻 | LONGQING",
    description: "LONGQING 关于工业设备和备件 B2B 供应的新闻。"
  }
} satisfies Record<Locale, {title: string; description: string}>;

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const text = metadata[locale];

  return {
    title: text.title,
    description: text.description,
    alternates: {
      canonical: `/${locale}/news`,
      languages: {
        ru: "/ru/news",
        zh: "/zh/news",
        en: "/en/news",
        "x-default": "/en/news"
      }
    }
  };
}

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
