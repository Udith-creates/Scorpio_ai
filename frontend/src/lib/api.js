const API_BASE = '';

async function apiFetch(path, opts = {}) {
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let detail = 'Request failed';
    try { detail = JSON.parse(text).detail || detail; }
    catch (_) { if (text) detail = text.slice(0, 120); }
    throw new Error(detail);
  }
  return res.json();
}

async function postForm(path, formData) {
  const res = await fetch(API_BASE + path, { method: 'POST', body: formData });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    let msg = `Server error ${res.status}`;
    try { msg = JSON.parse(t).detail || msg; }
    catch (_) { if (t) msg = t.slice(0, 120); }
    throw new Error(msg);
  }
  return res.json();
}

export const fetchSummary     = ()  => apiFetch('/api/v1/analytics/summary');
export const fetchContentList = ()  => apiFetch('/api/v1/content/list');
export const fetchDetections  = (status) =>
  apiFetch('/api/v1/detections/list?limit=100' + (status ? '&status=' + status : ''));
export const fetchDetection   = (id) => apiFetch(`/api/v1/detections/${id}`);
export const fetchHeatmap     = ()  => apiFetch('/api/v1/analytics/heatmap');

export const registerContent  = (fd) => postForm('/api/v1/content/register', fd);
export const matchContent     = (fd) => postForm('/api/v1/content/match', fd);

export const triggerScan = (payload) =>
  apiFetch('/api/v1/scraper/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const fileTakedown = (id) =>
  apiFetch(`/api/v1/detections/${id}/takedown`, { method: 'POST' });

export const dismissDetection = (id) =>
  apiFetch(`/api/v1/detections/${id}/dismiss`, { method: 'POST' });
