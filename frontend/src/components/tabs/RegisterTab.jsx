import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { UploadZone } from '../ui/UploadZone.jsx';
import { MotionButton } from '../ui/MotionButton.jsx';
import { WordSplit } from '../ui/WordSplit.jsx';
import { blurSlideUp, staggerContainer, conditionalItem, tabTransition } from '../../lib/animations.js';
import { registerContent } from '../../lib/api.js';

const VIDEO_ACCEPT = '.mp4,.avi,.mov,.mkv,.webm';

export default function RegisterTab({ onSuccess }) {
  const shouldReduce = useReducedMotion();
  const [file, setFile]       = useState(null);
  const [title, setTitle]     = useState('');
  const [owner, setOwner]     = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  const transition = tabTransition(shouldReduce);
  const itemVars   = blurSlideUp(shouldReduce);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a video file.'); return; }
    setLoading(true);
    setResult(null);
    setError(null);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    fd.append('owner', owner);
    fd.append('platform', platform);

    try {
      const data = await registerContent(fd);
      setResult(data);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div {...transition}>
      {/* Section heading */}
      <motion.div
        className="mb-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVars}>
          <WordSplit
            text="Register Original Content"
            className="font-bold text-white"
            style={{ fontSize: 'var(--text-3xl)' }}
          />
        </motion.div>
        <motion.p
          variants={itemVars}
          className="text-slate-500 mt-1"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          Upload a video to extract its Content DNA and anchor the hash to the blockchain.
        </motion.p>
        <motion.div
          variants={itemVars}
          className="mt-3 rounded-full"
          style={{
            height: '1px',
            background: 'linear-gradient(to right, var(--accent), transparent)',
            transformOrigin: 'left',
          }}
        />
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Form panel ── */}
        <motion.div
          className="glass rounded-2xl p-6"
          variants={itemVars}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-1">Upload &amp; Register</h2>
          <p className="text-xs text-slate-500 mb-5">
            Extract Content DNA and anchor the hash to Ethereum.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <UploadZone
              id="reg-file"
              accept={VIDEO_ACCEPT}
              emoji="🎬"
              placeholder="Drop video here or click to browse"
              onFileChange={setFile}
            />

            <input
              className="glass-input"
              placeholder="Content Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              className="glass-input"
              placeholder="Rights Owner / Studio *"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
            />
            <input
              className="glass-input"
              placeholder="Original Platform (YouTube, Netflix…)"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />

            <MotionButton
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors glow-purple flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <><span className="spinner" /> Extracting DNA…</>
                : 'Extract DNA & Register'}
            </MotionButton>

            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-xs text-red-400 text-center"
                  {...conditionalItem}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* ── Result panel ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              className="glass rounded-2xl p-6 flex items-center justify-center"
              variants={conditionalItem}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="text-center">
                <div className="spinner mx-auto mb-3" />
                <div className="text-sm text-slate-400">Extracting Content DNA…</div>
                <div className="text-xs text-slate-600 mt-1">Analyzing frame-by-frame embeddings</div>
              </div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              key="result"
              className="glass rounded-2xl p-6"
              variants={conditionalItem}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex items-center gap-2 mb-5">
                <motion.div
                  className="text-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                >
                  ✓
                </motion.div>
                <h3 className="font-semibold text-green-400">Content Registered</h3>
              </div>

              <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { label: 'Content ID',        value: result.content_id, mono: true, color: 'text-purple-300' },
                  { label: 'Title',             value: result.title       },
                  { label: 'DNA Fingerprint',   value: `${result.extracted_frames} frames × ${result.dna_dimensions} dims` },
                  { label: 'Blockchain Hash',   value: result.blockchain_hash, hash: true },
                  { label: 'Transaction Hash',  value: result.tx_hash,         hash: true },
                ].map((row) => (
                  <motion.div
                    key={row.label}
                    className="glass rounded-lg p-3"
                    variants={blurSlideUp(shouldReduce)}
                  >
                    <div className="text-xs text-slate-500 mb-1">{row.label}</div>
                    <div className={row.hash ? 'hash-text' : `text-sm font-medium ${row.color ?? ''} ${row.mono ? 'mono' : ''}`}>
                      {row.value}
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  variants={blurSlideUp(shouldReduce)}
                  className="flex items-center gap-2 text-xs text-green-400"
                >
                  <span>✓</span> Anchored to Ethereum Mainnet
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {!loading && !result && (
            <motion.div
              key="placeholder"
              className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4"
              variants={conditionalItem}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="text-6xl opacity-20">🔗</div>
              <p className="text-slate-600 text-sm">
                Registration result and blockchain confirmation will appear here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
