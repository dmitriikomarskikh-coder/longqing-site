import type {Locale} from '@/i18n/routing';

export const site = {
  domain: 'longqingtrade.com',
  url: 'https://longqingtrade.com',
  email: 'office@longqingtrade.com',
  phone: '+86 000 0000 0000',
  names: {
    en: 'Longqing International Trading',
    ru: 'Лунцин Интернэшнл Трейдинг',
    zh: '龙庆国际贸易',
  } satisfies Record<Locale, string>,
  address: {
    en: 'China, Shandong Province, Jining City, High-tech Zone, Guanghe Street, Red Star Macalline Global Home Furnishing Plaza, Building 1, Unit SOH001, 24F, Room 01-2417, 272000',
    ru: 'Китай, провинция Шаньдун, город Цзинин, зона высоких технологий, улица Гуанхэ, Red Star Macalline Global Home Furnishing Plaza, здание 1, блок SOH001, 24 этаж, офис 01-2417, 272000',
    zh: '山东省济宁市高新区洸河街道红星美凯龙全球家居广场1号SOH001单元24层01-2417号',
  } satisfies Record<Locale, string>,
};

export const pathnames = ['/', '/about', '/services', '/industries', '/contacts', '/privacy', '/cookies', '/legal', '/thank-you'] as const;

export function localizedPath(locale: Locale, pathname: string) {
  if (locale === 'en') return pathname;
  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
}

export function canonicalUrl(locale: Locale, pathname: string) {
  return `${site.url}${localizedPath(locale, pathname)}`;
}

export function localeAlternates(pathname: string) {
  return {
    en: canonicalUrl('en', pathname),
    ru: canonicalUrl('ru', pathname),
    zh: canonicalUrl('zh', pathname),
    'x-default': canonicalUrl('en', pathname),
  };
}
