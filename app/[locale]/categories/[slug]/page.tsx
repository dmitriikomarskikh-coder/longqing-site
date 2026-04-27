import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {setRequestLocale} from "next-intl/server";
import {Suspense} from "react";
import {ContactForm} from "@/components/ContactForm";
import categories from "@/content/category-pages.json";
import type {Locale} from "@/i18n/routing";
import type {LocalizedText} from "@/lib/types";

type CategoryPage = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
};

const categoryPages = categories as CategoryPage[];

export function generateStaticParams() {
  return categoryPages.flatMap((category) =>
    ["ru", "zh", "en"].map((locale) => ({locale, slug: category.slug}))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const category = categoryPages.find((item) => item.slug === slug);

  if (!category) {
    return {};
  }

  return {
    title: `${category.title[locale]} | LONGQING Trade`,
    description: category.description[locale],
    alternates: {
      canonical: `/${locale}/categories/${slug}`,
      languages: {
        ru: `/ru/categories/${slug}`,
        zh: `/zh/categories/${slug}`,
        en: `/en/categories/${slug}`,
        "x-default": `/en/categories/${slug}`
      }
    }
  };
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const category = categoryPages.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `/${locale}`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `/${locale}/categories/${slug}`
      }
    ]
  };

  return (
    <main className="bg-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbJsonLd)}}
      />
      <section className="px-5 pb-16 pt-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {locale === "ru"
              ? "НАЛИЧИЕ В КИТАЕ"
              : locale === "zh"
                ? "中国供应"
                : "Supply from China"}
          </p>
          <h1 className="mt-4 max-w-5xl text-5xl font-semibold text-text md:text-7xl">
            {category.title[locale]}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
            {category.description[locale]}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#contact-form"
              className="btn-primary h-12 px-6 text-sm"
            >
              {locale === "ru"
                ? "Запросить предложение"
                : locale === "zh"
                  ? "查询报价"
                  : "Request proposal"}
            </Link>
            <Link
              href={`/${locale}/contacts`}
              className="btn-secondary h-12 px-6 text-sm"
            >
              {locale === "ru"
                ? "Отправить спецификацию"
                : locale === "zh"
                  ? "发送规格书"
                  : "Send specification"}
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-light px-5 py-16 text-dark">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            locale === "ru" ? "Подбор по артикулу" : locale === "zh" ? "按型号匹配" : "Sourcing by part number",
            locale === "ru" ? "Проверка наличия в Китае" : locale === "zh" ? "确认中国库存" : "China stock check",
            locale === "ru" ? "КП для закупок и тендеров" : locale === "zh" ? "采购和投标报价" : "Proposals for tenders"
          ].map((item) => (
            <div key={item} className="rounded border border-neutral-200 bg-white p-5 font-semibold">
              {item}
            </div>
          ))}
        </div>
      </section>
      <Suspense>
        <ContactForm locale={locale} />
      </Suspense>
    </main>
  );
}
