import { FadeIn } from "@/components/ui/fade-in";
import { useLang } from "@/contexts/LanguageContext";

const WHATSAPP = "https://wa.me/966531920222";

export function Catering() {
  const { t, isAr } = useLang();
  const c = t.catering;

  return (
    <section
      id="catering"
      dir={isAr ? "rtl" : "ltr"}
      className="relative bg-[#faf9f7] overflow-hidden"
    >
      {/* ── Top editorial header ───────────────────────────── */}
      <div className="container mx-auto px-5 md:px-12 pt-20 md:pt-32 pb-12 md:pb-20">
        <FadeIn direction="up">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.35em] mb-6">
            {c.eyebrow}
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground font-medium leading-[1.05] max-w-3xl">
              {isAr ? (
                <>
                  نأتي إلى{" "}
                  <span className="text-primary italic">مائدتكم</span>
                </>
              ) : (
                <>
                  We Come to{" "}
                  <span className="text-primary italic">Your Table</span>
                </>
              )}
            </h2>
            <p className="text-foreground/50 text-sm uppercase tracking-[0.25em] lg:mb-3 font-light lg:max-w-xs lg:text-right">
              {c.tagline}
            </p>
          </div>
        </FadeIn>
      </div>

      {/* ── Full-width cinematic video + description ────────── */}
      <div className="container mx-auto px-5 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-6">

          {/* Video — large left panel */}
          <FadeIn direction="up" className="lg:col-span-3">
            <div className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-stone-900">
              <video
                src="/catering-video-1.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4">
                <span className="bg-primary px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-white font-semibold">
                  {c.videoLabel}
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Right panel: subtitle + services */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-8">
            <FadeIn direction="up" delay={0.15}>
              <h3 className="font-serif text-xl md:text-2xl text-foreground/70 font-light italic leading-relaxed mb-6">
                {c.subtitle}
              </h3>
              <p className="text-foreground/60 font-light leading-relaxed text-sm md:text-base">
                {c.description}
              </p>
            </FadeIn>

            {/* Services grid */}
            <FadeIn direction="up" delay={0.25}>
              <div className="grid grid-cols-1 gap-4">
                {c.services.map((svc, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-start p-4 border border-foreground/8 hover:border-primary/30 transition-colors duration-300 bg-white/60"
                  >
                    <span className="text-xl mt-0.5 shrink-0">{svc.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">
                        {svc.title}
                      </p>
                      <p className="text-foreground/50 text-xs font-light leading-relaxed">
                        {svc.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>

      </div>

      {/* ── Dark CTA strip ─────────────────────────────────── */}
      <div className="bg-[#1C1208] mt-0 py-14 md:py-20">
        <div className="container mx-auto px-5 md:px-12 text-center">
          <FadeIn direction="up">
            <p className="font-serif text-2xl md:text-3xl text-white/80 italic mb-8 font-light">
              {c.quoteText}
            </p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-10 py-4 text-sm uppercase tracking-[0.2em] font-semibold transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.854L.057 23.903a.75.75 0 00.92.919l6.115-1.463A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.699-.494-5.257-1.36l-.374-.214-3.872.927.957-3.803-.232-.38A9.963 9.963 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              {c.cta}
            </a>
            <p className="text-white/30 text-xs uppercase tracking-widest mt-4 font-light">
              {c.ctaNote}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
