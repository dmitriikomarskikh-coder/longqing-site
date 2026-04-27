import type {SubmissionPayload} from "./email";

export async function sendWeChat(payload: SubmissionPayload) {
  if (!process.env.WECHAT_WEBHOOK_URL) {
    return {channel: "wechat", skipped: true};
  }

  await fetch(process.env.WECHAT_WEBHOOK_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      msgtype: "text",
      text: {
        content: `New request: ${payload.name}, ${payload.phone}, ${payload.email}\n${payload.message}`
      }
    })
  });

  return {channel: "wechat", skipped: false};
}
