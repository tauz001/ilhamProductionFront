import type {Transition, Variants} from 'framer-motion';

export const easeSilk: Transition['ease'] = [0.16, 1, 0.3, 1];

export const motionDuration = {
  control: 0.18,
  feedback: 0.28,
  overlay: 0.42,
  modal: 0.52,
  reveal: 0.9,
  editorial: 1.15,
} as const;

export const overlayTransition: Transition = {
  duration: motionDuration.overlay,
  ease: easeSilk,
};

export const fadeUp: Variants = {
  hidden: {opacity: 0, y: 28},
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: motionDuration.reveal, ease: easeSilk},
  },
};

export const fadeIn: Variants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {duration: motionDuration.editorial, ease: easeSilk},
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.12, delayChildren: 0.1}},
};

export const maskReveal: Variants = {
  hidden: {y: '110%'},
  visible: {
    y: '0%',
    transition: {duration: motionDuration.reveal, ease: easeSilk},
  },
};

