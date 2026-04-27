import Link from "next/link";
import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";

export default async function ThanksPage({
  params
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <main className="grid min-h-screen place-items-center bg-dark px-5 pt-20">
      <section className="max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
          Longqing
        </p>
        <h1 className="mt-4 text-5xl font-semibold text-text">
          {locale === "ru"
            ? "Заявка принята"
            : locale === "zh"
              ? "需求已收到"
              : "Request received"}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          {locale === "ru"
            ? "Мы свяжемся в течение 1 рабочего дня."
            : locale === "zh"
              ? "我们将在 1 个工作日内与您联系。"
              : "We will contact you within 1 business day."}
        </p>
        <Link
          href={`/${locale}`}
          className="btn-primary mt-8 h-12 px-6 text-sm"
        >
          {locale === "ru" ? "На главную" : locale === "zh" ? "返回首页" : "Home"}
        </Link>
      </section>
    </main>
  );
}
