import nodemailer from "nodemailer";

export type SubmissionFile = {
  originalName: string;
  storedName?: string;
  size: number;
};

export type SubmissionPayload = {
  requestId?: string;
  name?: string;
  company?: string;
  phone: string;
  email: string;
  message: string;
  locale?: string;
  brand?: string;
  pageUrl?: string;
  sourceUrl?: string;
  formSource?: string;
  createdAt: string;
  files: SubmissionFile[];
};

class SmtpConfigurationError extends Error {
  constructor() {
    super("SMTP configuration is incomplete");
    this.name = "SmtpConfigurationError";
  }
}

export function isSmtpConfigurationError(error: unknown) {
  return error instanceof SmtpConfigurationError;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new SmtpConfigurationError();
  }
  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function row(label: string, value?: string) {
  return `<p><b>${label}:</b> ${escapeHtml(value || "-")}</p>`;
}

export async function sendEmail(payload: SubmissionPayload) {
  const host = requiredEnv("SMTP_HOST");
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASSWORD");
  const from = requiredEnv("EMAIL_FROM");
  const to = requiredEnv("EMAIL_TO");
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {user, pass},
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  const files = payload.files.length
    ? `<ul>${payload.files
        .map((file) =>
          `<li>${escapeHtml(file.originalName)} (${formatFileSize(file.size)})${
            file.storedName ? `, stored as ${escapeHtml(file.storedName)}` : ""
          }</li>`
        )
        .join("")}</ul>`
    : "<p>-</p>";

  await transporter.sendMail({
    from,
    to,
    replyTo: payload.email || undefined,
    subject: `Новая заявка с longqingtrade.com — ${payload.name || payload.company || payload.phone}`,
    html: `
      <h1>Новая заявка</h1>
      ${row("Имя", payload.name)}
      ${row("Компания", payload.company)}
      ${row("Телефон", payload.phone)}
      ${row("E-mail", payload.email)}
      ${row("Бренд", payload.brand)}
      ${row("Страница", payload.pageUrl || payload.sourceUrl)}
      ${row("Источник формы", payload.formSource)}
      ${row("Язык страницы", payload.locale)}
      ${row("Дата/время сервера", payload.createdAt)}
      <p><b>Файлы:</b></p>
      ${files}
      <p><b>Сообщение:</b></p>
      <pre>${escapeHtml(payload.message)}</pre>
    `,
    text: [
      "Новая заявка",
      `Имя: ${payload.name || "-"}`,
      `Компания: ${payload.company || "-"}`,
      `Телефон: ${payload.phone}`,
      `E-mail: ${payload.email}`,
      `Бренд: ${payload.brand || "-"}`,
      `Страница: ${payload.pageUrl || payload.sourceUrl || "-"}`,
      `Источник формы: ${payload.formSource || "-"}`,
      `Язык страницы: ${payload.locale || "-"}`,
      `Дата/время сервера: ${payload.createdAt}`,
      `Файлы: ${
        payload.files.length
          ? payload.files.map((file) => `${file.originalName} (${formatFileSize(file.size)})`).join(", ")
          : "-"
      }`,
      "",
      payload.message
    ].join("\n")
  });

  return {channel: "email", skipped: false};
}
