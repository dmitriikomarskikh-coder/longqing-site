import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {addEvent, getOutreachDb, nextQueuePosition, normalizeQueuePositions} from "@/lib/outreach/db";

export async function POST(_: Request, {params}: {params: Promise<{id: string}>}) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const {id} = await params;
  const database = getOutreachDb();
  database
    .prepare("update outreach_recipients set status = 'queued', last_error = null, queue_position = ?, updated_at = ? where id = ?")
    .run(nextQueuePosition(database), new Date().toISOString(), Number(id));
  normalizeQueuePositions(database);
  addEvent("requeue", Number(id), null, {});
  return Response.json({ok: true}, {headers: privateHeaders()});
}
