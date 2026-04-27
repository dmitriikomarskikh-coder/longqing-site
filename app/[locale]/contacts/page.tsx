import {setRequestLocale} from "next-intl/server";
import {Suspense} from "react";
import {ContactButtons} from "@/components/ContactButtons";
import {ContactForm} from "@/components/ContactForm";
import type {Locale} from "@/i18n/routing";

export default async function ContactsPage({
  params
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <main className="bg-dark pt-20">
      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-5xl font-semibold text-text">
            {locale === "ru" ? "Контакты" : locale === "zh" ? "联系" : "Contacts"}
          </h1>
          <div className="mt-8 grid gap-4 text-muted md:grid-cols-3">
            <div className="rounded border border-white/10 bg-dark-2 p-5">
              <p className="text-sm uppercase text-accent">
                {locale === "ru" ? "Эл. почта" : locale === "zh" ? "邮箱" : "E-mail"}
              </p>
              <p className="mt-3 text-text">office@longqingtrade.com</p>
            </div>
            <div className="rounded border border-white/10 bg-dark-2 p-5">
              <p className="text-sm uppercase text-accent">
                {locale === "ru" ? "Телефон" : locale === "zh" ? "电话" : "Phone"}
              </p>
              <p className="mt-3 text-text">+7 900 000 00 00</p>
            </div>
            <div className="rounded border border-white/10 bg-dark-2 p-5">
              <p className="text-sm uppercase text-accent">
                {locale === "ru" ? "Адрес" : locale === "zh" ? "地址" : "Address"}
              </p>
              <p className="mt-3 leading-6 text-text">
                山东省济宁市高新区洸河街道红星美凯龙全球家居广场1号SOH001单元24层01-2417号
              </p>
            </div>
          </div>
          <div className="mt-8">
            <ContactButtons locale={locale} />
          </div>
        </div>
      </section>
      <Suspense>
        <ContactForm locale={locale} />
      </Suspense>
    </main>
  );
}
