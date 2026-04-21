import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/routing';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ContactForm} from '@/components/site/contact-form';
import {CardGrid, SectionHeader} from '@/components/site/section';
import {buildMetadata} from '@/lib/metadata';
import {ArrowRight, Factory, Globe2, ShieldCheck} from 'lucide-react';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({locale, namespace: 'meta.home'});
  return buildMetadata({locale, pathname: '/', title: t('title'), description: t('description')});
}

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const locale = (await params).locale as Locale;
  const home = await getTranslations({locale, namespace: 'home'});
  const common = await getTranslations({locale, namespace: 'common'});
  const sections = await getTranslations({locale, namespace: 'sections'});
  const services = sections.raw('services') as string[];
  const industries = sections.raw('industries') as string[];
  const why = sections.raw('why') as string[];
  const process = sections.raw('process') as string[];

  return (
    <>
      <section className="steel-gradient industrial-grid overflow-hidden text-white">
        <div className="container grid min-h-[720px] items-center gap-12 py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">{home('eyebrow')}</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{home('heroTitle')}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">{home('heroText')}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-amber-600 text-white hover:bg-amber-700">
                <Link href="/contacts">{common('requestQuote')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/services">{common('learnMore')}</Link>
              </Button>
            </div>
            <p className="mt-8 text-sm text-slate-300">{home('heroNote')}</p>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative grid gap-4 rounded-sm border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
              {[Factory, Globe2, ShieldCheck].map((Icon, index) => (
                <div key={index} className="flex items-center gap-4 border border-white/10 bg-slate-950/35 p-5">
                  <Icon className="h-9 w-9 text-amber-300" />
                  <div className="h-3 flex-1 rounded-full bg-white/20" />
                </div>
              ))}
              <div className="h-56 border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.03))]" />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <SectionHeader title={home('aboutTitle')} text={home('aboutText')} />
        <div className="grid gap-4 md:grid-cols-3">
          {why.slice(0, 3).map((item) => <Card key={item} className="rounded-sm"><CardContent className="p-6 text-sm leading-7 text-slate-700">{item}</CardContent></Card>)}
        </div>
      </section>

      <section className="bg-slate-100 py-20">
        <div className="container">
          <SectionHeader title={home('servicesTitle')} />
          <CardGrid items={services} />
        </div>
      </section>

      <section className="container py-20">
        <SectionHeader title={home('industriesTitle')} />
        <CardGrid items={industries} />
      </section>

      <section className="bg-white py-20">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader title={home('whyTitle')} />
            <CardGrid items={why} />
          </div>
          <div>
            <SectionHeader title={home('processTitle')} />
            <div className="grid gap-3">
              {process.map((step, index) => (
                <div key={step} className="flex gap-4 border bg-slate-50 p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center bg-slate-950 text-sm font-semibold text-white">{index + 1}</span>
                  <p className="text-sm font-medium leading-7 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">{common('domain')}</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{home('contactTitle')}</h2>
          <p className="mt-4 leading-8 text-slate-600">{home('contactText')}</p>
        </div>
        <ContactForm locale={locale} />
      </section>
    </>
  );
}
