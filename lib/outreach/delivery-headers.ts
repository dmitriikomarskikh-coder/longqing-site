export type DeliveryHeaderIdentity = {
  smtpUser: string;
  smtpFrom: string;
  smtpReplyTo: string;
  imapUser: string;
};

export type DeliveryHeaderInput = {
  mode?: string;
  listUnsubscribe?: string;
  identity: DeliveryHeaderIdentity;
  warn?: (message: string) => void;
};

export type DeliveryHeaderResult = {
  headers: Record<string, string>;
  rawHeaderLines: string[];
  mode: "personal" | "bulk";
  warning: string | null;
};

const blockedListHeaders = ["Precedence", "List-Unsubscribe", "List-ID", "List-Help", "List-Subscribe"];

export function normalizeDeliveryHeaderMode(value?: string): "personal" | "bulk" {
  return value?.trim().toLowerCase() === "bulk" ? "bulk" : "personal";
}

export function listManagedDeliveryHeaders() {
  return blockedListHeaders;
}

function emailFromAddress(value: string) {
  const match = value.match(/<([^<>@\s]+@[^<>@\s]+)>/) ?? value.match(/([^<>\s]+@[^<>\s]+)/);
  return match?.[1]?.toLowerCase() ?? "";
}

function domainFromEmail(value: string) {
  return value.split("@")[1]?.toLowerCase() ?? "";
}

function listUnsubscribeAddress(value: string) {
  const normalized = value.trim().replace(/^<|>$/g, "");
  if (!normalized.toLowerCase().startsWith("mailto:")) return "";
  return normalized.slice("mailto:".length).split("?")[0]?.toLowerCase() ?? "";
}

function alignedListUnsubscribe(value: string, identity: DeliveryHeaderIdentity) {
  const normalized = value.trim().replace(/^<|>$/g, "");
  const unsubscribeEmail = listUnsubscribeAddress(normalized);
  if (!unsubscribeEmail) return "";
  const allowedDomains = new Set(
    [identity.smtpUser, identity.smtpFrom, identity.smtpReplyTo, identity.imapUser]
      .map(emailFromAddress)
      .filter(Boolean)
      .map(domainFromEmail)
      .filter(Boolean)
  );
  return allowedDomains.has(domainFromEmail(unsubscribeEmail)) ? normalized : "";
}

function warn(input: DeliveryHeaderInput, message: string) {
  input.warn?.(`Email delivery headers skipped: ${message}`);
}

export function buildEmailDeliveryHeaders(input: DeliveryHeaderInput): DeliveryHeaderResult {
  const mode = normalizeDeliveryHeaderMode(input.mode);
  if (mode !== "bulk") {
    return {headers: {}, rawHeaderLines: [], mode, warning: null};
  }

  const configured = input.listUnsubscribe?.trim() ?? "";
  if (!configured) {
    const warning = "OUTREACH_HEADER_MODE=bulk but OUTREACH_LIST_UNSUBSCRIBE is not configured";
    warn(input, warning);
    return {headers: {}, rawHeaderLines: [], mode, warning};
  }

  const unsubscribe = alignedListUnsubscribe(configured, input.identity);
  if (!unsubscribe) {
    const warning = "OUTREACH_LIST_UNSUBSCRIBE is not a supported aligned mailto address";
    warn(input, warning);
    return {headers: {}, rawHeaderLines: [], mode, warning};
  }

  const headers = {
    "List-Unsubscribe": `<${unsubscribe}>`,
    Precedence: "bulk"
  };
  return {
    headers,
    rawHeaderLines: Object.entries(headers).map(([key, value]) => `${key}: ${value}`),
    mode,
    warning: null
  };
}
