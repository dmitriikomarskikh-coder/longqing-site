import type {Locale} from "@/i18n/routing";

const labels: Record<Locale, {title: string; telegram: string; wechat: string; max: string}> = {
  ru: {
    title: "Связаться с нами",
    telegram: "Telegram",
    wechat: "WeChat",
    max: "Max"
  },
  zh: {
    title: "联系我们",
    telegram: "Telegram",
    wechat: "WeChat",
    max: "Max"
  },
  en: {
    title: "Contact us",
    telegram: "Telegram",
    wechat: "WeChat",
    max: "Max"
  }
};

export function ContactButtons({locale, compact = false}: {locale: Locale; compact?: boolean}) {
  const text = labels[locale];
  const className = compact
    ? "btn-contact h-9 whitespace-nowrap px-3 text-[13px]"
    : "btn-contact h-10 whitespace-nowrap px-4 text-sm";

  return (
    <div className={compact ? "flex flex-nowrap items-center gap-2" : "flex flex-wrap items-center gap-2"}>
      {!compact ? <span className="mr-1 text-sm text-muted">{text.title}</span> : null}
      <a href="#" aria-label={`${text.title}: Telegram`} className={className}>
        {text.telegram}
      </a>
      <a href="#" aria-label={`${text.title}: WeChat`} className={className}>
        {text.wechat}
      </a>
      <a href="#" aria-label={`${text.title}: Max`} className={className}>
        {text.max}
      </a>
    </div>
  );
}
