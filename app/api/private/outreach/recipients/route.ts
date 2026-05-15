import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {listRecipients} from "@/lib/outreach/db";

export async function GET(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const status = new URL(request.url).searchParams.get("status") ?? undefined;
  return Response.json({recipients: listRecipients(status)}, {headers: privateHeaders()});
}
