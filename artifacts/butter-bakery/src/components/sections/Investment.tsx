import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import brandBagImg from "@/assets/real/brand-bag.jpg";
import airlineBbImg from "@/assets/real/airline-bb.jpg";
import customerCupImg from "@/assets/real/customer-cup.jpg";

const stats = [
  { value: "98%", label: "Customer Return Rate", sub: "Certified by our recurring customer base" },
  { value: "65%+", label: "Millennial Customers", sub: "The largest consumer group with significant spending power" },
  { value: "94%", label: "Female Purchase Decisions", sub: "Women drive household and lifestyle spending" },
  { value: "3", label: "Revenue Streams", sub: "B2C · B2B · B2G — individuals, companies & government" },
];

const pillars = [
  {
    title: "Proven Multi-City Concept",
    body: "Operational branches in Abha (award-winning tourism project), Riyadh (Anas Bin Malik), and Tabuk — plus seasonal mobile branches at Namas, Taif, winter festivals, and national events.",
  },
  {
    title: "B2C + B2B + B2G Revenue",
    body: "We serve individual end-customers directly through our branches, supply companies, offices, restaurants, and cafés on regular contracts, and engage in government tenders and institutional catering — including airline partnerships.",
  },
  {
    title: "Vision 2030 Aligned",
    body: "Positioned at the heart of Saudi Arabia's F&B transformation — combining European baking excellence with authentic Saudi taste, serving an evolving, sophisticated society.",
  },
  {
    title: "Strong Brand Identity",
    body: "From the charming streets of Paris to the traditions of Ukraine to the mountains of Asir — a brand built on experience, craft, and emotion. Our customers don't just buy product; they buy identity.",
  },
];

export function Investment() {
  return (
    <section id="invest" className="py-32 md:py-48 bg-foreground text-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-24">
          <div className="lg:col-span-5">
            <FadeIn>
              <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">Partner With Us</h2>
              <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.1] mb-8">
                A Scalable <br /> Premium Brand
              </h3>
              <p className="text-background/70 font-light text-lg leading-relaxed mb-10">
                Butter Bakery is positioned at the intersection of luxury F&B and aggressive market growth. We have built a robust, culturally resonant brand that thrives in the rapidly expanding Saudi market — delivering consistent excellence across multiple cities with a proven concept, remarkable customer loyalty, and diversified revenue streams.
              </p>
              <p className="text-background/50 font-light text-sm leading-relaxed mb-10">
                Our customers span businessmen and women, intellectuals, creatives, and globe-trotting travelers who have found at Butter Bakery the same taste they experienced in Europe's most famous culinary cities — but with a local flavor that adds warmth and identity.
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
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <StaggerItem key={i} direction="up" className="bg-background/5 border border-white/10 p-8 hover:border-primary/50 transition-colors duration-500">
                  <div className="font-serif text-4xl md:text-5xl text-primary mb-3">{stat.value}</div>
                  <div className="text-sm uppercase tracking-widest text-white/90 leading-snug mb-2">{stat.label}</div>
                  <div className="text-xs text-background/50 font-light leading-relaxed">{stat.sub}</div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>

        {/* Real photo strip — brand in action */}
        <FadeIn>
          <div className="grid grid-cols-3 gap-3 mb-16 h-52">
            <div className="overflow-hidden relative group col-span-1">
              <img
                src={brandBagImg}
                alt="Butter Bakery branded takeaway bag"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <p className="absolute bottom-3 left-3 text-[9px] uppercase tracking-widest text-white/70">Brand Identity</p>
            </div>
            <div className="overflow-hidden relative group col-span-1">
              <img
                src={customerCupImg}
                alt="Customer with Butter Bakery coffee cup"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <p className="absolute bottom-3 left-3 text-[9px] uppercase tracking-widest text-white/70">Customer Experience</p>
            </div>
            <div className="overflow-hidden relative group col-span-1">
              <img
                src={airlineBbImg}
                alt="Butter Bakery products on airline — B2G partnership"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <p className="absolute bottom-3 left-3 text-[9px] uppercase tracking-widest text-white/70">B2G · Airline Partner</p>
            </div>
          </div>
        </FadeIn>

        {/* Investment Pillars */}
        <FadeIn>
          <div className="border-t border-white/10 pt-16">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-12">Why Butter Bakery</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {pillars.map((pillar, i) => (
                <FadeIn key={i} delay={i * 0.1} direction="up">
                  <div className="border-l border-primary/30 pl-6 hover:border-primary transition-colors duration-300">
                    <h4 className="font-serif text-xl text-white mb-3">{pillar.title}</h4>
                    <p className="text-background/60 font-light text-sm leading-relaxed">{pillar.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Customer Segmentation Note */}
        <FadeIn delay={0.3}>
          <div className="mt-16 p-8 md:p-12 bg-white/5 border border-white/10">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium mb-6">Customer Segmentation</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="font-serif text-2xl text-white mb-2">B2C</p>
                <p className="text-background/60 font-light text-sm leading-relaxed">Individual consumers purchasing directly at our branches or through delivery apps. Primarily millennials (65%+) with high spending power.</p>
              </div>
              <div>
                <p className="font-serif text-2xl text-white mb-2">B2B</p>
                <p className="text-background/60 font-light text-sm leading-relaxed">Companies, offices, restaurants, and cafés requiring regular supply of baked goods and ready products on ongoing contracts.</p>
              </div>
              <div>
                <p className="font-serif text-2xl text-white mb-2">B2G</p>
                <p className="text-background/60 font-light text-sm leading-relaxed">Government contracts and institutional tenders — including airline partnerships — for supplying bakery products at official events and to government departments.</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Contact */}
        <FadeIn delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-background/50 text-sm font-light mb-2">
              For investment inquiries, partnership proposals, or supply agreements:
            </p>
            <a href="mailto:info@butterbakery.co" className="text-primary font-medium hover:text-white transition-colors">
              info@butterbakery.co
            </a>
            <span className="text-background/30 mx-3">·</span>
            <a href="https://www.butterbakery.co" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:text-white transition-colors">
              www.butterbakery.co
            </a>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
