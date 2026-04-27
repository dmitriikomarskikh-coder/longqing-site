import Link from "next/link";
import {setRequestLocale} from "next-intl/server";
import brands from "@/content/brands.json";
import type {Locale} from "@/i18n/routing";
import type {Brand} from "@/lib/types";

export default async function BrandsPage({
  params
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const list = brands as Brand[];

  return (
    <main className="bg-dark px-5 pb-20 pt-32">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-semibold text-text">
          {locale === "ru" ? "Бренды" : locale === "zh" ? "品牌" : "Brands"}
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {list.map((brand) => (
            <Link
              key={brand.slug}
              href={`/${locale}/brands/${brand.slug}`}
              className="brand-tile flex min-h-28 items-center justify-center rounded border p-5 text-center"
            >
              <h2 className="text-xl font-semibold text-dark">{brand.name[locale]}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
