import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {reorderQueuedRecipients} from "@/lib/outreach/db";

export async function POST(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;

  const body = (await request.json()) as {ids?: unknown};
  if (!Array.isArray(body.ids)) {
    return Response.json({error: "queue_order_required"}, {status: 400, headers: privateHeaders()});
  }

  try {
    return Response.json({ok: true, recipients: reorderQueuedRecipients(body.ids as number[])}, {headers: privateHeaders()});
  } catch (error) {
    const code = error instanceof Error ? error.message : "queue_reorder_failed";
    return Response.json({error: code}, {status: 400, headers: privateHeaders()});
  }
}
