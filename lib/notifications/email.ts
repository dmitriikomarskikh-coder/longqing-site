import nodemailer from "nodemailer";

export type SubmissionPayload = {
  name: string;
  phone: string;
  email: string;
  message: string;
  locale: string;
  brand?: string;
  sourceUrl?: string;
  files: Array<{originalName: string; storedName: string; size: number}>;
};

export async function sendEmail(payload: SubmissionPayload) {
  if (!process.env.SMTP_HOST || !process.env.EMAIL_RECIPIENTS) {
    return {channel: "email", skipped: true};
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "office@longqingtrade.com",
    to: process.env.EMAIL_RECIPIENTS,
    subject: `Новая заявка с longqingtrade.com — ${payload.name}`,
    html: `
      <h1>Новая заявка</h1>
      <p><b>Имя:</b> ${payload.name}</p>
      <p><b>Телефон:</b> ${payload.phone}</p>
      <p><b>E-mail:</b> ${payload.email}</p>
      <p><b>Бренд:</b> ${payload.brand ?? "-"}</p>
      <p><b>Страница:</b> ${payload.sourceUrl ?? "-"}</p>
      <p><b>Сообщение:</b></p>
      <pre>${payload.message}</pre>
    `
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "office@longqingtrade.com",
    to: payload.email,
    subject: "Longqing Trade — request received",
    text: "Your request has been received. We will contact you within 1 business day."
  });

  return {channel: "email", skipped: false};
}
