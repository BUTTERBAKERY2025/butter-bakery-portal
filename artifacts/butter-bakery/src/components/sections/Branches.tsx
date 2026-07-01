import { FadeIn } from "@/components/ui/fade-in";
import branchAbhaImg from "@/assets/real/branch-abha.jpg";
import branchRiyadhImg from "@/assets/real/branch-riyadh-interior.jpg";
import branchRiyadhCounterImg from "@/assets/real/branch-riyadh-counter.jpg";
import branchAbhaGardenImg from "@/assets/real/branch-abha-garden.jpg";
import coffeeBarImg from "@/assets/real/coffee-bar.jpg";
import branchSeasonalImg from "@/assets/real/branch-seasonal.jpg";
import outdoorStandImg from "@/assets/real/outdoor-stand.jpg";
import seasonalDayImg from "@/assets/real/seasonal-summer-day.jpg";
import seasonalNightImg from "@/assets/real/seasonal-summer-night.jpg";
import branchMedinaAerialImg from "@/assets/real/branch-medina-aerial.jpg";
import branchMedinaSunsetImg from "@/assets/real/branch-medina-sunset.jpg";
import branchRiyadhEmbDayImg from "@/assets/real/branch-riyadh-emb-day.jpg";
import branchRiyadhEmbNightImg from "@/assets/real/branch-riyadh-emb-night.jpg";
import branchAbhaAirportCrowdImg from "@/assets/real/branch-abha-airport-crowd.jpg";
import branchAbhaAirportCounterImg from "@/assets/real/branch-abha-airport-counter.jpg";
import branchJizanSeafrontImg from "@/assets/real/branch-jizan-seafront.jpg";
import branchJizanWaterfrontImg from "@/assets/real/branch-jizan-waterfront.jpg";
import seasonalBaristaImg from "@/assets/real/seasonal-barista.jpg";
import seasonalOutdoorImg from "@/assets/real/seasonal-outdoor.jpg";
import seasonalStaffImg from "@/assets/real/seasonal-staff.jpg";
import staffPastriesImg from "@/assets/real/staff-pastries.jpg";
import { useLang } from "@/contexts/LanguageContext";

const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const featuredImages = [
  { image: branchAbhaImg, secondImage: branchAbhaGardenImg },
  { image: branchRiyadhImg, secondImage: branchRiyadhCounterImg },
];

const featuredMaps = [
  "https://www.google.com/maps/search/Butter+Bakery+Al+Hizam+Abha+Saudi+Arabia",
  "https://www.google.com/maps/search/Butter+Bakery+Anas+Ibn+Malik+Riyadh+Saudi+Arabia",
];

const otherImages: { image: string; secondImage?: string }[] = [
  { image: coffeeBarImg },
  { image: branchSeasonalImg, secondImage: outdoorStandImg },
  { image: branchMedinaAerialImg, secondImage: branchMedinaSunsetImg },
  { image: branchRiyadhEmbDayImg, secondImage: branchRiyadhEmbNightImg },
  { image: branchAbhaAirportCounterImg, secondImage: branchAbhaAirportCrowdImg },
  { image: branchJizanSeafrontImg, secondImage: branchJizanWaterfrontImg },
];

const otherMaps = [
  "https://www.google.com/maps/search/Butter+Bakery+Tabuk+Saudi+Arabia",
  null,
  "https://www.google.com/maps/search/Butter+Bakery+Medina+Saudi+Arabia",
  "https://www.google.com/maps/search/Butter+Bakery+Embassies+Quarter+Riyadh+Saudi+Arabia",
  "https://www.google.com/maps/search/Butter+Bakery+Airport+Road+Abha+Saudi+Arabia",
  "https://www.google.com/maps/search/Butter+Bakery+Jizan+Corniche+Saudi+Arabia",
];

