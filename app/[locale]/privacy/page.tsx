import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {LegalPage} from '@/components/site/simple-page';
import {buildMetadata} from '@/lib/metadata';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'meta.privacy'});
  return buildMetadata({locale, pathname: '/privacy', title: t('title'), description: t('description')});
}

export default async function PrivacyPage({params}: {params: Promise<{locale: string}>}) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'pages'});
  const paragraphs = {
    en: ['We collect only information voluntarily provided through inquiry forms or direct business communication.', 'Information may include name, company, email, phone or messenger details, message content and related technical context.', 'This information is used to review requests, respond to inquiries and maintain business communication. It is not sold or used for unrelated advertising.', 'Requests to update or delete submitted information can be sent to office@longqingtrade.com.'],
    ru: ['Мы собираем только информацию, добровольно переданную через формы запроса или прямую деловую коммуникацию.', 'Информация может включать имя, компанию, email, телефон или мессенджер, текст сообщения и связанный технический контекст.', 'Эти данные используются для изучения запросов, ответа на обращения и поддержания деловой коммуникации. Они не продаются и не используются для несвязанной рекламы.', 'Запросы на обновление или удаление переданной информации можно направить на office@longqingtrade.com.'],
    zh: ['我们仅收集用户通过询盘表单或直接商务沟通自愿提供的信息。', '信息可能包括姓名、公司、邮箱、电话或通讯方式、留言内容及相关技术背景。', '这些信息用于审核需求、回复询盘并保持商务沟通，不会出售或用于无关广告。', '如需更新或删除已提交的信息，可联系 office@longqingtrade.com。'],
  }[locale];
  return <LegalPage title={t('privacyTitle')} lead={t('privacyLead')} paragraphs={paragraphs} />;
}
