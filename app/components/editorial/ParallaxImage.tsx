import {useEffect, useMemo, useRef, useState} from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  HERO_IMAGE_WIDTHS,
  MOBILE_HERO_IMAGE_WIDTHS,
  shopifyImageUrl,
  shopifySrcSet,
} from '~/lib/commerce/image';

type Props = {
  src: string;
  mobileSrc?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  width?: number;
  height?: number;
};

export function ParallaxImage({
  src,
  mobileSrc,
  alt,
  className = '',
  imgClassName = '',
  strength = 0.09,
  loading = 'lazy',
  fetchPriority = 'auto',
  sizes = '100vw',
  width,
  height,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const nearViewport = useInView(ref, {margin: '40% 0px'});
  const [compactViewport, setCompactViewport] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const sync = () => setCompactViewport(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const resolvedStrength = useMemo(() => {
    const deviceStrength = compactViewport ? strength * 0.62 : strength;
    const maximum = compactViewport ? 0.06 : 0.11;
    return Math.min(maximum, Math.max(0.035, deviceStrength));
  }, [compactViewport, strength]);

  const imageHeight = useMemo(
    () => 100 / (1 - resolvedStrength * 2) + 2,
    [resolvedStrength],
  );
  const imageInset = (imageHeight - 100) / 2;
  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${resolvedStrength * 100}%`, `${resolvedStrength * 100}%`],
  );

  const imageClassName = `absolute left-0 w-full object-cover ${
    nearViewport && !prefersReducedMotion ? 'will-change-transform' : ''
  } ${imgClassName}`;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <picture className="relative block h-full w-full">
        {mobileSrc ? (
          <source
            media="(max-width: 767px)"
            srcSet={shopifySrcSet(mobileSrc, MOBILE_HERO_IMAGE_WIDTHS)}
            sizes={sizes}
          />
        ) : null}
        <motion.img
          src={shopifyImageUrl(src, 1600)}
          srcSet={shopifySrcSet(src, HERO_IMAGE_WIDTHS)}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          width={width}
          height={height}
          className={imageClassName}
          style={{
            height: `${imageHeight}%`,
            top: `-${imageInset}%`,
            y: prefersReducedMotion ? 0 : y,
          }}
        />
      </picture>
    </div>
  );
}

