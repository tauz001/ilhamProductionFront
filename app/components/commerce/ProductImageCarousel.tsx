import {useEffect, useMemo, useRef, useState} from 'react';
import {ChevronLeft, ChevronRight, Maximize2, X} from 'lucide-react';
import {AnimatePresence, motion} from 'framer-motion';
import {easeSilk} from '~/lib/motion/variants';

type ProductMediaImage = {
  id?: string | null;
  url?: string | null;
  altText?: string | null;
};

type ProductImageCarouselProps = {
  images: ProductMediaImage[];
  productTitle: string;
};

const AUTOPLAY_MS = 10000;

export function ProductImageCarousel({
  images,
  productTitle,
}: ProductImageCarouselProps) {
  const slides = useMemo(
    () => images.filter((image) => Boolean(image?.url)),
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const activeImage = slides[activeIndex] ?? slides[0];
  const hasMultipleImages = slides.length > 1;

  useEffect(() => {
    if (!hasMultipleImages || zoomIndex !== null) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => getNextIndex(current, slides.length));
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [hasMultipleImages, slides.length, zoomIndex, hasInteracted]);

  useEffect(() => {
    if (!slides.length) return;

    setActiveIndex((current) => Math.min(current, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    if (zoomIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setZoomIndex(null);
      }
      if (event.key === 'ArrowRight' && hasMultipleImages) {
        moveZoom('next');
      }
      if (event.key === 'ArrowLeft' && hasMultipleImages) {
        moveZoom('prev');
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasMultipleImages, slides.length, zoomIndex]);

  const move = (direction: 'next' | 'prev') => {
    setHasInteracted((current) => !current);
    setActiveIndex((current) =>
      direction === 'next'
        ? getNextIndex(current, slides.length)
        : getPreviousIndex(current, slides.length),
    );
  };

  const moveZoom = (direction: 'next' | 'prev') => {
    setZoomIndex((current) => {
      const safeCurrent = current ?? activeIndex;
      return direction === 'next'
        ? getNextIndex(safeCurrent, slides.length)
        : getPreviousIndex(safeCurrent, slides.length);
    });
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    didSwipeRef.current = false;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages || touchStartXRef.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 48) return;

    didSwipeRef.current = true;
    move(deltaX < 0 ? 'next' : 'prev');
  };

  if (!activeImage?.url) {
    return (
      <div className="h-[72vh] min-h-[420px] max-h-[620px] bg-cream md:h-[calc(100vh-19rem)] md:min-h-[480px] md:max-h-[760px] lg:min-h-[560px]" />
    );
  }

  return (
    <>
      <div className="min-w-0">
        <div
          className="group relative h-[72vh] min-h-[420px] max-h-[620px] overflow-hidden bg-cream md:h-[calc(100vh-19rem)] md:min-h-[480px] md:max-h-[760px] lg:min-h-[560px]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.button
              key={activeImage.id ?? activeImage.url}
              type="button"
              className="block h-full w-full cursor-zoom-in"
              onClick={() => {
                if (didSwipeRef.current) {
                  didSwipeRef.current = false;
                  return;
                }

                setZoomIndex(activeIndex);
              }}
              initial={{opacity: 0, scale: 1.015}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.985}}
              transition={{duration: 0.65, ease: easeSilk}}
              aria-label={`Open ${productTitle} image ${activeIndex + 1}`}
            >
              <img
                src={activeImage.url}
                alt={activeImage.altText ?? productTitle}
                className="h-full w-full object-contain"
              />
              <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center border border-ivory/60 bg-ivory/70 text-ink backdrop-blur">
                <Maximize2 className="h-4 w-4" strokeWidth={1.4} />
              </span>
            </motion.button>
          </AnimatePresence>

          {hasMultipleImages && (
            <>
              <CarouselArrow
                label="Previous image"
                side="left"
                onClick={() => move('prev')}
              />
              <CarouselArrow
                label="Next image"
                side="right"
                onClick={() => move('next')}
              />
            </>
          )}
        </div>

        {hasMultipleImages && (
          <div className="mt-4 min-w-0">
            <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {slides.map((image, index) => (
                <button
                  key={image.id ?? image.url}
                  type="button"
                  onClick={() => {
                    setHasInteracted((current) => !current);
                    setActiveIndex(index);
                  }}
                  className={`relative h-20 w-16 shrink-0 overflow-hidden border transition-colors sm:h-24 sm:w-20 ${
                    index === activeIndex
                      ? 'border-ink'
                      : 'border-border hover:border-ink/60'
                  }`}
                  aria-label={`Show ${productTitle} image ${index + 1}`}
                >
                  <img
                    src={image.url ?? ''}
                    alt={image.altText ?? productTitle}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((image, index) => (
                <button
                  key={`dot-${image.id ?? image.url}`}
                  type="button"
                  onClick={() => {
                    setHasInteracted((current) => !current);
                    setActiveIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex ? 'w-8 bg-ink' : 'w-1.5 bg-ink/25'
                  }`}
                  aria-label={`Go to ${productTitle} image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {zoomIndex !== null && slides[zoomIndex]?.url && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/95 p-4 sm:p-6"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
          >
            <button
              type="button"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center border border-ivory/40 text-ivory transition-colors hover:bg-ivory hover:text-ink"
              onClick={() => setZoomIndex(null)}
              aria-label="Close image zoom"
            >
              <X className="h-4 w-4" strokeWidth={1.4} />
            </button>

            {hasMultipleImages && (
              <>
                <ZoomArrow
                  label="Previous zoomed image"
                  side="left"
                  onClick={() => moveZoom('prev')}
                />
                <ZoomArrow
                  label="Next zoomed image"
                  side="right"
                  onClick={() => moveZoom('next')}
                />
              </>
            )}

            <img
              src={slides[zoomIndex].url ?? ''}
              alt={slides[zoomIndex].altText ?? productTitle}
              className="max-h-full max-w-full object-contain"
            />

            {hasMultipleImages && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 small-caps text-ivory/75">
                {zoomIndex + 1} / {slides.length}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CarouselArrow({
  label,
  onClick,
  side,
}: {
  label: string;
  onClick: () => void;
  side: 'left' | 'right';
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-ivory/60 bg-ivory/75 text-ink opacity-100 backdrop-blur transition-colors hover:bg-ink hover:text-ivory sm:opacity-0 sm:group-hover:opacity-100 ${
        side === 'left' ? 'left-4' : 'right-4'
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.2} />
    </button>
  );
}

function ZoomArrow({
  label,
  onClick,
  side,
}: {
  label: string;
  onClick: () => void;
  side: 'left' | 'right';
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center border border-ivory/40 text-ivory transition-colors hover:bg-ivory hover:text-ink ${
        side === 'left' ? 'left-4' : 'right-4'
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.2} />
    </button>
  );
}

function getNextIndex(current: number, length: number) {
  if (length <= 0) return 0;

  return (current + 1) % length;
}

function getPreviousIndex(current: number, length: number) {
  if (length <= 0) return 0;

  return (current - 1 + length) % length;
}
