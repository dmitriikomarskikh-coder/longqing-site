import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {LegalPage} from '@/components/site/simple-page';
import {buildMetadata} from '@/lib/metadata';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'meta.cookies'});
  return buildMetadata({locale, pathname: '/cookies', title: t('title'), description: t('description')});
}

export default async function CookiesPage({params}: {params: Promise<{locale: string}>}) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'pages'});
  const paragraphs = {
    en: ['The website is built to use only essential functionality by default.', 'Future analytics, security or communication integrations may introduce cookies or similar technologies.', 'If such services are added, this policy should be updated with clear information about purpose, provider and retention.'],
    ru: ['Сайт по умолчанию рассчитан только на необходимую функциональность.', 'Будущие интеграции аналитики, безопасности или коммуникаций могут добавить cookie или похожие технологии.', 'Если такие сервисы будут добавлены, эту политику следует обновить с указанием цели, поставщика и сроков хранения.'],
    zh: ['本网站默认仅使用必要功能。', '未来如加入分析、安全或沟通服务，可能会使用Cookie或类似技术。', '如添加此类服务，应更新本政策并说明用途、服务方和保留期限。'],
  }[locale];
  return <LegalPage title={t('cookiesTitle')} lead={t('cookiesLead')} paragraphs={paragraphs} />;
}
