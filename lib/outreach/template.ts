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

export type OutreachTemplateVariant = 1 | 2 | 3;
export type OutreachStockRow = [string, string, string, string];

export type OutreachStoredTemplate = {
  subject: string;
  body: string;
};

export type OutreachTemplateSet = Record<OutreachTemplateVariant, OutreachStoredTemplate>;

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

export const outreachStockRows: OutreachStockRow[] = [
  ["EX00008371", "Piston", "Поршень", "16"],
  ["5240114210", "Cylinder liner", "Гильза цилиндра", "32"],
  ["5550110259", "Cylinder liner seals", "Уплотнения гильзы", "64"],
  ["EXT0110100193", "Turbocharger 12V", "Турбокомпрессор 12V", "4"],
  ["EXT0210100167", "Turbocharger 16V", "Турбокомпрессор 16V", "4"],
  ["EX52811400063", "Charge air cooler", "Охладитель наддувочного воздуха", "1"]
];

export const defaultOutreachTemplates: OutreachTemplateSet = {
  1: {
    subject: "Для {{Компания}} — запчасти MTU в наличии на складе в Китае",
    body: [
    "Здравствуйте.",
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
    "{{СписокПозиции}}",
    "",
    "Если какие-то позиции актуальны, пришлите нужные номера деталей и количество — подготовим предложение по цене, срокам и варианту поставки.",
    "",
    "С уважением,",
    "Комарских Дмитрий",
    "+7 961 866 17 00",
    "LONGQING TRADE",
    "office@longqingtrade.com",
    "https://longqingtrade.com"
  ].join("\n")
  },
  2: {
    subject: "Для {{Компания}} — запчасти MTU со склада в Китае",
    body: [
      "Здравствуйте.",
      "",
      "У нас на складе в Китае есть запчасти MTU в наличии.",
      "",
      "Форматы сотрудничества:",
      "• продажа внутри Китая;",
      "• доставка в Россию;",
      "• логистика и растаможка под ключ;",
      "• оплата — индивидуально.",
      "",
      "В наличии — позиции для ремонта и обслуживания двигателей и силовых установок MTU: поршни, гильзы, вкладыши, уплотнения, охлаждение, турбокомпрессоры, трубки высокого давления и другие детали.",
      "",
      "Список позиций:",
      "{{СписокПозиций}}",
      "",
      "Если что-то из перечня актуально — пришлите номера и количество, подготовим предложение по цене, срокам и поставке.",
      "",
      "С уважением,",
      "Комарских Дмитрий",
      "+7 961 866 17 00",
      "LONGQING TRADE",
      "office@longqingtrade.com",
      "https://longqingtrade.com"
    ].join("\n")
  },
  3: {
    subject: "Для {{Компания}} — наличие запчастей MTU в Китае",
    body: [
      "Здравствуйте.",
      "",
      "Есть в наличии запчасти MTU на складе в Китае.",
      "",
      "Возможные схемы работы:",
      "• продажа внутри Китая;",
      "• доставка в Россию;",
      "• логистика и таможенное оформление под ключ;",
      "• оплата обсуждается индивидуально.",
      "",
      "На складе — позиции для ремонта и обслуживания двигателей и силовых установок MTU: поршни, гильзы, вкладыши, уплотнения, элементы охлаждения, турбокомпрессоры, трубки высокого давления и прочие детали.",
      "",
      "Список позиций:",
      "{{СписокПозиций}}",
      "",
      "Если какие-то номера актуальны — пришлите детали и количество, посчитаем цену, сроки и вариант поставки.",
      "",
      "С уважением,",
      "Комарских Дмитрий",
      "+7 961 866 17 00",
      "LONGQING TRADE",
      "office@longqingtrade.com",
      "https://longqingtrade.com"
    ].join("\n")
  }
};

export const defaultOutreachTemplate = defaultOutreachTemplates[1];

