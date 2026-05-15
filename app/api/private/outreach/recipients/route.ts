import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {createRecipient, listRecipients} from "@/lib/outreach/db";
import {isValidOutreachEmail} from "@/lib/outreach/template";

export async function GET(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const status = new URL(request.url).searchParams.get("status") ?? undefined;
  return Response.json({recipients: listRecipients(status)}, {headers: privateHeaders()});
}

export async function POST(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;

  const body = (await request.json()) as {company?: string; email?: string};
  const company = body.company?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";

  if (!company) {
    return Response.json({error: "company_required"}, {status: 400, headers: privateHeaders()});
  }
  if (!isValidOutreachEmail(email)) {
    return Response.json({error: "email_invalid"}, {status: 400, headers: privateHeaders()});
  }

  try {
    return Response.json(createRecipient({company, email}), {headers: privateHeaders()});
  } catch (error) {
    const code = error instanceof Error ? error.message : "recipient_create_failed";
    return Response.json({error: code}, {status: 400, headers: privateHeaders()});
  }
}
