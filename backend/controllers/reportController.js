/**
 * Report Controller — Oh Snap! Photobox 5 Cabang
 * Menangani:
 * 1. Pencatatan laporan ke 8 tabel operasional (sesuai 8 Sheet Spreadsheet Cabang)
 * 2. Proteksi Anti Klik 2x (Server-Side MD5 Deduplication)
 * 3. Filter periode akurat dengan Waktu Lokal WIB (HARI_INI, KEMARIN, 7_HARI, BULAN_INI, 1_TAHUN)
 * 4. Fitur Hapus (Delete) laporan serentak dari ke-8 tabel operasional & Cloud Config (deletedOpLogIds)
 */
const crypto = require('crypto');
const db = require('../config/database');

const DEDUP_CACHE = new Map();
const DEDUP_TTL_MS = 90 * 1000;

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

function normalizeReportDateStr(rawVal) {
  if (!rawVal) return '';
  if (rawVal instanceof Date && !isNaN(rawVal.getTime())) {
    return getLocalIsoDate(rawVal);
  }
  const s = String(rawVal).trim();
  if (!s || s === '-' || s === 'undefined') return '';

  const isoMatch = s.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  }

  const slashMatch = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) {
    const p1 = parseInt(slashMatch[1], 10);
    const p2 = parseInt(slashMatch[2], 10);
    const yyyy = slashMatch[3];
    if (p1 > 12 && p2 <= 12) {
      return `${yyyy}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
    }
    if (p2 > 12 && p1 <= 12) {
      return `${yyyy}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}`;
    }
    return `${yyyy}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
  }

  const idMonthMap = {
    jan: '01', januari: '01', peb: '02', feb: '02', februari: '02',
    mar: '03', maret: '03', apr: '04', april: '04', mei: '05',
    jun: '06', juni: '06', jul: '07', juli: '07', agu: '08', agust: '08', agustus: '08',
    sep: '09', september: '09', okt: '10', oktober: '10',
    nop: '11', nov: '11', november: '11', des: '12', desember: '12'
  };
  const wordMatch = s.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (wordMatch) {
    const dStr = wordMatch[1].padStart(2, '0');
    const mStr = idMonthMap[wordMatch[2].toLowerCase()];
    const yStr = wordMatch[3];
    if (mStr) return `${yStr}-${mStr}-${dStr}`;
  }

  return '';
}

function getPresetDateBounds(presetKey) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const todayStr = getLocalIsoDate(now);

  if (presetKey === 'HARI_INI') {
    return { start: todayStr, end: todayStr, label: 'Hari Ini' };
  }
  if (presetKey === 'KEMARIN') {
    const yStr = getYesterdayLocalIsoDate();
    return { start: yStr, end: yStr, label: 'Kemarin' };
  }
  if (presetKey === '7_HARI') {
    const d7 = new Date(yyyy, now.getMonth(), now.getDate() - 6, 12, 0, 0);
    return { start: getLocalIsoDate(d7), end: todayStr, label: '7 Hari Terakhir' };
  }
  if (presetKey === 'BULAN_INI') {
    return { start: `${yyyy}-${mm}-01`, end: todayStr, label: 'Bulan Ini' };
  }
  if (presetKey === 'BULAN_LALU') {
    const firstPrevMonth = new Date(yyyy, now.getMonth() - 1, 1, 12, 0, 0);
    const lastPrevMonth = new Date(yyyy, now.getMonth(), 0, 12, 0, 0);
    return { start: getLocalIsoDate(firstPrevMonth), end: getLocalIsoDate(lastPrevMonth), label: 'Bulan Lalu' };
  }
  if (presetKey === '3_BULAN') {
    const m3 = new Date(yyyy, now.getMonth() - 3, now.getDate(), 12, 0, 0);
    return { start: getLocalIsoDate(m3), end: todayStr, label: '3 Bulan Terakhir' };
  }
  const prevYear = new Date(yyyy - 1, now.getMonth(), now.getDate(), 12, 0, 0);
  return { start: getLocalIsoDate(prevYear), end: todayStr, label: '1 Tahun' };
}

