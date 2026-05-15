import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {importRecipientsFile} from "@/lib/outreach/import";

export async function POST(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({error: "file_required"}, {status: 400, headers: privateHeaders()});
  }
  return Response.json(await importRecipientsFile(file), {headers: privateHeaders()});
}
