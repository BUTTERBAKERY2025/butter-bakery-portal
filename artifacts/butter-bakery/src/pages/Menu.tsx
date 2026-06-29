import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import logoBb from "@/assets/real/logo-bb.jpg";

interface MenuItem {
  ar: string;
  en: string;
  price: number;
  note?: string;
  signature?: boolean;
}

interface MenuCategory {
  idKey: string;
  ar: string;
  en: string;
  descAr: string;
  descEn: string;
  dark?: boolean;
  items: MenuItem[];
}

const MENU: MenuCategory[] = [
  {
    idKey: "hot",
    ar: "المشروبات الحارة",
    en: "Hot Drinks",
    descAr: "قهوة مختصة محضّرة يومياً بحبوب كولومبية مختارة",
    descEn: "Specialty coffee prepared daily with selected Colombian beans",
    items: [
      { ar: "اسبريسو", en: "Espresso", price: 11 },
      { ar: "أمريكانو", en: "Americano", price: 12 },
      { ar: "كوفي داي", en: "Coffee Day", price: 12.73, note: "Colombian beans" },
      { ar: "V60 بور أوفر", en: "V60 Pour-Over", price: 19, signature: true },
      { ar: "التيه", en: "Latte", price: 16 },
      { ar: "فلت وايت", en: "Flat White", price: 15.90 },
      { ar: "كابتشينو", en: "Cappuccino", price: 17.90 },
      { ar: "كورتادو", en: "Cortado", price: 15.05 },
      { ar: "سبانش التيه", en: "Spanish Latte", price: 18.90, signature: true },
      { ar: "ماكياتو", en: "Macchiato", price: 15.05 },
      { ar: "هوت شوكليت", en: "Hot Chocolate", price: 18.90 },
      { ar: "شاي إنجليزي", en: "English Tea", price: 7 },
      { ar: "شاي أخضر", en: "Green Tea", price: 7 },
    ],
  },
  {
    idKey: "cold",
    ar: "المشروبات الباردة",
    en: "Cold Drinks",
    descAr: "مشروبات منعشة بمكونات طازجة كل يوم",
    descEn: "Refreshing beverages made with fresh daily ingredients",
    dark: true,
    items: [
      { ar: "سبشيال أيس أمريكانو", en: "Special Iced Americano", price: 17.91 },
      { ar: "أيس V60", en: "Ice V60", price: 21, signature: true },
      { ar: "أيس V60 وتوت أحمر", en: "Ice V60 & Raspberry", price: 22 },
      { ar: "مشروب الصيف", en: "Summer Drink", price: 21.99 },
      { ar: "بريز ليمون", en: "Breeze Lemon", price: 22.46 },
      { ar: "بي بي سمر بريز", en: "BB Summer Breeze", price: 22.46, note: "Passion Fruit" },
      { ar: "عصير برتقال طازج", en: "Fresh Orange Juice", price: 17.27 },
      { ar: "بريز توت أزرق", en: "Breeze Blueberry", price: 22.46 },
      { ar: "بريز مكس بيري", en: "Breeze Mix Berries", price: 22.31 },
      { ar: "بريز فراولة", en: "Breeze Strawberry", price: 22.59 },
      { ar: "شاي مثلج", en: "Peach Iced Tea", price: 21.95 },
      { ar: "كركديه", en: "Hibiscus", price: 19.71 },
      { ar: "ماتشا", en: "Matcha", price: 22.05 },
    ],
  },
  {
    idKey: "breakfast",
    ar: "الإفطار",
    en: "Breakfast",
    descAr: "وجبات إفطار مُعدّة بعناية تستحق لحظة هدوء",
    descEn: "Carefully crafted breakfast plates worth taking your time over",
    items: [
      { ar: "جرانوال", en: "Granola Bowl", price: 33 },
      { ar: "اسكرمبل البيض والأفوكادو", en: "Scrambled Eggs & Avocado", price: 37 },
      { ar: "أميريكان إيغ", en: "American Egg", price: 31.90 },
      { ar: "أومليت فرنسي", en: "French Omelette", price: 39, signature: true },
      { ar: "بيض ترافل", en: "Truffle Eggs", price: 31.90, signature: true },
      { ar: "بروسكيتا البيض", en: "Egg Bruschetta", price: 25 },
      { ar: "كرواسون بيض وجبنة", en: "Egg & Cheese Croissant", price: 27.90 },
      { ar: "كرواسون السيغنتشر", en: "Signature Croissant", price: 25 },
      { ar: "فرنش توست", en: "French Toast", price: 27 },
      { ar: "حلومي ساندوش", en: "Halloumi Sandwich", price: 29 },
      { ar: "بانيني تركي مدخن", en: "Smoked Turkey Panini", price: 23.90 },
      { ar: "بانيني روستد بيف", en: "Roasted Beef Panini", price: 23.90 },
      { ar: "ساندويتش التونة البنية", en: "Brown Tuna Sandwich", price: 26 },
      { ar: "بريوش بريزاولا", en: "Brioche Bresaola", price: 23 },
      { ar: "رويال بينديكت", en: "Royal Benedict", price: 36.90, signature: true },
      { ar: "شكشوكة إيطالي", en: "Italian Shakshuka", price: 36 },
      { ar: "ساندويتش البيض اليوناني", en: "Greek Egg Sandwich", price: 24 },
      { ar: "ديب السبانخ مع الدجاج", en: "Spinach & Chicken Dip", price: 34 },
      { ar: "كرواسون التونة", en: "Tuna Croissant", price: 25 },
    ],
  },
  {
    idKey: "salads",
    ar: "السلطات",
    en: "Salads",
    descAr: "خضروات طازجة بتوليفات متوسطية وعربية",
    descEn: "Fresh greens in Mediterranean and regional blends",
    dark: true,
    items: [
      { ar: "سلطة شمندر", en: "Beetroot Salad", price: 16 },
      { ar: "سلطة باربكيو الحلومي", en: "Halloumi BBQ Salad", price: 35, signature: true },
      { ar: "سلطة دجاج", en: "Chicken Salad", price: 19 },
    ],
  },
  {
    idKey: "pastries",
    ar: "المخبوزات",
    en: "Pastries",
    descAr: "معجنات تُخبز يومياً بزبدة فرنسية وعجائن طازجة",
    descEn: "Baked fresh daily with French butter and housemade doughs",
    items: [
      { ar: "كرواسون سادة", en: "Plain Croissant", price: 17 },
      { ar: "كرواسون شوكوالته", en: "Chocolate Croissant", price: 22 },
      { ar: "كرواسون اللوز", en: "Almond Croissant", price: 19, signature: true },
      { ar: "كرواسون بيكان", en: "Pecan Croissant", price: 24 },
      { ar: "كوكيز كرواسون", en: "Cookie Croissant", price: 27, signature: true },
      { ar: "كرواسون جبنة بارميزان", en: "Parmesan Croissant", price: 21 },
      { ar: "لندن بن تشيز كيك", en: "London Bun Cheesecake", price: 27 },
      { ar: "بان سويس", en: "Swiss Bun", price: 23 },
      { ar: "دانش كريمة فرنسية", en: "French Cream Danish", price: 27 },
      { ar: "دانش التيني", en: "Fig Danish", price: 26 },
      { ar: "دانش بيستو", en: "Pesto Danish", price: 21.56 },
      { ar: "دانش شمر تشيز وطماطم مجففة", en: "Fennel Cheese Danish", price: 21.56 },
      { ar: "مفن الشوكوالته", en: "Chocolate Muffin", price: 19.90 },
      { ar: "مفن القهوة", en: "Coffee Muffin", price: 19.90 },
      { ar: "دونت بيكان", en: "Pecan Donut", price: 11.90 },
      { ar: "دونت نوتيلا", en: "Nutella Donut", price: 20.70 },
      { ar: "دونت كاسترد", en: "Custard Donut", price: 20.70 },
      { ar: "دونت نوتيلا وزعتر", en: "Nutella & Thyme Donut", price: 20.70 },
    ],
  },
  {
    idKey: "bread",
    ar: "الخبز",
    en: "Artisan Bread",
    descAr: "خبز حرفي يُعجن ويُخبز في المخبز كل صباح",
    descEn: "Artisan loaves kneaded and baked in-house every morning",
    dark: true,
    items: [
      { ar: "الباجيت الفرنسي", en: "French Baguette", price: 14 },
      { ar: "قالب خبز الساوردو", en: "Sourdough Loaf", price: 37, signature: true },
      { ar: "خبز السميط التركي", en: "Turkish Simit (3 pcs)", price: 14 },
      { ar: "خبز الشباتا الإيطالي", en: "Italian Ciabatta", price: 15 },
      { ar: "خبز البريوش الفرنسي", en: "French Brioche", price: 27 },
      { ar: "خبز الفوكاشيا", en: "Focaccia (3 pcs)", price: 16 },
      { ar: "خبز الكرواسون برد", en: "Croissant Bread", price: 20 },
    ],
  },
  {
    idKey: "desserts",
    ar: "الحلا",
    en: "Desserts",
    descAr: "حلويات فاخرة تُصنع بأجود الشوكولاتة والكريمة الفرنسية",
    descEn: "Decadent sweets crafted with premium chocolate and French cream",
    items: [
      { ar: "بي بي كيك", en: "B.B Signature Cake", price: 27.90, signature: true },
      { ar: "كيكة العسل", en: "Honey Cake", price: 27.90, signature: true },
      { ar: "ميني كيك العسل", en: "Mini Honey Cake", price: 52.99 },
      { ar: "كيكة الريد فلفت", en: "Red Velvet Cake", price: 27.90 },
      { ar: "كيكة موسم الصيف", en: "Summer Season Cake", price: 31.90 },
      { ar: "شوكلت كيك مع الآيسكريم", en: "Chocolate Cake & Ice Cream", price: 31.90 },
      { ar: "ماتيلدا تشوكليت", en: "Matilda Chocolate", price: 23 },
      { ar: "كراملتيو", en: "Caramelito", price: 27.90 },
      { ar: "كرنشي تشوكليت", en: "Crunchy Chocolate", price: 25 },
      { ar: "سان سيباستيان", en: "San Sebastian Cheesecake", price: 26.90 },
      { ar: "كريم بروليه تشيز كيك", en: "Crème Brûlée Cheesecake", price: 25 },
      { ar: "مدريد تشيز كيك فانيلا", en: "Madrid Vanilla Cheesecake", price: 37 },
      { ar: "روشيه", en: "Rocher", price: 34 },
      { ar: "كوكيز الشوكوالته", en: "Chocolate Cookies", price: 15.31 },
    ],
  },
  {
    idKey: "pizza",
    ar: "البتزا النابولية",
    en: "Neapolitan Pizza",
    descAr: "عجينة نابولية أصيلة تُفرد وتُشوى في فرن الحجر",
    descEn: "Authentic Neapolitan dough stretched thin and stone-baked",
    dark: true,
    items: [
      { ar: "مارجريتا", en: "Margherita", price: 55 },
      { ar: "سبشيال هوت تشكن", en: "Special Hot Chicken", price: 63 },
      { ar: "رانش الدجاج", en: "Ranch Chicken", price: 63 },
      { ar: "روكولا لوز", en: "Rucola & Almond", price: 53 },
      { ar: "ترافل", en: "Truffle", price: 69, signature: true },
      { ar: "بوراتا بالسميك", en: "Burrata & Balsamic", price: 65, signature: true },
      { ar: "كواترو فروماج", en: "Quattro Fromage", price: 63 },
    ],
  },
  {
    idKey: "gathering",
    ar: "طلبات المجموعات",
    en: "Gathering",
    descAr: "طقوس البتر بيكري للقاءات الخاصة وجلسات الأحبة",
    descEn: "Butter Bakery rituals for special gatherings and intimate moments",
    items: [
      { ar: "ماتيلدا كرواسون", en: "Matilda Croissant", price: 54, signature: true },
      { ar: "كيكة العسل مع القهوة", en: "Honey Cake & Coffee", price: 89, signature: true },
      { ar: "كرواسون مع القهوة", en: "Croissant & Coffee", price: 89, signature: true },
      { ar: "هوت شوكليت كلاسيك", en: "Classic Hot Chocolate", price: 33.35 },
    ],
  },
];

