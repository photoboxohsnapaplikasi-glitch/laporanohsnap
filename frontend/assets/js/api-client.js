/**
 * Oh Snap! Photobox — Frontend API & Cloud Sync Client (5 Cabang)
 * Menghubungkan Frontend (index.html, admin.html, laporan_keuangan_harian.html)
 * dengan Backend REST API (/api/*) dan Google Apps Script (Code.gs).
 * Mendukung:
 * 1. Format tanggal lokal WIB (getLocalIsoDate & getYesterdayLocalIsoDate)
 * 2. Proteksi 4 Lapis Anti Klik 2x (Anti Duplikat Laporan)
 * 3. Sinkronisasi Riwayat Penuh (opLogsSummary) untuk periode Hari Ini & Kemarin
 * 4. Hapus Laporan (Delete) serentak di semua 7 tabel Admin & Cloud (deletedOpLogIds)
 */
(function (global) {
  'use strict';

  const DEFAULT_API_BASE = (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http'))
    ? window.location.origin
    : 'http://localhost:3000';

  function getLocalIsoDate(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function getYesterdayLocalIsoDate() {
    const now = new Date();
    const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0);
    return getLocalIsoDate(y);
  }

  async function fetchConfig(apiBase = DEFAULT_API_BASE) {
    const res = await fetch(`${apiBase}/api/config?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async function saveConfig(cloudConfig, options = {}, apiBase = DEFAULT_API_BASE) {
    const res = await fetch(`${apiBase}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cloudConfig,
        createBranchName: options.createBranchName || '',
        ensureAllBranchSpreadsheets: Boolean(options.ensureAllBranchSpreadsheets)
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async function submitOperationalReport(payload, apiBase = DEFAULT_API_BASE) {
    const enrichedPayload = {
      ...payload,
      tanggal: payload.tanggal || getLocalIsoDate()
    };
    const res = await fetch(`${apiBase}/api/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedPayload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async function deleteOpLogById(logId, apiBase = DEFAULT_API_BASE) {
    const res = await fetch(`${apiBase}/api/logs/${encodeURIComponent(String(logId).trim())}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async function deleteMultipleOpLogs(ids = [], reportKey = 'ALL_HISTORY', apiBase = DEFAULT_API_BASE) {
    const res = await fetch(`${apiBase}/api/logs/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, reportKey })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  global.OhSnapApiClient = {
    getLocalIsoDate,
    getYesterdayLocalIsoDate,
    fetchConfig,
    saveConfig,
    submitOperationalReport,
    deleteOpLogById,
    deleteMultipleOpLogs
  };
})(typeof window !== 'undefined' ? window : globalThis);
