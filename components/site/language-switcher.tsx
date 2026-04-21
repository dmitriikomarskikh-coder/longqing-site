'use client';

import type {Locale} from '@/i18n/routing';
import {locales, usePathname, useRouter} from '@/i18n/routing';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Languages} from 'lucide-react';
import {useTransition} from 'react';

const labels: Record<Locale, string> = {en: 'English', ru: 'Русский', zh: '中文'};

export function LanguageSwitcher({locale}: {locale: Locale}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-white/80">
          <Languages className="h-4 w-4" />
          <span>{labels[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((nextLocale) => (
          <DropdownMenuItem
            key={nextLocale}
            disabled={isPending || nextLocale === locale}
            onClick={() => startTransition(() => router.replace(pathname, {locale: nextLocale}))}
          >
            {labels[nextLocale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
