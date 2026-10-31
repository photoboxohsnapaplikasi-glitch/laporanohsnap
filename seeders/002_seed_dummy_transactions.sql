-- ============================================================================
-- SEEDER 002: DUMMY TRANSACTIONS (HARI INI: 2026-10-31 & KEMARIN: 2026-10-30)
-- Mencakup ke-8 Sheet Operasional & Semua 7 Tabel Laporan Admin
-- ============================================================================

-- 1. Absen Masuk (Hari Ini & Kemarin)
INSERT INTO absen_masuk (log_id, tanggal, jam_absen_masuk, cabang, nama_karyawan, shift, jadwal_jam_kerja, status_ketepatan, detail_keterlambatan, koordinat_gps_waktu, catatan) VALUES
('OP-101', '2026-10-31', '09:54:12', 'Cilacap', 'Saskia', 'Shift Pagi', '10.00-15.00', 'TEPAT WAKTU', 'Tepat Waktu (Jadwal 10.00-15.00)', '2026-10-31 09:54:12 WIB • -7.727600, 109.007900', 'Hadir tepat waktu sebelum jam 10.00'),
('OP-102', '2026-10-31', '08:52:05', 'Pemalang', 'Bunga', 'Shift Pagi', '08.40-15.10', 'TELAT', 'Telat 12 Menit (Jadwal 08.40-15.10)', '2026-10-31 08:52:05 WIB • -6.890600, 109.380800', 'Terlambat karena hujan deras'),
('OP-201', '2026-10-30', '09:25:18', 'Kediri', 'Vino', 'Shift Pagi', '09.30-16.30', 'TEPAT WAKTU', 'Tepat Waktu (Jadwal 09.30-16.30)', '2026-10-30 09:25:18 WIB • -7.816600, 112.011400', 'Hadir tepat waktu shift pagi kemarin');

-- 2. Absen Keluar (Hari Ini & Kemarin)
INSERT INTO absen_keluar (log_id, tanggal, jam_absen_keluar, cabang, nama_karyawan, shift, jadwal_jam_kerja, status_jam_kerja, detail_kekurangan_jam_kerja, koordinat_gps_waktu, catatan) VALUES
('OP-106', '2026-10-31', '13:55:10', 'Majenang', 'Widia', 'Shift Pagi', '09.00-14.30', 'BELUM MEMENUHI JAM KERJA', 'Belum Memenuhi Jam Kerja — Masih Kurang 35 Menit (Pulang 13:55 sebelum Jadwal Pulang 14.30)', '2026-10-31 13:55:10 WIB • -7.297500, 108.761200', 'Izin pulang lebih awal 35 menit'),
('OP-202', '2026-10-30', '16:33:40', 'Kediri', 'Vino', 'Shift Pagi', '09.30-16.30', 'TEPAT WAKTU', 'Tepat Waktu / Memenuhi Jam Kerja (Jadwal 09.30-16.30)', '2026-10-30 16:33:40 WIB • -7.816600, 112.011400', 'Selesai jam kerja shift pagi kemarin');

-- 3. Laporan Harian Keuangan (Hari Ini & Kemarin)
INSERT INTO laporan_harian (log_id, tanggal, jam_input, cabang, shift, nama_kasir, pemasukan_cash, pemasukan_qris, pemasukan_total_kotor, total_pengeluaran_kas, rincian_pengeluaran, total_pemasukan_bersih, catatan) VALUES
('OP-103', '2026-10-31', '15:05:10', 'Cilacap', 'Shift Pagi', 'Saskia', 950000, 1250000, 2200000, 65000, 'Beli Tisu & Air Galon Booth: Rp 25.000 | Amplop & Plastik Strip 4R: Rp 40.000', 2135000, 'Mesin photobox & printer DNP lancar.'),
('OP-204', '2026-10-30', '16:28:00', 'Kediri', 'Shift Pagi', 'Vino', 640000, 1150000, 1790000, 42000, 'Pengharum Ruangan 2 Kaleng: Rp 30.000 | Kantong Sampah Booth: Rp 12.000', 1748000, 'Laporan keuangan shift pagi kemarin.');

-- 4. Rekap Pengeluaran Kas (Hari Ini & Kemarin)
INSERT INTO rekap_pengeluaran (log_id, tanggal, jam_input, cabang, shift, nama_kasir, nama_item_pengeluaran, nominal_item_pengeluaran, total_pengeluaran_shift, catatan_shift) VALUES
('OP-103', '2026-10-31', '15:05:10', 'Cilacap', 'Shift Pagi', 'Saskia', 'Beli Tisu & Air Galon Booth', 25000, 65000, 'Mesin photobox & printer DNP lancar.'),
('OP-103', '2026-10-31', '15:05:10', 'Cilacap', 'Shift Pagi', 'Saskia', 'Amplop & Plastik Strip 4R', 40000, 65000, 'Mesin photobox & printer DNP lancar.'),
('OP-204', '2026-10-30', '16:28:00', 'Kediri', 'Shift Pagi', 'Vino', 'Pengharum Ruangan 2 Kaleng', 30000, 42000, 'Laporan keuangan shift pagi kemarin.'),
('OP-204', '2026-10-30', '16:28:00', 'Kediri', 'Shift Pagi', 'Vino', 'Kantong Sampah Booth', 12000, 42000, 'Laporan keuangan shift pagi kemarin.');

