import {motion, useInView} from 'framer-motion';
import {useRef, type ReactNode} from 'react';
import {easeSilk, motionDuration} from '~/lib/motion/variants';

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
};

export function MaskedReveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'span',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {once: true, margin: '-10% 0px'});

  return (
    <Tag ref={ref as never} className={`inline-block overflow-hidden align-bottom ${className}`}>
      <motion.span
        className="inline-block will-change-transform"
        initial={{y: '115%'}}
        animate={inView ? {y: '0%'} : {y: '115%'}}
        transition={{duration: motionDuration.reveal, ease: easeSilk, delay}}
      >
        {children}
      </motion.span>
    </Tag>
  );
}

export function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {once: true, margin: '-10% 0px'});

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{opacity: 0, y: 32}}
      animate={inView ? {opacity: 1, y: 0} : {opacity: 0, y: 32}}
      transition={{duration: motionDuration.reveal, ease: easeSilk, delay}}
    >
      {children}
    </motion.div>
  );
}

