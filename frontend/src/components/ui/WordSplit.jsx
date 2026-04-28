import { motion, useReducedMotion } from 'framer-motion';

export function WordSplit({ text, className = '' }) {
  const shouldReduce = useReducedMotion();
  const words = text.split(' ');

  return (
    <span
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', rowGap: '0.1em' }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
          initial={
            shouldReduce
              ? { opacity: 0 }
              : { filter: 'blur(10px)', opacity: 0, y: 40 }
          }
          animate={
            shouldReduce
              ? { opacity: 1 }
              : {
                  filter: ['blur(10px)', 'blur(4px)', 'blur(0px)'],
                  opacity: [0, 0.5, 1],
                  y: [40, -4, 0],
                }
          }
          transition={{
            duration: 0.7,
            delay: (i * 100) / 1000,
            times: [0, 0.5, 1],
            ease: 'easeOut',
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
