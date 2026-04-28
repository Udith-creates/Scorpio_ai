import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { blurSlideUp, staggerContainer, tabTransition } from '../../lib/animations.js';
import { fetchSummary, fetchHeatmap } from '../../lib/api.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CHART_OPTS_DONUT = {
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
  },
};

const CHART_OPTS_BAR = {
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
  },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
  },
};

export default function AnalyticsTab() {
  const shouldReduce = useReducedMotion();
  const transition   = tabTransition(shouldReduce);
  const itemVars     = blurSlideUp(shouldReduce);

  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    Promise.all([fetchSummary(), fetchHeatmap()])
      .then(([s, h]) => { setSummary(s); setHeatmap(h.heatmap || []); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <motion.div {...tabTransition(shouldReduce)} className="text-center py-16 text-slate-500">
        <div className="spinner mx-auto mb-3" />
        Loading analytics…
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div {...tabTransition(shouldReduce)} className="text-red-400 text-sm py-8 text-center">
        Error: {error}
      </motion.div>
    );
  }

  const platforms = (summary?.platform_breakdown || []).slice(0, 8);

  const donutData = {
    labels: ['Piracy', 'Fair Use', 'Inconclusive'],
    datasets: [{
      data: [summary?.piracy_confirmed, summary?.fair_use_cleared, summary?.inconclusive_count],
      backgroundColor: ['#ef4444', '#22c55e', '#eab308'],
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: platforms.map((p) => p.platform),
    datasets: [
      { label: 'Detections', data: platforms.map((p) => p.detection_count), backgroundColor: '#8b5cf6' },
      { label: 'DMCA Filed', data: platforms.map((p) => p.dmca_count),      backgroundColor: '#ef4444' },
    ],
  };

  /* Heatmap build */
  const hPlatforms = [...new Set(heatmap.map((e) => e.platform))];
  const hRegions   = [...new Set(heatmap.map((e) => e.region))];
  const hLookup    = Object.fromEntries(heatmap.map((e) => [`${e.platform}__${e.region}`, e.count]));
  const maxCount   = Math.max(...heatmap.map((e) => e.count), 1);

  return (
    <motion.div {...transition}>
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Donut */}
        <motion.div className="glass rounded-2xl p-6" variants={itemVars}>
          <h3 className="font-semibold mb-4">Verdict Distribution</h3>
          <Doughnut data={donutData} options={CHART_OPTS_DONUT} height={220} />
        </motion.div>

        {/* Bar */}
        <motion.div className="glass rounded-2xl p-6" variants={itemVars}>
          <h3 className="font-semibold mb-4">Detections by Platform</h3>
          <Bar data={barData} options={CHART_OPTS_BAR} height={220} />
        </motion.div>

        {/* Heatmap */}
        <motion.div className="glass rounded-2xl p-6 md:col-span-2" variants={itemVars}>
          <h3 className="font-semibold mb-4">Heatmap — Platform × Region</h3>
          {heatmap.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-8">No heatmap data yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr>
                    <th className="text-left text-slate-500 pr-3 pb-2">Platform</th>
                    {hRegions.map((r) => (
                      <th key={r} className="text-slate-500 pb-2 px-2">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hPlatforms.map((p) => (
                    <tr key={p}>
                      <td className="text-slate-400 pr-3 py-1 font-medium">{p}</td>
                      {hRegions.map((r) => {
                        const c = hLookup[`${p}__${r}`] || 0;
                        const alpha = c / maxCount;
                        const bg = c > 0 ? `rgba(239,68,68,${0.1 + alpha * 0.8})` : 'transparent';
                        return (
                          <td
                            key={r}
                            className="text-center py-1 px-2 rounded"
                            style={{ background: bg }}
                          >
                            {c || ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
