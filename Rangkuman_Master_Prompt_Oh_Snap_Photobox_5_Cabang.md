# Rangkuman Lengkap Seluruh Prompt & Master Prompt Aplikasi Oh Snap! Photobox (5 Cabang)

Dokumen ini memuat dua bagian utama:
1. **Urutan Kronologis Seluruh Prompt dari Awal hingga Akhir**: Ringkasan bertahap dari setiap instruksi, penambahan fitur, dan perbaikan bug yang membentuk sistem saat ini.
2. **Master Prompt Tunggal (All-in-One Prompt Siap Copy-Paste)**: Gabungan seluruh instruksi menjadi satu prompt utuh untuk menghasilkan aplikasi **Oh Snap! Photobox — 5 Cabang** persis seperti versi terakhir saat ini.

## Bagian 1: Urutan Kronologis Seluruh Prompt dari Awal hingga Akhir

| Tahap | Pokok Permintaan / Prompt | Fitur & Perubahan yang Dihasilkan |
| :--- | :--- | :--- |
| **Tahap 1** | **Pembuatan Sistem Operasional & Laporan Keuangan Harian Oh Snap! Photobox 5 Cabang** | Membangun aplikasi web (`index.html`, `admin.html`, `laporan_keuangan_harian.html`) dan backend Google Apps Script (`Code.gs`) untuk 5 cabang (**Majenang, Cilacap, Pekalongan, Pemalang, Kediri**), 14 karyawan beserta password login, jadwal jam kerja per shift (Pagi, Middle, Sore, Longshift), serta 6 menu utama kru booth: (1) Absen Karyawan Masuk/Pulang dengan kamera langsung + watermark waktu & GPS, (2) Open Store, (3) Laporan Keuangan Harian (Cash, QRIS, Pengeluaran Kas, Foto Serah Terima & Struk), (4) Stock Opname 14 item etalase (`BRG-001` s/d `BRG-014`), (5) Barang Datang, dan (6) Close Store (2 foto standar / 7 foto khusus cabang Kediri). |
| **Tahap 2** | **Pemisahan 5 Google Spreadsheet Cabang (Template 8 Sheet) & Subfolder Google Drive** | Memisahkan pencatatan ke 5 file Google Spreadsheet berbeda (`OhSnap_Spreadsheet_Cabang_<NamaCabang>`) yang masing-masing memiliki **8 Sheet baku**: `Absen_Masuk`, `Absen_Keluar`, `Laporan_Harian`, `Rekap_Pengeluaran`, `Stock_Opname`, `Barang_Datang`, `open_Store`, dan `Close_Store`, disertai pembuatan otomatis 5 subfolder cabang di dalam setiap folder kategori foto Google Drive. |
| **Tahap 3** | **Sinkronisasi Cloud Permanen Lintas Perangkat (Cloud Sync V4) & Proteksi Anti Klik 2x** | Menyimpan perubahan pengaturan Admin (tambah/edit cabang, kru & password, jadwal shift, katalog stok, UI menu user, link spreadsheet) ke Cloud Google Apps Script (*Chunked ScriptProperties* + backup file JSON Google Drive) agar tersinkron ke semua HP kru, serta menambahkan proteksi 4 lapis anti klik 2x (`acquireFormSubmitLock`, `buildReportDeduplicationKey`, `LockService` + `CacheService` MD5). |
| **Tahap 4** | **Perbaikan Tombol Kirim Absen & Penyesuaian Tanggal Laporan Sesuai Spreadsheet** | Memperbaiki tombol kirim absen agar langsung aktif begitu foto kamera diambil/diunggah, serta mengganti konversi tanggal UTC (`toISOString()`) menjadi waktu lokal WIB (`Asia/Jakarta`) agar laporan yang dikirim hari ini tidak mundur ke tanggal kemarin dan 100% sesuai dengan tanggal di Spreadsheet. |
| **Tahap 5** | **Sinkronisasi Hapus Data & Foto dari Riwayat Admin ke Spreadsheet & Google Drive** | Menambahkan aksi penghapusan (`delete_records`) di Web dan `Code.gs` sehingga ketika data atau foto dihapus dari Riwayat Admin, baris terkait di Google Spreadsheet dan file foto di Google Drive ikut terhapus otomatis. |
| **Tahap 6** | **Validasi Wajib Isi Pemasukan Shift Ini & Status Indikator Hijau** | Mewajibkan pengisian bagian **"2. Masukkan Pemasukan Shift Ini"** (Cash / QRIS / Total Harian) pada form Laporan Keuangan Harian sebelum tombol kirim dapat diklik, serta mengubah kotak dan badge status bagian ke-2 menjadi hijau (`✅ Sudah Diisi`) secara *real-time* saat nominal diisi. |
| **Tahap 7** | **Sinkronisasi Jam Masuk Laporan antara Spreadsheet dan Tabel Web Admin (WIB)** | Menambahkan fungsi `resolveSynchronizedWibDateTime()` di `Code.gs` dan normalisasi jam WIB di Web agar perangkat kru yang salah pengaturan zona waktu (+7 jam, misal jam 16:30 sore terbaca 21:00 malam) otomatis dikoreksi ke waktu server WIB (`Asia/Jakarta`) sehingga jam di Spreadsheet dan tabel Web Admin selalu sama persis. |
| **Tahap 8** | **Paket Perbaikan 11 Poin (Shift Sore, Rentang Tanggal, Undo, Ribuan, Revisi & Pop-Up, Hapus Tombol Tabel, Batas 2 Hari, Kolom Status Revisi)** | 1. Menampilkan seluruh data `Shift Sore` dari Spreadsheet ke Web dengan `normalizeShiftName()`.<br>2. Memperbaiki filter rentang tanggal kustom (`Dari Tanggal` s/d `Sampai Tanggal`).<br>3. Menambahkan fitur **↩️ Undo / Urungkan Hapus** (*Floating Undo Bar* & tombol Undo di Admin).<br>4. Menarik langsung seluruh data dari Spreadsheet ke Web via Google Sheets GViz JSONP (`syncLiveRowsFromGoogleSpreadsheetsGviz`) & `Code.gs`.<br>5. Mengubah input uang (`Cash`, `QRIS`, `Total Harian`, `Pengeluaran`) agar input pakai titik (`645.000`) maupun tanpa titik (`645` / `645000`) selalu terekam ribuan (`Rp 645.000`).<br>6. Menghilangkan *double record* `Shift Sore` di tabel Web.<br>7. Mengatur logika upload ulang (revisi): **Website selalu menampilkan data terakhir**, sedangkan **Google Spreadsheet terus merekam semua baris revisi**.<br>8. Menampilkan **pop-up konfirmasi revisi**: *"Ada revisi, dan akan merubah data sebelumnya, apakah Anda yakin?"*<br>9. Menghilangkan tombol `🗑️ Hapus` dari seluruh tabel laporan di Riwayat Admin.<br>10. Membatasi karyawan booth hanya dapat memilih tanggal **Hari Ini** dan **1 Hari Kemarin**.<br>11. Menambahkan kolom baru ke-18 **`Status Revisi`** (`Laporan Awal`, `Revisi Ke-1`, `Revisi Ke-2`, dst.) pada sheet `Laporan_Harian`. |
| **Tahap 9** | **Penghapusan Otomatis Riwayat di Web yang Tidak Ada di Google Spreadsheet** | Menghapus seluruh data *dummy/seed* bawaan (`OP-101` s/d `OP-206`) dan menerapkan rekonsiliasi otomatis 2 arah sehingga setiap riwayat di Website yang baris datanya tidak ada (atau sudah dihapus) di Google Spreadsheet otomatis terhapus dari tampilan Web dan Cloud. |

