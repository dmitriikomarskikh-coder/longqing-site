import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {fileURLToPath} from "node:url";
import dotenv from "dotenv";
import {ImapFlow} from "imapflow";
import nodemailer from "nodemailer";
import {buildEmailDeliveryHeaders} from "../lib/outreach/delivery-headers";
import {renderOutreachEmail, isValidOutreachEmail} from "../lib/outreach/template";

type Mode = "dry-run" | "test-send" | "batch-send" | "report";

type RecipientStatus =
  | ""
  | "new"
  | "sent"
  | "test"
  | "skipped"
  | "error"
  | "replied"
  | "bounced"
  | "unsubscribed"
  | "do_not_contact";

type Recipient = {
  company: string;
  email: string;
  contact_name: string;
  segment: string;
  city: string;
  note: string;
  status: RecipientStatus;
  last_sent_at: string;
  error: string;
};

type Suppression = {
  email: string;
  reason: string;
  created_at: string;
};

type EmailContent = ReturnType<typeof renderOutreachEmail>;

type LogRecord = {
  timestamp: string;
  mode: Mode;
  recipient_email_masked: string;
  recipient_email_hash: string;
  company: string;
  subject: string;
  template_variant: string;
  status: "preview" | "sent" | "skipped" | "error";
  skip_reason?: string;
  smtp_message_id?: string;
  sent_append_status?: string;
  error_code?: string;
  error_message_sanitized?: string;
};

type AttachmentConfig = {
  enabled: boolean;
  path: string;
};

type SentMailbox = {
  path: string;
};

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(projectRoot, "data", "outreach");
const logDir = path.join(projectRoot, ".logs");
const logPath = path.join(logDir, "outreach-email.jsonl");
const recipientsPath = path.join(dataDir, "recipients.csv");
const recipientsExamplePath = path.join(dataDir, "recipients.example.csv");
const suppressionPath = path.join(dataDir, "suppression.csv");

const allowedStatuses = new Set<RecipientStatus>([
  "",
  "new",
  "sent",
  "test",
  "skipped",
  "error",
  "replied",
  "bounced",
  "unsubscribed",
  "do_not_contact"
]);

const sendableStatuses = new Set<RecipientStatus>(["", "new"]);
const blockedStatuses = new Set<RecipientStatus>([
  "sent",
  "test",
  "skipped",
  "error",
  "replied",
  "bounced",
  "unsubscribed",
  "do_not_contact"
]);

const blockedAttachmentColumns = [
  "source_urls",
  "research_notes",
  "confidence",
  "publish_status",
  "internal",
  "cost",
  "margin",
  "supplier_private_notes"
];

dotenv.config({path: path.join(projectRoot, ".env.outreach"), quiet: true});

function env(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

function boolEnv(name: string, fallback = false) {
  const value = env(name);
  if (!value) {
    return fallback;
  }
  return value === "true";
}

function intEnv(name: string, fallback: number) {
  const value = Number.parseInt(env(name), 10);
  return Number.isFinite(value) ? value : fallback;
}

function deliveryHeaders() {
  return buildEmailDeliveryHeaders({
    mode: env("OUTREACH_HEADER_MODE"),
    listUnsubscribe: env("OUTREACH_LIST_UNSUBSCRIBE"),
    identity: {
      smtpUser: env("SMTP_USER"),
      smtpFrom: env("SMTP_FROM", "LONGQING TRADE <office@longqingtrade.com>"),
      smtpReplyTo: env("SMTP_REPLY_TO", "office@longqingtrade.com"),
      imapUser: env("IMAP_USER", env("SMTP_USER"))
    },
    warn: (message) => console.warn(message)
  });
}

function fail(message: string): never {
  throw new Error(message);
}

function ensureLogDir() {
  fs.mkdirSync(logDir, {recursive: true});
}

function maskEmail(email: string) {
  const [local = "", domain = ""] = email.toLowerCase().split("@");
  const localMasked = local.length <= 2 ? `${local.slice(0, 1)}***` : `${local.slice(0, 2)}***`;
  return `${localMasked}@${domain}`;
}

function hashEmail(email: string) {
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

function sanitizeError(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
  const code = typeof record.code === "string" ? record.code : error instanceof Error ? error.name : "ERROR";
  const command = typeof record.command === "string" ? ` command=${record.command}` : "";
  const responseCode = typeof record.responseCode === "number" ? ` responseCode=${record.responseCode}` : "";
  const message = error instanceof Error ? error.message : String(error);
  return {
    code,
    message: `${message}${command}${responseCode}`
      .replaceAll(env("SMTP_PASS"), "[redacted]")
      .replaceAll(env("IMAP_PASS"), "[redacted]")
      .slice(0, 500)
  };
}

function appendLog(record: LogRecord) {
  ensureLogDir();
  fs.appendFileSync(logPath, `${JSON.stringify(record)}\n`);
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const [headers, ...data] = rows.filter((item) => item.some((cell) => cell.trim()));
  if (!headers) {
    return [];
  }

  return data.map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), (cells[index] ?? "").trim()]))
  );
}

