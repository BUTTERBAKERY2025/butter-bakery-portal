import { useState, useCallback } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { Lightbox } from "@/components/ui/Lightbox";
import { useLang } from "@/contexts/LanguageContext";

import branchAbhaImg from "@/assets/real/branch-abha.jpg";
import branchRiyadhImg from "@/assets/real/branch-riyadh-interior.jpg";
import staffServingImg from "@/assets/real/staff-serving.jpg";
import customerCupImg from "@/assets/real/customer-cup.jpg";
import coffeeBarImg from "@/assets/real/coffee-bar.jpg";
import outdoorStandImg from "@/assets/real/outdoor-stand.jpg";

import berryBasketImg from "@assets/684696860_18069942209651984_7097828562111979045_n_1782725587615.jpg";
import avocadoCroissantImg from "@assets/714599459_18074789468651984_7373858773853613920_n_1782725587613.jpg";
import kitkatImg from "@assets/657449736_18066694193651984_1084959272242316940_n_1782725587614.jpg";
import purpleCakeImg from "@assets/671127843_18069038726651984_6161635621041742339_n_(1)_1782725587614.jpg";
import yellowCarDrinkImg from "@assets/732596791_18078285596651984_5771152655997056836_n_1782725587615.jpg";
import elegantCroissantImg from "@assets/714264474_18074789993651984_4074190906897943917_n_1782725587614.jpg";
import apronImg from "@assets/687368959_18071114024651984_542420744264766962_n_1782725587612.jpg";
import deliveryBoxImg from "@assets/706982015_18073578548651984_6086752512590383711_n_1782725587614.jpg";

export function Gallery() {
  const { t } = useLang();
  const g = t.gallery;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = [
    { src: berryBasketImg,      caption: g.labels.berryBasket,       span: "col-span-1 row-span-2" },
    { src: avocadoCroissantImg, caption: g.labels.avocadoCroissant,  span: "col-span-1 row-span-1" },
    { src: kitkatImg,           caption: g.labels.kitkat,            span: "col-span-1 row-span-1" },
    { src: branchRiyadhImg,     caption: "Riyadh — Anas Bin Malik",  span: "col-span-2 row-span-2" },
    { src: purpleCakeImg,       caption: g.labels.purpleCake,        span: "col-span-1 row-span-1" },
    { src: elegantCroissantImg, caption: g.labels.elegantCroissant,  span: "col-span-1 row-span-1" },
    { src: yellowCarDrinkImg,   caption: g.labels.coldDrink,         span: "col-span-2 row-span-1" },
    { src: branchAbhaImg,       caption: g.labels.deliveryBox,       span: "col-span-1 row-span-1" },
    { src: coffeeBarImg,        caption: "Coffee Bar",               span: "col-span-1 row-span-1" },
    { src: apronImg,            caption: g.labels.branchSketch,      span: "col-span-1 row-span-1" },
    { src: staffServingImg,     caption: g.labels.yellowCake,        span: "col-span-1 row-span-1" },
    { src: deliveryBoxImg,      caption: g.labels.apron,             span: "col-span-1 row-span-1" },
    { src: customerCupImg,      caption: g.labels.summerCups,        span: "col-span-1 row-span-1" },
    { src: outdoorStandImg,     caption: g.labels.icedDrinks,        span: "col-span-2 row-span-1" },
  ];

  const handleNavigate = useCallback((next: boolean) => {
    setLightboxIndex((i) => {
      if (i === null) return null;
      if (next) return (i + 1) % photos.length;
      return (i - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  return (
    <section className="py-24 bg-secondary relative" id="gallery">
      <div className="container mx-auto px-6 md:px-12">

        <FadeIn className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-3">{g.eyebrow}</h2>
              <h3 className="font-serif text-4xl md:text-5xl text-foreground font-medium">{g.title}</h3>
            </div>
            <p className="text-foreground/60 font-light max-w-sm leading-relaxed text-sm">
              {g.subtitle}
            </p>
          </div>
        </FadeIn>

        {/* Masonry-style clickable grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {photos.map((photo, i) => (
            <FadeIn
              key={i}
              delay={i * 0.04}
              direction="up"
              className={`group overflow-hidden relative cursor-pointer ${photo.span}`}
            >
              <div onClick={() => setLightboxIndex(i)} className="w-full h-full">
                <img
                  src={photo.src}
                  alt={photo.caption}
                  loading={i > 3 ? "lazy" : undefined}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Zoom icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <div className="w-10 h-10 border border-white/50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </div>
                </div>
                <p className="absolute bottom-0 left-0 right-0 px-4 py-3 text-white text-xs uppercase tracking-widest font-light translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  {photo.caption}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-16 text-center">
            <p className="font-serif text-2xl text-foreground/50 italic">
              &ldquo;{g.quote}&rdquo;
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Lightbox */}
      <Lightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={handleNavigate}
      />
    </section>
  );
}
