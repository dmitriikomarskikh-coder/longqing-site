import path from "node:path";

const projectRoot = process.cwd();

export function privateEnabled() {
  return process.env.LONGQING_PRIVATE_ENABLED === "true";
}

export function privateAuthDataDir() {
  return path.resolve(projectRoot, process.env.LONGQING_AUTH_DATA_DIR ?? ".data/private-auth");
}

export function outreachDbPath() {
  return path.resolve(projectRoot, process.env.LONGQING_OUTREACH_DB_PATH ?? ".data/outreach/outreach.sqlite");
}

export function authRpId() {
  return process.env.LONGQING_AUTH_RP_ID ?? "longqingtrade.com";
}

export function authOrigin() {
  return process.env.LONGQING_AUTH_ORIGIN ?? "https://longqingtrade.com";
}

export function allowedOrigins() {
  const configured = authOrigin();
  return new Set([configured, "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]);
}

export function sessionCookieName() {
  return "longqing_private_session";
}

export function sessionSecret() {
  return (
    process.env.LONGQING_SESSION_SECRET ||
    process.env.LONGQING_ADMIN_SETUP_TOKEN ||
    "longqing-private-local-dev-session-secret"
  );
}
