import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {updateRecipient} from "@/lib/outreach/db";
import {isValidOutreachEmail} from "@/lib/outreach/template";

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  const guard = await guardPrivateApi();
  if (guard) return guard;

  const {id} = await params;
  const recipientId = Number(id);
  const body = (await request.json()) as {company?: string; email?: string};
  const company = body.company?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";

  if (!Number.isFinite(recipientId) || recipientId < 1) {
    return Response.json({error: "recipient_not_found"}, {status: 404, headers: privateHeaders()});
  }
  if (!company) {
    return Response.json({error: "company_required"}, {status: 400, headers: privateHeaders()});
  }
  if (!isValidOutreachEmail(email)) {
    return Response.json({error: "email_invalid"}, {status: 400, headers: privateHeaders()});
  }

  try {
    return Response.json(updateRecipient(recipientId, {company, email}), {headers: privateHeaders()});
  } catch (error) {
    const code = error instanceof Error ? error.message : "recipient_update_failed";
    return Response.json({error: code}, {status: 400, headers: privateHeaders()});
  }
}
