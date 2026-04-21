import {Card, CardContent} from '@/components/ui/card';
import {CheckCircle2} from 'lucide-react';

export function SectionHeader({eyebrow, title, text}: {eyebrow?: string; title: string; text?: string}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-8 text-slate-600">{text}</p> : null}
    </div>
  );
}

export function CardGrid({items}: {items: string[]}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item} className="rounded-sm border-slate-200 bg-white/90 shadow-sm">
          <CardContent className="flex gap-3 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <p className="text-sm font-medium leading-6 text-slate-800">{item}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