## Bagian 2: Master Prompt Tunggal (Siap Copy-Paste dari Nol)

Salin seluruh teks di dalam blok di bawah ini jika Anda ingin membuat ulang atau mengembangkan sistem **Oh Snap! Photobox — 5 Cabang** dari awal dengan seluruh fitur dan perbaikan di atas:

```markdown
Buatkan aplikasi web Full-Stack Sistem Operasional, Absensi Kamera GPS, Laporan Keuangan Harian, dan Stock Opname bernama **"Oh Snap! Photobox — 5 Cabang"** yang terdiri dari file `index.html` (Portal Web User/Kru sekaligus switcher Admin), `admin.html` (Portal Web Admin langsung), `laporan_keuangan_harian.html`, dan script Google Apps Script `Code.gs` dengan spesifikasi lengkap berikut:

### 1. Daftar 5 Cabang, Jadwal Jam Kerja Shift, & 14 Akun Karyawan Awal
- **5 Cabang Utama**: `Majenang`, `Cilacap`, `Pekalongan`, `Pemalang`, `Kediri` (Admin dapat menambah/mengedit/menghapus cabang secara dinamis dan otomatis tersinkron ke semua perangkat).
- **Jadwal Shift Default per Cabang**:
  - **Majenang**: Shift Pagi (`09.00-14.30`), Shift Sore (`14.30-20.00`)
  - **Cilacap**: Shift Pagi (`10.00-15.00`), Shift Sore (`15.00-20.00`)
  - **Pekalongan**: Shift Pagi (`09.30-15.30`), Shift Sore (`15.00-21.00`)
  - **Pemalang**: Shift Pagi (`08.40-15.10`), Shift Middle (`13.20-19.40`), Shift Sore (`14.50-22.00`)
  - **Kediri**: Shift Pagi (`09.30-16.30`), Shift Middle (`13.00-20.00`), Shift Sore (`15.10-22.10`)
  - Mendukung pengaktifan `Shift Longshift` untuk seluruh cabang dari panel Admin.
- **14 Karyawan & Password Login**:
  - Majenang: Widia (`widia01`), Silfi (`silfi02`)
  - Cilacap: Saskia (`saskia03`), Nazya (`nazya04`)
  - Pekalongan: Kholil (`kholil05`), Firdaus (`firdaus06`)
  - Pemalang: Bunga (`bunga07`), Fadia (`fadia08`), Aji (`aji09`)
  - Kediri: Vino (`vino10`), Kansa (`kansa11`), Delisa (`delisa12`), Rangga (`rangga13`), Winaa (`winaa14`)
- **PIN / Password Admin Default**: `admin123` (atau `1234`), dapat diubah oleh Admin dan tersinkron ke Cloud.

### 2. Enam Menu Utama Operasional Kru Booth (Web User)
1. **Absen Karyawan (Datang & Pulang)**:
   - Menggunakan kamera langsung (Live WebRTC Camera + fallback kamera perangkat) dengan watermark otomatis berisi Tanggal, Jam WIB (`Asia/Jakarta`), Koordinat GPS, Cabang, Shift, dan Status Ketepatan Waktu.
   - Saat **Absen Datang**: mendeteksi otomatis `TEPAT WAKTU` atau `TELAT (X Menit)` berdasarkan jadwal shift cabang.
   - Saat **Absen Pulang**: mendeteksi otomatis `TEPAT WAKTU` atau `BELUM MEMENUHI JAM KERJA` (jika pulang sebelum jam akhir shift) beserta selisih menit kekurangannya.
   - Tombol **Kirim Absen** wajib langsung aktif dan dapat diklik begitu foto berhasil diambil/diunggah.
2. **Open Store**:
   - Wajib ambil foto kesiapan booth + mengisi ceklis kesiapan alat (`Kamera & Layar Sentuh Menyala Normal`, `Printer Foto & Lampu Studio Siap Pakai`).
3. **Laporan Keuangan Harian (`DAILY_REPORT`)**:
   - Terdiri dari 4 bagian: (1) Identitas Cabang, Tanggal, Nama Kasir, Shift; (2) Masukkan Pemasukan Shift Ini (Cash, QRIS, Total Harian); (3) Rincian Pengeluaran Kas Shift Ini (multi-baris item pengeluaran + pilih cepat chip pengeluaran); (4) Upload Foto Bukti Serah Terima Uang (Wajib) & Foto Struk Belanja.
   - **Wajib Mengisi Bagian 2 ("2. Masukkan Pemasukan Shift Ini")**: Tombol kirim terkunci jika Cash/QRIS belum diisi. Saat Cash atau QRIS diisi, kotak bagian 2 dan badge statusnya otomatis berubah warna dari merah/kuning menjadi **Hijau Emerald (`✅ Sudah Diisi`)**.
   - **Format Input Nominal Uang Ribuan Otomatis (Dengan Titik atau Tanpa Titik)**: Input `inputCash`, `inputQris`, `inputTotalHarianMenu`, dan nominal pengeluaran menggunakan `type="text" inputmode="numeric"` dengan parser `parseNominalRibuanRupiah()`. Baik diketik menggunakan titik (`645.000`), tanpa titik penuh (`645000`), maupun angka ribuan singkat (`645`), semuanya otomatis diformat dan terekam sebagai ribuan (`Rp 645.000` / `645000`).
4. **Laporan Stock Opname (`STOCK_OPNAME`)**:
   - Menampilkan 14 barang katalog (`BRG-001` Kertas Pax, `BRG-002` Hangtag Kecil Pcs, `BRG-003` Hangtag Besar Pcs, `BRG-004` Keychain Panjang Pcs, `BRG-005` Keychain Bulat Pcs, `BRG-006` Plastik Kecil Ikat, `BRG-007` Plastik Besar Ikat, `BRG-008` s/d `BRG-013` Tinta LM/LC/Y/M/C/K dalam %, dan `BRG-014` Lem Ganci Pcs).
   - Semua kolom input wajib dimulai dalam keadaan kosong saat modal dibuka agar kru wajib menghitung dan mengisi seluruh item stok fisik cabang, lalu kembali di-reset kosong setelah dikirim.
   - Mendeteksi otomatis barang yang berada di bawah batas minimum warning (`< 50` Pcs/Pax atau `<= 25%` untuk tinta) dan menampilkan peringatan stok menipis di Web Admin.
5. **Laporan Barang Datang (`BARANG_DATANG`)**:
   - Kru memilih barang yang datang melalui kolom pencarian / dropdown, mengisi jumlah barang masuk (`+`), dan sistem otomatis menghitung `Stok Awal + Jumlah Masuk = Stok Akhir` serta memperbarui inventori stok cabang terkait. Satuan barang datang khusus Tinta adalah `Botol`.
   - Khusus Admin tersedia mode **⏸️ HOLD** ketika barang baru dikirim dari pusat dan baru dilepas ke cabang tujuan saat barang tiba.
6. **Close Store**:
   - Wajib upload **2 foto** untuk cabang standar (`Majenang`, `Cilacap`, `Pekalongan`, `Pemalang`) dan wajib **7 foto lengkap** khusus cabang **Kediri** (Booth Train, Hotel, Elevator, Claw, Portable, Printer Mati, Depan Booth) beserta ceklis penutupan alat.

### 3. Batasan Tanggal Input Karyawan Booth (Maksimal 2 Hari)
- Karyawan booth pada Web User **hanya dapat menginput laporan untuk Hari Ini dan 1 Hari Kemarin** (`min = kemarin`, `max = hari ini`).
- Sediakan tombol pilih cepat **📅 Hari Ini** dan **⏮️ 1 Hari Kemarin** di bawah kolom tanggal (`inputTanggal`, `stockCutoffDate`, `incomingDateInput`) serta validasi otomatis `validateAndClampBoothDateInput()` yang menolak tanggal di luar Hari Ini dan 1 Hari Kemarin bagi karyawan booth (sedangkan Admin bebas memilih tanggal kapan saja).

### 4. Logika Upload Double (Revisi), Pop-Up Konfirmasi Revisi, & Kolom `Status Revisi`
- **Deteksi Slot Laporan**: Setiap laporan memiliki kunci slot `(recordType, subType, cabang, tanggal, shift)` (dan ditambah `nama` untuk absensi). Normalisasikan nama shift dengan `normalizeShiftName()` agar `'Sore'`, `'shift sore'`, atau `'Shift Sore (15.00-21.00)'` selalu terbaca seragam sebagai `'Shift Sore'`.
- **Pop-Up Konfirmasi Revisi (`#revisionConfirmModal`)**: Apabila karyawan menginput ulang laporan pada Cabang, Tanggal, dan Shift yang sudah pernah dikirim sebelumnya, tampilkan pop-up menu konfirmasi:
  > *"Ada revisi, dan akan merubah data sebelumnya, apakah Anda yakin?"*
  lengkap dengan perbandingan **Data Sebelumnya** vs **Data Revisi Baru (`Revisi Ke-N`)** serta tombol **❌ Batal** dan **✅ Ya, Saya Yakin (Simpan Revisi)**.
