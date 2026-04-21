import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {ItemsPage} from '@/components/site/simple-page';
import {buildMetadata} from '@/lib/metadata';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'meta.industries'});
  return buildMetadata({locale, pathname: '/industries', title: t('title'), description: t('description')});
}

export default async function IndustriesPage({params}: {params: Promise<{locale: string}>}) {
  const locale = (await params).locale as Locale;
  const pages = await getTranslations({locale, namespace: 'pages'});
  const sections = await getTranslations({locale, namespace: 'sections'});
  return <ItemsPage title={pages('industriesTitle')} lead={pages('industriesLead')} items={sections.raw('industries') as string[]} />;
}
