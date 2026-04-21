import type {MetadataRoute} from 'next';
import {locales} from '@/i18n/routing';
import {canonicalUrl, localeAlternates, pathnames} from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return pathnames.flatMap((pathname) =>
    locales.map((locale) => ({
      url: canonicalUrl(locale, pathname),
      lastModified: new Date(),
      changeFrequency: pathname === '/' ? 'weekly' : 'monthly',
      priority: pathname === '/' ? 1 : 0.7,
      alternates: {
        languages: localeAlternates(pathname),
      },
    })),
  );
}
