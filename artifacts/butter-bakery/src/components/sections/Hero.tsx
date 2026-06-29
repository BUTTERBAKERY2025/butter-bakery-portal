import { FadeIn } from "@/components/ui/fade-in";
import heroImg from "@/assets/real/branch-riyadh-interior.jpg";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

export function Hero() {
  const { t, isAr } = useLang();

  return (
    <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 12, ease: "easeOut" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-primary/8 mix-blend-multiply" />
      </motion.div>

      <div className="container relative z-10 px-6 md:px-12 flex flex-col items-center justify-center text-center mt-20">

        <FadeIn direction="down" delay={0.4}>
          <div className="flex items-center gap-4 mb-8 justify-center">
            <div className="h-[1px] w-8 bg-primary/60" />
            <span className="text-xs md:text-sm font-medium uppercase tracking-[0.35em] text-primary">
              {t.hero.eyebrow}
            </span>
            <div className="h-[1px] w-8 bg-primary/60" />
          </div>
        </FadeIn>

        <FadeIn delay={0.6}>
          <h1 className={`font-serif text-5xl md:text-7xl lg:text-[5.5rem] text-white font-bold tracking-tight leading-[1.05] mb-6 drop-shadow-lg ${isAr ? "leading-[1.3]" : ""}`}>
            {t.hero.headline1}<br />
            <span className="italic font-light text-primary/90">{t.hero.headline2}</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.8} direction="up">
          <p className={`max-w-xl mx-auto text-lg md:text-xl text-white/75 font-light mb-3 leading-relaxed ${isAr ? "font-normal" : ""}`}>
            {t.hero.sub}
          </p>
          <p className="text-white/40 text-sm font-light tracking-wide mb-12">
            {t.hero.subSecondary}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#story"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-sm uppercase tracking-widest font-medium overflow-hidden transition-all duration-300 hover:bg-white hover:text-foreground"
            >
              <span>{t.hero.cta1}</span>
              <svg className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="#products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/25 text-white text-sm uppercase tracking-widest font-light hover:border-primary hover:text-primary transition-all duration-300"
            >
              {t.hero.cta2}
            </a>
          </div>
        </FadeIn>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-widest text-white/40">{t.hero.scroll}</span>
        <div className="w-[1px] h-12 bg-white/15 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2 bg-primary"
            animate={{ top: ["-50%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
