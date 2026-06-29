import { FadeIn } from "@/components/ui/fade-in";
import storyImg from "@/assets/story.png";

export function Story() {
  return (
    <section id="story" className="py-32 md:py-48 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="order-2 lg:order-1 relative">
            <FadeIn direction="right">
              <div className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] relative w-full max-w-lg mx-auto overflow-hidden">
                <img 
                  src={storyImg} 
                  alt="Two friends having coffee in a luxury cafe" 
                  className="w-full h-full object-cover object-center"
                />
                {/* Decorative border */}
                <div className="absolute inset-0 border border-primary/20 m-4 pointer-events-none" />
              </div>
            </FadeIn>
            
            {/* Abstract aesthetic element */}
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <FadeIn>
              <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Our Heritage</h2>
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground font-medium leading-[1.1] mb-10">
                A Vision Born <br className="hidden md:block" /> From Friendship
              </h3>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="space-y-6 text-foreground/70 font-light leading-relaxed text-lg">
                <p>
                  Two friends. One, a visionary who traveled Europe—from the bustling streets of Paris to the rich cultural heart of Ukraine—gathering inspiration. The other, a strategic operator who possessed the rare gift of turning grand dreams into reality.
                </p>
                
                <blockquote className="border-l-2 border-primary pl-6 my-10 py-2 italic font-serif text-xl md:text-2xl text-foreground">
                  "Imagine a place that offers emotion, identity, and an immersive experience," one said over coffee. 
                  <br /><br />
                  The other replied without hesitation: "If you can dream it, I can build it."
                </blockquote>
                
                <p>
                  And so, Butter Bakery was born. A space where the unhurried grace of a Parisian atelier meets the profound warmth of Arabian hospitality. We don't just bake; we craft emotions.
                </p>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
