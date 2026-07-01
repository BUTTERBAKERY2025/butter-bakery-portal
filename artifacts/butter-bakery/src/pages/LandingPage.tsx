import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Story } from "@/components/sections/Story";
import { Mission } from "@/components/sections/Mission";
import { Products } from "@/components/sections/Products";
import { Branches } from "@/components/sections/Branches";
import { Gallery } from "@/components/sections/Gallery";
import { Experience } from "@/components/sections/Experience";
import { Investment } from "@/components/sections/Investment";
import { Testimonials } from "@/components/sections/Testimonials";
import { Catering } from "@/components/sections/Catering";
import { FollowUs } from "@/components/sections/FollowUs";
import { BrandMarquee } from "@/components/ui/BrandMarquee";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground">
      <Navbar />

      <main>
        <Hero />
        <BrandMarquee />
        <Story />
        <Mission />
        <Products />
        <Branches />
        <Gallery />
        <Catering />
        <Experience />
        <Investment />
        <Testimonials />
        <FollowUs />
      </main>

      <Footer />
      <ScrollToTop />
      <WhatsAppButton />
    </div>
  );
}
