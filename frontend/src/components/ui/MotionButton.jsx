import { motion, useReducedMotion } from 'framer-motion';

export function MotionButton({ children, className = '', disabled, onClick, type = 'button', ...rest }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      whileHover={shouldReduce || disabled ? {} : { scale: 1.05 }}
      whileTap={shouldReduce || disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
