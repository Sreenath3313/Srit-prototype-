import React, { useMemo, useState } from 'react';
import { campusImages, type CampusImage } from '@/data/campusImages';

export const CampusGallery: React.FC = () => {
  const images = useMemo(() => campusImages, []);
  const [active, setActive] = useState<CampusImage | null>(null);

  return (
    <section className="py-16 bg-white" aria-label="Campus gallery" role="region">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary">Campus Gallery</h2>
          <p className="mt-3 text-gray-600">
            A quick look at highlights from SRIT.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(img)}
              className="group relative rounded-xl overflow-hidden shadow-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={`Open ${img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Simple lightbox */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute -top-10 right-0 text-white/90 hover:text-white text-sm"
            >
              Close
            </button>
            <img
              src={active.src}
              alt={active.alt}
              className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl bg-black"
            />
          </div>
        </div>
      )}
    </section>
  );
};
