import { FadeIn } from "@/components/ui/fade-in";
import { useLang } from "@/contexts/LanguageContext";

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 fill-primary" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

const reviews = {
  en: [
    {
      quote: "The croissants here are genuinely the best I've had in the Kingdom. Every detail feels intentional — the ambiance, the service, the flavours.",
      name: "Lama A.",
      city: "Riyadh",
      stars: 5,
    },
    {
      quote: "Butter Bakery has become our family's weekend ritual in Abha. The chimney cakes are unmatched and the team always makes us feel at home.",
      name: "Mohammed K.",
      city: "Abha",
      stars: 5,
    },
    {
      quote: "As someone who lived in Europe for years, I was genuinely impressed by how authentic the coffee and pastry experience is. World-class quality.",
      name: "Reem S.",
      city: "Riyadh",
      stars: 5,
    },
    {
      quote: "The outdoor seasonal branch is one of a kind — incredible atmosphere, beautiful setting, and the food matches every bit of it.",
      name: "Abdullah F.",
      city: "Abha",
      stars: 5,
    },
    {
      quote: "The Medina branch is a true gem — watching the golden hour from the rooftop terrace with a perfect flat white in hand is an experience I keep coming back for.",
      name: "Sara M.",
      city: "Al Madinah",
      stars: 5,
    },
    {
      quote: "Jizan finally has a café worthy of its beautiful corniche. Sitting by the Red Sea with Butter Bakery's croissants — this is what coastal living should feel like.",
      name: "Faisal A.",
      city: "Jizan",
      stars: 5,
    },
  ],
  ar: [
    {
      quote: "كروسان بتر بيكري من أفضل ما ذقت في المملكة. كل تفصيل واضح أنه مقصود — الجو والخدمة والطعم.",
      name: "لمى أ.",
      city: "الرياض",
      stars: 5,
    },
    {
      quote: "بتر بيكري صارت تقليد عائلتنا كل نهاية أسبوع في أبها. كيك الشيمني ما له مثيل والفريق دايم يرحّب بنا.",
      name: "محمد ك.",
      city: "أبها",
      stars: 5,
    },
    {
      quote: "كشخص عاش في أوروبا سنوات طويلة، انبهرت بمستوى القهوة والمعجنات هنا — جودة عالمية حقيقية.",
      name: "ريم س.",
      city: "الرياض",
      stars: 5,
    },
    {
      quote: "تجربة الفرع الموسمي الخارجي فريدة من نوعها — أجواء ساحرة والأكل يضاهي كل شيء بالتفصيل.",
      name: "عبدالله ف.",
      city: "أبها",
      stars: 5,
    },
    {
      quote: "فرع المدينة درة حقيقية — مشاهدة غروب الشمس الذهبي من السطح المفتوح وكوب فلات وايت بيدك، تجربة لا تُنسى تعود إليها مراراً.",
      name: "سارة م.",
      city: "المدينة المنورة",
      stars: 5,
    },
    {
      quote: "جازان كانت تنتظر مقهى يليق بكورنيشها الجميل. الجلوس على البحر الأحمر مع كروسان بتر بيكري — هذا ما يعنيه العيش على الساحل.",
      name: "فيصل أ.",
      city: "جازان",
      stars: 5,
    },
  ],
};

export function Testimonials() {
  const { isAr } = useLang();
  const list = isAr ? reviews.ar : reviews.en;

  return (
    <section className="py-14 md:py-24 bg-background border-t border-border/30 overflow-hidden">
      <div className="container mx-auto px-5 md:px-12">

        <FadeIn className="text-center mb-10 md:mb-16">
          <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">
            {isAr ? "يقولون عنّا" : "What Our Guests Say"}
          </h2>
          <h3 className="font-serif text-3xl md:text-5xl text-foreground font-medium mb-3">
            {isAr ? "تجارب حقيقية" : "Real Experiences"}
          </h3>
          <p className="text-foreground/50 font-light max-w-md mx-auto text-sm md:text-base">
            {isAr
              ? "آراء ضيوفنا من مختلف فروعنا في المملكة"
              : "Voices from our guests across all our branches in the Kingdom"}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {list.map((r, i) => (
            <FadeIn key={i} delay={i * 0.1} direction="up">
              <div className="group p-6 md:p-8 border border-border/60 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/60 transition-all duration-500 h-full flex flex-col">
                <QuoteIcon className="w-6 h-6 text-primary/30 mb-4 shrink-0" />
                <p className={`text-foreground/80 font-light leading-relaxed flex-grow mb-6 text-sm md:text-base ${isAr ? "text-right" : ""}`}>
                  "{r.quote}"
                </p>
                <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                  <div className={`flex flex-col ${isAr ? "items-end" : ""}`}>
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: r.stars }).map((_, si) => (
                        <StarIcon key={si} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{r.name}</span>
                    <span className="text-xs text-primary/70 uppercase tracking-wider">{r.city}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4} className="text-center mt-8 md:mt-12">
          <a
            href="https://www.google.com/maps/search/Butter+Bakery+Saudi+Arabia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-foreground/40 hover:text-primary transition-colors duration-300 uppercase tracking-[0.2em]"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {isAr ? "تقييمات Google" : "Google Reviews"}
          </a>
        </FadeIn>

      </div>
    </section>
  );
}
