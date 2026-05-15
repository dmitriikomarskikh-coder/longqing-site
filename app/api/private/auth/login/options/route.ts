import {hasRegisteredCredential} from "@/lib/private/auth-store";
import {privateEnabled} from "@/lib/private/config";
import {privateHeaders} from "@/lib/private/api";
import {loginOptions} from "@/lib/private/webauthn";

export async function POST() {
  if (!privateEnabled()) {
    return Response.json({error: "private_disabled"}, {status: 404, headers: privateHeaders()});
  }
  if (!hasRegisteredCredential()) {
    return Response.json({error: "passkey_not_registered"}, {status: 409, headers: privateHeaders()});
  }
  return Response.json(await loginOptions(), {headers: privateHeaders()});
}
