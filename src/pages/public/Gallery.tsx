import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { supabase, type GalleryImage } from '../../lib/supabase';

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('gallery_images').select('*').order('sort_order')
      .then(({ data }) => {
        setImages(data as GalleryImage[] || []);
        setLoading(false);
      });
  }, []);

  const close = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () => setLightbox((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <div>
      <section className="bg-gradient-to-br from-navy-900 to-primary-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-white">Gallery</h1>
          <p className="text-primary-100 mt-4 max-w-2xl mx-auto">
            Take a look around SRS Digital Library — our study spaces, amenities, and atmosphere.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-64" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <ImageOff className="w-12 h-12 mx-auto text-ink-subtle mb-4" />
            <h3 className="font-display font-semibold text-xl text-ink">No photos yet</h3>
            <p className="text-ink-muted mt-2">Check back soon — we're adding photos of our space.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((img, i) => (
              <motion.button
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => setLightbox(i)}
                className="block w-full break-inside-avoid rounded-2xl overflow-hidden group relative"
              >
                <img src={img.url} alt={img.caption || 'Gallery image'} className="w-full group-hover:scale-105 transition-transform duration-500" />
                {img.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-medium">{img.caption}</p>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {lightbox !== null && images[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy-950/95 flex items-center justify-center p-4"
            onClick={close}
          >
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-lg" onClick={close} aria-label="Close">
              <X className="w-6 h-6" />
            </button>
            <button className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-lg" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <motion.img
              key={images[lightbox].id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={images[lightbox].url}
              alt={images[lightbox].caption || 'Gallery image'}
              className="max-w-full max-h-[85vh] rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-lg" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">
              <ChevronRight className="w-8 h-8" />
            </button>
            {images[lightbox].caption && (
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-navy-950/80 px-4 py-2 rounded-lg">
                {images[lightbox].caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
