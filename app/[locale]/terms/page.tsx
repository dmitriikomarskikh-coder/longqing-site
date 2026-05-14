import type {Metadata} from "next";
import {setRequestLocale} from "next-intl/server";
import type {Locale} from "@/i18n/routing";

const content = {
  ru: {
    title: "Пользовательское соглашение",
    description:
      "Условия использования сайта LONGQING для B2B-запросов на промышленное оборудование и запчасти.",
    updated: "Дата редакции: 13 мая 2026 г.",
    sections: [
      [
        "Назначение Сайта",
        "Сайт longqingtrade.com является B2B-информационным ресурсом о подборе и поставке промышленного оборудования, запчастей и совместимых компонентов. Материалы Сайта адресованы организациям и их представителям."
      ],
      [
        "Не интернет-магазин",
        "Сайт не является интернет-магазином. На Сайте не оформляется покупка, не публикуются цены и не производится автоматическое подтверждение заказа."
      ],
      [
        "Не публичная оферта",
        "Информация на Сайте, включая описания товаров, наличие, сроки, изображения и сведения о совместимости, носит справочный характер и не является публичной офертой."
      ],
      [
        "Заявки через Сайт",
        "Отправка заявки через Сайт не создает обязательства поставки. Наличие, сроки, коммерческие условия и совместимость уточняются индивидуально после рассмотрения запроса и данных оборудования."
      ],
      [
        "Изображения и описания",
        "Изображения на Сайте используются как иллюстративные материалы. Технические описания, применимость и комплектация должны подтверждаться по артикулу, серийному номеру двигателя или спецификации оборудования."
      ],
      [
        "Бренды и артикулы",
        "Бренды и артикулы используются только для идентификации оборудования, запчастей и совместимых компонентов. LONGQING работает как независимый поставщик и не представляет производителей, бренды которых указаны на Сайте."
      ],
      [
        "Ответственность пользователя",
        "Пользователь отвечает за корректность предоставленных данных, артикулов, спецификаций и контактной информации. Неполные или ошибочные данные могут повлиять на подбор и срок подготовки ответа."
      ],
      [
        "Персональные данные",
        "Порядок обработки персональных данных описан в Политике конфиденциальности. Отправляя форму на Сайте, пользователь подтверждает согласие на обработку данных для рассмотрения B2B-запроса."
      ],
      [
        "Контакты",
        "По вопросам использования Сайта, обработки заявок и персональных данных можно обращаться на office@longqingtrade.com."
      ]
    ]
  },
  en: {
    title: "Terms of Use",
    description:
      "Terms of use for the LONGQING website for B2B requests for industrial equipment and spare parts.",
    updated: "Revision date: May 13, 2026",
    sections: [
      [
        "Website purpose",
        "longqingtrade.com is a B2B informational resource about selection and supply of industrial equipment, spare parts, and compatible components. Website materials are intended for organizations and their representatives."
      ],
      [
        "Not an online store",
        "The website is not an online store. Purchases are not completed on the website, prices are not published, and orders are not confirmed automatically."
      ],
      [
        "No public offer",
        "Website information, including product descriptions, stock status, lead times, images, and compatibility details, is for reference and is not a public offer."
      ],
      [
        "Website requests",
        "Submitting a request through the website does not create a supply obligation. Stock status, lead time, commercial terms, and compatibility are clarified individually after request and equipment data review."
      ],
      [
        "Images and descriptions",
        "Images on the website are illustrative. Technical descriptions, applicability, and scope of supply must be confirmed by part number, engine serial number, or equipment specification."
      ],
      [
        "Brands and part numbers",
        "Brand names and part numbers are used only to identify equipment, spare parts, and compatible components. LONGQING acts as an independent supplier and does not represent the manufacturers whose brands are mentioned on the website."
      ],
      [
        "User responsibility",
        "The user is responsible for the accuracy of provided data, part numbers, specifications, and contact information. Incomplete or incorrect data may affect selection and response timing."
      ],
      [
        "Personal data",
        "Personal data processing is described in the Privacy Policy. By submitting a website form, the user confirms consent to data processing for B2B request review."
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
    updated: "修订日期：2026年5月13日",
    sections: [
      [
        "网站用途",
        "longqingtrade.com 是关于工业设备、备件和兼容部件选型及供应的 B2B 信息资源。网站内容面向企业及其代表。"
      ],
      [
        "非网上商店",
        "网站不是网上商店。用户不能在网站上直接完成购买，网站不发布价格，也不会自动确认订单。"
      ],
      [
        "非公开要约",
        "网站信息，包括产品描述、库存状态、交期、图片和兼容性信息，仅供参考，不构成公开要约。"
      ],
      [
        "网站请求",
        "通过网站提交请求不产生供应义务。库存状态、交期、商务条件和兼容性将在审查请求及设备数据后单独确认。"
      ],
      [
        "图片和描述",
        "网站图片为示意材料。技术描述、适用性和供应范围需根据零件号、发动机序列号或设备规格确认。"
      ],
      [
        "品牌和零件号",
        "品牌名称和零件号仅用于识别设备、备件和兼容部件。LONGQING 作为独立供应商开展业务，并不代表网站所提及品牌的制造商。"
      ],
      [
        "用户责任",
        "用户应对所提供数据、零件号、规格和联系信息的准确性负责。不完整或错误的数据可能影响选型和回复时间。"
      ],
      [
        "个人数据",
        "个人数据处理方式见隐私政策。用户提交网站表单即确认同意为审查 B2B 请求而处理数据。"
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
