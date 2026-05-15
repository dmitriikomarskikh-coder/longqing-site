import {hasRegisteredCredential, setupTokenMatches} from "@/lib/private/auth-store";
import {privateEnabled} from "@/lib/private/config";
import {privateHeaders} from "@/lib/private/api";
import {registrationOptions} from "@/lib/private/webauthn";

export async function POST(request: Request) {
  if (!privateEnabled()) {
    return Response.json({error: "private_disabled"}, {status: 404, headers: privateHeaders()});
  }
  const {setupToken} = await request.json();
  if (hasRegisteredCredential() || !setupTokenMatches(setupToken)) {
    return Response.json({error: "setup_not_allowed"}, {status: 403, headers: privateHeaders()});
  }
  return Response.json(await registrationOptions(), {headers: privateHeaders()});
}
