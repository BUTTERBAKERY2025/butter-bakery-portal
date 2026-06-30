import { FadeIn } from "@/components/ui/fade-in";
import { useLang } from "@/contexts/LanguageContext";

export function Experience() {
  const { t, isAr } = useLang();
  const ex = t.experience;

  return (
    <section id="experience" className="py-20 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-5 md:px-12">

        {/* Header */}
        <FadeIn>
          <div className="text-center mb-14 md:mb-20">
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.35em] mb-5">
              {ex.eyebrow}
            </p>
            <h3 className={`font-serif text-4xl md:text-5xl lg:text-6xl text-foreground font-medium leading-[1.1] mb-5 ${isAr ? "leading-[1.3]" : ""}`}>
              {ex.title}
            </h3>
            <p className="text-foreground/50 font-light text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              {ex.subtitle}
            </p>
          </div>
        </FadeIn>

        {/* Editorial Grid — 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4 mb-4">

          {/* Col 1: Kids baking (tall) */}
          <FadeIn direction="up" className="lg:col-span-4">
            <div className="group relative overflow-hidden h-72 md:h-96 lg:h-[560px]">
              <img
                src="/gallery/workshop-kids-baking.jpg"
                alt="Butter Bakery baking workshop for kids"
                className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-primary text-[9px] uppercase tracking-[0.3em] font-medium mb-2">
                  {ex.workshop.caption}
                </p>
                <p className="font-serif text-xl md:text-2xl text-white leading-snug">
                  {ex.workshop.label}
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Col 2: Piping girl (top) + Chef croissant (bottom) */}
          <div className="lg:col-span-4 flex flex-col gap-3 md:gap-4">
            <FadeIn direction="up" delay={0.1}>
              <div className="group relative overflow-hidden h-64 md:h-72 lg:h-[268px]">
                <img
                  src="/gallery/workshop-piping-girl.jpg"
                  alt="Girl learning to pipe pastry at Butter Bakery"
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <p className="text-primary text-[9px] uppercase tracking-[0.3em] font-medium mb-1.5">
                    {ex.piping.caption}
                  </p>
                  <p className="font-serif text-lg md:text-xl text-white">
                    {ex.piping.label}
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <div className="group relative overflow-hidden h-64 md:h-72 lg:h-[272px]">
                <img
                  src="/gallery/chef-croissant-hands.jpg"
                  alt="Chef hands shaping a perfect croissant"
                  className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {/* Amber accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/80" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <p className="text-primary text-[9px] uppercase tracking-[0.3em] font-medium mb-1.5">
                    {ex.croissant.caption}
                  </p>
                  <p className="font-serif text-lg md:text-xl text-white">
                    {ex.croissant.label}
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Col 3: Summer customers (full height) */}
          <FadeIn direction="up" delay={0.15} className="lg:col-span-4">
            <div className="group relative overflow-hidden h-72 md:h-96 lg:h-[560px]">
              <img
                src="/gallery/summer-customers.jpg"
                alt="Customers enjoying summer season at Butter Bakery"
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {/* Floating label — top right */}
              <div className="absolute top-5 right-5 bg-background/90 backdrop-blur-sm px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] text-foreground font-medium">
                {ex.summer.caption}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className={`border-primary mb-4 py-2 ${isAr ? "border-r-2 pr-4" : "border-l-2 pl-4"}`}>
                  <p className="font-serif text-xl md:text-2xl text-white italic leading-snug">
                    {ex.summer.label}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Bottom Banner: Certificates — wide */}
        <FadeIn direction="up" delay={0.3}>
          <div className="group relative overflow-hidden h-56 sm:h-72 md:h-80 lg:h-96">
            <img
              src="/gallery/workshop-certificates.jpg"
              alt="Butter Bakery junior chefs graduating with certificates"
              className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

            {/* Centered editorial content */}
            <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-16 lg:px-24">
              <p className="text-primary text-[9px] uppercase tracking-[0.4em] font-medium mb-3">
                {ex.certificates.label}
              </p>
              <p className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-light leading-[1.15] max-w-xl mb-4 md:mb-6">
                {ex.certificates.quote}
              </p>
              <p className="text-white/50 text-xs uppercase tracking-[0.3em] font-light">
                {ex.certificates.caption}
              </p>
            </div>

            {/* Bottom right BB branding mark */}
            <div className="absolute bottom-5 right-5 md:bottom-8 md:right-8 text-right">
              <p className="font-serif text-xs text-white/30 uppercase tracking-widest">Butter Bakery</p>
              <p className="text-primary/50 text-[9px] uppercase tracking-[0.3em]">Academy</p>
            </div>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