function buildDedupHash(d) {
  const rawDedup = d.dedupKey || [
    d.recordType || '',
    d.subType || '',
    d.cabang || 'Cilacap',
    d.tanggal || '',
    d.shift || '',
    d.nama || '',
    d.totalGross !== undefined ? d.totalGross : '',
    d.totalExpense !== undefined ? d.totalExpense : '',
    d.kertasPax !== undefined ? d.kertasPax : '',
    d.positiveSummary || '',
    d.checklistSummary || '',
    d.catatan || ''
  ].join('|');
  return crypto.createHash('md5').update(rawDedup).digest('hex');
}

function saveReportFromPayload(d) {
  if (!d || typeof d !== 'object') {
    return { status: 'error', message: 'Invalid payload' };
  }
  if (d.recordType === 'ADMIN_SYNC_CONFIG' || d.action === 'save_config') {
    return handleAdminConfigSync(d);
  }

  const hashHex = buildDedupHash(d);
  const nowTs = Date.now();
  if (!d.bypassDedup && DEDUP_CACHE.has(hashHex)) {
    const prevTs = DEDUP_CACHE.get(hashHex);
    if (nowTs - prevTs < DEDUP_TTL_MS) {
      return {
        status: 'success',
        duplicateIgnored: true,
        message: 'Laporan duplikat (klik 2x) otomatis diabaikan agar tidak dobel.'
      };
    }
  }
  DEDUP_CACHE.set(hashHex, nowTs);

  const state = db.readDb();
  const cabang = d.cabang || 'Cilacap';
  const tanggal = normalizeReportDateStr(d.tanggal || d.cutoffDate || d.incomingDate) || getLocalIsoDate();
  const waktu = d.waktu || '12:00:00';
  const shift = d.shift || 'Shift Pagi';
  const nama = d.nama || 'Kru';
  const logId = String(d.clientLogId || d.id || ('OP-' + String(nowTs).slice(-6))).trim();

  // Jangan masukkan kembali jika sudah pernah dihapus oleh Admin
  if (state.deleted_oplog_ids.includes(logId)) {
    return { status: 'success', deletedSkipped: true, id: logId };
  }

  const autoLabel = d.label || (
    d.recordType === 'DAILY_REPORT' ? '📝 Laporan Keuangan Harian'
    : (d.recordType === 'STOCK_OPNAME' ? `🛍️ Stock Opname (Cutoff: ${d.cutoffDate || tanggal})`
    : (d.recordType === 'BARANG_DATANG' ? `🚚 Barang Datang (${d.incomingDate || tanggal})`
    : (d.recordType === 'OPEN_STORE' ? '☀️ Open Store'
    : (d.recordType === 'CLOSE_STORE' ? '🌙 Close Store'
    : (d.subType === 'MUKA_PULANG' ? '🏡 Absen Karyawan (Pulang)' : '🤳 Absen Karyawan (Datang)')))))
  );

  const summaryRecord = {
    id: logId,
    recordType: d.recordType || 'ABSEN_MUKA',
    subType: d.subType || '',
    senderRole: d.senderRole || 'USER',
    label: autoLabel,
    cabang,
    tanggal,
    cutoffDate: normalizeReportDateStr(d.cutoffDate) || tanggal,
    incomingDate: normalizeReportDateStr(d.incomingDate) || tanggal,
    waktu,
    shift,
    shiftScheduleLabel: d.shiftScheduleLabel || '',
    punctualityStatus: d.punctualityStatus || '',
    punctualityDetail: d.punctualityDetail || '',
    nama,
    petugasBantu: d.petugasBantu && d.petugasBantu !== '-' ? d.petugasBantu : '',
    lokasiWatermark: d.lokasiWatermark || '',
    cash: d.cash,
    qris: d.qris,
    totalGross: d.totalGross,
    totalExpense: d.totalExpense,
    netOmzet: d.netOmzet,
    expensesList: d.expensesList || [],
    rincianPengeluaran: d.rincianPengeluaran || '-',
    kertasPax: d.kertasPax,
    hangtagKecilPcs: d.hangtagKecilPcs,
    hangtagBesarPcs: d.hangtagBesarPcs,
    keychainPanjangPcs: d.keychainPanjangPcs,
    keychainBulatPcs: d.keychainBulatPcs,
    plastikKecilIkat: d.plastikKecilIkat,
    plastikBesarIkat: d.plastikBesarIkat,
    tintaLmPct: d.tintaLmPct,
    tintaLcPct: d.tintaLcPct,
    tintaYPct: d.tintaYPct,
    tintaMPct: d.tintaMPct,
    tintaCPct: d.tintaCPct,
    tintaKPct: d.tintaKPct,
    lemGanciPcs: d.lemGanciPcs,
    itemNumericValues: d.itemNumericValues || {},
    incomingItemsDetail: d.incomingItemsDetail || [],
    summary: d.summary || d.positiveSummary || d.itemsSummary || d.checklistSummary || d.punctualityDetail || d.catatan || '-',
    catatan: d.catatan || ''
  };

  state.op_logs_history = state.op_logs_history.filter(x => x && String(x.id) !== logId);
  state.op_logs_history.unshift(summaryRecord);

  // Simpan ke salah satu dari 8 tabel operasional sesuai jenis laporan
  const tables = state.sheets_tables;
  if (d.recordType === 'ABSEN_MUKA' || d.recordType === 'OPEN_STORE' || d.recordType === 'CLOSE_STORE') {
    const isPulang = d.subType === 'MUKA_PULANG' || d.subType === 'CLOSE_MUKA';
    const isMasuk = d.subType === 'MUKA_DATANG' || d.subType === 'OPEN_MUKA' || d.subType === 'MASUK';
    if (d.recordType === 'OPEN_STORE' && !isMasuk) {
      tables.open_store.unshift({
        log_id: logId, tanggal, jam_open_store: waktu, cabang, shift,
        jadwal_jam_kerja: d.shiftScheduleLabel || '-', nama_karyawan: nama,
        daftar_ceklis_open_store: d.checklistSummary || summaryRecord.summary,
        koordinat_gps_waktu: d.lokasiWatermark || '-', catatan: d.catatan || '-'
      });
    } else if (d.recordType === 'CLOSE_STORE' && !isPulang) {
      tables.close_store.unshift({
        log_id: logId, tanggal, jam_close_store: waktu, cabang, shift,
        jadwal_jam_kerja: d.shiftScheduleLabel || '-', nama_karyawan: nama,
        jumlah_foto_close_store: Array.isArray(d.closePhotosList) ? `${d.closePhotosList.length} Foto` : '2 Foto',
        daftar_ceklis_close_store: d.checklistSummary || summaryRecord.summary,
        koordinat_gps_waktu: d.lokasiWatermark || '-', catatan: d.catatan || '-'
      });
    } else if (isPulang) {
      tables.absen_keluar.unshift({
        log_id: logId, tanggal, jam_absen_keluar: waktu, cabang, nama_karyawan: nama,
        shift, jadwal_jam_kerja: d.shiftScheduleLabel || '-',
        status_jam_kerja: d.punctualityStatus || 'TEPAT WAKTU',
        detail_kekurangan_jam_kerja: d.punctualityDetail || '-',
        koordinat_gps_waktu: d.lokasiWatermark || '-', catatan: d.catatan || '-'
      });
    } else {
      tables.absen_masuk.unshift({
        log_id: logId, tanggal, jam_absen_masuk: waktu, cabang, nama_karyawan: nama,
        shift, jadwal_jam_kerja: d.shiftScheduleLabel || '-',
        status_ketepatan: d.punctualityStatus || 'TEPAT WAKTU',
        detail_keterlambatan: d.punctualityDetail || '-',
        koordinat_gps_waktu: d.lokasiWatermark || '-', catatan: d.catatan || '-'
      });
    }
  } else if (d.recordType === 'BARANG_DATANG') {
    const items = Array.isArray(d.incomingItemsDetail) && d.incomingItemsDetail.length > 0
      ? d.incomingItemsDetail
      : [{ code: '-', name: d.positiveSummary || 'Barang Datang', category: '-', unit: 'Pcs', stockBefore: 0, addedQty: 0, stockAfter: 0 }];
    items.forEach(itm => {
      tables.barang_datang.unshift({
        log_id: logId, cabang, peran_pengirim: d.senderRole || 'USER',
        tanggal_input: tanggal, tanggal_barang_datang: summaryRecord.incomingDate,
        jam_input: waktu, shift, nama_petugas: nama, petugas_membantu: d.petugasBantu || '-',
        kode_barang: itm.code || '-', nama_barang: itm.name || '-', jenis_barang: itm.category || '-',
        satuan: itm.unit || 'Pcs', stok_awal: itm.stockBefore ?? 0,
        jumlah_masuk: itm.addedQty ?? 0, stok_akhir: itm.stockAfter ?? 0,
        ringkasan_laporan: summaryRecord.summary, catatan: d.catatan || '-'
      });
    });
  } else if (d.recordType === 'STOCK_OPNAME') {
    tables.stock_opname.unshift({
      log_id: logId, cabang, peran_pengirim: d.senderRole || 'USER',
      tanggal_input: tanggal, tanggal_cutoff: summaryRecord.cutoffDate,
      jam_input: waktu, shift, nama_petugas: nama, petugas_membantu: d.petugasBantu || '-',
      kertas_pax: d.kertasPax ?? 0, hangtag_kecil_pcs: d.hangtagKecilPcs ?? 0,
      hangtag_besar_pcs: d.hangtagBesarPcs ?? 0, keychain_panjang_pcs: d.keychainPanjangPcs ?? 0,
      keychain_bulat_pcs: d.keychainBulatPcs ?? 0, plastik_kecil_ikat: d.plastikKecilIkat ?? 0,
      plastik_besar_ikat: d.plastikBesarIkat ?? 0, tinta_lm_pct: d.tintaLmPct ?? 0,
      tinta_lc_pct: d.tintaLcPct ?? 0, tinta_y_pct: d.tintaYPct ?? 0,
      tinta_m_pct: d.tintaMPct ?? 0, tinta_c_pct: d.tintaCPct ?? 0,
      tinta_k_pct: d.tintaKPct ?? 0, lem_ganci_pcs: d.lemGanciPcs ?? 0,
      catatan: d.catatan || '-'
    });
  } else if (d.recordType === 'DAILY_REPORT') {
    const cash = Number(d.cash) || 0;
    const qris = Number(d.qris) || 0;
    const gross = Number(d.totalGross) || (cash + qris);
    const exp = Number(d.totalExpense) || 0;
    const net = Number(d.netOmzet) || (gross - exp);
    tables.laporan_harian.unshift({
      log_id: logId, tanggal, jam_input: waktu, cabang, shift, nama_kasir: nama,
      pemasukan_cash: cash, pemasukan_qris: qris, pemasukan_total_kotor: gross,
      total_pengeluaran_kas: exp, rincian_pengeluaran: d.rincianPengeluaran || '-',
      total_pemasukan_bersih: net, catatan: d.catatan || '-'
    });
    const expList = Array.isArray(d.expensesList) && d.expensesList.length > 0
      ? d.expensesList
      : (exp > 0 ? [{ desc: d.rincianPengeluaran || 'Pengeluaran Operasional', amount: exp }] : []);
    expList.forEach(exItem => {
      tables.rekap_pengeluaran.unshift({
        log_id: logId, tanggal, jam_input: waktu, cabang, shift, nama_kasir: nama,
        nama_item_pengeluaran: exItem.desc || 'Pengeluaran Operasional',
        nominal_item_pengeluaran: Number(exItem.amount) || 0,
        total_pengeluaran_shift: exp, catatan_shift: d.catatan || '-'
      });
    });
  }

  // Update cloud_config snapshot
  state.cloud_config = state.cloud_config || {};
  state.cloud_config.deletedOpLogIds = state.deleted_oplog_ids;
  state.cloud_config.opLogsSummary = state.op_logs_history.slice(0, 80);
  state.cloud_config.updatedAt = Date.now();

  db.writeDb(state);
  return {
    status: 'success',
    id: logId,
    cabang,
    tanggal,
    recordType: summaryRecord.recordType
  };
}

