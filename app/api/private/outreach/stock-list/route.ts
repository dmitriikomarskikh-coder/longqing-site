import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {getOutreachStockListText, getOutreachStockRows, saveOutreachStockListText} from "@/lib/outreach/db";

export async function GET() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  return Response.json(
    {text: getOutreachStockListText(), rows_count: getOutreachStockRows().length},
    {headers: privateHeaders()}
  );
}

export async function POST(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const body = (await request.json()) as {text?: string};
  try {
    return Response.json(saveOutreachStockListText(body.text ?? ""), {headers: privateHeaders()});
  } catch (error) {
    return Response.json(
      {error: error instanceof Error ? error.message : "stock_list_save_failed"},
      {status: 400, headers: privateHeaders()}
    );
  }
}
