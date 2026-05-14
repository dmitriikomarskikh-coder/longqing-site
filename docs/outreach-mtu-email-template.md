# LONGQING MTU outreach email template

Use this template only through the outreach CLI. Do not send real customer mail during dry-run.

## Forbidden wording

Do not use these phrases in public email copy without separate manual approval:

- официальный дилер
- авторизованный партнёр
- сертифицированный поставщик
- гарантированно оригинал
- OEM
- original
- genuine
- 100% оригинал

LONGQING is positioned as an independent B2B coordination and supply contact. Do not write “у нас на складе”. Use: “позиции находятся на складе в Китае и готовы к подготовке/отгрузке”.

## Subject variants

1. MTU — складские позиции в Китае, готовность к отгрузке
2. Запчасти MTU в наличии: ремонтные позиции, охлаждение, наддув
3. MTU: складские запчасти для ремонта двигателей и установок
4. Наличие MTU со склада в Китае — поставка в РФ под ключ
5. Запрос по MTU: складские позиции и поставка в Россию

## First paragraph variants

Variant A:

> Пишу по запчастям MTU. Сейчас есть складское наличие в Китае по ряду позиций для ремонта и обслуживания дизельных двигателей / силовых установок MTU: поршневая группа, гильзы, вкладыши, уплотнения, элементы охлаждения, турбокомпрессоры, трубки высокого давления и другие позиции.

Variant B:

> Обращаюсь к вам как к компании, которая может работать с поставками, ремонтом или эксплуатацией оборудования MTU. Сейчас доступны позиции MTU на складе в Китае для подготовки к отгрузке и дальнейшей поставки.

Variant C:

> По MTU сейчас можно оперативно обработать запрос по складским позициям в Китае: ремонтные детали, элементы охлаждения и наддува, уплотнения, трубки высокого давления и другие позиции для двигателей и установок.

The CLI selects subject and paragraph variants deterministically by recipient email and company, so dry-run and send output match.

## Plain text

```text
Здравствуйте, {{greeting}}.

{{first_paragraph}}

Основное:
- позиции находятся на складе в Китае и готовы к подготовке/отгрузке;
- возможна продажа со склада в Китае;
- возможна поставка в Россию под ключ с логистикой и таможенным оформлением;
- варианты оплаты обсуждаются индивидуально;
- цены — по запросу, в зависимости от объёма, условий поставки и формата оплаты.

Ключевые позиции по наличию:

Part number | Наименование | Кол-во
EX00008371 | Поршень / Piston | 16
5240114210 | Гильза цилиндра / Cylinder liner | 32
5550110259 | Уплотнения гильзы | 64
EXT0110100193 | Турбокомпрессор 12V | 4
EXT0210100167 | Турбокомпрессор 16V | 4
EX52811400063 | Охладитель наддувочного воздуха | 1

Если у вас есть актуальная потребность по MTU, пришлите интересующие номера деталей — подготовим предложение.

С уважением,
LONGQING TRADE
office@longqingtrade.com
+7 905 074 97 77
https://longqingtrade.com

Если вопрос неактуален, напишите, пожалуйста, «неактуально» — больше не будем обращаться по этой теме.
```

## HTML

Use simple HTML only: `p`, `ul`, `table`, `a`. No banners, external images, tracking pixels, or short links.

```html
<p>Здравствуйте, {{greeting}}.</p>
<p>{{first_paragraph}}</p>
<p>Основное:</p>
<ul>
  <li>позиции находятся на складе в Китае и готовы к подготовке/отгрузке;</li>
  <li>возможна продажа со склада в Китае;</li>
  <li>возможна поставка в Россию под ключ с логистикой и таможенным оформлением;</li>
  <li>варианты оплаты обсуждаются индивидуально;</li>
  <li>цены — по запросу, в зависимости от объёма, условий поставки и формата оплаты.</li>
</ul>
<p>Ключевые позиции по наличию:</p>
<table>
  <tr><th>Part number</th><th>Наименование</th><th>Кол-во</th></tr>
  <tr><td>EX00008371</td><td>Поршень / Piston</td><td>16</td></tr>
  <tr><td>5240114210</td><td>Гильза цилиндра / Cylinder liner</td><td>32</td></tr>
  <tr><td>5550110259</td><td>Уплотнения гильзы</td><td>64</td></tr>
  <tr><td>EXT0110100193</td><td>Турбокомпрессор 12V</td><td>4</td></tr>
  <tr><td>EXT0210100167</td><td>Турбокомпрессор 16V</td><td>4</td></tr>
  <tr><td>EX52811400063</td><td>Охладитель наддувочного воздуха</td><td>1</td></tr>
</table>
<p>Если у вас есть актуальная потребность по MTU, пришлите интересующие номера деталей — подготовим предложение.</p>
<p>С уважением,<br>LONGQING TRADE<br>office@longqingtrade.com<br>+7 905 074 97 77<br><a href="https://longqingtrade.com">https://longqingtrade.com</a></p>
<p>Если вопрос неактуален, напишите, пожалуйста, «неактуально» — больше не будем обращаться по этой теме.</p>
```

## Stock table note

The stock table in the CLI is a safe short placeholder. Before real sending, replace it only with checked current positions. Do not include private columns such as `source_urls`, `research_notes`, `confidence`, `publish_status`, `internal`, `cost`, `margin`, or `supplier_private_notes`.
