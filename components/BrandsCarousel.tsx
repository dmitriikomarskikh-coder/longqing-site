import Link from "next/link";
import type {Locale} from "@/i18n/routing";
import type {Brand} from "@/lib/types";

type BrandCarouselItem = Pick<Brand, "slug" | "name">;

export function BrandsCarousel({
  locale,
  brands
}: {
  locale: Locale;
  brands: BrandCarouselItem[];
}) {
  const midpoint = Math.ceil(brands.length / 2);
  const firstRow = [...brands, ...brands];
  const secondRowBase = [...brands.slice(midpoint), ...brands.slice(0, midpoint)].reverse();
  const secondRow = [...secondRowBase, ...secondRowBase];

  const renderBrand = (brand: BrandCarouselItem, index: number, row: string) => (
    <Link
      key={`${row}-${brand.slug}-${index}`}
      href={`/${locale}/brands/${brand.slug}`}
      className="brand-tile flex h-24 w-52 shrink-0 items-center justify-center rounded border px-5 text-center text-sm font-semibold text-dark md:h-28 md:w-60"
    >
      {brand.name[locale]}
    </Link>
  );

  return (
    <section className="overflow-hidden bg-[#f5f5f5] px-5 py-20 text-dark">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {locale === "ru" ? "БРЕНДЫ" : locale === "zh" ? "品牌" : "Brands"}
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-dark md:text-5xl">
              {locale === "ru"
                ? "Бренды и производители"
                : locale === "zh"
                  ? "品牌与制造商"
                  : "Brands and manufacturers"}
            </h2>
          </div>
          <Link
            href={`/${locale}/brands`}
            className="text-sm font-semibold text-accent transition hover:text-accent-hover"
          >
            {locale === "ru" ? "Все бренды" : locale === "zh" ? "全部品牌" : "All brands"}
          </Link>
        </div>
      </div>
      <div className="-mx-5 grid gap-5 overflow-x-auto md:overflow-hidden">
        <div className="brand-marquee flex w-max gap-4 px-5 md:gap-5">
          {firstRow.map((brand, index) => renderBrand(brand, index, "first"))}
        </div>
        <div className="brand-marquee-reverse flex w-max gap-4 px-5 md:gap-5">
          {secondRow.map((brand, index) => renderBrand(brand, index, "second"))}
        </div>
      </div>
    </section>
  );
}
