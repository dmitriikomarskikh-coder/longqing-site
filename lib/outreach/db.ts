import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {outreachDbPath} from "@/lib/private/config";
import {defaultOutreachTemplate, type OutreachStoredTemplate} from "@/lib/outreach/template";

export type OutreachRecipientStatus =
  | "queued"
  | "paused"
  | "sent"
  | "error"
  | "skipped"
  | "unsubscribed"
  | "do_not_contact"
  | "bounced";

export type OutreachSettings = {
  enabled: boolean;
  copy_approved: boolean;
  allowed_timezone: "Europe/Moscow";
  allowed_days: number[];
  allowed_time_start: string;
  allowed_time_end: string;
  min_delay_minutes: number;
  max_delay_minutes: number;
  unlimited_mode: boolean;
  saved_regular_min_delay_minutes: number | null;
  saved_regular_max_delay_minutes: number | null;
  daily_limit: number;
  next_send_after: string | null;
  require_sent_append: boolean;
  smtp_host: "smtp.timeweb.ru";
  smtp_user: "office@longqingtrade.com";
};

export type RecipientRow = {
  id: number;
  company: string;
  email: string;
  email_hash: string;
  segment: string | null;
  city: string | null;
  note: string | null;
  status: OutreachRecipientStatus;
  created_at: string;
  updated_at: string;
  last_sent_at: string | null;
  last_error: string | null;
  source_upload_id: number | null;
  queue_position: number | null;
  history_match_type: "none" | "full" | "email" | "company";
  history_match_detail: string | null;
};

export const defaultOutreachSettings: OutreachSettings = {
  enabled: false,
  copy_approved: false,
  allowed_timezone: "Europe/Moscow",
  allowed_days: [1, 2, 3, 4, 5],
  allowed_time_start: "10:00",
  allowed_time_end: "18:00",
  min_delay_minutes: 15,
  max_delay_minutes: 25,
  unlimited_mode: false,
  saved_regular_min_delay_minutes: null,
  saved_regular_max_delay_minutes: null,
  daily_limit: 10,
  next_send_after: null,
  require_sent_append: true,
  smtp_host: "smtp.timeweb.ru",
  smtp_user: "office@longqingtrade.com"
};

let db: Database.Database | null = null;

