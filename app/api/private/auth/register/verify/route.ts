import {hasRegisteredCredential, setupTokenMatches} from "@/lib/private/auth-store";
import {privateEnabled} from "@/lib/private/config";
import {privateHeaders} from "@/lib/private/api";
import {setPrivateSession} from "@/lib/private/session";
import {verifyRegistration} from "@/lib/private/webauthn";

export async function POST(request: Request) {
  if (!privateEnabled()) {
    return Response.json({error: "private_disabled"}, {status: 404, headers: privateHeaders()});
  }
  const body = await request.json();
  if (hasRegisteredCredential() || !setupTokenMatches(body.setupToken)) {
    return Response.json({error: "setup_not_allowed"}, {status: 403, headers: privateHeaders()});
  }
  await verifyRegistration(body.response, request.headers.get("origin") ?? undefined);
  await setPrivateSession();
  return Response.json({ok: true}, {headers: privateHeaders()});
}
