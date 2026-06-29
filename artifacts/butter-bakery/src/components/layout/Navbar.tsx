import { Link } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logoBb from "@/assets/real/logo-bb.jpg";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border/50 py-4 shadow-sm" : "bg-transparent py-6"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <div className={`w-10 h-10 overflow-hidden rounded-sm transition-all duration-500 ${isScrolled ? "ring-1 ring-border" : "ring-1 ring-white/20"}`}>
            <img src={logoBb} alt="Butter Bakery Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-start">
            <span className={`font-serif text-lg font-bold tracking-wider transition-colors duration-500 leading-none ${isScrolled ? "text-foreground" : "text-white"}`}>
              BUTTER
            </span>
            <span className={`text-[0.55rem] uppercase tracking-[0.3em] font-medium transition-colors duration-500 ${isScrolled ? "text-primary" : "text-white/80"}`}>
              BAKERY
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Story", href: "#story" },
            { label: "Products", href: "#products" },
            { label: "Locations", href: "#locations" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-sm tracking-wide transition-colors duration-300 hover:text-primary ${
                isScrolled ? "text-foreground/80" : "text-white/90"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="#invest"
            className={`text-xs uppercase tracking-widest px-5 py-2.5 border transition-all duration-300 ${
              isScrolled
                ? "border-primary text-primary hover:bg-primary hover:text-white"
                : "border-white/50 text-white hover:bg-white hover:text-foreground"
            }`}
          >
            Invest With Us
          </a>
        </div>
      </div>
    </motion.header>
  );
}
