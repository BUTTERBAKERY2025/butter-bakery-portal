import { FadeIn } from "@/components/ui/fade-in";
import branchRiyadhImg from "@/assets/real/branch-riyadh-interior.jpg";
import branchAbhaImg from "@/assets/real/branch-abha.jpg";
import customerCupImg from "@/assets/real/customer-cup.jpg";
import croissantManImg from "@/assets/real/croissant-man.jpg";
import staffServingImg from "@/assets/real/staff-serving.jpg";
import branchAbhaGardenImg from "@/assets/real/branch-abha-garden.jpg";

const previewPhotos = [
  { src: branchRiyadhImg, alt: "Riyadh branch interior" },
  { src: branchAbhaImg, alt: "Abha branch" },
  { src: customerCupImg, alt: "Customer experience" },
  { src: croissantManImg, alt: "Fresh croissant" },
  { src: staffServingImg, alt: "Staff serving" },
  { src: branchAbhaGardenImg, alt: "Abha garden terrace" },
];

export function FollowUs() {
  return (
    <section className="py-24 bg-background border-t border-border/30">
      <div className="container mx-auto px-6 md:px-12">
        <FadeIn className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Follow Us</span>
          </div>
          <h3 className="font-serif text-4xl md:text-5xl text-foreground font-medium mb-4">
            @butterbakery_sa
          </h3>
          <p className="text-foreground/50 font-light max-w-md mx-auto">
            Stay with us daily — fresh moments, new launches, and behind-the-scenes from our world of baking.
          </p>
          <p className="text-foreground/30 font-light text-sm mt-2">
            تابعونا يومياً — لحظات طازجة، إطلاقات جديدة، وكواليس عالمنا في الخبز
          </p>
        </FadeIn>

        {/* Photo Grid — real photos as Instagram preview */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 mb-10">
          {previewPhotos.map((photo, i) => (
            <FadeIn key={i} delay={i * 0.06} direction="up">
              <a
                href="https://www.instagram.com/butterbakery_sa/"
                target="_blank"
                rel="noopener noreferrer"
                className="group block aspect-square overflow-hidden relative"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Instagram hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-400 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>

        {/* CTA Button */}
        <FadeIn delay={0.3} className="text-center">
          <a
            href="https://www.instagram.com/butterbakery_sa/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-all duration-300 text-sm uppercase tracking-[0.2em] font-medium group"
          >
            <svg className="w-4 h-4 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Follow on Instagram
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
