/**
 * Database Engine — Oh Snap! Photobox 5 Cabang
 * Menyimpan 8 tabel operasional (sesuai 8 Sheet Spreadsheet Cabang),
 * tabel master, konfigurasi Cloud Sync, serta daftar ID terhapus (deleted_oplog_ids).
 */
const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const DB_FILE_PATH = path.join(STORAGE_DIR, 'ohsnap_database.json');

function createEmptyDbStructure() {
  return {
    meta: {
      app: 'Oh Snap! Photobox — 5 Cabang',
      version: '2.5.0',
      updated_at: new Date().toISOString()
    },
    migrations_applied: [],
    branches: ['Majenang', 'Cilacap', 'Pekalongan', 'Pemalang', 'Kediri'],
    schedules: {},
    closeRules: { Kediri: 7 },
    employees: [],
    stock_catalog: [],
    branch_stock_inventory: {},
    deleted_oplog_ids: [],
    op_logs_history: [],
    sheets_tables: {
      absen_masuk: [],
      absen_keluar: [],
      laporan_harian: [],
      rekap_pengeluaran: [],
      stock_opname: [],
      barang_datang: [],
      open_store: [],
      close_store: []
    },
    cloud_config: {}
  };
}

function ensureDatabaseInitialized() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(createEmptyDbStructure(), null, 2), 'utf8');
  }
}

function resetDatabase() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  const empty = createEmptyDbStructure();
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(empty, null, 2), 'utf8');
  return empty;
}

function readDb() {
  ensureDatabaseInitialized();
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    parsed.deleted_oplog_ids = Array.isArray(parsed.deleted_oplog_ids) ? parsed.deleted_oplog_ids : [];
    parsed.op_logs_history = Array.isArray(parsed.op_logs_history) ? parsed.op_logs_history : [];
    parsed.sheets_tables = parsed.sheets_tables || createEmptyDbStructure().sheets_tables;
    return parsed;
  } catch (e) {
    return resetDatabase();
  }
}

function writeDb(state) {
  ensureDatabaseInitialized();
  state.meta = state.meta || {};
  state.meta.updated_at = new Date().toISOString();
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

module.exports = {
  DB_FILE_PATH,
  createEmptyDbStructure,
  ensureDatabaseInitialized,
  resetDatabase,
  readDb,
  writeDb
};
