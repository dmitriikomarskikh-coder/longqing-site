import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {importRecipientsFile, OutreachImportError} from "@/lib/outreach/import";

export async function POST(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({error: "file_required"}, {status: 400, headers: privateHeaders()});
    }
    return Response.json(await importRecipientsFile(file), {headers: privateHeaders()});
  } catch (error) {
    const code = error instanceof OutreachImportError ? error.code : "upload_failed";
    console.error("Outreach upload failed", {
      code,
      message: error instanceof Error ? error.message : "Upload failed"
    });
    return Response.json({error: code}, {status: 400, headers: privateHeaders()});
  }
}
