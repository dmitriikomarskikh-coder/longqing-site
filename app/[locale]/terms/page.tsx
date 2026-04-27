import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";

export default async function TermsPage({
  params
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <main className="bg-light px-5 pb-20 pt-32 text-dark">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-5xl font-semibold">
          {locale === "ru"
            ? "Пользовательское соглашение"
            : locale === "zh"
              ? "使用条款"
              : "Terms of Use"}
        </h1>
        <p className="mt-8 text-base leading-8 text-neutral-700">
          {locale === "ru"
            ? "Типовой шаблон условий использования. Финальная редакция будет добавлена перед запуском."
            : locale === "zh"
              ? "使用条款模板。正式版本将在上线前补充。"
              : "Terms template. The final version will be added before launch."}
        </p>
      </article>
    </main>
  );
}
