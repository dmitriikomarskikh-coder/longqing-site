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
      .catch(() => setMessage("Failed to load auth status"));
  }, [setupToken]);

  async function register() {
    setMessage("Starting passkey registration...");
    const options = await fetch("/api/private/auth/register/options", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({setupToken})
    }).then((response) => response.json());
    if (options.error) {
      setMessage(options.error);
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
      setMessage(result.error ?? "Registration failed");
    }
  }

  async function login() {
    setMessage("Starting passkey login...");
    const options = await fetch("/api/private/auth/login/options", {method: "POST"}).then((response) =>
      response.json()
    );
    if (options.error) {
      setMessage(options.error);
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
      setMessage(result.error ?? "Login failed");
    }
  }

  if (!status) {
    return <p className="text-sm text-neutral-500">Loading...</p>;
  }

  if (!status.enabled) {
    return <p className="text-sm text-neutral-600">Private cabinet is disabled.</p>;
  }

  return (
    <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">LONGQING private access</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Passkey access is required for the outreach dashboard.
        </p>
      </div>
      {status.registered ? (
        <button className="btn-primary h-11 px-5 text-sm" type="button" onClick={login}>
          Войти по passkey
        </button>
      ) : status.setupAllowed ? (
        <button className="btn-primary h-11 px-5 text-sm" type="button" onClick={register}>
          Зарегистрировать owner passkey
        </button>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Passkey is not registered. Add the server-only setup token as `?setup=...` to enroll the owner passkey.
        </p>
      )}
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
