import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { VerdictBadge, StatusBadge } from '../ui/Badge.jsx';
import { SimBar } from '../ui/SimBar.jsx';
import { MotionButton } from '../ui/MotionButton.jsx';
import {
  blurSlideUp, staggerContainer, conditionalItem, tabTransition,
} from '../../lib/animations.js';
import { fetchDetections, fileTakedown, dismissDetection } from '../../lib/api.js';

export default function DetectionsTab({ onAction, onShowDmca }) {
  const shouldReduce = useReducedMotion();
  const transition   = tabTransition(shouldReduce);
  const itemVars     = blurSlideUp(shouldReduce);

  const [detections, setDetections] = useState([]);
  const [statusFilter, setFilter]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDetections(statusFilter);
      setDetections(data.detections || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleTakedown = async (id) => {
    if (!confirm('File a DMCA takedown notice for this detection?')) return;
    try {
      const data = await fileTakedown(id);
      onShowDmca?.(data.dmca_notice);
      load();
      onAction?.();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await dismissDetection(id);
      load();
      onAction?.();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <motion.div {...transition}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)' }}>
          Piracy Detections
        </h2>
        <div className="flex gap-2">
          <select
            className="glass-select"
            style={{ width: 'auto', padding: 'var(--space-1-5) var(--space-3)' }}
            value={statusFilter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="analyzed">Analyzed</option>
            <option value="dmca_submitted">DMCA Submitted</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <MotionButton
            className="glass px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
            onClick={load}
          >
            Refresh
          </MotionButton>
        </div>
      </div>

      {/* States */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" {...conditionalItem} className="text-center py-16 text-slate-500">
            <div className="spinner mx-auto mb-3" />
            Loading detections…
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" {...conditionalItem} className="text-red-400 text-sm py-8 text-center">
            Error: {error}
          </motion.div>
        )}

        {!loading && !error && detections.length === 0 && (
          <motion.div
            key="empty"
            {...conditionalItem}
            className="glass rounded-xl p-8 text-center text-slate-500 text-sm"
          >
            No detections yet. Run a scan or upload a suspect video.
          </motion.div>
        )}

        {!loading && !error && detections.length > 0 && (
          <motion.div
            key="list"
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {detections.map((d) => (
              <motion.div
                key={d.detection_id}
                className="glass rounded-xl p-4 flex flex-col md:flex-row md:items-start gap-4"
                variants={itemVars}
                whileHover={shouldReduce ? {} : { y: -3, scale: 1.005 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <VerdictBadge verdict={d.gemini_verdict} />
                    <StatusBadge status={d.status} />
                    <span className="text-xs text-slate-500">{d.suspect_platform}</span>
                  </div>
                  <div className="font-medium text-sm truncate">
                    {d.suspect_title || 'Unknown title'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Original: <span className="text-slate-300">{d.content_title}</span> by {d.content_owner}
                  </div>
                  {d.suspect_url && (
                    <a
                      href={d.suspect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline truncate block mt-0.5"
                    >
                      {d.suspect_url}
                    </a>
                  )}
                  <div className="mt-2">
                    <SimBar score={d.similarity_score} />
                  </div>
                  {d.gemini_reasoning && (
                    <div className="mt-2 text-xs text-slate-500 italic">{d.gemini_reasoning}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                  {!['dmca_submitted', 'dismissed', 'resolved'].includes(d.status) && (
                    <>
                      <MotionButton
                        className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors whitespace-nowrap"
                        onClick={() => handleTakedown(d.detection_id)}
                      >
                        DMCA ⚡
                      </MotionButton>
                      <MotionButton
                        className="glass px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
                        onClick={() => handleDismiss(d.detection_id)}
                      >
                        Dismiss
                      </MotionButton>
                    </>
                  )}
                  {d.status === 'dmca_submitted' && (
                    <MotionButton
                      className="glass px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 transition-colors"
                      onClick={async () => {
                        const det = await fetchDetections().then(() =>
                          fetch(`/api/v1/detections/${d.detection_id}`).then((r) => r.json())
                        ).catch(() => ({ dmca_notice: 'No notice available.' }));
                        onShowDmca?.(det.dmca_notice || 'No notice available.');
                      }}
                    >
                      View Notice
                    </MotionButton>
                  )}
                  <div className="text-xs text-slate-600 text-right">
                    {new Date(d.detected_at).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
