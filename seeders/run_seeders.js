#!/usr/bin/env node
/**
 * CLI Runner Seeder (Data Palsu) — Oh Snap! Photobox 5 Cabang
 * Mengisi database dengan 5 Cabang, 14 Kru, 14 Barang Stok, serta
 * Transaksi Operasional untuk periode HARI INI dan KEMARIN (WIB).
 */
const fs = require('fs');
const path = require('path');
const db = require('../backend/config/database');
const reportController = require('../backend/controllers/reportController');

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

function main() {
  console.log('================================================================');
  console.log('🌱 MENJALANKAN SEEDER DATA PALSU OH SNAP! PHOTOBOX (5 CABANG)');
  console.log('================================================================');

  const dummyPath = path.join(__dirname, 'dummy_data.json');
  const dummy = JSON.parse(fs.readFileSync(dummyPath, 'utf8'));
  const todayStr = getLocalIsoDate();
  const yesterdayStr = getYesterdayLocalIsoDate();

  const todayIds = ['OP-101', 'OP-102', 'OP-103', 'OP-104', 'OP-105', 'OP-106', 'OP-107'];
  const yesterdayIds = ['OP-201', 'OP-202', 'OP-203', 'OP-204', 'OP-205', 'OP-206'];

  // Segarkan tanggal ke Hari Ini & Kemarin secara dinamis (Waktu Lokal WIB)
  const refreshedLogs = (dummy.opLogs || []).map(item => {
    const copy = { ...item };
    if (todayIds.includes(copy.id)) {
      copy.tanggal = todayStr;
      if (copy.cutoffDate) copy.cutoffDate = todayStr;
      if (copy.incomingDate) copy.incomingDate = todayStr;
      if (copy.recordType === 'STOCK_OPNAME') copy.label = `🛍️ Stock Opname (Cutoff: ${todayStr})`;
    } else if (yesterdayIds.includes(copy.id)) {
      copy.tanggal = yesterdayStr;
      if (copy.cutoffDate) copy.cutoffDate = yesterdayStr;
      if (copy.incomingDate) copy.incomingDate = yesterdayStr;
      if (copy.recordType === 'STOCK_OPNAME') copy.label = `🛍️ Stock Opname (Cutoff: ${yesterdayStr})`;
    }
    return copy;
  });

  db.resetDatabase();
  const state = db.readDb();
  state.branches = dummy.branches;
  state.schedules = dummy.schedules;
  state.closeRules = dummy.closeRules;
  state.employees = dummy.employees;
  state.stock_catalog = dummy.stockCatalog;
  state.deleted_oplog_ids = [];
  state.op_logs_history = [];
  db.writeDb(state);

  // Masukkan seluruh log seeder ke 8 tabel operasional
  refreshedLogs.slice().reverse().forEach(logItem => {
    reportController.saveReportFromPayload({
      ...logItem,
      clientLogId: logItem.id,
      bypassDedup: true
    });
  });

  const finalState = db.readDb();
  console.log(`✅ Seed Master Cabang       : ${finalState.branches.length} Cabang (${finalState.branches.join(', ')})`);
  console.log(`✅ Seed Master Karyawan     : ${finalState.employees.length} Kru`);
  console.log(`✅ Seed Master Katalog Stok : ${finalState.stock_catalog.length} Jenis Barang (BRG-001 s/d BRG-014)`);
  console.log(`✅ Seed Transaksi Hari Ini  : ${todayIds.length} Laporan (${todayStr})`);
  console.log(`✅ Seed Transaksi Kemarin   : ${yesterdayIds.length} Laporan (${yesterdayStr})`);
  console.log(`✅ Total Baris Riwayat      : ${finalState.op_logs_history.length} Laporan di 8 Tabel Operasional`);
  console.log('================================================================');
}

if (require.main === module) {
  main();
}

module.exports = { main };
