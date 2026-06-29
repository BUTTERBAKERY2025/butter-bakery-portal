import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import coffeeImg from "@/assets/coffee.png";
import pastryImg from "@/assets/pastry.png";

const otherProducts = [
  {
    title: "Chimney Cake",
    description: "An original 100-year-old recipe revived. Cone-shaped baked cakes with exquisite sweet and savory flavors."
  },
  {
    title: "Neapolitan Pizza & Sourdough",
    description: "Authentic wood-fired techniques. 72-hour fermented dough for the perfect crust and artisanal sourdough loaves."
  },
  {
    title: "Artisanal Ice Cream",
    description: "Handcrafted daily using premium ingredients, featuring both classic European and localized Saudi flavor profiles."
  },
  {
    title: "Catering & Events",
    description: "Bringing the Butter Bakery experience to your most important gatherings with bespoke catering services."
  }
];

export function Products() {
  return (
    <section id="products" className="py-32 md:py-48 bg-background relative">
      <div className="container mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-20 md:mb-32">
          <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Our Craft</h2>
          <h3 className="font-serif text-4xl md:text-5xl text-foreground font-medium">Exquisite Offerings</h3>
        </FadeIn>

        {/* Highlight Products: Coffee & Pastry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
          
          {/* Coffee */}
          <div className="group">
            <FadeIn direction="up">
              <div className="aspect-[4/3] w-full overflow-hidden mb-8 relative">
                <img 
                  src={coffeeImg} 
                  alt="Specialty Coffee" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
              </div>
              <h4 className="font-serif text-3xl text-foreground mb-4">Specialty Coffee</h4>
              <p className="text-foreground/70 font-light leading-relaxed mb-6">
                Meticulously sourced beans, expertly roasted and brewed. From our signature V60 and Japanese Drip to rich Espressos, classic Lattes, and our beloved Pistachio and Spanish Lattes.
              </p>
              <div className="h-[1px] w-full bg-border" />
            </FadeIn>
          </div>

          {/* Pastry */}
          <div className="group lg:mt-24">
            <FadeIn direction="up" delay={0.2}>
              <div className="aspect-[4/3] w-full overflow-hidden mb-8 relative">
                <img 
                  src={pastryImg} 
                  alt="French Pastry" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
              </div>
              <h4 className="font-serif text-3xl text-foreground mb-4">French Pastry</h4>
              <p className="text-foreground/70 font-light leading-relaxed mb-6">
                Mastering the delicate art of French patisserie. Buttery croissants, delicate macarons, elegant tarts, and signature individual cakes including Raspberry Vanilla, Gianduja Hazelnut, Exotic Cheesecake, and Opera.
              </p>
              <div className="h-[1px] w-full bg-border" />
            </FadeIn>
          </div>

        </div>

        {/* Other Products Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 lg:gap-y-24">
          {otherProducts.map((product, idx) => (
            <StaggerItem key={product.title} direction="up">
              <div className="pl-6 border-l border-primary/30 h-full flex flex-col justify-center transition-colors hover:border-primary">
                <h4 className="font-serif text-2xl text-foreground mb-3">{product.title}</h4>
                <p className="text-foreground/70 font-light leading-relaxed text-base">
                  {product.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
