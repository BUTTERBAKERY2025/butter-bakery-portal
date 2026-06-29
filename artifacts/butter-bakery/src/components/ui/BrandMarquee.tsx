import { motion } from "framer-motion";

const items = [
  "Specialty Coffee",
  "·",
  "رمز الفخامة",
  "·",
  "French Pastry",
  "·",
  "لا نكرر الوصفات — نبتكرها",
  "·",
  "Baked Fresh Daily",
  "·",
  "روح السعودية",
  "·",
  "European Craft",
  "·",
  "بتر بيكري",
  "·",
  "Artisan Bread",
  "·",
  "رمز الفخامة والطعم الذي لا يُنسى",
  "·",
  "Vision 2030",
  "·",
];

export function BrandMarquee() {
  return (
    <div className="w-full overflow-hidden bg-primary py-4 border-y border-primary/0">
      <div className="flex">
        {/* Two identical tracks for seamless loop */}
        {[0, 1].map((trackIdx) => (
          <motion.div
            key={trackIdx}
            className="flex shrink-0 items-center gap-8 pr-8"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {items.map((item, i) => (
              <span
                key={i}
                className={
                  item === "·"
                    ? "text-primary-foreground/40 text-xs"
                    : "text-primary-foreground text-xs uppercase tracking-[0.25em] font-medium whitespace-nowrap"
                }
              >
                {item}
              </span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
