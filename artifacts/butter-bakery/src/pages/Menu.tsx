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
  descAr: string;
  descEn: string;
  items: MenuItem[];
}

const MENU: MenuCategory[] = [
  {
    idKey: "hot", ar: "المشروبات الحارة", en: "Hot Drinks",
    descAr: "قهوة مختصة بحبوب كولومبية مختارة", descEn: "Specialty coffee with selected Colombian beans",
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
    descAr: "مشروبات طازجة منعشة", descEn: "Refreshing beverages made fresh daily",
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
    descAr: "وجبات مُعدّة بعناية تستحق لحظة هدوء", descEn: "Thoughtfully crafted plates worth savouring",
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
    descAr: "خضروات طازجة بتوليفات متوسطية", descEn: "Fresh greens in Mediterranean blends",
    items: [
      { ar: "سلطة شمندر", en: "Beetroot Salad", price: 16 },
      { ar: "سلطة باربكيو الحلومي", en: "Halloumi BBQ Salad", price: 35, signature: true },
      { ar: "سلطة دجاج", en: "Chicken Salad", price: 19 },
    ],
  },
  {
    idKey: "pastries", ar: "المخبوزات", en: "Pastries",
    descAr: "معجنات تُخبز يومياً بزبدة فرنسية", descEn: "Baked fresh daily with French butter",
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
    descAr: "خبز حرفي يُعجن ويُخبز في المخبز كل صباح", descEn: "Kneaded and baked in-house every morning",
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
    descAr: "حلويات فاخرة بأجود الشوكولاتة والكريمة الفرنسية", descEn: "Indulgent sweets with premium chocolate and cream",
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
    descAr: "عجينة نابولية أصيلة تُشوى في فرن الحجر", descEn: "Authentic dough stretched thin and stone-baked",
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
    descAr: "طقوس بتر بيكري للقاءات الخاصة وجلسات الأحبة", descEn: "Butter Bakery rituals for special gatherings",
    items: [
      { ar: "ماتيلدا كرواسون", en: "Matilda Croissant", price: 54, signature: true },
      { ar: "كيكة العسل مع القهوة", en: "Honey Cake & Coffee", price: 89, signature: true },
      { ar: "كرواسون مع القهوة", en: "Croissant & Coffee", price: 89, signature: true },
      { ar: "هوت شوكليت كلاسيك", en: "Classic Hot Chocolate", price: 33.35 },
    ],
  },
];

// ─── SVG Doodles ─────────────────────────────────────────────────────────────

function DoodleBaker() {
  return (
    <svg viewBox="0 0 200 310" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Chef hat dome */}
      <path d="M 68 22 C 68 4 132 4 132 22" />
      {/* Hat brim */}
      <rect x="58" y="20" width="84" height="12" rx="4" />
      {/* Head */}
      <circle cx="100" cy="62" r="30" />
      {/* Eyes - closed/happy */}
      <path d="M 86 57 Q 91 53 96 57" />
      <path d="M 104 57 Q 109 53 114 57" />
      {/* Nose */}
      <path d="M 100 63 Q 103 68 100 70" />
      {/* Big smile */}
      <path d="M 87 76 Q 100 87 113 76" />
      {/* Rosy cheeks */}
      <ellipse cx="80" cy="73" rx="6" ry="4" strokeOpacity="0.3" />
      <ellipse cx="120" cy="73" rx="6" ry="4" strokeOpacity="0.3" />
      {/* Neck */}
      <line x1="100" y1="92" x2="100" y2="104" />
      {/* Body / uniform */}
      <path d="M 62 116 Q 74 104 100 102 Q 126 104 138 116 L 134 176 L 66 176 Z" />
      {/* Front apron pleat */}
      <path d="M 88 102 L 84 136 L 116 136 L 112 102" />
      {/* Buttons */}
      <circle cx="100" cy="118" r="2.5" fill="currentColor" />
      <circle cx="100" cy="129" r="2.5" fill="currentColor" />
      {/* Left arm raised up with tray */}
      <path d="M 66 122 Q 44 112 24 106" />
      {/* Tray */}
      <path d="M 4 104 Q 4 98 10 97 L 48 103 Q 54 104 54 110 L 54 114 Q 54 119 48 118 L 10 112 Q 4 110 4 104 Z" />
      {/* Two bread rolls on tray */}
      <ellipse cx="18" cy="98" rx="9" ry="6" />
      <path d="M 10 95 Q 18 90 26 95" />
      <ellipse cx="38" cy="95" rx="9" ry="6" />
      <path d="M 30 92 Q 38 87 46 92" />
      {/* Right arm holding croissant high */}
      <path d="M 134 122 Q 156 112 174 104" />
      {/* Croissant */}
      <path d="M 160 88 Q 174 72 192 82 Q 200 95 188 104 Q 172 114 162 102 Q 158 95 160 88 Z" />
      <path d="M 166 92 Q 176 80 188 87" />
      <path d="M 163 98 Q 174 87 185 93" />
      {/* Hand gripping croissant */}
      <circle cx="172" cy="106" r="6" />
      {/* Legs walking */}
      <path d="M 82 176 Q 76 206 70 248" />
      <path d="M 118 176 Q 124 206 132 248" />
      {/* Left shoe */}
      <path d="M 64 246 Q 68 258 82 254 Q 88 252 88 246" />
      {/* Right shoe */}
      <path d="M 128 246 Q 132 258 146 254 Q 152 252 152 246" />
    </svg>
  );
}

