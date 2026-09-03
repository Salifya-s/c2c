'use client';

import Image from 'next/image';
import {useCallback, useEffect, useState, useSyncExternalStore} from 'react';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';

import {Button} from '@/src/components/ui/button';
import {cn} from '@/src/lib/cn';

type Category = {
  title: string;
  src: string;
  alt: string;
  /** Tailwind classes for the "Live" pill, from the landing data module. */
  accent: string;
};

const AUTOPLAY_DELAY = 3200;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Subscribes to the motion preference as an external store, so no effect is needed. */
const subscribeToMotionPreference = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const getMotionPreference = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
// The server cannot know the preference; assume motion is allowed and let the
// client correct it on hydration.
const getServerMotionPreference = () => false;

/**
 * Auto-advancing category carousel.
 *
 * Autoplay stops while the pointer is over the track and resumes on leave, and
 * the hovered slide lifts and scales its image outward. Motion is disabled
 * entirely under `prefers-reduced-motion`, where the carousel stays a plain
 * scrollable, keyboard-navigable track.
 */
export const CategoryCarousel = ({categories}: {categories: Category[]}) => {
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference
  );
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const [emblaRef, embla] = useEmblaCarousel(
    {loop: true, align: 'start', containScroll: 'trimSnaps', dragFree: false},
    reducedMotion
      ? []
      : [Autoplay({delay: AUTOPLAY_DELAY, stopOnMouseEnter: true, stopOnInteraction: false})]
  );

  useEffect(() => {
    if (!embla) return;
    const sync = () => {
      setSelected(embla.selectedScrollSnap());
      setSnaps(embla.scrollSnapList());
    };
    sync();
    embla.on('select', sync);
    embla.on('reInit', sync);
    return () => {
      embla.off('select', sync);
      embla.off('reInit', sync);
    };
  }, [embla]);

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="What sellers trade on Tantika"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Generous vertical padding so a lifted, scaled slide is not clipped. */}
        <div className="-ml-4 flex touch-pan-y py-4">
          {categories.map((category, index) => {
            const isHovered = hovered === index;
            return (
              <div
                key={category.title}
                className="min-w-0 shrink-0 grow-0 basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${categories.length}: ${category.title}`}
              >
                <article
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  className={cn(
                    'group h-full overflow-hidden rounded-lg border bg-card outline-none',
                    'transition-[transform,box-shadow,border-color] duration-500 ease-out',
                    'focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    isHovered
                      ? 'border-brand-teal/40 shadow-xl motion-safe:-translate-y-2 motion-safe:scale-[1.02]'
                      : 'border-border/50 shadow-none'
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={category.src}
                      alt={category.alt}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      className={cn(
                        'object-cover transition-transform duration-700 ease-out',
                        isHovered && 'motion-safe:scale-110'
                      )}
                    />
                    <div
                      aria-hidden
                      className={cn(
                        'absolute inset-0 bg-gradient-to-t from-brand-navy/45 to-transparent transition-opacity duration-500',
                        isHovered ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <h3 className="font-display text-base font-semibold">{category.title}</h3>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', category.accent)}>Live</span>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
          {snaps.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === selected}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => embla?.scrollTo(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                index === selected ? 'w-6 bg-brand-teal' : 'w-1.5 bg-border hover:bg-brand-teal/40'
              )}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="icon" onClick={scrollPrev} aria-label="Previous categories">
            <FiChevronLeft aria-hidden />
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={scrollNext} aria-label="Next categories">
            <FiChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
};
