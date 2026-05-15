import {privateEnabled} from "@/lib/private/config";
import {privateHeaders} from "@/lib/private/api";
import {setPrivateSession} from "@/lib/private/session";
import {verifyLogin} from "@/lib/private/webauthn";

export async function POST(request: Request) {
  if (!privateEnabled()) {
    return Response.json({error: "private_disabled"}, {status: 404, headers: privateHeaders()});
  }
  const body = await request.json();
  await verifyLogin(body.response, request.headers.get("origin") ?? undefined);
  await setPrivateSession();
  return Response.json({ok: true}, {headers: privateHeaders()});
}
