"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Upload} from "lucide-react";
import Link from "next/link";
import {usePathname, useSearchParams} from "next/navigation";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {isValidPhoneNumber} from "libphonenumber-js";
import {z} from "zod";
import type {Locale} from "@/i18n/routing";

type ContactFormValues = {
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
  website?: string;
};

const labels: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    name: string;
    phone: string;
    email: string;
    message: string;
    files: string;
    consentPrefix: string;
    consentLink: string;
    submit: string;
    microcopy: string;
    success: string;
    error: string;
    errors: {
      name: string;
      phone: string;
      email: string;
      message: string;
      consent: string;
    };
  }
> = {
  ru: {
    title: "Получить коммерческое предложение",
    subtitle:
      "Опишите задачу, приложите артикулы или спецификацию — мы проверим наличие, сроки и подготовим КП.",
    name: "Имя",
    phone: "Телефон",
    email: "E-mail",
    message: "Описание задачи",
    files: "Файлы",
    consentPrefix:
      "Я согласен на обработку персональных данных и принимаю",
    consentLink: "Политику конфиденциальности",
    submit: "Получить КП",
    microcopy: "Ответим в течение 1 рабочего дня.",
    success: "Заявка отправлена",
    error: "Не удалось отправить заявку",
    errors: {
      name: "Укажите имя",
      phone: "Укажите корректный номер телефона",
      email: "Укажите корректный e-mail",
      message: "Опишите задачу подробнее",
      consent: "Необходимо согласие на обработку персональных данных"
    }
  },
  zh: {
    title: "获取报价方案",
    subtitle: "请附上规格书、型号、铭牌照片或任务描述，我们将确认库存和交期。",
    name: "姓名",
    phone: "电话",
    email: "邮箱",
    message: "需求描述",
    files: "文件",
    consentPrefix: "我同意处理个人数据并接受",
    consentLink: "隐私政策",
    submit: "获取报价",
    microcopy: "我们将在 1 个工作日内回复。",
    success: "需求已发送",
    error: "发送失败",
    errors: {
      name: "请输入姓名",
      phone: "请输入正确的电话",
      email: "请输入正确的邮箱",
      message: "请更详细描述需求",
      consent: "需要同意处理个人数据"
    }
  },
  en: {
    title: "Get a commercial proposal",
    subtitle:
      "Attach a specification, part numbers, nameplate photos, or task description, and we will check availability and delivery terms.",
    name: "Name",
    phone: "Phone",
    email: "E-mail",
    message: "Task description",
    files: "Files",
    consentPrefix: "I consent to personal data processing and accept the",
    consentLink: "Privacy Policy",
    submit: "Get proposal",
    microcopy: "We will respond within 1 business day.",
    success: "Request sent",
    error: "Could not send request",
    errors: {
      name: "Enter your name",
      phone: "Enter a valid phone number",
      email: "Enter a valid e-mail",
      message: "Describe the task in more detail",
      consent: "Personal data processing consent is required"
    }
  }
};

export function ContactForm({
  locale,
  brand,
  initialMessage
}: {
  locale: Locale;
  brand?: string;
  initialMessage?: string;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const text = labels[locale];
  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, text.errors.name).max(80, text.errors.name),
        phone: z.string().trim().refine((value) => isValidPhoneNumber(value), {
          message: text.errors.phone
        }),
        email: z.string().trim().email(text.errors.email),
        message: z.string().trim().min(10, text.errors.message).max(4000, text.errors.message),
        consent: z.boolean().refine(Boolean, text.errors.consent),
        website: z.string().max(0).optional()
      }),
    [text]
  );
  const utm = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith("utm_")) {
        result[key] = value;
      }
    });
    return result;
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
    reset
  } = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {consent: false, message: initialMessage ?? ""}
  });

  async function onSubmit(values: ContactFormValues) {
    setStatus("idle");
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    formData.append("locale", locale);
    formData.append("sourceUrl", pathname);
    formData.append("utm", JSON.stringify(utm));
    if (brand) {
      formData.append("brand", brand);
    }

    const input = document.querySelector<HTMLInputElement>("#files");
    Array.from(input?.files ?? []).forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    reset();
    window.location.href = `/${locale}/thanks`;
  }

  return (
    <section id="contact" className="bg-dark px-5 pb-[60px] pt-[60px]">
      <span id="contact-form" className="block scroll-mt-24" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {locale === "ru" ? "ЗАЯВКА" : locale === "zh" ? "需求" : "Request"}
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-text md:text-5xl">
            {text.title}
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">{text.subtitle}</p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 rounded border border-white/10 bg-dark-2 p-5 md:grid-cols-2"
        >
          <input className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />
          <label className="grid gap-2 text-sm text-muted">
            {text.name}
            <input
              className="h-12 rounded border border-white/10 bg-dark px-3 text-text outline-none transition focus:border-accent"
              {...register("name")}
            />
            {errors.name ? <span className="text-xs text-[#dc2626]">{errors.name.message}</span> : null}
          </label>
          <label className="grid gap-2 text-sm text-muted">
            {text.phone}
            <input
              className="h-12 rounded border border-white/10 bg-dark px-3 text-text outline-none transition focus:border-accent"
              placeholder="+7 900 000 00 00"
              {...register("phone")}
            />
            {errors.phone ? <span className="text-xs text-[#dc2626]">{errors.phone.message}</span> : null}
          </label>
          <label className="grid gap-2 text-sm text-muted md:col-span-2">
            {text.email}
            <input
              className="h-12 rounded border border-white/10 bg-dark px-3 text-text outline-none transition focus:border-accent"
              {...register("email")}
            />
            {errors.email ? <span className="text-xs text-[#dc2626]">{errors.email.message}</span> : null}
          </label>
          <label className="grid gap-2 text-sm text-muted md:col-span-2">
            {text.message}
            <textarea
              rows={6}
              className="rounded border border-white/10 bg-dark px-3 py-3 text-text outline-none transition focus:border-accent"
              {...register("message")}
            />
            {errors.message ? (
              <span className="text-xs text-[#dc2626]">{errors.message.message}</span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm text-muted md:col-span-2">
            <span className="inline-flex items-center gap-2">
              <Upload size={16} />
              {text.files}
            </span>
            <input
              id="files"
              type="file"
              multiple
              className="rounded border border-dashed border-white/10 bg-dark p-4 text-sm text-muted"
            />
          </label>
          <label className="flex gap-3 text-sm leading-6 text-muted md:col-span-2">
            <input type="checkbox" className="mt-1 size-4 accent-accent" {...register("consent")} />
            <span>
              {text.consentPrefix}{" "}
              <Link href={`/${locale}/privacy`} className="text-accent underline-offset-4 hover:underline">
                {text.consentLink}
              </Link>
              .
            </span>
          </label>
          {errors.consent ? (
            <span className="text-xs text-[#dc2626] md:col-span-2">
              {errors.consent.message}
            </span>
          ) : null}
          <div className="flex flex-wrap items-center gap-4 md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary h-12 px-6 text-sm"
            >
              {text.submit}
            </button>
            {status === "success" ? (
              <span className="text-sm text-accent-2">{text.success}</span>
            ) : null}
            {status === "error" ? <span className="text-sm text-accent">{text.error}</span> : null}
          </div>
          <p className="text-sm text-muted md:col-span-2">{text.microcopy}</p>
        </form>
      </div>
    </section>
  );
}
