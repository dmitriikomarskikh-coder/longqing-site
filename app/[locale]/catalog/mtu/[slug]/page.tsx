import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {setRequestLocale} from "next-intl/server";
import {Suspense} from "react";
import {ContactForm} from "@/components/ContactForm";
import {mtuParts} from "@/content/mtu-parts";
import type {MtuPart} from "@/content/mtu-parts";
import type {Locale} from "@/i18n/routing";

const labels = {
  ru: {
    back: "Каталог",
    eyebrow: "Запчасть MTU",
    brand: "Бренд",
    category: "Категория",
    partNumber: "Артикул",
    status: "Статус",
    availability: "Доступно к поставке",
    description: "Описание",
    function: "Назначение",
    compatibility: "Совместимость",
    price: "Цена",
    priceValue: "Цена по запросу",
    quote: "Запросить КП",
    reduced:
      "Эта позиция доступна для обработки B2B-запроса. Перед подготовкой КП менеджер уточнит описание, наличие, цену и совместимость по артикулу и данным оборудования.",
    disclaimer:
      "Информация о запчастях носит справочный характер и не является публичной офертой. Наличие, цену, сроки поставки и совместимость необходимо подтвердить у менеджера по артикулу, серийному номеру двигателя или спецификации оборудования. LONGQING работает как независимый поставщик и не представляет MTU."
  },
  en: {
    back: "Catalog",
    eyebrow: "MTU spare part",
    brand: "Brand",
    category: "Category",
    partNumber: "Part number",
    status: "Status",
    availability: "Available for supply",
    description: "Description",
    function: "Function",
    compatibility: "Compatibility",
    price: "Price",
    priceValue: "Price on request",
    quote: "Request proposal",
    reduced:
      "This item is available for B2B request processing. Before preparing a proposal, a manager will confirm description, availability, price, and compatibility by part number and equipment data.",
    disclaimer:
      "Part information is for reference and is not a public offer. Availability, price, lead time, and compatibility must be confirmed by a manager using the part number, engine serial number, or equipment specification. LONGQING acts as an independent supplier and does not represent MTU."
  },
  zh: {
    back: "目录",
    eyebrow: "MTU备件",
    brand: "品牌",
    category: "类别",
    partNumber: "零件号",
    status: "状态",
    availability: "可供应",
    description: "描述",
    function: "用途",
    compatibility: "兼容性",
    price: "价格",
    priceValue: "价格按请求确认",
    quote: "获取报价",
    reduced:
      "该项目可处理 B2B 询价。准备报价前，经理将根据零件号和设备信息确认描述、库存、价格和兼容性。",
    disclaimer:
      "备件信息仅供参考，不构成公开报价。库存、价格、交期和兼容性需由经理根据零件号、发动机序列号或设备规格确认。LONGQING 作为独立供应方开展业务，并不代表 MTU。"
  }
} satisfies Record<Locale, Record<string, string>>;

function partName(part: MtuPart, locale: Locale) {
  return locale === "ru" ? part.nameRu : part.nameEn;
}

function partDescription(part: MtuPart, locale: Locale) {
  if (part.isReducedCard) {
    return labels[locale].reduced;
  }

  if (locale === "ru") {
    return part.shortDescriptionRu;
  }

  if (locale === "zh") {
    return `MTU ${part.partNumber} 可按 B2B 请求处理。库存、价格、交期和适用性将根据设备信息确认。`;
  }

  return `MTU ${part.partNumber} is available for B2B sourcing. Availability, price, lead time, and applicability are confirmed by equipment data.`;
}

function partFunction(part: MtuPart, locale: Locale) {
  if (part.isReducedCard) {
    return labels[locale].reduced;
  }

  if (locale === "ru") {
    return part.functionRu;
  }

  if (locale === "zh") {
    return "用途和适用性将根据零件号、发动机序列号和设备规格确认。";
  }

  return "Function and applicability are confirmed by part number, engine serial number, and equipment specification.";
}

function compatibility(part: MtuPart, locale: Locale) {
  if (locale === "ru") {
    return part.compatibilityNoteRu;
  }

  if (locale === "zh") {
    return "兼容性将根据零件号、发动机序列号和设备规格确认。";
  }

  return "Compatibility is confirmed by part number, engine serial number, and equipment specification.";
}

export function generateStaticParams() {
  return mtuParts.flatMap((part) =>
    ["ru", "zh", "en"].map((locale) => ({locale, slug: part.slug}))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const part = mtuParts.find((item) => item.slug === slug);

  if (!part) {
    return {};
  }

  const name = partName(part, locale);

  return {
    title: `MTU ${part.partNumber} — ${name} | LONGQING`,
    description:
      locale === "ru"
        ? `${name}. Поставка по B2B-запросу. Наличие, срок поставки и совместимость уточняются по артикулу и данным оборудования.`
        : locale === "zh"
          ? `${name}. B2B 询价处理。库存、交期和兼容性将根据零件号和设备信息确认。`
          : `${name}. B2B request processing. Availability, lead time, and compatibility are confirmed by part number and equipment data.`,
    alternates: {
      canonical: `/${locale}/catalog/mtu/${slug}`,
      languages: {
        ru: `/ru/catalog/mtu/${slug}`,
        zh: `/zh/catalog/mtu/${slug}`,
        en: `/en/catalog/mtu/${slug}`,
        "x-default": `/en/catalog/mtu/${slug}`
      }
    }
  };
}

export default async function MtuPartPage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const part = mtuParts.find((item) => item.slug === slug);

  if (!part) {
    notFound();
  }

  const text = labels[locale];
  const name = partName(part, locale);
  const requestText = `Интересует MTU ${part.partNumber} — ${part.nameRu}`;

  return (
    <main className="bg-[#f7fafa] text-slate-950">
      <section className="px-5 pb-10 pt-32">
        <div className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href={`/${locale}`} className="transition hover:text-teal-700">
              LONGQING
            </Link>
            <span>/</span>
            <Link href={`/${locale}/catalog/mtu`} className="transition hover:text-teal-700">
              {text.back}
            </Link>
            <span>/</span>
            <span className="text-slate-700">{part.partNumber}</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
                {text.eyebrow}
              </p>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">
                {name}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xl font-bold text-slate-950 md:text-2xl">
                  MTU {part.partNumber}
                </p>
                <span className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  {text.availability}
                </span>
              </div>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                {partDescription(part, locale)}
              </p>
              <Link
                href="#contact-form"
                className="mt-7 inline-flex h-11 items-center justify-center rounded-md bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                {text.quote}
              </Link>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <dl className="grid gap-4 text-sm">
                {[
                  [text.brand, part.brand],
                  [text.category, part.category],
                  [text.partNumber, part.partNumber],
                  [text.status, text.availability],
                  [text.price, text.priceValue]
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {[
            [text.description, partDescription(part, locale)],
            [text.function, partFunction(part, locale)],
            [text.compatibility, compatibility(part, locale)]
          ].map(([title, value]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-5 py-8">
        <div className="mx-auto max-w-7xl text-sm leading-6 text-slate-600">
          {text.disclaimer}
        </div>
      </section>

      <Suspense>
        <ContactForm locale={locale} brand="mtu" initialMessage={requestText} />
      </Suspense>
    </main>
  );
}
