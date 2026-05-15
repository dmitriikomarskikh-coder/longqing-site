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

export type OutreachStoredTemplate = {
  subject: string;
  body: string;
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

export const defaultOutreachTemplate: OutreachStoredTemplate = {
  subject: "Для {{Компания}} — запчасти MTU в наличии на складе в Китае",
  body: [
    "Здравствуйте, {{Компания}}.",
    "",
    "Предлагаем запчасти MTU в наличии на складе в Китае.",
    "",
    "Возможны разные варианты работы:",
    "• продажа внутри Китая;",
    "• доставка в Россию;",
    "• логистика и таможенное оформление под ключ;",
    "• условия оплаты обсуждаются индивидуально.",
    "",
    "В наличии есть позиции для ремонта и обслуживания двигателей / силовых установок MTU: поршни, гильзы, вкладыши, уплотнения, элементы охлаждения, турбокомпрессоры, трубки высокого давления и другие детали.",
    "",
    "Список позиций:",
    "",
    "{{СписокПозиции}}",
    "",
    "Если какие-то позиции актуальны, пришлите нужные номера деталей и количество — подготовим предложение по цене, срокам и варианту поставки.",
    "",
    "С уважением,",
    "Комарских Дмитрий",
    "+7 961 866 17 00",
    "LONGQING TRADE",
    "office@longqingtrade.com",
    "https://longqingtrade.com",
    "",
    "Если вопрос неактуален, напишите, пожалуйста, «неактуально» — больше не будем обращаться по этой теме."
  ].join("\n")
};

const defaultTemplateStockRows = [
  ["EX00008371", "Поршень / Piston", "16"],
  ["5240114210", "Гильза цилиндра / Cylinder liner", "32"],
  ["5550110259", "Уплотнения гильзы", "64"],
  ["5240384110", "Вкладыш шатунный верх 0-0", "16"],
  ["X00043218", "Вкладыш шатунный низ 0-0", "16"],
  ["5240384210", "Вкладыш шатунный верх 0-1", "8"],
  ["X00043219", "Вкладыш шатунный низ 0-1", "8"],
  ["X59320300052", "Термостаты ГК", "16"],
  ["5242030075", "Термостаты ХК", "8"],
  ["EX52620200193", "Насос ОЖ ГК", "1"],
  ["EX54720300141", "Насос ОЖ ХК", "1"],
  ["EXT0110100193", "Турбокомпрессор 12V", "4"],
  ["EXT0210100167", "Турбокомпрессор 16V", "4"],
  ["X52636200030", "Компрессор воздушный", "2"],
  ["23540850", "Блок управления ТНВД", "4"],
  ["E0000352500/87", "Гаситель", "1"],
  ["5240980281", "Рукав ТКР", "12"],
  ["XP52799100608", "Хомут рукава ТКР", "24"],
  ["23540449", "Трубка высокого давления А", "1"],
  ["23540110", "Трубка высокого давления Б", "1"],
  ["5240160321", "Прокладки клапанной крышки", "100"],
  ["700429085002", "Кольцо уплотнительное", "40"],
  ["700429058002", "Кольца водянные на переливы", "20"],
  ["5240111380", "Прокладки боковых лючков", "15"],
  ["X52404200052", "Кольцо газового стыка", "32"],
  ["5240110159", "Кольцо нагаросьемное", "32"],
  ["0001800015", "Клапан редукционный", "3"],
  ["700429180000", "Кольцо уплотнительное на гаситель", "15"],
  ["X00017505", "Топливный фильтр блока управления", "10"],
  ["5249970245", "Кольца уплотнительные маслянных охладителей", "48"],
  ["5240320705", "Колесо зубчатое", "2"],
  ["EX52811400063", "Охладитель наддувочного воздуха", "1"],
  ["5241801819", "Тубка маслоподачи ТКР", "8"],
  ["X52404200037", "Проклдака", "50"],
  ["X52414100132", "Прокладка выхлопная", "50"],
  ["0002034480", "Манжета термостата", "22"],
  ["5245400097", "Клапан включения гидромуфты", "2"]
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

function companyValue(recipient: OutreachTemplateRecipient) {
  return recipient.company.trim() || "коллеги";
}

function defaultStockTableText() {
  return [
    "Part number | Наименование | Кол-во",
    ...defaultTemplateStockRows.map((row) => row.join(" | "))
  ].join("\n");
}

function defaultStockTableHtml() {
  return [
    '<table border="1" cellpadding="6" cellspacing="0">',
    "<tr><th>Part number</th><th>Наименование</th><th>Кол-во</th></tr>",
    ...defaultTemplateStockRows.map(
      ([partNumber, name, quantity]) =>
        `<tr><td>${escapeHtml(partNumber)}</td><td>${escapeHtml(name)}</td><td>${escapeHtml(quantity)}</td></tr>`
    ),
    "</table>"
  ].join("\n");
}

export function renderOutreachTemplateText(template: OutreachStoredTemplate, recipient: OutreachTemplateRecipient) {
  const replacements: Array<[RegExp, string]> = [
    [/{{\s*Компания\s*}}/gi, companyValue(recipient)],
    [/{{\s*company\s*}}/gi, companyValue(recipient)],
    [/{{\s*email\s*}}/gi, recipient.email],
    [/{{\s*СписокПозиции\s*}}/gi, defaultStockTableText()],
    [/{{\s*stockList\s*}}/gi, defaultStockTableText()]
  ];
  return replacements.reduce(
    (current, [pattern, value]) => current.replace(pattern, value),
    template.body
  );
}

export function renderOutreachTemplateSubject(template: OutreachStoredTemplate, recipient: OutreachTemplateRecipient) {
  return template.subject
    .replace(/{{\s*Компания\s*}}/gi, companyValue(recipient))
    .replace(/{{\s*company\s*}}/gi, companyValue(recipient))
    .replace(/{{\s*email\s*}}/gi, recipient.email);
}

function textToHtml(value: string) {
  const escaped = escapeHtml(value)
    .replace(escapeHtml(defaultStockTableText()), defaultStockTableHtml())
    .replace(/\n/g, "<br>");
  return `<div>${escaped}</div>`;
}

export function isValidOutreachEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function scanForbiddenOutreachPhrases(value: string) {
  const normalized = value.toLowerCase();
  return forbiddenOutreachPhrases.filter((phrase) => normalized.includes(phrase.toLowerCase()));
}

export function renderOutreachEmail(
  recipient: OutreachTemplateRecipient,
  template?: OutreachStoredTemplate
): OutreachEmailContent {
  if (template) {
    const subject = renderOutreachTemplateSubject(template, recipient);
    const text = renderOutreachTemplateText(template, recipient);
    return {
      subject,
      text,
      html: textToHtml(text),
      templateVariant: "custom-template"
    };
  }

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
