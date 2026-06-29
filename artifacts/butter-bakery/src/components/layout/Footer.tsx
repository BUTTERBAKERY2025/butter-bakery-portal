import { FadeIn } from "@/components/ui/fade-in";
import logoBb from "@/assets/real/logo-bb.jpg";

export function Footer() {
  return (
    <footer className="bg-dark-section text-background py-24 border-t border-white/10" id="contact">
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
          <div className="flex gap-6 items-center">
            <a
              href="https://www.instagram.com/butterbakery_sa/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <svg className="w-3.5 h-3.5 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              @butterbakery_sa
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
