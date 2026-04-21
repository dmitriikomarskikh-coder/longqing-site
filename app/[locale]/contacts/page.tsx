import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {ContactsPageContent} from '@/components/site/simple-page';
import {buildMetadata} from '@/lib/metadata';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'meta.contacts'});
  return buildMetadata({locale, pathname: '/contacts', title: t('title'), description: t('description')});
}

export default async function ContactsPage({params}: {params: Promise<{locale: string}>}) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'pages'});
  return <ContactsPageContent locale={locale} title={t('contactsTitle')} lead={t('contactsLead')} />;
}
