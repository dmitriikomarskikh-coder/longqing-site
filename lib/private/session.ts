import crypto from "node:crypto";
import {cookies} from "next/headers";
import {sessionCookieName, sessionSecret} from "@/lib/private/config";

type SessionPayload = {
  sub: "owner";
  exp: number;
};

function base64url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function sign(value: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function createSessionToken() {
  const payload: SessionPayload = {
    sub: "owner",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) {
    return false;
  }
  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) {
    return false;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    return payload.sub === "owner" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function hasPrivateSession() {
  const store = await cookies();
  return verifySessionToken(store.get(sessionCookieName())?.value);
}

export async function setPrivateSession() {
  const store = await cookies();
  store.set(sessionCookieName(), createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60
  });
}

export async function clearPrivateSession() {
  const store = await cookies();
  store.set(sessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export async function requirePrivateSession() {
  if (!(await hasPrivateSession())) {
    return Response.json({error: "authentication_required"}, {status: 401});
  }
  return null;
}
