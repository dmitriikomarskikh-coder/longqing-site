import process from "node:process";
import {ImapFlow} from "imapflow";
import nodemailer from "nodemailer";
import {getOutreachDb, getSettings, saveSettings, addEvent, getOutreachTemplate, exitUnlimitedMode, type RecipientRow} from "../lib/outreach/db";
import {renderOutreachEmail} from "../lib/outreach/template";
import {loadOutreachEnv, outreachEnv} from "../lib/outreach/runtime-env";

function env(name: string) {
  return outreachEnv(name);
}

loadOutreachEnv();

function assertSendEnv() {
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

function isInsideSchedule() {
  const settings = getSettings();
  const moscow = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
  const day = moscow.getDay();
  const time = `${String(moscow.getHours()).padStart(2, "0")}:${String(moscow.getMinutes()).padStart(2, "0")}`;
  return settings.allowed_days.includes(day) && time >= settings.allowed_time_start && time <= settings.allowed_time_end;
}

function nextDelayIso() {
  const settings = getSettings();
  const minDelay = Math.max(3, settings.min_delay_minutes);
  const maxDelay = Math.max(minDelay, settings.max_delay_minutes);
  const minutes = minDelay + Math.floor(Math.random() * (maxDelay - minDelay + 1));
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function todaySentCount() {
  const today = new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Moscow"}).format(new Date());
  const row = getOutreachDb()
    .prepare("select count(*) as count from outreach_recipients where status = 'sent' and substr(last_sent_at, 1, 10) = ?")
    .get(today) as {count: number};
  return row.count;
}

async function sendRecipient(recipient: RecipientRow) {
  assertSendEnv();
  const content = renderOutreachEmail({company: recipient.company, email: recipient.email}, getOutreachTemplate());
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
    html: content.html
  });
  const messageId = typeof info.messageId === "string" ? info.messageId : "";
  await appendSent(recipient.email, content.subject, content.text, content.html);
  return messageId;
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

async function tick() {
  const settings = getSettings();
  if (!settings.enabled) return;
  if (!settings.require_sent_append || env("OUTREACH_REQUIRE_SENT_APPEND") !== "true") return;
  if (!settings.unlimited_mode && !isInsideSchedule()) return;
  if (settings.next_send_after && new Date(settings.next_send_after).getTime() > Date.now()) return;
  if (!settings.unlimited_mode && todaySentCount() >= settings.daily_limit) return;

  const database = getOutreachDb();
  const recipient = database
    .prepare("select * from outreach_recipients where status = 'queued' order by queue_position is null, queue_position asc, created_at asc, id asc limit 1")
    .get() as RecipientRow | undefined;
  if (!recipient) {
    if (settings.unlimited_mode) {
      exitUnlimitedMode();
    } else {
      saveSettings({enabled: false, next_send_after: null});
    }
    addEvent("auto_paused_queue_empty", null, null, {});
    return;
  }

  try {
    const messageId = await sendRecipient(recipient);
    const now = new Date().toISOString();
    database
      .prepare("update outreach_recipients set status='sent', queue_position=null, last_sent_at=?, updated_at=?, last_error=null where id=?")
      .run(now, now, recipient.id);
    saveSettings({next_send_after: nextDelayIso()});
    addEvent("send_success", recipient.id, messageId, {sent_append_status: "success"});
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 400) : "Worker error";
    database
      .prepare("update outreach_recipients set status='error', queue_position=null, last_error=?, updated_at=? where id=?")
      .run(message, new Date().toISOString(), recipient.id);
    if (settings.unlimited_mode) {
      exitUnlimitedMode();
    } else {
      saveSettings({enabled: false});
    }
    addEvent("send_error", recipient.id, null, {error: message});
  }
}

async function main() {
  console.log("LONGQING outreach worker started. No browser loop is used.");
  while (true) {
    await tick();
    await new Promise((resolve) => setTimeout(resolve, getSettings().unlimited_mode ? 5_000 : 60_000));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "worker failed");
  process.exitCode = 1;
});
