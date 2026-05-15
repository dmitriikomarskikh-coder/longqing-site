import crypto from "node:crypto";

export type OutreachTemplateRecipient = {
  company: string;
  email: string;
  contact_name?: string;
};

export type OutreachEmailContent = {
  subject: string;
  text: string;
  html: string;
  templateVariant: string;
};

export const outreachSubjectVariants = [
  "MTU parts: наличие на складе в Китае",
  "MTU parts: поставка в Россию под запрос",
  "Запчасти для MTU engines: складские позиции в Китае",
  "MTU service parts: позиции для ремонта и обслуживания",
  "MTU spare parts: наличие и поставка в РФ"
];

export const outreachFirstParagraphs = [
  "Пишу по запчастям MTU. Сейчас есть складское наличие в Китае по ряду позиций для ремонта и обслуживания дизельных двигателей / силовых установок MTU: поршневая группа, гильзы, вкладыши, элементы охлаждения, турбокомпрессоры, трубки высокого давления и другие позиции.",
  "Обращаюсь к вам как к компании, которая может работать с поставками, ремонтом или эксплуатацией оборудования MTU. Сейчас доступны позиции MTU на складе в Китае для подготовки к отгрузке и дальнейшей поставки.",
  "По MTU сейчас можно оперативно обработать запрос по складским позициям в Китае: ремонтные детали, элементы охлаждения и наддува, трубки высокого давления и другие позиции для двигателей и установок."
];

export const outreachStockRows = [
  ["EX00008371", "Поршень / Piston", "16"],
  ["5240114210", "Гильза цилиндра / Cylinder liner", "32"],
  ["5550110259", "Уплотнения гильзы", "64"],
  ["EXT0110100193", "Турбокомпрессор 12V", "4"],
  ["EXT0210100167", "Турбокомпрессор 16V", "4"],
  ["EX52811400063", "Охладитель наддувочного воздуха", "1"]
];

export const forbiddenOutreachPhrases = [
  "официальный дилер",
  "авторизованный партнёр",
  "сертифицированный поставщик",
  "гарантированно оригинал",
  "OEM",
  "original",
  "genuine",
  "100% оригинал"
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hashSeed(recipient: Pick<OutreachTemplateRecipient, "email" | "company">) {
  const hex = crypto
    .createHash("sha256")
    .update(`${recipient.email.toLowerCase()}|${recipient.company.toLowerCase()}`)
    .digest("hex")
    .slice(0, 8);
  return Number.parseInt(hex, 16);
}

export function isValidOutreachEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function scanForbiddenOutreachPhrases(value: string) {
  const normalized = value.toLowerCase();
  return forbiddenOutreachPhrases.filter((phrase) => normalized.includes(phrase.toLowerCase()));
}

export function renderOutreachEmail(recipient: OutreachTemplateRecipient): OutreachEmailContent {
  const seed = hashSeed(recipient);
  const subjectIndex = seed % outreachSubjectVariants.length;
  const paragraphIndex = seed % outreachFirstParagraphs.length;
  const helloLine = recipient.contact_name ? `Здравствуйте, ${recipient.contact_name}.` : "Здравствуйте.";
  const stockTableText = [
    "Part number | Наименование | Кол-во",
    ...outreachStockRows.map((row) => row.join(" | "))
  ].join("\n");
  const text = [
    helloLine,
    "",
    outreachFirstParagraphs[paragraphIndex],
    "",
    "Основное:",
    "- позиции находятся на складе в Китае и готовы к подготовке/отгрузке;",
    "- возможна продажа со склада в Китае;",
    "- возможна поставка в Россию под ключ с логистикой и таможенным оформлением;",
    "- варианты оплаты обсуждаются индивидуально;",
    "- цены — по запросу, в зависимости от объёма, условий поставки и формата оплаты.",
    "",
    "Ключевые позиции по наличию:",
    "",
    stockTableText,
    "",
    "Если у вас есть актуальная потребность по MTU, пришлите интересующие номера деталей — подготовим предложение.",
    "",
    "С уважением,",
    "LONGQING TRADE",
    "office@longqingtrade.com",
    "+7 905 074 97 77",
    "https://longqingtrade.com",
    "",
    "Если вопрос неактуален, напишите, пожалуйста, «неактуально» — больше не будем обращаться по этой теме."
  ].join("\n");

  const html = [
    `<p>${escapeHtml(helloLine)}</p>`,
    `<p>${escapeHtml(outreachFirstParagraphs[paragraphIndex])}</p>`,
    "<p>Основное:</p>",
    "<ul>",
    "<li>позиции находятся на складе в Китае и готовы к подготовке/отгрузке;</li>",
    "<li>возможна продажа со склада в Китае;</li>",
    "<li>возможна поставка в Россию под ключ с логистикой и таможенным оформлением;</li>",
    "<li>варианты оплаты обсуждаются индивидуально;</li>",
    "<li>цены — по запросу, в зависимости от объёма, условий поставки и формата оплаты.</li>",
    "</ul>",
    "<p>Ключевые позиции по наличию:</p>",
    '<table border="1" cellpadding="6" cellspacing="0">',
    "<tr><th>Part number</th><th>Наименование</th><th>Кол-во</th></tr>",
    ...outreachStockRows.map(
      ([partNumber, name, quantity]) =>
        `<tr><td>${escapeHtml(partNumber)}</td><td>${escapeHtml(name)}</td><td>${escapeHtml(quantity)}</td></tr>`
    ),
    "</table>",
    "<p>Если у вас есть актуальная потребность по MTU, пришлите интересующие номера деталей — подготовим предложение.</p>",
    '<p>С уважением,<br>LONGQING TRADE<br>office@longqingtrade.com<br>+7 905 074 97 77<br><a href="https://longqingtrade.com">https://longqingtrade.com</a></p>',
    "<p>Если вопрос неактуален, напишите, пожалуйста, «неактуально» — больше не будем обращаться по этой теме.</p>"
  ].join("\n");

  return {
    subject: outreachSubjectVariants[subjectIndex],
    text,
    html,
    templateVariant: `subject-${subjectIndex + 1}/intro-${paragraphIndex + 1}`
  };
}
