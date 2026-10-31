#!/usr/bin/env node
/**
 * CLI Runner Migrasi Database — Oh Snap! Photobox 5 Cabang
 * Menjalankan 001_create_master_tables.sql & 002_create_8_operational_sheets_tables.sql
 */
const fs = require('fs');
const path = require('path');
const db = require('../backend/config/database');

const isFresh = process.argv.includes('--fresh');

function main() {
  console.log('================================================================');
  console.log('🚀 MENJALANKAN MIGRASI DATABASE OH SNAP! PHOTOBOX (5 CABANG)');
  console.log('================================================================');

  const sqlFiles = [
    '001_create_master_tables.sql',
    '002_create_8_operational_sheets_tables.sql'
  ];

  if (isFresh) {
    console.log('🧹 Mode --fresh aktif: Mereset seluruh tabel ke kondisi kosong...');
    db.resetDatabase();
  } else {
    db.ensureDatabaseInitialized();
  }

  sqlFiles.forEach((file, index) => {
    const filePath = path.join(__dirname, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const tableMatches = [...content.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-zA-Z0-9_]+)/gi)].map(m => m[1]);
    console.log(`✅ [${index + 1}/${sqlFiles.length}] Migrasi ${file} selesai -> Tabel: ${tableMatches.join(', ')}`);
  });

  const state = db.readDb();
  state.migrations_applied = sqlFiles.map(f => ({
    file: f,
    applied_at: new Date().toISOString()
  }));
  db.writeDb(state);

  console.log('----------------------------------------------------------------');
  console.log('✨ Seluruh tabel Master, 8 Sheet Operasional & Tabel Delete siap!');
  console.log('================================================================');
}

if (require.main === module) {
  main();
}

module.exports = { main };
