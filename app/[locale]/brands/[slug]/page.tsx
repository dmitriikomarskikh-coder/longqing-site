import Link from "next/link";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {setRequestLocale} from "next-intl/server";
import {Suspense} from "react";
import {ContactForm} from "@/components/ContactForm";
import brands from "@/content/brands.json";
import type {Locale} from "@/i18n/routing";
import type {Brand} from "@/lib/types";

export function generateStaticParams() {
  return (brands as Brand[]).flatMap((brand) =>
    ["ru", "zh", "en"].map((locale) => ({locale, slug: brand.slug}))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const brand = (brands as Brand[]).find((item) => item.slug === slug);

  if (!brand) {
    return {};
  }

  const brandName = brand.name[locale];

  return {
    title:
      locale === "ru"
        ? `Запчасти и оборудование ${brandName} — поставка из Китая`
        : locale === "zh"
          ? `${brandName} 设备和备件 — 中国供应`
          : `${brandName} Spare Parts and Equipment from China`,
    description:
      locale === "ru"
        ? `Подбор и поставка оборудования, комплектующих и расходных материалов для техники и промышленных систем ${brandName}. Работаем по артикулам, спецификациям и техническим заданиям.`
        : locale === "zh"
          ? `为 ${brandName} 设备和工业系统供应设备、部件和耗材。可按型号、规格和技术任务书处理。`
          : `Supply of equipment, components, and consumables for ${brandName} machinery and industrial systems by part number, specification, or technical request.`,
    alternates: {
      canonical: `/${locale}/brands/${slug}`,
      languages: {
        ru: `/ru/brands/${slug}`,
        zh: `/zh/brands/${slug}`,
        en: `/en/brands/${slug}`,
        "x-default": `/en/brands/${slug}`
      }
    }
  };
}

export default async function BrandPage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const brand = (brands as Brand[]).find((item) => item.slug === slug);

  if (!brand) {
    notFound();
  }

  const related = (brands as Brand[])
    .filter((item) => item.slug !== brand.slug)
    .slice(0, 6);
  const brandName = brand.name[locale];
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
        name: "Brands",
        item: `/${locale}/brands`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: brandName,
        item: `/${locale}/brands/${brand.slug}`
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
            {locale === "ru" ? "БРЕНД" : locale === "zh" ? "品牌" : "Brand"}
          </p>
          <h1 className="mt-4 text-5xl font-semibold text-text md:text-7xl">
            {locale === "ru"
              ? `Запчасти и оборудование ${brandName} — поставка из Китая`
              : locale === "zh"
                ? `${brandName} 设备和备件 — 中国供应`
                : `${brandName} Spare Parts and Equipment from China`}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
            {locale === "ru"
              ? `Подбираем и поставляем оборудование, комплектующие и расходные материалы для техники и промышленных систем ${brandName}. Работаем по артикулам, спецификациям и техническим заданиям.`
              : locale === "zh"
                ? `为 ${brandName} 设备和工业系统供应设备、部件和耗材。可按型号、规格和技术任务书处理。`
                : `We source and supply equipment, components, and consumables for ${brandName} machinery and industrial systems. We work by part numbers, specifications, and technical requests.`}
          </p>
          <Link
            href="#contact-form"
            className="btn-primary mt-8 h-12 px-6 text-sm"
          >
            {locale === "ru"
              ? `Запросить КП по ${brandName}`
              : locale === "zh"
                ? `查询 ${brandName} 报价`
                : `Request a proposal for ${brandName}`}
          </Link>
        </div>
      </section>
      <section className="bg-light px-5 py-16 text-dark">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">
              {locale === "ru"
                ? "Типовое оборудование"
                : locale === "zh"
                  ? "典型设备"
                  : "Typical equipment"}
            </h2>
            <ul className="mt-6 grid gap-3">
              {brand.equipmentTypes[locale].map((item) => (
                <li key={item} className="rounded border border-neutral-200 bg-white p-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">
              {locale === "ru"
                ? "Услуги по направлению"
                : locale === "zh"
                  ? "相关服务"
                  : "Related services"}
            </h2>
            <p className="mt-6 text-base leading-7 text-neutral-600">
              {locale === "ru"
                ? "Подбор совместимых запчастей, поставка оборудования, ремонт, сервисное сопровождение и международная логистика."
                : locale === "zh"
                  ? "兼容零部件选型、设备供应、维修、服务支持和国际物流。"
                  : "Compatible parts sourcing, equipment supply, repair, service support, and international logistics."}
            </p>
          </div>
        </div>
      </section>
      <section className="bg-dark px-5 py-10">
        <div className="mx-auto max-w-7xl rounded border border-white/10 bg-dark-2 p-5 text-sm leading-6 text-muted">
          {locale === "ru"
            ? `LONGQING работает как независимый поставщик и не представляет ${brandName}. Названия брендов используются только для идентификации оборудования, запчастей и совместимых компонентов.`
            : locale === "zh"
              ? `LONGQING 作为独立供应方开展业务，并不代表 ${brandName}。品牌名称仅用于识别设备、备件和兼容部件。`
              : `LONGQING operates as an independent supplier and does not represent ${brandName}. Brand names are used only to identify equipment, spare parts and compatible components.`}
        </div>
      </section>
      <Suspense>
        <ContactForm locale={locale} brand={brand.slug} />
      </Suspense>
      <section className="bg-dark-2 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-semibold text-text">
            {locale === "ru"
              ? "Похожие бренды"
              : locale === "zh"
                ? "相关品牌"
                : "Related brands"}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/${locale}/brands/${item.slug}`}
                className="rounded border border-white/10 bg-dark p-5 text-text transition hover:border-accent"
              >
                {item.name[locale]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