function handleAdminConfigSync(payloadObj) {
  const state = db.readDb();
  const incomingCfg = (payloadObj && payloadObj.cloudConfig) ? payloadObj.cloudConfig : (payloadObj || {});
  const existingCfg = state.cloud_config || {};

  // Union deletedOpLogIds
  const unionDel = new Set([
    ...(state.deleted_oplog_ids || []).map(String),
    ...(existingCfg.deletedOpLogIds || []).map(String),
    ...(incomingCfg.deletedOpLogIds || []).map(String)
  ].filter(Boolean));
  state.deleted_oplog_ids = [...unionDel].slice(-300);

  // Hapus semua record yang ada di deleted_oplog_ids dari op_logs_history & ke-8 tabel
  if (state.deleted_oplog_ids.length > 0) {
    removeLogIdsFromAllTablesInState(state, state.deleted_oplog_ids);
  }

  // Union opLogsSummary
  const seenIds = new Set(state.op_logs_history.map(x => String(x.id)));
  const incomingLogs = Array.isArray(incomingCfg.opLogsSummary) ? incomingCfg.opLogsSummary : [];
  incomingLogs.forEach(item => {
    if (!item || !item.id) return;
    const sId = String(item.id).trim();
    if (!sId || unionDel.has(sId) || seenIds.has(sId)) return;
    seenIds.add(sId);
    state.op_logs_history.unshift(item);
  });

  const mergedCfg = {
    ...existingCfg,
    ...incomingCfg,
    deletedOpLogIds: state.deleted_oplog_ids,
    opLogsSummary: state.op_logs_history.slice(0, 80),
    updatedAt: incomingCfg.updatedAt || Date.now()
  };

  if (Array.isArray(mergedCfg.branches) && mergedCfg.branches.length > 0) {
    state.branches = mergedCfg.branches;
  }
  if (Array.isArray(mergedCfg.employees) && mergedCfg.employees.length > 0) {
    state.employees = mergedCfg.employees;
  }
  state.cloud_config = mergedCfg;
  db.writeDb(state);

  return {
    status: 'success',
    synced: true,
    version: 'v4_cloud_sync',
    cloudConfig: mergedCfg
  };
}

