import {hasRegisteredCredential, setupTokenMatches} from "@/lib/private/auth-store";
import {privateEnabled} from "@/lib/private/config";
import {hasPrivateSession} from "@/lib/private/session";
import {privateHeaders} from "@/lib/private/api";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const setupToken = searchParams.get("setupToken") ?? searchParams.get("setup");
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
