import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {canonicalUrl, localeAlternates, site} from '@/lib/site';

type MetadataInput = {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
};

export function buildMetadata({locale, pathname, title, description}: MetadataInput): Metadata {
  const url = canonicalUrl(locale, pathname);
  const siteName = site.names[locale];

  return {
    metadataBase: new URL(site.url),
    title,
    description,
    alternates: {
      canonical: url,
      languages: localeAlternates(pathname),
    },
    openGraph: {
      type: 'website',
      url,
      siteName,
      title,
      description,
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
