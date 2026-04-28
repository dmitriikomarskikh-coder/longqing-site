import {ClipboardCheck, PackageCheck, Ship, Warehouse} from "lucide-react";
import type {Locale} from "@/i18n/routing";

const cards = [
  {
    icon: Warehouse,
    title: {
      ru: "Проверить наличие в Китае",
      zh: "中国仓库现货",
      en: "Stock in China"
    },
    text: {
      ru: "Уточняем остатки по складам и поставщикам. Отдельные позиции могут быть готовы к отгрузке после предоплаты в течение 3–4 дней.",
      zh: "部分产品预付款后可在 3–4 天内从仓库发出。",
      en: "Selected items can be released from the warehouse within 3–4 days after prepayment."
    }
  },
  {
    icon: PackageCheck,
    title: {
      ru: "Подобрать по артикулу",
      zh: "按需采购",
      en: "Supply to order"
    },
    text: {
      ru: "Работаем по артикулам, спецификациям, фото шильдика, чертежам и техническим заданиям.",
      zh: "可按型号、规格、照片或技术任务书匹配设备和部件。",
      en: "We source equipment and components by part number, specification, photo, or technical request."
    }
  },
  {
    icon: Ship,
    title: {
      ru: "Организовать логистику",
      zh: "发往俄罗斯",
      en: "Logistics to Russia"
    },
    text: {
      ru: "Помогаем с маршрутом, документами и доставкой оборудования в Россию.",
      zh: "协助安排运输、文件和路线支持。",
      en: "We arrange delivery, documents, and route support."
    }
  },
  {
    icon: ClipboardCheck,
    title: {
      ru: "Подготовить КП для тендера",
      zh: "投标与采购",
      en: "For tenders and procurement"
    },
    text: {
      ru: "Готовим коммерческие предложения под требования закупочной документации.",
      zh: "根据采购文件要求准备报价方案。",
      en: "We prepare commercial proposals according to procurement documentation."
    }
  }
];

export function SupplyIntro({locale}: {locale: Locale}) {
  return (
    <section className="bg-[#f3f5f6] px-5 pb-[60px] pt-[60px] text-dark">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {locale === "ru"
                ? "ВОЗМОЖНОСТИ"
                : locale === "zh"
                  ? "供应能力"
                  : "China supply"}
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold text-dark md:text-5xl">
              {locale === "ru"
                ? "Что мы можем сделать для вас"
                : locale === "zh"
                  ? "来自中国的工业供应"
                  : "Industrial supply from China"}
            </h2>
          </div>
          <p className="text-base leading-7 text-[#4b5563]">
            {locale === "ru"
              ? "LONGQING Trade помогает предприятиям России и СНГ находить оборудование, запчасти и расходные материалы через поставщиков и складские площадки в Китае. Работаем с позициями в наличии и заказами под конкретную задачу."
              : locale === "zh"
                ? "LONGQING Trade 通过中国供应商和仓储平台帮助企业采购工业设备、备件和耗材。我们可处理现货和按需采购。"
                : "LONGQING Trade helps companies source industrial equipment, spare parts, and consumables through suppliers and warehouse platforms in China. We handle stock items and supply to order."}
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.title.en} className="rounded border border-[#e5e7eb] bg-white p-6 shadow-sm">
                <div className="grid size-11 place-items-center rounded bg-accent/10 text-accent">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-dark">{card.title[locale]}</h3>
                <p className="mt-3 text-sm leading-6 text-[#4b5563]">{card.text[locale]}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
