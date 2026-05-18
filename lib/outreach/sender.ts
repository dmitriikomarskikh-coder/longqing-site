import {Buffer} from "node:buffer";
import {ImapFlow} from "imapflow";
import nodemailer from "nodemailer";
import {getOutreachTemplate, type RecipientRow} from "./db";
import {loadOutreachEnv, outreachEnv} from "./runtime-env";
import {renderOutreachEmail} from "./template";

function env(name: string) {
  return outreachEnv(name);
}

loadOutreachEnv();

export function assertOutreachSendEnv() {
  const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "IMAP_HOST", "IMAP_USER", "IMAP_PASS"];
  for (const name of required) {
    if (!env(name)) {
      throw new Error(`${name} is required`);
    }
  }
  if (env("SMTP_HOST") !== "smtp.timeweb.ru") {
    throw new Error("Only smtp.timeweb.ru is allowed");
  }
  if (env("OUTREACH_SEND_ENABLED") !== "true") {
    throw new Error("OUTREACH_SEND_ENABLED=true is required");
  }
}

export async function sendOutreachRecipient(recipient: RecipientRow) {
  assertOutreachSendEnv();
  const content = renderOutreachEmail({company: recipient.company, email: recipient.email}, getOutreachTemplate(recipient.variant));
  const transporter = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port: Number(env("SMTP_PORT") || 465),
    secure: env("SMTP_SECURE") !== "false",
    auth: {user: env("SMTP_USER"), pass: env("SMTP_PASS")},
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
  const info = await transporter.sendMail({
    from: env("SMTP_FROM") || "LONGQING TRADE <office@longqingtrade.com>",
    to: recipient.email,
    replyTo: env("SMTP_REPLY_TO") || "office@longqingtrade.com",
    subject: content.subject,
    text: content.text,
    html: content.html,
    headers: {
      "List-Unsubscribe": "<mailto:office@longqingtrade.com?subject=unsubscribe>",
      Precedence: "bulk"
    }
  });
  const messageId = typeof info.messageId === "string" ? info.messageId : "";
  const smtpResponse = typeof info.response === "string" ? info.response : "";
  await appendSent(recipient.email, content.subject, content.text, content.html);
  return {messageId, smtpResponse};
}

async function appendSent(to: string, subject: string, text: string, html: string) {
  const client = new ImapFlow({
    host: env("IMAP_HOST"),
    port: Number(env("IMAP_PORT") || 993),
    secure: env("IMAP_SECURE") !== "false",
    auth: {user: env("IMAP_USER"), pass: env("IMAP_PASS")},
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
      `From: ${env("SMTP_FROM") || "LONGQING TRADE <office@longqingtrade.com>"}`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
      `Date: ${new Date().toUTCString()}`,
      "List-Unsubscribe: <mailto:office@longqingtrade.com?subject=unsubscribe>",
      "Precedence: bulk",
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
