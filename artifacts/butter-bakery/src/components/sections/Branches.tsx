import { FadeIn } from "@/components/ui/fade-in";
import branchAbha from "@/assets/branch-abha.png";
import branchRiyadh from "@/assets/branch-riyadh.png";

const branches = [
  {
    city: "Abha",
    location: "Al Hizam",
    description: "An architectural masterpiece in the Asir mountains. Awarded the best tourism project in the region, this branch offers breathtaking views matched only by our culinary craft.",
    image: branchAbha,
    featured: true
  },
  {
    city: "Riyadh",
    location: "Anas Bin Malik",
    description: "A symbol of modern luxury. With elegant marble floors and a vibrant atmosphere, it has become the daily destination for the city's entrepreneurs and families.",
    image: branchRiyadh,
    featured: true
  },
  {
    city: "Tabuk",
    location: "Al Ward",
    description: "Our 'City of Roses' branch. Here, European elegance seamlessly meets the profound warmth of northern Saudi hospitality.",
    featured: false
  },
  {
    city: "Seasonal",
    location: "Mobile & Pop-up",
    description: "Bringing the Butter Bakery experience to Namas, Taif during the summer, exclusive winter festivals, and prestigious national events.",
    featured: false
  }
];

export function Branches() {
  return (
    <section id="locations" className="py-32 bg-secondary relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <FadeIn>
            <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Our Destinations</h2>
            <h3 className="font-serif text-4xl md:text-5xl text-foreground font-medium">The Branches</h3>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-foreground/70 font-light max-w-md">
              Each Butter Bakery location is thoughtfully designed to reflect its surroundings while maintaining our signature aesthetic of warm, unhurried luxury.
            </p>
          </FadeIn>
        </div>

        {/* Featured Branches with Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {branches.filter(b => b.featured).map((branch, idx) => (
            <FadeIn key={branch.city} delay={idx * 0.2} direction="up" className="group">
              <div className="bg-background rounded-sm overflow-hidden border border-border/50 h-full flex flex-col">
                <div className="aspect-[16/9] overflow-hidden relative">
                  {branch.image && (
                    <img 
                      src={branch.image} 
                      alt={`Butter Bakery ${branch.city} Branch`} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 text-xs font-medium tracking-widest uppercase text-foreground">
                    {branch.city}
                  </div>
                </div>
                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  <h4 className="font-serif text-2xl mb-2">{branch.location}</h4>
                  <p className="text-foreground/70 font-light leading-relaxed flex-grow">
                    {branch.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Non-featured Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {branches.filter(b => !b.featured).map((branch, idx) => (
            <FadeIn key={branch.city} delay={0.4 + (idx * 0.1)} direction="up">
              <div className="bg-background rounded-sm p-8 md:p-10 border border-border/50 h-full transition-colors hover:border-primary/50">
                <div className="text-primary text-xs font-medium tracking-widest uppercase mb-4">
                  {branch.city}
                </div>
                <h4 className="font-serif text-2xl mb-4">{branch.location}</h4>
                <p className="text-foreground/70 font-light leading-relaxed">
                  {branch.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
