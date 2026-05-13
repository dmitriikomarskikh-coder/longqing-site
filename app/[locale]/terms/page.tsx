import type {Metadata} from "next";
import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";

const content = {
  ru: {
    title: "Условия использования",
    description:
      "Условия использования сайта LONGQING для B2B-запросов на промышленное оборудование и запчасти.",
    updated: "Дата обновления: 13 мая 2026 г.",
    sections: [
      [
        "Назначение сайта",
        "Сайт longqingtrade.com предназначен для B2B-информирования о возможностях подбора и поставки промышленного оборудования, компонентов и запчастей. Материалы сайта адресованы компаниям и их представителям."
      ],
      [
        "Не публичная оферта",
        "Информация на сайте, включая описания товаров, наличие, сроки и формулировки о поставке, носит справочный характер и не является публичной офертой. Коммерческие условия подтверждаются индивидуально после обработки запроса."
      ],
      [
        "Запросы и коммерческие предложения",
        "Для подготовки предложения пользователь направляет артикулы, спецификацию оборудования, серийные номера, описание задачи и контактные данные. Наличие, цена, сроки поставки и совместимость подтверждаются менеджером после проверки."
      ],
      [
        "Товарные знаки и статус LONGQING",
        "LONGQING не является официальным дилером, дистрибьютором или авторизованным сервисным центром MTU, Cummins, Siemens и других производителей, упомянутых на сайте. Названия и товарные знаки используются только для идентификации оборудования и запчастей."
      ],
      [
        "Точность информации",
        "Мы стремимся поддерживать актуальность материалов, но технические описания, применимость, остатки, сроки и условия поставки необходимо подтверждать перед заказом по артикулу, серийному номеру двигателя или спецификации оборудования."
      ],
      [
        "Ответственность пользователя",
        "Пользователь отвечает за корректность предоставленных данных, артикулов, спецификаций и контактной информации. Ошибочные или неполные данные могут повлиять на подбор и сроки подготовки предложения."
      ],
      [
        "Персональные данные",
        "Отправляя форму заявки, пользователь соглашается с обработкой персональных данных в соответствии с Политикой конфиденциальности, включая возможную трансграничную передачу данных в Китайскую Народную Республику для обработки B2B-запроса."
      ],
      [
        "Контакты",
        "По вопросам использования сайта, обработки заявок и персональных данных можно обращаться на office@longqingtrade.com."
      ]
    ]
  },
  en: {
    title: "Terms of Use",
    description:
      "Terms of use for the LONGQING website for B2B requests for industrial equipment and spare parts.",
    updated: "Updated: May 13, 2026",
    sections: [
      [
        "Website purpose",
        "longqingtrade.com provides B2B information about sourcing and supply capabilities for industrial equipment, components, and spare parts. The materials are intended for companies and their representatives."
      ],
      [
        "No public offer",
        "Website information, including product descriptions, availability, lead times, and supply wording, is for reference and is not a public offer. Commercial terms are confirmed individually after request processing."
      ],
      [
        "Requests and proposals",
        "To prepare a proposal, the user provides part numbers, equipment specifications, serial numbers, task details, and contact data. Availability, price, lead time, and compatibility are confirmed by a manager after review."
      ],
      [
        "Trademarks and LONGQING status",
        "LONGQING is not an official dealer, distributor, or authorized service center of MTU, Cummins, Siemens, or other manufacturers mentioned on the website. Names and trademarks are used only to identify equipment and spare parts."
      ],
      [
        "Information accuracy",
        "We aim to keep materials current, but technical descriptions, applicability, stock, lead times, and supply terms must be confirmed before order by part number, engine serial number, or equipment specification."
      ],
      [
        "User responsibility",
        "The user is responsible for the accuracy of provided data, part numbers, specifications, and contact information. Incorrect or incomplete data may affect selection and proposal timing."
      ],
      [
        "Personal data",
        "By submitting a request form, the user agrees to personal data processing under the Privacy Policy, including possible cross-border transfer to the People’s Republic of China for B2B request processing."
      ],
      [
        "Contacts",
        "Questions about website use, request processing, and personal data can be sent to office@longqingtrade.com."
      ]
    ]
  },
  zh: {
    title: "使用条款",
    description: "LONGQING 网站关于工业设备和备件 B2B 请求的使用条款。",
    updated: "更新日期：2026年5月13日",
    sections: [
      [
        "网站用途",
        "longqingtrade.com 用于介绍工业设备、部件和备件选型及供应能力，面向企业及其代表提供 B2B 信息。"
      ],
      [
        "非公开报价",
        "网站上的信息，包括产品描述、库存、交期和供应说明，仅供参考，不构成公开报价。商业条件将在处理请求后单独确认。"
      ],
      [
        "请求和报价",
        "为准备报价，用户需提供零件号、设备规格、序列号、任务描述和联系方式。库存、价格、交期和兼容性由经理审核后确认。"
      ],
      [
        "商标和 LONGQING 状态",
        "LONGQING 并非 MTU、Cummins、Siemens 或网站所提及其他制造商的官方经销商、分销商或授权服务中心。名称和商标仅用于识别设备和备件。"
      ],
      [
        "信息准确性",
        "我们努力保持资料更新，但技术描述、适用性、库存、交期和供应条件需在下单前根据零件号、发动机序列号或设备规格确认。"
      ],
      [
        "用户责任",
        "用户应对所提供数据、零件号、规格和联系信息的准确性负责。错误或不完整的数据可能影响选型和报价时间。"
      ],
      [
        "个人数据",
        "提交询价表即表示用户同意按照隐私政策处理个人数据，包括为处理 B2B 请求可能将数据跨境传输至中华人民共和国。"
      ],
      [
        "联系方式",
        "关于网站使用、请求处理和个人数据的问题，可发送至 office@longqingtrade.com。"
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
      canonical: `/${locale}/terms`,
      languages: {
        ru: "/ru/terms",
        zh: "/zh/terms",
        en: "/en/terms",
        "x-default": "/en/terms"
      }
    }
  };
}

export default async function TermsPage({
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
        <h1 className="text-5xl font-semibold">{text.title}</h1>
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
