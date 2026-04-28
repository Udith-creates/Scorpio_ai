import { motion } from 'framer-motion';
import { conditionalItem } from '../lib/animations.js';
import { MotionButton } from './ui/MotionButton.jsx';

export default function DmcaModal({ notice, onClose }) {
  const copy = () => navigator.clipboard.writeText(notice ?? '');

  return (
    /* Backdrop */
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
      style={{ zIndex: 'var(--z-modal)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Panel */}
      <motion.div
        className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        variants={conditionalItem}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-semibold"
            style={{ color: 'var(--color-threat-text)', fontSize: 'var(--text-lg)' }}
          >
            DMCA Takedown Notice
          </h3>
          <button
            className="text-slate-500 hover:text-white text-2xl leading-none transition-colors"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Notice body */}
        <pre className="mono whitespace-pre-wrap bg-black/40 rounded-lg p-4 text-slate-300 overflow-x-auto">
          {notice}
        </pre>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <MotionButton
            className="glass px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
            onClick={copy}
          >
            Copy Notice
          </MotionButton>
          <MotionButton
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors glow-red"
            onClick={onClose}
          >
            Close
          </MotionButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
