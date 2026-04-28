/* Central Framer Motion variant definitions — imported by all components */

export const EASE_PREMIUM  = [0.25, 0.46, 0.45, 0.94];
export const EASE_OVERSHOOT = [0.34, 1.56, 0.64, 1];
export const EASE_REVEAL   = [0.76, 0, 0.24, 1];

/* Blur-slide-up — every section / card entrance */
export const blurSlideUp = (reduce = false) =>
  reduce
    ? {
        hidden:  { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.7 } },
      }
    : {
        hidden: { opacity: 0, filter: 'blur(12px)', y: 28 },
        visible: {
          opacity: 1, filter: 'blur(0px)', y: 0,
          transition: { duration: 0.7, ease: EASE_PREMIUM },
        },
      };

/* Stagger container — wraps any repeating list or grid */
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/* Tab panel transition — forward/backward page-like */
export const tabTransition = (reduce = false) =>
  reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.4 } },
        exit:    { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        initial: { opacity: 0, filter: 'blur(16px)', scale: 0.97, y: 40 },
        animate: {
          opacity: 1, filter: 'blur(0px)', scale: 1, y: 0,
          transition: { duration: 0.55, ease: EASE_PREMIUM },
        },
        exit: {
          opacity: 0, filter: 'blur(16px)', scale: 1.03, y: -30,
          transition: { duration: 0.3, ease: EASE_PREMIUM },
        },
      };

/* Conditional element — modals, panels, tooltips (AnimatePresence) */
export const conditionalItem = {
  initial: { opacity: 0, scale: 0.9, filter: 'blur(8px)', y: 10 },
  animate: {
    opacity: 1, scale: 1, filter: 'blur(0px)', y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0, scale: 0.95, filter: 'blur(4px)', y: -6,
    transition: { duration: 0.2 },
  },
};

/* Card hover — interactive glass cards */
export const cardHover = (reduce = false) =>
  reduce ? {} : { y: -7, scale: 1.018 };

export const cardHoverTransition = {
  type: 'spring', stiffness: 300, damping: 22,
};

/* Button hover */
export const btnHoverScale   = (reduce = false) => reduce ? {} : { scale: 1.05 };
export const btnTapScale     = (reduce = false) => reduce ? {} : { scale: 0.97 };
export const btnTransition   = { type: 'spring', stiffness: 400, damping: 20 };

/* Line reveal — decorative dividers */
export const lineReveal = (reduce = false) =>
  reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.9 } } }
    : {
        hidden:  { scaleX: 0, transformOrigin: 'left' },
        visible: { scaleX: 1, transition: { duration: 0.9, ease: EASE_REVEAL } },
      };

/* Image / media entrance */
export const mediaEntrance = (reduce = false) =>
  reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { scale: 0.92, opacity: 0, filter: 'blur(10px)' },
        visible: {
          scale: 1, opacity: 1, filter: 'blur(0px)',
          transition: { duration: 0.65, ease: EASE_OVERSHOOT },
        },
      };
