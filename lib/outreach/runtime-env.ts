import dotenv from "dotenv";

let loaded = false;

export function loadOutreachEnv() {
  if (loaded) {
    return;
  }
  dotenv.config({path: ".env.production", quiet: true});
  dotenv.config({path: ".env.outreach", quiet: true, override: true});
  loaded = true;
}

export function outreachEnv(name: string) {
  loadOutreachEnv();
  const value = process.env[name];
  if (value) {
    return value;
  }
  if (name === "SMTP_PASS") {
    return process.env.SMTP_PASSWORD ?? "";
  }
  if (name === "IMAP_HOST") {
    return process.env.IMAP_HOST || "imap.timeweb.ru";
  }
  if (name === "IMAP_PORT") {
    return process.env.IMAP_PORT || "993";
  }
  if (name === "IMAP_SECURE") {
    return process.env.IMAP_SECURE || "true";
  }
  if (name === "IMAP_USER") {
    return process.env.IMAP_USER || process.env.SMTP_USER || "";
  }
  if (name === "IMAP_PASS") {
    return process.env.IMAP_PASS || process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "";
  }
  return "";
}

export function hasOutreachSendCredentials() {
  return ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "IMAP_HOST", "IMAP_USER", "IMAP_PASS"].every((name) => Boolean(outreachEnv(name)));
}
