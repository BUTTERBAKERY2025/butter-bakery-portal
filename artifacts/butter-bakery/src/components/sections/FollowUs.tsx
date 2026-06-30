import { FadeIn } from "@/components/ui/fade-in";
const apronImg = "/gallery/687368959_18071114024651984_542420744264766962_n_1782725587612.jpg";
const yellowCakeImg = "/gallery/702746093_18072798869651984_4298385127285929132_n_1782725587613.jpg";
const avocadoCroissantImg = "/gallery/714599459_18074789468651984_7373858773853613920_n_1782725587613.jpg";
const purpleCakeImg = "/gallery/671127843_18069038726651984_6161635621041742339_n_(1)_1782725587614.jpg";
const elegantCroissantImg = "/gallery/714264474_18074789993651984_4074190906897943917_n_1782725587614.jpg";
const deliveryBoxImg = "/gallery/706982015_18073578548651984_6086752512590383711_n_1782725587614.jpg";
const kitkatImg = "/gallery/657449736_18066694193651984_1084959272242316940_n_1782725587614.jpg";
const summerCupsImg = "/gallery/703317953_18072798980651984_6108694531552392609_n_1782725587615.jpg";
const berryBasketImg = "/gallery/684696860_18069942209651984_7097828562111979045_n_1782725587615.jpg";
const branchSketchImg = "/gallery/720075317_18075485447651984_8219368285733091191_n_1782725587615.jpg";
const yellowCarDrinkImg = "/gallery/732596791_18078285596651984_5771152655997056836_n_1782725587615.jpg";
const icedDrinksImg = "/gallery/729991710_18077978093651984_6256621253351937329_n_1782725587615.jpg";
import { useLang } from "@/contexts/LanguageContext";

const INSTA_URL = "https://www.instagram.com/butterbakery_sa/";

const instaPosts = [
  { src: berryBasketImg,       alt: "Berry basket pastry" },
  { src: avocadoCroissantImg,  alt: "Avocado croissant on plate" },
  { src: yellowCarDrinkImg,    alt: "Cold drink from yellow car" },
  { src: kitkatImg,            alt: "KitKat danish stack" },
  { src: purpleCakeImg,        alt: "Purple layered cake" },
  { src: elegantCroissantImg,  alt: "Elegant croissant styling" },
  { src: yellowCakeImg,        alt: "Yellow sponge cake" },
  { src: icedDrinksImg,        alt: "Bb branded iced drinks" },
  { src: summerCupsImg,        alt: "Summer Bb cups" },
  { src: apronImg,             alt: "Bb branded chef apron" },
  { src: deliveryBoxImg,       alt: "Bb branded delivery boxes" },
  { src: branchSketchImg,      alt: "Butter Bakery branch sketch" },
];

const IgIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

export function FollowUs() {
  const { t } = useLang();
  const f = t.followUs;

  return (
    <section className="py-12 md:py-24 bg-background border-t border-border/30">
      <div className="container mx-auto px-4 md:px-12">

        <FadeIn className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <IgIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] md:tracking-[0.3em] text-primary font-semibold">{f.eyebrow}</span>
          </div>
          <h3 className="font-serif text-3xl md:text-5xl text-foreground font-medium mb-3 md:mb-4">
            {f.handle}
          </h3>
          <p className="text-foreground/50 font-light max-w-md mx-auto text-sm md:text-base">
            {f.sub}
          </p>
          <p className="text-foreground/30 font-light text-xs md:text-sm mt-1 md:mt-2">
            {f.subAr}
          </p>
        </FadeIn>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-0.5 md:gap-1 mb-8 md:mb-10">
          {instaPosts.map((post, i) => (
            <FadeIn key={i} delay={i * 0.03} direction="up">
              <a
                href={INSTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group block aspect-square overflow-hidden relative"
              >
                <img
                  src={post.src}
                  alt={post.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Always-visible tint on mobile, hover-controlled on desktop */}
                <div className="absolute inset-0 bg-black/0 md:bg-black/0 group-active:bg-black/30 md:group-hover:bg-black/45 transition-all duration-300 flex items-center justify-center">
                  <IgIcon className="w-6 h-6 md:w-8 md:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                </div>
              </a>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="text-center">
          <a
            href={INSTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-all duration-300 text-xs md:text-sm uppercase tracking-[0.15em] md:tracking-[0.2em] font-medium"
          >
            <IgIcon className="w-4 h-4" />
            {f.cta}
          </a>
        </FadeIn>

      </div>
    </section>
  );
}
