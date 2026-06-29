import { FadeIn } from "@/components/ui/fade-in";
import berryBasketImg from "@assets/684696860_18069942209651984_7097828562111979045_n_1782725587615.jpg";

export function Mission() {
  return (
    <section className="relative py-32 text-background overflow-hidden flex items-center justify-center min-h-[70vh]">
      {/* Real photo background */}
      <div className="absolute inset-0 z-0">
        <img
          src={berryBasketImg}
          alt="Butter Bakery — signature berry basket pastry"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/85 to-foreground/95" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none z-10" />

      <div className="container mx-auto px-6 text-center relative z-20">
        <FadeIn direction="up">
          <div className="inline-flex items-center justify-center mb-10">
            <div className="h-[1px] w-12 bg-primary/50" />
            <span className="mx-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">Our Mission</span>
            <div className="h-[1px] w-12 bg-primary/50" />
          </div>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light leading-[1.2] max-w-5xl mx-auto mb-8 text-white">
            "Bring <span className="italic text-primary">fresh bakeries</span> to your everyday life."
          </h2>
        </FadeIn>

        <FadeIn delay={0.3} direction="up">
          <p className="text-primary/70 text-sm tracking-[0.3em] mb-10">
            من الحرفية المحلية إلى المعايير العالمية
          </p>
        </FadeIn>

        <FadeIn delay={0.4} direction="up">
          <p className="max-w-2xl mx-auto text-background/80 font-light text-lg md:text-xl leading-relaxed mb-8">
            Since its establishment with Ukrainian roots, Butter Bakery's mission has been the same: bring fresh bakeries to your everyday life. We have served customers with passion across Europe, with the goal of expanding into the Middle East — with the same mission and values.
          </p>
          <p className="max-w-2xl mx-auto text-background/55 font-light text-base md:text-lg leading-relaxed">
            Butter Bakery represents a transformation in the concept of bakeries and cafés in Saudi Arabia — combining advanced European techniques with authentic Saudi taste to create a unique experience aligned with Vision 2030's spirit of development and openness. We employ global expertise in the art of baking to deliver products that stand out in quality, innovative flavors, and meet the aspirations of an evolving Saudi society.
          </p>
        </FadeIn>

        <FadeIn delay={0.6} direction="up">
          <div className="mt-16 inline-flex items-center gap-8 text-background/30 text-xs uppercase tracking-[0.3em]">
            <span>Bakery & Coffee</span>
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span>Est. Ukraine · Saudi Arabia</span>
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span>Vision 2030</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
