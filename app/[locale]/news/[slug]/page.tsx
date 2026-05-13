import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";
import {getNewsBySlug} from "@/lib/news";

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const article = await getNewsBySlug(locale, slug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.item.title} | LONGQING`,
    description: article.item.excerpt,
    alternates: {
      canonical: `/${locale}/news/${slug}`,
      languages: {
        ru: `/ru/news/${slug}`,
        zh: `/zh/news/${slug}`,
        en: `/en/news/${slug}`,
        "x-default": `/en/news/${slug}`
      }
    }
  };
}

export default async function NewsArticlePage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const article = await getNewsBySlug(locale, slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="bg-light px-5 pb-20 pt-32 text-dark">
      <article className="mx-auto max-w-3xl">
        <time className="text-sm text-neutral-500">{article.item.date}</time>
        <h1 className="mt-4 text-5xl font-semibold">{article.item.title}</h1>
        <div className="mt-8 whitespace-pre-line text-base leading-8 text-neutral-700">
          {article.content.trim()}
        </div>
      </article>
    </main>
  );
}
