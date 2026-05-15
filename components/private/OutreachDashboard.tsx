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
  const weekdays = useMemo(() => ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], []);

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
    refresh().catch(() => setMessage("Не удалось загрузить данные панели"));
  }, []);

  async function control(action: "start" | "pause") {
    const response = await fetch(`/api/private/outreach/control/${action}`, {method: "POST"});
    const body = await response.json();
    setMessage(response.ok ? (action === "start" ? "Рассылка включена" : "Рассылка поставлена на паузу") : translateError(body.error));
    await refresh();
  }

  async function upload(formData: FormData) {
    setMessage("Загружаем файл...");
    try {
      const response = await fetch("/api/private/outreach/upload", {method: "POST", body: formData});
      const body = await parseJsonResponse(response);
      setUploadSummary(body);
      setMessage(response.ok ? "Файл обработан" : translateError(body.error));
      if (response.ok) {
        await refresh();
      }
    } catch {
      setUploadSummary({error: "upload_failed"});
      setMessage(translateError("upload_failed"));
    }
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
    setMessage(response.ok ? "Настройки сохранены" : translateError(body.error));
    await refresh();
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Рассылка MTU</h1>
          <p className="mt-2 text-sm text-slate-600">Закрытая очередь B2B-рассылки. Отправка выполняется только фоновым серверным процессом.</p>
        </div>
        <button className="rounded border border-slate-300 px-4 py-2 text-sm" onClick={refresh} type="button">
          Обновить
        </button>
      </div>

      {message ? <p className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-600">{message}</p> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Статус" value={settings?.enabled ? "Запущена" : "На паузе"} />
        <Stat label="Время в Москве" value={status?.moscowNow ?? "-"} />
        <Stat label="Отправлено сегодня" value={`${status?.todaySent ?? 0} / ${settings?.daily_limit ?? 0}`} />
        <Stat label="Очередь / отправлено / ошибки" value={`${status?.queued ?? 0} / ${status?.sent ?? 0} / ${status?.errors ?? 0}`} />
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Управление</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary h-10 px-4 text-sm" type="button" onClick={() => control("start")}>
            Запустить
          </button>
          <button className="rounded border border-slate-300 px-4 py-2 text-sm" type="button" onClick={() => control("pause")}>
            Пауза
          </button>
          <button className="rounded border border-slate-300 px-4 py-2 text-sm" type="button" onClick={refresh}>
            Обновить предпросмотр
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
            <Input name="allowed_time_start" label="Начало, МСК" defaultValue={settings.allowed_time_start} />
            <Input name="allowed_time_end" label="Окончание, МСК" defaultValue={settings.allowed_time_end} />
            <Input name="min_delay_minutes" label="Мин. пауза, мин" defaultValue={settings.min_delay_minutes} />
            <Input name="max_delay_minutes" label="Макс. пауза, мин" defaultValue={settings.max_delay_minutes} />
            <Input name="daily_limit" label="Лимит в день" defaultValue={settings.daily_limit} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input name="copy_approved" type="checkbox" defaultChecked={settings.copy_approved} />
            Текст письма согласован
          </label>
          <button className="btn-primary h-10 w-fit px-4 text-sm" type="submit">
            Сохранить настройки
          </button>
        </form>
      ) : null}

      <form
        action={upload}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-xl font-semibold">Загрузка получателей</h2>
        <p className="text-sm text-slate-600">Excel: колонка A — компания, колонка B — email. Загрузка не запускает отправку.</p>
        <input name="file" type="file" accept=".xlsx,.csv" className="rounded border border-slate-200 p-3 text-sm" />
        <button className="btn-primary h-10 w-fit px-4 text-sm" type="submit">
          Загрузить
        </button>
        {uploadSummary ? <UploadSummary summary={uploadSummary} /> : null}
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
        <h2 className="text-xl font-semibold">Журнал событий</h2>
        <div className="grid gap-2 text-xs text-slate-600">
          {events.map((event) => (
            <p key={event.id}>{event.timestamp} — {translateEventType(event.type)} — {event.message_id ?? ""}</p>
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
              <th className="p-3">Компания</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Обновлено</th>
              <th className="p-3">Ошибка</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="p-3">{row.company}</td>
                <td className="p-3">{row.email}</td>
                <td className="p-3">{translateRecipientStatus(row.status)}</td>
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

function UploadSummary({summary}: {summary: Record<string, unknown>}) {
  const fields = ([
    ["Всего строк", summary.rows_total],
    ["Импортировано", summary.imported ?? summary.rows_imported],
    ["Пропущено", summary.skipped ?? summary.rows_skipped],
    ["Дубликаты", summary.skipped_duplicates],
    ["Некорректные email", summary.skipped_invalid],
    ["ID загрузки", summary.upload_id],
    ["Ошибка", typeof summary.error === "string" ? translateError(summary.error) : summary.error]
  ] as Array<[string, unknown]>).filter(([, value]) => value !== undefined && value !== null);

  return (
    <dl className="grid gap-2 rounded bg-slate-50 p-3 text-xs text-slate-700 sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div key={String(label)} className="grid gap-1">
          <dt className="font-medium text-slate-500">{label}</dt>
          <dd className="text-slate-900">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function translateRecipientStatus(status: string) {
  const labels: Record<string, string> = {
    queued: "В очереди",
    paused: "На паузе",
    sent: "Отправлено",
    error: "Ошибка",
    skipped: "Пропущено",
    unsubscribed: "Отписался",
    do_not_contact: "Не контактировать",
    bounced: "Возврат письма"
  };
  return labels[status] ?? status;
}

function translateEventType(type: string) {
  const labels: Record<string, string> = {
    started: "Запущено",
    paused: "Поставлено на паузу",
    settings_changed: "Настройки изменены",
    upload: "Загрузка базы",
    import: "Импорт",
    send_success: "Письмо отправлено",
    send_error: "Ошибка отправки",
    sent_append_failed: "Не удалось сохранить в Отправленные",
    do_not_contact: "Помечено как не контактировать",
    requeue: "Возвращено в очередь"
  };
  return labels[type] ?? type;
}

async function parseJsonResponse(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {error: "invalid_server_response"};
  }
}

function translateError(error: unknown) {
  if (typeof error !== "string" || !error) {
    return "Операция не выполнена";
  }
  const labels: Record<string, string> = {
    authentication_required: "Требуется вход",
    private_disabled: "Закрытый кабинет отключён",
    file_required: "Выберите файл",
    file_too_large: "Файл слишком большой. Максимальный размер — 2 МБ",
    unsupported_file_type: "Поддерживаются только .xlsx и .csv",
    workbook_is_empty: "В книге не найден первый лист с данными",
    invalid_workbook: "Не удалось прочитать Excel-файл",
    invalid_server_response: "Сервер вернул некорректный ответ",
    upload_failed: "Не удалось загрузить файл. Проверьте формат и попробуйте ещё раз",
    min_delay_too_low: "Минимальная пауза слишком маленькая",
    max_delay_must_exceed_min_delay: "Максимальная пауза должна быть больше минимальной",
    daily_limit_too_high: "Дневной лимит слишком высокий"
  };
  return labels[error] ?? error;
}
