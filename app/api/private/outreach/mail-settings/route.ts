import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {publicOutreachMailSettings, saveOutreachMailSettings, type OutreachMailProvider} from "@/lib/outreach/db";

function normalizeProvider(value: unknown): OutreachMailProvider {
  return value === "timeweb" || value === "vk-workspace" || value === "custom" ? value : "custom";
}

function normalizePort(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : 0;
}

export async function GET() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  return Response.json(publicOutreachMailSettings(), {headers: privateHeaders()});
}

export async function POST(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const body = (await request.json()) as Record<string, unknown>;
  try {
    return Response.json(
      saveOutreachMailSettings({
        provider: normalizeProvider(body.provider),
        smtp_host: String(body.smtp_host ?? ""),
        smtp_port: normalizePort(body.smtp_port),
        smtp_secure: body.smtp_secure !== false,
        smtp_user: String(body.smtp_user ?? ""),
        smtp_password: typeof body.smtp_password === "string" ? body.smtp_password : "",
        smtp_from: String(body.smtp_from ?? ""),
        smtp_reply_to: String(body.smtp_reply_to ?? ""),
        imap_host: String(body.imap_host ?? ""),
        imap_port: normalizePort(body.imap_port),
        imap_secure: body.imap_secure !== false,
        imap_user: String(body.imap_user ?? ""),
        imap_password: typeof body.imap_password === "string" ? body.imap_password : ""
      }),
      {headers: privateHeaders()}
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "mail_settings_save_failed";
    return Response.json({error: code}, {status: 400, headers: privateHeaders()});
  }
}
