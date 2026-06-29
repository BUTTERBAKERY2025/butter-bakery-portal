import { FadeIn } from "@/components/ui/fade-in";
import foundersImg from "@/assets/real/founders.jpg";
import eiffelImg from "@/assets/real/eiffel.jpg";
import founderChefImg from "@/assets/real/founder-chef.jpg";
import kidsBakingImg from "@/assets/real/kids-baking.jpg";
import { useLang } from "@/contexts/LanguageContext";

export function Story() {
  const { t, isAr } = useLang();
  const s = t.story;

  return (
    <section id="story" className="py-32 md:py-48 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Images — order flips in RTL automatically */}
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

            <FadeIn direction="right" delay={0.25}>
              <div className="absolute -bottom-8 -right-4 w-36 h-24 overflow-hidden border border-primary/20 hidden lg:block">
                <img
                  src={eiffelImg}
                  alt="European roots"
                  className="w-full h-full object-cover object-top opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-0 right-0 text-center text-[8px] uppercase tracking-widest text-white/60">{s.europeanRoots}</span>
              </div>
            </FadeIn>

            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <FadeIn>
              <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">{s.eyebrow}</h2>
              <h3 className={`font-serif text-4xl md:text-5xl lg:text-6xl text-foreground font-medium leading-[1.1] mb-3 ${isAr ? "leading-[1.3]" : ""}`}>
                {s.title}
              </h3>
              <p className="text-foreground/40 text-sm font-light mb-10 tracking-widest">
                {s.titleSub}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="space-y-6 text-foreground/70 font-light leading-relaxed text-lg">
                <p>{s.p1}</p>
                <p>{s.p2}</p>

                <blockquote className={`border-primary pl-6 my-10 py-2 ${isAr ? "border-r-2 pr-6 pl-0 border-l-0" : "border-l-2"}`}>
                  <p className="font-serif text-xl md:text-2xl text-foreground italic leading-relaxed mb-4">
                    {s.quote1}
                  </p>
                  <p className="font-serif text-xl md:text-2xl text-primary italic">
                    {s.quote2}
                  </p>
                </blockquote>

                <p>{s.p3}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-10 pt-10 border-t border-border">
                <p className="text-foreground/40 text-sm font-light leading-relaxed italic">
                  {s.arabicQuote}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 lg:mt-28">
          <FadeIn direction="up">
            <div className="group overflow-hidden relative aspect-[4/3]">
              <img
                src={founderChefImg}
                alt="Butter Bakery founder with European master chef"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-serif text-xl text-white">{s.europeanMastery}</p>
                <p className="text-white/60 text-xs uppercase tracking-widest mt-1">{s.europeanMasterySub}</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={0.15}>
            <div className="group overflow-hidden relative aspect-[4/3]">
              <img
                src={kidsBakingImg}
                alt="Butter Bakery community kids baking workshop"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-serif text-xl text-white">{s.community}</p>
                <p className="text-white/60 text-xs uppercase tracking-widest mt-1">{s.communitySub}</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* International Chef Team */}
        <FadeIn delay={0.2} direction="up">
          <div className="mt-16 lg:mt-24 border border-border/40 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">{s.craftedEyebrow}</p>
              <h4 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
                {s.craftedQuote}
              </h4>
              <p className="text-foreground/60 font-light leading-relaxed max-w-3xl mb-8">
                {s.craftedBody}
              </p>
              <div className="flex flex-wrap gap-3">
                {["France 🇫🇷", "Italy 🇮🇹", "Turkey 🇹🇷", "Asia 🌏", "Latin America 🌎", "Ukraine 🇺🇦"].map((origin) => (
                  <span key={origin} className="text-xs uppercase tracking-[0.15em] px-4 py-2 border border-border/50 text-foreground/50 font-light">
                    {origin}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
