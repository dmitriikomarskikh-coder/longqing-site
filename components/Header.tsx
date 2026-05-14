"use client";

import {Globe2, Menu, Search, X} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useMemo, useRef, useState} from "react";
import brands from "@/content/brands.json";
import categories from "@/content/category-pages.json";
import {mtuParts} from "@/content/mtu-parts";
import {locales, type Locale} from "@/i18n/routing";
import {cn} from "@/lib/utils";

const navLabels: Record<
  Locale,
  {home: string; brands: string; catalog: string; news: string; contacts: string; quote: string}
> = {
  ru: {
    home: "Главная",
    brands: "Бренды",
    catalog: "Каталог",
    news: "Новости",
    contacts: "Контакты",
    quote: "Получить КП"
  },
  zh: {home: "首页", brands: "品牌", catalog: "目录", news: "新闻", contacts: "联系", quote: "获取报价"},
  en: {home: "Home", brands: "Brands", catalog: "Catalog", news: "News", contacts: "Contacts", quote: "Get proposal"}
};

const searchLabels: Record<
  Locale,
  {placeholder: string; empty: string; parts: string; brands: string; sections: string}
> = {
  ru: {
    placeholder: "Поиск по артикулу, бренду или разделу",
    empty: "Ничего не найдено",
    parts: "Запчасти",
    brands: "Бренды",
    sections: "Разделы"
  },
  en: {
    placeholder: "Search by part number, brand or section",
    empty: "No results found",
    parts: "Parts",
    brands: "Brands",
    sections: "Sections"
  },
  zh: {
    placeholder: "按零件号、品牌或栏目搜索",
    empty: "未找到结果",
    parts: "备件",
    brands: "品牌",
    sections: "栏目"
  }
};

type SearchItem = {
  href: string;
  title: string;
  subtitle: string;
  group: string;
  keywords: string;
};

