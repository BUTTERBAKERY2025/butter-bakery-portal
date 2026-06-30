import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Calendar, Tag, ChevronRight, ArrowUpRight } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useLang } from "@/contexts/LanguageContext";
import logoBb from "@/assets/real/logo-bb.jpg";

import sevenSigningMain from "@/assets/real/seven-signing-main.png";
import sevenSigningGroup from "@/assets/real/seven-signing-group.png";
import branchAbha from "@/assets/real/branch-abha.jpg";
import airlineBb from "@/assets/real/airline-bb.jpg";
import branchMedinaAerial from "@/assets/real/branch-medina-aerial.jpg";
import seasonalSummerDay from "@/assets/real/seasonal-summer-day.jpg";
import kidsBaking from "@/assets/real/kids-baking.jpg";
import branchRiyadhInterior from "@/assets/real/branch-riyadh-interior.jpg";
import staffPastries from "@/assets/real/staff-pastries.jpg";
import founders from "@/assets/real/founders.jpg";
import branchExterior from "@/assets/real/branch-exterior.jpg";
import coffeeBar from "@/assets/real/coffee-bar.jpg";

type Category = "all" | "awards" | "expansion" | "partnerships" | "academy" | "events";

interface NewsItem {
  id: number;
  category: Exclude<Category, "all">;
  date: string;
  dateAr: string;
  image: string;
  image2?: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  featured?: boolean;
  breaking?: boolean;
  branches?: string[];
  branchesAr?: string[];
}