function quoteCsv(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function stringifyCsv(headers: string[], rows: Record<string, string>[]) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => quoteCsv(row[header] ?? "")).join(","))
  ].join("\n");
}

function readCsvRecords(filePath: string) {
  return parseCsv(fs.readFileSync(filePath, "utf8"));
}

function normalizeStatus(value: string): RecipientStatus {
  const status = value.trim() as RecipientStatus;
  return allowedStatuses.has(status) ? status : "error";
}

function readRecipients({allowExampleFallback}: {allowExampleFallback: boolean}) {
  const sourcePath = fs.existsSync(recipientsPath)
    ? recipientsPath
    : allowExampleFallback && fs.existsSync(recipientsExamplePath)
      ? recipientsExamplePath
      : "";

  if (!sourcePath) {
    fail("data/outreach/recipients.csv is missing");
  }

  const recipients = readCsvRecords(sourcePath).map((row): Recipient => ({
    company: row.company ?? "",
    email: row.email ?? "",
    contact_name: row.contact_name ?? "",
    segment: row.segment ?? "",
    city: row.city ?? "",
    note: row.note ?? "",
    status: normalizeStatus(row.status ?? ""),
    last_sent_at: row.last_sent_at ?? "",
    error: row.error ?? ""
  }));

  return {recipients, sourcePath, isExample: sourcePath === recipientsExamplePath};
}

function readSuppressions() {
  if (!fs.existsSync(suppressionPath)) {
    return [] as Suppression[];
  }

  return readCsvRecords(suppressionPath).map((row) => ({
    email: row.email ?? "",
    reason: row.reason ?? "",
    created_at: row.created_at ?? ""
  }));
}

function writeRecipients(recipients: Recipient[]) {
  const headers = ["company", "email", "contact_name", "segment", "city", "note", "status", "last_sent_at", "error"];
  fs.writeFileSync(recipientsPath, `${stringifyCsv(headers, recipients)}\n`);
}

function buildEmail(recipient: Recipient): EmailContent {
  return renderOutreachEmail(recipient);
}

function buildRawMessage(content: EmailContent, to: string) {
  const boundary = `longqing-${crypto.randomBytes(12).toString("hex")}`;
  const headers = [
    `From: ${env("SMTP_FROM", "LONGQING TRADE <office@longqingtrade.com>")}`,
    `To: ${to}`,
    `Reply-To: ${env("SMTP_REPLY_TO", "office@longqingtrade.com")}`,
    `Subject: ${encodedHeader(content.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@longqingtrade.com>`,
    ...deliveryHeaders().rawHeaderLines,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ];

  return [
    ...headers,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    content.text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    content.html,
    "",
    `--${boundary}--`,
    ""
  ].join("\r\n");
}

function encodedHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function makeLogBase(mode: Mode, recipient: Recipient, content: EmailContent) {
  return {
    timestamp: new Date().toISOString(),
    mode,
    recipient_email_masked: maskEmail(recipient.email),
    recipient_email_hash: hashEmail(recipient.email),
    company: recipient.company,
    subject: content.subject,
    template_variant: content.templateVariant
  };
}

