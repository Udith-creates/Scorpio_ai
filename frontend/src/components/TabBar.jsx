import { motion, useReducedMotion } from 'framer-motion';

const TABS = [
  { id: 'register',   label: 'Register Content' },
  { id: 'match',      label: 'Match / Scan'     },
  { id: 'detections', label: 'Detections'        },
  { id: 'analytics',  label: 'Analytics'         },
  { id: 'library',    label: 'Library'           },
];

export default function TabBar({ activeTab, onTabChange }) {
  const shouldReduce = useReducedMotion();

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-thin">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <motion.button
            key={tab.id}
            className={`glass relative px-4 py-2 rounded-lg text-sm border whitespace-nowrap transition-colors ${
              isActive
                ? 'tab-active'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
            onClick={() => onTabChange(tab.id)}
            whileHover={shouldReduce ? {} : { scale: 1.04 }}
            whileTap={shouldReduce ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            {tab.label}
            {/* Shared-layout active indicator underline */}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full"
                style={{ background: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