export function Header({locale}: {locale: Locale}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const nav = navLabels[locale];
  const searchText = searchLabels[locale];

  const searchIndex = useMemo<SearchItem[]>(() => {
    const brandItems = brands.map((brand) => ({
      href: `/${locale}/brands/${brand.slug}`,
      title: brand.name[locale],
      subtitle: searchText.brands,
      group: searchText.brands,
      keywords: `${brand.name.ru} ${brand.name.en} ${brand.name.zh} ${brand.slug}`
    }));
    const categoryItems = categories.map((category) => ({
      href: `/${locale}/categories/${category.slug}`,
      title: category.title[locale],
      subtitle: searchText.sections,
      group: searchText.sections,
      keywords: `${category.title.ru} ${category.title.en} ${category.title.zh} ${category.slug}`
    }));
    const mtuItems = mtuParts.map((part) => ({
      href: `/${locale}/catalog/mtu/${part.slug}`,
      title: `MTU ${part.partNumber}`,
      subtitle: locale === "ru" ? part.nameRu : part.nameEn,
      group: searchText.parts,
      keywords: `${part.partNumber} ${part.nameRu} ${part.nameEn} ${part.shortDescriptionRu} ${part.functionRu} ${part.compatibilityNoteRu} ${part.category} ${part.slug}`
    }));

    return [
      {
        href: `/${locale}/catalog/mtu`,
        title: nav.catalog,
        subtitle: "MTU",
        group: searchText.sections,
        keywords: "MTU catalog каталог mtu 目录"
      },
      ...mtuItems,
      ...brandItems,
      ...categoryItems
    ];
  }, [locale, nav.catalog, searchText.brands, searchText.parts, searchText.sections]);

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return searchIndex.slice(0, 6);
    }

    return searchIndex
      .filter((item) => `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [searchIndex, searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeMenu = () => setIsOpen(false);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("scroll", closeMenu, {passive: true});
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("scroll", closeMenu);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    searchInputRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isSearchOpen]);

  const localizedPath = (targetLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = targetLocale;
    return segments.join("/") || `/${targetLocale}`;
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-dark/70 backdrop-blur-md xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-dark/85 px-5 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6">
          <Link href={`/${locale}`} className="flex shrink-0 items-center">
            <Image
              src="/long_logo.png"
              alt="LONGQING Trade"
              width={1200}
              height={243}
              priority
              className="h-8 w-auto max-w-[158px] object-contain md:h-9 md:max-w-[178px]"
            />
          </Link>
          <nav className="hidden shrink-0 items-center gap-5 text-sm font-medium text-text xl:flex">
            <Link className="transition hover:text-accent" href={`/${locale}`}>
              {nav.home}
            </Link>
            <Link className="transition hover:text-accent" href={`/${locale}/brands`}>
              {nav.brands}
            </Link>
            <Link className="transition hover:text-accent" href={`/${locale}/catalog/mtu`}>
              {nav.catalog}
            </Link>
            <Link className="transition hover:text-accent" href={`/${locale}/news`}>
              {nav.news}
            </Link>
            <Link className="transition hover:text-accent" href={`/${locale}/contacts`}>
              {nav.contacts}
            </Link>
          </nav>
          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <Link href={`/${locale}#contact`} className="btn-primary h-9 px-3 text-[13px]">
              {nav.quote}
            </Link>
            <button
              type="button"
              aria-label="Search"
              className="grid size-10 place-items-center rounded border border-white/10 text-muted transition hover:border-accent hover:text-accent"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={18} />
            </button>
            <div className="flex items-center gap-1 rounded border border-white/10 p-1">
              <Globe2 size={16} className="ml-2 text-muted" />
              {locales.map((item) => (
                <Link
                  key={item}
                  href={localizedPath(item)}
                  className={cn(
                    "rounded px-2 py-1 text-xs uppercase text-muted transition hover:text-text",
                    item === locale && "bg-white/10 text-text"
                  )}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 xl:hidden">
            <button
              type="button"
              aria-label="Search"
              className="grid size-10 place-items-center rounded border border-white/10 text-text transition hover:border-accent hover:text-accent"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={20} />
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="grid size-10 place-items-center rounded border border-white/10 text-text"
              onClick={() => setIsOpen((value) => !value)}
            >
              {isOpen ? <X size={24} strokeWidth={2.2} /> : <Menu size={24} strokeWidth={2.2} />}
            </button>
          </div>
        </div>
        {isOpen ? (
          <div className="mx-[-20px] border-b border-accent/35 bg-dark-2/95 px-5 pb-5 pt-2 shadow-[0_20px_45px_rgba(0,0,0,0.36)] backdrop-blur xl:hidden">
            <div className="mx-auto grid max-w-7xl gap-4 text-sm font-medium text-text">
              <Link href={`/${locale}`} onClick={() => setIsOpen(false)}>
                {nav.home}
              </Link>
              <Link href={`/${locale}/brands`} onClick={() => setIsOpen(false)}>
                {nav.brands}
              </Link>
              <Link href={`/${locale}/catalog/mtu`} onClick={() => setIsOpen(false)}>
                {nav.catalog}
              </Link>
              <button
                type="button"
                className="flex h-11 items-center justify-center gap-2 rounded border border-white/10 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
                onClick={() => {
                  setIsOpen(false);
                  setIsSearchOpen(true);
                }}
              >
                <Search size={16} />
                {locale === "ru" ? "Поиск" : locale === "zh" ? "搜索" : "Search"}
              </button>
              <Link href={`/${locale}/news`} onClick={() => setIsOpen(false)}>
                {nav.news}
              </Link>
              <Link href={`/${locale}/contacts`} onClick={() => setIsOpen(false)}>
                {nav.contacts}
              </Link>
              <Link
                href={`/${locale}#contact`}
                className="btn-primary h-11 px-4 text-sm"
                onClick={() => setIsOpen(false)}
              >
                {nav.quote}
              </Link>
              <div className="flex gap-2">
                {locales.map((item) => (
                  <Link
                    key={item}
                    href={localizedPath(item)}
                    className={cn(
                      "rounded border border-white/10 px-3 py-2 uppercase",
                      item === locale && "border-accent text-accent"
                    )}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </header>
      {isSearchOpen ? (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 bg-dark/70 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative mx-auto mt-24 w-[min(92vw,720px)] rounded-2xl border border-white/10 bg-dark-2 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <Search size={20} className="shrink-0 text-accent" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchText.placeholder}
                type="search"
                className="h-11 min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-muted"
              />
              <button
                type="button"
                aria-label="Close search"
                className="grid size-9 place-items-center rounded border border-white/10 text-muted transition hover:border-accent hover:text-accent"
                onClick={() => setIsSearchOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              {searchResults.length ? (
                <div className="grid gap-2">
                  {searchResults.map((item) => (
                    <Link
                      key={`${item.group}-${item.href}`}
                      href={item.href}
                      className="rounded-xl border border-white/10 bg-dark p-3 transition hover:border-accent/70 hover:bg-dark/80"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                        {item.group}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-text">{item.title}</p>
                      <p className="mt-1 text-xs text-muted">{item.subtitle}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-white/10 bg-dark p-4 text-sm text-muted">
                  {searchText.empty}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
