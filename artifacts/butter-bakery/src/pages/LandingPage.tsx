import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Story } from "@/components/sections/Story";
import { Mission } from "@/components/sections/Mission";
import { Products } from "@/components/sections/Products";
import { Branches } from "@/components/sections/Branches";
import { Investment } from "@/components/sections/Investment";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground">
      <Navbar />
      
      <main>
        <Hero />
        <Story />
        <Mission />
        <Products />
        <Branches />
        <Investment />
      </main>

      <Footer />
    </div>
  );
}
