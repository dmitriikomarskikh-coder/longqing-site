import Image from "next/image";
import Link from "next/link";
import {ContactButtons} from "@/components/ContactButtons";
import type {Locale} from "@/i18n/routing";

const disclaimer: Record<Locale, string> = {
  ru: "Все упомянутые торговые марки и логотипы являются собственностью их правообладателей. Компания не является официальным дилером, дистрибьютором или сертифицированным сервисным центром указанных производителей и осуществляет независимую поставку и ремонт оборудования, совместимого с продукцией перечисленных брендов.",
  zh: "所有提及的商标和标识均归其权利人所有。本公司并非上述制造商的官方经销商、分销商或认证服务中心，而是独立提供与相关品牌产品兼容的设备供应和维修服务。",
  en: "All mentioned trademarks and logos are the property of their respective owners. The company is not an official dealer, distributor, or certified service center of the listed manufacturers and provides independent supply and repair of equipment compatible with these brands."
};

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
          <p className="mt-2 text-sm text-muted">+7 900 000 00 00</p>
          <div className="mt-5">
            <ContactButtons locale={locale} />
          </div>
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
              {locale === "ru" ? "Условия" : locale === "zh" ? "条款" : "Terms"}
            </Link>
          </nav>
          <p className="text-xs leading-5 text-muted">{disclaimer[locale]}</p>
        </div>
      </div>
    </footer>
  );
}
