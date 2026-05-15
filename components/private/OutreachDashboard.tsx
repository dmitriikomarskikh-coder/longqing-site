"use client";

import {useEffect, useMemo, useState} from "react";

type Status = {
  settings: {
    enabled: boolean;
    copy_approved: boolean;
    allowed_days: number[];
    allowed_time_start: string;
    allowed_time_end: string;
    min_delay_minutes: number;
    max_delay_minutes: number;
    daily_limit: number;
    next_send_after: string | null;
  };
  moscowNow: string;
  todaySent: number;
  queued: number;
  sent: number;
  errors: number;
};

type Recipient = {
  id: number;
  company: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_sent_at: string | null;
  last_error: string | null;
};

type EventRow = {
  id: number;
  timestamp: string;
  type: string;
  recipient_id: number | null;
  message_id: string | null;
  detail_json: string;
};

export function OutreachDashboard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [queue, setQueue] = useState<Recipient[]>([]);
  const [sent, setSent] = useState<Recipient[]>([]);
  const [errors, setErrors] = useState<Recipient[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [template, setTemplate] = useState<{subjects: string[]; preview: {text: string; html: string}} | null>(null);
  const [uploadSummary, setUploadSummary] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState("");

  const settings = status?.settings;
  const weekdays = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);

  async function refresh() {
    const [nextStatus, nextQueue, nextSent, nextErrors, nextEvents, nextTemplate] = await Promise.all([
      fetch("/api/private/outreach/status").then((response) => response.json()),
      fetch("/api/private/outreach/recipients?status=queued").then((response) => response.json()),
      fetch("/api/private/outreach/recipients?status=sent").then((response) => response.json()),
      fetch("/api/private/outreach/recipients?status=error").then((response) => response.json()),
      fetch("/api/private/outreach/events").then((response) => response.json()),
      fetch("/api/private/outreach/template").then((response) => response.json())
    ]);
    setStatus(nextStatus);
    setQueue(nextQueue.recipients ?? []);
    setSent(nextSent.recipients ?? []);
    setErrors(nextErrors.recipients ?? []);
    setEvents(nextEvents.events ?? []);
    setTemplate(nextTemplate);
  }

  useEffect(() => {
    refresh().catch(() => setMessage("Failed to load dashboard data"));
  }, []);

  async function control(action: "start" | "pause") {
    const response = await fetch(`/api/private/outreach/control/${action}`, {method: "POST"});
    const body = await response.json();
    setMessage(response.ok ? `${action} saved` : body.error ?? "Control failed");
    await refresh();
  }

  async function upload(formData: FormData) {
    const response = await fetch("/api/private/outreach/upload", {method: "POST", body: formData});
    const body = await response.json();
    setUploadSummary(body);
    await refresh();
  }

  async function saveSettings(formData: FormData) {
    const allowedDays = weekdays
      .map((_, index) => index)
      .filter((index) => formData.get(`day-${index}`) === "on");
    const payload = {
      allowed_days: allowedDays,
      allowed_time_start: formData.get("allowed_time_start"),
      allowed_time_end: formData.get("allowed_time_end"),
      min_delay_minutes: Number(formData.get("min_delay_minutes")),
      max_delay_minutes: Number(formData.get("max_delay_minutes")),
      daily_limit: Number(formData.get("daily_limit")),
      copy_approved: formData.get("copy_approved") === "on"
    };
    const response = await fetch("/api/private/outreach/settings", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    const body = await response.json();
    setMessage(response.ok ? "Settings saved" : body.error ?? "Settings error");
    await refresh();
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Рассылка MTU</h1>
          <p className="mt-2 text-sm text-slate-600">Закрытая очередь B2B outreach. Отправка идёт только серверным worker.</p>
        </div>
        <button className="rounded border border-slate-300 px-4 py-2 text-sm" onClick={refresh} type="button">
          Force refresh
        </button>
      </div>

      {message ? <p className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-600">{message}</p> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Status" value={settings?.enabled ? "Running" : "Paused"} />
        <Stat label="Moscow time" value={status?.moscowNow ?? "-"} />
        <Stat label="Today sent" value={`${status?.todaySent ?? 0} / ${settings?.daily_limit ?? 0}`} />
        <Stat label="Queue / sent / errors" value={`${status?.queued ?? 0} / ${status?.sent ?? 0} / ${status?.errors ?? 0}`} />
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Controls</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary h-10 px-4 text-sm" type="button" onClick={() => control("start")}>
            Start
          </button>
          <button className="rounded border border-slate-300 px-4 py-2 text-sm" type="button" onClick={() => control("pause")}>
            Pause
          </button>
          <button className="rounded border border-slate-300 px-4 py-2 text-sm" type="button" onClick={refresh}>
            Run dry-run / Preview only
          </button>
        </div>
      </section>

      {settings ? (
        <form action={saveSettings} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Настройки</h2>
          <div className="flex flex-wrap gap-3">
            {weekdays.map((day, index) => (
              <label key={day} className="flex items-center gap-2 text-sm">
                <input name={`day-${index}`} type="checkbox" defaultChecked={settings.allowed_days.includes(index)} />
                {day}
              </label>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <Input name="allowed_time_start" label="Start MSK" defaultValue={settings.allowed_time_start} />
            <Input name="allowed_time_end" label="End MSK" defaultValue={settings.allowed_time_end} />
            <Input name="min_delay_minutes" label="Min delay" defaultValue={settings.min_delay_minutes} />
            <Input name="max_delay_minutes" label="Max delay" defaultValue={settings.max_delay_minutes} />
            <Input name="daily_limit" label="Daily limit" defaultValue={settings.daily_limit} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input name="copy_approved" type="checkbox" defaultChecked={settings.copy_approved} />
            Copy/template approved
          </label>
          <button className="btn-primary h-10 w-fit px-4 text-sm" type="submit">
            Save settings
          </button>
        </form>
      ) : null}

      <form
        action={upload}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-xl font-semibold">Upload recipients</h2>
        <p className="text-sm text-slate-600">Excel: колонка A — компания, колонка B — email. Upload does not start sending.</p>
        <input name="file" type="file" accept=".xlsx,.csv" className="rounded border border-slate-200 p-3 text-sm" />
        <button className="btn-primary h-10 w-fit px-4 text-sm" type="submit">
          Upload
        </button>
        {uploadSummary ? <pre className="overflow-auto rounded bg-slate-50 p-3 text-xs">{JSON.stringify(uploadSummary, null, 2)}</pre> : null}
      </form>

      <Table title="Очередь" rows={queue} />
      <Table title="Отправлено" rows={sent} />
      <Table title="Ошибки" rows={errors} />

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Шаблон письма</h2>
        <ul className="list-disc pl-5 text-sm text-slate-600">
          {template?.subjects.map((subject) => <li key={subject}>{subject}</li>)}
        </ul>
        <pre className="max-h-80 overflow-auto rounded bg-slate-50 p-4 text-xs">{template?.preview.text}</pre>
      </section>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Event log</h2>
        <div className="grid gap-2 text-xs text-slate-600">
          {events.map((event) => (
            <p key={event.id}>{event.timestamp} — {event.type} — {event.message_id ?? ""}</p>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Input({name, label, defaultValue}: {name: string; label: string; defaultValue: string | number}) {
  return (
    <label className="grid gap-1 text-sm text-slate-600">
      {label}
      <input name={name} defaultValue={defaultValue} className="h-10 rounded border border-slate-200 px-3 text-slate-950" />
    </label>
  );
}

function Table({title, rows}: {title: string; rows: Recipient[]}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 p-5 text-xl font-semibold">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Company</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="p-3">{row.company}</td>
                <td className="p-3">{row.email}</td>
                <td className="p-3">{row.status}</td>
                <td className="p-3">{row.updated_at}</td>
                <td className="p-3">{row.last_error ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
