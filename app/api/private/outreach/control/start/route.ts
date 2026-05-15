import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {dashboardStatus, saveSettings} from "@/lib/outreach/db";

export async function POST() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const status = dashboardStatus();
  if (!process.env.SMTP_PASS || !process.env.IMAP_PASS) {
    return Response.json({error: "smtp_or_imap_env_missing"}, {status: 400, headers: privateHeaders()});
  }
  if (!status.settings.copy_approved) {
    return Response.json({error: "copy_not_approved"}, {status: 400, headers: privateHeaders()});
  }
  if (status.queued <= 0) {
    return Response.json({error: "queue_empty"}, {status: 400, headers: privateHeaders()});
  }
  return Response.json(saveSettings({enabled: true}), {headers: privateHeaders()});
}