function suppressionSet() {
  return new Set(readSuppressions().map((item) => item.email.trim().toLowerCase()).filter(Boolean));
}

function classifyRecipient(recipient: Recipient, seen: Set<string>, suppressions: Set<string>) {
  const email = recipient.email.trim().toLowerCase();

  if (!email) {
    return "missing_email";
  }

  if (!isValidOutreachEmail(email)) {
    return "invalid_email";
  }

  if (seen.has(email)) {
    return "duplicate_email";
  }

  seen.add(email);

  if (suppressions.has(email)) {
    return "suppressed";
  }

  if (blockedStatuses.has(recipient.status)) {
    return `status_${recipient.status}`;
  }

  if (!sendableStatuses.has(recipient.status)) {
    return "status_not_sendable";
  }

  return "";
}

function validateSmtpConfig() {
  if (!boolEnv("OUTREACH_SEND_ENABLED")) {
    fail("OUTREACH_SEND_ENABLED must be true for send modes");
  }

  const host = env("SMTP_HOST", "smtp.timeweb.ru").toLowerCase();
  const forbiddenLocalHosts = new Set(["localhost", "127.0.0.1", "::1"]);

  if (forbiddenLocalHosts.has(host)) {
    fail("Local SMTP hosts are forbidden");
  }

  if (host !== "smtp.timeweb.ru" && !boolEnv("OUTREACH_ALLOW_CUSTOM_SMTP")) {
    fail("Only smtp.timeweb.ru is allowed unless OUTREACH_ALLOW_CUSTOM_SMTP=true");
  }

  for (const name of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]) {
    if (!env(name)) {
      fail(`${name} is required for send modes`);
    }
  }
}

function getBatchLimit() {
  const limit = intEnv("OUTREACH_BATCH_LIMIT", 10);
  const max = boolEnv("OUTREACH_ALLOW_LARGE_BATCH") ? 50 : 30;

  if (limit <= 0) {
    fail("OUTREACH_BATCH_LIMIT must be greater than 0");
  }

  if (limit > max) {
    fail(`OUTREACH_BATCH_LIMIT cannot exceed ${max}`);
  }

  return limit;
}

function attachmentConfig(): AttachmentConfig {
  return {
    enabled: boolEnv("OUTREACH_ATTACH_STOCK_LIST"),
    path: env("OUTREACH_STOCK_ATTACHMENT_PATH")
  };
}

function validateAttachment(config: AttachmentConfig) {
  if (!config.enabled) {
    return [];
  }

  if (!config.path) {
    fail("OUTREACH_STOCK_ATTACHMENT_PATH is required when OUTREACH_ATTACH_STOCK_LIST=true");
  }

  const fullPath = path.resolve(projectRoot, config.path);
  if (!fs.existsSync(fullPath)) {
    fail("Stock attachment file is missing");
  }

  const stat = fs.statSync(fullPath);
  if (stat.size > 500 * 1024) {
    fail("Stock attachment exceeds 500 KB");
  }

  const ext = path.extname(fullPath).toLowerCase();
  if (![".pdf", ".xlsx", ".csv"].includes(ext)) {
    fail("Stock attachment must be .pdf, .xlsx, or .csv");
  }

  const content = fs.readFileSync(fullPath);
  const haystack = content.toString("utf8").toLowerCase();
  const blocked = blockedAttachmentColumns.find((column) => haystack.includes(column));
  if (blocked) {
    fail(`Stock attachment contains forbidden internal column: ${blocked}`);
  }

  return [{filename: path.basename(fullPath), path: fullPath}];
}

function requireSentAppend() {
  return boolEnv("OUTREACH_REQUIRE_SENT_APPEND", false);
}

function validateImapConfig() {
  for (const name of ["IMAP_HOST", "IMAP_PORT", "IMAP_USER", "IMAP_PASS"]) {
    if (!env(name)) {
      fail(`${name} is required when OUTREACH_REQUIRE_SENT_APPEND=true`);
    }
  }
}

