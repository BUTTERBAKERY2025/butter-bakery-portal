import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import logoBb from "@/assets/real/logo-bb.jpg";
import doodleBread from "@/assets/real/doodle-bread.png";
import doodleCoffee from "@/assets/real/doodle-coffee.png";

// ─── Data ────────────────────────────────────────────────────────────────────

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
  items: MenuItem[];
}

const MENU: MenuCategory[] = [
  {
    idKey: "hot", ar: "المشروبات الحارة", en: "Hot Drinks",
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
    idKey: "cold", ar: "المشروبات الباردة", en: "Cold Drinks",
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
    idKey: "breakfast", ar: "الإفطار", en: "Breakfast",
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
    idKey: "salads", ar: "السلطات", en: "Salads",
    items: [
      { ar: "سلطة شمندر", en: "Beetroot Salad", price: 16 },
      { ar: "سلطة باربكيو الحلومي", en: "Halloumi BBQ Salad", price: 35, signature: true },
      { ar: "سلطة دجاج", en: "Chicken Salad", price: 19 },
    ],
  },
  {
    idKey: "pastries", ar: "المخبوزات", en: "Pastries",
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
    idKey: "bread", ar: "الخبز", en: "Artisan Bread",
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
    idKey: "desserts", ar: "الحلا", en: "Desserts",
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
    idKey: "pizza", ar: "البتزا النابولية", en: "Neapolitan Pizza",
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
    idKey: "gathering", ar: "طلبات المجموعات", en: "Gathering",
    items: [
      { ar: "ماتيلدا كرواسون", en: "Matilda Croissant", price: 54, signature: true },
      { ar: "كيكة العسل مع القهوة", en: "Honey Cake & Coffee", price: 89, signature: true },
      { ar: "كرواسون مع القهوة", en: "Croissant & Coffee", price: 89, signature: true },
      { ar: "هوت شوكليت كلاسيك", en: "Classic Hot Chocolate", price: 33.35 },
    ],
  },
];

