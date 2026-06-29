import { FadeIn } from "@/components/ui/fade-in";
import branchAbhaImg from "@/assets/real/branch-abha.jpg";
import branchRiyadhImg from "@/assets/real/branch-riyadh-interior.jpg";
import branchExteriorImg from "@/assets/real/branch-exterior.jpg";
import staffServingImg from "@/assets/real/staff-serving.jpg";
import croissantManImg from "@/assets/real/croissant-man.jpg";
import customerCupImg from "@/assets/real/customer-cup.jpg";
import coffeeBarImg from "@/assets/real/coffee-bar.jpg";
import kidsBakingImg from "@/assets/real/kids-baking.jpg";
import outdoorStandImg from "@/assets/real/outdoor-stand.jpg";
import branchAbhaGardenImg from "@/assets/real/branch-abha-garden.jpg";

const photos = [
  { src: branchRiyadhImg, caption: "Riyadh — Anas Bin Malik", span: "col-span-2 row-span-2" },
  { src: coffeeBarImg, caption: "Coffee Bar Interior", span: "col-span-1 row-span-1" },
  { src: customerCupImg, caption: "The Butter Bakery Experience", span: "col-span-1 row-span-1" },
  { src: branchAbhaImg, caption: "Abha — Al Hizam Branch", span: "col-span-1 row-span-2" },
  { src: staffServingImg, caption: "Crafted with Care", span: "col-span-1 row-span-1" },
  { src: croissantManImg, caption: "A Croissant Worth Waiting For", span: "col-span-1 row-span-1" },
  { src: kidsBakingImg, caption: "Community — Baking Workshops", span: "col-span-2 row-span-1" },
  { src: branchExteriorImg, caption: "A Destination Worth Visiting", span: "col-span-1 row-span-1" },
  { src: branchAbhaGardenImg, caption: "Abha — Garden Terrace", span: "col-span-1 row-span-1" },
  { src: outdoorStandImg, caption: "Seasonal — We Come to You", span: "col-span-1 row-span-1" },
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
              delay={i * 0.05}
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
