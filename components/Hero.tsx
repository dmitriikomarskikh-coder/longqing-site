import Link from "next/link";
import type {Locale} from "@/i18n/routing";

type HeroProps = {
  locale: Locale;
  variant: "image" | "video";
  src: string;
  poster?: string;
};

const copy: Record<
  Locale,
  {title: string; subtitle: string; cta: string}
> = {
  ru: {
    title: "Промышленное оборудование и запчасти со всего мира",
    subtitle:
      "Подбираем, закупаем и доставляем комплектующие для предприятий России и СНГ",
    cta: "Получить коммерческое предложение"
  },
  zh: {
    title: "来自中国及亚洲的工业设备和备件供应",
    subtitle: "为俄罗斯及独联体企业匹配、采购并交付设备和部件",
    cta: "获取报价方案"
  },
  en: {
    title: "Industrial Equipment and Spare Parts from China and Asia",
    subtitle:
      "We source, purchase, and deliver equipment and components for companies in Russia and the CIS",
    cta: "Get a commercial proposal"
  }
};

export function Hero({locale, variant, src, poster}: HeroProps) {
  const text = copy[locale];

  return (
    <section className="relative flex min-h-[620px] items-center overflow-hidden bg-dark px-5 pb-[42px] pt-[60px] md:min-h-[76vh] lg:min-h-[700px]">
      {variant === "video" ? (
        <video
          className="absolute inset-0 size-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{backgroundImage: `url(${src})`}}
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,18,22,0.96)_0%,rgba(14,18,22,0.82)_45%,rgba(14,18,22,0.45)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,18,22,0.16)_0%,rgba(14,18,22,0.36)_70%,#0e1216_100%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12%] top-1/2 hidden h-[520px] w-[640px] -translate-y-1/2 opacity-70 lg:block"
      >
        <div className="absolute inset-0 rounded border border-white/10 bg-dark-2/45 backdrop-blur-[2px]" />
        <div className="absolute inset-8 rounded border border-accent/20" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute left-16 top-20 h-1 w-72 bg-accent/45" />
        <div className="absolute bottom-24 left-24 h-1 w-96 bg-accent/25" />
        <div className="absolute right-24 top-28 size-28 rounded-full border border-accent/25" />
        <div className="absolute bottom-28 right-36 size-40 rounded-full border border-white/10" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          {locale === "ru" ? "LONGQING TRADE" : "Longqing Trade"}
        </p>
        <h1 className="max-w-[1050px] text-[clamp(44px,5vw,72px)] font-semibold leading-[1.05] text-text">
          {locale === "ru" ? (
            <>
              <span className="md:block">Промышленное оборудование</span>{" "}
              <span className="md:block">и запчасти</span>{" "}
              <span className="md:block">со всего мира</span>
            </>
          ) : (
            text.title
          )}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted md:text-xl">
          {text.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#contact-form"
            className="btn-primary h-12 px-6 text-sm"
          >
            {text.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
