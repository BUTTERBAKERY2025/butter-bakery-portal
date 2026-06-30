import { FadeIn } from "@/components/ui/fade-in";
import branchAbhaImg from "@/assets/real/branch-abha.jpg";
import branchRiyadhImg from "@/assets/real/branch-riyadh-interior.jpg";
import branchRiyadhCounterImg from "@/assets/real/branch-riyadh-counter.jpg";
import branchAbhaGardenImg from "@/assets/real/branch-abha-garden.jpg";
import branchSeasonalImg from "@/assets/real/branch-seasonal.jpg";
import coffeeBarImg from "@/assets/real/coffee-bar.jpg";
import { useLang } from "@/contexts/LanguageContext";

const featuredImages = [
  { image: branchAbhaImg, secondImage: branchAbhaGardenImg },
  { image: branchRiyadhImg, secondImage: branchRiyadhCounterImg },
];

const otherImages = [coffeeBarImg, branchSeasonalImg];

export function Branches() {
  const { t } = useLang();
  const b = t.branches;

  return (
    <section id="locations" className="py-20 md:py-32 bg-secondary relative">
      <div className="container mx-auto px-5 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <FadeIn>
            <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">{b.eyebrow}</h2>
            <h3 className="font-serif text-4xl md:text-5xl text-foreground font-medium">{b.title}</h3>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-foreground/70 font-light max-w-md leading-relaxed">
              {b.subtitle}
            </p>
          </FadeIn>
        </div>

        {/* Featured Branches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {b.featured.map((branch, idx) => (
            <FadeIn key={idx} delay={idx * 0.2} direction="up" className="group">
              <div className="bg-background rounded-sm overflow-hidden border border-border/50 h-full flex flex-col">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={featuredImages[idx].image}
                    alt={`Butter Bakery ${branch.city} Branch`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 text-xs font-medium tracking-widest uppercase text-foreground">
                    {branch.city}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium tracking-wide text-background">
                    {branch.award}
                  </div>
                </div>
                <div className="h-28 overflow-hidden relative">
                  <img
                    src={featuredImages[idx].secondImage}
                    alt={`${branch.city} interior`}
                    className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                </div>
                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  <h4 className="font-serif text-2xl mb-1">{branch.location}</h4>
                  <p className="text-primary text-xs uppercase tracking-[0.2em] font-medium mb-4">{branch.tagline}</p>
                  <p className="text-foreground/70 font-light leading-relaxed flex-grow text-sm">
                    {branch.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Other Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {b.others.map((branch, idx) => (
            <FadeIn key={idx} delay={0.4 + idx * 0.1} direction="up">
              <div className="bg-background rounded-sm overflow-hidden border border-border/50 h-full flex flex-col transition-colors hover:border-primary/50 group">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={otherImages[idx]}
                    alt={`Butter Bakery ${branch.city}`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  <div className="text-primary text-xs font-medium tracking-widest uppercase mb-2">
                    {branch.city}
                  </div>
                  <h4 className="font-serif text-2xl mb-1">{branch.location}</h4>
                  <p className="text-foreground/50 text-xs uppercase tracking-[0.15em] font-light mb-4 italic">{branch.tagline}</p>
                  <p className="text-foreground/70 font-light leading-relaxed text-sm">
                    {branch.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Quote */}
        <FadeIn delay={0.6}>
          <div className="mt-20 text-center">
            <p className="font-serif text-xl md:text-2xl text-foreground/60 italic">
              {b.quote}
            </p>
            <p className="text-primary text-xs uppercase tracking-[0.3em] mt-3 font-medium">
              {b.quoteAr}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
