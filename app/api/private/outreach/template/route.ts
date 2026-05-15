import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {outreachFirstParagraphs, outreachSubjectVariants, renderOutreachEmail} from "@/lib/outreach/template";

export async function GET() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const preview = renderOutreachEmail({company: "Example company", email: "example@example.ru"});
  return Response.json({subjects: outreachSubjectVariants, firstParagraphs: outreachFirstParagraphs, preview}, {headers: privateHeaders()});
}
