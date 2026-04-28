import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { UploadZone } from '../ui/UploadZone.jsx';
import { MotionButton } from '../ui/MotionButton.jsx';
import { VerdictBadge } from '../ui/Badge.jsx';
import { SimBar } from '../ui/SimBar.jsx';
import {
  blurSlideUp, staggerContainer, conditionalItem, tabTransition,
} from '../../lib/animations.js';
import { matchContent, triggerScan, fetchContentList } from '../../lib/api.js';

const VIDEO_ACCEPT = '.mp4,.avi,.mov,.mkv,.webm';
const PLATFORMS = ['youtube', 'dailymotion', 'vimeo', 'twitter', 'facebook', 'tiktok'];
const PLATFORM_LABELS = {
  youtube: 'YouTube', dailymotion: 'Dailymotion', vimeo: 'Vimeo',
  twitter: 'Twitter/X', facebook: 'Facebook', tiktok: 'TikTok',
};

export default function MatchTab({ scanContext, onSuccess }) {
  const shouldReduce = useReducedMotion();
  const transition   = tabTransition(shouldReduce);
  const itemVars     = blurSlideUp(shouldReduce);

  /* Manual match state */
  const [matchFile, setMatchFile]       = useState(null);
  const [matchTitle, setMatchTitle]     = useState('');
  const [matchPlatform, setMatchPlatform] = useState('');
  const [matchUrl, setMatchUrl]         = useState('');
  const [threshold, setThreshold]       = useState(0.75);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult]   = useState(null);
  const [matchError, setMatchError]     = useState(null);

  /* Scan state */
  const [contentOptions, setContentOptions] = useState([]);
  const [scanContentId, setScanContentId]   = useState('');
  const [scanKeywords, setScanKeywords]     = useState('');
  const [selectedPlatforms, setSelected]    = useState(['youtube']);
  const [scanLoading, setScanLoading]       = useState(false);
  const [scanResult, setScanResult]         = useState(null);
  const [scanError, setScanError]           = useState(null);

  /* Pre-fill from library context */
  useEffect(() => {
    if (scanContext) {
      setScanContentId(scanContext.contentId);
      setScanKeywords(scanContext.title);
    }
  }, [scanContext]);

  /* Load content options for scan select */
  useEffect(() => {
    fetchContentList()
      .then((d) => setContentOptions(d.content || []))
      .catch(() => {});
  }, []);

  const togglePlatform = (p) =>
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  /* ── Manual match ── */
  const handleMatch = async (e) => {
    e.preventDefault();
    if (!matchFile) { setMatchError('Please select a video file.'); return; }
    setMatchLoading(true);
    setMatchResult(null);
    setMatchError(null);

    const fd = new FormData();
    fd.append('file', matchFile);
    fd.append('similarity_threshold', threshold);
    fd.append('suspect_title', matchTitle);
    fd.append('suspect_platform', matchPlatform);
    fd.append('suspect_url', matchUrl);

    try {
      const data = await matchContent(fd);
      setMatchResult(data);
      onSuccess?.();
    } catch (err) {
      setMatchError(err.message);
    } finally {
      setMatchLoading(false);
    }
  };

  /* ── Platform scan ── */
  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanContentId) { setScanError('Select registered content first.'); return; }
    const keywords = scanKeywords.split(',').map((k) => k.trim()).filter(Boolean);
    if (!keywords.length) { setScanError('Enter at least one keyword.'); return; }
    if (!selectedPlatforms.length) { setScanError('Select at least one platform.'); return; }

    setScanLoading(true);
    setScanResult(null);
    setScanError(null);

    try {
      const data = await triggerScan({
        content_id: scanContentId,
        search_keywords: keywords,
        platforms: selectedPlatforms,
        max_results_per_platform: 10,
      });
      setScanResult({ ...data, platformCount: selectedPlatforms.length });
      onSuccess?.();
    } catch (err) {
      setScanError(err.message);
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <motion.div {...transition}>
      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Manual Match ── */}
        <motion.div
          className="glass rounded-2xl p-6"
          variants={itemVars}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-lg font-semibold mb-1">Manual Video Match</h2>
          <p className="text-xs text-slate-500 mb-5">
            Upload a suspect video to check it against the registered fingerprint database.
          </p>

          <form onSubmit={handleMatch} className="space-y-3">
            <UploadZone
              id="match-file"
              accept={VIDEO_ACCEPT}
              emoji="🔍"
              placeholder="Drop suspect video here"
              onFileChange={setMatchFile}
            />
            <input
              className="glass-input"
              placeholder="Suspect video title"
              value={matchTitle}
              onChange={(e) => setMatchTitle(e.target.value)}
            />
            <input
              className="glass-input"
              placeholder="Platform (YouTube, TikTok…)"
              value={matchPlatform}
              onChange={(e) => setMatchPlatform(e.target.value)}
            />
            <input
              className="glass-input"
              placeholder="Suspect URL (optional)"
              value={matchUrl}
              onChange={(e) => setMatchUrl(e.target.value)}
            />

            {/* Threshold slider */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500 w-32">Min similarity:</label>
              <input
                type="range"
                min="0.5" max="0.99" step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="flex-1 accent-purple-500"
              />
              <span className="text-xs text-purple-400 w-10 text-right mono">
                {threshold.toFixed(2)}
              </span>
            </div>

            <MotionButton
              type="submit"
              disabled={matchLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors glow-blue flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {matchLoading
                ? <><span className="spinner" /> Analyzing…</>
                : 'Run DNA Match'}
            </MotionButton>

            <AnimatePresence>
              {matchError && (
                <motion.p className="text-xs text-red-400 text-center" {...conditionalItem}>
                  {matchError}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* ── Platform Scan ── */}
        <motion.div
          className="glass rounded-2xl p-6"
          variants={itemVars}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.08 }}
        >
          <h2 className="text-lg font-semibold mb-1">Platform Scan</h2>
          <p className="text-xs text-slate-500 mb-5">
            Deploy the scraper fleet to hunt for infringing copies across platforms.
          </p>

          <form onSubmit={handleScan} className="space-y-3">
            <select
              className="glass-select"
              value={scanContentId}
              onChange={(e) => setScanContentId(e.target.value)}
            >
              <option value="">Select registered content…</option>
              {contentOptions.map((c) => (
                <option key={c.content_id} value={c.content_id}>
                  {c.title} ({c.owner})
                </option>
              ))}
            </select>

            <input
              className="glass-input"
              placeholder="Keywords (comma-separated)"
              value={scanKeywords}
              onChange={(e) => setScanKeywords(e.target.value)}
              required
            />

            {/* Platform checkboxes */}
            <div>
              <div className="text-xs text-slate-500 mb-2">Platforms to scan:</div>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <motion.label
                    key={p}
                    className={`glass px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${
                      selectedPlatforms.includes(p)
                        ? 'border-purple-500 text-purple-300'
                        : 'border-white/10 text-slate-400 hover:border-purple-500'
                    }`}
                    whileHover={shouldReduce ? {} : { scale: 1.04 }}
                    whileTap={shouldReduce ? {} : { scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedPlatforms.includes(p)}
                      onChange={() => togglePlatform(p)}
                    />
                    {PLATFORM_LABELS[p]}
                  </motion.label>
                ))}
              </div>
            </div>

            <MotionButton
              type="submit"
              disabled={scanLoading}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors glow-red flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {scanLoading
                ? <><span className="spinner" /> Scanning…</>
                : '🚀 Deploy Scraper Fleet'}
            </MotionButton>

            <AnimatePresence>
              {scanError && (
                <motion.p className="text-xs text-red-400 text-center" {...conditionalItem}>
                  {scanError}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>

      {/* ── Results ── */}
      <AnimatePresence mode="wait">
        {matchResult && (
          <motion.div
            key="match-result"
            className="mt-6 glass rounded-2xl p-6"
            variants={conditionalItem}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {(!matchResult.matches || matchResult.matches.length === 0) ? (
              <div className="text-center text-green-400">
                <div className="text-3xl mb-2">✓</div>
                <div className="font-semibold">No matches found above threshold</div>
                <div className="text-xs text-slate-500 mt-1">
                  This video does not appear to infringe any registered content.
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-red-400 text-2xl">⚠</div>
                  <div>
                    <div className="font-semibold">
                      {matchResult.matches.length} match{matchResult.matches.length > 1 ? 'es' : ''} found
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      {matchResult.extracted_frames} frames analyzed
                      <span>·</span>
                      Gemini verdict: <VerdictBadge verdict={matchResult.gemini_verdict} />
                    </div>
                  </div>
                </div>

                {matchResult.gemini_reasoning && (
                  <div className="glass rounded-lg p-3 mb-4 text-xs text-slate-400 italic">
                    {matchResult.gemini_reasoning}
                  </div>
                )}

                <motion.div
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {matchResult.matches.map((m, i) => (
                    <motion.div
                      key={i}
                      className="glass rounded-xl p-4"
                      variants={blurSlideUp(shouldReduce)}
                      whileHover={shouldReduce ? {} : { y: -3, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-medium text-sm">{m.title}</div>
                          <div className="text-xs text-slate-500">
                            {m.owner} · {m.matched_frames}/{m.total_frames} frames matched
                          </div>
                        </div>
                        <div className="mono text-sm font-bold text-red-400">
                          {(m.similarity_score * 100).toFixed(1)}%
                        </div>
                      </div>
                      <SimBar score={m.similarity_score} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {scanResult && (
          <motion.div
            key="scan-result"
            className="mt-6 glass rounded-2xl p-6"
            variants={conditionalItem}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-green-400 font-semibold mb-4">🚀 Scan Complete</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { val: scanResult.platformCount,          label: 'Platforms Scanned', color: 'text-blue-400'   },
                { val: scanResult.total_candidates_found, label: 'Candidates Found',  color: 'text-yellow-400' },
                { val: scanResult.detections_created,     label: 'Detections Stored', color: 'text-red-400'    },
              ].map((s) => (
                <div key={s.label}>
                  <div className={`text-2xl font-bold ${s.color} font-mono`}>{s.val}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Scan ID: <span className="mono text-purple-400">{scanResult.scan_id}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