// First 4 categories before the mid-doodle break, last 5 after
const MENU_FIRST = MENU.slice(0, 4);
const MENU_SECOND = MENU.slice(4);

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item, isAr }: { item: MenuItem; isAr: boolean }) {
  const price = Number.isInteger(item.price) ? `${item.price}` : item.price.toFixed(2);
  return (
    <div className="group flex items-center gap-3 py-[11px] border-b border-[#ede8e0] last:border-0 hover:bg-[#f7f3ee] -mx-2 px-2 rounded transition-colors duration-150">
      {/* Signature dot */}
      <div className="shrink-0 w-3 flex justify-center">
        {item.signature && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
      </div>
      {/* Name */}
      <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
        <span className="text-[13.5px] font-light text-[#1c110a] group-hover:text-primary transition-colors duration-150 leading-snug">
          {isAr ? item.ar : item.en}
        </span>
        <span className="text-[11px] text-[#c4b8ac] font-light">
          {isAr ? item.en : item.ar}
        </span>
        {item.note && (
          <span className="text-[9px] px-1.5 py-0.5 border border-primary/20 text-primary/60 rounded-sm">
            {item.note}
          </span>
        )}
      </div>
      {/* Leader */}
      <div className="hidden sm:block shrink-0 w-16 border-b border-dotted border-[#d8d1c8]" />
      {/* Price */}
      <div className="shrink-0 flex items-baseline gap-0.5 tabular-nums">
        <span className="font-serif text-[19px] font-normal text-primary leading-none">{price}</span>
        <span className="text-[9px] text-[#c4b8ac] ms-0.5">ر.س</span>
      </div>
    </div>
  );
}

// ─── Category Block ───────────────────────────────────────────────────────────

function CategoryBlock({
  cat, catIdx, sectionRefs, isAr,
}: {
  cat: MenuCategory;
  catIdx: number;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  isAr: boolean;
}) {
  return (
    <section
      key={cat.idKey}
      id={cat.idKey}
      ref={(el) => { sectionRefs.current[cat.idKey] = el; }}
      className="mb-14"
    >
      {/* Thin category header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 mb-5"
      >
        <span className="text-[9px] font-mono text-[#ccc3b8] tracking-[0.3em]">
          {String(catIdx + 1).padStart(2, "0")}
        </span>
        <div className="h-px flex-1 bg-[#ede8e0]" />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6b5244]">
          {isAr ? cat.ar : cat.en}
        </h2>
        <div className="h-px w-6 bg-primary/30" />
      </motion.div>

      {/* Items */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        {cat.items.map((item, i) => (
          <ItemRow key={i} item={item} isAr={isAr} />
        ))}
      </motion.div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" });
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen" style={{ background: "#faf9f7", color: "#1c110a" }} dir={isAr ? "rtl" : "ltr"}>

      {/* ── Nav ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-sm border-b border-[#ede8e0]"
        style={{ background: "rgba(250,249,247,0.97)" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[#a09080] hover:text-primary transition-colors">
            <BackArrow className="w-3 h-3" />
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <img src={logoBb} alt="Butter Bakery" className="w-7 h-7 object-cover rounded-sm" />
            <span className="font-serif text-[12px] font-semibold tracking-widest text-[#2d1a0e] hidden sm:block">BUTTER BAKERY</span>
          </Link>
          <button
            onClick={toggleLang}
            className="text-[9px] font-medium tracking-widest px-2.5 py-1 border border-[#d8d1c8] text-[#a09080] hover:border-primary hover:text-primary transition-all rounded-sm"
          >
            {lang === "en" ? "عربي" : "EN"}
          </button>
        </div>
      </header>

      {/* ── Hero — slim ── */}
      <section
        className="pt-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #7A2E08 0%, #B84D18 55%, #C86020 100%)" }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 90% 50%, rgba(255,150,40,0.14) 0%, transparent 65%)" }} />
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-0 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-white/40 text-[9px] uppercase tracking-[0.5em] mb-4">
              {isAr ? "بتر بيكري — القائمة الكاملة" : "Butter Bakery — Full Menu"}
            </p>
            <h1 className="font-serif font-medium text-white leading-none mb-4" style={{ fontSize: "clamp(52px, 9vw, 112px)" }}>
              {isAr ? "القائمة" : "Menu"}
            </h1>
            <p className="text-white/35 text-[12px] font-light">
              {isAr ? "يُخبز ويُحضَّر يومياً" : "Freshly baked and prepared daily"}
            </p>
          </motion.div>
        </div>
        {/* Wave */}
        <div className="h-10 mt-8" style={{ background: "#faf9f7", clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      {/* ── Bread doodle ── */}
      <div className="bg-[#faf9f7] -mt-1">
        <motion.img
          src={doodleBread}
          alt=""
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-3xl mx-auto block"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto flex gap-0 pt-2 pb-20 px-4 md:px-6">

        {/* Sidebar */}
        <aside className="hidden md:block w-40 shrink-0">
          <div className="sticky top-16 pt-6">
            <p className="text-[8px] uppercase tracking-[0.4em] text-[#c8bfb5] mb-3 ps-4">
              {isAr ? "الأقسام" : "Sections"}
            </p>
            <nav className="flex flex-col">
              {MENU.map((cat, i) => (
                <button
                  key={cat.idKey}
                  onClick={() => scrollTo(cat.idKey)}
                  className={`flex items-center gap-2 ps-4 pe-2 py-2 text-left transition-all duration-150 group border-s-2 ${
                    activeId === cat.idKey
                      ? "border-primary text-primary"
                      : "border-transparent text-[#a09080] hover:text-[#3a2010] hover:border-[#d8d1c8]"
                  }`}
                >
                  <span className={`text-[9px] font-mono tabular-nums shrink-0 ${activeId === cat.idKey ? "text-primary" : "text-[#ccc3b8]"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] font-light leading-tight">
                    {isAr ? cat.ar : cat.en}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Divider */}
        <div className="hidden md:block w-px bg-[#ede8e0] mx-0 self-stretch shrink-0" />

        {/* Main content */}
        <main className="flex-1 min-w-0 md:ps-10">

          {/* Mobile tabs */}
          <div className="md:hidden sticky top-12 z-40 -mx-4 px-3 bg-[#faf9f7]/96 backdrop-blur-sm border-b border-[#ede8e0] overflow-x-auto scrollbar-hide mb-6">
            <div className="flex min-w-max">
              {MENU.map((cat) => (
                <button
                  key={cat.idKey}
                  onClick={() => scrollTo(cat.idKey)}
                  className={`px-3 py-3 text-[9px] font-medium uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                    activeId === cat.idKey ? "border-primary text-primary" : "border-transparent text-[#a09080]"
                  }`}
                >
                  {isAr ? cat.ar : cat.en}
                </button>
              ))}
            </div>
          </div>

          {/* First half: Hot, Cold, Breakfast, Salads */}
          <div className="pt-6">
            {MENU_FIRST.map((cat, i) => (
              <CategoryBlock key={cat.idKey} cat={cat} catIdx={i} sectionRefs={sectionRefs} isAr={isAr} />
            ))}
          </div>

          {/* ── Coffee doodle divider ── */}
          <div className="my-8 -mx-4 md:-mx-10">
            <img
              src={doodleCoffee}
              alt=""
              aria-hidden
              className="w-full block"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          {/* Second half: Pastries, Bread, Desserts, Pizza, Gathering */}
          <div>
            {MENU_SECOND.map((cat, i) => (
              <CategoryBlock key={cat.idKey} cat={cat} catIdx={i + MENU_FIRST.length} sectionRefs={sectionRefs} isAr={isAr} />
            ))}
          </div>
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[#ede8e0] py-10 text-center bg-[#faf9f7]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-[#d8d1c8]" />
          <img src={logoBb} alt="" className="w-5 h-5 rounded-sm opacity-50" />
          <div className="h-px w-8 bg-[#d8d1c8]" />
        </div>
        <p className="text-[9px] uppercase tracking-[0.4em] text-[#b5a898] mb-1.5">
          {isAr ? "جميع الأسعار بالريال السعودي · تشمل الضريبة" : "All prices in Saudi Riyals · VAT included"}
        </p>
        <p className="text-[8px] text-[#ccc3b8] tracking-wider mb-6">
          {isAr ? "الأسعار قابلة للتغيير · قد تختلف الأصناف بين الفروع" : "Prices subject to change · Items may vary by branch"}
        </p>
        <Link href="/" className="text-[9px] uppercase tracking-widest text-[#b5a898] hover:text-primary transition-colors">
          {isAr ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </footer>
    </div>
  );
}
