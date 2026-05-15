import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {dashboardStatus, enterUnlimitedMode, exitUnlimitedMode} from "@/lib/outreach/db";
import {hasOutreachSendCredentials, outreachEnv} from "@/lib/outreach/runtime-env";

export async function POST() {
  const guard = await guardPrivateApi();
  if (guard) return guard;

  const status = dashboardStatus();
  if (status.settings.unlimited_mode) {
    return Response.json(exitUnlimitedMode(), {headers: privateHeaders()});
  }
  if (outreachEnv("OUTREACH_SEND_ENABLED") !== "true") {
    return Response.json({error: "outreach_send_disabled"}, {status: 400, headers: privateHeaders()});
  }
  if (!hasOutreachSendCredentials()) {
    return Response.json({error: "smtp_or_imap_env_missing"}, {status: 400, headers: privateHeaders()});
  }
  if (status.queued <= 0) {
    return Response.json({error: "queue_empty"}, {status: 400, headers: privateHeaders()});
  }

  return Response.json(enterUnlimitedMode(), {headers: privateHeaders()});
}
