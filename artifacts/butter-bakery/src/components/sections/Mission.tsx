import { FadeIn } from "@/components/ui/fade-in";
const berryBasketImg = "/gallery/684696860_18069942209651984_7097828562111979045_n_1782725587615.jpg";
import { useLang } from "@/contexts/LanguageContext";

export function Mission() {
  const { t } = useLang();
  const m = t.mission;

  const renderHeadline = () => {
    const full = m.headline;
    const highlight = m.headlineHighlight;
    const idx = full.indexOf(highlight);
    if (idx === -1) return <>{full}</>;
    const before = full.slice(0, idx);
    const after = full.slice(idx + highlight.length);
    return (
      <>
        {before}
        <span className="italic text-primary">{highlight}</span>
        {after}
      </>
    );
  };

  return (
    <section className="relative py-16 md:py-32 text-background overflow-hidden flex items-center justify-center min-h-[60vh] md:min-h-[70vh]">
      <div className="absolute inset-0 z-0">
        <img
          src={berryBasketImg}
          alt="Butter Bakery — signature berry basket pastry"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark-section/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/85 to-foreground/95" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none z-10" />

      <div className="container mx-auto px-6 text-center relative z-20">
        <FadeIn direction="up">
          <div className="inline-flex items-center justify-center mb-10">
            <div className="h-[1px] w-12 bg-primary/50" />
            <span className="mx-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">{m.eyebrow}</span>
            <div className="h-[1px] w-12 bg-primary/50" />
          </div>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light leading-[1.2] max-w-5xl mx-auto mb-8 text-white">
            {renderHeadline()}
          </h2>
        </FadeIn>

        <FadeIn delay={0.3} direction="up">
          <p className="text-primary/70 text-sm tracking-[0.3em] mb-10">
            {m.sub}
          </p>
        </FadeIn>

        <FadeIn delay={0.4} direction="up">
          <p className="max-w-2xl mx-auto text-background/80 font-light text-lg md:text-xl leading-relaxed mb-8">
            {m.p1}
          </p>
          <p className="max-w-2xl mx-auto text-background/55 font-light text-base md:text-lg leading-relaxed">
            {m.p2}
          </p>
        </FadeIn>

        <FadeIn delay={0.6} direction="up">
          <div className="mt-16 inline-flex items-center gap-8 text-background/30 text-xs uppercase tracking-[0.3em]">
            <span>{m.tag1}</span>
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span>{m.tag2}</span>
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span>{m.tag3}</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
