-- ============================================================================
-- SEEDER 001: MASTER DATA (5 CABANG, JADWAL SHIFT, 14 KARYAWAN & 14 ITEM STOK)
-- ============================================================================

INSERT OR IGNORE INTO branches (branch_code, branch_name, close_photo_count) VALUES
('CBG-01', 'Majenang', 2),
('CBG-02', 'Cilacap', 2),
('CBG-03', 'Pekalongan', 2),
('CBG-04', 'Pemalang', 2),
('CBG-05', 'Kediri', 7);

INSERT OR IGNORE INTO branch_shifts (branch_name, shift_name, start_time, end_time, schedule_label) VALUES
('Cilacap', 'Shift Pagi', '10:00', '15:00', '10.00-15.00'),
('Cilacap', 'Shift Sore', '15:00', '20:00', '15.00-20.00'),
('Majenang', 'Shift Pagi', '09:00', '14:30', '09.00-14.30'),
('Majenang', 'Shift Sore', '14:30', '20:00', '14.30-20.00'),
('Pekalongan', 'Shift Pagi', '09:30', '15:30', '09.30-15.30'),
('Pekalongan', 'Shift Sore', '15:00', '21:00', '15.00-21.00'),
('Pemalang', 'Shift Pagi', '08:40', '15:10', '08.40-15.10'),
('Pemalang', 'Shift Middle', '13:20', '19:40', '13.20-19.40'),
('Pemalang', 'Shift Sore', '14:50', '22:00', '14.50-22.00'),
('Kediri', 'Shift Pagi', '09:30', '16:30', '09.30-16.30'),
('Kediri', 'Shift Middle', '13:00', '20:00', '13.00-20.00'),
('Kediri', 'Shift Sore', '15:10', '22:10', '15.10-22.10');

INSERT OR IGNORE INTO employees (id, employee_name, login_password, default_branch, role) VALUES
('emp-1', 'Widia', 'widia01', 'Majenang', 'USER'),
('emp-2', 'Silfi', 'silfi02', 'Majenang', 'USER'),
('emp-3', 'Saskia', 'saskia03', 'Cilacap', 'USER'),
('emp-4', 'Nazya', 'nazya04', 'Cilacap', 'USER'),
('emp-5', 'Kholil', 'kholil05', 'Pekalongan', 'USER'),
('emp-6', 'Firdaus', 'firdaus06', 'Pekalongan', 'USER'),
('emp-7', 'Bunga', 'bunga07', 'Pemalang', 'USER'),
('emp-8', 'Fadia', 'fadia08', 'Pemalang', 'USER'),
('emp-9', 'Aji', 'aji09', 'Pemalang', 'USER'),
('emp-10', 'Vino', 'vino10', 'Kediri', 'USER'),
('emp-11', 'Kansa', 'kansa11', 'Kediri', 'USER'),
('emp-12', 'Delisa', 'delisa12', 'Kediri', 'USER'),
('emp-13', 'Rangga', 'rangga13', 'Kediri', 'USER'),
('emp-14', 'Winaa', 'winaa14', 'Kediri', 'USER');

INSERT OR IGNORE INTO stock_catalog (id, item_code, item_name, category, unit, incoming_unit, min_warning, item_type, ink_color_code) VALUES
('stk-kertas', 'BRG-001', 'Kertas', 'Bahan Cetak', 'Pax', 'Pax', 50, 'single', NULL),
('stk-hangtag-kecil', 'BRG-002', 'Hangtag Kecil', 'Aksesoris', 'Pcs', 'Pcs', 50, 'single', NULL),
('stk-hangtag-besar', 'BRG-003', 'Hangtag Besar', 'Aksesoris', 'Pcs', 'Pcs', 50, 'single', NULL),
('stk-keychain-panjang', 'BRG-004', 'Keychain Panjang', 'Aksesoris', 'Pcs', 'Pcs', 50, 'single', NULL),
('stk-keychain-bulat', 'BRG-005', 'Keychain Bulat', 'Aksesoris', 'Pcs', 'Pcs', 50, 'single', NULL),
('stk-plastik-kecil', 'BRG-006', 'Plastik Kecil', 'Kemasan', 'Ikat', 'Ikat', 50, 'single', NULL),
('stk-plastik-besar', 'BRG-007', 'Plastik Besar', 'Kemasan', 'Ikat', 'Ikat', 50, 'single', NULL),
('stk-tinta-lm', 'BRG-008', 'Tinta LM (Light Magenta)', 'Tinta & Habis Pakai', '%', 'Botol', 25, 'single', 'LM'),
('stk-tinta-lc', 'BRG-009', 'Tinta LC (Light Cyan)', 'Tinta & Habis Pakai', '%', 'Botol', 25, 'single', 'LC'),
('stk-tinta-y', 'BRG-010', 'Tinta Y (Yellow)', 'Tinta & Habis Pakai', '%', 'Botol', 25, 'single', 'Y'),
('stk-tinta-m', 'BRG-011', 'Tinta M (Magenta)', 'Tinta & Habis Pakai', '%', 'Botol', 25, 'single', 'M'),
('stk-tinta-c', 'BRG-012', 'Tinta C (Cyan)', 'Tinta & Habis Pakai', '%', 'Botol', 25, 'single', 'C'),
('stk-tinta-k', 'BRG-013', 'Tinta K (Black)', 'Tinta & Habis Pakai', '%', 'Botol', 25, 'single', 'K'),
('stk-lem', 'BRG-014', 'Lem Ganci', 'Perlengkapan Booth', 'Pcs', 'Pcs', 50, 'single', NULL);
