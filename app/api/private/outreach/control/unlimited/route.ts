import {guardPrivateApi, privateHeaders} from "@/lib/private/api";

export async function POST() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  return Response.json({error: "unlimited_mode_removed"}, {status: 410, headers: privateHeaders()});
}
