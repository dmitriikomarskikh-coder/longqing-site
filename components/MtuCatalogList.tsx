"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import type {MtuPart} from "@/content/mtu-parts";
import type {Locale} from "@/i18n/routing";

const labels = {
  ru: {
    search: "Поиск по артикулу, названию или описанию",
    category: "Категория",
    allCategories: "Все категории",
    partNumber: "Артикул",
    availability: "В наличии",
    details: "Подробнее",
    quote: "Запросить КП",
    empty: "Позиции не найдены. Попробуйте изменить запрос или категорию.",
    reducedDescription:
      "Позиция доступна для обработки B2B-запроса. Описание, применимость и срок поставки уточним по артикулу и данным оборудования."
  },
  en: {
    search: "Search by part number, name or description",
    category: "Category",
    allCategories: "All categories",
    partNumber: "Part number",
    availability: "In stock",
    details: "Details",
    quote: "Request proposal",
    empty: "No parts found. Try changing the search query or category.",
    reducedDescription:
      "This item can be processed as a B2B request. Description, applicability, and lead time are confirmed by part number and equipment data."
  },
  zh: {
    search: "按零件号、名称或描述搜索",
    category: "类别",
    allCategories: "全部类别",
    partNumber: "零件号",
    availability: "有库存",
    details: "详情",
    quote: "获取报价",
    empty: "未找到相关项目。请更改搜索词或类别。",
    reducedDescription:
      "该项目可处理 B2B 询价。描述、适用性、交期将根据零件号和设备信息确认。"
  }
} satisfies Record<Locale, Record<string, string>>;

function partName(part: MtuPart, locale: Locale) {
  return locale === "ru" ? part.nameRu : part.nameEn;
}

function partDescription(part: MtuPart, locale: Locale) {
  if (part.isReducedCard) {
    return labels[locale].reducedDescription;
  }

  if (locale === "ru") {
    return part.shortDescriptionRu;
  }

  if (locale === "zh") {
    return `MTU ${part.partNumber} 可按 B2B 请求处理。适用性、交期将根据设备信息确认。`;
  }

  return `MTU ${part.partNumber} can be processed as a B2B sourcing request. Applicability and lead time are confirmed by equipment data.`;
}

export function MtuCatalogList({locale, parts}: {locale: Locale; parts: MtuPart[]}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const text = labels[locale];
  const categories = useMemo(
    () => Array.from(new Set(parts.map((part) => part.category))).sort((a, b) => a.localeCompare(b)),
    [parts]
  );
  const filteredParts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return parts.filter((part) => {
      const matchesCategory = category === "all" || part.category === category;
      const searchable =
        `${part.partNumber} ${part.nameRu} ${part.nameEn} ${part.shortDescriptionRu} ${part.functionRu} ${part.compatibilityNoteRu} ${part.category}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, parts, query]);

  return (
    <div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_280px]">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          {text.search}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            type="search"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          {text.category}
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">{text.allCategories}</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredParts.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredParts.map((part) => {
            const detailHref = `/${locale}/catalog/mtu/${part.slug}`;

            return (
              <article
                key={part.slug}
                className="flex min-h-[320px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/70 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">
                    MTU
                  </span>
                  <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {text.availability}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold leading-6 text-slate-950">
                  <Link href={detailHref} className="transition hover:text-teal-700">
                    {partName(part, locale)}
                  </Link>
                </h2>
                {locale === "ru" ? (
                  <p className="mt-1 text-sm font-medium text-slate-500">{part.nameEn}</p>
                ) : null}
                <Link
                  href={detailHref}
                  className="mt-3 text-base font-semibold text-slate-950 transition hover:text-teal-700"
                >
                  {text.partNumber}: MTU {part.partNumber}
                </Link>
                <p className="mt-2 text-sm font-medium text-teal-700">{part.category}</p>
                <Link
                  href={detailHref}
                  className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600 transition hover:text-slate-950"
                >
                  {partDescription(part, locale)}
                </Link>
                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={detailHref}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-teal-500 hover:text-teal-700"
                    >
                      {text.details}
                    </Link>
                    <Link
                      href={`${detailHref}#contact-form`}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
                    >
                      {text.quote}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          {text.empty}
        </div>
      )}
    </div>
  );
}