function createImapClient() {
  const client = new ImapFlow({
    host: env("IMAP_HOST", "imap.timeweb.ru"),
    port: intEnv("IMAP_PORT", 993),
    secure: boolEnv("IMAP_SECURE", true),
    auth: {
      user: env("IMAP_USER", env("SMTP_USER")),
      pass: env("IMAP_PASS")
    },
    logger: false
  });

  return client;
}

async function sentAppendPreflight() {
  validateImapConfig();
  const client = createImapClient();

  try {
    await client.connect();
    const mailboxes = await client.list();
    const mailbox = findSentMailbox(mailboxes);
    if (!mailbox) {
      fail("IMAP Sent folder was not found");
    }
    return {path: mailbox};
  } finally {
    await client.logout().catch(() => undefined);
  }
}

type MailboxEntry = {
  path?: string;
  name?: string;
  specialUse?: string;
};

function findSentMailbox(mailboxes: MailboxEntry[]) {
  const special = mailboxes.find((box) => box.specialUse === "\\Sent");
  if (special?.path) {
    return special.path;
  }

  for (const candidate of ["Sent", "INBOX.Sent", "Отправленные", "Sent Messages"]) {
    const match = mailboxes.find((box) => box.path === candidate || box.name === candidate);
    if (match?.path) {
      return match.path;
    }
  }

  return "";
}

async function appendSent(rawMessage: string, mailbox?: SentMailbox) {
  if (!env("IMAP_PASS")) {
    return "skipped_no_imap_password";
  }

  const targetMailbox = mailbox ?? (await sentAppendPreflight());
  const client = createImapClient();

  try {
    await client.connect();
    await client.append(targetMailbox.path, Buffer.from(rawMessage, "utf8"), ["\\Seen"]);
    return "success";
  } catch {
    return "failed";
  } finally {
    await client.logout().catch(() => undefined);
  }
}

