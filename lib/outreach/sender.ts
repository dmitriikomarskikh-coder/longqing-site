import {Buffer} from "node:buffer";
import {ImapFlow} from "imapflow";
import nodemailer from "nodemailer";
import {getOutreachMailSettings, getOutreachStockRows, getOutreachTemplate, type OutreachMailSettings, type RecipientRow} from "./db";
import {buildEmailDeliveryHeaders} from "./delivery-headers";
import {loadOutreachEnv, outreachEnv} from "./runtime-env";
import {renderOutreachEmail} from "./template";

function env(name: string) {
  return outreachEnv(name);
}

loadOutreachEnv();

export function buildOutreachDeliveryHeaders(settings: OutreachMailSettings) {
  return buildEmailDeliveryHeaders({
    mode: env("OUTREACH_HEADER_MODE"),
    listUnsubscribe: env("OUTREACH_LIST_UNSUBSCRIBE"),
    identity: {
      smtpUser: settings.smtp_user,
      smtpFrom: settings.smtp_from,
      smtpReplyTo: settings.smtp_reply_to,
      imapUser: settings.imap_user
    },
    warn: (message) => console.warn(message)
  });
}

export function assertOutreachSendEnv() {
  const settings = getOutreachMailSettings();
  const required = [
    ["SMTP_HOST", settings.smtp_host],
    ["SMTP_USER", settings.smtp_user],
    ["SMTP_PASS", settings.smtp_password],
    ["IMAP_HOST", settings.imap_host],
    ["IMAP_USER", settings.imap_user],
    ["IMAP_PASS", settings.imap_password]
  ];
  for (const [name, value] of required) {
    if (!value) {
      throw new Error(`${name} is required`);
    }
  }
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (localHosts.has(settings.smtp_host.toLowerCase()) || localHosts.has(settings.imap_host.toLowerCase())) {
    throw new Error("Local SMTP/IMAP hosts are forbidden");
  }
  if (env("OUTREACH_SEND_ENABLED") !== "true") {
    throw new Error("OUTREACH_SEND_ENABLED=true is required");
  }
  return settings;
}

export async function sendOutreachRecipient(recipient: RecipientRow) {
  const settings = assertOutreachSendEnv();
  const content = renderOutreachEmail(
    {company: recipient.company, email: recipient.email},
    getOutreachTemplate(recipient.variant),
    getOutreachStockRows()
  );
  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_secure,
    auth: {user: settings.smtp_user, pass: settings.smtp_password},
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
  const deliveryHeaders = buildOutreachDeliveryHeaders(settings);
  const info = await transporter.sendMail({
    from: settings.smtp_from,
    to: recipient.email,
    replyTo: settings.smtp_reply_to,
    subject: content.subject,
    text: content.text,
    html: content.html,
    headers: deliveryHeaders.headers
  });
  const messageId = typeof info.messageId === "string" ? info.messageId : "";
  const smtpResponse = typeof info.response === "string" ? info.response : "";
  await appendSent(settings, recipient.email, content.subject, content.text, content.html, deliveryHeaders.rawHeaderLines);
  return {messageId, smtpResponse};
}

async function appendSent(settings: OutreachMailSettings, to: string, subject: string, text: string, html: string, rawHeaderLines: string[]) {
  const client = new ImapFlow({
    host: settings.imap_host,
    port: settings.imap_port,
    secure: settings.imap_secure,
    auth: {user: settings.imap_user, pass: settings.imap_password},
    logger: false
  });
  await client.connect();
  try {
    const boxes = await client.list();
    const sent = boxes.find((box) => box.specialUse === "\\Sent")?.path ||
      boxes.find((box) => ["Sent", "INBOX.Sent", "Отправленные", "Sent Messages"].includes(box.path))?.path;
    if (!sent) throw new Error("Sent folder not found");
    const boundary = `longqing-${Date.now()}`;
    const raw = [
      `From: ${settings.smtp_from}`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
      `Date: ${new Date().toUTCString()}`,
      ...rawHeaderLines,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      text,
      "",
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "",
      html,
      "",
      `--${boundary}--`
    ].join("\r\n");
    await client.append(sent, Buffer.from(raw), ["\\Seen"]);
  } finally {
    await client.logout().catch(() => undefined);
  }
}
