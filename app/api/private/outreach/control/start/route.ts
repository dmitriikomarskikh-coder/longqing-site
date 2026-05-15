import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {dashboardStatus, saveSettings} from "@/lib/outreach/db";
import {hasOutreachSendCredentials, outreachEnv} from "@/lib/outreach/runtime-env";

export async function POST() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const status = dashboardStatus();
  if (outreachEnv("OUTREACH_SEND_ENABLED") !== "true") {
    return Response.json({error: "outreach_send_disabled"}, {status: 400, headers: privateHeaders()});
  }
  if (!hasOutreachSendCredentials()) {
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