function removeLogIdsFromAllTablesInState(state, idsArray) {
  const idSet = new Set((idsArray || []).map(x => String(x).trim()).filter(Boolean));
  if (idSet.size === 0) return 0;

  const beforeCount = state.op_logs_history.length;
  state.op_logs_history = state.op_logs_history.filter(x => x && !idSet.has(String(x.id)));
  const removedCount = beforeCount - state.op_logs_history.length;

  Object.keys(state.sheets_tables || {}).forEach(tableName => {
    if (Array.isArray(state.sheets_tables[tableName])) {
      state.sheets_tables[tableName] = state.sheets_tables[tableName].filter(row => row && !idSet.has(String(row.log_id || row.id)));
    }
  });

  idSet.forEach(id => {
    if (!state.deleted_oplog_ids.includes(id)) {
      state.deleted_oplog_ids.push(id);
    }
  });

  if (state.cloud_config && Array.isArray(state.cloud_config.opLogsSummary)) {
    state.cloud_config.opLogsSummary = state.cloud_config.opLogsSummary.filter(x => x && !idSet.has(String(x.id)));
    state.cloud_config.deletedOpLogIds = state.deleted_oplog_ids;
    state.cloud_config.updatedAt = Date.now();
  }
  return removedCount;
}

function deleteOpLogRecords(ids = []) {
  const cleanIds = (Array.isArray(ids) ? ids : [ids]).map(x => String(x || '').trim()).filter(Boolean);
  if (cleanIds.length === 0) {
    return { status: 'error', message: 'No log IDs provided', deletedCount: 0 };
  }
  const state = db.readDb();
  const removedCount = removeLogIdsFromAllTablesInState(state, cleanIds);
  db.writeDb(state);
  return {
    status: 'success',
    deletedIds: cleanIds,
    deletedCount: removedCount,
    remainingLogs: state.op_logs_history.length,
    deletedOpLogIds: state.deleted_oplog_ids
  };
}

function queryLogsByPeriodAndBranch({ period = '1_TAHUN', branch = 'ALL', recordType = 'ALL' } = {}) {
  const state = db.readDb();
  const bounds = getPresetDateBounds(period);
  const filtered = state.op_logs_history.filter(item => {
    if (!item || state.deleted_oplog_ids.includes(String(item.id))) return false;
    if (branch !== 'ALL' && (item.cabang || 'Cilacap') !== branch) return false;
    if (recordType !== 'ALL' && item.recordType !== recordType) return false;
    const tgl = normalizeReportDateStr(item.tanggal) || normalizeReportDateStr(item.cutoffDate || item.incomingDate);
    if (!tgl) return true;
    return tgl >= bounds.start && tgl <= bounds.end;
  });
  return {
    period,
    bounds,
    branch,
    recordType,
    count: filtered.length,
    logs: filtered
  };
}

module.exports = {
  getLocalIsoDate,
  getYesterdayLocalIsoDate,
  normalizeReportDateStr,
  getPresetDateBounds,
  saveReportFromPayload,
  handleAdminConfigSync,
  deleteOpLogRecords,
  queryLogsByPeriodAndBranch
};