const newsItems: NewsItem[] = [
  {
    id: 0,
    category: "partnerships",
    date: "June 2026",
    dateAr: "يونيو 2026",
    image: sevenSigningMain,
    image2: sevenSigningGroup,
    featured: true,
    breaking: true,
    titleEn: "Historic Agreement: Butter Bakery Signs with Seven — PIF",
    titleAr: "اتفاقية تاريخية: بتر بيكري توقّع مع شركة سيفن التابعة لصندوق الاستثمارات العامة",
    excerptEn:
      "In June 2026, Butter Bakery signed a landmark partnership agreement with Seven Company — a subsidiary of Saudi Arabia's Public Investment Fund (PIF) — to open five new Butter Bakery branches across the Kingdom. This agreement represents a pivotal milestone in our national expansion and our commitment to bringing the Butter Bakery experience to every corner of Saudi Arabia.",
    excerptAr:
      "في يونيو 2026، وقّعت بتر بيكري اتفاقية شراكة تاريخية مع شركة سيفن — الشركة التابعة لصندوق الاستثمارات العامة في المملكة العربية السعودية — لافتتاح خمسة فروع جديدة لبتر بيكري في أرجاء المملكة. تُمثّل هذه الاتفاقية نقطة تحوّل حاسمة في مسيرة توسعنا الوطني، وتجسيداً لالتزامنا بإيصال تجربة بتر بيكري إلى كل بقعة في أرض المملكة.",
    branches: [
      "Riyadh — Al Hamra (Seven)",
      "Abha — Seven",
      "Madinah — Seven",
      "Yanbu — Seven",
      "Tabuk — Seven",
    ],
    branchesAr: [
      "الرياض — الحمراء (سيفن)",
      "أبها — سيفن",
      "المدينة المنورة — سيفن",
      "ينبع — سيفن",
      "تبوك — سيفن",
    ],
  },
  {
    id: 1,
    category: "awards",
    date: "March 2025",
    dateAr: "مارس 2025",
    image: branchAbha,
    titleEn: "Butter Bakery Wins Best Tourism Project in Asir Region",
    titleAr: "بتر بيكري تفوز بجائزة أفضل مشروع سياحي في منطقة عسير",
    excerptEn:
      "Our Abha Al Hizam flagship was officially recognised by the Asir Tourism Authority as the region's best tourism project — a testament to the experience we've crafted for every guest who walks through our doors.",
    excerptAr:
      "حصل فرعنا الرئيسي في أبها الحزام على تكريم رسمي من هيئة السياحة في منطقة عسير، إذ مُنح لقب أفضل مشروع سياحي في المنطقة — اعترافاً بالتجربة الاستثنائية التي نصنعها لكل ضيف يزورنا.",
  },
  {
    id: 2,
    category: "partnerships",
    date: "January 2026",
    dateAr: "يناير 2026",
    image: airlineBb,
    titleEn: "Butter Bakery Takes Flight — Airline Partnership Signed",
    titleAr: "بتر بيكري تحلّق — توقيع شراكة مع شركة طيران",
    excerptEn:
      "We are proud to announce our first B2G airline catering partnership, bringing our signature European-inspired pastries to passengers at 30,000 feet. The partnership marks a new chapter in our national expansion.",
    excerptAr:
      "يسعدنا الإعلان عن أول شراكة لتموين الطيران على مستوى B2G، إذ تحمل طائراتنا الآن معجنات بتر بيكري الفاخرة لضيوف الجو على ارتفاع 30,000 قدم — فصل جديد في توسعنا الوطني.",
  },
  {
    id: 3,
    category: "expansion",
    date: "January 2026",
    dateAr: "يناير 2026",
    image: branchMedinaAerial,
    titleEn: "New Branch Opens in the Heart of Madinah",
    titleAr: "افتتاح فرع جديد في قلب المدينة المنورة",
    excerptEn:
      "Butter Bakery is honoured to open its doors in Madinah Al Munawwarah — a city of grace, history, and spirit. Our new branch is designed to complement the city's unique character with warmth and refinement.",
    excerptAr:
      "يشرفنا افتتاح فرع بتر بيكري في المدينة المنورة — مدينة الرقي والتاريخ والروح. صُمِّم الفرع الجديد ليتناسق مع طابع المدينة العريق بدفء ورقي.",
  },
  {
    id: 4,
    category: "events",
    date: "June 2025",
    dateAr: "يونيو 2025",
    image: seasonalSummerDay,
    titleEn: "Summer Collection 2025 — A Season of Golden Flavours",
    titleAr: "تشكيلة الصيف 2025 — موسم من النكهات الذهبية",
    excerptEn:
      "This summer, Butter Bakery unveils a limited seasonal collection inspired by Mediterranean sun and Saudi warmth — fresh, vibrant, and made to be savoured slowly.",
    excerptAr:
      "هذا الصيف، تكشف بتر بيكري عن تشكيلة موسمية محدودة مستوحاة من شمس المتوسط ودفء السعودية — طازجة، زاهية، ومصنوعة لتُستمتع بها ببطء.",
  },
  {
    id: 5,
    category: "academy",
    date: "April 2025",
    dateAr: "أبريل 2025",
    image: kidsBaking,
    titleEn: "Butter Bakery Academy — We Share Our Craft",
    titleAr: "أكاديمية بتر بيكري — نشارك حرفتنا",
    excerptEn:
      "Our baking academy officially launched its first cohort — 24 students learning the French and European traditions of bread-making, pastry, and hospitality from our master bakers.",
    excerptAr:
      "أطلقت أكاديميتنا للخبز دفعتها الأولى — 24 طالباً يتعلمون أسرار صناعة الخبز والمعجنات على التراث الفرنسي والأوروبي تحت إشراف خبازينا المحترفين.",
  },
  {
    id: 6,
    category: "partnerships",
    date: "February 2026",
    dateAr: "فبراير 2026",
    image: branchRiyadhInterior,
    titleEn: "Major B2B Contract — Corporate Catering in Riyadh",
    titleAr: "عقد B2B كبير — تموين المؤسسات في الرياض",
    excerptEn:
      "Butter Bakery has secured a major corporate catering contract with several leading organisations in Riyadh, delivering our freshly baked goods directly to offices and events across the capital.",
    excerptAr:
      "أبرمت بتر بيكري عقداً كبيراً لتموين عدد من المؤسسات الرائدة في الرياض، لتصل مخبوزاتنا الطازجة يومياً إلى المكاتب والفعاليات في العاصمة.",
  },
  {
    id: 7,
    category: "events",
    date: "September 2025",
    dateAr: "سبتمبر 2025",
    image: staffPastries,
    titleEn: "Behind the Counter — Butter Bakery in Saudi Lifestyle Magazine",
    titleAr: "خلف المنضدة — بتر بيكري في مجلة لايف ستايل السعودية",
    excerptEn:
      "Saudi Lifestyle Magazine featured Butter Bakery in a special editorial spotlight — exploring our story, our craft, and the people who make every loaf, croissant, and cup a moment worth remembering.",
    excerptAr:
      "خصصت مجلة لايف ستايل السعودية تقريراً مميزاً لبتر بيكري — استعرضت قصتنا وحرفتنا والأشخاص الذين يجعلون كل رغيف وكرواسون وفنجان لحظةً تستحق الذكر.",
  },
  {
    id: 8,
    category: "expansion",
    date: "October 2025",
    dateAr: "أكتوبر 2025",
    image: branchExterior,
    titleEn: "Riyadh Embassies District — Grand Opening",
    titleAr: "حي السفارات بالرياض — الافتتاح الرسمي",
    excerptEn:
      "The Riyadh Embassies District branch opened to an enthusiastic reception — a thoughtfully designed space blending European elegance with Riyadh's cosmopolitan spirit.",
    excerptAr:
      "افتُتح فرع حي السفارات بالرياض باستقبال حافل — مساحة مصممة بعناية تمزج بين الأناقة الأوروبية وروح الرياض العالمية.",
  },
  {
    id: 9,
    category: "awards",
    date: "November 2025",
    dateAr: "نوفمبر 2025",
    image: founders,
    titleEn: "The Founders' Vision — Five Years of Butter Bakery",
    titleAr: "رؤية المؤسسَيْن — خمس سنوات من بتر بيكري",
    excerptEn:
      "Five years since the first Butter Bakery opened in Abha. A journey that began with a single vision — to create not just a bakery, but a place of emotion, identity, and unmistakable taste.",
    excerptAr:
      "خمس سنوات منذ افتتاح أول فرع لبتر بيكري في أبها. رحلة بدأت برؤية واحدة — لا لخلق مخبز فحسب، بل لإنشاء مكان من الإحساس والهوية والنكهة التي لا تُنسى.",
  },
  {
    id: 10,
    category: "events",
    date: "December 2025",
    dateAr: "ديسمبر 2025",
    image: coffeeBar,
    titleEn: "Winter Menu — European Warmth in Every Cup",
    titleAr: "قائمة الشتاء — دفء أوروبي في كل فنجان",
    excerptEn:
      "Our winter menu brings the warmth of European café culture to Saudi Arabia — seasonal hot drinks, spiced pastries, and comforting bites crafted for cooler evenings.",
    excerptAr:
      "تجلب قائمة شتائنا دفء ثقافة المقاهي الأوروبية إلى السعودية — مشروبات ساخنة موسمية ومعجنات بالتوابل ولقيمات مريحة مصنوعة لأمسيات أكثر برودة.",
  },
];

