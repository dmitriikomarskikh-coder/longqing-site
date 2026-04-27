import type {SubmissionPayload} from "./email";

export async function sendDingTalk(payload: SubmissionPayload) {
  if (!process.env.DINGTALK_WEBHOOK_URL) {
    return {channel: "dingtalk", skipped: true};
  }

  await fetch(process.env.DINGTALK_WEBHOOK_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      msgtype: "text",
      text: {
        content: `New request: ${payload.name}, ${payload.phone}, ${payload.email}\n${payload.message}`
      }
    })
  });

  return {channel: "dingtalk", skipped: false};
}
