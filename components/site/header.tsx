'use client';

import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/routing';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import {LanguageSwitcher} from '@/components/site/language-switcher';
import {Menu} from 'lucide-react';
import {useTranslations} from 'next-intl';

const navItems = [
  {href: '/', key: 'home'},
  {href: '/about', key: 'about'},
  {href: '/services', key: 'services'},
  {href: '/industries', key: 'industries'},
  {href: '/contacts', key: 'contacts'},
] as const;

export function Header({locale}: {locale: Locale}) {
  const t = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <header className="sticky top-0 z-50 border-b bg-background/92 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label={common('company')}>
          <span className="grid h-11 w-11 place-items-center rounded-sm border border-slate-300 bg-slate-950 text-sm font-semibold tracking-tight text-white">LQ</span>
          <span className="hidden max-w-56 text-sm font-semibold uppercase leading-tight tracking-[0.18em] text-slate-900 sm:block">{common('company')}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Button key={item.href} variant="ghost" asChild>
              <Link href={item.href}>{t(item.key)}</Link>
            </Button>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} />
          <Button asChild className="bg-slate-950 hover:bg-slate-800">
            <Link href="/contacts">{common('requestQuote')}</Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher locale={locale} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label={t('menu')}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="mt-10 grid gap-3">
                {navItems.map((item) => (
                  <Button key={item.href} variant="ghost" asChild className="justify-start text-base">
                    <Link href={item.href}>{t(item.key)}</Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
