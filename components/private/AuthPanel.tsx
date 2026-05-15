"use client";

import {startAuthentication, startRegistration} from "@simplewebauthn/browser";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";

type AuthStatus = {
  enabled: boolean;
  authenticated: boolean;
  registered: boolean;
  setupAllowed: boolean;
};

export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupToken = searchParams.get("setup") ?? "";
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/private/auth/status?setupToken=${encodeURIComponent(setupToken)}`)
      .then((response) => response.json())
      .then(setStatus)
      .catch(() => setMessage("Не удалось загрузить статус авторизации"));
  }, [setupToken]);

  async function register() {
    setMessage("Запускаем регистрацию ключа доступа...");
    const options = await fetch("/api/private/auth/register/options", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({setupToken})
    }).then((response) => response.json());
    if (options.error) {
      setMessage(translateAuthError(options.error));
      return;
    }
    const response = await startRegistration(options);
    const result = await fetch("/api/private/auth/register/verify", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({setupToken, response})
    }).then((item) => item.json());
    if (result.ok) {
      router.push("/en/private/outreach");
    } else {
      setMessage(translateAuthError(result.error) ?? "Не удалось зарегистрировать ключ доступа");
    }
  }

  async function login() {
    setMessage("Запускаем вход по ключу доступа...");
    const options = await fetch("/api/private/auth/login/options", {method: "POST"}).then((response) =>
      response.json()
    );
    if (options.error) {
      setMessage(translateAuthError(options.error));
      return;
    }
    const response = await startAuthentication(options);
    const result = await fetch("/api/private/auth/login/verify", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({response})
    }).then((item) => item.json());
    if (result.ok) {
      router.push("/en/private/outreach");
    } else {
      setMessage(translateAuthError(result.error) ?? "Не удалось войти по ключу доступа");
    }
  }

  if (!status) {
    return <p className="text-sm text-neutral-500">Загрузка...</p>;
  }

  if (!status.enabled) {
    return <p className="text-sm text-neutral-600">Закрытый кабинет отключён.</p>;
  }

  return (
    <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Закрытый доступ LONGQING</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Для входа в панель рассылки требуется ключ доступа.
        </p>
      </div>
      {status.registered ? (
        <button className="btn-primary h-11 px-5 text-sm" type="button" onClick={login}>
          Войти по ключу доступа
        </button>
      ) : status.setupAllowed ? (
        <button className="btn-primary h-11 px-5 text-sm" type="button" onClick={register}>
          Зарегистрировать ключ доступа владельца
        </button>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Ключ доступа ещё не зарегистрирован. Добавьте серверный токен настройки в URL как `?setup=...`, чтобы зарегистрировать ключ доступа владельца.
        </p>
      )}
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}

function translateAuthError(error: unknown) {
  if (typeof error !== "string" || !error) {
    return "Операция не выполнена";
  }
  const labels: Record<string, string> = {
    private_disabled: "Закрытый кабинет отключён",
    passkey_not_registered: "Ключ доступа ещё не зарегистрирован",
    setup_not_allowed: "Регистрация по этому токену настройки недоступна"
  };
  return labels[error] ?? error;
}