export function Branches() {
  const { t } = useLang();
  const b = t.branches;

  return (
    <section id="locations" className="py-14 md:py-28 lg:py-32 bg-secondary relative">
      <div className="container mx-auto px-5 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-20 gap-5 md:gap-8">
          <FadeIn>
            <h2 className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">{b.eyebrow}</h2>
            <h3 className="font-serif text-4xl md:text-5xl text-foreground font-medium">{b.title}</h3>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-foreground/70 font-light max-w-md leading-relaxed">
              {b.subtitle}
            </p>
          </FadeIn>
        </div>

        {/* Featured Branches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {b.featured.map((branch, idx) => (
            <FadeIn key={idx} delay={idx * 0.2} direction="up" className="group">
              <div className="bg-background rounded-sm overflow-hidden border border-border/50 h-full flex flex-col">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={featuredImages[idx].image}
                    alt={`Butter Bakery ${branch.city} Branch`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 text-xs font-medium tracking-widest uppercase text-foreground">
                    {branch.city}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium tracking-wide text-background">
                    {branch.award}
                  </div>
                </div>
                <div className="h-24 md:h-36 overflow-hidden relative">
                  <img
                    src={featuredImages[idx].secondImage}
                    alt={`${branch.city} interior`}
                    className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                </div>
                <div className="p-5 md:p-8 lg:p-10 flex flex-col flex-grow">
                  <h4 className="font-serif text-xl md:text-2xl mb-1">{branch.location}</h4>
                  <p className="text-primary text-xs uppercase tracking-[0.2em] font-medium mb-3">{branch.tagline}</p>
                  <p className="text-foreground/70 font-light leading-relaxed flex-grow text-sm mb-5">
                    {branch.description}
                  </p>
                  <a
                    href={featuredMaps[idx]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-foreground/40 hover:text-primary transition-colors duration-300 uppercase tracking-[0.15em] self-start"
                  >
                    <MapPinIcon />
                    {t.branches.directions}
                  </a>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Other Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
          {b.others.map((branch, idx) => {
            const imgs = otherImages[idx];
            const mapsUrl = otherMaps[idx];
            return (
              <FadeIn key={idx} delay={0.4 + idx * 0.1} direction="up">
                <div className="bg-background rounded-sm overflow-hidden border border-border/50 h-full flex flex-col transition-colors hover:border-primary/50 group">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={imgs.image}
                      alt={`Butter Bakery ${branch.city}`}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  {imgs.secondImage && (
                    <div className="h-24 md:h-36 overflow-hidden relative">
                      <img
                        src={imgs.secondImage}
                        alt={`${branch.city} night`}
                        className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                    </div>
                  )}
                  <div className="p-5 md:p-8 lg:p-10 flex flex-col flex-grow">
                    <div className="text-primary text-xs font-medium tracking-widest uppercase mb-2">
                      {branch.city}
                    </div>
                    <h4 className="font-serif text-xl md:text-2xl mb-1">{branch.location}</h4>
                    <p className="text-foreground/50 text-xs uppercase tracking-[0.15em] font-light mb-3 italic">{branch.tagline}</p>
                    <p className="text-foreground/70 font-light leading-relaxed text-sm flex-grow mb-4">
                      {branch.description}
                    </p>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-foreground/40 hover:text-primary transition-colors duration-300 uppercase tracking-[0.15em] self-start"
                      >
                        <MapPinIcon />
                        {t.branches.directions}
                      </a>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Quote */}
        <FadeIn delay={0.6}>
          <div className="mt-12 md:mt-20 text-center">
            <p className="font-serif text-xl md:text-2xl text-foreground/60 italic">
              {b.quote}
            </p>
            <p className="text-primary text-xs uppercase tracking-[0.3em] mt-3 font-medium">
              {b.quoteAr}
            </p>
          </div>
        </FadeIn>
      </div>

      {/* ── Seasonal Branches ─────────────────────────────────── */}
      <div className="bg-[#1C1208] mt-14 md:mt-28 py-16 md:py-28">
        <div className="container mx-auto px-5 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text side */}
            <FadeIn direction="up">
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.35em] mb-5">
                {b.seasonal.eyebrow}
              </p>
              <h3 className="font-serif text-4xl md:text-5xl text-white font-medium mb-6 leading-tight">
                {b.seasonal.title}
              </h3>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-6 font-light">
                {b.seasonal.tagline}
              </p>
              <p className="text-white/70 font-light leading-relaxed md:leading-loose text-sm md:text-base mb-8">
                {b.seasonal.description}
              </p>

              {/* Location pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {b.seasonal.locations.map((loc, i) => (
                  <span
                    key={i}
                    className="px-4 py-1.5 border border-primary/40 text-primary text-[11px] uppercase tracking-[0.2em] font-medium"
                  >
                    {loc}
                  </span>
                ))}
              </div>

              <p className="text-primary/60 text-sm font-light tracking-wide">
                {b.seasonal.hashtag}
              </p>
            </FadeIn>

            {/* Media side */}
            <FadeIn direction="up" delay={0.2}>
              <div className="grid grid-cols-3 gap-3">
                {/* Photo 1 — barista */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={seasonalBaristaImg}
                    alt="Seasonal branch barista"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Middle column: outdoor + video stacked */}
                <div className="flex flex-col gap-3">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={seasonalOutdoorImg}
                      alt="Seasonal outdoor branch"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden relative bg-black">
                    <video
                      src="/seasonal-video-1.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 bg-primary/90 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white font-medium">
                      Live
                    </div>
                  </div>
                </div>

                {/* Photo 3 — staff */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={seasonalStaffImg}
                    alt="Seasonal branch staff"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </FadeIn>

          </div>

          {/* Bottom seasonal strip */}
          <FadeIn delay={0.3}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">

              {/* Staff & Pastries */}
              <div className="aspect-[3/4] overflow-hidden relative group">
                <img
                  src={staffPastriesImg}
                  alt="Seasonal branch pastries"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white/90 text-[9px] uppercase tracking-[0.25em] font-medium">Artisan Craft</p>
                </div>
              </div>

              {/* Day atmosphere */}
              <div className="aspect-[3/4] overflow-hidden relative group">
                <img
                  src={seasonalDayImg}
                  alt="Seasonal branch daytime"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-amber-300/90 text-[9px] uppercase tracking-[0.25em] font-medium">Golden Hour</p>
                </div>
              </div>

              {/* Night atmosphere */}
              <div className="aspect-[3/4] overflow-hidden relative group">
                <img
                  src={seasonalNightImg}
                  alt="Seasonal branch nighttime"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-blue-200/90 text-[9px] uppercase tracking-[0.25em] font-medium">Evening Glow</p>
                </div>
              </div>

              {/* Video */}
              <div className="aspect-[3/4] overflow-hidden relative">
                <video
                  src="/seasonal-video-3.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-white/90 text-[9px] uppercase tracking-[0.25em] font-medium">Live Scene</p>
                </div>
              </div>

            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
