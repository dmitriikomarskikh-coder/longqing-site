import {guardPrivateApi, privateHeaders} from "@/lib/private/api";
import {getSettings, saveSettings} from "@/lib/outreach/db";

export async function GET() {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  return Response.json(getSettings(), {headers: privateHeaders()});
}

export async function POST(request: Request) {
  const guard = await guardPrivateApi();
  if (guard) return guard;
  const body = await request.json();
  const minDelay = Number(body.min_delay_minutes);
  const maxDelay = Number(body.max_delay_minutes);
  const dailyLimit = Number(body.daily_limit);
  const allowedDays = Array.isArray(body.allowed_days)
    ? body.allowed_days.map((day: unknown) => Number(day)).filter((day: number) => Number.isInteger(day) && day >= 0 && day <= 6)
    : undefined;
  if (!Number.isFinite(minDelay)) {
    return Response.json({error: "min_delay_invalid"}, {status: 400, headers: privateHeaders()});
  }
  if (!Number.isFinite(maxDelay)) {
    return Response.json({error: "max_delay_invalid"}, {status: 400, headers: privateHeaders()});
  }
  if (Number.isFinite(minDelay) && minDelay < 3) {
    return Response.json({error: "min_delay_too_low"}, {status: 400, headers: privateHeaders()});
  }
  if (Number.isFinite(maxDelay) && Number.isFinite(minDelay) && maxDelay < minDelay) {
    return Response.json({error: "max_delay_must_exceed_min_delay"}, {status: 400, headers: privateHeaders()});
  }
  if (!Number.isFinite(dailyLimit) || dailyLimit < 1) {
    return Response.json({error: "daily_limit_invalid"}, {status: 400, headers: privateHeaders()});
  }
  if (Number.isFinite(dailyLimit) && dailyLimit > 100) {
    return Response.json({error: "daily_limit_too_high"}, {status: 400, headers: privateHeaders()});
  }
  return Response.json(
    saveSettings({
      allowed_days: allowedDays,
      allowed_time_start: typeof body.allowed_time_start === "string" ? body.allowed_time_start : undefined,
      allowed_time_end: typeof body.allowed_time_end === "string" ? body.allowed_time_end : undefined,
      min_delay_minutes: minDelay,
      max_delay_minutes: maxDelay,
      daily_limit: dailyLimit
    }),
    {headers: privateHeaders()}
  );
}