-- 5. Stock Opname (Hari Ini & Kemarin)
INSERT INTO stock_opname (log_id, cabang, peran_pengirim, tanggal_input, tanggal_cutoff, jam_input, shift, nama_petugas, petugas_membantu, kertas_pax, hangtag_kecil_pcs, hangtag_besar_pcs, keychain_panjang_pcs, keychain_bulat_pcs, plastik_kecil_ikat, plastik_besar_ikat, tinta_lm_pct, tinta_lc_pct, tinta_y_pct, tinta_m_pct, tinta_c_pct, tinta_k_pct, lem_ganci_pcs, catatan) VALUES
('OP-104', 'Cilacap', 'USER', '2026-10-31', '2026-10-31', '14:30:00', 'Shift Pagi', 'Nazya', 'Saskia', 65, 42, 55, 30, 35, 52, 60, 80, 75, 20, 65, 70, 85, 18, 'Laporan Stock Opname rutin Shift Pagi'),
('OP-205', 'Pekalongan', 'USER', '2026-10-30', '2026-10-30', '15:20:00', 'Shift Pagi', 'Kholil', 'Firdaus', 58, 60, 54, 45, 50, 48, 55, 75, 78, 60, 70, 72, 80, 22, 'Laporan Stock Opname kemarin');

-- 6. Barang Datang (Hari Ini & Kemarin)
INSERT INTO barang_datang (log_id, cabang, peran_pengirim, tanggal_input, tanggal_barang_datang, jam_input, shift, nama_petugas, petugas_membantu, kode_barang, nama_barang, jenis_barang, satuan, stok_awal, jumlah_masuk, stok_akhir, catatan) VALUES
('OP-105', 'Cilacap', 'USER', '2026-10-31', '2026-10-31', '11:20:00', 'Shift Pagi', 'Saskia', 'Nazya', 'BRG-001', 'Kertas', 'Bahan Cetak', 'Pax', 40, 25, 65, 'Kiriman paket bahan cetak, Keychain Panjang & Tinta LM Botol dari gudang pusat'),
('OP-105', 'Cilacap', 'USER', '2026-10-31', '2026-10-31', '11:20:00', 'Shift Pagi', 'Saskia', 'Nazya', 'BRG-004', 'Keychain Panjang', 'Aksesoris', 'Pcs', 10, 20, 30, 'Kiriman paket bahan cetak, Keychain Panjang & Tinta LM Botol dari gudang pusat'),
('OP-105', 'Cilacap', 'USER', '2026-10-31', '2026-10-31', '11:20:00', 'Shift Pagi', 'Saskia', 'Nazya', 'BRG-008', 'Tinta LM (Light Magenta)', 'Tinta & Habis Pakai', 'Botol', 2, 2, 4, 'Kiriman paket bahan cetak, Keychain Panjang & Tinta LM Botol dari gudang pusat'),
('OP-206', 'Kediri', 'USER', '2026-10-30', '2026-10-30', '10:30:00', 'Shift Pagi', 'Vino', 'Kansa', 'BRG-001', 'Kertas', 'Bahan Cetak', 'Pax', 35, 20, 55, 'Kiriman barang datang kemarin'),
('OP-206', 'Kediri', 'USER', '2026-10-30', '2026-10-30', '10:30:00', 'Shift Pagi', 'Vino', 'Kansa', 'BRG-005', 'Keychain Bulat', 'Aksesoris', 'Pcs', 25, 30, 55, 'Kiriman barang datang kemarin');

-- 7. open_Store (Hari Ini)
INSERT INTO open_store (log_id, tanggal, jam_open_store, cabang, shift, jadwal_jam_kerja, nama_karyawan, daftar_ceklis_open_store, koordinat_gps_waktu, catatan) VALUES
('OP-107', '2026-10-31', '09:56:00', 'Cilacap', 'Shift Pagi', '10.00-15.00', 'Saskia', '2 Foto Open Store Lengkap (Kamera & Layar Sentuh Menyala Normal, Printer Foto & Lampu Studio Siap Pakai)', '2026-10-31 09:56:00 WIB • -7.727600, 109.007900', 'Booth siap operasional pagi');

-- 8. Close_Store (Kemarin)
INSERT INTO close_store (log_id, tanggal, jam_close_store, cabang, shift, jadwal_jam_kerja, nama_karyawan, jumlah_foto_close_store, daftar_ceklis_close_store, koordinat_gps_waktu, catatan) VALUES
('OP-203', '2026-10-30', '21:03:15', 'Pekalongan', 'Shift Sore', '15.00-21.00', 'Firdaus', '2 Foto', '2 Foto Close Store Lengkap (Kamera & Printer Photobooth Dimatikan, Lampu Booth Mati & Pintu Depan Store Terkunci)', '2026-10-30 21:03:15 WIB • -6.888600, 109.675300', 'Store Pekalongan tutup aman kemarin malam');
