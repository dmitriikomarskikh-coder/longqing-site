import Image from "next/image";
import Link from "next/link";
import type {Locale} from "@/i18n/routing";

const disclaimer: Record<Locale, string> = {
  ru: "LONGQING работает как независимый поставщик и не представляет производителей, бренды которых указаны на сайте. Названия брендов используются только для идентификации оборудования, запчастей и совместимых компонентов.",
  zh: "LONGQING 作为独立供应方开展业务，并不代表本网站提及品牌所属的制造商。品牌名称仅用于识别设备、备件和兼容部件。",
  en: "LONGQING operates as an independent supplier and does not represent the manufacturers whose brands are mentioned on this website. Brand names are used only to identify equipment, spare parts and compatible components."
};

const phoneDisplay = "+7 905 074 97 77";
const phoneHref = "tel:+79050749777";

export function Footer({locale}: {locale: Locale}) {
  return (
    <footer className="border-t border-border-dark bg-dark px-5 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Link href={`/${locale}`} className="inline-flex items-center">
            <Image
              src="/long_logo.png"
              alt="LONGQING Trade"
              width={1200}
              height={243}
              className="h-9 w-auto max-w-[190px] object-contain"
            />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            ООО «Шаньдун Лунцин Интернэшнл Трейдинг»
          </p>
          <p className="mt-2 text-sm text-muted">office@longqingtrade.com</p>
          <a className="mt-2 block text-sm text-text transition hover:text-accent" href={phoneHref}>
            {phoneDisplay}
          </a>
        </div>
        <div className="grid gap-6">
          <nav className="flex flex-wrap gap-5 text-sm text-muted">
            <Link href={`/${locale}/contacts`}>
              {locale === "ru" ? "Контакты" : locale === "zh" ? "联系" : "Contacts"}
            </Link>
            <Link href={`/${locale}/privacy`}>
              {locale === "ru"
                ? "Политика конфиденциальности"
                : locale === "zh"
                  ? "隐私政策"
                  : "Privacy"}
            </Link>
            <Link href={`/${locale}/terms`}>
              {locale === "ru" ? "Пользовательское соглашение" : locale === "zh" ? "条款" : "Terms"}
            </Link>
          </nav>
          <p className="text-xs leading-5 text-muted">{disclaimer[locale]}</p>
        </div>
      </div>
    </footer>
  );
}
