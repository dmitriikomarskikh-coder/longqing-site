import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {getOutreachDb} from "@/lib/outreach/db";
import {renderOutreachEmail} from "@/lib/outreach/template";

export async function GET(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const recipientId = Number(new URL(request.url).searchParams.get("recipientId"));
  const row = Number.isFinite(recipientId)
    ? (getOutreachDb().prepare("select company, email from outreach_recipients where id = ?").get(recipientId) as
        | {company: string; email: string}
        | undefined)
    : undefined;
  return Response.json(
    renderOutreachEmail(row ?? {company: "Example company", email: "example@example.ru"}),
    {headers: privateHeaders()}
  );
}
