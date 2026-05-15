import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {dashboardStatus} from "@/lib/outreach/db";

export async function GET() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  return Response.json(dashboardStatus(), {headers: privateHeaders()});
}
