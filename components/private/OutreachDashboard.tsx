"use client";

import type {FormEvent, PointerEvent as ReactPointerEvent} from "react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {motion} from "framer-motion";
import {GripVertical, Pencil, Send, X} from "lucide-react";

type Status = {
  settings: {
    enabled: boolean;
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
  queue_position: number | null;
  history_match_type: "none" | "full" | "email" | "company";
  history_match_detail: string | null;
  variant: 1 | 2 | 3;
};

type QueueDropTarget = {
  id: number;
  placement: "before" | "after";
};

type EventRow = {
  id: number;
  timestamp: string;
  type: string;
  recipient_id: number | null;
  message_id: string | null;
  detail_json: string;
};

type TemplateVariantNumber = 1 | 2 | 3;

type TemplateVariantState = {
  subject: string;
  body: string;
  preview: {subject: string; text: string; html: string};
};

type TemplateState = {
  variants: Record<TemplateVariantNumber, TemplateVariantState>;
};

type SettingsDraft = Status["settings"];

type MailProvider = "timeweb" | "vk-workspace" | "custom";

type MailSettingsDraft = {
  provider: MailProvider;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_password: string;
  smtp_password_set: boolean;
  smtp_from: string;
  smtp_reply_to: string;
  imap_host: string;
  imap_port: number;
  imap_secure: boolean;
  imap_user: string;
  imap_password: string;
  imap_password_set: boolean;
  updated_at: string | null;
};

const templateVariants: TemplateVariantNumber[] = [1, 2, 3];

const mailProviderPresets: Record<Exclude<MailProvider, "custom">, Pick<MailSettingsDraft, "provider" | "smtp_host" | "smtp_port" | "smtp_secure" | "imap_host" | "imap_port" | "imap_secure">> = {
  timeweb: {
    provider: "timeweb",
    smtp_host: "smtp.timeweb.ru",
    smtp_port: 465,
    smtp_secure: true,
    imap_host: "imap.timeweb.ru",
    imap_port: 993,
    imap_secure: true
  },
  "vk-workspace": {
    provider: "vk-workspace",
    smtp_host: "smtp.mail.ru",
    smtp_port: 465,
    smtp_secure: true,
    imap_host: "imap.mail.ru",
    imap_port: 993,
    imap_secure: true
  }
};

const emptyTemplateVariant: TemplateVariantState = {
  subject: "",
  body: "",
  preview: {subject: "", text: "", html: ""}
};

const emptyTemplateVariants: Record<TemplateVariantNumber, TemplateVariantState> = {
  1: emptyTemplateVariant,
  2: emptyTemplateVariant,
  3: emptyTemplateVariant
};

const defaultSettingsDraft: SettingsDraft = {
  enabled: false,
  allowed_days: [1, 2, 3, 4, 5],
  allowed_time_start: "10:00",
  allowed_time_end: "18:00",
  min_delay_minutes: 15,
  max_delay_minutes: 25,
  unlimited_mode: false,
  saved_regular_min_delay_minutes: null,
  saved_regular_max_delay_minutes: null,
  daily_limit: 10,
  next_send_after: null
};

const defaultMailSettingsDraft: MailSettingsDraft = {
  provider: "timeweb",
  smtp_host: "smtp.timeweb.ru",
  smtp_port: 465,
  smtp_secure: true,
  smtp_user: "office@longqingtrade.com",
  smtp_password: "",
  smtp_password_set: false,
  smtp_from: "LONGQING TRADE <office@longqingtrade.com>",
  smtp_reply_to: "office@longqingtrade.com",
  imap_host: "imap.timeweb.ru",
  imap_port: 993,
  imap_secure: true,
  imap_user: "office@longqingtrade.com",
  imap_password: "",
  imap_password_set: false,
  updated_at: null
};

export function OutreachDashboard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<SettingsDraft>(defaultSettingsDraft);
  const [queue, setQueue] = useState<Recipient[]>([]);
  const [sent, setSent] = useState<Recipient[]>([]);
  const [errors, setErrors] = useState<Recipient[]>([]);
  const [queueExpanded, setQueueExpanded] = useState(false);
  const [sentExpanded, setSentExpanded] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventsVisible, setEventsVisible] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [template, setTemplate] = useState<TemplateState | null>(null);
  const [stockListText, setStockListText] = useState("");
  const [stockListOpen, setStockListOpen] = useState(false);
  const [mailSettingsDraft, setMailSettingsDraft] = useState<MailSettingsDraft>(defaultMailSettingsDraft);
  const [mailSettingsOpen, setMailSettingsOpen] = useState(false);
  const [templateDrafts, setTemplateDrafts] = useState<Record<TemplateVariantNumber, {subject: string; body: string}>>({
    1: {subject: "", body: ""},
    2: {subject: "", body: ""},
    3: {subject: "", body: ""}
  });
  const [activeTemplateVariant, setActiveTemplateVariant] = useState<TemplateVariantNumber>(1);
  const [previewRecipientId, setPreviewRecipientId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState({company: "", email: ""});
  const [manualRecipient, setManualRecipient] = useState({company: "", email: ""});
  const [manualMessage, setManualMessage] = useState("");
  const [draggedQueueId, setDraggedQueueId] = useState<number | null>(null);
  const queueRef = useRef<Recipient[]>([]);
  const draggedQueueIdRef = useRef<number | null>(null);
  const dragOrderChangedRef = useRef(false);
  const [sendNowCandidate, setSendNowCandidate] = useState<Recipient | null>(null);
  const [sendingNowId, setSendingNowId] = useState<number | null>(null);
  const [uploadSummary, setUploadSummary] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState("");
  const [moscowNow, setMoscowNow] = useState("");

  const settings = status?.settings;
  const weekdays = useMemo(
    () => [
      {label: "Пн", value: 1},
      {label: "Вт", value: 2},
      {label: "Ср", value: 3},
      {label: "Чт", value: 4},
      {label: "Пт", value: 5},
      {label: "Сб", value: 6},
      {label: "Вс", value: 0}
    ],
    []
  );

  const refresh = useCallback(async () => {
    const [nextStatus, nextQueue, nextSent, nextErrors, nextEvents, nextTemplate, nextMailSettings, nextStockList] = await Promise.all([
      fetch("/api/private/outreach/status").then((response) => response.json()),
      fetch("/api/private/outreach/recipients?status=queued").then((response) => response.json()),
      fetch("/api/private/outreach/recipients?status=sent").then((response) => response.json()),
      fetch("/api/private/outreach/recipients?status=error").then((response) => response.json()),
      fetch(eventsExpanded ? "/api/private/outreach/events?all=1" : "/api/private/outreach/events").then((response) => response.json()),
      fetch("/api/private/outreach/template").then((response) => response.json()),
      fetch("/api/private/outreach/mail-settings").then((response) => response.json()),
      fetch("/api/private/outreach/stock-list").then((response) => response.json())
    ]);
    setStatus(nextStatus);
    setSettingsDraft(nextStatus.settings ?? defaultSettingsDraft);
    setQueue(nextQueue.recipients ?? []);
    setSent(nextSent.recipients ?? []);
    setErrors(nextErrors.recipients ?? []);
    setEvents(nextEvents.events ?? []);
    const nextVariants = (nextTemplate.variants ?? emptyTemplateVariants) as TemplateState["variants"];
    setTemplate({variants: nextVariants});
    setTemplateDrafts({
      1: {subject: nextVariants[1]?.subject ?? "", body: nextVariants[1]?.body ?? ""},
      2: {subject: nextVariants[2]?.subject ?? "", body: nextVariants[2]?.body ?? ""},
      3: {subject: nextVariants[3]?.subject ?? "", body: nextVariants[3]?.body ?? ""}
    });
    setMailSettingsDraft({
      ...defaultMailSettingsDraft,
      ...nextMailSettings,
      smtp_password: "",
      imap_password: ""
    });
    setStockListText(typeof nextStockList.text === "string" ? nextStockList.text : "");
  }, [eventsExpanded]);

  useEffect(() => {
    refresh().catch(() => setMessage("Не удалось загрузить данные панели"));
  }, [refresh]);

  useEffect(() => {
    function updateMoscowClock() {
      setMoscowNow(formatMoscowDateTime(new Date()));
    }
    updateMoscowClock();
    const timer = window.setInterval(updateMoscowClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    draggedQueueIdRef.current = draggedQueueId;
  }, [draggedQueueId]);

  async function control(action: "start" | "pause") {
    const response = await fetch(`/api/private/outreach/control/${action}`, {method: "POST"});
    const body = await response.json();
    setMessage(response.ok ? (action === "start" ? "Рассылка включена" : "Рассылка поставлена на паузу") : translateError(body.error));
    await refresh();
  }

  async function logout() {
    await fetch("/api/private/auth/logout", {method: "POST"});
    window.location.href = "/en/private/auth";
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

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      allowed_days: settingsDraft.allowed_days,
      allowed_time_start: settingsDraft.allowed_time_start,
      allowed_time_end: settingsDraft.allowed_time_end,
      min_delay_minutes: settingsDraft.min_delay_minutes,
      max_delay_minutes: settingsDraft.max_delay_minutes,
      daily_limit: settingsDraft.daily_limit,
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

  function setMailProvider(provider: MailProvider) {
    setMailSettingsDraft((current) => {
      const preset = provider === "custom" ? {} : mailProviderPresets[provider];
      return {
        ...current,
        ...preset,
        provider
      };
    });
  }

  async function saveMailSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/private/outreach/mail-settings", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(mailSettingsDraft)
    });
    const body = await parseJsonResponse(response);
    if (response.ok) {
      setMailSettingsDraft({
        ...defaultMailSettingsDraft,
        ...body,
        smtp_password: "",
        imap_password: ""
      } as MailSettingsDraft);
      setMessage("Настройки почты сохранены");
      setMailSettingsOpen(false);
      await refresh();
    } else {
      setMessage(translateError(body.error));
    }
  }

  async function addManualRecipient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/private/outreach/recipients", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(manualRecipient)
    });
    const body = await parseJsonResponse(response);
    const nextMessage =
      response.ok
        ? (body.reused ? "Получатель уже был в базе, обновлён и возвращён в очередь" : "Получатель добавлен в очередь")
        : translateError(body.error);
    setManualMessage(nextMessage);
    setMessage(nextMessage);
    if (response.ok) {
      setManualRecipient({company: "", email: ""});
      await refresh();
    }
  }

  async function saveTemplate() {
    const activeDraft = templateDrafts[activeTemplateVariant];
    const response = await fetch("/api/private/outreach/template", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({variant: activeTemplateVariant, ...activeDraft})
    });
    const body = await parseJsonResponse(response);
    setMessage(response.ok ? `Шаблон варианта ${activeTemplateVariant} сохранён` : translateError(body.error, body));
    if (response.ok) {
      setTemplate(body as TemplateState);
      await refresh();
    }
  }

  async function saveStockList() {
    const response = await fetch("/api/private/outreach/stock-list", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({text: stockListText})
    });
    const body = await parseJsonResponse(response);
    if (response.ok) {
      setStockListText(String(body.text ?? stockListText));
      setStockListOpen(false);
      setMessage(`Список позиций сохранён: ${body.rows_count ?? 0} строк`);
      await refresh();
    } else {
      setMessage(translateError(body.error));
    }
  }

  async function showAllEvents() {
    const response = await fetch("/api/private/outreach/events?all=1");
    const body = await parseJsonResponse(response);
    setEvents((body.events as EventRow[] | undefined) ?? []);
    setEventsExpanded(true);
    setEventsVisible(true);
  }

  function startEdit(row: Recipient) {
    setEditingId(row.id);
    setEditDraft({company: row.company, email: row.email});
  }

  async function saveRecipient(row: Recipient) {
    const response = await fetch(`/api/private/outreach/recipients/${row.id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(editDraft)
    });
    const body = await parseJsonResponse(response);
    setMessage(response.ok ? "Получатель обновлён" : translateError(body.error));
    if (response.ok) {
      setEditingId(null);
      await refresh();
    }
  }

  async function changeRecipientVariant(row: Recipient, variant: TemplateVariantNumber) {
    const response = await fetch(`/api/private/outreach/recipients/${row.id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({variant})
    });
    const body = await parseJsonResponse(response);
    setMessage(response.ok ? `Вариант изменён на ${variant}` : translateError(body.error));
    if (response.ok) {
      await refresh();
    }
  }

  async function excludeRecipient(row: Recipient) {
    if (!window.confirm(`Исключить получателя ${row.email} из очереди?`)) {
      return;
    }
    const response = await fetch(`/api/private/outreach/recipients/${row.id}/do-not-contact`, {method: "POST"});
    const body = await parseJsonResponse(response);
    setMessage(response.ok ? "Получатель исключён из очереди" : translateError(body.error));
    if (response.ok) {
      await refresh();
    }
  }

  async function sendRecipientNow(row: Recipient) {
    setSendingNowId(row.id);
    setSendNowCandidate(null);
    const response = await fetch(`/api/private/outreach/recipients/${row.id}/send-now`, {method: "POST"});
    const body = await parseJsonResponse(response);
    setSendingNowId(null);
    setMessage(response.ok ? `Письмо отправлено: ${row.company} — ${row.email}` : translateError(body.error, body));
    await refresh();
  }

  async function deleteSentRecipient(row: Recipient) {
    if (!window.confirm(`Удалить запись об отправке ${row.email}? Это действие только для очистки тестовой истории.`)) {
      return;
    }
    const response = await fetch(`/api/private/outreach/recipients/${row.id}`, {method: "DELETE"});
    const body = await parseJsonResponse(response);
    setMessage(response.ok ? "Запись удалена из отправленных" : translateError(body.error));
    if (response.ok) {
      await refresh();
    }
  }

  const clearQueueDrag = useCallback(() => {
    setDraggedQueueId(null);
    draggedQueueIdRef.current = null;
    dragOrderChangedRef.current = false;
  }, []);

  function startQueueDrag(row: Recipient, event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    draggedQueueIdRef.current = row.id;
    dragOrderChangedRef.current = false;
    setDraggedQueueId(row.id);
  }

  const previewQueueReorder = useCallback((sourceId: number, target: QueueDropTarget | null) => {
    if (!sourceId || !target || sourceId === target.id) {
      return;
    }
    const currentQueue = queueRef.current;
    const numberedQueue = moveQueueRow(currentQueue, sourceId, target);
    if (sameQueueOrder(currentQueue, numberedQueue)) {
      return;
    }
    queueRef.current = numberedQueue;
    dragOrderChangedRef.current = true;
    setQueue(numberedQueue);
  }, []);

  const persistQueueOrder = useCallback(async (orderedQueue: Recipient[]) => {
    if (orderedQueue.length === 0) {
      clearQueueDrag();
      return;
    }
    clearQueueDrag();

    const response = await fetch("/api/private/outreach/recipients/reorder", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ids: orderedQueue.map((row) => row.id)})
    });
    const body = await parseJsonResponse(response);
    if (response.ok) {
      setQueue((body.recipients as Recipient[] | undefined) ?? orderedQueue);
      setMessage("Порядок очереди обновлён");
    } else {
      setMessage(translateError(body.error));
      await refresh();
    }
  }, [clearQueueDrag, refresh]);

  useEffect(() => {
    if (!draggedQueueId) return undefined;

    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    function handlePointerMove(event: PointerEvent) {
      const currentDraggedId = draggedQueueIdRef.current;
      if (!currentDraggedId) return;

      const target = queueDropTargetFromPoint(event.clientX, event.clientY, currentDraggedId);
      previewQueueReorder(currentDraggedId, target);
    }

    function handlePointerUp() {
      if (dragOrderChangedRef.current) {
        void persistQueueOrder(queueRef.current);
      } else {
        clearQueueDrag();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearQueueDrag();
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearQueueDrag, draggedQueueId, persistQueueOrder, previewQueueReorder]);

  const previewRecipients = [...queue, ...sent, ...errors];
  const previewRecipient =
    previewRecipients.find((recipient) => String(recipient.id) === previewRecipientId) ??
    previewRecipients[0] ?? {company: "Тестовая компания", email: "example@example.ru"};
  const activeTemplateDraft = templateDrafts[activeTemplateVariant];
  const previewSubject = renderClientTemplate(activeTemplateDraft.subject, previewRecipient, stockListText);
  const previewBody = renderClientTemplate(activeTemplateDraft.body, previewRecipient, stockListText);
  const isRunning = Boolean(settings?.enabled);
  const isUnlimited = false;
  const visibleQueue = queueExpanded ? queue : queue.slice(0, 20);
  const visibleSent = sentExpanded ? sent : sent.slice(0, 20);

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Рассылка MTU</h1>
          <p className="mt-2 text-sm text-slate-600">Закрытая очередь B2B-рассылки. Отправка выполняется только фоновым серверным процессом.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded border border-slate-300 bg-white px-4 py-2 text-sm transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700" onClick={() => setMailSettingsOpen(true)} type="button">
            Настроить почту
          </button>
          <button className="rounded border border-slate-300 px-4 py-2 text-sm" onClick={logout} type="button">
            Выйти
          </button>
        </div>
      </div>

      {message ? <p className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-600">{message}</p> : null}

      {sendNowCandidate ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="grid max-w-lg gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-base text-slate-800">
              Вы уверены, что хотите отправить письмо <span className="font-semibold">{sendNowCandidate.company}</span> на{" "}
              <span className="font-semibold">{sendNowCandidate.email}</span> прямо сейчас?
            </p>
            <div className="flex justify-end gap-3">
              <button
                aria-label="Нет"
                className="inline-flex h-11 w-11 items-center justify-center rounded border border-rose-200 bg-rose-50 text-xl font-semibold text-rose-700 transition hover:bg-rose-100"
                type="button"
                onClick={() => setSendNowCandidate(null)}
              >
                ×
              </button>
              <button
                aria-label="Да"
                className="inline-flex h-11 w-11 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-xl font-semibold text-emerald-700 transition hover:bg-emerald-100"
                type="button"
                onClick={() => sendRecipientNow(sendNowCandidate)}
              >
                ✓
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {mailSettingsOpen ? (
        <MailSettingsModal
          draft={mailSettingsDraft}
          onChange={setMailSettingsDraft}
          onClose={() => setMailSettingsOpen(false)}
          onProviderChange={setMailProvider}
          onSubmit={saveMailSettings}
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Статус" value={isUnlimited ? "В тестовом режиме" : (settings?.enabled ? "Запущена" : "На паузе")} tone={isUnlimited ? "danger" : "default"} />
        <Stat label="Время в Москве" value={moscowNow || status?.moscowNow || "-"} />
        <Stat label="Отправлено сегодня" value={`${status?.todaySent ?? 0} / ${settings?.daily_limit ?? 0}`} />
        <Stat label="Очередь / отправлено / ошибки" value={`${status?.queued ?? 0} / ${status?.sent ?? 0} / ${status?.errors ?? 0}`} />
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Управление</h2>
        <div className="flex flex-wrap gap-3">
          <button
            className={
              isRunning && !isUnlimited
                ? "h-10 rounded border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                : "h-10 rounded border border-slate-300 bg-white px-4 text-sm transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
            }
            type="button"
            aria-pressed={isRunning}
            onClick={() => control("start")}
          >
            {isRunning ? "Работает" : "Запустить"}
          </button>
          <button
            className={
              isRunning
                ? "h-10 rounded border border-slate-300 bg-white px-4 text-sm transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                : "h-10 rounded border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
            }
            type="button"
            aria-pressed={!isRunning}
            onClick={() => control("pause")}
          >
            Пауза
          </button>
        </div>
      </section>

      {settings ? (
        <form onSubmit={saveSettings} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Настройки</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {weekdays.map((day) => (
              <label key={day.value} className="flex items-center gap-2 text-sm">
                <input
                  name={`day-${day.value}`}
                  type="checkbox"
                  checked={settingsDraft.allowed_days.includes(day.value)}
                  onChange={(event) =>
                    setSettingsDraft((current) => ({
                      ...current,
                      allowed_days: event.target.checked
                        ? [...new Set([...current.allowed_days, day.value])].sort((left, right) => left - right)
                        : current.allowed_days.filter((dayIndex) => dayIndex !== day.value)
                    }))
                  }
                />
                {day.label}
              </label>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <Input
              name="allowed_time_start"
              label="Начало, МСК"
              value={settingsDraft.allowed_time_start}
              onChange={(value) => setSettingsDraft((current) => ({...current, allowed_time_start: value}))}
            />
            <Input
              name="allowed_time_end"
              label="Окончание, МСК"
              value={settingsDraft.allowed_time_end}
              onChange={(value) => setSettingsDraft((current) => ({...current, allowed_time_end: value}))}
            />
            <Input
              name="min_delay_minutes"
              label="Мин. пауза, мин"
              type="number"
              min={3}
              value={settingsDraft.min_delay_minutes}
              onChange={(value) => setSettingsDraft((current) => ({...current, min_delay_minutes: numberValue(value)}))}
            />
            <Input
              name="max_delay_minutes"
              label="Макс. пауза, мин"
              type="number"
              min={3}
              value={settingsDraft.max_delay_minutes}
              onChange={(value) => setSettingsDraft((current) => ({...current, max_delay_minutes: numberValue(value)}))}
            />
            <Input
              name="daily_limit"
              label={`Лимит в день. Сейчас — ${settings?.daily_limit ?? settingsDraft.daily_limit}`}
              type="number"
              min={1}
              max={100}
              value={settingsDraft.daily_limit}
              onChange={(value) => setSettingsDraft((current) => ({...current, daily_limit: numberValue(value)}))}
            />
          </div>
          <p className="grid gap-1 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <span>{formatSendCapacity(settingsDraft)}</span>
            <span>{formatTodaySendCapacity(settingsDraft, status?.todaySent ?? 0)}</span>
          </p>
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

      <form onSubmit={addManualRecipient} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Добавить получателя вручную</h2>
        <p className="text-sm text-slate-600">
          Получатель попадёт в очередь. Если компания или e-mail совпадают с историей отправок, строка будет подсвечена.
        </p>
        {manualMessage ? <p className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{manualMessage}</p> : null}
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Input
            name="manual_company"
            label="Компания"
            value={manualRecipient.company}
            onChange={(value) => setManualRecipient((current) => ({...current, company: value}))}
          />
          <Input
            name="manual_email"
            label="E-mail"
            type="email"
            value={manualRecipient.email}
            onChange={(value) => setManualRecipient((current) => ({...current, email: value}))}
          />
          <button className="btn-primary h-10 px-4 text-sm" type="submit">
            Добавить
          </button>
        </div>
      </form>

      <Table
        title="Очередь"
        rows={visibleQueue}
        totalRows={queue.length}
        expanded={queueExpanded}
        onToggleExpanded={() => setQueueExpanded((current) => !current)}
        queueMode
        draggedRowId={draggedQueueId}
        onPointerDragStart={startQueueDrag}
        editable
        editingId={editingId}
        editDraft={editDraft}
        onStartEdit={startEdit}
        onEditDraftChange={setEditDraft}
        onSaveEdit={saveRecipient}
        onCancelEdit={() => setEditingId(null)}
        onExclude={excludeRecipient}
        onVariantChange={changeRecipientVariant}
        onSendNow={setSendNowCandidate}
        sendingNowId={sendingNowId}
      />
      <Table
        title="Отправлено"
        rows={visibleSent}
        totalRows={sent.length}
        expanded={sentExpanded}
        onToggleExpanded={() => setSentExpanded((current) => !current)}
        removable
        onRemove={deleteSentRecipient}
      />
      <Table
        title="Ошибки"
        rows={errors}
        editable
        editingId={editingId}
        editDraft={editDraft}
        onStartEdit={startEdit}
        onEditDraftChange={setEditDraft}
        onSaveEdit={saveRecipient}
        onCancelEdit={() => setEditingId(null)}
        onExclude={excludeRecipient}
      />

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Шаблон письма</h2>
        <p className="text-sm text-slate-600">
          Доступные переменные: <code>{"{{Компания}}"}</code>, <code>{"{{email}}"}</code>, <code>{"{{СписокПозиций}}"}</code>.
          Предпросмотр ниже обновляется по текущему тексту.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-teal-500 hover:bg-teal-50"
            type="button"
            onClick={() => setStockListOpen((current) => !current)}
          >
            Редактировать список позиций
          </button>
        </div>
        {stockListOpen ? (
          <div className="grid gap-3 rounded border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-600">
              Формат: <code>Номер | Name | Наименование | Кол-во</code>. Этот список подставляется вместо <code>{"{{СписокПозиций}}"}</code> во все варианты письма.
            </p>
            <textarea
              className="min-h-72 rounded border border-slate-200 bg-white p-3 font-mono text-sm text-slate-950"
              value={stockListText}
              onChange={(event) => setStockListText(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary h-10 px-4 text-sm" type="button" onClick={saveStockList}>
                Сохранить список
              </button>
              <button className="rounded border border-slate-300 bg-white px-4 py-2 text-sm" type="button" onClick={() => setStockListOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {templateVariants.map((variant) => (
            <button
              key={variant}
              type="button"
              className={
                activeTemplateVariant === variant
                  ? "rounded border border-teal-500 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800"
                  : "rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-teal-500 hover:bg-teal-50"
              }
              onClick={() => setActiveTemplateVariant(variant)}
            >
              Вариант {variant}
            </button>
          ))}
        </div>
        <label className="grid gap-1 text-sm text-slate-600">
          Тема письма
          <input
            className="h-10 rounded border border-slate-200 px-3 text-slate-950"
            value={activeTemplateDraft.subject}
            onChange={(event) =>
              setTemplateDrafts((current) => ({
                ...current,
                [activeTemplateVariant]: {...current[activeTemplateVariant], subject: event.target.value}
              }))
            }
          />
        </label>
        <label className="grid gap-1 text-sm text-slate-600">
          Текст письма
          <textarea
            className="min-h-80 rounded border border-slate-200 p-3 font-mono text-sm text-slate-950"
            value={activeTemplateDraft.body}
            onChange={(event) =>
              setTemplateDrafts((current) => ({
                ...current,
                [activeTemplateVariant]: {...current[activeTemplateVariant], body: event.target.value}
              }))
            }
          />
        </label>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid min-w-72 gap-1 text-sm text-slate-600">
            Получатель для предпросмотра
            <select
              className="h-10 rounded border border-slate-200 px-3 text-slate-950"
              value={previewRecipientId}
              onChange={(event) => setPreviewRecipientId(event.target.value)}
            >
              <option value="">Тестовая компания</option>
              {previewRecipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.company} — {recipient.email}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-primary h-10 px-4 text-sm" type="button" onClick={saveTemplate}>
            Сохранить шаблон
          </button>
        </div>
        <div className="grid gap-2 rounded bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-slate-950">Тема: {previewSubject}</p>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs text-slate-700">{previewBody}</pre>
        </div>
        {template?.variants?.[activeTemplateVariant]?.preview ? (
          <p className="text-xs text-slate-500">
            Сохранённый серверный предпросмотр варианта {activeTemplateVariant}: {template.variants[activeTemplateVariant]?.preview?.subject ?? ""}
          </p>
        ) : null}
      </section>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Журнал событий</h2>
          {eventsVisible ? (
            <div className="flex flex-wrap gap-2">
              {!eventsExpanded ? (
                <button className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm" type="button" onClick={showAllEvents}>
                  Показать все
                </button>
              ) : null}
              <button className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm" type="button" onClick={() => setEventsVisible(false)}>
                Скрыть
              </button>
            </div>
          ) : (
            <button className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm" type="button" onClick={() => setEventsVisible(true)}>
              Показать
            </button>
          )}
        </div>
        {eventsVisible ? (
          <div className="grid max-h-[520px] gap-2 overflow-auto text-xs text-slate-600">
            {events.map((event) => (
              <p key={event.id}>
                {formatRuDateTime(event.timestamp)} — {translateEventType(event.type)}
                {formatEventDetail(event) ? ` — ${formatEventDetail(event)}` : ""}
                {event.message_id ? ` — ${event.message_id}` : ""}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">По умолчанию скрыт. Показываются последние 50 событий, полная история доступна кнопкой «Показать все».</p>
        )}
      </section>
    </div>
  );
}

function Stat({label, value, tone = "default"}: {label: string; value: string; tone?: "default" | "danger"}) {
  return (
    <div className={tone === "danger" ? "rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm" : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"}>
      <p className={tone === "danger" ? "text-xs uppercase tracking-[0.12em] text-rose-500" : "text-xs uppercase tracking-[0.12em] text-slate-500"}>{label}</p>
      <p className={tone === "danger" ? "mt-2 text-xl font-semibold text-rose-800" : "mt-2 text-xl font-semibold text-slate-950"}>{value}</p>
    </div>
  );
}

function queueDropTargetFromPoint(_x: number, y: number, draggedId: number): QueueDropTarget | null {
  const rows = Array.from(document.querySelectorAll("[data-queue-row-id]")) as HTMLElement[];
  let lastTarget: QueueDropTarget | null = null;
  for (const row of rows) {
    const id = Number(row.dataset.queueRowId);
    if (!Number.isInteger(id) || id <= 0 || id === draggedId) {
      continue;
    }
    const rect = row.getBoundingClientRect();
    lastTarget = {id, placement: "after"};
    if (y < rect.top + rect.height / 2) {
      return {id, placement: "before"};
    }
  }
  return lastTarget;
}

function moveQueueRow(rows: Recipient[], sourceId: number, target: QueueDropTarget) {
  const source = rows.find((row) => row.id === sourceId);
  if (!source) {
    return rows;
  }
  const remaining = rows.filter((row) => row.id !== sourceId);
  const targetIndex = remaining.findIndex((row) => row.id === target.id);
  if (targetIndex < 0) {
    return rows;
  }
  const insertIndex = target.placement === "after" ? targetIndex + 1 : targetIndex;
  const nextRows = [
    ...remaining.slice(0, insertIndex),
    source,
    ...remaining.slice(insertIndex)
  ];
  return nextRows.map((row, index) => ({...row, queue_position: index + 1}));
}

function sameQueueOrder(left: Recipient[], right: Recipient[]) {
  return left.length === right.length && left.every((row, index) => row.id === right[index]?.id);
}

function MailSettingsModal({
  draft,
  onChange,
  onClose,
  onProviderChange,
  onSubmit
}: {
  draft: MailSettingsDraft;
  onChange: (draft: MailSettingsDraft | ((current: MailSettingsDraft) => MailSettingsDraft)) => void;
  onClose: () => void;
  onProviderChange: (provider: MailProvider) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const update = <Key extends keyof MailSettingsDraft>(key: Key, value: MailSettingsDraft[Key]) => {
    onChange((current) => ({...current, [key]: value}));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/35 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="grid max-h-[92vh] w-full max-w-4xl gap-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Настроить почту</h2>
            <p className="mt-1 text-sm text-slate-600">
              Эти данные использует рассылка для SMTP-отправки и сохранения копии письма в папку «Отправленные» через IMAP.
            </p>
          </div>
          <button className="rounded border border-slate-300 px-3 py-1.5 text-sm" type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Для VK WorkSpace / Mail.ru обычно используются SMTP <code>smtp.mail.ru:465 SSL</code> и IMAP <code>imap.mail.ru:993 SSL</code>.
          Пароль нужен для внешних приложений. Пустое поле пароля при сохранении оставляет уже сохранённый пароль.
        </div>

        <label className="grid gap-1 text-sm text-slate-600">
          Провайдер
          <select
            className="h-10 rounded border border-slate-200 px-3 text-slate-950"
            value={draft.provider}
            onChange={(event) => onProviderChange(event.target.value as MailProvider)}
          >
            <option value="timeweb">Timeweb</option>
            <option value="vk-workspace">VK WorkSpace / Mail.ru</option>
            <option value="custom">Другой SMTP/IMAP</option>
          </select>
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="grid gap-3 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-950">SMTP: отправка писем</h3>
            <Input name="smtp_host" label="SMTP host" value={draft.smtp_host} onChange={(value) => update("smtp_host", value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="smtp_port" label="SMTP port" type="number" min={1} max={65535} value={draft.smtp_port} onChange={(value) => update("smtp_port", numberValue(value))} />
              <label className="flex items-center gap-2 pt-7 text-sm text-slate-600">
                <input type="checkbox" checked={draft.smtp_secure} onChange={(event) => update("smtp_secure", event.target.checked)} />
                SSL/TLS
              </label>
            </div>
            <Input name="smtp_user" label="SMTP user / логин ящика" value={draft.smtp_user} onChange={(value) => update("smtp_user", value)} />
            <label className="grid gap-1 text-sm text-slate-600">
              SMTP password / пароль приложения
              <input
                autoComplete="new-password"
                className="h-10 rounded border border-slate-200 px-3 text-slate-950"
                placeholder={draft.smtp_password_set ? "Сохранён. Введите новый только для замены" : "Введите пароль приложения"}
                type="password"
                value={draft.smtp_password}
                onChange={(event) => update("smtp_password", event.target.value)}
              />
            </label>
            <Input name="smtp_from" label="From" value={draft.smtp_from} onChange={(value) => update("smtp_from", value)} />
            <Input name="smtp_reply_to" label="Reply-To" value={draft.smtp_reply_to} onChange={(value) => update("smtp_reply_to", value)} />
          </section>

          <section className="grid gap-3 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-950">IMAP: копия в «Отправленные»</h3>
            <Input name="imap_host" label="IMAP host" value={draft.imap_host} onChange={(value) => update("imap_host", value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="imap_port" label="IMAP port" type="number" min={1} max={65535} value={draft.imap_port} onChange={(value) => update("imap_port", numberValue(value))} />
              <label className="flex items-center gap-2 pt-7 text-sm text-slate-600">
                <input type="checkbox" checked={draft.imap_secure} onChange={(event) => update("imap_secure", event.target.checked)} />
                SSL/TLS
              </label>
            </div>
            <Input name="imap_user" label="IMAP user / логин ящика" value={draft.imap_user} onChange={(value) => update("imap_user", value)} />
            <label className="grid gap-1 text-sm text-slate-600">
              IMAP password / пароль приложения
              <input
                autoComplete="new-password"
                className="h-10 rounded border border-slate-200 px-3 text-slate-950"
                placeholder={draft.imap_password_set ? "Сохранён. Введите новый только для замены" : "Введите пароль приложения"}
                type="password"
                value={draft.imap_password}
                onChange={(event) => update("imap_password", event.target.value)}
              />
            </label>
            <p className="text-xs text-slate-500">
              Если SMTP и IMAP используют один пароль приложения, можно указать одинаковый пароль в обоих полях.
            </p>
          </section>
        </div>

        <div className="flex justify-end gap-3">
          <button className="rounded border border-slate-300 px-4 py-2 text-sm" type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="btn-primary h-10 px-4 text-sm" type="submit">
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  name,
  label,
  value,
  type = "text",
  min,
  max,
  onChange
}: {
  name: string;
  label: string;
  value: string | number;
  type?: string;
  min?: number;
  max?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-600">
      {label}
      <input
        name={name}
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded border border-slate-200 px-3 text-slate-950"
      />
    </label>
  );
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoscowDateTime(date: Date) {
  return date.toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatRuDateTime(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")} ${get("month")} ${get("year")}г. ${get("hour")}:${get("minute")}:${get("second")}`;
}

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

function sendCountForWindow(windowMinutes: number, delayMinutes: number) {
  if (windowMinutes < 0 || delayMinutes <= 0) {
    return 0;
  }
  return Math.floor(windowMinutes / delayMinutes) + 1;
}

function formatSendCapacity(settings: SettingsDraft) {
  const start = minutesFromTime(settings.allowed_time_start);
  const end = minutesFromTime(settings.allowed_time_end);
  const minDelay = Math.max(3, Number(settings.min_delay_minutes) || 0);
  const maxDelay = Math.max(minDelay, Number(settings.max_delay_minutes) || minDelay);
  if (start === null || end === null || end < start) {
    return "Количество писем для отправки в указанное время: проверьте начало и окончание окна по Москве.";
  }
  const windowMinutes = end - start;
  const dailyLimit = Math.max(1, Number(settings.daily_limit) || 1);
  const minimum = Math.min(dailyLimit, sendCountForWindow(windowMinutes, maxDelay));
  const maximum = Math.min(dailyLimit, sendCountForWindow(windowMinutes, minDelay));
  const average = Math.round((minimum + maximum) / 2);
  return `Количество писем для отправки в указанное время по Москве: от ${minimum} до ${maximum} в сутки. Среднее значение: ${average}.`;
}

function moscowScheduleNow(date: Date) {
  const moscow = new Date(date.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
  return {
    day: moscow.getDay(),
    minutes: moscow.getHours() * 60 + moscow.getMinutes()
  };
}

function formatTodaySendCapacity(settings: SettingsDraft, todaySent: number) {
  const start = minutesFromTime(settings.allowed_time_start);
  const end = minutesFromTime(settings.allowed_time_end);
  const minDelay = Math.max(3, Number(settings.min_delay_minutes) || 0);
  const maxDelay = Math.max(minDelay, Number(settings.max_delay_minutes) || minDelay);
  if (start === null || end === null || end < start) {
    return "Сегодня: проверьте начало и окончание окна по Москве.";
  }

  const {day, minutes} = moscowScheduleNow(new Date());
  const dailyLimit = Math.max(1, Number(settings.daily_limit) || 1);
  const remainingDailyLimit = Math.max(0, dailyLimit - Math.max(0, Number(todaySent) || 0));
  let remainingWindowMinutes = 0;
  let canSendToday = false;

  if (settings.allowed_days.includes(day)) {
    if (minutes < start) {
      remainingWindowMinutes = end - start;
      canSendToday = true;
    } else if (minutes <= end) {
      remainingWindowMinutes = end - minutes;
      canSendToday = true;
    }
  }

  const minimum = canSendToday ? Math.min(remainingDailyLimit, sendCountForWindow(remainingWindowMinutes, maxDelay)) : 0;
  const maximum = canSendToday ? Math.min(remainingDailyLimit, sendCountForWindow(remainingWindowMinutes, minDelay)) : 0;
  const average = Math.round((minimum + maximum) / 2);
  return `Сегодня: при запуске сейчас успеет уйти от ${minimum} до ${maximum} писем. Среднее значение: ${average}.`;
}

function Table({
  title,
  rows,
  totalRows,
  expanded = false,
  onToggleExpanded,
  queueMode = false,
  draggedRowId = null,
  onPointerDragStart,
  editable = false,
  editingId = null,
  editDraft = {company: "", email: ""},
  onStartEdit,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
  onExclude,
  onVariantChange,
  onSendNow,
  sendingNowId = null,
  removable = false,
  onRemove
}: {
  title: string;
  rows: Recipient[];
  totalRows?: number;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  queueMode?: boolean;
  draggedRowId?: number | null;
  onPointerDragStart?: (row: Recipient, event: ReactPointerEvent<HTMLButtonElement>) => void;
  editable?: boolean;
  editingId?: number | null;
  editDraft?: {company: string; email: string};
  onStartEdit?: (row: Recipient) => void;
  onEditDraftChange?: (draft: {company: string; email: string}) => void;
  onSaveEdit?: (row: Recipient) => void;
  onCancelEdit?: () => void;
  onExclude?: (row: Recipient) => void;
  onVariantChange?: (row: Recipient, variant: TemplateVariantNumber) => void;
  onSendNow?: (row: Recipient) => void;
  sendingNowId?: number | null;
  removable?: boolean;
  onRemove?: (row: Recipient) => void;
}) {
  const hasHiddenRows = typeof totalRows === "number" && totalRows > rows.length;
  const canCollapse = typeof totalRows === "number" && totalRows > 20 && expanded;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {typeof totalRows === "number" && totalRows > 20 ? (
            <p className="mt-1 text-xs text-slate-500">
              Показано {rows.length} из {totalRows}
            </p>
          ) : null}
        </div>
        {hasHiddenRows || canCollapse ? (
          <button
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
            type="button"
            onClick={onToggleExpanded}
          >
            {expanded ? "Скрыть" : "Показать всё"}
          </button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Компания</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Статус</th>
              <th className="p-3">№</th>
              <th className="p-3">Совпадение</th>
              <th className="p-3">Обновлено</th>
              <th className="p-3">Ошибка</th>
              {editable || removable ? <th className="p-3">Действия</th> : null}
              {queueMode ? <th className="p-3 text-right">Порядок</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <motion.tr
                key={row.id}
                layout="position"
                transition={{layout: {duration: 0.22, ease: "easeOut"}}}
                data-queue-row-id={queueMode ? row.id : undefined}
                className={`border-t border-slate-100 transition-all duration-200 ease-out ${row.history_match_type !== "none" ? "bg-rose-50" : ""} ${
                  draggedRowId === row.id ? "relative z-10 bg-slate-100 shadow-sm ring-2 ring-inset ring-blue-200" : ""
                }`}
              >
                <td className="p-3">
                  {editingId === row.id ? (
                    <input
                      className="h-9 w-full min-w-48 rounded border border-slate-200 px-2"
                      value={editDraft.company}
                      onChange={(event) => onEditDraftChange?.({...editDraft, company: event.target.value})}
                    />
                  ) : (
                    row.company
                  )}
                </td>
                <td className="p-3">
                  {editingId === row.id ? (
                    <input
                      className="h-9 w-full min-w-56 rounded border border-slate-200 px-2"
                      value={editDraft.email}
                      onChange={(event) => onEditDraftChange?.({...editDraft, email: event.target.value})}
                    />
                  ) : (
                    row.email
                  )}
                </td>
                <td className="p-3">{translateRecipientStatus(row.status, queueMode ? index : undefined, row.queue_position)}</td>
                <td className="p-3">{row.variant ?? 1}</td>
                <td className="p-3 text-xs text-slate-600">
                  {row.history_match_type === "none" ? "—" : (
                    <span title={row.history_match_detail ?? undefined}>{translateHistoryMatch(row.history_match_type)}</span>
                  )}
                </td>
                <td className="whitespace-nowrap p-3">{formatRuDateTime(row.updated_at)}</td>
                <td className="p-3">{row.last_error ?? ""}</td>
                {editable || removable ? (
                  <td className="p-3">
                    {editingId === row.id ? (
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded bg-teal-600 px-3 py-1.5 text-xs font-medium text-white" type="button" onClick={() => onSaveEdit?.(row)}>
                          Сохранить
                        </button>
                        <button className="rounded border border-slate-300 px-3 py-1.5 text-xs" type="button" onClick={onCancelEdit}>
                          Отмена
                        </button>
                      </div>
                    ) : editable ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          aria-label={`Редактировать: ${row.company}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                          title="Редактировать"
                          type="button"
                          onClick={() => onStartEdit?.(row)}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <label className="flex items-center rounded border border-slate-300 px-2 py-1 text-xs">
                          <span className="sr-only">Вариант письма</span>
                          <select
                            className="bg-transparent"
                            value={row.variant ?? 1}
                            onChange={(event) => onVariantChange?.(row, Number(event.target.value) as TemplateVariantNumber)}
                          >
                            {templateVariants.map((variant) => (
                              <option key={variant} value={variant}>
                                {variant}
                              </option>
                            ))}
                          </select>
                        </label>
                        {!queueMode ? (
                          <button
                            aria-label={`Удалить: ${row.company}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                            title="Удалить"
                            type="button"
                            onClick={() => onExclude?.(row)}
                          >
                            <X size={17} aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <button
                        aria-label={`Удалить запись: ${row.company}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                        title="Удалить"
                        type="button"
                        onClick={() => onRemove?.(row)}
                      >
                        <X size={17} aria-hidden="true" />
                      </button>
                    )}
                  </td>
                ) : null}
                {queueMode ? (
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        aria-label={`Удалить: ${row.company}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                        title="Удалить"
                        type="button"
                        onClick={() => onExclude?.(row)}
                      >
                        <X size={17} aria-hidden="true" />
                      </button>
                      <button
                        aria-label={`Отправить сейчас: ${row.company}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 bg-white text-base text-slate-600 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-wait disabled:opacity-60"
                        disabled={sendingNowId === row.id}
                        type="button"
                        title="Отправить письмо сейчас"
                        onClick={() => onSendNow?.(row)}
                      >
                        {sendingNowId === row.id ? "…" : <Send size={17} aria-hidden="true" />}
                      </button>
                    <button
                      aria-label={`Перетащить: отправка ${row.queue_position ?? index + 1}`}
                      className="inline-flex h-9 w-9 touch-none cursor-grab select-none items-center justify-center rounded border border-slate-300 bg-white text-lg leading-none text-slate-500 transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 active:cursor-grabbing"
                      onPointerDown={(event) => onPointerDragStart?.(row, event)}
                      type="button"
                      title="Перетащить выше или ниже в очереди"
                    >
                      <GripVertical size={17} aria-hidden="true" />
                    </button>
                    </div>
                  </td>
                ) : null}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function renderClientTemplate(value: string, recipient: {company: string; email: string}, stockListText: string) {
  const company = recipient.company.trim() || "коллеги";
  const stockList = stockListText.trim() || "[список позиций будет подставлен при отправке]";
  return value
    .replace(/{{\s*Компания\s*}}/gi, company)
    .replace(/{{\s*company\s*}}/gi, company)
    .replace(/{{\s*email\s*}}/gi, recipient.email)
    .replace(/{{\s*СписокПозиции\s*}}/gi, stockList)
    .replace(/{{\s*СписокПозиций\s*}}/gi, stockList)
    .replace(/{{\s*stockList\s*}}/gi, stockList);
}

function UploadSummary({summary}: {summary: Record<string, unknown>}) {
  const fields = ([
    ["Всего строк", summary.rows_total],
    ["Импортировано", summary.imported ?? summary.rows_imported],
    ["Пропущено", summary.skipped ?? summary.rows_skipped],
    ["Дубликаты", summary.skipped_duplicates],
    ["Некорректные email", summary.skipped_invalid],
    ["Совпадения с историей", summary.history_matches],
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

function translateRecipientStatus(status: string, queueIndex?: number, queuePosition?: number | null) {
  if (status === "queued" && queueIndex !== undefined) {
    return `Отправка ${queuePosition ?? queueIndex + 1}`;
  }
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

function translateHistoryMatch(type: string) {
  const labels: Record<string, string> = {
    full: "Полное",
    email: "По email",
    company: "По компании"
  };
  return labels[type] ?? "—";
}

function translateEventType(type: string) {
  const labels: Record<string, string> = {
    started: "Запущено",
    paused: "Поставлено на паузу",
    settings_changed: "Настройки изменены",
    upload: "Загрузка базы",
    import: "Импорт",
    recipient_created: "Получатель добавлен",
    recipient_reused: "Получатель возвращён в очередь",
    recipient_variant_changed: "Вариант письма изменён",
    recipient_deleted: "Запись удалена",
    mail_settings_changed: "Настройки почты изменены",
    queue_reordered: "Порядок очереди изменён",
    auto_paused_queue_empty: "Автопауза: очередь закончилась",
    send_success: "Письмо отправлено",
    send_error: "Ошибка отправки",
    send_now_success: "Письмо отправлено вручную",
    send_now_error: "Ошибка ручной отправки",
    sent_append_failed: "Не удалось сохранить в Отправленные",
    do_not_contact: "Помечено как не контактировать",
    requeue: "Возвращено в очередь"
  };
  return labels[type] ?? type;
}

function formatEventDetail(event: EventRow) {
  try {
    const detail = JSON.parse(event.detail_json) as Record<string, unknown>;
    const company = typeof detail.company === "string" ? detail.company : "";
    const email = typeof detail.email === "string" ? detail.email : "";
    const error = typeof detail.error === "string" ? detail.error : "";
    const sentAppendStatus = typeof detail.sent_append_status === "string" ? detail.sent_append_status : "";
    const rowsCount = typeof detail.rows_count === "number" ? `${detail.rows_count} строк` : "";
    return [company, email, sentAppendStatus ? `Sent: ${sentAppendStatus}` : "", rowsCount, error].filter(Boolean).join(" — ");
  } catch {
    return "";
  }
}

async function parseJsonResponse(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {error: "invalid_server_response"};
  }
}

function translateError(error: unknown, context?: Record<string, unknown>) {
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
    template_required: "Заполните тему и текст письма",
    template_forbidden_phrases: `В шаблоне есть запрещённые формулировки: ${Array.isArray(context?.forbidden) ? context.forbidden.join(", ") : ""}`,
    company_required: "Укажите компанию",
    email_invalid: "Укажите корректный e-mail",
    recipient_email_duplicate: "Такой e-mail уже есть в активной очереди",
    recipient_blocked_status: "Этот e-mail находится в списке отписок или возвратов",
    recipient_create_failed: "Не удалось добавить получателя",
    recipient_fields_required: "Укажите компанию и e-mail",
    recipient_update_failed: "Не удалось обновить получателя",
    recipient_not_found: "Получатель не найден",
    recipient_delete_failed: "Не удалось удалить запись",
    recipient_delete_sent_only: "Удалять вручную можно только записи из отправленных",
    send_now_queued_only: "Отправить сейчас можно только получателя из очереди",
    send_now_failed: `Не удалось отправить письмо сейчас${typeof context?.message === "string" ? `: ${context.message}` : ""}`,
    mail_settings_required: "Заполните обязательные поля почты",
    mail_settings_localhost_forbidden: "Нельзя использовать локальный SMTP/IMAP сервер",
    mail_settings_save_failed: "Не удалось сохранить настройки почты",
    queue_order_required: "Не передан порядок очереди",
    queue_reorder_failed: "Не удалось изменить порядок очереди",
    outreach_send_disabled: "Отправка выключена в server env",
    smtp_or_imap_env_missing: "Не настроены SMTP/IMAP переменные на сервере",
    queue_empty: "Очередь пуста",
    min_delay_invalid: "Укажите корректную минимальную паузу",
    min_delay_too_low: "Минимальная пауза слишком маленькая",
    max_delay_invalid: "Укажите корректную максимальную паузу",
    max_delay_must_exceed_min_delay: "Максимальная пауза не должна быть меньше минимальной",
    daily_limit_invalid: "Укажите корректный дневной лимит",
    daily_limit_too_high: "Дневной лимит слишком высокий. Максимум — 100"
  };
  return labels[error] ?? error;
}