const defaultTemplateStockRows: OutreachStockRow[] = [
  ["EX00008371", "Piston", "Поршень", "16"],
  ["5240114210", "Cylinder liner", "Гильза цилиндра", "32"],
  ["5550110259", "Cylinder liner seals", "Уплотнения гильзы", "64"],
  ["5240384110", "Upper connecting rod bearing 0-0", "Вкладыш шатунный верх 0-0", "16"],
  ["X00043218", "Lower connecting rod bearing 0-0", "Вкладыш шатунный низ 0-0", "16"],
  ["5240384210", "Upper connecting rod bearing 0-1", "Вкладыш шатунный верх 0-1", "8"],
  ["X00043219", "Lower connecting rod bearing 0-1", "Вкладыш шатунный низ 0-1", "8"],
  ["X59320300052", "HT circuit thermostats", "Термостаты ГК", "16"],
  ["5242030075", "LT circuit thermostats", "Термостаты ХК", "8"],
  ["EX52620200193", "HT coolant pump", "Насос ОЖ ГК", "1"],
  ["EX54720300141", "LT coolant pump", "Насос ОЖ ХК", "1"],
  ["EXT0110100193", "Turbocharger 12V", "Турбокомпрессор 12V", "4"],
  ["EXT0210100167", "Turbocharger 16V", "Турбокомпрессор 16V", "4"],
  ["X52636200030", "Air compressor", "Компрессор воздушный", "2"],
  ["23540850", "Fuel pump control unit", "Блок управления ТНВД", "4"],
  ["E0000352500/87", "Damper", "Гаситель", "1"],
  ["5240980281", "Turbocharger hose", "Рукав ТКР", "12"],
  ["XP52799100608", "Turbocharger hose clamp", "Хомут рукава ТКР", "24"],
  ["23540449", "High pressure pipe A", "Трубка высокого давления А", "1"],
  ["23540110", "High pressure pipe B", "Трубка высокого давления Б", "1"],
  ["5240160321", "Valve cover gasket", "Прокладки клапанной крышки", "100"],
  ["700429085002", "Sealing ring", "Кольцо уплотнительное", "40"],
  ["700429058002", "Water transfer sealing rings", "Кольца водяные на переливы", "20"],
  ["5240111380", "Side cover gaskets", "Прокладки боковых лючков", "15"],
  ["X52404200052", "Gas joint ring", "Кольцо газового стыка", "32"],
  ["5240110159", "Carbon scraper ring", "Кольцо нагаросъёмное", "32"],
  ["0001800015", "Pressure reducing valve", "Клапан редукционный", "3"],
  ["700429180000", "Damper sealing ring", "Кольцо уплотнительное на гаситель", "15"],
  ["X00017505", "Control unit fuel filter", "Топливный фильтр блока управления", "10"],
  ["5249970245", "Oil cooler sealing rings", "Кольца уплотнительные масляных охладителей", "48"],
  ["5240320705", "Gear wheel", "Колесо зубчатое", "2"],
  ["EX52811400063", "Charge air cooler", "Охладитель наддувочного воздуха", "1"],
  ["5241801819", "Turbocharger oil supply pipe", "Трубка маслоподачи ТКР", "8"],
  ["X52404200037", "Gasket", "Прокладка", "50"],
  ["X52414100132", "Exhaust gasket", "Прокладка выхлопная", "50"],
  ["0002034480", "Thermostat collar", "Манжета термостата", "22"],
  ["5245400097", "Hydraulic coupling activation valve", "Клапан включения гидромуфты", "2"]
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

function normalizeStockRows(rows: OutreachStockRow[]) {
  const normalized = rows
    .map((row) => row.map((cell) => String(cell ?? "").trim()) as OutreachStockRow)
    .filter(([partNumber, nameEn, nameRu, quantity]) => partNumber || nameEn || nameRu || quantity);
  return normalized.length > 0 ? normalized : defaultTemplateStockRows;
}

export function defaultStockTableText(rows: OutreachStockRow[] = defaultTemplateStockRows) {
  const normalizedRows = normalizeStockRows(rows);
  return [
    "Номер | Name | Наименование | Кол-во",
    ...normalizedRows.map(([partNumber, nameEn, nameRu, quantity]) => [partNumber, nameEn, nameRu, quantity].join(" | "))
  ].join("\n");
}

export function parseStockTableText(value: string): OutreachStockRow[] {
  const rows = value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line, index) => !(index === 0 && /^номер\s*\|/i.test(line)))
    .map((line) => {
      const cells = line.split("|").map((cell) => cell.trim());
      if (cells.length >= 4) {
        return [cells[0], cells[1], cells[2], cells.slice(3).join(" | ")] as OutreachStockRow;
      }
      if (cells.length === 3) {
        return [cells[0], cells[1], "", cells[2]] as OutreachStockRow;
      }
      return null;
    })
    .filter((row): row is OutreachStockRow => Boolean(row && row[0] && row[3]));
  return normalizeStockRows(rows);
}

