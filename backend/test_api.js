#!/usr/bin/env node
/**
 * Automated Test Suite — Oh Snap! Photobox 5 Cabang
 * Menguji:
 * 1. Migrasi & Seeder (Data Hari Ini & Kemarin)
 * 2. Filter Periode HARI_INI dan KEMARIN di API & Controller
 * 3. Proteksi Anti Klik 2x (Deduplikasi Server)
 * 4. Fitur Hapus (Delete) Laporan Serentak di Semua Tabel & Sinkronisasi deletedOpLogIds
 */
const assert = require('assert');
const { main: runMigrations } = require('../migrations/run_migrations');
const { main: runSeeders } = require('../seeders/run_seeders');
const reportController = require('./controllers/reportController');
const db = require('./config/database');

async function runTests() {
  console.log('================================================================');
  console.log('🧪 MENJALANKAN AUTOMATED TEST OH SNAP! PHOTOBOX (5 CABANG)');
  console.log('================================================================');

  // 1. Setup fresh DB + Seed
  runMigrations();
  runSeeders();

  // 2. Verifikasi periode HARI_INI dan KEMARIN
  const todayRes = reportController.queryLogsByPeriodAndBranch({ period: 'HARI_INI' });
  const yesterdayRes = reportController.queryLogsByPeriodAndBranch({ period: 'KEMARIN' });
  assert(todayRes.count >= 7, `Expected >= 7 logs for HARI_INI, got ${todayRes.count}`);
  assert(yesterdayRes.count >= 6, `Expected >= 6 logs for KEMARIN, got ${yesterdayRes.count}`);
  console.log(`✅ [TEST 1 LULUS] Filter Periode HARI_INI (${todayRes.count} record) & KEMARIN (${yesterdayRes.count} record) akurat.`);

  // 3. Verifikasi Anti Klik 2x (Anti Duplikat)
  const samplePayload = {
    clientLogId: 'RPT-TEST-999',
    recordType: 'DAILY_REPORT',
    cabang: 'Cilacap',
    tanggal: reportController.getLocalIsoDate(),
    waktu: '16:00:00',
    shift: 'Shift Pagi',
    nama: 'Saskia',
    cash: 500000,
    qris: 750000,
    totalGross: 1250000,
    totalExpense: 20000,
    netOmzet: 1230000,
    expensesList: [{ desc: 'Beli Tisu', amount: 20000 }],
    rincianPengeluaran: 'Beli Tisu: Rp 20.000',
    catatan: 'Test Anti Klik 2x'
  };
  const firstSubmit = reportController.saveReportFromPayload(samplePayload);
  const secondSubmit = reportController.saveReportFromPayload(samplePayload);
  assert.strictEqual(firstSubmit.status, 'success');
  assert.strictEqual(Boolean(secondSubmit.duplicateIgnored), true, 'Klik ke-2 harus terdeteksi sebagai duplikat');
  console.log('✅ [TEST 2 LULUS] Proteksi Anti Klik 2x berhasil menahan pengiriman ganda.');

  // 4. Verifikasi Fitur Hapus (Delete) di semua tabel laporan & Cloud Sync
  const delRes = reportController.deleteOpLogRecords(['RPT-TEST-999']);
  assert.strictEqual(delRes.status, 'success');
  assert(delRes.deletedOpLogIds.includes('RPT-TEST-999'), 'ID terhapus harus tercatat di deletedOpLogIds');

  const stateAfterDel = db.readDb();
  const inHistory = stateAfterDel.op_logs_history.some(x => x.id === 'RPT-TEST-999');
  const inLapHarian = stateAfterDel.sheets_tables.laporan_harian.some(x => x.log_id === 'RPT-TEST-999');
  const inRekapExp = stateAfterDel.sheets_tables.rekap_pengeluaran.some(x => x.log_id === 'RPT-TEST-999');
  assert.strictEqual(inHistory, false, 'Harus terhapus dari op_logs_history');
  assert.strictEqual(inLapHarian, false, 'Harus terhapus dari tabel laporan_harian');
  assert.strictEqual(inRekapExp, false, 'Harus terhapus dari tabel rekap_pengeluaran');
  console.log('✅ [TEST 3 LULUS] Fitur Delete (🗑️ Hapus) berhasil menghapus record dari seluruh tabel laporan & mencatat di deletedOpLogIds.');

  console.log('================================================================');
  console.log('🎉 SEMUA PENGUJIAN LULUS 100% TANPA ERROR!');
  console.log('================================================================');
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('❌ Test Gagal:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
