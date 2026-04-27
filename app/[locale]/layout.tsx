import "@/app/globals.css";
import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import {Inter, Noto_Sans_SC} from "next/font/google";
import {notFound} from "next/navigation";
import type {ReactNode} from "react";
import {Footer} from "@/components/Footer";
import {Header} from "@/components/Header";
import {locales, type Locale} from "@/i18n/routing";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap"
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://longqingtrade.com"
  ),
  title: {
    template: "%s | Longqing Trade",
    default: "Longqing Trade"
  },
  description:
    "Independent supply and service of industrial equipment and compatible spare parts worldwide."
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://longqingtrade.com";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Shandong Longqing International Trading Co., Ltd",
    alternateName: [
      "LONGQING Trade",
      "ООО «Шаньдун Лунцин Интернэшнл Трейдинг»",
      "山东龙擎国际贸易有限责任公司"
    ],
    url: siteUrl,
    email: "office@longqingtrade.com",
    telephone: "+7 900 000 00 00"
  };

  return (
    <html lang={locale} className={`${inter.variable} ${notoSansSc.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(organizationJsonLd)}}
        />
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale as Locale} />
          {children}
          <Footer locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
