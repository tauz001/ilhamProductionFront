import {useRef} from 'react';
import {motion, useScroll, useTransform} from 'framer-motion';
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
  strength = 0.18,
  loading = 'lazy',
  fetchPriority = 'auto',
  sizes = '100vw',
  width,
  height,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${strength * 100}%`, `${strength * 100}%`],
  );

  const imageClassName = `h-[120%] w-full object-cover will-change-transform ${imgClassName}`;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <picture className="block h-full w-full">
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
          style={{y}}
        />
      </picture>
    </div>
  );
}

