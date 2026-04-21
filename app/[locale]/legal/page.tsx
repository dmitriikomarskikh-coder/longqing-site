import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {LegalPage} from '@/components/site/simple-page';
import {buildMetadata} from '@/lib/metadata';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'meta.legal'});
  return buildMetadata({locale, pathname: '/legal', title: t('title'), description: t('description')});
}

export default async function LegalNoticePage({params}: {params: Promise<{locale: string}>}) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'pages'});
  const paragraphs = {
    en: ['Website content is provided for general information and preliminary business communication.', 'Product availability, service scope, timing, pricing and technical suitability must be confirmed separately in writing.', 'No specific manufacturer relationship, authorization or representation is implied by this website.', 'Use of this website does not create a contract, agency relationship or binding procurement obligation.'],
    ru: ['Материалы сайта предоставлены для общей информации и предварительной деловой коммуникации.', 'Наличие продукции, объем услуг, сроки, цены и техническая применимость должны отдельно подтверждаться в письменной форме.', 'Сайт не подразумевает отношений, авторизации или представительства от имени каких-либо конкретных производителей.', 'Использование сайта не создает договор, агентские отношения или обязательство по закупке.'],
    zh: ['网站内容仅用于一般信息和初步商务沟通。', '产品可供应性、服务范围、时间、价格和技术适用性须另行书面确认。', '本网站不暗示与任何特定制造商存在关系、授权或代理。', '使用本网站不构成合同、代理关系或有约束力的采购义务。'],
  }[locale];
  return <LegalPage title={t('legalTitle')} lead={t('legalLead')} paragraphs={paragraphs} />;
}
