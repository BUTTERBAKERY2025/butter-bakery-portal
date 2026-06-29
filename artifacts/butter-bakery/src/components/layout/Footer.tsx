import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-24 border-t border-white/10" id="contact">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          
          <div className="md:col-span-5 flex flex-col">
            <FadeIn>
              <h3 className="font-serif text-3xl font-bold tracking-wide mb-2">BUTTER BAKERY</h3>
              <p className="text-primary text-sm uppercase tracking-[0.2em] mb-8">Freshly Baked Every Day</p>
              <p className="text-background/70 max-w-sm font-light leading-relaxed mb-8">
                Where European artisan craft meets Saudi warmth. A luxury destination built from friendship, crafted for those who appreciate the art of baking.
              </p>
            </FadeIn>
          </div>

          <div className="md:col-span-3">
            <FadeIn delay={0.1}>
              <h4 className="text-xs uppercase tracking-widest text-background/50 mb-6">Contact</h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:info@butterbakery.co" className="hover:text-primary transition-colors duration-300">
                    info@butterbakery.co
                  </a>
                </li>
                <li>
                  <a href="https://www.butterbakery.co" className="hover:text-primary transition-colors duration-300">
                    www.butterbakery.co
                  </a>
                </li>
              </ul>
            </FadeIn>
          </div>

          <div className="md:col-span-4">
            <FadeIn delay={0.2}>
              <h4 className="text-xs uppercase tracking-widest text-background/50 mb-6">Vision 2030</h4>
              <p className="text-background/70 font-light leading-relaxed">
                Proudly aligned with Saudi Arabia's Vision 2030, contributing to a vibrant society and a thriving economy through culinary excellence and unparalleled hospitality.
              </p>
            </FadeIn>
          </div>

        </div>

        <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/40 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Butter Bakery. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-background transition-colors">Instagram</a>
            <a href="#" className="hover:text-background transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-background transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