- **Perilaku Saat Revisi Dikonfirmasi**:
  - **Di Website (`opLogs` & Tabel Web Admin)**: Menggantikan data lama pada slot tersebut dan **hanya menampilkan 1 data terakhir (`data terakhir`)** sehingga tidak pernah terjadi *double record* (termasuk untuk `Shift Sore`).
  - **Di Google Spreadsheet**: **Terus merekam semua baris revisi** secara berurutan (tidak memblokir revisi yang sudah dikonfirmasi).
- **Kolom Baru ke-18 `Status Revisi` di Sheet `Laporan_Harian`**:
  - Sheet `Laporan_Harian` di Google Spreadsheet dan ekspor Excel memiliki 18 kolom dengan kolom ke-18 (Kolom R) bernama **`Status Revisi`**.
  - Pengiriman pertama tercatat sebagai **`Laporan Awal`**, revisi berikutnya otomatis tercatat sebagai **`Revisi Ke-1`**, **`Revisi Ke-2`**, dan seterusnya, serta ditampilkan sebagai badge pada tabel Laporan Keuangan Harian di Web Admin.

### 5. Arsitektur 5 Google Spreadsheet Cabang (8 Sheet) & Subfolder Foto Google Drive (`Code.gs`)
- Setiap cabang memiliki file Google Spreadsheet tersendiri (`OhSnap_Spreadsheet_Cabang_<NamaCabang>`) dengan **8 Sheet baku**:
  1. `Absen_Masuk`
  2. `Absen_Keluar`
  3. `Laporan_Harian` (18 kolom, kolom ke-18 = `Status Revisi`)
  4. `Rekap_Pengeluaran`
  5. `Stock_Opname`
  6. `Barang_Datang`
  7. `open_Store`
  8. `Close_Store`
