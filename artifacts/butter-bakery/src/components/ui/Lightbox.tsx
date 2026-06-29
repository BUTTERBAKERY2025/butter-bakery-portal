import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

interface LightboxPhoto {
  src: string;
  caption: string;
}

interface LightboxProps {
  photos: LightboxPhoto[];
  index: number | null;
  onClose: () => void;
  onNavigate: (next: boolean) => void;
}

export function Lightbox({ photos, index, onClose, onNavigate }: LightboxProps) {
  const isOpen = index !== null && index >= 0;
  const photo = isOpen ? photos[index!] : null;
  const { isAr } = useLang();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(isAr);
      if (e.key === "ArrowRight") onNavigate(!isAr);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, onNavigate, isAr]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Photo container */}
          <motion.div
            key={index}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative max-w-5xl w-full mx-16 md:mx-24"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photo.src}
              alt={photo.caption}
              className="w-full max-h-[80vh] object-contain"
            />
            {photo.caption && (
              <p className="absolute -bottom-8 left-0 right-0 text-center text-white/40 text-[10px] uppercase tracking-[0.3em]">
                {photo.caption}
              </p>
            )}
          </motion.div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 end-5 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <X className="w-7 h-7" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(false); }}
            className="absolute start-4 md:start-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-9 h-9" />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(true); }}
            className="absolute end-4 md:end-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <ChevronRight className="w-9 h-9" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-5 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
