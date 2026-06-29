import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  items: MenuItem[];
}

const MENU: MenuCategory[] = [
  {
    idKey: "hot",
    ar: "المشروبات الحارة",
    en: "Hot Drinks",
    descAr: "قهوة مختصة بحبوب كولومبية مختارة",
    descEn: "Specialty coffee with selected Colombian beans",
    items: [
      { ar: "اسبريسو", en: "Espresso", price: 11 },
      { ar: "أمريكانو", en: "Americano", price: 12 },
      { ar: "كوفي داي", en: "Coffee Day", price: 12.73, note: "Colombian" },
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
    descAr: "مشروبات طازجة منعشة",
    descEn: "Refreshing beverages made fresh daily",
    items: [
      { ar: "أيس أمريكانو", en: "Iced Americano", price: 17.91 },
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
    descAr: "وجبات مُعدّة بعناية تستحق لحظة هدوء",
    descEn: "Thoughtfully crafted plates worth savouring",
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
    descAr: "خضروات طازجة بتوليفات متوسطية",
    descEn: "Fresh greens in Mediterranean blends",
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
    descAr: "معجنات تُخبز يومياً بزبدة فرنسية",
    descEn: "Baked fresh daily with French butter",
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
      { ar: "دانش شمر تشيز", en: "Fennel Cheese Danish", price: 21.56 },
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
    descEn: "Kneaded and baked in-house every morning",
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
    descAr: "حلويات فاخرة بأجود الشوكولاتة والكريمة الفرنسية",
    descEn: "Indulgent sweets crafted with premium chocolate and cream",
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
    descAr: "عجينة نابولية أصيلة تُشوى في فرن الحجر",
    descEn: "Authentic dough stretched thin and stone-baked",
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
    descAr: "طقوس بتر بيكري للقاءات الخاصة وجلسات الأحبة",
    descEn: "Butter Bakery rituals for special gatherings",
    items: [
      { ar: "ماتيلدا كرواسون", en: "Matilda Croissant", price: 54, signature: true },
      { ar: "كيكة العسل مع القهوة", en: "Honey Cake & Coffee", price: 89, signature: true },
      { ar: "كرواسون مع القهوة", en: "Croissant & Coffee", price: 89, signature: true },
      { ar: "هوت شوكليت كلاسيك", en: "Classic Hot Chocolate", price: 33.35 },
    ],
  },
];

function ItemRow({ item, isAr, isLast }: { item: MenuItem; isAr: boolean; isLast: boolean }) {
  const price = Number.isInteger(item.price) ? `${item.price}` : item.price.toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-4%" }}
      transition={{ duration: 0.35 }}
      className={`group flex items-center gap-3 py-4 ${!isLast ? "border-b border-[#e8e3db]" : ""}`}
    >
      {/* Signature dot */}
      <div className="shrink-0 w-4 flex justify-center">
        {item.signature && (
          <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
        )}
      </div>

      {/* Name block */}
      <div className="flex-1 min-w-0">
        <div className={`flex items-baseline gap-2.5 ${isAr ? "flex-row" : "flex-row"}`}>
          <span className="text-[15px] font-medium text-[#1a1009] group-hover:text-primary transition-colors duration-200 leading-snug">
            {isAr ? item.ar : item.en}
          </span>
          <span className="text-xs text-[#b5a898] font-light shrink-0">
            {isAr ? item.en : item.ar}
          </span>
          {item.note && (
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/8 text-primary/70 rounded font-light shrink-0">
              {item.note}
            </span>
          )}
        </div>
      </div>

      {/* Leader */}
      <div className="hidden sm:block flex-1 max-w-24 border-b border-dotted border-[#d5cec5]" />

      {/* Price */}
      <div className="shrink-0 flex items-baseline gap-1 tabular-nums">
        <span className="font-serif text-[22px] font-medium text-primary leading-none">{price}</span>
        <span className="text-[10px] text-[#b5a898]">ر.س</span>
      </div>
    </motion.div>
  );
}

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
        { rootMargin: "-20% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (idKey: string) => {
    const el = sectionRefs.current[idKey];
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen" style={{ background: "#faf9f7", color: "#1a1009" }} dir={isAr ? "rtl" : "ltr"}>

      {/* ── Top bar ── */}
      <header style={{ background: "rgba(250,249,247,0.96)" }} className="fixed top-0 inset-x-0 z-50 backdrop-blur-sm border-b border-[#ebe5dc]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#9e8f82] hover:text-primary transition-colors duration-200">
            <BackArrow className="w-3.5 h-3.5" />
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <Link href="/" className="flex items-center gap-2.5 absolute left-1/2 -translate-x-1/2">
            <img src={logoBb} alt="Butter Bakery" className="w-8 h-8 object-cover rounded-sm" />
            <span className="font-serif text-[13px] font-semibold tracking-widest text-[#2d1a0e] hidden sm:block">BUTTER BAKERY</span>
          </Link>
          <button onClick={toggleLang} className="text-[10px] font-medium tracking-widest px-3 py-1.5 border border-[#d5cec5] text-[#9e8f82] hover:border-primary hover:text-primary transition-all duration-300 rounded-sm">
            {lang === "en" ? "عربي" : "EN"}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-14 bg-[#2d1a0e] text-white relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(184,95,30,0.12) 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: "easeOut" }}>
            <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.45em] mb-8">
              {isAr ? "بتر بيكري — القائمة الكاملة" : "Butter Bakery — Full Menu"}
            </p>
            <h1 className="font-serif font-medium leading-none mb-8" style={{ fontSize: "clamp(64px, 12vw, 144px)" }}>
              {isAr ? "القائمة" : "Menu"}
            </h1>
            <div className="flex flex-wrap gap-6 items-center">
              <p className="text-white/40 text-sm font-light max-w-xs leading-relaxed">
                {isAr
                  ? "يُخبز ويُحضَّر يومياً بأيدي متخصصة ومواد خام مختارة"
                  : "Freshly prepared daily with specialist hands and selected ingredients"}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-white/20 uppercase tracking-[0.25em]">
                <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                {isAr ? "النقطة الذهبية = صنف مميز" : "Gold dot = Signature item"}
              </div>
            </div>
          </motion.div>
        </div>
        {/* Wave bottom */}
        <div className="h-10 bg-[#faf9f7]" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto flex gap-0 pt-6 pb-24">

        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-20 py-4">
            <p className="px-6 text-[9px] uppercase tracking-[0.4em] text-[#c0b5a8] mb-4">
              {isAr ? "الأقسام" : "Sections"}
            </p>
            <nav>
              {MENU.map((cat, i) => (
                <button
                  key={cat.idKey}
                  onClick={() => scrollTo(cat.idKey)}
                  className={`w-full flex items-center gap-3 px-6 py-2.5 text-left transition-all duration-200 group ${
                    activeId === cat.idKey ? "text-primary" : "text-[#9e8f82] hover:text-[#4a3020]"
                  }`}
                >
                  <span className={`text-[10px] font-mono tabular-nums transition-colors ${activeId === cat.idKey ? "text-primary" : "text-[#c0b5a8] group-hover:text-[#9e8f82]"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`text-xs font-medium tracking-wide border-b transition-all duration-200 ${activeId === cat.idKey ? "border-primary pb-0.5" : "border-transparent"}`}>
                    {isAr ? cat.ar : cat.en}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-[#ebe5dc] mx-0 shrink-0 self-stretch" />

        {/* Content */}
        <main className="flex-1 min-w-0 px-0 lg:ps-12 lg:pe-4">

          {/* Mobile tabs */}
          <div className="lg:hidden sticky top-14 z-40 -mx-6 px-4 bg-[#faf9f7]/96 backdrop-blur-sm border-b border-[#ebe5dc] overflow-x-auto scrollbar-hide mb-8">
            <div className="flex min-w-max">
              {MENU.map((cat) => (
                <button
                  key={cat.idKey}
                  onClick={() => scrollTo(cat.idKey)}
                  className={`px-3 py-3.5 text-[10px] font-medium uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                    activeId === cat.idKey ? "border-primary text-primary" : "border-transparent text-[#9e8f82]"
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
              className="mb-20"
            >
              {/* Category header */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-px flex-1 bg-[#ebe5dc]" />
                  <span className="text-[10px] font-mono text-[#c0b5a8] uppercase tracking-[0.3em]">
                    {String(catIdx + 1).padStart(2, "0")}
                  </span>
                  <div className="h-px w-6 bg-primary/40" />
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-medium text-[#2d1a0e] leading-none mb-3">
                  {isAr ? cat.ar : cat.en}
                </h2>
                {isAr && (
                  <p className="text-[12px] text-[#c0b5a8] tracking-wider mb-1">{cat.en}</p>
                )}
                <p className="text-sm text-[#9e8f82] font-light mt-2">
                  {isAr ? cat.descAr : cat.descEn}
                </p>
              </motion.div>

              {/* Items — 2 columns on wide screens */}
              <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-16">
                {cat.items.map((item, i) => {
                  const col = Math.floor(i / Math.ceil(cat.items.length / 2));
                  const isInFirstCol = col === 0;
                  const isLastInCol = i === Math.ceil(cat.items.length / 2) - 1 ||
                    i === cat.items.length - 1;
                  return (
                    <ItemRow
                      key={i}
                      item={item}
                      isAr={isAr}
                      isLast={isLastInCol || i === cat.items.length - 1}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </main>
      </div>

      {/* ── Footer ── */}
      <div className="bg-[#2d1a0e] py-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12 bg-white/10" />
          <img src={logoBb} alt="" className="w-6 h-6 rounded-sm opacity-40" />
          <div className="h-px w-12 bg-white/10" />
        </div>
        <p className="text-white/25 text-[10px] uppercase tracking-[0.4em] mb-2">
          {isAr ? "جميع الأسعار بالريال السعودي · تشمل الضريبة" : "All prices in Saudi Riyals · VAT included"}
        </p>
        <p className="text-white/15 text-[9px] tracking-wider mb-8">
          {isAr ? "الأسعار قابلة للتغيير · قد تختلف الأصناف بين الفروع" : "Prices subject to change · Items may vary by branch"}
        </p>
        <Link href="/" className="text-[10px] uppercase tracking-widest text-white/20 hover:text-primary transition-colors duration-300">
          {isAr ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}
