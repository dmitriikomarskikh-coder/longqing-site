import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {getOutreachDb, getOutreachTemplate} from "@/lib/outreach/db";
import {renderOutreachEmail, type OutreachTemplateVariant} from "@/lib/outreach/template";

function normalizeVariant(value: unknown): OutreachTemplateVariant {
  const parsed = Number(value);
  return parsed === 1 || parsed === 2 || parsed === 3 ? parsed : 1;
}

export async function GET(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const url = new URL(request.url);
  const recipientId = Number(url.searchParams.get("recipientId"));
  const variant = normalizeVariant(url.searchParams.get("variant"));
  const row = Number.isFinite(recipientId)
    ? (getOutreachDb().prepare("select company, email from outreach_recipients where id = ?").get(recipientId) as
        | {company: string; email: string}
        | undefined)
    : undefined;
  return Response.json(
    renderOutreachEmail(row ?? {company: "Тестовая компания", email: "example@example.ru"}, getOutreachTemplate(variant)),
    {headers: privateHeaders()}
  );
}