function DoodleCoffeeCup() {
  return (
    <svg viewBox="0 0 120 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M 20 45 L 12 118 Q 12 128 22 128 L 98 128 Q 108 128 108 118 L 100 45 Z" />
      <ellipse cx="60" cy="45" rx="40" ry="11" />
      <path d="M 108 65 Q 130 65 130 85 Q 130 105 108 105" />
      <path d="M 38 30 Q 41 20 45 30 Q 49 40 52 30" />
      <path d="M 58 24 Q 61 14 65 24 Q 69 34 72 24" />
      <path d="M 76 30 Q 79 20 83 30 Q 87 40 90 30" />
    </svg>
  );
}

function DoodleIcedDrink() {
  return (
    <svg viewBox="0 0 100 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M 18 22 L 8 128 Q 8 136 18 136 L 82 136 Q 92 136 92 128 L 82 22 Z" />
      <rect x="12" y="15" width="76" height="12" rx="3" />
      <line x1="50" y1="5" x2="50" y2="18" />
      <circle cx="50" cy="3" r="3" fill="currentColor" />
      {/* Ice cubes */}
      <rect x="28" y="55" width="20" height="20" rx="3" />
      <rect x="52" y="50" width="20" height="20" rx="3" />
      <rect x="36" y="78" width="20" height="20" rx="3" />
    </svg>
  );
}

function DoodleEgg() {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Plate */}
      <ellipse cx="60" cy="100" rx="50" ry="12" />
      <path d="M 10 100 Q 10 115 60 115 Q 110 115 110 100" />
      {/* Egg white */}
      <path d="M 28 75 Q 20 50 38 32 Q 55 14 72 32 Q 88 20 96 42 Q 105 62 90 80 Q 70 95 50 90 Q 32 87 28 75 Z" />
      {/* Yolk */}
      <circle cx="65" cy="62" r="18" />
    </svg>
  );
}

function DoodleLeaf() {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M 60 100 Q 20 75 18 40 Q 16 10 60 15 Q 104 10 102 40 Q 100 75 60 100 Z" />
      <line x1="60" y1="100" x2="60" y2="15" />
      <path d="M 60 40 Q 42 36 30 42" />
      <path d="M 60 40 Q 78 36 90 42" />
      <path d="M 60 62 Q 40 56 28 62" />
      <path d="M 60 62 Q 80 56 92 62" />
    </svg>
  );
}

function DoodleCroissant() {
  return (
    <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M 14 72 Q 24 18 80 24 Q 136 18 146 72 Q 112 96 80 88 Q 48 96 14 72 Z" />
      <path d="M 38 68 Q 64 40 116 52" />
      <path d="M 32 76 Q 56 50 110 62" />
      <path d="M 14 72 Q 6 60 12 44" />
      <path d="M 146 72 Q 154 60 148 44" />
    </svg>
  );
}

