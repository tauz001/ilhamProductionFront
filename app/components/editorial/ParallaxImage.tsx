import {useRef} from 'react';
import {motion, useScroll, useTransform} from 'framer-motion';

type Props = {
  src: string;
  mobileSrc?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
  loading?: 'lazy' | 'eager';
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
      {mobileSrc ? (
        <>
          <motion.img
            src={mobileSrc}
            alt={alt}
            loading={loading}
            width={width}
            height={height}
            className={`${imageClassName} md:hidden`}
            style={{y}}
          />
          <motion.img
            src={src}
            alt={alt}
            loading={loading}
            width={width}
            height={height}
            className={`${imageClassName} hidden md:block`}
            style={{y}}
          />
        </>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          loading={loading}
          width={width}
          height={height}
          className={imageClassName}
          style={{y}}
        />
      )}
    </div>
  );
}

