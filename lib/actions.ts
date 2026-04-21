'use server';

import type {Locale} from '@/i18n/routing';
import {redirect} from '@/i18n/routing';
import {z} from 'zod';

const inquirySchema = z.object({
  name: z.string().min(1).max(120),
  company: z.string().min(1).max(160),
  email: z.string().email().max(180),
  phone: z.string().max(120).optional(),
  message: z.string().min(1).max(5000),
  consent: z.boolean().refine((value) => value === true),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export async function submitInquiry(input: InquiryInput, locale: Locale) {
  const parsed = inquirySchema.safeParse(input);

  if (!parsed.success) {
    return {ok: false, error: 'Invalid inquiry data'};
  }

  // TODO: integrate with Resend / Cloudflare Email / Telegram bot notification
  // TODO: add rate limiting
  console.info('Inquiry received for future integration', {
    locale,
    company: parsed.data.company,
    email: parsed.data.email,
    createdAt: new Date().toISOString(),
  });

  redirect({href: '/thank-you', locale});
}
