import Link from "next/link";
import {stockItems} from "@/content/stock-items";
import type {Locale} from "@/i18n/routing";

export function ChinaStock({locale}: {locale: Locale}) {
  return (
    <section className="bg-dark-2 px-5 pb-[60px] pt-[60px]">
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {locale === "ru" ? "НАЛИЧИЕ В КИТАЕ" : locale === "zh" ? "中国库存" : "Stock"}
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-text md:text-5xl">
            {locale === "ru"
              ? "Позиции в наличии на складе в Китае"
              : locale === "zh"
                ? "中国仓库现货产品"
                : "Items in stock in China"}
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            {locale === "ru"
              ? "Часть оборудования и запчастей уже находится на складе в Китае. Цены, остатки и сроки отгрузки подтверждаются по запросу."
              : locale === "zh"
                ? "部分设备和备件已在中国仓库。价格、库存和交期需按请求确认。"
                : "Some equipment and spare parts are already in a warehouse in China. Availability and delivery terms are confirmed on request."}
          </p>
          <Link
            href="#contact-form"
            className="btn-primary mt-8 h-12 px-6 text-sm"
          >
            {locale === "ru"
              ? "Запросить наличие и срок отгрузки"
              : locale === "zh"
                ? "查询库存和交期"
            : "Request availability and lead time"}
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stockItems.slice(0, 6).map((item) => (
            <article
              key={item.id}
              className="rounded border border-white/10 bg-dark p-4 shadow-[0_18px_38px_rgba(0,0,0,0.16)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    {item.brand}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-muted">
                    {item.partNumber}
                  </p>
                </div>
                <span className="rounded bg-accent/12 px-2.5 py-1 text-xs font-semibold text-accent">
                  {item.status[locale]}
                </span>
              </div>
              <h3 className="mt-3 min-h-[52px] text-base font-semibold leading-6 text-text">
                {item.name[locale]}
              </h3>
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                  <dt className="text-muted">
                    {locale === "ru" ? "Наличие" : locale === "zh" ? "库存" : "Stock"}
                  </dt>
                  <dd className="text-right font-semibold text-text">{item.location[locale]}</dd>
                </div>
                {item.quantity ? (
                  <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                    <dt className="text-muted">
                      {locale === "ru" ? "Количество" : locale === "zh" ? "数量" : "Quantity"}
                    </dt>
                    <dd className="text-right font-semibold text-text">
                      {item.quantity} {item.unit}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4 border-t border-white/10 pt-2">
                  <dt className="text-muted">
                    {locale === "ru" ? "Подготовка" : locale === "zh" ? "准备" : "Preparation"}
                  </dt>
                  <dd className="text-right font-semibold text-text">
                    {item.leadTime[locale]}
                  </dd>
                </div>
              </dl>
              <Link
                href={
                  item.slug === "forsunka-mtu-x52407500053"
                    ? `/${locale}/stock/${item.slug}`
                    : "#contact-form"
                }
                className="btn-primary mt-4 h-10 w-full px-4 text-sm"
              >
                {locale === "ru" ? "Запросить КП" : locale === "zh" ? "查询报价" : "Request proposal"}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
