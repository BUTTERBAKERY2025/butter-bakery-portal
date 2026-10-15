/**
 * The brand package, split into the sections an admin can grant.
 * Tiers follow the package README:
 *   green  = shareable with partners (suppliers, printers, delivery apps)
 *   yellow = internal, only under NDA for a specific job (agency, photographer)
 *   red    = confidential, management only
 * A file belongs to the first section whose prefix matches its path.
 */
export type BrandTier = "green" | "yellow" | "red";

export interface BrandSection {
  id: string;
  tier: BrandTier;
  en: string;
  ar: string;
  descEn: string;
  descAr: string;
  prefixes: string[];
}

export const BRAND_SECTIONS: BrandSection[] = [
  {
    id: "logos",
    tier: "green",
    en: "Logos",
    ar: "الشعارات",
    descEn: "Every logo as SVG and PNG, plus app icons.",
    descAr: "كل الشعارات SVG و PNG، وأيقونات التطبيق.",
    prefixes: ["logos/"],
  },
  {
    id: "fonts",
    tier: "green",
    en: "Fonts",
    ar: "الخطوط",
    descEn: "DM Serif Display, Lato, Readex Pro and the licence.",
    descAr: "ملفات الخطوط الثلاثة ورخصتها.",
    prefixes: ["fonts/"],
  },
  {
    id: "summary",
    tier: "green",
    en: "Identity summary (A3)",
    ar: "ملخص الهوية (A3)",
    descEn: "One-page summary for suppliers.",
    descAr: "صفحة واحدة للموردين.",
    prefixes: ["guidelines/butter-identity-summary-a3.pdf"],
  },
  {
    id: "packaging",
    tier: "green",
    en: "Packaging print files",
    ar: "ملفات طباعة التغليف",
    descEn: "Boxes, cups, wrapping paper and seal stickers.",
    descAr: "العلب والأكواب وورق التغليف والأختام.",
    prefixes: ["templates/packaging/"],
  },
  {
    id: "signage",
    tier: "green",
    en: "Signage files",
    ar: "ملفات اللوحات",
    descEn: "Fabrication files for signs and plaques.",
    descAr: "ملفات تصنيع اللوحات واللافتات.",
    prefixes: ["templates/signage/"],
  },
  {
    id: "business-card",
    tier: "green",
    en: "Business card",
    ar: "كرت العمل",
    descEn: "Print file and preview.",
    descAr: "ملف الطباعة والمعاينة.",
    prefixes: ["templates/business-card/"],
  },
  {
    id: "social",
    tier: "yellow",
    en: "Social templates",
    ar: "قوالب السوشيال",
    descEn: "Posts, stories and highlight covers.",
    descAr: "البوستات والستوري وأغلفة الهايلايت.",
    prefixes: ["templates/social/"],
  },
  {
    id: "menu",
    tier: "yellow",
    en: "Menu references",
    ar: "مرجع القائمة",
    descEn: "Reference images only; the menu is postponed.",
    descAr: "صور مرجعية فقط، القائمة مؤجلة.",
    prefixes: ["templates/menu/"],
  },
  {
    id: "mockups",
    tier: "yellow",
    en: "Mockups",
    ar: "الموك أب",
    descEn: "Illustrative images. Not for advertising.",
    descAr: "صور توضيحية، مش للإعلان.",
    prefixes: ["mockups/"],
  },
  {
    id: "guide-full",
    tier: "red",
    en: "Full brand guide",
    ar: "دليل الهوية الكامل",
    descEn: "The complete guide, including strategy. Confidential.",
    descAr: "الدليل الكامل بالاستراتيجية. سري.",
    prefixes: ["guidelines/butter-brand-guidelines-full.pdf"],
  },
  {
    id: "guide-online",
    tier: "red",
    en: "Identity guide (online)",
    ar: "دليل الهوية (أونلاين)",
    descEn: "The full interactive identity guide, as presented. Confidential.",
    descAr: "دليل الهوية الكامل التفاعلي بنفس طريقة العرض. سري.",
    prefixes: ["guide-online/"],
  },
  {
    id: "brand-data",
    tier: "red",
    en: "Brand data",
    ar: "بيانات الهوية",
    descEn: "brand.json and the package README.",
    descAr: "ملف brand.json وملف README.",
    prefixes: ["brand.json", "README.md"],
  },
];

export function sectionForPath(path: string): BrandSection | undefined {
  return BRAND_SECTIONS.find((s) =>
    s.prefixes.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p)),
  );
}

/** Ready-made permission sets the admin can start from, then adjust. */
export const BRAND_PRESETS: Record<"partner" | "agency" | "management", Record<string, "none" | "view" | "download">> = {
  partner: Object.fromEntries(
    BRAND_SECTIONS.map((s) => [s.id, s.tier === "green" ? "download" : "none"]),
  ),
  agency: Object.fromEntries(
    BRAND_SECTIONS.map((s) => [s.id, s.tier === "red" ? "none" : "download"]),
  ),
  management: Object.fromEntries(BRAND_SECTIONS.map((s) => [s.id, "download"])),
};
