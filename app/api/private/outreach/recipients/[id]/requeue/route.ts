import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {addEvent, getOutreachDb} from "@/lib/outreach/db";

export async function POST(_: Request, {params}: {params: Promise<{id: string}>}) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const {id} = await params;
  getOutreachDb()
    .prepare("update outreach_recipients set status = 'queued', last_error = null, updated_at = ? where id = ?")
    .run(new Date().toISOString(), Number(id));
  addEvent("requeue", Number(id), null, {});
  return Response.json({ok: true}, {headers: privateHeaders()});
}
