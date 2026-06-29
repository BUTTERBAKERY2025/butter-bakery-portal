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
  tags?: string[];
}

interface MenuCategory {
  idKey: string;
  ar: string;
  en: string;
  emoji: string;
  items: MenuItem[];
}

const MENU: MenuCategory[] = [
  {
    idKey: "hot",
    ar: "المشروبات الحارة",
    en: "Hot Drinks",
    emoji: "☕",
    items: [
      { ar: "اسبريسو", en: "Espresso", price: 11.00 },
      { ar: "كوفي داي", en: "Coffee Day", price: 12.73, tags: ["كولومبيا"] },
      { ar: "أمريكانو", en: "Americano", price: 12.00 },
      { ar: "V60", en: "V60 Pour-Over", price: 19.00 },
      { ar: "التيه", en: "Latte", price: 16.00 },
      { ar: "فلت وايت", en: "Flat White", price: 15.90 },
      { ar: "كابتشينو", en: "Cappuccino", price: 17.90 },
      { ar: "كورتادو", en: "Cortado", price: 15.05 },
      { ar: "سبانش التيه", en: "Spanish Latte", price: 18.90 },
      { ar: "ماكياتو", en: "Macchiato", price: 15.05 },
      { ar: "هوت شوكليت", en: "Hot Chocolate", price: 18.90 },
      { ar: "شاي إنجليزي", en: "English Tea", price: 7.00 },
      { ar: "شاي أخضر", en: "Green Tea", price: 7.00 },
    ],
  },
  {
    idKey: "cold",
    ar: "المشروبات الباردة",
    en: "Cold Drinks",
    emoji: "🧊",
    items: [
      { ar: "سبشيال أيس أمريكانو", en: "Special Iced Americano", price: 17.91 },
      { ar: "أيس V60", en: "Ice V60", price: 21.00 },
      { ar: "أيس V60 توت أحمر", en: "Ice V60 & Raspberry", price: 22.00 },
      { ar: "مشروب الصيف", en: "Summer Drink", price: 21.99 },
      { ar: "بريز ليمون", en: "Breeze Lemon", price: 22.46 },
      { ar: "بي بي سمر بريز", en: "BB Summer Breeze (Passion Fruit)", price: 22.46 },
      { ar: "عصير برتقال طازج", en: "Fresh Orange Juice", price: 17.27 },
      { ar: "بريز توت أزرق", en: "Breeze Blueberry", price: 22.46 },
      { ar: "بريز مكس بيري", en: "Breeze Mix Berries", price: 22.31 },
      { ar: "بريز فراولة", en: "Breeze Strawberry", price: 22.59 },
      { ar: "شاي مثلج", en: "Peach Iced Tea", price: 21.95 },
      { ar: "كركديه", en: "Hibiscus (Karkadeh)", price: 19.71 },
      { ar: "ماتشا", en: "Matcha", price: 22.05 },
    ],
  },
  {
    idKey: "breakfast",
    ar: "الإفطار",
    en: "Breakfast",
    emoji: "🍳",
    items: [
      { ar: "جرانوال", en: "Granola Bowl", price: 33.00, tags: ["شوفان", "ألبان"] },
      { ar: "اسكرمبل البيض والأفوكادو", en: "Scrambled Eggs & Avocado", price: 37.00, tags: ["بيض", "جلوتن"] },
      { ar: "أميريكان إيغ", en: "American Egg", price: 31.90, tags: ["بيض", "جلوتن"] },
      { ar: "أومليت فرنسي", en: "French Omelette", price: 39.00, tags: ["بيض"] },
      { ar: "بيض ترافل", en: "Truffle Eggs", price: 31.90, tags: ["بيض"] },
      { ar: "بروسكيتا البيض", en: "Egg Bruschetta", price: 25.00, tags: ["بيض", "ألبان", "جلوتن"] },
      { ar: "كرواسون بيض وجبنة", en: "Egg & Cheese Croissant", price: 27.90, tags: ["بيض", "ألبان", "جلوتن"] },
      { ar: "كرواسون السيغنتشر", en: "Signature Croissant", price: 25.00, tags: ["جلوتن"] },
      { ar: "فرنش توست", en: "French Toast", price: 27.00, tags: ["بيض", "ألبان", "جلوتن"] },
      { ar: "حلومي ساندوش", en: "Halloumi Sandwich", price: 29.00, tags: ["ألبان", "جلوتن"] },
      { ar: "بانيني تركي مدخن", en: "Smoked Turkey Panini", price: 23.90, tags: ["جلوتن"] },
      { ar: "بانيني روستد بيف", en: "Roasted Beef Panini", price: 23.90, tags: ["جلوتن"] },
      { ar: "ساندويتش التونة البنية", en: "Brown Tuna Sandwich", price: 26.00, tags: ["سمك", "جلوتن"] },
      { ar: "بريوش بريزاولا", en: "Brioche Bresaola", price: 23.00, tags: ["ألبان", "جلوتن"] },
      { ar: "رويال بينديكت", en: "Royal Benedict", price: 36.90, tags: ["سمك", "ألبان", "جلوتن"] },
      { ar: "شكشوكة إيطالي", en: "Italian Shakshuka", price: 36.00, tags: ["بيض", "ألبان", "جلوتن"] },
      { ar: "ساندويتش البيض اليوناني", en: "Greek Egg Sandwich", price: 24.00, tags: ["بيض", "جلوتن"] },
      { ar: "ديب السبانخ مع الدجاج", en: "Spinach & Chicken Dip", price: 34.00, tags: ["ألبان", "جلوتن"] },
      { ar: "كرواسون التونة", en: "Tuna Croissant", price: 25.00, tags: ["سمك", "جلوتن"] },
    ],
  },
  {
    idKey: "salads",
    ar: "السلطات",
    en: "Salads",
    emoji: "🥗",
    items: [
      { ar: "سلطة شمندر", en: "Beetroot Salad", price: 16.00, tags: ["ألبان", "جلوتن"] },
      { ar: "سلطة باربكيو الحلومي", en: "Halloumi BBQ Salad", price: 35.00, tags: ["ألبان"] },
      { ar: "سلطة دجاج", en: "Chicken Salad", price: 19.00 },
    ],
  },
  {
    idKey: "pastries",
    ar: "المخبوزات",
    en: "Pastries",
    emoji: "🥐",
    items: [
      { ar: "كرواسون سادة", en: "Plain Croissant", price: 17.00, tags: ["بيض", "ألبان", "جلوتن"] },
      { ar: "كرواسون شوكوالته", en: "Chocolate Croissant", price: 22.00, tags: ["شوكولاته", "بيض", "ألبان", "جلوتن"] },
      { ar: "كرواسون اللوز", en: "Almond Croissant", price: 19.00, tags: ["مكسرات", "بيض", "ألبان", "جلوتن"] },
      { ar: "كرواسون بيكان", en: "Pecan Croissant", price: 24.00, tags: ["مكسرات", "بيض", "ألبان", "جلوتن"] },
      { ar: "كوكيز كرواسون", en: "Cookie Croissant", price: 27.00, tags: ["مكسرات", "بيض", "ألبان", "جلوتن"] },
      { ar: "كرواسون جبنة بارميزان", en: "Parmesan Croissant", price: 21.00, tags: ["ألبان", "بيض", "جلوتن"] },
      { ar: "لندن بن تشيز كيك", en: "London Bun Cheesecake", price: 27.00, tags: ["مكسرات", "بيض", "ألبان", "جلوتن"] },
      { ar: "بان سويس", en: "Swiss Bun", price: 23.00, tags: ["بيض", "ألبان", "جلوتن"] },
      { ar: "دانش كريمة فرنسية", en: "French Cream Danish", price: 27.00, tags: ["بيض", "ألبان", "جلوتن"] },
      { ar: "دانش التيني", en: "Fig Danish", price: 26.00, tags: ["بيض", "ألبان", "جلوتن"] },
      { ar: "دانش بيستو", en: "Pesto Danish", price: 21.56, tags: ["مكسرات", "بيض", "ألبان", "جلوتن"] },
      { ar: "دانش شمر تشيز وطماطم مجففة", en: "Fennel Cheese & Sun-Dried Tomato Danish", price: 21.56, tags: ["ألبان", "بيض", "جلوتن"] },
      { ar: "مفن الشوكوالته", en: "Chocolate Muffin", price: 19.90, tags: ["شوكولاته", "بيض", "ألبان", "جلوتن"] },
      { ar: "مفن القهوة", en: "Coffee Muffin", price: 19.90, tags: ["بيض", "ألبان", "جلوتن"] },
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
    emoji: "🍞",
    items: [
      { ar: "الباجيت الفرنسي", en: "French Baguette", price: 14.00, tags: ["جلوتن"] },
      { ar: "قالب خبز الساوردو", en: "Sourdough Loaf", price: 37.00, tags: ["جلوتن"] },
      { ar: "خبز السميط التركي", en: "Turkish Simit (3 pcs)", price: 14.00, tags: ["سمسم", "جلوتن"] },
      { ar: "خبز الشباتا الإيطالي", en: "Italian Ciabatta", price: 15.00, tags: ["جلوتن"] },
      { ar: "خبز البريوش الفرنسي", en: "French Brioche", price: 27.00, tags: ["ألبان", "جلوتن"] },
      { ar: "خبز الفوكاشيا", en: "Focaccia (3 pcs)", price: 16.00, tags: ["جلوتن"] },
      { ar: "خبز الكرواسون برد", en: "Croissant Bread", price: 20.00, tags: ["سمسم", "جلوتن"] },
    ],
  },
  {
    idKey: "desserts",
    ar: "الحلا",
    en: "Desserts",
    emoji: "🎂",
    items: [
      { ar: "بي بي كيك", en: "B.B Signature Cake", price: 27.90, tags: ["مكسرات", "شوكولاته", "ألبان", "جلوتن"] },
      { ar: "كيكة العسل", en: "Honey Cake", price: 27.90, tags: ["ألبان", "جلوتن"] },
      { ar: "ميني كيك العسل", en: "Mini Honey Cake", price: 52.99 },
      { ar: "كيكة الريد فلفت", en: "Red Velvet Cake", price: 27.90, tags: ["بيض", "ألبان", "جلوتن"] },
      { ar: "كيكة موسم الصيف", en: "Summer Season Cake", price: 31.90 },
      { ar: "شوكلت كيك مع الآيسكريم", en: "Chocolate Cake & Ice Cream", price: 31.90 },
      { ar: "ماتيلدا تشوكليت", en: "Matilda Chocolate", price: 23.00 },
      { ar: "كراملتيو", en: "Caramelito", price: 27.90 },
      { ar: "كرنشي تشوكليت", en: "Crunchy Chocolate", price: 25.00 },
      { ar: "سان سيباستيان", en: "San Sebastian Cheesecake", price: 26.90, tags: ["ألبان", "جلوتن"] },
      { ar: "كريم بروليه تشيز كيك", en: "Crème Brûlée Cheesecake", price: 25.00, tags: ["بيض", "ألبان"] },
      { ar: "مدريد تشيز كيك فانيلا", en: "Madrid Vanilla Cheesecake", price: 37.00 },
      { ar: "روشيه", en: "Rocher", price: 34.00, tags: ["شوكولاته", "جلوتن"] },
      { ar: "كوكيز الشوكوالته", en: "Chocolate Cookies", price: 15.31, tags: ["مكسرات", "بيض"] },
    ],
  },
  {
    idKey: "pizza",
    ar: "البتزا النابولية",
    en: "Neapolitan Pizza",
    emoji: "🍕",
    items: [
      { ar: "مارجريتا", en: "Margherita", price: 55.00, tags: ["ألبان", "جلوتن"] },
      { ar: "سبشيال هوت تشكن", en: "Special Hot Chicken", price: 63.00, tags: ["ألبان", "جلوتن"] },
      { ar: "بيتزا الرانش مع الدجاج", en: "Ranch Chicken Pizza", price: 63.00, tags: ["ألبان", "جلوتن"] },
      { ar: "روكولا لوز", en: "Rucola & Almond", price: 53.00, tags: ["مكسرات", "ألبان", "جلوتن"] },
      { ar: "ترافل", en: "Truffle Pizza", price: 69.00, tags: ["فطر", "ألبان", "جلوتن"] },
      { ar: "بوراتا بالسميك", en: "Burrata & Balsamic", price: 65.00, tags: ["ألبان", "جلوتن"] },
      { ar: "كواترو فروماج", en: "Quattro Fromage", price: 63.00, tags: ["ألبان", "جلوتن"] },
    ],
  },
  {
    idKey: "gathering",
    ar: "طلبات المجموعات",
    en: "Gathering",
    emoji: "🤝",
    items: [
      { ar: "ماتيلدا كرواسون", en: "Matilda Croissant", price: 54.00 },
      { ar: "كيكة العسل مع القهوة", en: "Honey Cake & Coffee", price: 89.00 },
      { ar: "كرواسون مع القهوة", en: "Croissant & Coffee", price: 89.00 },
      { ar: "هوت شوكليت كلاسيك", en: "Classic Hot Chocolate", price: 33.35 },
    ],
  },
];

export default function Menu() {
  const { t, lang, toggleLang, isAr } = useLang();
  const [activeId, setActiveId] = useState(MENU[0].idKey);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

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
        { rootMargin: "-30% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (idKey: string) => {
    const el = sectionRefs.current[idKey];
    if (!el) return;
    const offset = 130;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isAr ? "rtl" : "ltr"}>

      {/* Fixed top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/97 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6 md:px-12 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group text-foreground/50 hover:text-primary transition-colors text-sm">
            <BackArrow className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="tracking-wide hidden sm:block">{isAr ? "الرئيسية" : "Home"}</span>
          </Link>
          <Link href="/" className="flex items-center gap-2.5 absolute left-1/2 -translate-x-1/2">
            <div className="w-8 h-8 overflow-hidden rounded-sm ring-1 ring-border">
              <img src={logoBb} alt="Butter Bakery" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-sm font-bold tracking-wider text-foreground hidden sm:block">BUTTER BAKERY</span>
          </Link>
          <button
            onClick={toggleLang}
            className="text-xs font-medium tracking-widest px-3 py-2 border border-border text-foreground/50 hover:border-primary hover:text-primary transition-all duration-300"
          >
            {lang === "en" ? "عربي" : "EN"}
          </button>
        </div>

        {/* Sticky category tabs */}
        <div ref={navRef} className="border-t border-border/40 bg-background/97 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max px-6 md:px-12">
            {MENU.map((cat) => (
              <button
                key={cat.idKey}
                onClick={() => scrollTo(cat.idKey)}
                className={`px-4 py-3 text-xs font-medium uppercase tracking-widest whitespace-nowrap transition-all duration-300 border-b-2 ${
                  activeId === cat.idKey
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/40 hover:text-foreground/70"
                }`}
              >
                <span className="mr-1.5">{cat.emoji}</span>
                {isAr ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-16 bg-dark-section text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.4em] mb-5">
              {isAr ? "بتر بيكري — القائمة" : "Butter Bakery — Menu"}
            </p>
            <h1 className="font-serif text-6xl md:text-8xl font-medium text-white mb-5 leading-none">
              {isAr ? "القائمة" : "Menu"}
            </h1>
            <p className="text-background/50 font-light text-sm max-w-md">
              {isAr
                ? "كل ما في القائمة يُخبز ويُحضَّر يومياً بأيدي متخصصة وبمواد خام مختارة."
                : "Everything on our menu is freshly prepared daily by specialist hands using carefully selected ingredients."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu sections */}
      <main className="container mx-auto px-6 md:px-12 py-16 space-y-24">
        {MENU.map((cat, catIdx) => (
          <section
            key={cat.idKey}
            id={cat.idKey}
            ref={(el) => { sectionRefs.current[cat.idKey] = el; }}
          >
            {/* Category header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6 }}
              className="flex items-end gap-6 mb-10 pb-6 border-b border-border/50"
            >
              <div>
                <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.4em] mb-2">
                  {String(catIdx + 1).padStart(2, "0")}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                  {isAr ? cat.ar : cat.en}
                </h2>
                {isAr && (
                  <p className="text-foreground/30 text-sm mt-1 tracking-wider">{cat.en}</p>
                )}
              </div>
            </motion.div>

            {/* Items grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30">
              {cat.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-5%" }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                  className="bg-background p-6 group hover:bg-secondary/50 transition-colors duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-base leading-snug mb-1 group-hover:text-primary transition-colors duration-300">
                        {isAr ? item.ar : item.en}
                      </p>
                      {isAr && (
                        <p className="text-foreground/35 text-xs tracking-wide">{item.en}</p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 border border-border/60 text-foreground/30 uppercase tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-serif text-xl text-primary font-medium">
                        {item.price.toFixed(0)}
                      </span>
                      <span className="text-foreground/30 text-xs mr-1"> ر.س</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer note */}
      <div className="bg-dark-section py-10 mt-8">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <p className="text-background/30 text-xs uppercase tracking-[0.3em] mb-2">
            {isAr ? "جميع الأسعار بالريال السعودي" : "All prices in Saudi Riyals (SAR)"}
          </p>
          <p className="text-background/20 text-[10px] tracking-wider">
            {isAr
              ? "الأسعار قابلة للتغيير · قد تختلف المحتويات بين الفروع"
              : "Prices subject to change · Items may vary by branch"}
          </p>
        </div>
      </div>
    </div>
  );
}
