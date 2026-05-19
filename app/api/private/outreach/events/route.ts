import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {recentEvents} from "@/lib/outreach/db";

export async function GET(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const url = new URL(request.url);
  const limit = url.searchParams.get("all") === "1" ? 1000 : 50;
  return Response.json({events: recentEvents(limit), limited: limit === 50}, {headers: privateHeaders()});
}
