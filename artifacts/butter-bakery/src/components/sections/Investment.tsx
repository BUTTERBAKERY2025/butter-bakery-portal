import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import brandBagImg from "@/assets/real/brand-bag.jpg";
import airlineBbImg from "@/assets/real/airline-bb.jpg";
import customerCupImg from "@/assets/real/customer-cup.jpg";
import { useLang } from "@/contexts/LanguageContext";

export function Investment() {
  const { t, isAr } = useLang();
  const inv = t.investment;

  return (
    <section id="invest" className="py-20 md:py-32 lg:py-48 bg-dark-section text-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-5 md:px-12 relative z-10">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-16 md:mb-24">
          <div className="lg:col-span-5">
            <FadeIn>
              <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">{inv.eyebrow}</h2>
              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.15] mb-6 md:mb-8">
                {inv.title}
              </h3>
              <p className="text-background/70 font-light text-lg leading-relaxed mb-10">
                {inv.p1}
              </p>
              <p className="text-background/50 font-light text-sm leading-relaxed mb-10">
                {inv.p2}
              </p>
              <a
                href="mailto:info@butterbakery.co?subject=Investment Inquiry"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground text-sm uppercase tracking-widest font-medium transition-all hover:bg-white hover:text-foreground"
              >
                {inv.cta}
              </a>
            </FadeIn>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {inv.stats.map((stat, i) => (
                <StaggerItem key={i} direction="up" className="bg-background/5 border border-white/10 p-8 hover:border-primary/50 transition-colors duration-500">
                  <div className="font-serif text-4xl md:text-5xl text-primary mb-3">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-sm uppercase tracking-widest text-white/90 leading-snug mb-2">{stat.label}</div>
                  <div className="text-xs text-background/50 font-light leading-relaxed">{stat.sub}</div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>

        {/* Photo strip */}
        <FadeIn>
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-16 h-36 sm:h-44 md:h-52">
            <div className="overflow-hidden relative group col-span-1">
              <img src={brandBagImg} alt="Butter Bakery branded takeaway bag" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <p className="absolute bottom-3 left-3 text-[9px] uppercase tracking-widest text-white/70">{inv.brandIdentity}</p>
            </div>
            <div className="overflow-hidden relative group col-span-1">
              <img src={customerCupImg} alt="Customer with Butter Bakery coffee cup" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <p className="absolute bottom-3 left-3 text-[9px] uppercase tracking-widest text-white/70">{inv.customerExp}</p>
            </div>
            <div className="overflow-hidden relative group col-span-1">
              <img src={airlineBbImg} alt="Butter Bakery products on airline" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <p className="absolute bottom-3 left-3 text-[9px] uppercase tracking-widest text-white/70">{inv.b2gLabel}</p>
            </div>
          </div>
        </FadeIn>

        {/* Investment Pillars */}
        <FadeIn>
          <div className="border-t border-white/10 pt-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-12">{inv.whyEyebrow}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {inv.pillars.map((pillar, i) => (
                <FadeIn key={i} delay={i * 0.1} direction="up">
                  <div className={`hover:border-primary transition-colors duration-300 ${isAr ? "border-r border-primary/30 pr-6" : "border-l border-primary/30 pl-6"}`}>
                    <h4 className="font-serif text-xl text-white mb-3">{pillar.title}</h4>
                    <p className="text-background/60 font-light text-sm leading-relaxed">{pillar.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Customer Segmentation */}
        <FadeIn delay={0.3}>
          <div className="mt-16 p-8 md:p-12 bg-white/5 border border-white/10">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-6">{inv.segmentationEyebrow}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[inv.b2c, inv.b2b, inv.b2g].map((seg) => (
                <div key={seg.label}>
                  <p className="font-serif text-2xl text-white mb-2">{seg.label}</p>
                  <p className="text-background/60 font-light text-sm leading-relaxed">{seg.body}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Contact */}
        <FadeIn delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-background/50 text-sm font-light mb-2">
              {inv.contactLine}
            </p>
            <a href="mailto:info@butterbakery.co" className="text-primary font-medium hover:text-white transition-colors">
              info@butterbakery.co
            </a>
            <span className="text-background/30 mx-3">·</span>
            <a href="https://www.butterbakery.co" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:text-white transition-colors">
              www.butterbakery.co
            </a>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
