import type {Locale} from "@/i18n/routing";

export type StockItem = {
  id: string;
  slug: string;
  brand: string;
  category: string;
  partNumber: string;
  altPartNumbers?: string[];
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  unit: string;
  quantity?: number;
  location: Record<Locale, string>;
  leadTime: Record<Locale, string>;
  status: Record<Locale, string>;
  preparation: Record<Locale, string>;
};

export const stockItems: StockItem[] = [
  {
    id: "stock-mtu-x52407500053",
    slug: "forsunka-mtu-x52407500053",
    brand: "MTU",
    category: "Топливная система / форсунки",
    partNumber: "X52407500053",
    altPartNumbers: ["52407500053", "RX52407500053", "EX52407500053"],
    name: {
      ru: "Топливная форсунка MTU X52407500053",
      zh: "MTU X52407500053 燃油喷油器",
      en: "MTU X52407500053 fuel injector"
    },
    description: {
      ru: "Оригинальная деталь системы Common Rail для дизельных двигателей MTU Series 4000.",
      zh: "适用于 MTU Series 4000 柴油发动机 Common Rail 系统的燃油喷油器。",
      en: "Common Rail fuel injector for MTU Series 4000 diesel engines."
    },
    unit: "шт.",
    quantity: 6,
    location: {
      ru: "На складе в Китае",
      zh: "中国仓库现货",
      en: "China warehouse"
    },
    leadTime: {
      ru: "3–4 дня",
      zh: "3–4 天",
      en: "3–4 days"
    },
    status: {
      ru: "На складе",
      zh: "现货",
      en: "In stock"
    },
    preparation: {
      ru: "3–4 дня до подготовки к отгрузке",
      zh: "3–4 天可准备发货",
      en: "3–4 days to prepare for dispatch"
    }
  },
  {
    id: "stock-mtu-gasket-placeholder",
    slug: "prokladka-mtu-placeholder",
    brand: "MTU",
    category: "Прокладки и уплотнения",
    partNumber: "MTU-GASKET-01",
    name: {
      ru: "Прокладка MTU",
      zh: "MTU 垫片",
      en: "MTU gasket"
    },
    description: {
      ru: "Позиция для уточнения по артикулу или спецификации.",
      zh: "可按型号或规格确认。",
      en: "Item to confirm by part number or specification."
    },
    unit: "шт.",
    quantity: 12,
    location: {
      ru: "На складе в Китае",
      zh: "中国仓库现货",
      en: "China warehouse"
    },
    leadTime: {
      ru: "3–4 дня",
      zh: "3–4 天",
      en: "3–4 days"
    },
    status: {
      ru: "На складе",
      zh: "现货",
      en: "In stock"
    },
    preparation: {
      ru: "3–4 дня до подготовки к отгрузке",
      zh: "3–4 天可准备发货",
      en: "3–4 days to prepare for dispatch"
    }
  },
  {
    id: "stock-mtu-bearing-placeholder",
    slug: "vkladyshi-mtu-placeholder",
    brand: "MTU",
    category: "Вкладыши",
    partNumber: "MTU-BEARING-01",
    name: {
      ru: "Вкладыши MTU",
      zh: "MTU 轴瓦",
      en: "MTU bearing set"
    },
    description: {
      ru: "Позиция для уточнения по двигателю и ремонтному размеру.",
      zh: "可按发动机和维修尺寸确认。",
      en: "Item to confirm by engine and repair size."
    },
    unit: "компл.",
    quantity: 4,
    location: {
      ru: "На складе в Китае",
      zh: "中国仓库现货",
      en: "China warehouse"
    },
    leadTime: {
      ru: "3–4 дня",
      zh: "3–4 天",
      en: "3–4 days"
    },
    status: {
      ru: "На складе",
      zh: "现货",
      en: "In stock"
    },
    preparation: {
      ru: "3–4 дня до подготовки к отгрузке",
      zh: "3–4 天可准备发货",
      en: "3–4 days to prepare for dispatch"
    }
  },
  {
    id: "stock-cummins-filter-placeholder",
    slug: "filtr-cummins-placeholder",
    brand: "Cummins",
    category: "Фильтры и расходные материалы",
    partNumber: "CUMMINS-FILTER-01",
    name: {
      ru: "Фильтр Cummins",
      zh: "Cummins 滤芯",
      en: "Cummins filter"
    },
    description: {
      ru: "Позиция для уточнения по модели оборудования.",
      zh: "可按设备型号确认。",
      en: "Item to confirm by equipment model."
    },
    unit: "шт.",
    quantity: 20,
    location: {
      ru: "На складе в Китае",
      zh: "中国仓库现货",
      en: "China warehouse"
    },
    leadTime: {
      ru: "3–4 дня",
      zh: "3–4 天",
      en: "3–4 days"
    },
    status: {
      ru: "На складе",
      zh: "现货",
      en: "In stock"
    },
    preparation: {
      ru: "3–4 дня до подготовки к отгрузке",
      zh: "3–4 天可准备发货",
      en: "3–4 days to prepare for dispatch"
    }
  },
  {
    id: "stock-mitsubishi-engine-component-placeholder",
    slug: "komponent-dvigatelya-mitsubishi-placeholder",
    brand: "Mitsubishi",
    category: "Компоненты двигателя",
    partNumber: "MITSUBISHI-ENGINE-01",
    name: {
      ru: "Компонент двигателя Mitsubishi",
      zh: "Mitsubishi 发动机部件",
      en: "Mitsubishi engine component"
    },
    description: {
      ru: "Позиция для уточнения по артикулу, фото или спецификации.",
      zh: "可按型号、照片或规格确认。",
      en: "Item to confirm by part number, photo, or specification."
    },
    unit: "шт.",
    quantity: 5,
    location: {
      ru: "На складе в Китае",
      zh: "中国仓库现货",
      en: "China warehouse"
    },
    leadTime: {
      ru: "3–4 дня",
      zh: "3–4 天",
      en: "3–4 days"
    },
    status: {
      ru: "На складе",
      zh: "现货",
      en: "In stock"
    },
    preparation: {
      ru: "3–4 дня до подготовки к отгрузке",
      zh: "3–4 天可准备发货",
      en: "3–4 days to prepare for dispatch"
    }
  },
  {
    id: "stock-caterpillar-track-adjuster-placeholder",
    slug: "natyazhitel-gusenitsy-caterpillar-placeholder",
    brand: "Caterpillar",
    category: "Ходовая часть",
    partNumber: "CAT-TRACK-ADJ-01",
    name: {
      ru: "Натяжитель гусеницы Caterpillar",
      zh: "Caterpillar 履带张紧器",
      en: "Caterpillar track adjuster"
    },
    description: {
      ru: "Позиция для уточнения по модели техники и артикулу.",
      zh: "可按设备型号和零件号确认。",
      en: "Item to confirm by machine model and part number."
    },
    unit: "шт.",
    quantity: 2,
    location: {
      ru: "На складе в Китае",
      zh: "中国仓库现货",
      en: "China warehouse"
    },
    leadTime: {
      ru: "3–4 дня",
      zh: "3–4 天",
      en: "3–4 days"
    },
    status: {
      ru: "На складе",
      zh: "现货",
      en: "In stock"
    },
    preparation: {
      ru: "3–4 дня до подготовки к отгрузке",
      zh: "3–4 天可准备发货",
      en: "3–4 days to prepare for dispatch"
    }
  }
];