- Setiap foto laporan disimpan otomatis ke Google Drive di dalam Folder Kategori (`Folder_Absensi`, `Folder_Pemasukan_Laporan_Harian`, `Folder_Struk_Belanja_Pengeluaran`, `Folder_Open_Store`, `Folder_Close_Store`) -> Subfolder `Cabang_<NamaCabang>`.

### 6. Sinkronisasi Waktu WIB, Sinkronisasi 2 Arah Spreadsheet <-> Web, & Hapus Otomatis Riwayat yang Tidak Ada di Spreadsheet
- **Sinkronisasi Jam & Tanggal WIB (`Asia/Jakarta`)**:
  - Semua tanggal dan jam laporan menggunakan zona waktu `Asia/Jakarta` (WIB).
  - Di `Code.gs`, fungsi `resolveSynchronizedWibDateTime()` otomatis mengoreksi jam pengiriman jika jam perangkat kru melenceng > 15 menit dari waktu server WIB, sehingga jam yang tertulis di Google Spreadsheet dan di tabel Web Admin 100% sinkron.
- **Jangan Gunakan Data Dummy di Tampilan Web (`buildDefaultSeedOpLogs() = []`)**:
  - Jangan pernah menampilkan atau menyuntikkan riwayat *dummy/seed* (`OP-101` s/d `OP-206`) ke dalam Web.
