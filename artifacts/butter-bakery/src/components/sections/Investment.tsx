import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

const stats = [
  { value: "98%", label: "Customer Return Rate" },
  { value: "3+", label: "Revenue Streams (B2C, B2B, B2G)" },
  { value: "Vision", label: "2030 Aligned Expansion" },
  { value: "Proven", label: "Multi-City Concept" },
];

export function Investment() {
  return (
    <section id="invest" className="py-32 md:py-48 bg-foreground text-background relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5">
            <FadeIn>
              <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Partner With Us</h2>
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.1] mb-8">
                A Scalable <br /> Premium Brand
              </h3>
              <p className="text-background/70 font-light text-lg leading-relaxed mb-10">
                Butter Bakery is positioned at the intersection of luxury F&B and aggressive market growth. We have built a robust, culturally resonant brand that thrives in the rapidly expanding Saudi market, delivering consistent excellence and remarkable unit economics.
              </p>
              
              <a 
                href="mailto:info@butterbakery.co?subject=Investment Inquiry" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground text-sm uppercase tracking-widest font-medium transition-all hover:bg-white hover:text-foreground"
              >
                Invest With Us
              </a>
            </FadeIn>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {stats.map((stat, i) => (
                <StaggerItem key={i} direction="up" className="bg-background/5 border border-white/10 p-8 hover:border-primary/50 transition-colors duration-500">
                  <div className="font-serif text-4xl md:text-5xl text-primary mb-4">{stat.value}</div>
                  <div className="text-sm uppercase tracking-widest text-background/80 leading-relaxed">{stat.label}</div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

        </div>
      </div>
    </section>
  );
}
