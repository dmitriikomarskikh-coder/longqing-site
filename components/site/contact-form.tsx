'use client';

import type {Locale} from '@/i18n/routing';
import {submitInquiry, type InquiryInput} from '@/lib/actions';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import {useTransition} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';

export function ContactForm({locale}: {locale: Locale}) {
  const t = useTranslations('form');
  const [isPending, startTransition] = useTransition();

  const schema = z.object({
    name: z.string().min(1, t('required')).max(120),
    company: z.string().min(1, t('required')).max(160),
    email: z.string().min(1, t('required')).email(t('emailInvalid')).max(180),
    phone: z.string().max(120).optional(),
    message: z.string().min(1, t('required')).max(5000),
    consent: z.boolean().refine((value) => value === true, t('consentRequired')),
  });

  const form = useForm<InquiryInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      message: '',
      consent: false,
    },
  });

  function onSubmit(values: InquiryInput) {
    startTransition(async () => {
      const result = await submitInquiry(values, locale);
      if (result?.ok === false) {
        toast.error(result.error);
        return;
      }
      toast.success(t('success'));
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 rounded-sm border bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField control={form.control} name="name" render={({field}) => (
            <FormItem>
              <FormLabel>{t('name')}*</FormLabel>
              <FormControl><Input {...field} autoComplete="name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="company" render={({field}) => (
            <FormItem>
              <FormLabel>{t('company')}*</FormLabel>
              <FormControl><Input {...field} autoComplete="organization" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField control={form.control} name="email" render={({field}) => (
            <FormItem>
              <FormLabel>{t('email')}*</FormLabel>
              <FormControl><Input {...field} type="email" autoComplete="email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({field}) => (
            <FormItem>
              <FormLabel>{t('phone')}</FormLabel>
              <FormControl><Input {...field} autoComplete="tel" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="message" render={({field}) => (
          <FormItem>
            <FormLabel>{t('message')}*</FormLabel>
            <FormControl><Textarea {...field} rows={6} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="consent" render={({field}) => (
          <FormItem className="flex items-start gap-3 space-y-0">
            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-normal leading-6">{t('consent')}*</FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )} />
        <Button type="submit" disabled={isPending} className="w-full bg-slate-950 hover:bg-slate-800 md:w-fit">
          {isPending ? t('submitting') : t('submit')}
        </Button>
      </form>
    </Form>
  );
}
