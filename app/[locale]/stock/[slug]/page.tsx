import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {setRequestLocale} from "next-intl/server";
import {Suspense} from "react";
import {ContactForm} from "@/components/ContactForm";
import {stockItems} from "@/content/stock-items";
import type {Locale} from "@/i18n/routing";

const productSlug = "forsunka-mtu-x52407500053";

const productDetails = {
  category: "Топливная система / форсунки",
  altPartNumbers: ["52407500053", "RX52407500053", "EX52407500053"],
  packageQuantity: "1",
  netWeight: "2.1 кг",
  injectionPressure: "до 2200 бар",
  compatibility: ["MTU Series 4000", "12V4000", "16V4000"],
  applications: [
    "карьерная техника",
    "дизельные электростанции",
    "промышленные установки",
    "судовая техника"
  ],
  benefits: [
    "высокая точность дозирования топлива",
    "работа в условиях высокой нагрузки, вибрации и запылённости",
    "подходит для обслуживания и ремонта двигателей MTU",
    "прямая замена оригинальной форсунки"
  ]
};

export function generateStaticParams() {
  return ["ru", "zh", "en"].map((locale) => ({locale, slug: productSlug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const item = stockItems.find((stockItem) => stockItem.slug === slug);

  if (!item) {
    return {};
  }

  return {
    title:
      locale === "ru"
        ? "Топливная форсунка MTU X52407500053 — запрос КП | LONGQING Trade"
        : `${item.name[locale]} | LONGQING Trade`,
    description:
      locale === "ru"
        ? "Топливная форсунка MTU X52407500053 на складе в Китае. Цена по запросу, подготовка к отгрузке 3–4 дня."
        : item.description[locale],
    alternates: {
      canonical: `/${locale}/stock/${slug}`,
      languages: {
        ru: `/ru/stock/${slug}`,
        zh: `/zh/stock/${slug}`,
        en: `/en/stock/${slug}`,
        "x-default": `/en/stock/${slug}`
      }
    }
  };
}

export default async function StockProductPage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const item = stockItems.find((stockItem) => stockItem.slug === slug);

  if (!item || slug !== productSlug) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "ru" ? "Главная" : locale === "zh" ? "首页" : "Home",
        item: `/${locale}`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "ru" ? "Наличие" : locale === "zh" ? "库存" : "Stock",
        item: `/${locale}/stock/${slug}`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: item.name[locale],
        item: `/${locale}/stock/${slug}`
      }
    ]
  };

  const requestText =
    locale === "ru"
      ? `Интересует ${item.name.ru}, артикул ${item.partNumber}. Прошу подготовить КП.`
      : locale === "zh"
        ? `Interested in ${item.name.zh}, part number ${item.partNumber}. Please prepare a proposal.`
        : `Interested in ${item.name.en}, part number ${item.partNumber}. Please prepare a proposal.`;

  return (
    <main className="bg-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbJsonLd)}}
      />
      <section className="relative overflow-hidden bg-dark px-5 pb-12 pt-24 md:pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(0,163,163,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_42%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
        <div className="relative mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href={`/${locale}`} className="transition hover:text-accent">
              {locale === "ru" ? "Главная" : locale === "zh" ? "首页" : "Home"}
            </Link>
            <span>/</span>
            <span>{locale === "ru" ? "Наличие" : locale === "zh" ? "库存" : "Stock"}</span>
            <span>/</span>
            <span className="text-text">{item.partNumber}</span>
          </nav>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                {locale === "ru" ? "ТОВАР В НАЛИЧИИ" : locale === "zh" ? "库存产品" : "Stock item"}
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-text md:text-5xl">
                {item.name[locale]}
              </h1>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  item.location[locale],
                  `${item.quantity} ${item.unit}`,
                  item.preparation[locale],
                  locale === "ru" ? "Цена по запросу" : locale === "zh" ? "价格按请求" : "Price on request"
                ].map((badge) => (
                  <span
                    key={badge}
                    className="rounded border border-accent/20 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
                {locale === "ru"
                  ? "Топливная форсунка MTU X52407500053 — оригинальная деталь системы Common Rail для дизельных двигателей MTU Series 4000. Обеспечивает точный впрыск топлива под высоким давлением, стабильную работу двигателя и эффективное сгорание топлива."
                  : item.description[locale]}
              </p>
            </div>
            <aside className="rounded border border-white/10 bg-dark-2 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
              <div className="rounded border border-white/10 bg-dark p-4">
                <div className="flex min-h-28 items-center justify-between gap-4 rounded border border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(0,163,163,0.2),transparent_34%)] p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      {item.brand}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-text">{item.partNumber}</p>
                    <p className="mt-1 text-xs text-muted">
                      {locale === "ru" ? "Фото уточняется" : locale === "zh" ? "图片待确认" : "Image to confirm"}
                    </p>
                  </div>
                  <span className="rounded bg-accent/12 px-3 py-2 text-xs font-semibold text-accent">
                    {item.status[locale]}
                  </span>
                </div>
              </div>
              <dl className="mt-4 grid gap-2 text-sm">
                {[
                  [locale === "ru" ? "Бренд" : locale === "zh" ? "品牌" : "Brand", item.brand],
                  [locale === "ru" ? "Категория" : locale === "zh" ? "类别" : "Category", productDetails.category],
                  [locale === "ru" ? "Артикул" : locale === "zh" ? "型号" : "Part number", item.partNumber],
                  [locale === "ru" ? "Наличие" : locale === "zh" ? "库存" : "Stock", item.location[locale]],
                  [
                    locale === "ru" ? "Количество" : locale === "zh" ? "数量" : "Quantity",
                    `${item.quantity} ${item.unit}`
                  ],
                  [locale === "ru" ? "Цена" : locale === "zh" ? "价格" : "Price", locale === "ru" ? "по запросу" : locale === "zh" ? "按请求" : "on request"],
                  [locale === "ru" ? "Срок" : locale === "zh" ? "周期" : "Lead time", item.preparation[locale]]
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-t border-white/10 pt-2">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-semibold text-text">{value}</dd>
                  </div>
                ))}
              </dl>
              <Link href="#contact-form" className="btn-primary mt-4 h-11 w-full px-6 text-sm">
                {locale === "ru" ? "Запросить КП" : locale === "zh" ? "查询报价" : "Request proposal"}
              </Link>
            </aside>
          </div>
        </div>
      </section>
      <section className="bg-light px-5 py-16 text-dark">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-semibold">
              {locale === "ru" ? "Описание" : locale === "zh" ? "描述" : "Description"}
            </h2>
            <p className="mt-5 text-base leading-7 text-[#4b5563]">
              {locale === "ru"
                ? "Форсунка применяется в топливной системе Common Rail, где важны точная дозировка, стабильное давление и надежность при длительной работе двигателя под нагрузкой."
                : item.description[locale]}
            </p>
            <h3 className="mt-10 text-2xl font-semibold">
              {locale === "ru" ? "Преимущества" : locale === "zh" ? "优势" : "Benefits"}
            </h3>
            <ul className="mt-4 grid gap-3">
              {productDetails.benefits.map((benefit) => (
                <li key={benefit} className="rounded border border-[#e5e7eb] bg-white p-4 text-[#4b5563]">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">
              {locale === "ru" ? "Характеристики" : locale === "zh" ? "规格" : "Specifications"}
            </h2>
            <dl className="mt-5 grid gap-3">
              {[
                ["Альтернативные номера", productDetails.altPartNumbers.join(", ")],
                ["Единица измерения", item.unit],
                ["Количество в упаковке", productDetails.packageQuantity],
                ["Вес нетто", productDetails.netWeight],
                ["Давление впрыска", productDetails.injectionPressure],
                ["Совместимость", productDetails.compatibility.join(", ")]
              ].map(([label, value]) => (
                <div key={label} className="rounded border border-[#e5e7eb] bg-white p-4">
                  <dt className="text-sm text-[#4b5563]">{label}</dt>
                  <dd className="mt-1 font-semibold text-dark">{value}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-10 text-2xl font-semibold">
              {locale === "ru" ? "Применение" : locale === "zh" ? "应用" : "Applications"}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {productDetails.applications.map((application) => (
                <span key={application} className="rounded border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#4b5563]">
                  {application}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-dark px-5 py-10">
        <div className="mx-auto max-w-7xl rounded border border-white/10 bg-dark-2 p-5 text-sm leading-6 text-muted">
          {locale === "ru"
            ? "LONGQING Trade не является официальным дилером, дистрибьютором или сертифицированным сервисным центром MTU. Все товарные знаки принадлежат их правообладателям. Совместимость и применимость подтверждаются по артикулу, серийному номеру двигателя или технической документации."
            : "LONGQING Trade is not an official dealer, distributor, or certified service center of MTU. All trademarks belong to their respective owners. Compatibility and applicability are confirmed by part number, engine serial number, or technical documentation."}
        </div>
      </section>
      <Suspense>
        <ContactForm locale={locale} brand="mtu" initialMessage={requestText} />
      </Suspense>
    </main>
  );
}
