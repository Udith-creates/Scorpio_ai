import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar         from './components/Navbar.jsx';
import StatsBar       from './components/StatsBar.jsx';
import TabBar         from './components/TabBar.jsx';
import DmcaModal      from './components/DmcaModal.jsx';
import RegisterTab    from './components/tabs/RegisterTab.jsx';
import MatchTab       from './components/tabs/MatchTab.jsx';
import DetectionsTab  from './components/tabs/DetectionsTab.jsx';
import AnalyticsTab   from './components/tabs/AnalyticsTab.jsx';
import LibraryTab     from './components/tabs/LibraryTab.jsx';
import { fetchSummary } from './lib/api.js';

export default function App() {
  const [activeTab, setActiveTab]   = useState('register');
  const [stats, setStats]           = useState(null);
  const [dmcaNotice, setDmcaNotice] = useState(null);
  const [scanContext, setScanContext] = useState(null);

  const loadStats = useCallback(async () => {
    try { setStats(await fetchSummary()); }
    catch (_) {}
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleScanFor = (contentId, title) => {
    setScanContext({ contentId, title });
    setActiveTab('match');
  };

  const handleTabChange = (tab) => {
    if (tab !== 'match') setScanContext(null);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-bg-base" style={{ color: 'var(--text-primary)' }}>
      <Navbar onRefresh={loadStats} />

      <div className="max-w-7xl mx-auto px-6 py-5">
        <StatsBar stats={stats} />
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab panels — AnimatePresence for enter/exit animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'register' && (
            <RegisterTab key="register" onSuccess={loadStats} />
          )}
          {activeTab === 'match' && (
            <MatchTab key="match" scanContext={scanContext} onSuccess={loadStats} />
          )}
          {activeTab === 'detections' && (
            <DetectionsTab key="detections" onAction={loadStats} onShowDmca={setDmcaNotice} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab key="analytics" />
          )}
          {activeTab === 'library' && (
            <LibraryTab key="library" onScanFor={handleScanFor} />
          )}
        </AnimatePresence>
      </div>

      {/* DMCA modal */}
      <AnimatePresence>
        {dmcaNotice && (
          <DmcaModal
            key="dmca"
            notice={dmcaNotice}
            onClose={() => setDmcaNotice(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom spacer */}
      <div style={{ height: 'var(--space-16)' }} />
    </div>
  );
}