async function sendOne(mode: Mode, recipient: Recipient, sentMailbox?: SentMailbox) {
  validateSmtpConfig();
  const content = buildEmail(recipient);
  const attachments = validateAttachment(attachmentConfig());
  const transporter = nodemailer.createTransport({
    host: env("SMTP_HOST", "smtp.timeweb.ru"),
    port: intEnv("SMTP_PORT", 465),
    secure: boolEnv("SMTP_SECURE", true),
    auth: {
      user: env("SMTP_USER"),
      pass: env("SMTP_PASS")
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
  const rawMessage = buildRawMessage(content, recipient.email);
  const info = await transporter.sendMail({
    from: env("SMTP_FROM", "LONGQING TRADE <office@longqingtrade.com>"),
    to: recipient.email,
    bcc: env("OUTREACH_BCC_ARCHIVE") || undefined,
    replyTo: env("SMTP_REPLY_TO", "office@longqingtrade.com"),
    subject: content.subject,
    text: content.text,
    html: content.html,
    headers: deliveryHeaders().headers,
    attachments
  });
  const sentAppendStatus = await appendSent(rawMessage, sentMailbox);

  appendLog({
    ...makeLogBase(mode, recipient, content),
    status: "sent",
    smtp_message_id: typeof info.messageId === "string" ? info.messageId : "",
    sent_append_status: sentAppendStatus
  });

  return {content, messageId: typeof info.messageId === "string" ? info.messageId : "", sentAppendStatus};
}

function printPreview(recipient: Recipient, content: EmailContent, index: number) {
  console.log(`\n--- Preview ${index} ---`);
  console.log(`To: ${maskEmail(recipient.email)} (${recipient.company || "no company"})`);
  console.log(`Subject: ${content.subject}`);
  console.log(`Variant: ${content.templateVariant}`);
  console.log(content.text.split("\n").slice(0, 22).join("\n"));
}

async function dryRun() {
  const {recipients, sourcePath, isExample} = readRecipients({allowExampleFallback: true});
  const suppressions = suppressionSet();
  const seen = new Set<string>();
  let previews = 0;
  let skipped = 0;
  let sendable = 0;

  console.log(`Recipients source: ${path.relative(projectRoot, sourcePath)}${isExample ? " (example fallback)" : ""}`);
  console.log(`Suppression entries: ${suppressions.size}`);

  for (const recipient of recipients) {
    const content = buildEmail(recipient);
    const skipReason = classifyRecipient(recipient, seen, suppressions);

    if (skipReason) {
      skipped += 1;
      appendLog({...makeLogBase("dry-run", recipient, content), status: "skipped", skip_reason: skipReason});
      console.log(`SKIP ${maskEmail(recipient.email || "missing@example.invalid")}: ${skipReason}`);
      continue;
    }

    sendable += 1;
    appendLog({...makeLogBase("dry-run", recipient, content), status: "preview"});
    if (previews < 3) {
      previews += 1;
      printPreview(recipient, content, previews);
    }
  }

  console.log(`\nDry-run complete: total=${recipients.length}, sendable=${sendable}, skipped=${skipped}`);
}

async function testSend() {
  validateSmtpConfig();
  const sentMailbox = requireSentAppend() ? await sentAppendPreflight() : undefined;
  const recipientEmail = env("OUTREACH_TEST_RECIPIENT").trim();
  if (!recipientEmail) {
    fail("OUTREACH_TEST_RECIPIENT is required for test-send");
  }
  if (!isValidOutreachEmail(recipientEmail)) {
    fail("OUTREACH_TEST_RECIPIENT is not a valid email");
  }

  const recipient: Recipient = {
    company: "test recipient",
    email: recipientEmail,
    contact_name: "",
    segment: "test",
    city: "",
    note: "test-send",
    status: "new",
    last_sent_at: "",
    error: ""
  };

  const result = await sendOne("test-send", recipient, sentMailbox);
  if (requireSentAppend() && result.sentAppendStatus !== "success") {
    fail(`SMTP sent but IMAP Sent append failed: ${result.sentAppendStatus}`);
  }
  console.log(`Test-send complete: to=${maskEmail(recipient.email)}, messageId=${result.messageId}`);
  console.log(`IMAP sent append: ${result.sentAppendStatus}`);
}

function shouldStopAfterError(error: unknown, consecutiveErrors: number) {
  const sanitized = sanitizeError(error);
  const hardStopCodes = new Set(["EAUTH", "EDNS", "ECONNECTION", "ETIMEDOUT", "ESOCKET", "SENT_APPEND_FAILED"]);
  if (sanitized.code === "EAUTH") {
    return true;
  }
  if (hardStopCodes.has(sanitized.code) && consecutiveErrors >= 1) {
    return true;
  }
  return consecutiveErrors >= 3;
}

async function batchSend() {
  validateSmtpConfig();
  if (env("OUTREACH_BATCH_CONFIRMATION") !== "SEND_LONGQING_MTU_BATCH") {
    fail("OUTREACH_BATCH_CONFIRMATION must be SEND_LONGQING_MTU_BATCH");
  }
  if (!requireSentAppend()) {
    fail("OUTREACH_REQUIRE_SENT_APPEND=true is required for batch-send");
  }

  const sentMailbox = await sentAppendPreflight();
  const limit = getBatchLimit();
  const {recipients} = readRecipients({allowExampleFallback: false});
  const seen = new Set<string>();
  let sent = 0;
  let consecutiveErrors = 0;

  for (const recipient of recipients) {
    if (sent >= limit) {
      break;
    }

    const suppressions = suppressionSet();
    const content = buildEmail(recipient);
    const skipReason = classifyRecipient(recipient, seen, suppressions);

    if (skipReason) {
      appendLog({...makeLogBase("batch-send", recipient, content), status: "skipped", skip_reason: skipReason});
      continue;
    }

    try {
      const result = await sendOne("batch-send", recipient, sentMailbox);
      if (result.sentAppendStatus !== "success") {
        recipient.status = "error";
        recipient.error = `SMTP sent but IMAP Sent append failed: ${result.sentAppendStatus}`;
        writeRecipients(recipients);
        appendLog({
          ...makeLogBase("batch-send", recipient, content),
          status: "error",
          smtp_message_id: result.messageId,
          sent_append_status: result.sentAppendStatus,
          error_code: "SENT_APPEND_FAILED",
          error_message_sanitized: recipient.error
        });
        const appendError = new Error(recipient.error);
        appendError.name = "SENT_APPEND_FAILED";
        throw appendError;
      }
      recipient.status = "sent";
      recipient.last_sent_at = new Date().toISOString();
      recipient.error = "";
      sent += 1;
      consecutiveErrors = 0;
      writeRecipients(recipients);
      console.log(`SENT ${sent}/${limit}: ${maskEmail(recipient.email)} messageId=${result.messageId}`);

      if (sent < limit) {
        const delaySeconds = randomDelaySeconds();
        console.log(`Waiting ${delaySeconds}s before next email`);
        await sleep(delaySeconds * 1000);
      }
    } catch (error) {
      consecutiveErrors += 1;
      const sanitized = sanitizeError(error);
      recipient.status = "error";
      recipient.error = sanitized.message;
      writeRecipients(recipients);
      appendLog({
        ...makeLogBase("batch-send", recipient, content),
        status: "error",
        error_code: sanitized.code,
        error_message_sanitized: sanitized.message
      });
      console.log(`ERROR ${maskEmail(recipient.email)}: ${sanitized.code}`);

      if (shouldStopAfterError(error, consecutiveErrors)) {
        fail(`Stopping batch after error: ${sanitized.code}`);
      }
    }
  }

  console.log(`Batch complete: sent=${sent}, limit=${limit}`);
}

function randomDelaySeconds() {
  const min = intEnv("OUTREACH_DELAY_SECONDS_MIN", 90);
  const max = intEnv("OUTREACH_DELAY_SECONDS_MAX", 180);
  if (min < 0 || max < min) {
    fail("Invalid outreach delay settings");
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function readLogs() {
  if (!fs.existsSync(logPath)) {
    return [] as LogRecord[];
  }

  return fs
    .readFileSync(logPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as LogRecord];
      } catch {
        return [];
      }
    });
}

async function report() {
  const {recipients, sourcePath, isExample} = readRecipients({allowExampleFallback: true});
  const logs = readLogs();
  const counts = {
    totalRecipients: recipients.length,
    sent: recipients.filter((row) => row.status === "sent").length,
    skipped: logs.filter((row) => row.status === "skipped").length,
    errors: recipients.filter((row) => row.status === "error").length + logs.filter((row) => row.status === "error").length,
    unsubscribed: recipients.filter((row) => row.status === "unsubscribed").length,
    doNotContact: recipients.filter((row) => row.status === "do_not_contact").length,
    bounced: recipients.filter((row) => row.status === "bounced").length
  };
  const lastSent = [...recipients.map((row) => row.last_sent_at).filter(Boolean)].sort().at(-1) ?? "";

  console.log(`Recipients source: ${path.relative(projectRoot, sourcePath)}${isExample ? " (example fallback)" : ""}`);
  console.log(`total recipients: ${counts.totalRecipients}`);
  console.log(`sent: ${counts.sent}`);
  console.log(`skipped: ${counts.skipped}`);
  console.log(`errors: ${counts.errors}`);
  console.log(`unsubscribed: ${counts.unsubscribed}`);
  console.log(`do_not_contact: ${counts.doNotContact}`);
  console.log(`bounced: ${counts.bounced}`);
  console.log(`last sent time: ${lastSent || "-"}`);
}

async function main() {
  const mode = process.argv[2] as Mode | undefined;
  if (!mode || !["dry-run", "test-send", "batch-send", "report"].includes(mode)) {
    fail("Usage: tsx scripts/outreach.ts dry-run|test-send|batch-send|report");
  }

  if (mode === "dry-run") {
    await dryRun();
  } else if (mode === "test-send") {
    await testSend();
  } else if (mode === "batch-send") {
    await batchSend();
  } else {
    await report();
  }
}

main().catch((error: unknown) => {
  const sanitized = sanitizeError(error);
  console.error(`outreach failed: ${sanitized.code}: ${sanitized.message}`);
  process.exitCode = 1;
});
