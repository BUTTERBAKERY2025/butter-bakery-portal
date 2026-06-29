import { FadeIn } from "@/components/ui/fade-in";
import heroImg from "@/assets/hero.png";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax & Ken Burns effect */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
      </motion.div>

      <div className="container relative z-10 px-6 md:px-12 flex flex-col items-center justify-center text-center mt-20">
        <FadeIn direction="down" delay={0.5}>
          <span className="inline-block mb-6 text-xs md:text-sm font-medium uppercase tracking-[0.3em] text-primary">
            طازجة كل يوم
          </span>
        </FadeIn>
        
        <FadeIn delay={0.7}>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-bold tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
            Waiting in line<br />
            <span className="italic font-light text-primary/90">to taste happiness.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.9} direction="up">
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 font-light mb-12">
            Where European artisan craft meets Saudi warmth. A luxury destination for specialty coffee and exquisite pastries.
          </p>
          
          <a 
            href="#story" 
            className="group relative inline-flex items-center justify-center gap-4 px-8 py-4 bg-primary text-primary-foreground text-sm uppercase tracking-widest font-medium overflow-hidden transition-all hover:bg-white hover:text-foreground"
          >
            <span>Discover Our Story</span>
          </a>
        </FadeIn>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-widest text-white/50">Scroll</span>
        <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
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
