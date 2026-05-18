import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {addEvent, getOutreachDb, normalizeQueuePositions, type RecipientRow} from "@/lib/outreach/db";
import {sendOutreachRecipient} from "@/lib/outreach/sender";

export async function POST(_: Request, {params}: {params: Promise<{id: string}>}) {
  const guard = await guardPrivateApi();
  if (guard) return guard;

  const {id} = await params;
  const recipientId = Number(id);
  if (!Number.isFinite(recipientId) || recipientId < 1) {
    return Response.json({error: "recipient_not_found"}, {status: 404, headers: privateHeaders()});
  }

  const database = getOutreachDb();
  const recipient = database.prepare("select * from outreach_recipients where id = ?").get(recipientId) as RecipientRow | undefined;
  if (!recipient) {
    return Response.json({error: "recipient_not_found"}, {status: 404, headers: privateHeaders()});
  }
  if (recipient.status !== "queued") {
    return Response.json({error: "send_now_queued_only"}, {status: 400, headers: privateHeaders()});
  }

  try {
    const {messageId, smtpResponse} = await sendOutreachRecipient(recipient);
    const now = new Date().toISOString();
    database
      .prepare("update outreach_recipients set status='sent', queue_position=null, last_sent_at=?, updated_at=?, last_error=null, smtp_response=? where id=?")
      .run(now, now, smtpResponse, recipient.id);
    normalizeQueuePositions(database);
    addEvent("send_now_success", recipient.id, messageId, {sent_append_status: "success"});
    return Response.json({ok: true, messageId}, {headers: privateHeaders()});
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 400) : "Send now failed";
    database
      .prepare("update outreach_recipients set status='error', queue_position=null, last_error=?, updated_at=? where id=?")
      .run(message, new Date().toISOString(), recipient.id);
    normalizeQueuePositions(database);
    addEvent("send_now_error", recipient.id, null, {error: message});
    return Response.json({error: "send_now_failed", message}, {status: 500, headers: privateHeaders()});
  }
}
