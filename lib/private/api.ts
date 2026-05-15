import {privateEnabled} from "@/lib/private/config";
import {hasPrivateSession} from "@/lib/private/session";

export function privateHeaders() {
  return {
    "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet"
  };
}

export async function guardPrivateApi() {
  if (!(await hasPrivateSession())) {
    return Response.json({error: "authentication_required"}, {status: 401, headers: privateHeaders()});
  }
  if (!privateEnabled()) {
    return Response.json({error: "private_disabled"}, {status: 404, headers: privateHeaders()});
  }
  return null;
}
