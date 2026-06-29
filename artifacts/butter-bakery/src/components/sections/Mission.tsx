import { FadeIn } from "@/components/ui/fade-in";

export function Mission() {
  return (
    <section className="py-32 bg-foreground text-background relative overflow-hidden flex items-center justify-center min-h-[70vh]">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <FadeIn direction="up">
          <div className="inline-flex items-center justify-center mb-10">
            <div className="h-[1px] w-12 bg-primary/50" />
            <span className="mx-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">Our Mission</span>
            <div className="h-[1px] w-12 bg-primary/50" />
          </div>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light leading-[1.2] max-w-5xl mx-auto mb-12 text-white">
            "Bringing <span className="italic text-primary">fresh bakeries</span> to your everyday life."
          </h2>
        </FadeIn>

        <FadeIn delay={0.4} direction="up">
          <p className="max-w-2xl mx-auto text-background/70 font-light text-lg md:text-xl leading-relaxed">
            European baking techniques intertwined with authentic Saudi taste. 
            We are crafting an experience—not just selling bread and coffee. 
            Proudly aligned with Vision 2030, we are elevating the culinary landscape of the Kingdom.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
