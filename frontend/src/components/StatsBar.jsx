import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedNumber } from './ui/AnimatedNumber.jsx';
import { blurSlideUp, staggerContainer } from '../lib/animations.js';

const STATS = [
  { key: 'total_registered_content', label: 'Registered',       color: 'text-purple-400' },
  { key: 'total_detections',         label: 'Detections',        color: 'text-blue-400'   },
  { key: 'piracy_confirmed',         label: 'Confirmed Piracy',  color: 'text-red-400'    },
  { key: 'fair_use_cleared',         label: 'Fair Use',          color: 'text-green-400'  },
  { key: 'dmca_submitted',           label: 'DMCA Filed',        color: 'text-orange-400' },
  {
    key: 'avg_similarity_score',
    label: 'Avg Similarity',
    color: 'text-cyan-400',
    format: (v) => `${(v * 100).toFixed(1)}%`,
  },
];

export default function StatsBar({ stats }) {
  const shouldReduce = useReducedMotion();
  const itemVars = blurSlideUp(shouldReduce);

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {STATS.map((s) => (
        <motion.div
          key={s.key}
          className="glass rounded-xl p-4 text-center cursor-default"
          variants={itemVars}
          whileHover={shouldReduce ? {} : { y: -4, scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <div
            className={`font-bold font-mono ${s.color}`}
            style={{ fontSize: 'var(--text-2xl)' }}
          >
            <AnimatedNumber value={stats?.[s.key] ?? null} format={s.format} />
          </div>
          <div className="text-xs text-slate-500 mt-1">{s.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
