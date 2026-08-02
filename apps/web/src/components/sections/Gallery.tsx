import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { galleryImages } from "../../data/content";
import { SectionHeading } from "../ui/SectionHeading";

export function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="section-padding bg-cream-dark/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Life at the Farm"
          title="Gallery"
          subtitle="Glimpses of daily life at Shri Ahilyamata Gaushala — morning rituals, happy cows, and the beauty of sustainable farming."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group relative overflow-hidden rounded-2xl ${
                index === 0 ? "sm:col-span-2 sm:row-span-1 lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  index === 0 ? "aspect-[2/1] lg:aspect-auto lg:h-full lg:min-h-[400px]" : "aspect-[4/3]"
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-forest-dark/0 transition-all group-hover:bg-forest-dark/40">
                <ZoomIn className="h-8 w-8 text-cream opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-dark/90 p-4 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
          onKeyDown={(e) => e.key === "Escape" && setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-cream/10 p-2 text-cream hover:bg-cream/20"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={galleryImages[activeIndex].src}
            alt={galleryImages[activeIndex].alt}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