export function emailHash(email: string) {
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function getOutreachDb() {
  if (db) {
    return db;
  }
  const file = outreachDbPath();
  fs.mkdirSync(path.dirname(file), {recursive: true});
  db = new Database(file);
  db.pragma("journal_mode = WAL");
  initOutreachDb(db);
  return db;
}

function initOutreachDb(database: Database.Database) {
  database.exec(`
    create table if not exists outreach_uploads (
      id integer primary key autoincrement,
      filename_original text not null,
      rows_total integer not null,
      rows_imported integer not null,
      rows_skipped integer not null,
      created_at text not null
    );

    create table if not exists outreach_recipients (
      id integer primary key autoincrement,
      company text not null,
      email text not null,
      email_hash text not null,
      segment text,
      city text,
      note text,
      status text not null,
      created_at text not null,
      updated_at text not null,
      last_sent_at text,
      last_error text,
      source_upload_id integer,
      queue_position integer,
      history_match_type text not null default 'none',
      history_match_detail text
    );

    create table if not exists outreach_events (
      id integer primary key autoincrement,
      timestamp text not null,
      type text not null,
      recipient_id integer,
      message_id text,
      detail_json text not null
    );

    create table if not exists outreach_settings (
      key text primary key,
      value_json text not null,
      updated_at text not null
    );

    create table if not exists outreach_template (
      id integer primary key check (id = 1),
      subject text not null,
      body text not null,
      updated_at text not null
    );
  `);
  migrateRecipientsTable(database);
  addColumnIfMissing(database, "outreach_recipients", "queue_position", "integer");
  addColumnIfMissing(database, "outreach_recipients", "history_match_type", "text not null default 'none'");
  addColumnIfMissing(database, "outreach_recipients", "history_match_detail", "text");
  normalizeQueuePositions(database);
  database
    .prepare("insert or ignore into outreach_template (id, subject, body, updated_at) values (1, ?, ?, ?)")
    .run(defaultOutreachTemplate.subject, defaultOutreachTemplate.body, new Date().toISOString());
  for (const [key, value] of Object.entries(defaultOutreachSettings)) {
    database
      .prepare("insert or ignore into outreach_settings (key, value_json, updated_at) values (?, ?, ?)")
      .run(key, JSON.stringify(value), new Date().toISOString());
  }
}

function addColumnIfMissing(database: Database.Database, table: string, column: string, definition: string) {
  const columns = database.prepare(`pragma table_info(${table})`).all() as Array<{name: string}>;
  if (!columns.some((item) => item.name === column)) {
    database.exec(`alter table ${table} add column ${column} ${definition}`);
  }
}

function migrateRecipientsTable(database: Database.Database) {
  const row = database
    .prepare("select sql from sqlite_master where type = 'table' and name = 'outreach_recipients'")
    .get() as {sql?: string} | undefined;
  if (!row?.sql?.includes("email_hash text not null unique")) {
    return;
  }

  database.exec(`
    alter table outreach_recipients rename to outreach_recipients_old_unique;
    create table outreach_recipients (
      id integer primary key autoincrement,
      company text not null,
      email text not null,
      email_hash text not null,
      segment text,
      city text,
      note text,
      status text not null,
      created_at text not null,
      updated_at text not null,
      last_sent_at text,
      last_error text,
      source_upload_id integer,
      queue_position integer,
      history_match_type text not null default 'none',
      history_match_detail text
    );
    insert into outreach_recipients (
      id, company, email, email_hash, segment, city, note, status, created_at, updated_at,
      last_sent_at, last_error, source_upload_id, queue_position, history_match_type, history_match_detail
    )
    select
      id, company, email, email_hash, segment, city, note, status, created_at, updated_at,
      last_sent_at, last_error, source_upload_id, null, 'none', null
    from outreach_recipients_old_unique;
    drop table outreach_recipients_old_unique;
  `);
}

export function normalizeQueuePositions(database = getOutreachDb()) {
  const rows = database
    .prepare(
      "select id from outreach_recipients where status = 'queued' order by queue_position is null, queue_position asc, created_at asc, id asc"
    )
    .all() as Array<{id: number}>;
  const update = database.prepare("update outreach_recipients set queue_position = ? where id = ?");
  const clear = database.prepare("update outreach_recipients set queue_position = null where status != 'queued' and queue_position is not null");
  const transaction = database.transaction(() => {
    rows.forEach((row, index) => update.run(index + 1, row.id));
    clear.run();
  });
  transaction();
}

export function nextQueuePosition(database = getOutreachDb()) {
  const row = database
    .prepare("select coalesce(max(queue_position), 0) + 1 as next from outreach_recipients where status = 'queued'")
    .get() as {next: number};
  return row.next;
}

export function reorderQueuedRecipients(ids: number[]) {
  const database = getOutreachDb();
  const uniqueIds = [...new Set(ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
  if (uniqueIds.length === 0) {
    throw new Error("queue_order_required");
  }
  const queuedRows = database
    .prepare(
      "select id from outreach_recipients where status = 'queued' order by queue_position is null, queue_position asc, created_at asc, id asc"
    )
    .all() as Array<{id: number}>;
  const queuedIds = new Set(queuedRows.map((row) => row.id));
  const provided = uniqueIds.filter((id) => queuedIds.has(id));
  const missing = queuedRows.map((row) => row.id).filter((id) => !provided.includes(id));
  const ordered = [...provided, ...missing];
  const update = database.prepare("update outreach_recipients set queue_position = ?, updated_at = ? where id = ?");
  const now = new Date().toISOString();
  database.transaction(() => {
    ordered.forEach((id, index) => update.run(index + 1, now, id));
  })();
  addEvent("queue_reordered", null, null, {count: ordered.length});
  return listRecipients("queued");
}

export function getSettings(): OutreachSettings {
  const rows = getOutreachDb().prepare("select key, value_json from outreach_settings").all() as Array<{
    key: keyof OutreachSettings;
    value_json: string;
  }>;
  const settings = {...defaultOutreachSettings};
  for (const row of rows) {
    settings[row.key] = JSON.parse(row.value_json) as never;
  }
  return settings;
}

export function saveSettings(input: Partial<OutreachSettings>) {
  const current = getSettings();
  const cleanInput = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<OutreachSettings>;
  const next: OutreachSettings = {
    ...current,
    ...cleanInput,
    allowed_timezone: "Europe/Moscow",
    smtp_host: "smtp.timeweb.ru",
    smtp_user: "office@longqingtrade.com",
    require_sent_append: true
  };
  const database = getOutreachDb();
  const stmt = database.prepare(
    "insert into outreach_settings (key, value_json, updated_at) values (?, ?, ?) on conflict(key) do update set value_json=excluded.value_json, updated_at=excluded.updated_at"
  );
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(next)) {
    stmt.run(key, JSON.stringify(value), now);
  }
  addEvent("settings_changed", null, null, {changed: Object.keys(cleanInput)});
  return next;
}

export function enterUnlimitedMode() {
  const current = getSettings();
  return saveSettings({
    enabled: true,
    unlimited_mode: true,
    min_delay_minutes: 3,
    max_delay_minutes: 5,
    next_send_after: null,
    saved_regular_min_delay_minutes: current.unlimited_mode
      ? current.saved_regular_min_delay_minutes
      : current.min_delay_minutes,
    saved_regular_max_delay_minutes: current.unlimited_mode
      ? current.saved_regular_max_delay_minutes
      : current.max_delay_minutes
  });
}

export function exitUnlimitedMode() {
  const current = getSettings();
  const restoredMin =
    current.saved_regular_min_delay_minutes ??
    (current.min_delay_minutes === 3 && current.max_delay_minutes === 5 ? defaultOutreachSettings.min_delay_minutes : current.min_delay_minutes);
  const restoredMax =
    current.saved_regular_max_delay_minutes ??
    (current.min_delay_minutes === 3 && current.max_delay_minutes === 5 ? defaultOutreachSettings.max_delay_minutes : current.max_delay_minutes);
  return saveSettings({
    enabled: false,
    unlimited_mode: false,
    min_delay_minutes: restoredMin,
    max_delay_minutes: Math.max(restoredMin, restoredMax),
    next_send_after: null,
    saved_regular_min_delay_minutes: null,
    saved_regular_max_delay_minutes: null
  });
}

export function getOutreachTemplate(): OutreachStoredTemplate {
  const row = getOutreachDb()
    .prepare("select subject, body from outreach_template where id = 1")
    .get() as OutreachStoredTemplate | undefined;
  return row ?? defaultOutreachTemplate;
}

export function saveOutreachTemplate(template: OutreachStoredTemplate) {
  const next = {
    subject: template.subject.trim(),
    body: template.body.trim()
  };
  const now = new Date().toISOString();
  getOutreachDb()
    .prepare(
      "insert into outreach_template (id, subject, body, updated_at) values (1, ?, ?, ?) on conflict(id) do update set subject=excluded.subject, body=excluded.body, updated_at=excluded.updated_at"
    )
    .run(next.subject, next.body, now);
  addEvent("template_changed", null, null, {});
  return next;
}

export function addEvent(type: string, recipientId: number | null, messageId: string | null, detail: Record<string, unknown>) {
  getOutreachDb()
    .prepare("insert into outreach_events (timestamp, type, recipient_id, message_id, detail_json) values (?, ?, ?, ?, ?)")
    .run(new Date().toISOString(), type, recipientId, messageId, JSON.stringify(detail));
}

function normalizeCompany(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchSentHistory(company: string, email: string) {
  const normalizedCompany = normalizeCompany(company);
  const hash = emailHash(email);
  const sent = getOutreachDb()
    .prepare("select company, email, email_hash from outreach_recipients where status = 'sent'")
    .all() as Array<{company: string; email: string; email_hash: string}>;

  for (const row of sent) {
    if (row.email_hash === hash && normalizeCompany(row.company) === normalizedCompany) {
      return {type: "full" as const, detail: `Совпадает с отправленной историей: ${row.company} / ${row.email}`};
    }
  }
  const emailMatch = sent.find((row) => row.email_hash === hash);
  if (emailMatch) {
    return {type: "email" as const, detail: `Email уже был в отправленной истории: ${emailMatch.email}`};
  }
  const companyMatch = sent.find((row) => {
    const historicalCompany = normalizeCompany(row.company);
    return (
      normalizedCompany.length >= 3 &&
      historicalCompany.length >= 3 &&
      (normalizedCompany.includes(historicalCompany) || historicalCompany.includes(normalizedCompany))
    );
  });
  if (companyMatch) {
    return {type: "company" as const, detail: `Похоже на отправленную компанию: ${companyMatch.company}`};
  }
  return {type: "none" as const, detail: null};
}

export function updateRecipient(id: number, input: {company: string; email: string}) {
  const company = input.company.trim();
  const email = input.email.trim().toLowerCase();
  if (!company || !email) {
    throw new Error("recipient_fields_required");
  }
  const hash = emailHash(email);
  const duplicate = getOutreachDb()
    .prepare("select id from outreach_recipients where id != ? and email_hash = ? and status != 'sent' limit 1")
    .get(id, hash) as {id: number} | undefined;
  if (duplicate) {
    throw new Error("recipient_email_duplicate");
  }
  const match = matchSentHistory(company, email);
  const now = new Date().toISOString();
  getOutreachDb()
    .prepare(
      "update outreach_recipients set company = ?, email = ?, email_hash = ?, history_match_type = ?, history_match_detail = ?, updated_at = ? where id = ?"
    )
    .run(company, email, hash, match.type, match.detail, now, id);
  addEvent("recipient_updated", id, null, {history_match_type: match.type});
  return {ok: true};
}

export function deleteSentRecipient(id: number) {
  const database = getOutreachDb();
  const row = database.prepare("select status from outreach_recipients where id = ?").get(id) as {status: OutreachRecipientStatus} | undefined;
  if (!row) {
    throw new Error("recipient_not_found");
  }
  if (row.status !== "sent") {
    throw new Error("recipient_delete_sent_only");
  }
  database.prepare("delete from outreach_recipients where id = ?").run(id);
  addEvent("recipient_deleted", id, null, {status: "sent"});
  return {ok: true};
}

export function createRecipient(input: {company: string; email: string}) {
  const database = getOutreachDb();
  const company = input.company.trim();
  const email = input.email.trim().toLowerCase();
  if (!company || !email) {
    throw new Error("recipient_fields_required");
  }
  const hash = emailHash(email);
  const duplicate = database
    .prepare("select id, status, queue_position from outreach_recipients where email_hash = ? and status != 'sent' order by updated_at desc limit 1")
    .get(hash) as {id: number; status: OutreachRecipientStatus; queue_position: number | null} | undefined;
  const match = matchSentHistory(company, email);
  const now = new Date().toISOString();
  if (duplicate) {
    if (["unsubscribed", "bounced"].includes(duplicate.status)) {
      throw new Error("recipient_blocked_status");
    }
    const queuePosition =
      duplicate.status === "queued" && duplicate.queue_position ? duplicate.queue_position : nextQueuePosition(database);
    database
      .prepare(
        "update outreach_recipients set company = ?, email = ?, email_hash = ?, status = 'queued', last_error = null, queue_position = ?, history_match_type = ?, history_match_detail = ?, updated_at = ? where id = ?"
      )
      .run(company, email, hash, queuePosition, match.type, match.detail, now, duplicate.id);
    normalizeQueuePositions(database);
    addEvent("recipient_reused", duplicate.id, null, {previous_status: duplicate.status, history_match_type: match.type});
    return {
      ok: true,
      reused: true,
      recipient: {
        id: duplicate.id,
        company,
        email,
        status: "queued",
        queue_position: queuePosition,
        created_at: now,
        updated_at: now,
        history_match_type: match.type,
        history_match_detail: match.detail
      }
    };
  }
  const queuePosition = nextQueuePosition(database);
  const result = database
    .prepare(
      "insert into outreach_recipients (company, email, email_hash, status, created_at, updated_at, queue_position, history_match_type, history_match_detail) values (?, ?, ?, 'queued', ?, ?, ?, ?, ?)"
    )
    .run(company, email, hash, now, now, queuePosition, match.type, match.detail);
  const id = Number(result.lastInsertRowid);
  addEvent("recipient_created", id, null, {history_match_type: match.type});
  return {
    ok: true,
    recipient: {
      id,
      company,
      email,
      status: "queued",
      queue_position: queuePosition,
      created_at: now,
      updated_at: now,
      history_match_type: match.type,
      history_match_detail: match.detail
    }
  };
}

export function dashboardStatus() {
  const database = getOutreachDb();
  const settings = getSettings();
  const counts = database
    .prepare("select status, count(*) as count from outreach_recipients group by status")
    .all() as Array<{status: OutreachRecipientStatus; count: number}>;
  const countByStatus = Object.fromEntries(counts.map((row) => [row.status, row.count]));
  const today = new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Moscow"}).format(new Date());
  const todaySent = database
    .prepare("select count(*) as count from outreach_recipients where status = 'sent' and substr(last_sent_at, 1, 10) = ?")
    .get(today) as {count: number};

  return {
    settings,
    moscowNow: new Date().toLocaleString("ru-RU", {timeZone: "Europe/Moscow"}),
    todaySent: todaySent.count,
    queued: countByStatus.queued ?? 0,
    sent: countByStatus.sent ?? 0,
    errors: countByStatus.error ?? 0
  };
}

export function listRecipients(status?: string) {
  const database = getOutreachDb();
  if (status) {
    if (status === "queued") {
      normalizeQueuePositions(database);
      return database
        .prepare(
          "select * from outreach_recipients where status = ? order by queue_position is null, queue_position asc, created_at asc, id asc limit 200"
        )
        .all(status) as RecipientRow[];
    }
    return database
      .prepare("select * from outreach_recipients where status = ? order by updated_at desc limit 200")
      .all(status) as RecipientRow[];
  }
  return database.prepare("select * from outreach_recipients order by updated_at desc limit 200").all() as RecipientRow[];
}

export function recentEvents() {
  return getOutreachDb()
    .prepare("select * from outreach_events order by timestamp desc limit 50")
    .all() as Array<{id: number; timestamp: string; type: string; recipient_id: number | null; message_id: string | null; detail_json: string}>;
}
