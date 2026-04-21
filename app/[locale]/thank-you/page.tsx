import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/routing';
import {Button} from '@/components/ui/button';
import {ContentBand, PageHero} from '@/components/site/simple-page';
import {buildMetadata} from '@/lib/metadata';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'meta.thankYou'});
  return buildMetadata({locale, pathname: '/thank-you', title: t('title'), description: t('description')});
}

export default async function ThankYouPage({params}: {params: Promise<{locale: string}>}) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'pages'});
  const nav = await getTranslations({locale, namespace: 'nav'});
  return (
    <>
      <PageHero title={t('thankYouTitle')} lead={t('thankYouLead')} />
      <ContentBand><Button asChild><Link href="/">{nav('home')}</Link></Button></ContentBand>
    </>
  );
}
