import {useRef} from 'react';
import {motion, useScroll, useTransform} from 'framer-motion';

type Props = {
  src: string;
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

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        className={`h-[120%] w-full object-cover will-change-transform ${imgClassName}`}
        style={{y}}
      />
    </div>
  );
}

