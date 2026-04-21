import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {ContentBand, PageHero} from '@/components/site/simple-page';
import {buildMetadata} from '@/lib/metadata';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'meta.about'});
  return buildMetadata({locale, pathname: '/about', title: t('title'), description: t('description')});
}

export default async function AboutPage({params}: {params: Promise<{locale: string}>}) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'pages'});
  return (
    <>
      <PageHero
        title={t('aboutTitle')}
        lead={t('aboutLead')}
        backgroundImage="https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1600&q=80"
      />
      <ContentBand>
        <div className="mx-auto max-w-3xl text-lg leading-9 text-slate-700">{t('aboutBody')}</div>
      </ContentBand>
    </>
  );
}
