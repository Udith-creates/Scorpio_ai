import { motion, useReducedMotion } from 'framer-motion';
import { MotionButton } from './ui/MotionButton.jsx';

export default function Navbar({ onRefresh }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.nav
      className="glass border-b border-white/[0.08] sticky top-0"
      style={{ zIndex: 'var(--z-navbar)' }}
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <motion.span
            className="text-2xl select-none"
            animate={shouldReduce ? {} : { rotate: [0, -12, 12, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 6, duration: 0.5 }}
          >
            🦂
          </motion.span>
          <div>
            <div className="scorpio-logo text-xl">Scorpio AI</div>
            <div
              className="mono text-slate-500"
              style={{ fontSize: 'var(--text-xs)', marginTop: '-2px' }}
            >
              Neural Anti-Piracy Engine v2.0
            </div>
          </div>
        </div>

        {/* Status + Refresh */}
        <div className="flex items-center gap-3">
          <div className="pulse-dot" />
          <span className="text-xs text-green-400 font-medium">Engine Online</span>
          <MotionButton
            className="glass px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
            onClick={onRefresh}
          >
            Refresh
          </MotionButton>
        </div>
      </div>
    </motion.nav>
  );
}
