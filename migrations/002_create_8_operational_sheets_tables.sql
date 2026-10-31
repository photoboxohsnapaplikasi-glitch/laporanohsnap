-- ============================================================================
-- MIGRATION 002: 8 OPERATIONAL SHEETS TABLES & CENTRALIZED OPLOGS HISTORY
-- Sesuai 8 Sheet Template di Setiap Spreadsheet Cabang + Fitur Hapus (Delete)
-- ============================================================================

-- Tabel Induk Riwayat Operasional (Menyimpan semua record untuk 7 tabel laporan Admin)
CREATE TABLE IF NOT EXISTS op_logs_history (
    id VARCHAR(64) PRIMARY KEY,
    record_type VARCHAR(50) NOT NULL,
    sub_type VARCHAR(50) DEFAULT '',
    sender_role VARCHAR(30) DEFAULT 'USER',
    label VARCHAR(160) NOT NULL,
    cabang VARCHAR(100) NOT NULL,
    tanggal VARCHAR(20) NOT NULL,
    cutoff_date VARCHAR(20) DEFAULT NULL,
    incoming_date VARCHAR(20) DEFAULT NULL,
    waktu VARCHAR(20) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    shift_schedule_label VARCHAR(40) DEFAULT '',
    punctuality_status VARCHAR(60) DEFAULT '',
    punctuality_detail TEXT DEFAULT '',
    nama VARCHAR(100) NOT NULL,
    petugas_bantu VARCHAR(100) DEFAULT '',
    lokasi_watermark TEXT DEFAULT '',
    cash BIGINT DEFAULT 0,
    qris BIGINT DEFAULT 0,
    total_gross BIGINT DEFAULT 0,
    total_expense BIGINT DEFAULT 0,
    net_omzet BIGINT DEFAULT 0,
    rincian_pengeluaran TEXT DEFAULT '-',
    expenses_list_json TEXT DEFAULT '[]',
    item_numeric_values_json TEXT DEFAULT '{}',
    incoming_items_detail_json TEXT DEFAULT '[]',
    summary TEXT DEFAULT '',
    catatan TEXT DEFAULT '',
    dedup_key VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. Sheet Absen_Masuk
CREATE TABLE IF NOT EXISTS absen_masuk (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(64) NOT NULL,
    tanggal VARCHAR(20) NOT NULL,
    jam_absen_masuk VARCHAR(20) NOT NULL,
    cabang VARCHAR(100) NOT NULL,
    nama_karyawan VARCHAR(100) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    jadwal_jam_kerja VARCHAR(40) NOT NULL,
    status_ketepatan VARCHAR(60) NOT NULL,
    detail_keterlambatan TEXT DEFAULT '-',
    koordinat_gps_waktu TEXT DEFAULT '-',
    link_foto_absen_masuk TEXT DEFAULT '-',
    folder_absensi_cabang TEXT DEFAULT '-',
    catatan TEXT DEFAULT '-',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sheet Absen_Keluar
CREATE TABLE IF NOT EXISTS absen_keluar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(64) NOT NULL,
    tanggal VARCHAR(20) NOT NULL,
    jam_absen_keluar VARCHAR(20) NOT NULL,
    cabang VARCHAR(100) NOT NULL,
    nama_karyawan VARCHAR(100) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    jadwal_jam_kerja VARCHAR(40) NOT NULL,
    status_jam_kerja VARCHAR(80) NOT NULL,
    detail_kekurangan_jam_kerja TEXT DEFAULT '-',
    koordinat_gps_waktu TEXT DEFAULT '-',
    link_foto_absen_keluar TEXT DEFAULT '-',
    folder_absensi_cabang TEXT DEFAULT '-',
    catatan TEXT DEFAULT '-',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sheet Laporan_Harian
CREATE TABLE IF NOT EXISTS laporan_harian (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(64) NOT NULL,
    tanggal VARCHAR(20) NOT NULL,
    jam_input VARCHAR(20) NOT NULL,
    cabang VARCHAR(100) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    nama_kasir VARCHAR(100) NOT NULL,
    pemasukan_cash BIGINT NOT NULL DEFAULT 0,
    pemasukan_qris BIGINT NOT NULL DEFAULT 0,
    pemasukan_total_kotor BIGINT NOT NULL DEFAULT 0,
    total_pengeluaran_kas BIGINT NOT NULL DEFAULT 0,
    rincian_pengeluaran TEXT DEFAULT '-',
    total_pemasukan_bersih BIGINT NOT NULL DEFAULT 0,
    link_foto_serah_terima TEXT DEFAULT '-',
    folder_foto_pemasukan_cabang TEXT DEFAULT '-',
    link_foto_struk_belanja TEXT DEFAULT '-',
    folder_foto_struk_cabang TEXT DEFAULT '-',
    catatan TEXT DEFAULT '-',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sheet Rekap_Pengeluaran
CREATE TABLE IF NOT EXISTS rekap_pengeluaran (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(64) NOT NULL,
    tanggal VARCHAR(20) NOT NULL,
    jam_input VARCHAR(20) NOT NULL,
    cabang VARCHAR(100) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    nama_kasir VARCHAR(100) NOT NULL,
    nama_item_pengeluaran VARCHAR(200) NOT NULL,
    nominal_item_pengeluaran BIGINT NOT NULL DEFAULT 0,
    total_pengeluaran_shift BIGINT NOT NULL DEFAULT 0,
    link_foto_struk_belanja TEXT DEFAULT '-',
    folder_foto_struk_cabang TEXT DEFAULT '-',
    catatan_shift TEXT DEFAULT '-',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sheet Stock_Opname
CREATE TABLE IF NOT EXISTS stock_opname (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(64) NOT NULL,
    cabang VARCHAR(100) NOT NULL,
    peran_pengirim VARCHAR(30) DEFAULT 'USER',
    tanggal_input VARCHAR(20) NOT NULL,
    tanggal_cutoff VARCHAR(20) NOT NULL,
    jam_input VARCHAR(20) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    nama_petugas VARCHAR(100) NOT NULL,
    petugas_membantu VARCHAR(100) DEFAULT '-',
    kertas_pax NUMERIC DEFAULT 0,
    hangtag_kecil_pcs NUMERIC DEFAULT 0,
    hangtag_besar_pcs NUMERIC DEFAULT 0,
    keychain_panjang_pcs NUMERIC DEFAULT 0,
    keychain_bulat_pcs NUMERIC DEFAULT 0,
    plastik_kecil_ikat NUMERIC DEFAULT 0,
    plastik_besar_ikat NUMERIC DEFAULT 0,
    tinta_lm_pct NUMERIC DEFAULT 0,
    tinta_lc_pct NUMERIC DEFAULT 0,
    tinta_y_pct NUMERIC DEFAULT 0,
    tinta_m_pct NUMERIC DEFAULT 0,
    tinta_c_pct NUMERIC DEFAULT 0,
    tinta_k_pct NUMERIC DEFAULT 0,
    lem_ganci_pcs NUMERIC DEFAULT 0,
    barang_tambahan TEXT DEFAULT '-',
    catatan TEXT DEFAULT '-',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sheet Barang_Datang
CREATE TABLE IF NOT EXISTS barang_datang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(64) NOT NULL,
    cabang VARCHAR(100) NOT NULL,
    peran_pengirim VARCHAR(30) DEFAULT 'USER',
    tanggal_input VARCHAR(20) NOT NULL,
    tanggal_barang_datang VARCHAR(20) NOT NULL,
    jam_input VARCHAR(20) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    nama_petugas VARCHAR(100) NOT NULL,
    petugas_membantu VARCHAR(100) DEFAULT '-',
    kode_barang VARCHAR(32) NOT NULL,
    nama_barang VARCHAR(120) NOT NULL,
    jenis_barang VARCHAR(80) NOT NULL,
    satuan VARCHAR(32) NOT NULL,
    stok_awal NUMERIC NOT NULL DEFAULT 0,
    jumlah_masuk NUMERIC NOT NULL DEFAULT 0,
    stok_akhir NUMERIC NOT NULL DEFAULT 0,
    ringkasan_laporan TEXT DEFAULT '-',
    catatan TEXT DEFAULT '-',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Sheet open_Store
CREATE TABLE IF NOT EXISTS open_store (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(64) NOT NULL,
    tanggal VARCHAR(20) NOT NULL,
    jam_open_store VARCHAR(20) NOT NULL,
    cabang VARCHAR(100) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    jadwal_jam_kerja VARCHAR(40) NOT NULL,
    nama_karyawan VARCHAR(100) NOT NULL,
    daftar_ceklis_open_store TEXT DEFAULT '-',
    koordinat_gps_waktu TEXT DEFAULT '-',
    link_foto_open_store TEXT DEFAULT '-',
    folder_foto_open_store_cabang TEXT DEFAULT '-',
    catatan TEXT DEFAULT '-',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Sheet Close_Store
CREATE TABLE IF NOT EXISTS close_store (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id VARCHAR(64) NOT NULL,
    tanggal VARCHAR(20) NOT NULL,
    jam_close_store VARCHAR(20) NOT NULL,
    cabang VARCHAR(100) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    jadwal_jam_kerja VARCHAR(40) NOT NULL,
    nama_karyawan VARCHAR(100) NOT NULL,
    jumlah_foto_close_store VARCHAR(30) DEFAULT '2 Foto',
    daftar_ceklis_close_store TEXT DEFAULT '-',
    koordinat_gps_waktu TEXT DEFAULT '-',
    link_foto_close_store TEXT DEFAULT '-',
    folder_foto_close_store_cabang TEXT DEFAULT '-',
    catatan TEXT DEFAULT '-',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
