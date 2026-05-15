import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {saveSettings} from "@/lib/outreach/db";

export async function POST() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  return Response.json(saveSettings({enabled: false}), {headers: privateHeaders()});
}
