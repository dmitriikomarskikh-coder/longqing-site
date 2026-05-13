import type {Metadata} from "next";
import {setRequestLocale} from "next-intl/server";
import {MtuCatalogList} from "@/components/MtuCatalogList";
import {mtuParts} from "@/content/mtu-parts";
import type {Locale} from "@/i18n/routing";

const copy = {
  ru: {
    title: "Каталог запчастей MTU",
    intro:
      "Поставка запчастей MTU и компонентов для промышленных двигателей. Наличие, цену, срок поставки и совместимость уточняем по артикулу, серийному номеру двигателя или спецификации оборудования.",
    note:
      "Каталог пополняется. Мы добавляем новые позиции MTU и уточняем технические описания. Для подбора отправьте артикул или спецификацию оборудования.",
    eyebrow: "B2B-каталог",
    disclaimer:
      "Информация о запчастях носит справочный характер и не является публичной офертой. Наличие, цену, сроки поставки и совместимость необходимо подтвердить у менеджера по артикулу, серийному номеру двигателя или спецификации оборудования. LONGQING работает как независимый поставщик и не представляет MTU."
  },
  en: {
    title: "MTU spare parts catalog",
    intro:
      "Supply of MTU spare parts and components for industrial engines. Availability, price, lead time, and compatibility are confirmed by part number, engine serial number, or equipment specification.",
    note:
      "The catalog is being expanded. We are adding MTU items and refining technical descriptions. Send a part number or equipment specification for selection.",
    eyebrow: "B2B catalog",
    disclaimer:
      "Part information is for reference and is not a public offer. Availability, price, lead time, and compatibility must be confirmed by a manager using the part number, engine serial number, or equipment specification. LONGQING acts as an independent supplier and does not represent MTU."
  },
  zh: {
    title: "MTU备件目录",
    intro:
      "为工业发动机供应 MTU 备件和部件。库存、价格、交期和兼容性将根据零件号、发动机序列号或设备规格确认。",
    note:
      "目录正在补充。我们正在添加 MTU 项目并完善技术描述。请发送零件号或设备规格以便选型。",
    eyebrow: "B2B目录",
    disclaimer:
      "备件信息仅供参考，不构成公开报价。库存、价格、交期和兼容性需由经理根据零件号、发动机序列号或设备规格确认。LONGQING 作为独立供应方开展业务，并不代表 MTU。"
  }
} satisfies Record<Locale, {title: string; intro: string; note: string; eyebrow: string; disclaimer: string}>;

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const text = copy[locale];

  return {
    title:
      locale === "ru"
        ? "Каталог запчастей MTU | LONGQING"
        : locale === "zh"
          ? "MTU备件目录 | LONGQING"
          : "MTU spare parts catalog | LONGQING",
    description: text.intro,
    alternates: {
      canonical: `/${locale}/catalog/mtu`,
      languages: {
        ru: "/ru/catalog/mtu",
        zh: "/zh/catalog/mtu",
        en: "/en/catalog/mtu",
        "x-default": "/en/catalog/mtu"
      }
    }
  };
}

export default async function MtuCatalogPage({
  params
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const text = copy[locale];

  return (
    <main className="bg-[#f7fafa] text-slate-950">
      <section className="px-5 pb-10 pt-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            {text.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            {text.title}
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-7 text-slate-600 md:text-lg">
            {text.intro}
          </p>
          <div className="mt-6 max-w-4xl rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm leading-6 text-slate-700">
            {text.note}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto max-w-7xl">
          <MtuCatalogList locale={locale} parts={mtuParts} />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-5 py-8">
        <div className="mx-auto max-w-7xl text-sm leading-6 text-slate-600">
          {text.disclaimer}
        </div>
      </section>
    </main>
  );
}