const categoryLabels: Record<Category, { en: string; ar: string }> = {
  all:          { en: "All News",     ar: "كل الأخبار"   },
  awards:       { en: "Awards",       ar: "الجوائز"      },
  expansion:    { en: "Expansion",    ar: "التوسع"       },
  partnerships: { en: "Partnerships", ar: "الشراكات"     },
  academy:      { en: "Academy",      ar: "الأكاديمية"   },
  events:       { en: "Events",       ar: "الفعاليات"    },
};

const categories: Category[] = ["all", "awards", "expansion", "partnerships", "academy", "events"];

export default function News() {
  const { t, lang, toggleLang, isAr } = useLang();
  const [active, setActive] = useState<Category>("all");
  const [selected, setSelected] = useState<NewsItem | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = isAr ? "الأخبار — بتر بيكري" : "News — Butter Bakery";
  }, [isAr]);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const filtered =
    active === "all" ? newsItems : newsItems.filter((n) => n.category === active);

  const featured = filtered.find((n) => n.featured) ?? filtered[0];
  const rest = filtered.filter((n) => n.id !== featured?.id);

  return (
    <div className={`min-h-screen bg-background text-foreground${isAr ? " font-arabic" : ""}`}
      dir={isAr ? "rtl" : "ltr"}>

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group text-foreground/60 hover:text-primary transition-colors text-sm">
            <BackArrow className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="tracking-wide">{isAr ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>

          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 overflow-hidden rounded-sm ring-1 ring-border">
              <img src={logoBb} alt="Butter Bakery" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-sm font-bold tracking-wider text-foreground hidden sm:block">
              BUTTER BAKERY
            </span>
          </Link>

          <button
            onClick={toggleLang}
            className="text-xs font-medium tracking-widest px-3 py-2 border border-border text-foreground/60 hover:border-primary hover:text-primary transition-all duration-300"
          >
            {lang === "en" ? "عربي" : "EN"}
          </button>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-14 md:pt-36 md:pb-24 bg-[#1C1208] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        {/* decorative grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="container mx-auto px-5 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          >
            <p className="text-primary text-[10px] md:text-xs font-semibold uppercase tracking-[0.25em] md:tracking-[0.4em] mb-4 md:mb-6">
              {isAr ? "بتر بيكري — آخر الأخبار" : "Butter Bakery — Latest News"}
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl font-medium text-white mb-5 md:mb-8 leading-none">
              {isAr ? "الأخبار" : "News"}
            </h1>
            <p className="text-white/50 max-w-lg leading-relaxed text-base md:text-lg font-light">
              {isAr
                ? "آخر أخبار بتر بيكري — من الجوائز والتوسع إلى الشراكات والفعاليات."
                : "The latest from Butter Bakery — awards, expansions, partnerships, and moments worth sharing."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Category Filter ───────────────────────────────────── */}
      <section className="sticky top-[65px] z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-5 md:px-12">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`shrink-0 px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all duration-300 border ${
                  active === cat
                    ? "bg-primary text-white border-primary"
                    : "border-border text-foreground/50 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {isAr ? categoryLabels[cat].ar : categoryLabels[cat].en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="container mx-auto px-5 md:px-12 py-12 md:py-20">

        <AnimatePresence mode="wait">
          {featured && (
            <motion.div
              key={active + "-featured"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {/* Featured Article */}
              <div
                className={`group grid grid-cols-1 md:grid-cols-2 gap-0 transition-colors duration-500 mb-10 md:mb-16 cursor-pointer overflow-hidden ${
                  featured.breaking
                    ? "border-2 border-primary shadow-[0_0_40px_rgba(212,105,22,0.15)] hover:shadow-[0_0_60px_rgba(212,105,22,0.25)]"
                    : "border border-border hover:border-primary/40"
                }`}
                onClick={() => setSelected(featured)}
              >
                {/* Image side */}
                <div className="relative overflow-hidden h-64 md:h-full min-h-[300px]">
                  <img
                    src={featured.image}
                    alt={isAr ? featured.titleAr : featured.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Breaking badge on image */}
                  {featured.breaking && (
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="relative flex items-center gap-2 bg-primary text-white text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        {isAr ? "حصري" : "Exclusive"}
                      </span>
                    </div>
                  )}
                  {/* Dark gradient over image bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Content side */}
                <div className={`p-7 md:p-12 flex flex-col justify-between transition-colors duration-500 ${
                  featured.breaking ? "bg-[#1C1208] text-white" : "bg-secondary/30 group-hover:bg-secondary/60"
                }`}>
                  <div>
                    <div className="flex items-center gap-3 mb-5 md:mb-6">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-primary`}>
                        <Tag className="w-3 h-3" />
                        {isAr ? categoryLabels[featured.category].ar : categoryLabels[featured.category].en}
                      </span>
                      <span className={`w-1 h-1 rounded-full ${featured.breaking ? "bg-white/20" : "bg-border"}`} />
                      <span className={`text-[11px] flex items-center gap-1 ${featured.breaking ? "text-white/50" : "text-foreground/40"}`}>
                        <Calendar className="w-3 h-3" />
                        {isAr ? featured.dateAr : featured.date}
                      </span>
                    </div>

                    <h2 className={`font-serif text-2xl md:text-4xl leading-snug mb-4 md:mb-5 ${isAr ? "leading-relaxed" : ""} ${featured.breaking ? "text-white" : "text-foreground"}`}>
                      {isAr ? featured.titleAr : featured.titleEn}
                    </h2>
                    <p className={`text-sm md:text-base leading-relaxed font-light mb-5 ${featured.breaking ? "text-white/65" : "text-foreground/60"}`}>
                      {isAr ? featured.excerptAr : featured.excerptEn}
                    </p>

                    {/* Branches list for Seven partnership */}
                    {featured.breaking && (featured.branches || featured.branchesAr) && (
                      <div className="mt-2 mb-2">
                        <p className="text-primary text-[10px] uppercase tracking-[0.25em] font-semibold mb-3">
                          {isAr ? "الفروع المتفق عليها" : "Agreed Branches"}
                        </p>
                        <ul className="space-y-1.5">
                          {(isAr ? featured.branchesAr! : featured.branches!).map((branch, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                              <span className="w-4 h-px bg-primary/60 shrink-0" />
                              {branch}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/10">
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold group-hover:gap-3 transition-all duration-300">
                      {isAr ? "اقرأ المزيد" : "Read More"}
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {rest.map((item, i) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.07, duration: 0.5 }}
                      className="group border border-border hover:border-primary/40 transition-colors duration-500 cursor-pointer overflow-hidden flex flex-col"
                      onClick={() => setSelected(item)}
                    >
                      <div className="overflow-hidden h-52">
                        <img
                          src={item.image}
                          alt={isAr ? item.titleAr : item.titleEn}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-5 md:p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] uppercase tracking-widest font-semibold text-primary">
                            {isAr ? categoryLabels[item.category].ar : categoryLabels[item.category].en}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="text-[10px] text-foreground/35">
                            {isAr ? item.dateAr : item.date}
                          </span>
                        </div>
                        <h3 className={`font-serif text-xl text-foreground leading-snug mb-3 group-hover:text-primary transition-colors duration-300 ${isAr ? "leading-relaxed" : ""}`}>
                          {isAr ? item.titleAr : item.titleEn}
                        </h3>
                        <p className="text-foreground/55 text-sm leading-relaxed font-light flex-1 line-clamp-3">
                          {isAr ? item.excerptAr : item.excerptEn}
                        </p>
                        <div className="mt-5 pt-4 border-t border-border/50">
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary font-semibold group-hover:gap-2.5 transition-all duration-300">
                            {isAr ? "اقرأ المزيد" : "Read More"}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {filtered.length === 0 && (
          <FadeIn>
            <div className="text-center py-24 text-foreground/30">
              <p className="font-serif text-2xl mb-2">{isAr ? "لا توجد أخبار في هذا القسم" : "No news in this category yet"}</p>
              <p className="text-sm">{isAr ? "تابعونا قريباً" : "Stay tuned"}</p>
            </div>
          </FadeIn>
        )}
      </main>

      {/* ── Modal / Article Detail ─────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-8"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-background w-full md:max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image(s) */}
              {selected.image2 ? (
                <div className="relative">
                  {/* Close button */}
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 z-10 w-9 h-9 bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors text-lg font-light"
                  >
                    ✕
                  </button>
                  {/* Main large photo */}
                  <div className="overflow-hidden h-72 md:h-96">
                    <img
                      src={selected.image2}
                      alt={isAr ? selected.titleAr : selected.titleEn}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  {/* Second photo — smaller strip */}
                  <div className="overflow-hidden h-44 md:h-56 border-t-2 border-primary/30">
                    <img
                      src={selected.image}
                      alt={isAr ? selected.titleAr : selected.titleEn}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
                </div>
              ) : (
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={selected.image}
                    alt={isAr ? selected.titleAr : selected.titleEn}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 w-9 h-9 bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors text-lg font-light"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
                </div>
              )}

              {/* Body */}
              <div className="px-6 md:px-10 pb-10 pt-4">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-primary">
                    {isAr ? categoryLabels[selected.category].ar : categoryLabels[selected.category].en}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-xs text-foreground/40 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {isAr ? selected.dateAr : selected.date}
                  </span>
                </div>

                <h2 className={`font-serif text-2xl md:text-3xl text-foreground mb-5 leading-snug ${isAr ? "leading-relaxed" : ""}`}>
                  {isAr ? selected.titleAr : selected.titleEn}
                </h2>

                <p className="text-foreground/70 leading-relaxed md:leading-loose font-light text-sm md:text-base">
                  {isAr ? selected.excerptAr : selected.excerptEn}
                </p>

                {/* Branches list — Seven partnership */}
                {selected.breaking && (selected.branches || selected.branchesAr) && (
                  <div className="mt-6 p-5 bg-[#1C1208] border border-primary/30">
                    <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-semibold mb-4">
                      {isAr ? "الفروع الخمسة المتفق عليها" : "Five Agreed Branches"}
                    </p>
                    <ul className="space-y-2.5">
                      {(isAr ? selected.branchesAr! : selected.branches!).map((branch, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-white/75">
                          <span className="w-5 h-px bg-primary shrink-0" />
                          {branch}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-white/30 text-[11px] leading-relaxed font-light">
                      {isAr
                        ? "شركة سيفن — التابعة لصندوق الاستثمارات العامة في المملكة العربية السعودية"
                        : "Seven Company — a subsidiary of Saudi Arabia's Public Investment Fund (PIF)"}
                    </p>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                  <p className="text-xs text-foreground/30 uppercase tracking-widest">
                    {isAr ? "بتر بيكري" : "Butter Bakery"}
                  </p>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors"
                  >
                    {isAr ? "إغلاق" : "Close"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer Bar ────────────────────────────────────────── */}
      <div className="bg-[#1C1208] py-6 border-t border-white/10">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Butter Bakery. {t.footer.copyright}</p>
          <Link href="/" className="hover:text-primary transition-colors">
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
