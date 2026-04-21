import type {Locale} from '@/i18n/routing';
import {routing} from '@/i18n/routing';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Manrope} from 'next/font/google';
import {Header} from '@/components/site/header';
import {Footer} from '@/components/site/footer';
import {Toaster} from '@/components/ui/sonner';
import '../globals.css';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const manrope = Manrope({subsets: ['latin', 'cyrillic'], variable: '--font-sans'});

export default async function LocaleLayout({children, params}: Readonly<{children: React.ReactNode; params: Promise<{locale: string}>}>) {
  const requestedLocale = (await params).locale;

  if (!hasLocale(routing.locales, requestedLocale)) {
    notFound();
  }

  const locale = requestedLocale as Locale;
  const messages = await getMessages();

  return (
    <html lang={locale} className={manrope.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
          <Toaster richColors position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