function DoodleBread() {
  return (
    <svg viewBox="0 0 200 130" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M 12 90 L 188 90 Q 194 90 194 100 L 194 114 Q 194 120 188 120 L 12 120 Q 6 120 6 114 L 6 100 Q 6 90 12 90 Z" />
      <path d="M 16 90 Q 28 28 100 18 Q 172 28 184 90" />
      <path d="M 58 86 Q 62 55 66 86" />
      <path d="M 88 82 Q 92 46 96 82" />
      <path d="M 118 86 Q 122 55 126 86" />
      <circle cx="42" cy="60" r="3" fill="currentColor" />
      <circle cx="158" cy="55" r="3" fill="currentColor" />
      <circle cx="100" cy="32" r="3" fill="currentColor" />
    </svg>
  );
}

function DoodleCake() {
  return (
    <svg viewBox="0 0 140 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Base tier */}
      <rect x="10" y="85" width="120" height="40" rx="4" />
      {/* Middle tier */}
      <rect x="24" y="52" width="92" height="36" rx="4" />
      {/* Top tier */}
      <rect x="40" y="24" width="60" height="30" rx="4" />
      {/* Frosting drips */}
      <path d="M 30 52 Q 36 44 42 52" />
      <path d="M 60 52 Q 66 44 72 52" />
      <path d="M 90 52 Q 96 44 102 52" />
      <path d="M 46 24 Q 52 16 58 24" />
      <path d="M 70 24 Q 76 16 82 24" />
      {/* Candles */}
      <line x1="58" y1="24" x2="58" y2="12" />
      <line x1="70" y1="24" x2="70" y2="8" />
      <line x1="82" y1="24" x2="82" y2="14" />
      {/* Flames */}
      <path d="M 56 10 Q 58 6 60 10 Q 60 14 58 13" />
      <path d="M 68 6 Q 70 2 72 6 Q 72 10 70 9" />
      <path d="M 80 12 Q 82 8 84 12 Q 84 16 82 15" />
      {/* Decoration dots */}
      <circle cx="42" cy="68" r="3" fill="currentColor" />
      <circle cx="98" cy="68" r="3" fill="currentColor" />
      <circle cx="70" cy="38" r="3" fill="currentColor" />
    </svg>
  );
}

function DoodlePizza() {
  return (
    <svg viewBox="0 0 140 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Whole pizza */}
      <circle cx="70" cy="70" r="58" />
      {/* Slice cuts */}
      <line x1="70" y1="12" x2="70" y2="128" />
      <line x1="12" y1="70" x2="128" y2="70" />
      <line x1="29" y1="29" x2="111" y2="111" />
      <line x1="111" y1="29" x2="29" y2="111" />
      {/* Toppings - circles */}
      <circle cx="70" cy="44" r="7" />
      <circle cx="96" cy="58" r="6" />
      <circle cx="88" cy="86" r="7" />
      <circle cx="52" cy="82" r="6" />
      <circle cx="44" cy="55" r="7" />
      <circle cx="70" cy="70" r="8" />
    </svg>
  );
}

function DoodleGathering() {
  return (
    <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Three cups */}
      <path d="M 20 40 L 15 90 Q 15 96 22 96 L 58 96 Q 65 96 65 90 L 60 40 Z" />
      <ellipse cx="40" cy="40" rx="20" ry="6" />
      <path d="M 65 56 Q 76 56 76 66 Q 76 76 65 76" />
      <path d="M 28 28 Q 30 20 33 28" />
      <path d="M 43 24 Q 45 16 48 24" />

      <path d="M 80 40 L 75 90 Q 75 96 82 96 L 118 96 Q 125 96 125 90 L 120 40 Z" />
      <ellipse cx="100" cy="40" rx="20" ry="6" />
      <path d="M 125 56 Q 136 56 136 66 Q 136 76 125 76" />
      <path d="M 88 28 Q 90 20 93 28" />
      <path d="M 103 24 Q 105 16 108 24" />

      <path d="M 140 40 L 135 90 Q 135 96 142 96 L 178 96 Q 185 96 185 90 L 180 40 Z" />
      <ellipse cx="160" cy="40" rx="20" ry="6" />
      <path d="M 148 28 Q 150 20 153 28" />
      <path d="M 163 24 Q 165 16 168 24" />

      {/* Small star/sparkle decorations */}
      <path d="M 100 12 L 101 8 L 102 12 L 106 11 L 103 14 L 104 18 L 100 16 L 96 18 L 97 14 L 94 11 Z" />
    </svg>
  );
}

