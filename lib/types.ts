import type {Locale} from "@/i18n/routing";

export type LocalizedText = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

export type Brand = {
  slug: string;
  name: LocalizedText;
  country: string;
  logo: string;
  sectors: string[];
  description: LocalizedText;
  equipmentTypes: LocalizedList;
};

export type Service = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
};

export type Geography = {
  countries: Array<{
    id: string;
    name: LocalizedText;
    region: LocalizedText;
  }>;
};

export type NewsItem = {
  slug: string;
  locale: Locale;
  title: string;
  date: string;
  excerpt: string;
  cover?: string;
};
