import process from "node:process";
import {getOutreachDb, getSettings, saveSettings, addEvent, exitUnlimitedMode, type RecipientRow} from "../lib/outreach/db";
import {loadOutreachEnv, outreachEnv} from "../lib/outreach/runtime-env";
import {sendOutreachRecipient} from "../lib/outreach/sender";

function env(name: string) {
  return outreachEnv(name);
}

loadOutreachEnv();

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
    const {messageId, smtpResponse} = await sendOutreachRecipient(recipient);
    const now = new Date().toISOString();
    database
      .prepare("update outreach_recipients set status='sent', queue_position=null, last_sent_at=?, updated_at=?, last_error=null, smtp_response=? where id=?")
      .run(now, now, smtpResponse, recipient.id);
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