function defaultStockTableHtml(rows: OutreachStockRow[] = defaultTemplateStockRows) {
  const normalizedRows = normalizeStockRows(rows);
  return [
    '<table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;border-color:#999;margin:8px 0 12px 0;">',
    '<thead><tr style="background:#f0f0f0;"><th align="left">Номер</th><th align="left">Name</th><th align="left">Наименование</th><th align="right">Кол-во</th></tr></thead>',
    "<tbody>",
    ...normalizedRows.map(
      ([partNumber, nameEn, nameRu, quantity]) =>
        `<tr><td>${escapeHtml(partNumber)}</td><td>${escapeHtml(nameEn)}</td><td>${escapeHtml(nameRu)}</td><td align="right">${escapeHtml(quantity)}</td></tr>`
    ),
    "</tbody>",
    "</table>"
  ].join("");
}

export function renderOutreachTemplateText(template: OutreachStoredTemplate, recipient: OutreachTemplateRecipient, stockRows: OutreachStockRow[] = defaultTemplateStockRows) {
  const stockTable = defaultStockTableText(stockRows);
  const replacements: Array<[RegExp, string]> = [
    [/{{\s*Компания\s*}}/gi, companyValue(recipient)],
    [/{{\s*company\s*}}/gi, companyValue(recipient)],
    [/{{\s*email\s*}}/gi, recipient.email],
    [/{{\s*СписокПозиции\s*}}/gi, stockTable],
    [/{{\s*СписокПозиций\s*}}/gi, stockTable],
    [/{{\s*stockList\s*}}/gi, stockTable]
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

function trimBlankLinesStart(value: string) {
  return value.replace(/^(?:[ \t]*\n)+/, "");
}

function trimBlankLinesEnd(value: string) {
  return value.replace(/(?:\n[ \t]*)+$/, "");
}

function plainTextToHtml(value: string) {
  const lines = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  return lines
    .map((line) => {
      if (!line.trim()) {
        return '<div style="height:8px;line-height:8px;font-size:8px;">&nbsp;</div>';
      }
      return `<div style="margin:0 0 6px 0;line-height:18px;font-size:14px;">${escapeHtml(line)}</div>`;
    })
    .join("");
}

function textToHtml(value: string, stockRows: OutreachStockRow[] = defaultTemplateStockRows) {
  const tableText = defaultStockTableText(stockRows);
  const tableIndex = value.indexOf(tableText);
  if (tableIndex === -1) {
    return `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;">${plainTextToHtml(value)}</div>`;
  }
  const before = trimBlankLinesEnd(value.slice(0, tableIndex));
  const after = trimBlankLinesStart(value.slice(tableIndex + tableText.length));
  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#111;">',
    plainTextToHtml(before),
    defaultStockTableHtml(stockRows),
    plainTextToHtml(after),
    "</div>"
  ].join("");
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
  template?: OutreachStoredTemplate,
  stockRows: OutreachStockRow[] = defaultTemplateStockRows
): OutreachEmailContent {
  const normalizedStockRows = normalizeStockRows(stockRows);
  if (template) {
    const subject = renderOutreachTemplateSubject(template, recipient);
    const text = renderOutreachTemplateText(template, recipient, normalizedStockRows);
    return {
      subject,
      text,
      html: textToHtml(text, normalizedStockRows),
      templateVariant: "custom-template"
    };
  }

  const seed = hashSeed(recipient);
  const subjectIndex = seed % outreachSubjectVariants.length;
  const paragraphIndex = seed % outreachFirstParagraphs.length;
  const helloLine = recipient.contact_name ? `Здравствуйте, ${recipient.contact_name}.` : "Здравствуйте.";
  const stockTableText = [
    "Номер | Name | Наименование | Кол-во",
    ...normalizedStockRows.map(([partNumber, nameEn, nameRu, quantity]) => [partNumber, nameEn, nameRu, quantity].join(" | "))
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
    "https://longqingtrade.com"
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
    "<tr><th>Номер</th><th>Name</th><th>Наименование</th><th>Кол-во</th></tr>",
    ...normalizedStockRows.map(
      ([partNumber, nameEn, nameRu, quantity]) =>
        `<tr><td>${escapeHtml(partNumber)}</td><td>${escapeHtml(nameEn)}</td><td>${escapeHtml(nameRu)}</td><td>${escapeHtml(quantity)}</td></tr>`
    ),
    "</table>",
    "<p>Если у вас есть актуальная потребность по MTU, пришлите интересующие номера деталей — подготовим предложение.</p>",
    '<p>С уважением,<br>LONGQING TRADE<br>office@longqingtrade.com<br>+7 905 074 97 77<br><a href="https://longqingtrade.com">https://longqingtrade.com</a></p>'
  ].join("\n");

  return {
    subject: outreachSubjectVariants[subjectIndex],
    text,
    html,
    templateVariant: `subject-${subjectIndex + 1}/intro-${paragraphIndex + 1}`
  };
}