- **Sinkronisasi Langsung dari Spreadsheet & Penghapusan Otomatis Riwayat yang Tidak Ada di Spreadsheet**:
  - Sediakan pembaca langsung Google Spreadsheet via GViz JSONP (`syncLiveRowsFromGoogleSpreadsheetsGviz`) di browser dan `syncOpLogsTimeFromBranchSpreadsheets` di `Code.gs`, ditambah tombol **📥 Sinkronkan Spreadsheet** di bar filter Admin.
  - Semua data yang ada di Google Spreadsheet (termasuk `Shift Sore` dan semua jenis laporan di ke-7 sheet operasional) otomatis ditarik dan tampil di tabel Web Admin.
  - **Auto-Delete Riwayat yang Tidak Ada di Spreadsheet**: Setiap kali sinkronisasi berjalan, bandingkan daftar riwayat di Website dengan baris yang benar-benar ada di Google Spreadsheet. Semua riwayat di Website yang tidak ada (atau sudah dihapus) di Google Spreadsheet **wajib terhapus otomatis** dari Website dan Cloud (dengan jeda aman 90 detik `localSubmittedAt` khusus untuk laporan yang baru saja dikirim dari booth).

### 7. Panel Riwayat Admin, Perbaikan Filter Rentang Tanggal, Penghapusan Tombol Hapus Tabel, & Fitur Undo
- **Filter Rentang Tanggal Akurat**:
  - Ketika Admin memilih `Dari Tanggal` s/d `Sampai Tanggal` (baik pada filter global maupun filter per tabel laporan), nonaktifkan preset default `1 Tahun` secara otomatis, pertahankan nilai tanggal pada kotak `<input type="date">`, dan langsung saring tabel begitu tanggal diubah (`change`) atau tombol **Terapkan Rentang** diklik.
- **Hilangkan Tombol Hapus dari Tabel Laporan Admin**:
  - Jangan tampilkan tombol `🗑️ Hapus Hasil Tabel Ini` maupun kolom/tombol `🗑️ Hapus` pada baris tabel di halaman Riwayat Admin (`Laporan Keuangan Harian`, `Pengeluaran Kas`, `Absensi Masuk & Pulang`, `Open/Close Store`, `Stock Opname`, `Barang Datang`, dan `Tabel Riwayat Aktivitas`).
  - Pada tabel `Laporan Keuangan Harian`, ganti kolom paling kanan menjadi kolom **`Status Revisi`**.
- **Fitur Undo Saat Data Dihapus (`↩️ Undo / Urungkan Hapus`)**:
  - Setiap kali ada penghapusan (melalui modal Detail & Foto, penghapusan item pengeluaran, stok, antrean HOLD, cabang, atau karyawan), simpan snapshot data ke `undoDeleteHistoryStack` dan tampilkan **Floating Undo Bar** di bagian bawah layar serta tombol **↩️ Undo Hapus** di bar filter Admin.
  - Saat tombol **Undo** diklik, kembalikan data seperti semula dan sinkronkan pembatalan penghapusan (`overrideDeletedIds: true`) ke Cloud.
```
