import {setRequestLocale} from "next-intl/server";
import {Suspense} from "react";
import {BrandsCarousel} from "@/components/BrandsCarousel";
import {ChinaStock} from "@/components/ChinaStock";
import {ContactForm} from "@/components/ContactForm";
import {Hero} from "@/components/Hero";
import {NewsTeaser} from "@/components/NewsTeaser";
import {SupplyIntro} from "@/components/SupplyIntro";
import {WorldMap} from "@/components/WorldMap";
import brands from "@/content/brands.json";
import geography from "@/content/geography.json";
import type {Locale} from "@/i18n/routing";
import {getLatestNews} from "@/lib/news";

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;

  if (locale === "ru") {
    return {
      title:
        "LONGQING Trade — поставка промышленного оборудования и запчастей из Китая",
      description:
        "Промышленное оборудование и запчасти из Китая для предприятий России и СНГ. MTU, Cummins, Mitsubishi и другие бренды. Подбор по артикулу, спецификации или техническому заданию.",
      alternates: {
        canonical: "/ru",
        languages: {
          ru: "/ru",
          zh: "/zh",
          en: "/en",
          "x-default": "/en"
        }
      }
    };
  }

  return {
    title:
      locale === "zh"
        ? "LONGQING Trade — 来自中国和亚洲的工业设备及备件供应"
        : "LONGQING Trade — Industrial Equipment and Spare Parts from China",
    description:
      locale === "zh"
        ? "为俄罗斯及独联体企业供应来自中国的工业设备和备件。"
        : "Industrial equipment and spare parts from China for companies in Russia and the CIS.",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ru: "/ru",
        zh: "/zh",
        en: "/en",
        "x-default": "/en"
      }
    }
  };
}

export default async function HomePage({
  params
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const latestNews = await getLatestNews(locale, 3);
  const brandCarouselItems = brands.map(({slug, name}) => ({slug, name}));

  return (
    <main>
      <Hero locale={locale} variant="image" src="/images/hero-placeholder.jpg" />
      <SupplyIntro locale={locale} />
      <ChinaStock locale={locale} />
      <BrandsCarousel locale={locale} brands={brandCarouselItems} />
      <WorldMap locale={locale} geography={geography} />
      <NewsTeaser locale={locale} items={latestNews} />
      <Suspense>
        <ContactForm locale={locale} />
      </Suspense>
    </main>
  );
}
