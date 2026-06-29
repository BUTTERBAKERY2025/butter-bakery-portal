import { motion } from "framer-motion";
import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import logoBb from "@/assets/real/logo-bb.jpg";

export default function NotFound() {
  const { isAr, toggleLang, lang } = useLang();

  return (
    <div className="min-h-screen bg-dark-section flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 overflow-hidden rounded-sm ring-1 ring-white/10">
            <img src={logoBb} alt="Butter Bakery" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-sm font-bold tracking-wider text-white/70">BUTTER BAKERY</span>
        </Link>
        <button
          onClick={toggleLang}
          className="text-xs font-medium tracking-widest px-3 py-2 border border-white/10 text-white/40 hover:border-primary/50 hover:text-primary transition-all duration-300"
        >
          {lang === "en" ? "عربي" : "EN"}
        </button>
      </div>

      {/* Content */}
      <div className="text-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.4em] mb-8">
            {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
          </p>

          <div className="font-serif text-[10rem] md:text-[16rem] font-bold leading-none text-white/5 select-none mb-0">
            404
          </div>

          <p className="font-serif text-3xl md:text-4xl text-white/80 -mt-8 mb-6">
            {isAr ? "هذه الصفحة غير موجودة" : "This page doesn't exist"}
          </p>

          <p className="text-white/40 font-light mb-12 max-w-sm mx-auto">
            {isAr
              ? "ربما أُزيل الرابط أو تغيّر. تحقق من العنوان أو عد للرئيسية."
              : "The link may have been removed or changed. Check the URL or return home."}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-3 px-10 py-4 border border-primary text-primary text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </motion.div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/20 text-[10px] uppercase tracking-[0.4em]">
          يُخبز طازج كل يوم — Freshly Baked Every Day
        </p>
      </div>
    </div>
  );
}
