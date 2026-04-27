import type {SubmissionPayload} from "./email";

export async function sendTelegram(payload: SubmissionPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chats = process.env.TELEGRAM_CHAT_IDS?.split(",").map((chat) => chat.trim());

  if (!token || !chats?.length) {
    return {channel: "telegram", skipped: true};
  }

  const text = [
    "*Новая заявка с longqingtrade.com*",
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
    `E-mail: ${payload.email}`,
    `Бренд: ${payload.brand ?? "-"}`,
    `Страница: ${payload.sourceUrl ?? "-"}`,
    "",
    payload.message
  ].join("\n");

  await Promise.all(
    chats.map((chatId) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown"
        })
      })
    )
  );

  return {channel: "telegram", skipped: false};
}
