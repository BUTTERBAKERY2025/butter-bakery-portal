import { FadeIn } from "@/components/ui/fade-in";

// Original real photos
import branchAbhaImg from "@/assets/real/branch-abha.jpg";
import branchRiyadhImg from "@/assets/real/branch-riyadh-interior.jpg";
import staffServingImg from "@/assets/real/staff-serving.jpg";
import customerCupImg from "@/assets/real/customer-cup.jpg";
import coffeeBarImg from "@/assets/real/coffee-bar.jpg";
import outdoorStandImg from "@/assets/real/outdoor-stand.jpg";

// Instagram photos — premium editorial imagery
import berryBasketImg from "@assets/684696860_18069942209651984_7097828562111979045_n_1782725587615.jpg";
import avocadoCroissantImg from "@assets/714599459_18074789468651984_7373858773853613920_n_1782725587613.jpg";
import kitkatImg from "@assets/657449736_18066694193651984_1084959272242316940_n_1782725587614.jpg";
import purpleCakeImg from "@assets/671127843_18069038726651984_6161635621041742339_n_(1)_1782725587614.jpg";
import yellowCarDrinkImg from "@assets/732596791_18078285596651984_5771152655997056836_n_1782725587615.jpg";
import elegantCroissantImg from "@assets/714264474_18074789993651984_4074190906897943917_n_1782725587614.jpg";
import apronImg from "@assets/687368959_18071114024651984_542420744264766962_n_1782725587612.jpg";
import deliveryBoxImg from "@assets/706982015_18073578548651984_6086752512590383711_n_1782725587614.jpg";

const photos = [
  // Row 1 — hero Instagram shots
  { src: berryBasketImg,      caption: "Signature Berry Basket",        span: "col-span-1 row-span-2" },
  { src: avocadoCroissantImg, caption: "Avocado Croissant",            span: "col-span-1 row-span-1" },
  { src: kitkatImg,           caption: "KitKat Danish",                span: "col-span-1 row-span-1" },
  { src: branchRiyadhImg,     caption: "Riyadh — Anas Bin Malik",      span: "col-span-2 row-span-2" },

  // Row 2
  { src: purpleCakeImg,       caption: "Berry Layer Cake",             span: "col-span-1 row-span-1" },
  { src: elegantCroissantImg, caption: "Chef's Touch",                 span: "col-span-1 row-span-1" },

  // Row 3 — atmosphere + lifestyle
  { src: yellowCarDrinkImg,   caption: "Drive-Thru Vibes",             span: "col-span-2 row-span-1" },
  { src: branchAbhaImg,       caption: "Abha — Al Hizam Branch",       span: "col-span-1 row-span-1" },
  { src: coffeeBarImg,        caption: "Coffee Bar",                   span: "col-span-1 row-span-1" },

  // Row 4 — brand identity
  { src: apronImg,            caption: "The Bb Identity",              span: "col-span-1 row-span-1" },
  { src: staffServingImg,     caption: "Crafted with Care",            span: "col-span-1 row-span-1" },
  { src: deliveryBoxImg,      caption: "Delivered with Love",          span: "col-span-1 row-span-1" },
  { src: customerCupImg,      caption: "Your Morning Ritual",          span: "col-span-1 row-span-1" },
  { src: outdoorStandImg,     caption: "We Come to You",               span: "col-span-2 row-span-1" },
];

export function Gallery() {
  return (
    <section className="py-24 bg-secondary relative" id="gallery">
      <div className="container mx-auto px-6 md:px-12">

        <FadeIn className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-3">Life at Butter Bakery</h2>
              <h3 className="font-serif text-4xl md:text-5xl text-foreground font-medium">A Moment in Every Frame</h3>
            </div>
            <p className="text-foreground/60 font-light max-w-sm leading-relaxed text-sm">
              Every photo tells a real story — our branches, our people, our craft, and the moments we share with you daily.
            </p>
          </div>
        </FadeIn>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {photos.map((photo, i) => (
            <FadeIn
              key={i}
              delay={i * 0.04}
              direction="up"
              className={`group overflow-hidden relative ${photo.span}`}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="absolute bottom-0 left-0 right-0 px-4 py-3 text-white text-xs uppercase tracking-widest font-light translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                {photo.caption}
              </p>
            </FadeIn>
          ))}
        </div>

        {/* Arabic tagline */}
        <FadeIn delay={0.3}>
          <div className="mt-16 text-center">
            <p className="font-serif text-2xl text-foreground/50 italic">
              "نصنع وقتاً مختلفاً… بنكهة تشبهك"
            </p>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
