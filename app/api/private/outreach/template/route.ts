import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {getOutreachStockRows, getOutreachTemplates, saveOutreachTemplate} from "@/lib/outreach/db";
import {renderOutreachEmail, scanForbiddenOutreachPhrases, type OutreachTemplateVariant} from "@/lib/outreach/template";

function normalizeVariant(value: unknown): OutreachTemplateVariant {
  const parsed = Number(value);
  return parsed === 1 || parsed === 2 || parsed === 3 ? parsed : 1;
}

function withPreviews() {
  const templates = getOutreachTemplates();
  const stockRows = getOutreachStockRows();
  return {
    variants: {
      1: {...templates[1], preview: renderOutreachEmail({company: "Тестовая компания", email: "example@example.ru"}, templates[1], stockRows)},
      2: {...templates[2], preview: renderOutreachEmail({company: "Тестовая компания", email: "example@example.ru"}, templates[2], stockRows)},
      3: {...templates[3], preview: renderOutreachEmail({company: "Тестовая компания", email: "example@example.ru"}, templates[3], stockRows)}
    }
  };
}

export async function GET() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  return Response.json(withPreviews(), {headers: privateHeaders()});
}

export async function POST(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const body = (await request.json()) as {variant?: unknown; subject?: string; body?: string};
  const variant = normalizeVariant(body.variant);
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
  saveOutreachTemplate(variant, template);
  return Response.json(withPreviews(), {headers: privateHeaders()});
}
