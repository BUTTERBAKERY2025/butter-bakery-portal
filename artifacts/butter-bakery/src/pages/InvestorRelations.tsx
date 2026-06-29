import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, TrendingUp, Users, Building2, Globe, ChevronRight, Send } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useLang } from "@/contexts/LanguageContext";
import logoBb from "@/assets/real/logo-bb.jpg";
import airlineBbImg from "@/assets/real/airline-bb.jpg";

const pillarIcons = [Building2, TrendingUp, Globe, Users, ChevronRight, ChevronRight];

interface FormState {
  name: string;
  company: string;
  email: string;
  type: string;
  message: string;
}

export default function InvestorRelations() {
  const { t, lang, toggleLang, isAr } = useLang();
  const inv = t.investment;
  const [form, setForm] = useState<FormState>({ name: "", company: "", email: "", type: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = isAr
      ? "علاقات المستثمرين — بتر بيكري"
      : "Investor Relations — Butter Bakery";
  }, [isAr]);

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = isAr
      ? `استفسار استثماري — ${form.company || form.name}`
      : `Investment Inquiry — ${form.company || form.name}`;
    const body = [
      `${isAr ? "الاسم" : "Name"}: ${form.name}`,
      `${isAr ? "الشركة" : "Company"}: ${form.company}`,
      `${isAr ? "الإيميل" : "Email"}: ${form.email}`,
      `${isAr ? "نوع الاستفسار" : "Inquiry Type"}: ${form.type}`,
      "",
      form.message,
    ].join("\n");
    window.open(`mailto:info@butterbakery.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setSent(true);
  };

  const field = "w-full px-4 py-3 border border-border bg-transparent text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors duration-300";

  const inquiryTypes = isAr
    ? ["استثمار مباشر", "شراكة استراتيجية", "عقد توريد B2B", "استفسار عام"]
    : ["Direct Investment", "Strategic Partnership", "B2B Supply Contract", "General Inquiry"];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group text-foreground/60 hover:text-primary transition-colors text-sm">
            <BackArrow className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="tracking-wide">{isAr ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>

          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 overflow-hidden rounded-sm ring-1 ring-border">
              <img src={logoBb} alt="Butter Bakery" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-sm font-bold tracking-wider text-foreground hidden sm:block">BUTTER BAKERY</span>
          </Link>

          <button
            onClick={toggleLang}
            className="text-xs font-medium tracking-widest px-3 py-2 border border-border text-foreground/60 hover:border-primary hover:text-primary transition-all duration-300"
          >
            {lang === "en" ? "عربي" : "EN"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-dark-section text-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.35em] mb-6">
              {isAr ? "بتر بيكري — علاقات المستثمرين" : "Butter Bakery — Investor Relations"}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-medium text-white mb-8 leading-tight max-w-3xl whitespace-pre-line">
              {isAr ? "علاقات\nالمستثمرين" : "Investor\nRelations"}
            </h1>
            <p className="text-background/60 max-w-xl leading-relaxed text-lg font-light">
              {inv.p1}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-b border-border/50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {inv.stats.map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="text-center md:text-start">
                  <p className="font-serif text-4xl md:text-5xl font-medium text-primary mb-2">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-sm font-semibold text-foreground mb-1">{stat.label}</p>
                  <p className="text-xs text-foreground/50 font-light leading-relaxed">{stat.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">{inv.whyEyebrow}</p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-16 max-w-lg whitespace-pre-line">
              {isAr ? "لماذا تستثمر\nمع بتر بيكري؟" : "Why Invest\nWith Butter Bakery?"}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {inv.pillars.map((pillar, i) => {
              const Icon = pillarIcons[i] ?? ChevronRight;
              return (
                <FadeIn key={i} delay={i * 0.08} direction="up">
                  <div className="group p-8 border border-border hover:border-primary/40 transition-colors duration-500 bg-secondary/40 hover:bg-secondary/70">
                    <div className="w-10 h-10 flex items-center justify-center border border-primary/20 text-primary mb-6 group-hover:border-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-xl text-foreground mb-3">{pillar.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed font-light">{pillar.body}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Revenue streams */}
      <section className="py-20 bg-dark-section text-background">
        <div className="container mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-12">{inv.segmentationEyebrow}</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
            {[inv.b2c, inv.b2b, inv.b2g].map((stream, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-dark-section p-10">
                  <p className="text-primary font-mono text-2xl font-bold mb-4">{stream.label}</p>
                  <p className="text-background/60 text-sm leading-relaxed font-light">{stream.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Airline image */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <FadeIn direction={isAr ? "right" : "left"}>
              <div className="overflow-hidden">
                <img
                  src={airlineBbImg}
                  alt="Airline Partnership"
                  className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </FadeIn>
            <FadeIn direction={isAr ? "left" : "right"} delay={0.15}>
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">{inv.b2gLabel}</p>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-6">{isAr ? "شراكة الطيران" : "Airline Partnership"}</h3>
              <p className="text-foreground/60 leading-relaxed font-light">{inv.b2g.body}</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-secondary/40 border-t border-border/50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">

            {/* Left: heading */}
            <FadeIn direction={isAr ? "right" : "left"}>
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">
                {isAr ? "تواصل معنا" : "Get In Touch"}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 leading-tight">
                {isAr ? "أرسل\nاستفسارك" : "Send Your\nInquiry"}
              </h2>
              <p className="text-foreground/60 font-light leading-relaxed mb-10">
                {inv.contactLine}
              </p>
              <div className="space-y-4">
                <a href="mailto:info@butterbakery.co" className="flex items-center gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
                  <div className="w-8 h-8 border border-border flex items-center justify-center text-primary shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  info@butterbakery.co
                </a>
                <a href="https://www.butterbakery.co" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
                  <div className="w-8 h-8 border border-border flex items-center justify-center text-primary shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  www.butterbakery.co
                </a>
              </div>
            </FadeIn>

            {/* Right: form */}
            <FadeIn direction={isAr ? "left" : "right"} delay={0.1}>
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 border border-primary/20 bg-primary/5"
                >
                  <div className="w-14 h-14 border border-primary text-primary flex items-center justify-center mx-auto mb-6">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground mb-3">
                    {isAr ? "تم إرسال استفسارك" : "Inquiry Sent"}
                  </h3>
                  <p className="text-foreground/60 text-sm font-light mb-6">
                    {isAr ? "سيتواصل معك فريقنا قريباً على إيميلك." : "Our team will reach out to you soon."}
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", company: "", email: "", type: "", message: "" }); }}
                    className="text-xs uppercase tracking-widest text-primary hover:underline"
                  >
                    {isAr ? "إرسال آخر" : "Send Another"}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/40 mb-2">
                        {isAr ? "الاسم *" : "Name *"}
                      </label>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder={isAr ? "اسمك الكريم" : "Your name"}
                        className={field}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-foreground/40 mb-2">
                        {isAr ? "الشركة / المنظمة" : "Company / Organization"}
                      </label>
                      <input
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder={isAr ? "اسم شركتك" : "Your company"}
                        className={field}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-foreground/40 mb-2">
                      {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder={isAr ? "بريدك الإلكتروني" : "your@email.com"}
                      className={field}
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-foreground/40 mb-2">
                      {isAr ? "نوع الاستفسار" : "Inquiry Type"}
                    </label>
                    <select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className={`${field} appearance-none cursor-pointer`}
                    >
                      <option value="">{isAr ? "اختر النوع..." : "Select type..."}</option>
                      {inquiryTypes.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-foreground/40 mb-2">
                      {isAr ? "رسالتك" : "Message"}
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder={isAr ? "اكتب رسالتك هنا..." : "Tell us about your interest..."}
                      className={`${field} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white text-sm uppercase tracking-widest hover:bg-primary/80 transition-colors duration-300"
                  >
                    <Send className="w-4 h-4" />
                    {isAr ? "إرسال الاستفسار" : "Send Inquiry"}
                  </button>
                </form>
              )}
            </FadeIn>

          </div>
        </div>
      </section>

      {/* Footer bar */}
      <div className="bg-dark-section py-6 border-t border-white/10">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/30 uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Butter Bakery. {t.footer.copyright}</p>
          <Link href="/" className="hover:text-primary transition-colors">
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
