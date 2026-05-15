import {privateHeaders} from "@/lib/private/api";
import {clearPrivateSession} from "@/lib/private/session";

export async function POST() {
  await clearPrivateSession();
  return Response.json({ok: true}, {headers: privateHeaders()});
}
