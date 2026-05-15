import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {exitUnlimitedMode, getSettings, saveSettings} from "@/lib/outreach/db";

export async function POST() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  if (getSettings().unlimited_mode) {
    return Response.json(exitUnlimitedMode(), {headers: privateHeaders()});
  }
  return Response.json(saveSettings({enabled: false}), {headers: privateHeaders()});
}
