import { FadeIn } from "@/components/ui/fade-in";
import foundersImg from "@/assets/real/founders.jpg";
import eiffelImg from "@/assets/real/eiffel.jpg";

export function Story() {
  return (
    <section id="story" className="py-32 md:py-48 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          <div className="order-2 lg:order-1 relative">
            <FadeIn direction="right">
              <div className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] relative w-full max-w-lg mx-auto overflow-hidden">
                <img
                  src={foundersImg}
                  alt="The two founders of Butter Bakery"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 border border-primary/20 m-4 pointer-events-none" />
              </div>
            </FadeIn>

            {/* Small eiffel accent */}
            <FadeIn direction="right" delay={0.3}>
              <div className="absolute -bottom-8 -right-4 w-36 h-24 overflow-hidden border border-primary/20 hidden lg:block">
                <img
                  src={eiffelImg}
                  alt="European roots"
                  className="w-full h-full object-cover object-top opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-0 right-0 text-center text-[8px] uppercase tracking-widest text-white/60">European Roots</span>
              </div>
            </FadeIn>

            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <FadeIn>
              <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Our Heritage</h2>
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground font-medium leading-[1.1] mb-3">
                The Story of Two Friends
              </h3>
              <p className="text-foreground/40 text-sm font-light mb-10 tracking-widest">
                قصة صديقين… أسسا حلماً اسمه Butter Bakery
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="space-y-6 text-foreground/70 font-light leading-relaxed text-lg">
                <p>
                  The beginning wasn't just a business plan — it was a story of friendship, shared values, and bold ambition. Two individuals came together, each bringing something unique.
                </p>
                <p>
                  One, a visionary with refined taste, had explored Europe from the charming streets of Paris to the traditions of Ukraine — gathering inspiration, culture, and a deep love for the art of experience. The other, a strategic thinker and operational expert, possessed the ability to turn ambitious ideas into structured, scalable reality.
                </p>

                <blockquote className="border-l-2 border-primary pl-6 my-10 py-2">
                  <p className="font-serif text-xl md:text-2xl text-foreground italic leading-relaxed mb-4">
                    "Imagine a place — elegant yet welcoming — that offers more than just bread and coffee. A place that offers emotion, identity, and a truly immersive experience."
                  </p>
                  <p className="font-serif text-xl md:text-2xl text-primary italic">
                    "If you can dream it, I can build it."
                  </p>
                </blockquote>

                <p>
                  Vision met execution. Inspiration met planning. And Butter Bakery was born in Saudi Arabia — not just as a brand, but as a reflection of their shared passion. Their goal: a concept rooted in local authenticity but elevated with global sophistication.
                </p>
                <p>
                  Today, Butter Bakery stands as the result of true friendship, shared belief, and a vision that transformed from a quiet café conversation into a signature destination for quality and culture.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-10 pt-10 border-t border-border">
                <p className="text-foreground/40 text-sm font-light leading-relaxed italic">
                  "اجتمعت الرؤية مع التخطيط، والإلهام مع التنفيذ — وُلد اسم Butter Bakery في السعودية."
                </p>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
