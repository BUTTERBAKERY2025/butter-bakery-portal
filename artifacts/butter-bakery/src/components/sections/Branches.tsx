import { FadeIn } from "@/components/ui/fade-in";
import branchAbhaImg from "@/assets/real/branch-abha.jpg";
import branchRiyadhImg from "@/assets/real/branch-riyadh-interior.jpg";
import branchRiyadhCounterImg from "@/assets/real/branch-riyadh-counter.jpg";
import branchAbhaGardenImg from "@/assets/real/branch-abha-garden.jpg";
import branchSeasonalImg from "@/assets/real/branch-seasonal.jpg";
import coffeeBarImg from "@/assets/real/coffee-bar.jpg";

const featuredBranches = [
  {
    city: "Abha",
    location: "Al Hizam — أبها الحزام",
    tagline: "Awarded Best Tourism Project in Asir",
    description:
      "Butter Bakery – Abha Al Hizam is one of the city's most prominent modern landmarks, where elegant architecture blends with the breathtaking nature of the Asir mountains. Located at a strategic site that pulses with life and beauty, this destination earned commendation from the Asir Municipality — selected as one of the best tourism and community projects in the region for its contribution to aesthetic development and attracting visitors. Not just a café and bakery, but a complete experience that combines refined hospitality, local identity, and a unique European character.",
    image: branchAbhaImg,
    secondImage: branchAbhaGardenImg,
    award: "Best Tourism Project — Asir Municipality",
  },
  {
    city: "Riyadh",
    location: "Anas Bin Malik — أنس بن مالك",
    tagline: "A Taste of Excellence — Gathering Point for the Elite",
    description:
      "In the heart of one of Riyadh's most upscale and growing neighborhoods, Butter Bakery – Anas Bin Malik shines as a symbol of modern luxury and upscale hospitality, strategically located connecting the capital's most vital hubs. Carefully designed to reflect our brand's new architectural identity — where luxurious European style meets the warmth of local details. Every corner tells a story: from the luxurious marble floors, to the seating lighting, to the harmony of soothing colors. A daily destination for entrepreneurs, intellectuals, families, and lovers of fine coffee and baked goods.",
    image: branchRiyadhImg,
    secondImage: branchRiyadhCounterImg,
    award: "Symbol of Modern Luxury — Riyadh",
  },
];

const otherBranches = [
  {
    city: "Tabuk",
    location: "Al Ward — تبوك الورد",
    tagline: "Roses bloom with the flavor of Butter Bakery",
    description:
      "In the capital of the north and the bride of roses, Tabuk, Butter Bakery chose to be present with a unique identity that combines the warmth of fresh baked goods with the elegance of modern European design. Since opening, we have witnessed a wide turnout from various customer segments who found Butter Bakery the perfect place to start their day with a cup of specialty coffee, or to end their evening with luxurious flavors. Tabuk is the city of roses — and we are here to add to its fragrance unforgettable flavors, and an experience worth repeating.",
    image: coffeeBarImg,
  },
  {
    city: "Seasonal Mobile",
    location: "Namas · Taif · National Events",
    tagline: "We come to you where the joy is",
    description:
      "At Butter Bakery, we don't just wait for you to come — we strive to be a part of every season, event, and vibrant place across the Kingdom. With every occasion, our seasonal mobile branches tour cities and tourist destinations, bringing with them the unique Butter Bakery experience. You'll find us during the summer seasons in Namas and Taif, winter festivals, national events, and major occasions. Wherever you are in Saudi Arabia, trust that you'll find Butter Bakery.",
    image: branchSeasonalImg,
  },
];

export function Branches() {
  return (
    <section id="locations" className="py-32 bg-secondary relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <FadeIn>
            <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Our Destinations</h2>
            <h3 className="font-serif text-4xl md:text-5xl text-foreground font-medium">Our Branches</h3>
            <p className="text-xs font-light text-primary/70 mt-2 tracking-widest">فروعنا</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-foreground/70 font-light max-w-md leading-relaxed">
              Each Butter Bakery location is thoughtfully designed to reflect its surroundings — combining refined European hospitality with authentic local warmth. Updated to January 2026.
            </p>
          </FadeIn>
        </div>

        {/* Featured Branches with Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {featuredBranches.map((branch, idx) => (
            <FadeIn key={branch.city} delay={idx * 0.2} direction="up" className="group">
              <div className="bg-background rounded-sm overflow-hidden border border-border/50 h-full flex flex-col">
                {/* Main image */}
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={branch.image}
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
                {/* Second image strip */}
                <div className="h-28 overflow-hidden relative">
                  <img
                    src={branch.secondImage}
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

        {/* Other Branches with photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {otherBranches.map((branch, idx) => (
            <FadeIn key={branch.city} delay={0.4 + idx * 0.1} direction="up">
              <div className="bg-background rounded-sm overflow-hidden border border-border/50 h-full flex flex-col transition-colors hover:border-primary/50 group">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={branch.image}
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
              "We create a different time… with a flavor that resembles you."
            </p>
            <p className="text-primary text-xs uppercase tracking-[0.3em] mt-3 font-medium">
              نصنع وقتاً مختلفاً… بنكهة تشبهك
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
