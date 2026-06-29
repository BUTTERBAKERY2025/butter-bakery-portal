import { FadeIn } from "@/components/ui/fade-in";
import logoBb from "@/assets/real/logo-bb.jpg";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-24 border-t border-white/10" id="contact">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">

          <div className="md:col-span-5 flex flex-col">
            <FadeIn>
              {/* Real Logo */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 overflow-hidden rounded-sm ring-1 ring-white/10">
                  <img src={logoBb} alt="Butter Bakery Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-serif text-xl font-bold tracking-wider text-white leading-none">BUTTER BAKERY</p>
                  <p className="text-primary text-[0.6rem] uppercase tracking-[0.3em] mt-0.5">Bakery & Café</p>
                </div>
              </div>
              <p className="text-primary text-sm uppercase tracking-[0.15em] mb-6 font-light">
                يُخبز طازج كل يوم — Freshly Baked Every Day
              </p>
              <p className="text-background/60 max-w-sm font-light leading-relaxed">
                Where European artisan craft meets Saudi warmth. A luxury destination built from friendship, crafted for those who appreciate the art of baking.
              </p>
            </FadeIn>
          </div>

          <div className="md:col-span-2">
            <FadeIn delay={0.1}>
              <h4 className="text-xs uppercase tracking-widest text-background/40 mb-6">Navigate</h4>
              <ul className="space-y-3 text-sm font-light">
                {[
                  { label: "Our Story", href: "#story" },
                  { label: "Products", href: "#products" },
                  { label: "Branches", href: "#locations" },
                  { label: "Gallery", href: "#gallery" },
                  { label: "Invest", href: "#invest" },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-background/60 hover:text-primary transition-colors duration-300">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>

          <div className="md:col-span-2">
            <FadeIn delay={0.15}>
              <h4 className="text-xs uppercase tracking-widest text-background/40 mb-6">Contact</h4>
              <ul className="space-y-4 text-sm font-light">
                <li>
                  <a href="mailto:info@butterbakery.co" className="text-background/60 hover:text-primary transition-colors duration-300">
                    info@butterbakery.co
                  </a>
                </li>
                <li>
                  <a href="https://www.butterbakery.co" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-primary transition-colors duration-300">
                    www.butterbakery.co
                  </a>
                </li>
              </ul>
            </FadeIn>
          </div>

          <div className="md:col-span-3">
            <FadeIn delay={0.2}>
              <h4 className="text-xs uppercase tracking-widest text-background/40 mb-6">Our Branches</h4>
              <ul className="space-y-2 text-sm font-light text-background/60">
                <li>Abha — Al Hizam (أبها الحزام)</li>
                <li>Riyadh — Anas Bin Malik (أنس بن مالك)</li>
                <li>Tabuk — Al Ward (تبوك الورد)</li>
                <li className="text-primary/70 text-xs italic pt-1">Seasonal: Namas · Taif · National Events</li>
              </ul>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-background/40 font-light leading-relaxed">
                  Proudly aligned with Saudi Arabia's Vision 2030 — contributing to a vibrant society through culinary excellence.
                </p>
              </div>
            </FadeIn>
          </div>

        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/30 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Butter Bakery. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://instagram.com/butterbakery" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a>
            <a href="https://linkedin.com/company/butterbakery" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="https://x.com/butterbakery" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">X</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
