import type {Locale} from "@/i18n/routing";
import type {Geography} from "@/lib/types";

const workflow: Record<
  Locale,
  Array<{
    title: string;
    text: string;
  }>
> = {
  ru: [
    {
      title: "Китай",
      text: "Поиск поставщиков, складских позиций и проверка доступности по артикулу."
    },
    {
      title: "Логистика",
      text: "Подбор маршрута, документов и условий поставки под конкретный B2B-запрос."
    },
    {
      title: "Россия и СНГ",
      text: "Передача предложения, согласование сроков, оплаты и состава поставки."
    }
  ],
  en: [
    {
      title: "China",
      text: "Supplier sourcing, stock checks, and part-number based availability review."
    },
    {
      title: "Logistics",
      text: "Route, documentation, and delivery terms matched to the B2B request."
    },
    {
      title: "Russia and CIS",
      text: "Proposal preparation, lead-time confirmation, and supply coordination."
    }
  ],
  zh: [
    {
      title: "中国",
      text: "按零件号核查供应商、库存平台和可处理的备件需求。"
    },
    {
      title: "物流",
      text: "根据 B2B 询价匹配运输路线、文件和交付条件。"
    },
    {
      title: "俄罗斯及独联体",
      text: "准备报价，确认交期，并协调供货流程。"
    }
  ]
};

const summary: Record<Locale, string> = {
  ru: "Работаем с промышленными предприятиями, сервисными подрядчиками и закупочными командами. География зависит от задачи: подбор в Китае, поставка со склада, заказ под спецификацию или комплексная логистика.",
  en: "We work with industrial companies, service contractors, and procurement teams. Geography depends on the request: China sourcing, stock supply, specification-based orders, or coordinated logistics.",
  zh: "我们服务工业企业、服务承包商和采购团队。合作范围取决于具体需求： 中国寻源、库存供货、按规格采购或综合物流协调。"
};

export function WorldMap({
  locale,
  geography
}: {
  locale: Locale;
  geography: Geography;
}) {
  return (
    <section className="bg-dark px-5 pb-[60px] pt-[60px]">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {locale === "ru" ? "ГЕОГРАФИЯ" : locale === "zh" ? "区域" : "Geography"}
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-text md:text-5xl">
            {locale === "ru"
              ? "География работы"
              : locale === "zh"
                ? "供应区域"
                : "Supply geography"}
          </h2>
          <div className="mt-8 grid gap-3">
            {geography.countries.map((item) => (
              <div
                key={item.id}
                className="rounded border border-white/10 bg-dark-2 p-4"
              >
                <p className="font-semibold text-text">{item.name[locale]}</p>
                <p className="mt-1 text-sm text-muted">{item.region[locale]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded border border-white/10 bg-dark-2 p-6">
          <p className="max-w-2xl text-base leading-7 text-muted">{summary[locale]}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {workflow[locale].map((item, index) => (
              <div
                key={item.title}
                className="rounded border border-white/10 bg-dark p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-sm font-semibold text-accent">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded border border-accent/20 bg-accent/5 p-4 text-sm leading-6 text-muted">
            {locale === "ru"
              ? "Для запроса достаточно отправить артикул, модель оборудования, серийный номер или спецификацию. Менеджер уточнит применимость, срок и формат поставки."
              : locale === "zh"
                ? "提交零件号、设备型号、序列号或规格即可。经理将确认适用性、交期和供货方式。"
                : "Send a part number, equipment model, serial number, or specification. A manager will confirm applicability, lead time, and supply format."}
          </div>
        </div>
      </div>
    </section>
  );
}
