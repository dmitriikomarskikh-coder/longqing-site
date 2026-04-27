import {Cog, PackageSearch, Settings, Truck} from "lucide-react";
import type {Locale} from "@/i18n/routing";
import type {Service} from "@/lib/types";

const icons = [PackageSearch, Cog, Settings, Truck];

export function Services({
  locale,
  services
}: {
  locale: Locale;
  services: Service[];
}) {
  return (
    <section className="bg-dark px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {locale === "ru" ? "УСЛУГИ" : locale === "zh" ? "服务" : "Services"}
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-text md:text-5xl">
              {locale === "ru"
                ? "Что мы делаем"
                : locale === "zh"
                  ? "服务范围"
                  : "What we do"}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-muted">
            {locale === "ru"
              ? "Подбираем технические решения под задачу, бюджет, сроки и доступность."
              : locale === "zh"
                ? "根据任务、预算、交期和供应可得性选择技术方案。"
                : "We match technical options to task, budget, lead time, and supply availability."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = icons[index % icons.length];

            return (
              <article
                key={service.id}
                className="rounded border border-white/10 bg-dark-2 p-6"
              >
                <div className="grid size-11 place-items-center rounded bg-accent/12 text-accent">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-text">{service.title[locale]}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {service.description[locale]}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
