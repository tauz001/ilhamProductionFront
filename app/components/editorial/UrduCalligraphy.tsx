import {motion} from 'framer-motion';

type Variant = 'gold' | 'maroon' | 'ink' | 'antique' | 'ivory';

const colorMap: Record<Variant, string> = {
  gold: 'text-[oklch(0.62_0.11_75)]',
  antique: 'text-[oklch(0.55_0.09_70)]',
  maroon: 'text-[oklch(0.32_0.11_25)]',
  ink: 'text-[oklch(0.18_0.01_60)]',
  ivory: 'text-ivory',
};

export function UrduCalligraphy({
  word = 'نقش',
  variant = 'gold',
  className = '',
  opacity = 0.09,
  size = 'text-[18vw]',
  animate = true,
}: {
  word?: string;
  variant?: Variant;
  className?: string;
  opacity?: number;
  size?: string;
  animate?: boolean;
}) {
  const Tag = animate ? motion.span : 'span';

  return (
    <Tag
      aria-hidden
      {...(animate
        ? {
            initial: {opacity: 0, y: 12},
            whileInView: {opacity, y: 0},
            viewport: {once: true, margin: '-10%'},
            transition: {duration: 2.4, ease: [0.16, 1, 0.3, 1]},
          }
        : {style: {opacity}})}
      className={`font-urdu pointer-events-none select-none leading-none ${size} ${colorMap[variant]} ${className}`}
    >
      {word}
    </Tag>
  );
}

