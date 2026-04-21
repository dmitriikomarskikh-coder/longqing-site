import {ContactForm} from '@/components/site/contact-form';
import {CardGrid} from '@/components/site/section';
import {Card, CardContent} from '@/components/ui/card';
import type {Locale} from '@/i18n/routing';
import {site} from '@/lib/site';
import {Mail, MessageCircle, Phone, Send} from 'lucide-react';

export function PageHero({title, lead, backgroundImage}: {title: string; lead: string; backgroundImage?: string}) {
  return (
    <section
      className="relative overflow-hidden border-b text-white industrial-grid"
      style={backgroundImage ? {backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center'} : undefined}
    >
      {backgroundImage
        ? <div className="absolute inset-0 bg-slate-950/75" />
        : <div className="absolute inset-0 bg-slate-950" />}
      <div className="relative container py-20">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.035em] md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{lead}</p>
      </div>
    </section>
  );
}

export function ContentBand({children}: {children: React.ReactNode}) {
  return <section className="container py-16">{children}</section>;
}

export function ItemsPage({title, lead, items}: {title: string; lead: string; items: string[]}) {
  return (
    <>
      <PageHero title={title} lead={lead} />
      <ContentBand><CardGrid items={items} /></ContentBand>
    </>
  );
}

export function LegalPage({title, lead, paragraphs}: {title: string; lead: string; paragraphs: string[]}) {
  return (
    <>
      <PageHero title={title} lead={lead} />
      <ContentBand>
        <div className="mx-auto grid max-w-3xl gap-5 text-base leading-8 text-slate-700">
          {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </ContentBand>
    </>
  );
}

export function ContactsPageContent({locale, title, lead}: {locale: Locale; title: string; lead: string}) {
  return (
    <>
      <PageHero title={title} lead={lead} />
      <section className="container grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-sm">
          <CardContent className="grid gap-5 p-6 text-sm leading-7 text-slate-700">
            <p className="font-semibold text-slate-950">{site.names[locale]}</p>
            <p>{site.address[locale]}</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {site.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {site.phone}</p>
            <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WeChat</p>
            <p className="flex items-center gap-2"><Send className="h-4 w-4" /> Telegram</p>
          </CardContent>
        </Card>
        <ContactForm locale={locale} />
      </section>
    </>
  );
}
