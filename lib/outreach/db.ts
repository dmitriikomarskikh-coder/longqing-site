import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {outreachDbPath} from "@/lib/private/config";

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
};

export const defaultOutreachSettings: OutreachSettings = {
  enabled: false,
  copy_approved: false,
  allowed_timezone: "Europe/Moscow",
  allowed_days: [1, 2, 3, 4, 5],
  allowed_time_start: "10:00",
  allowed_time_end: "18:00",
  min_delay_minutes: 8,
  max_delay_minutes: 25,
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
      email_hash text not null unique,
      segment text,
      city text,
      note text,
      status text not null,
      created_at text not null,
      updated_at text not null,
      last_sent_at text,
      last_error text,
      source_upload_id integer
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
  `);
  for (const [key, value] of Object.entries(defaultOutreachSettings)) {
    database
      .prepare("insert or ignore into outreach_settings (key, value_json, updated_at) values (?, ?, ?)")
      .run(key, JSON.stringify(value), new Date().toISOString());
  }
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
  const next: OutreachSettings = {
    ...current,
    ...input,
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
  addEvent("settings_changed", null, null, {changed: Object.keys(input)});
  return next;
}

export function addEvent(type: string, recipientId: number | null, messageId: string | null, detail: Record<string, unknown>) {
  getOutreachDb()
    .prepare("insert into outreach_events (timestamp, type, recipient_id, message_id, detail_json) values (?, ?, ?, ?, ?)")
    .run(new Date().toISOString(), type, recipientId, messageId, JSON.stringify(detail));
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
