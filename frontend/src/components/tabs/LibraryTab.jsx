import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MotionButton } from '../ui/MotionButton.jsx';
import {
  blurSlideUp, staggerContainer, conditionalItem, tabTransition,
  cardHover, cardHoverTransition,
} from '../../lib/animations.js';
import { fetchContentList } from '../../lib/api.js';

export default function LibraryTab({ onScanFor }) {
  const shouldReduce = useReducedMotion();
  const transition   = tabTransition(shouldReduce);
  const itemVars     = blurSlideUp(shouldReduce);

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContentList();
      setItems(data.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <motion.div {...transition}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)' }}>
          Registered Content Library
        </h2>
        <MotionButton
          className="glass px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
          onClick={load}
        >
          Refresh
        </MotionButton>
      </div>

      {/* States */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" {...conditionalItem} className="text-center py-16 text-slate-500">
            <div className="spinner mx-auto mb-3" />
            Loading library…
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" {...conditionalItem} className="text-red-400 text-sm py-8 text-center">
            Error: {error}
          </motion.div>
        )}

        {!loading && !error && items.length === 0 && (
          <motion.div
            key="empty"
            {...conditionalItem}
            className="glass rounded-xl p-8 text-center text-slate-500 text-sm"
          >
            No registered content yet. Go to Register Content to add your first video.
          </motion.div>
        )}

        {!loading && !error && items.length > 0 && (
          <motion.div
            key="grid"
            className="grid md:grid-cols-2 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {items.map((c) => (
              <motion.div
                key={c.content_id}
                className="glass rounded-xl p-5"
                variants={itemVars}
                whileHover={shouldReduce ? {} : cardHover(false)}
                transition={cardHoverTransition}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="font-semibold text-sm">{c.title}</div>
                    <div className="text-xs text-slate-500">
                      {c.owner} · {c.platform || 'Unknown platform'}
                    </div>
                  </div>
                  <motion.div
                    className="text-purple-400 text-2xl select-none"
                    whileHover={shouldReduce ? {} : { y: -3, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  >
                    🎬
                  </motion.div>
                </div>

                {/* Stats */}
                <div className="space-y-2 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Frames extracted</span>
                    <span className="mono">{c.extracted_frames} × {c.dna_dimensions}d</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered</span>
                    <span>{new Date(c.registered_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Blockchain hash</span>
                    <div className="hash-text mt-0.5">{c.blockchain_hash}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Tx hash</span>
                    <div className="hash-text mt-0.5">{c.tx_hash}</div>
                  </div>
                </div>

                {/* Divider line reveal */}
                <motion.div
                  className="mb-3 rounded-full"
                  style={{
                    height: '1px',
                    background: 'linear-gradient(to right, var(--accent-border), transparent)',
                    transformOrigin: 'left',
                  }}
                  initial={shouldReduce ? { opacity: 0 } : { scaleX: 0 }}
                  whileInView={shouldReduce ? { opacity: 1 } : { scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                />

                <MotionButton
                  className="glass px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors w-full text-left"
                  onClick={() => onScanFor?.(c.content_id, c.title)}
                >
                  Scan for Piracy →
                </MotionButton>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
