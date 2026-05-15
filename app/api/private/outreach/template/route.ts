import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {getOutreachTemplate, saveOutreachTemplate} from "@/lib/outreach/db";
import {renderOutreachEmail, scanForbiddenOutreachPhrases} from "@/lib/outreach/template";

export async function GET() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const template = getOutreachTemplate();
  const preview = renderOutreachEmail({company: "Тестовая компания", email: "example@example.ru"}, template);
  return Response.json({...template, preview}, {headers: privateHeaders()});
}

export async function POST(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const body = (await request.json()) as {subject?: string; body?: string};
  const template = {
    subject: body.subject?.trim() ?? "",
    body: body.body?.trim() ?? ""
  };
  if (!template.subject || !template.body) {
    return Response.json({error: "template_required"}, {status: 400, headers: privateHeaders()});
  }
  const forbidden = scanForbiddenOutreachPhrases(`${template.subject}\n${template.body}`);
  if (forbidden.length > 0) {
    return Response.json({error: "template_forbidden_phrases", forbidden}, {status: 400, headers: privateHeaders()});
  }
  const saved = saveOutreachTemplate(template);
  const preview = renderOutreachEmail({company: "Тестовая компания", email: "example@example.ru"}, saved);
  return Response.json({...saved, preview}, {headers: privateHeaders()});
}