const SIGNATURE_PICKS = [
  { ar: "V60 بور أوفر", en: "V60 Pour-Over", price: 19, cat: "hot" },
  { ar: "كوكيز كرواسون", en: "Cookie Croissant", price: 27, cat: "pastries" },
  { ar: "بيض ترافل", en: "Truffle Eggs", price: 31.90, cat: "breakfast" },
  { ar: "بي بي كيك", en: "B.B Signature Cake", price: 27.90, cat: "desserts" },
  { ar: "ترافل بيتزا", en: "Truffle Pizza", price: 69, cat: "pizza" },
  { ar: "سبانش التيه", en: "Spanish Latte", price: 18.90, cat: "hot" },
  { ar: "كيكة العسل مع القهوة", en: "Honey Cake & Coffee", price: 89, cat: "gathering" },
];

export default function Menu() {
  const { lang, toggleLang, isAr } = useLang();
  const [activeId, setActiveId] = useState(MENU[0].idKey);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = isAr ? "القائمة — بتر بيكري" : "Menu — Butter Bakery";
  }, [isAr]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    MENU.forEach(({ idKey }) => {
      const el = sectionRefs.current[idKey];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(idKey); },
        { rootMargin: "-25% 0px -65% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (idKey: string) => {
    const el = sectionRefs.current[idKey];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-foreground" dir={isAr ? "rtl" : "ltr"}>

      {/* ─── Top bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-border/30">
        <div className="px-6 md:px-10 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group text-foreground/40 hover:text-primary transition-colors text-xs uppercase tracking-widest">
            <BackArrow className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <Link href="/" className="flex items-center gap-2.5 absolute left-1/2 -translate-x-1/2">
            <div className="w-8 h-8 overflow-hidden rounded-sm ring-1 ring-border/60">
              <img src={logoBb} alt="Butter Bakery" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-sm font-bold tracking-wider text-foreground/80 hidden sm:block">BUTTER BAKERY</span>
          </Link>
          <button onClick={toggleLang} className="text-[10px] font-medium tracking-widest px-3 py-1.5 border border-border/50 text-foreground/40 hover:border-primary hover:text-primary transition-all duration-300">
            {lang === "en" ? "عربي" : "EN"}
          </button>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-16 bg-dark-section text-background overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-0 container mx-auto px-6 md:px-10 pt-20 pb-0">
          <div className="pb-16">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.45em] mb-6">
                {isAr ? "بتر بيكري — القائمة الكاملة" : "Butter Bakery — Full Menu"}
              </p>
              <h1 className="font-serif text-7xl md:text-[9rem] font-medium text-white leading-none mb-6">
                {isAr ? "القائمة" : "Menu"}
              </h1>
              <p className="text-background/45 font-light text-sm max-w-xs leading-relaxed">
                {isAr
                  ? "كل ما في القائمة يُخبز ويُحضَّر يومياً بأيدي متخصصة ومواد خام مختارة"
                  : "Everything here is freshly prepared daily with specialist hands and carefully selected ingredients"}
              </p>
            </motion.div>
          </div>

          {/* Signature picks scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full md:w-auto pb-0 overflow-x-auto scrollbar-hide"
          >
            <div className="flex md:flex-col gap-px min-w-max md:min-w-0 border-t md:border-t-0 md:border-l border-white/10">
              <div className="px-6 py-3 md:py-2">
                <p className="text-[9px] uppercase tracking-[0.35em] text-white/25">
                  {isAr ? "اختيارات مميزة" : "Signature picks"}
                </p>
              </div>
              {SIGNATURE_PICKS.map((pick, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(pick.cat)}
                  className="flex items-center justify-between gap-8 px-6 py-2.5 md:py-3 hover:bg-white/5 transition-colors group text-left border-t border-white/5"
                >
                  <span className="text-xs text-white/60 group-hover:text-white transition-colors whitespace-nowrap">
                    {isAr ? pick.ar : pick.en}
                  </span>
                  <span className="font-serif text-sm text-primary/80 group-hover:text-primary transition-colors shrink-0">
                    {pick.price} <span className="text-[10px] text-white/20">SAR</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Main layout ─── */}
      <div className="flex min-h-screen">

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto border-e border-border/40 bg-[#faf8f5] py-8">
          <p className="px-6 text-[9px] uppercase tracking-[0.4em] text-foreground/25 mb-5">
            {isAr ? "الأقسام" : "Sections"}
          </p>
          <nav className="flex flex-col">
            {MENU.map((cat, i) => (
              <button
                key={cat.idKey}
                onClick={() => scrollTo(cat.idKey)}
                className={`group flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 border-e-2 ${
                  activeId === cat.idKey
                    ? "border-primary text-primary bg-primary/4"
                    : "border-transparent text-foreground/40 hover:text-foreground/70 hover:bg-foreground/3"
                }`}
              >
                <span className={`text-[10px] font-mono tabular-nums transition-colors ${activeId === cat.idKey ? "text-primary" : "text-foreground/20"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-medium tracking-wide">
                  {isAr ? cat.ar : cat.en}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">

          {/* Mobile category tabs */}
          <div className="lg:hidden sticky top-[57px] z-40 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-border/30 overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max px-4">
              {MENU.map((cat) => (
                <button
                  key={cat.idKey}
                  onClick={() => scrollTo(cat.idKey)}
                  className={`px-3.5 py-3.5 text-[10px] font-medium uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                    activeId === cat.idKey ? "border-primary text-primary" : "border-transparent text-foreground/35 hover:text-foreground/60"
                  }`}
                >
                  {isAr ? cat.ar : cat.en}
                </button>
              ))}
            </div>
          </div>

          {MENU.map((cat, catIdx) => (
            <section
              key={cat.idKey}
              id={cat.idKey}
              ref={(el) => { sectionRefs.current[cat.idKey] = el; }}
              className={cat.dark ? "bg-dark-section text-background" : "bg-[#faf8f5] text-foreground"}
            >
              {/* Category header */}
              <div className="relative overflow-hidden px-8 md:px-14 pt-16 pb-10">
                {/* Ghost number watermark */}
                <span className={`absolute -top-4 ${isAr ? "right-6" : "left-6"} font-serif text-[10rem] md:text-[14rem] font-bold leading-none select-none pointer-events-none ${cat.dark ? "text-white/3" : "text-foreground/4"}`}>
                  {String(catIdx + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <div>
                      <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-3">
                        {String(catIdx + 1).padStart(2, "0")} / {cat.en}
                      </p>
                      <h2 className="font-serif text-4xl md:text-5xl font-medium leading-none">
                        {isAr ? cat.ar : cat.en}
                      </h2>
                    </div>
                  </div>
                  <p className={`text-sm font-light mt-4 max-w-sm leading-relaxed ${cat.dark ? "text-background/40" : "text-foreground/40"}`}>
                    {isAr ? cat.descAr : cat.descEn}
                  </p>
                </div>
                <div className={`absolute bottom-0 left-8 right-8 h-px ${cat.dark ? "bg-white/8" : "bg-foreground/8"}`} />
              </div>

              {/* Items */}
              <div className="px-8 md:px-14 py-6 pb-14">
                <AnimatePresence>
                  <div className="divide-y divide-current/5" style={{ '--tw-divide-opacity': '0.06' } as React.CSSProperties}>
                    {cat.items.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isAr ? 12 : -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-5%" }}
                        transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                        className={`group flex items-center gap-4 py-4 transition-colors duration-200 ${
                          cat.dark ? "hover:bg-white/4" : "hover:bg-foreground/3"
                        } -mx-3 px-3 rounded-sm`}
                      >
                        {/* Signature dot */}
                        <div className="shrink-0 w-1.5 h-1.5">
                          {item.signature && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span className={`font-medium text-base leading-snug transition-colors group-hover:text-primary ${cat.dark ? "text-background/90" : "text-foreground/90"}`}>
                              {isAr ? item.ar : item.en}
                            </span>
                            <span className={`text-xs font-light ${cat.dark ? "text-background/30" : "text-foreground/30"}`}>
                              {isAr ? item.en : item.ar}
                            </span>
                            {item.note && (
                              <span className={`text-[10px] px-2 py-0.5 border rounded-full ${cat.dark ? "border-white/10 text-white/25" : "border-foreground/10 text-foreground/25"}`}>
                                {item.note}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Dotted leader */}
                        <div className={`hidden md:block flex-1 max-w-32 border-b border-dashed ${cat.dark ? "border-white/10" : "border-foreground/10"}`} />

                        {/* Price */}
                        <div className="shrink-0 text-right">
                          <span className="font-serif text-2xl font-medium text-primary">
                            {Number.isInteger(item.price) ? item.price : item.price.toFixed(2)}
                          </span>
                          <span className={`text-[10px] ms-1 ${cat.dark ? "text-background/25" : "text-foreground/25"}`}>
                            ر.س
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            </section>
          ))}

          {/* Footer note */}
          <div className="bg-dark-section py-12 text-center">
            <p className="text-background/25 text-[10px] uppercase tracking-[0.4em] mb-2">
              {isAr ? "جميع الأسعار بالريال السعودي · تشمل الضريبة" : "All prices in Saudi Riyals · VAT included"}
            </p>
            <p className="text-background/15 text-[9px] tracking-wider">
              {isAr ? "الأسعار قابلة للتغيير · قد تختلف الأصناف بين الفروع" : "Prices subject to change · Items may vary by branch"}
            </p>
            <div className="mt-8">
              <Link href="/" className="text-[10px] uppercase tracking-widest text-background/20 hover:text-primary transition-colors">
                {isAr ? "← الرئيسية" : "← Back to Home"}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
