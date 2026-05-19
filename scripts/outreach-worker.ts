import crypto from "node:crypto";
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

function recentSentIntervalSeconds() {
  const rows = getOutreachDb()
    .prepare("select last_sent_at from outreach_recipients where status = 'sent' and last_sent_at is not null order by last_sent_at desc limit 2")
    .all() as Array<{last_sent_at: string}>;
  if (rows.length < 2) {
    return null;
  }
  const latest = new Date(rows[0].last_sent_at).getTime();
  const previous = new Date(rows[1].last_sent_at).getTime();
  if (!Number.isFinite(latest) || !Number.isFinite(previous)) {
    return null;
  }
  return Math.abs(Math.round((latest - previous) / 1000));
}

function randomDelaySeconds(minSeconds: number, maxSeconds: number) {
  if (maxSeconds <= minSeconds) {
    return minSeconds;
  }
  const previousInterval = recentSentIntervalSeconds();
  const spread = maxSeconds - minSeconds;
  const minimumDifference = Math.min(5 * 60, Math.max(90, Math.floor(spread / 3)));

  let candidate = crypto.randomInt(minSeconds, maxSeconds + 1);
  for (let attempt = 0; attempt < 8 && previousInterval !== null; attempt += 1) {
    if (Math.abs(candidate - previousInterval) >= minimumDifference) {
      break;
    }
    candidate = crypto.randomInt(minSeconds, maxSeconds + 1);
  }
  return candidate;
}

function nextDelay() {
  const settings = getSettings();
  const minDelay = Math.max(3, settings.min_delay_minutes);
  const maxDelay = Math.max(minDelay, settings.max_delay_minutes);
  const delaySeconds = randomDelaySeconds(minDelay * 60, maxDelay * 60);
  return {
    delaySeconds,
    nextSendAfter: new Date(Date.now() + delaySeconds * 1000).toISOString()
  };
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
    const delay = nextDelay();
    saveSettings({next_send_after: delay.nextSendAfter});
    addEvent("send_success", recipient.id, messageId, {
      company: recipient.company,
      email: recipient.email,
      sent_append_status: "success",
      next_delay_seconds: delay.delaySeconds,
      next_send_after: delay.nextSendAfter
    });
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
    addEvent("send_error", recipient.id, null, {company: recipient.company, email: recipient.email, error: message});
  }
}

async function main() {
  console.log("LONGQING outreach worker started. No browser loop is used.");
  while (true) {
    await tick();
    await new Promise((resolve) => setTimeout(resolve, workerSleepMs()));
  }
}

function workerSleepMs() {
  const settings = getSettings();
  if (settings.unlimited_mode) {
    return 5_000;
  }
  if (!settings.enabled) {
    return 60_000;
  }
  if (settings.next_send_after) {
    const waitMs = new Date(settings.next_send_after).getTime() - Date.now();
    if (Number.isFinite(waitMs) && waitMs > 0) {
      return Math.min(Math.max(waitMs, 1_000), 15_000);
    }
  }
  return 15_000;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "worker failed");
  process.exitCode = 1;
});
