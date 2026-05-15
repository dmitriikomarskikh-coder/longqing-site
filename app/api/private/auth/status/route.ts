import {hasRegisteredCredential, setupTokenMatches} from "@/lib/private/auth-store";
import {privateEnabled} from "@/lib/private/config";
import {hasPrivateSession} from "@/lib/private/session";
import {privateHeaders} from "@/lib/private/api";

export async function GET(request: Request) {
  const setupToken = new URL(request.url).searchParams.get("setupToken");
  return Response.json(
    {
      enabled: privateEnabled(),
      authenticated: await hasPrivateSession(),
      registered: hasRegisteredCredential(),
      setupAllowed: !hasRegisteredCredential() && setupTokenMatches(setupToken)
    },
    {headers: privateHeaders()}
  );
}
