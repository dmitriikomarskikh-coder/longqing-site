import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";

export default async function PrivacyPage({
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
            ? "Политика конфиденциальности"
            : locale === "zh"
              ? "隐私政策"
              : "Privacy Policy"}
        </h1>
        <p className="mt-8 text-base leading-8 text-neutral-700">
          {locale === "ru"
            ? "Типовой шаблон политики конфиденциальности. Финальная юридическая редакция будет добавлена перед запуском."
            : locale === "zh"
              ? "隐私政策模板。正式法律版本将在上线前补充。"
              : "Privacy policy template. The final legal version will be added before launch."}
        </p>
      </article>
    </main>
  );
}
