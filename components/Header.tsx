"use client";

import {Globe2, Menu, Search, X} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";
import {ContactButtons} from "@/components/ContactButtons";
import {locales, type Locale} from "@/i18n/routing";
import {cn} from "@/lib/utils";

const navLabels: Record<
  Locale,
  {home: string; brands: string; news: string; contacts: string; quote: string}
> = {
  ru: {
    home: "Главная",
    brands: "Бренды",
    news: "Новости",
    contacts: "Контакты",
    quote: "Получить КП"
  },
  zh: {home: "首页", brands: "品牌", news: "新闻", contacts: "联系", quote: "获取报价"},
  en: {home: "Home", brands: "Brands", news: "News", contacts: "Contacts", quote: "Get proposal"}
};

export function Header({locale}: {locale: Locale}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const nav = navLabels[locale];

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
          <nav className="hidden shrink-0 items-center gap-6 text-sm font-medium text-text xl:flex">
            <Link className="transition hover:text-accent" href={`/${locale}`}>
              {nav.home}
            </Link>
            <Link className="transition hover:text-accent" href={`/${locale}/brands`}>
              {nav.brands}
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
            <ContactButtons locale={locale} compact />
            <button
              type="button"
              aria-label="Search"
              className="grid size-10 place-items-center rounded border border-white/10 text-muted transition hover:border-accent hover:text-accent"
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
          <button
            type="button"
            aria-label="Menu"
            className="grid size-10 place-items-center rounded border border-white/10 text-text xl:hidden"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X size={24} strokeWidth={2.2} /> : <Menu size={24} strokeWidth={2.2} />}
          </button>
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
              <ContactButtons locale={locale} />
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
