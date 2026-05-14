import type {Metadata} from "next";
import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";

const content = {
  ru: {
    title: "Политика конфиденциальности",
    description:
      "Политика обработки персональных данных LONGQING для B2B-запросов на промышленное оборудование и запчасти.",
    updated: "Дата редакции: 13 мая 2026 г.",
    sections: [
      [
        "Оператор данных",
        "Оператором данных является Shandong Longqing International Trading Co., Ltd. Компания обрабатывает обращения представителей организаций по вопросам подбора и поставки промышленного оборудования, запчастей и совместимых компонентов."
      ],
      [
        "Какие данные обрабатываются",
        "Через формы на Сайте пользователь может передать имя, телефон, e-mail, компанию, текст обращения, артикулы, сведения об оборудовании, спецификации, файлы и иную информацию, необходимую для рассмотрения B2B-запроса."
      ],
      [
        "Цели обработки",
        "Данные используются для приема и рассмотрения заявки, связи с заявителем, уточнения технической задачи, проверки наличия и совместимости, подготовки коммерческого предложения, ведения деловой переписки и внутреннего учета обращений."
      ],
      [
        "Передача данных сотрудникам Компании",
        "Первичная обработка заявок с Сайта осуществляется с использованием инфраструктуры Сайта. Данные могут передаваться сотрудникам Компании в КНР исключительно для рассмотрения запроса, подготовки коммерческого предложения и деловой коммуникации."
      ],
      [
        "Передача третьим лицам",
        "При необходимости данные могут быть переданы логистическим, техническим или закупочным контрагентам только в объеме, необходимом для обработки запроса, проверки наличия, совместимости и условий поставки."
      ],
      [
        "Срок хранения",
        "Данные хранятся 3 года с момента последнего обращения, если более длительный срок не требуется применимым законодательством, договором или защитой прав Компании."
      ],
      [
        "Cookies",
        "Сайт использует технические cookies, необходимые для корректной работы страниц, форм и базовых функций. Аналитические системы в коде проекта не обнаружены; новые трекеры не добавляются без отдельного согласования."
      ],
      [
        "Права пользователя",
        "Пользователь может запросить уточнение, удаление или ограничение обработки своих данных, направив обращение на office@longqingtrade.com."
      ],
      [
        "Статус Компании",
        "LONGQING работает как независимый поставщик. Бренды и артикулы на Сайте используются только для идентификации оборудования, запчастей и совместимых компонентов."
      ]
    ]
  },
  en: {
    title: "Privacy Policy",
    description:
      "LONGQING personal data processing policy for B2B requests for industrial equipment and spare parts.",
    updated: "Revision date: May 13, 2026",
    sections: [
      [
        "Data controller",
        "The data controller is Shandong Longqing International Trading Co., Ltd. The company processes requests from organization representatives regarding selection and supply of industrial equipment, spare parts, and compatible components."
      ],
      [
        "Data processed",
        "Through website forms, a user may provide name, phone, e-mail, company, request text, part numbers, equipment details, specifications, files, and other information required to review a B2B request."
      ],
      [
        "Processing purposes",
        "Data is used to receive and review requests, contact the requester, clarify the technical task, check stock status and compatibility, prepare commercial proposals, maintain business communication, and keep internal request records."
      ],
      [
        "Transfer to company staff",
        "Initial processing of website requests is performed using the website infrastructure. Data may be shared with company staff in China only to review the request, prepare a commercial proposal, and conduct business communication."
      ],
      [
        "Third parties",
        "Where needed, data may be shared with logistics, technical, or sourcing contractors only to the extent required to process the request, check stock status, compatibility, and supply terms."
      ],
      [
        "Retention period",
        "Data is stored for 3 years from the last contact, unless a longer period is required by applicable law, contract, or protection of the company’s rights."
      ],
      [
        "Cookies",
        "The website uses technical cookies required for correct page, form, and basic function operation. No analytics systems were found in the project code; no new trackers are added without separate approval."
      ],
      [
        "User rights",
        "The user may request correction, deletion, or restriction of processing by contacting office@longqingtrade.com."
      ],
      [
        "Company status",
        "LONGQING acts as an independent supplier. Brand names and part numbers on the website are used only to identify equipment, spare parts, and compatible components."
      ]
    ]
  },
  zh: {
    title: "隐私政策",
    description: "LONGQING 关于工业设备和备件 B2B 询价的个人数据处理政策。",
    updated: "修订日期：2026年5月13日",
    sections: [
      [
        "数据处理方",
        "数据处理方为 Shandong Longqing International Trading Co., Ltd. 公司处理企业代表就工业设备、备件和兼容部件选型及供应提交的请求。"
      ],
      [
        "处理的数据",
        "用户可通过网站表单提交姓名、电话、电子邮件、公司、请求内容、零件号、设备信息、规格、文件以及处理 B2B 请求所需的其他信息。"
      ],
      [
        "处理目的",
        "数据用于接收和审查请求、联系申请人、明确技术任务、核实库存状态和兼容性、准备商业报价、开展商务沟通以及进行内部请求记录。"
      ],
      [
        "向公司员工传递",
        "网站请求的初步处理使用网站基础设施完成。数据可仅为审查请求、准备商业报价和商务沟通之目的传递给公司在中国的员工。"
      ],
      [
        "第三方",
        "必要时，数据可在处理请求、核实库存状态、兼容性和供应条件所需范围内提供给物流、技术或采购合作方。"
      ],
      [
        "保存期限",
        "数据自最后一次联系之日起保存 3 年，除非适用法律、合同或维护公司权利需要更长期限。"
      ],
      [
        "Cookies",
        "网站使用页面、表单和基础功能正常运行所需的技术 cookies。项目代码中未发现分析系统；未经另行确认不会添加新的跟踪工具。"
      ],
      [
        "用户权利",
        "用户可通过 office@longqingtrade.com 请求更正、删除或限制处理其数据。"
      ],
      [
        "公司状态",
        "LONGQING 作为独立供应商开展业务。网站上的品牌名称和零件号仅用于识别设备、备件和兼容部件。"
      ]
    ]
  }
} satisfies Record<Locale, {title: string; description: string; updated: string; sections: string[][]}>;

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const text = content[locale];

  return {
    title: `${text.title} | LONGQING`,
    description: text.description,
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: {
        ru: "/ru/privacy",
        zh: "/zh/privacy",
        en: "/en/privacy",
        "x-default": "/en/privacy"
      }
    }
  };
}

export default async function PrivacyPage({
  params
}: {
  params: Promise<{locale: Locale}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const text = content[locale];

  return (
    <main className="bg-light px-5 pb-20 pt-32 text-dark">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold md:text-5xl">{text.title}</h1>
        <p className="mt-4 text-sm text-neutral-500">{text.updated}</p>
        <p className="mt-8 text-base leading-8 text-neutral-700">{text.description}</p>
        <div className="mt-10 grid gap-8">
          {text.sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="mt-3 text-base leading-8 text-neutral-700">{body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
