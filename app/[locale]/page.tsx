import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/routing';
import {Button} from '@/components/ui/button';
import {ContactForm} from '@/components/site/contact-form';
import {CardGrid, SectionHeader} from '@/components/site/section';
import {buildMetadata} from '@/lib/metadata';
import {ArrowRight, BadgeCheck, ClipboardList, Factory, FileSearch, Globe2, MessageSquare, Network, ShieldCheck, Target} from 'lucide-react';
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

  const SERVICE_IMAGES = [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80',
    'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=600&q=80',
    'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80',
  ];

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
            <div className="relative grid gap-3 rounded-sm border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
              {([
                [Factory, why[0]],
                [Globe2, why[1]],
                [ShieldCheck, why[2]],
              ] as [typeof Factory, string][]).map(([Icon, text], i) => (
                <div key={i} className="flex items-center gap-4 border border-white/10 bg-slate-950/35 px-5 py-4">
                  <Icon className="h-8 w-8 shrink-0 text-amber-300" />
                  <p className="text-sm font-medium leading-6 text-white/90">{text}</p>
                </div>
              ))}
              <div className="grid grid-cols-3 overflow-hidden border border-white/10">
                {([
                  [industries.length.toString(), home('statIndustriesLabel')],
                  [services.length.toString(), home('statServicesLabel')],
                  [home('statGlobalValue'), home('statGlobalLabel')],
                ] as [string, string][]).map(([value, label], i) => (
                  <div key={i} className="bg-slate-950/50 p-4 text-center">
                    <p className="text-3xl font-bold tabular-nums text-amber-300">{value}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <SectionHeader title={home('aboutTitle')} text={home('aboutText')} />
        <div className="grid gap-4 md:grid-cols-3">
          {([
            [Target,       why[0]],
            [BadgeCheck,   why[1]],
            [ClipboardList, why[2]],
          ] as [typeof Target, string][]).map(([Icon, item]) => (
            <div key={item} className="flex flex-col items-center gap-4 rounded-sm bg-slate-800 p-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-sm bg-amber-600/20">
                <Icon className="h-6 w-6 text-amber-300" />
              </div>
              <p className="text-sm font-medium leading-7 text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-100 py-20">
        <div className="container">
          <SectionHeader title={home('servicesTitle')} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <div
                key={service}
                className="relative min-h-[220px] overflow-hidden rounded-sm"
                style={{backgroundImage: `url(${SERVICE_IMAGES[i]})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
              >
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative flex h-full min-h-[220px] items-end p-6">
                  <p className="text-base font-semibold leading-7 text-white">{service}</p>
                </div>
              </div>
            ))}
          </div>
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
            <div className="grid gap-3">
              {([
                [MessageSquare, why[0]],
                [ShieldCheck,   why[1]],
                [FileSearch,    why[2]],
                [Network,       why[3]],
              ] as [typeof MessageSquare, string][]).map(([Icon, item]) => (
                <div key={item} className="flex gap-4 border bg-white p-4 shadow-sm">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-amber-50">
                    <Icon className="h-5 w-5 text-amber-700" />
                  </div>
                  <p className="text-sm font-semibold leading-7 text-slate-800">{item}</p>
                </div>
              ))}
            </div>
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
