import type {Metadata} from "next";
import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";

const content = {
  ru: {
    title: "Политика конфиденциальности",
    description:
      "Политика обработки персональных данных LONGQING для B2B-запросов на промышленное оборудование и запчасти.",
    updated: "Дата обновления: 13 мая 2026 г.",
    sections: [
      [
        "Кто обрабатывает данные",
        "Оператором данных является Shandong Longqing International Trading Co., Ltd. Компания принимает и обрабатывает B2B-запросы от организаций и представителей организаций из России, СНГ и других стран."
      ],
      [
        "Какие данные мы получаем",
        "Через форму заявки мы можем получать имя, e-mail, телефон, компанию, текст сообщения, сведения об оборудовании, артикулы, спецификации, файлы и техническую информацию, которую пользователь передаёт добровольно."
      ],
      [
        "Зачем используются данные",
        "Данные используются для обработки B2B-запросов, подбора оборудования и запчастей, подготовки коммерческого предложения, уточнения совместимости, связи с заявителем и ведения внутреннего учёта обращений."
      ],
      [
        "Трансграничная передача",
        "Так как LONGQING является китайской компанией, данные из заявки могут передаваться и обрабатываться на территории Китайской Народной Республики. Отправляя форму, пользователь подтверждает согласие на такую трансграничную передачу для обработки B2B-запроса."
      ],
      [
        "Хранение и защита",
        "Мы храним данные в объёме, необходимом для обработки запроса и последующей деловой переписки. Мы применяем организационные и технические меры, направленные на защиту данных от несанкционированного доступа."
      ],
      [
        "Передача третьим лицам",
        "При необходимости данные могут быть переданы логистическим, техническим или закупочным контрагентам только в объёме, необходимом для обработки запроса, проверки наличия, совместимости и условий поставки."
      ],
      [
        "Права пользователя",
        "Пользователь может запросить уточнение, удаление или ограничение обработки своих данных, направив обращение на office@longqingtrade.com."
      ],
      [
        "Статус компании",
        "LONGQING не является официальным дилером, дистрибьютором или авторизованным сервисным центром MTU, Cummins, Siemens и других производителей, упомянутых на сайте. Все товарные знаки принадлежат их правообладателям."
      ]
    ]
  },
  en: {
    title: "Privacy Policy",
    description:
      "LONGQING personal data processing policy for B2B requests for industrial equipment and spare parts.",
    updated: "Updated: May 13, 2026",
    sections: [
      [
        "Who processes data",
        "The data controller is Shandong Longqing International Trading Co., Ltd. The company receives and processes B2B requests from organizations and their representatives in Russia, the CIS, and other countries."
      ],
      [
        "Data we receive",
        "Through the request form, we may receive name, e-mail, phone, company, message text, equipment details, part numbers, specifications, files, and technical information voluntarily provided by the user."
      ],
      [
        "How data is used",
        "Data is used to process B2B requests, select equipment and spare parts, prepare commercial proposals, confirm compatibility, contact the requester, and keep internal request records."
      ],
      [
        "Cross-border transfer",
        "As LONGQING is a Chinese company, request data may be transferred to and processed in the People’s Republic of China. By submitting the form, the user consents to such cross-border transfer for B2B request processing."
      ],
      [
        "Storage and protection",
        "We store data to the extent required to process the request and related business correspondence. We apply organizational and technical measures intended to protect data from unauthorized access."
      ],
      [
        "Third-party transfer",
        "Where needed, data may be shared with logistics, technical, or sourcing contractors only to the extent required to process the request, confirm availability, compatibility, and supply terms."
      ],
      [
        "User rights",
        "The user may request correction, deletion, or restriction of processing by contacting office@longqingtrade.com."
      ],
      [
        "Company status",
        "LONGQING is not an official dealer, distributor, or authorized service center of MTU, Cummins, Siemens, or other manufacturers mentioned on the website. All trademarks belong to their respective owners."
      ]
    ]
  },
  zh: {
    title: "隐私政策",
    description: "LONGQING 关于工业设备和备件 B2B 询价的个人数据处理政策。",
    updated: "更新日期：2026年5月13日",
    sections: [
      [
        "数据处理方",
        "数据处理方为 Shandong Longqing International Trading Co., Ltd. 公司接收并处理来自俄罗斯、独联体及其他国家企业和企业代表的 B2B 请求。"
      ],
      [
        "我们接收的数据",
        "通过询价表，我们可能接收姓名、电子邮件、电话、公司、留言、设备信息、零件号、规格、文件以及用户自愿提供的技术信息。"
      ],
      [
        "数据用途",
        "数据用于处理 B2B 请求、选择设备和备件、准备商业报价、确认兼容性、联系申请人以及进行内部请求记录。"
      ],
      [
        "跨境传输",
        "由于 LONGQING 是中国公司，询价数据可能被传输至中华人民共和国并在该地区处理。提交表单即表示用户同意为处理 B2B 请求进行此类跨境传输。"
      ],
      [
        "存储和保护",
        "我们在处理请求和后续商务沟通所需范围内保存数据，并采取组织和技术措施保护数据免受未经授权的访问。"
      ],
      [
        "向第三方传输",
        "必要时，数据可在处理请求、确认库存、兼容性和供应条件所需范围内提供给物流、技术或采购合作方。"
      ],
      [
        "用户权利",
        "用户可通过 office@longqingtrade.com 请求更正、删除或限制处理其数据。"
      ],
      [
        "公司状态",
        "LONGQING 并非 MTU、Cummins、Siemens 或网站所提及其他制造商的官方经销商、分销商或授权服务中心。所有商标归其权利人所有。"
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
