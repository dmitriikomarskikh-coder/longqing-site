import type {Metadata} from "next";
import {setRequestLocale} from "next-intl/server";
import {Suspense} from "react";
import {ContactForm} from "@/components/ContactForm";
import type {Locale} from "@/i18n/routing";

const copy = {
  ru: {
    title: "Контакты",
    description:
      "Свяжитесь с LONGQING через форму заявки. Мы обрабатываем B2B-запросы на промышленное оборудование и запчасти для компаний из России и СНГ.",
    email: "Эл. почта",
    request: "Основной канал",
    requestText: "Отправьте заявку через форму: укажите артикулы, спецификацию или описание задачи.",
    address: "Адрес"
  },
  en: {
    title: "Contacts",
    description:
      "Contact LONGQING through the request form. We process B2B requests for industrial equipment and spare parts for companies in Russia and the CIS.",
    email: "E-mail",
    request: "Primary channel",
    requestText: "Send a request through the form with part numbers, specification, or task details.",
    address: "Address"
  },
  zh: {
    title: "联系",
    description:
      "通过询价表联系 LONGQING。我们处理俄罗斯及独联体企业的工业设备和备件 B2B 请求。",
    email: "邮箱",
    request: "主要渠道",
    requestText: "请通过表单发送零件号、规格或需求描述。",
    address: "地址"
  }
} satisfies Record<Locale, Record<string, string>>;

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const text = copy[locale];

  return {
    title: `${text.title} | LONGQING`,
    description: text.description,
    alternates: {
      canonical: `/${locale}/contacts`,
      languages: {
        ru: "/ru/contacts",
        zh: "/zh/contacts",
        en: "/en/contacts",
        "x-default": "/en/contacts"
      }
    }
  };
}

export default async function ContactsPage({
  params
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const text = copy[locale];

  return (
    <main className="bg-dark pt-20">
      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-5xl font-semibold text-text">{text.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
            {text.description}
          </p>
          <div className="mt-8 grid gap-4 text-muted md:grid-cols-3">
            <div className="rounded border border-white/10 bg-dark-2 p-5">
              <p className="text-sm uppercase text-accent">{text.email}</p>
              <p className="mt-3 text-text">office@longqingtrade.com</p>
            </div>
            <div className="rounded border border-white/10 bg-dark-2 p-5">
              <p className="text-sm uppercase text-accent">{text.request}</p>
              <p className="mt-3 leading-6 text-text">{text.requestText}</p>
            </div>
            <div className="rounded border border-white/10 bg-dark-2 p-5">
              <p className="text-sm uppercase text-accent">{text.address}</p>
              <p className="mt-3 leading-6 text-text">
                山东省济宁市高新区洸河街道红星美凯龙全球家居广场1号SOH001单元24层01-2417号
              </p>
            </div>
          </div>
        </div>
      </section>
      <Suspense>
        <ContactForm locale={locale} />
      </Suspense>
    </main>
  );
}
