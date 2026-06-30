import { Link } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logoBb from "@/assets/real/logo-bb.jpg";
import { useLang } from "@/contexts/LanguageContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { t, lang, toggleLang, isAr } = useLang();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ids = ["story", "products", "locations", "gallery"];
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -50% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navItems = [
    { label: t.nav.story, href: "#story" },
    { label: t.nav.products, href: "#products" },
    { label: t.nav.locations, href: "#locations" },
    { label: t.nav.gallery, href: "#gallery" },
  ];

  const close = () => setMobileOpen(false);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 py-4 shadow-sm"
            : "bg-transparent py-6"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const sectionId = item.href.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`text-sm tracking-wide transition-all duration-300 relative ${isAr ? "font-medium" : ""} ${
                    isActive
                      ? "text-primary"
                      : isScrolled
                      ? "text-foreground/80 hover:text-primary"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className={`text-xs font-medium tracking-widest px-3 py-2 border transition-all duration-300 ${
                isScrolled
                  ? "border-border text-foreground/60 hover:border-primary hover:text-primary"
                  : "border-white/30 text-white/70 hover:border-white hover:text-white"
              }`}
              aria-label="Toggle language"
            >
              {lang === "en" ? "عربي" : "EN"}
            </button>

            {/* Desktop: Invest */}
            <a
              href="/investor-relations"
              className={`hidden md:inline-flex text-xs uppercase tracking-widest px-5 py-2.5 border transition-all duration-300 ${
                isScrolled
                  ? "border-primary text-primary hover:bg-primary hover:text-white"
                  : "border-white/50 text-white hover:bg-white hover:text-foreground"
              }`}
            >
              {t.nav.invest}
            </a>

            {/* Mobile: Hamburger */}
            <button
              className={`md:hidden p-1.5 transition-colors duration-300 ${
                isScrolled ? "text-foreground/70 hover:text-foreground" : "text-white/80 hover:text-white"
              }`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 overflow-hidden rounded-sm ring-1 ring-border">
                  <img src={logoBb} alt="Butter Bakery" className="w-full h-full object-cover" />
                </div>
                <span className="font-serif text-base font-bold tracking-widest text-foreground">BUTTER BAKERY</span>
              </div>
              <button
                onClick={close}
                className="p-1.5 text-foreground/60 hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-col items-center justify-center flex-1 gap-2 px-6">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.08, duration: 0.4, ease: "easeOut" }}
                  className={`font-serif text-4xl md:text-5xl text-foreground/75 hover:text-primary transition-colors duration-300 py-3 ${isAr ? "font-normal" : ""}`}
                >
                  {item.label}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.45 }}
                className="h-[1px] w-16 bg-border my-4"
              />

              <motion.a
                href="/investor-relations"
                onClick={close}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-serif text-2xl text-primary hover:text-foreground transition-colors duration-300 py-2"
              >
                {t.nav.invest}
              </motion.a>
            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between px-8 py-8 border-t border-border/30">
              <button
                onClick={() => { toggleLang(); close(); }}
                className="text-sm uppercase tracking-[0.25em] text-foreground/40 hover:text-primary transition-colors font-medium"
              >
                {lang === "en" ? "العربية" : "English"}
              </button>
              <a
                href="mailto:info@butterbakery.co"
                className="text-xs text-foreground/30 hover:text-primary transition-colors tracking-widest"
              >
                info@butterbakery.co
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
