import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/routing';
import {Separator} from '@/components/ui/separator';
import {site} from '@/lib/site';
import {Mail, MessageCircle, Phone, Send} from 'lucide-react';
import {getTranslations} from 'next-intl/server';

export async function Footer({locale}: {locale: Locale}) {
  const t = await getTranslations('nav');
  const common = await getTranslations('common');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-slate-950 text-slate-200">
      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-sm border border-slate-700 bg-white text-sm font-semibold text-slate-950">LQ</span>
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">{site.names[locale]}</p>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">{site.address[locale]}</p>
          </div>
          <div className="grid gap-3 text-sm">
            <Link href="/about" className="hover:text-white">{t('about')}</Link>
            <Link href="/services" className="hover:text-white">{t('services')}</Link>
            <Link href="/industries" className="hover:text-white">{t('industries')}</Link>
            <Link href="/contacts" className="hover:text-white">{t('contacts')}</Link>
          </div>
          <div className="grid gap-3 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {site.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {site.phone}</p>
            <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> {common('wechat')}</p>
            <p className="flex items-center gap-2"><Send className="h-4 w-4" /> {common('telegram')}</p>
          </div>
        </div>
        <Separator className="my-8 bg-slate-800" />
        <div className="flex flex-col gap-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {year} {site.names[locale]}. {site.domain}</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-slate-200">Privacy</Link>
            <Link href="/cookies" className="hover:text-slate-200">Cookies</Link>
            <Link href="/legal" className="hover:text-slate-200">Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