// Map category idKey → doodle
const CATEGORY_DOODLES: Record<string, () => React.ReactElement> = {
  hot: DoodleCoffeeCup,
  cold: DoodleIcedDrink,
  breakfast: DoodleEgg,
  salads: DoodleLeaf,
  pastries: DoodleCroissant,
  bread: DoodleBread,
  desserts: DoodleCake,
  pizza: DoodlePizza,
  gathering: DoodleGathering,
};

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item, isAr, isLast }: { item: MenuItem; isAr: boolean; isLast: boolean }) {
  const price = Number.isInteger(item.price) ? `${item.price}` : item.price.toFixed(2);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-4%" }}
      transition={{ duration: 0.35 }}
      className={`group flex items-center gap-3 py-4 transition-colors duration-200 hover:bg-[#f5f0ea] -mx-3 px-3 rounded-md ${!isLast ? "border-b border-[#ece6dd]" : ""}`}
    >
      <div className="shrink-0 w-4 flex justify-center pt-0.5">
        {item.signature && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="text-[15px] font-medium text-[#1a1009] group-hover:text-primary transition-colors duration-200 leading-snug">
            {isAr ? item.ar : item.en}
          </span>
          <span className="text-[12px] text-[#bfb2a5] font-light shrink-0">
            {isAr ? item.en : item.ar}
          </span>
          {item.note && (
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/8 text-primary/70 rounded font-light shrink-0">
              {item.note}
            </span>
          )}
        </div>
      </div>
      <div className="hidden sm:block flex-1 max-w-20 border-b border-dotted border-[#d8d0c5]" />
      <div className="shrink-0 flex items-baseline gap-1 tabular-nums">
        <span className="font-serif text-[22px] font-medium text-primary leading-none">{price}</span>
        <span className="text-[10px] text-[#bfb2a5]">ر.س</span>
      </div>
    </motion.div>
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
      <section
        className="pt-14 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #7A2E08 0%, #B84D18 55%, #CC6020 100%)" }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 85% 40%, rgba(255,160,60,0.18) 0%, transparent 65%)" }} />

        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <div className="flex items-end justify-between gap-8 pt-16 pb-0">

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="pb-12"
            >
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.45em] mb-7">
                {isAr ? "بتر بيكري — القائمة الكاملة" : "Butter Bakery — Full Menu"}
              </p>
              <h1 className="font-serif font-medium leading-none mb-6" style={{ fontSize: "clamp(64px, 11vw, 140px)" }}>
                {isAr ? "القائمة" : "Menu"}
              </h1>
              <p className="text-white/45 text-sm font-light max-w-xs leading-relaxed">
                {isAr
                  ? "يُخبز ويُحضَّر يومياً بأيدي متخصصة ومواد خام مختارة"
                  : "Freshly prepared daily with specialist hands and selected ingredients"}
              </p>
              <div className="flex items-center gap-2.5 mt-5 text-[10px] text-white/35 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                {isAr ? "النقطة البيضاء = صنف مميز" : "White dot = Signature item"}
              </div>
            </motion.div>

            {/* Baker doodle — right side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
              className="hidden md:block shrink-0 text-white self-end"
              style={{ width: 180, height: 290, opacity: 0.35 }}
            >
              <DoodleBaker />
            </motion.div>
          </div>
        </div>

        {/* Wave transition */}
        <div className="h-12" style={{ background: "#faf9f7", clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      {/* ── Bread doodle banner ── */}
      <div className="overflow-hidden bg-[#faf9f7] border-b border-[#ece6dd]">
        <motion.img
          src={doodleBread}
          alt=""
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="w-full max-w-4xl mx-auto block"
          style={{ mixBlendMode: "multiply" }}
          aria-hidden
        />
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto flex pt-4 pb-24">

        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-20 py-4">
            <p className="px-6 text-[9px] uppercase tracking-[0.4em] text-[#c0b5a8] mb-4">
              {isAr ? "الأقسام" : "Sections"}
            </p>
            <nav>
              {MENU.map((cat, i) => {
                const Icon = CATEGORY_DOODLES[cat.idKey];
                return (
                  <button
                    key={cat.idKey}
                    onClick={() => scrollTo(cat.idKey)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-200 group ${
                      activeId === cat.idKey ? "text-primary" : "text-[#9e8f82] hover:text-[#4a3020]"
                    }`}
                  >
                    <div className={`shrink-0 w-5 h-5 transition-colors ${activeId === cat.idKey ? "text-primary" : "text-[#c0b5a8]"}`}>
                      {Icon && <Icon />}
                    </div>
                    <span className={`text-[10px] font-mono tabular-nums transition-colors ${activeId === cat.idKey ? "text-primary" : "text-[#d0c8bc]"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`text-[12px] font-medium transition-all duration-200 ${activeId === cat.idKey ? "text-primary" : ""}`}>
                      {isAr ? cat.ar : cat.en}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-[#ebe5dc] shrink-0 self-stretch mx-0" />

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

          {MENU.map((cat, catIdx) => {
            const DoodleIcon = CATEGORY_DOODLES[cat.idKey];
            return (
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
                  className="relative mb-8 overflow-hidden"
                >
                  {/* Large ghost doodle watermark */}
                  {DoodleIcon && (
                    <div
                      className={`absolute top-0 ${isAr ? "left-0" : "right-0"} text-[#2d1a0e] pointer-events-none select-none`}
                      style={{ width: 130, height: 130, opacity: 0.055 }}
                    >
                      <DoodleIcon />
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="h-px flex-1 bg-[#ece6dd]" />
                      <span className="text-[10px] font-mono text-[#c8bfb5] uppercase tracking-[0.3em]">
                        {String(catIdx + 1).padStart(2, "0")}
                      </span>
                      <div className="h-px w-5 bg-primary/35" />
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl font-medium text-[#2d1a0e] leading-none mb-2">
                      {isAr ? cat.ar : cat.en}
                    </h2>
                    {isAr && (
                      <p className="text-[11px] text-[#c0b5a8] tracking-wider font-light">{cat.en}</p>
                    )}
                    <p className="text-sm text-[#a09080] font-light mt-2 leading-relaxed">
                      {isAr ? cat.descAr : cat.descEn}
                    </p>
                  </div>
                </motion.div>

                {/* Items — 2 columns on xl */}
                <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-14">
                  {cat.items.map((item, i) => (
                    <ItemRow
                      key={i}
                      item={item}
                      isAr={isAr}
                      isLast={i === cat.items.length - 1}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      {/* ── Coffee doodle banner ── */}
      <div className="overflow-hidden bg-[#faf9f7]">
        <img
          src={doodleCoffee}
          alt=""
          className="w-full max-w-4xl mx-auto block"
          style={{ mixBlendMode: "multiply" }}
          aria-hidden
        />
      </div>

      {/* ── Footer ── */}
      <div className="py-14 text-center" style={{ background: "linear-gradient(135deg, #7A2E08 0%, #B84D18 100%)" }}>

        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-px w-10 bg-white/15" />
          <img src={logoBb} alt="" className="w-6 h-6 rounded-sm opacity-35" />
          <div className="h-px w-10 bg-white/15" />
        </div>
        <p className="text-white/55 text-[10px] uppercase tracking-[0.4em] mb-1.5">
          {isAr ? "جميع الأسعار بالريال السعودي · تشمل الضريبة" : "All prices in Saudi Riyals · VAT included"}
        </p>
        <p className="text-white/35 text-[9px] tracking-wider mb-8">
          {isAr ? "الأسعار قابلة للتغيير · قد تختلف الأصناف بين الفروع" : "Prices subject to change · Items may vary by branch"}
        </p>
        <Link href="/" className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300">
          {isAr ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}
