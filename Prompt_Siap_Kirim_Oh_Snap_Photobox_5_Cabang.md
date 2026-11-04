Buatkan aplikasi web Full-Stack Sistem Operasional, Absensi Kamera GPS, Laporan Keuangan Harian, dan Stock Opname bernama **"Oh Snap! Photobox — 5 Cabang"** yang terdiri dari file `index.html` (Portal Web User/Kru sekaligus switcher Admin), `admin.html` (Portal Web Admin langsung), `laporan_keuangan_harian.html`, dan script Google Apps Script `Code.gs` dengan spesifikasi lengkap dan terperinci berikut:

## 1. Desain Visual, Teknologi, & Struktur File

* Gunakan **HTML5 + Tailwind CSS CDN + Vanilla JavaScript** dalam satu file mandiri (`index.html` dan `admin.html`) yang siap di-hosting langsung di **GitHub Pages**, dilengkapi pustaka **SheetJS (`xlsx.full.min.js`)** untuk ekspor/impor file Excel (`.xlsx`).

* Gunakan font **Plus Jakarta Sans** dengan tema warna khas **Oh Snap! Photobox** (Royal Blue `#19449a` dan Magenta Pink `#da2b8a`).

* Di dalam `index.html` dan `admin.html`, tanamkan juga kode lengkap `Code.gs` pada blok `<pre id="appsScriptCodeBlock">` beserta tombol **📋 Copy Code.gs** dan **⬇️ Download Code.gs** agar Admin dapat menyalin script backend kapan saja.

## 2. Daftar 5 Cabang, Jadwal Jam Kerja Shift, & 14 Akun Karyawan

* **5 Cabang Utama**: `Majenang`, `Cilacap`, `Pekalongan`, `Pemalang`, `Kediri` (Admin dapat menambah, mengedit, atau menghapus cabang secara dinamis dan otomatis tersinkron ke semua perangkat).

* **Jadwal Shift Default per Cabang**:

  * **Majenang**: `Shift Pagi` (`09.00-14.30`), `Shift Sore` (`14.30-20.00`)

  * **Cilacap**: `Shift Pagi` (`10.00-15.00`), `Shift Sore` (`15.00-20.00`)

  * **Pekalongan**: `Shift Pagi` (`09.30-15.30`), `Shift Sore` (`15.00-21.00`)

  * **Pemalang**: `Shift Pagi` (`08.40-15.10`), `Shift Middle` (`13.20-19.40`), `Shift Sore` (`14.50-22.00`)

  * **Kediri**: `Shift Pagi` (`09.30-16.30`), `Shift Middle` (`13.00-20.00`), `Shift Sore` (`15.10-22.10`)

  * Sediakan fitur pengaktifan/penonaktifan `Shift Longshift` untuk seluruh cabang di menu Jam Kerja Admin.

* **14 Karyawan & Password Login**:

  * **Majenang**: Widia (`widia01`), Silfi (`silfi02`)

  * **Cilacap**: Saskia (`saskia03`), Nazya (`nazya04`)

  * **Pekalongan**: Kholil (`kholil05`), Firdaus (`firdaus06`)

  * **Pemalang**: Bunga (`bunga07`), Fadia (`fadia08`), Aji (`aji09`)

  * **Kediri**: Vino (`vino10`), Kansa (`kansa11`), Delisa (`delisa12`), Rangga (`rangga13`), Winaa (`winaa14`)

* **PIN / Password Admin Default**: `admin123` (atau `1234`), dapat diubah langsung di panel Admin dan tersinkron ke Cloud.

## 3. Enam Menu Utama Operasional Kru Booth (Web User)

Setelah karyawan memilih Cabang, Nama Kru, Shift, dan memasukkan Password Login yang sesuai, tampilkan 6 menu operasional berikut:

1. **Absen Karyawan (`ABSEN_MUKA` — Datang & Pulang)**:

   * Menggunakan kamera langsung (*Live WebRTC Camera* + tombol ganti kamera depan/belakang + fallback kamera perangkat) dengan *watermark* otomatis di atas kanvas foto yang menampilkan Tanggal, Jam WIB (`Asia/Jakarta`), Koordinat GPS, Cabang, Shift, dan Status Ketepatan Waktu.

   * **Absen Datang (`MUKA_DATANG`)**: Membandingkan jam absen dengan jam mulai shift cabang. Jika lewat dari jam mulai shift, otomatis berstatus `TELAT` disertai rincian menit keterlambatan (contoh: `Telat 12 Menit`). Jika tepat/sebelumnya, berstatus `TEPAT WAKTU`.

   * **Absen Pulang (`MUKA_PULANG`)**: Membandingkan jam absen pulang dengan jam selesai shift cabang. Jika pulang sebelum jadwal selesai shift, otomatis berstatus `BELUM MEMENUHI JAM KERJA` disertai rincian kekurangan menitnya.

   * Tombol **Kirim Absen** wajib langsung aktif dan dapat diklik begitu foto berhasil diambil atau diunggah.

2. **Open Store (`OPEN_STORE`)**:

   * Wajib mengambil foto kesiapan booth saat buka + mencentang ceklis kesiapan alat (`Kamera & Layar Sentuh Menyala Normal`, `Printer Foto & Lampu Studio Siap Pakai`).

3. **Laporan Keuangan Harian (`DAILY_REPORT`)**:

   * Terdiri dari 4 bagian:

     1. Identitas Cabang, Tanggal Laporan, Nama Kasir, dan Shift.

     2. **2. Masukkan Pemasukan Shift Ini** (`Pemasukan Cash`, `Pemasukan QRIS`, serta input/kalkulasi otomatis `Total Pemasukan Kotor Shift Ini`).

     3. **3. Rincian Pengeluaran Kas Shift Ini** (bisa tambah banyak baris item pengeluaran + chip pilih cepat: `Beli Tisu`, `Air Galon`, `Plastik / Kemasan`, `Listrik / Token`, `Kebersihan Booth`).

     4. **4. Upload Bukti Foto** (`Foto Serah Terima Uang` wajib diisi, `Foto Struk Belanja` opsional/wajib jika ada pengeluaran).

   * **Wajib Mengisi Bagian 2 ("2. Masukkan Pemasukan Shift Ini")**: Tombol kirim laporan terkunci apabila bagian pemasukan (`Cash` / `QRIS`) belum diisi. Saat nominal diisi, bingkai kartu bagian ke-2 dan badge statusnya otomatis berubah dari merah/kuning menjadi **Hijau Emerald (`✅ Sudah Diisi`)**.

   * **Input Nominal Uang Ribuan Otomatis (Pakai Titik atau Tanpa Titik)**: Input `inputCash`, `inputQris`, `inputTotalHarianMenu`, dan nominal pengeluaran menggunakan `type="text" inputmode="numeric"` dengan parser `parseNominalRibuanRupiah()`. Baik diketik menggunakan titik (`645.000`), tanpa titik penuh (`645000`), maupun angka ribuan singkat (`645`), semuanya otomatis diformat dengan titik ribuan saat selesai ketik (`blur`) dan terekam sebagai ribuan (`Rp 645.000` / `645000`).

4. **Laporan Stock Opname (`STOCK_OPNAME`)**:

   * Memiliki 14 barang katalog default:

     * `BRG-001` Kertas (`Bahan Cetak`, satuan `Pax`, warning `< 50`)

     * `BRG-002` Hangtag Kecil (`Aksesoris`, satuan `Pcs`, warning `< 50`)

     * `BRG-003` Hangtag Besar (`Aksesoris`, satuan `Pcs`, warning `< 50`)

     * `BRG-004` Keychain Panjang (`Aksesoris`, satuan `Pcs`, warning `< 50`)

     * `BRG-005` Keychain Bulat (`Aksesoris`, satuan `Pcs`, warning `< 50`)

     * `BRG-006` Plastik Kecil (`Kemasan`, satuan `Ikat`, warning `< 50`)

     * `BRG-007` Plastik Besar (`Kemasan`, satuan `Ikat`, warning `< 50`)

     * `BRG-008` Tinta LM / Light Magenta (`Tinta & Habis Pakai`, satuan opname `%`, satuan barang datang `Botol`, warning `<= 25%`)

     * `BRG-009` Tinta LC / Light Cyan (`Tinta & Habis Pakai`, satuan opname `%`, satuan barang datang `Botol`, warning `<= 25%`)

     * `BRG-010` Tinta Y / Yellow (`Tinta & Habis Pakai`, satuan opname `%`, satuan barang datang `Botol`, warning `<= 25%`)

     * `BRG-011` Tinta M / Magenta (`Tinta & Habis Pakai`, satuan opname `%`, satuan barang datang `Botol`, warning `<= 25%`)

     * `BRG-012` Tinta C / Cyan (`Tinta & Habis Pakai`, satuan opname `%`, satuan barang datang `Botol`, warning `<= 25%`)

     * `BRG-013` Tinta K / Black (`Tinta & Habis Pakai`, satuan opname `%`, satuan barang datang `Botol`, warning `<= 25%`)

     * `BRG-014` Lem Ganci (`Perlengkapan Booth`, satuan `Pcs`, warning `< 50`)

   * Setiap kali modal Stock Opname dibuka, seluruh kotak input jumlah stok wajib kosong agar kru menghitung dan mengisi semua barang, lalu kembali di-reset kosong setelah laporan terkirim.

   * Mendukung dropdown **Petugas yang Membantu** (opsional) dan pencarian cepat kode/nama barang.

5. **Laporan Barang Datang (`BARANG_DATANG`)**:

   * Kru mencari/memilih barang yang datang dari dropdown pencarian, mengisi jumlah masuk (`+`), dan sistem otomatis menghitung `Stok Awal + Jumlah Masuk = Stok Akhir` serta memperbarui sisa stok cabang.

   * Khusus Admin tersedia opsi pengiriman **⏸️ HOLD** (barang disimpan di antrean HOLD saat sedang dikirim dari pusat, dan ketika barang sampai tinggal klik cabang penerima untuk melepas HOLD dan menambah stok cabang tersebut).

6. **Close Store (`CLOSE_STORE`)**:

   * Cabang standar (`Majenang`, `Cilacap`, `Pekalongan`, `Pemalang`) wajib mengunggah **2 foto** (`1. Foto Dalam Booth (Mati)` dan `2. Foto Depan Booth`).

   * Cabang **Kediri** wajib mengunggah **7 foto lengkap** (`1. Booth Train`, `2. Booth Hotel`, `3. Booth Elevator`, `4. Booth Claw`, `5. Booth Portable`, `6. Foto Printer Mati`, `7. Foto Depan Booth`).

## 4. Batasi Karyawan Booth Hanya Dapat Input Hari Ini & 1 Hari Kemarin

* Pada form input karyawan booth (`inputTanggal` di Laporan Keuangan Harian, `stockCutoffDate` di Stock Opname, dan `incomingDateInput` di Barang Datang), kunci atribut `min` ke tanggal **1 Hari Kemarin** dan `max` ke tanggal **Hari Ini** (WIB).

* Tambahkan tombol pilih cepat **📅 Hari Ini** dan **⏮️ 1 Hari Kemarin** tepat di bawah input tanggal, serta fungsi validasi `validateAndClampBoothDateInput()` yang otomatis menolak tanggal di luar Hari Ini dan 1 Hari Kemarin untuk karyawan booth (sedangkan Admin tidak dibatasi).

## 5. Logika Upload Double (Revisi), Pop-Up Konfirmasi, & Kolom `Status Revisi`

* **Normalisasi Shift & Kunci Slot Revisi**:

  * Buat fungsi `normalizeShiftName()` agar penulisan `'Sore'`, `'shift sore'`, atau `'Shift Sore (15.00-21.00)'` selalu dinormalisasi menjadi `'Shift Sore'` sehingga laporan `Shift Sore` dari Spreadsheet selalu tampil di Web dan cocok dengan filter Shift.

  * Kunci slot laporan ditentukan berdasarkan `(recordType, subType, cabang, tanggal, shift)` (ditambah `nama` untuk `ABSEN_MUKA`).

* **Pop-Up Menu Konfirmasi Revisi (`#revisionConfirmModal`)**:

  * Ketika karyawan booth mengirim laporan pada Cabang, Tanggal, dan Shift yang sudah memiliki data sebelumnya, tampilkan pop-up modal konfirmasi:
    *"Ada revisi, dan akan merubah data sebelumnya, apakah Anda yakin?"*

  * Tampilkan ringkasan perbandingan **Data Sebelumnya (Akan Digantikan di Website)** dan **Data Revisi Baru (`Revisi Ke-N` — Data Terakhir yang Akan Dipakai)** beserta tombol **❌ Batal** dan **✅ Ya, Saya Yakin (Simpan Revisi)**.

* **Perilaku Penyimpanan Saat Revisi Dikonfirmasi**:

  * **Di Website (`opLogs` & seluruh tabel Web Admin)**: Menggantikan record lama pada slot tersebut menggunakan `upsertLatestOpLogRecord()` dan `deduplicateOpLogsKeepLatestRevision()` sehingga **Website selalu menampilkan 1 data terakhir (`data terakhir`)** dan tidak pernah terjadi *double record* (termasuk pada `Shift Sore`).

  * **Di Google Spreadsheet (`Code.gs`)**: Jangan memblokir revisi yang dikonfirmasi (`isConfirmedRevision = true`); **Google Spreadsheet wajib terus merekam setiap baris revisi** secara berurutan.

* **Kolom Baru ke-18 `Status Revisi` di Sheet `Laporan_Harian`**:

  * Tambahkan kolom ke-18 (Kolom R) bernama **`Status Revisi`** pada sheet `Laporan_Harian` di `Code.gs`, di file template Excel 5 cabang, dan di tabel Laporan Keuangan Harian Web Admin.

  * Baris pertama pada slot `(Tanggal, Cabang, Shift)` otomatis diisi **`Laporan Awal`**, sedangkan pengiriman revisi berikutnya pada slot yang sama diisi **`Revisi Ke-1`**, **`Revisi Ke-2`**, dan seterusnya.

## 6. Struktur 5 Google Spreadsheet Cabang (Template 8 Sheet) & Folder Foto Google Drive (`Code.gs`)

* `Code.gs` otomatis membuat dan mengelola 5 file Google Spreadsheet terpisah di Google Drive (`OhSnap_Spreadsheet_Cabang_Majenang`, `OhSnap_Spreadsheet_Cabang_Cilacap`, `OhSnap_Spreadsheet_Cabang_Pekalongan`, `OhSnap_Spreadsheet_Cabang_Pemalang`, `OhSnap_Spreadsheet_Cabang_Kediri`), masing-masing berisi **8 Sheet**:

  1. `Absen_Masuk`

  2. `Absen_Keluar`

  3. `Laporan_Harian` (18 kolom: `Timestamp`, `Tanggal`, `Jam Input`, `Cabang`, `Shift`, `Nama Kasir / Staf`, `Pemasukan Cash (Rp)`, `Pemasukan QRIS (Rp)`, `Pemasukan Total Kotor (Rp)`, `Total Pengeluaran Kas (Rp)`, `Rincian Pengeluaran`, `Total Pemasukan Bersih (Rp)`, `File / Link Foto Pemasukan`, `Folder Foto Pemasukan Cabang`, `File / Link Foto Struk Belanja`, `Folder Foto Struk Belanja Cabang`, `Catatan`, **`Status Revisi`**)

  4. `Rekap_Pengeluaran`

  5. `Stock_Opname`

  6. `Barang_Datang`

  7. `open_Store`

  8. `Close_Store`

* Setiap foto bukti disimpan otomatis ke Google Drive di dalam Folder Kategori (`Folder_Absensi`, `Folder_Pemasukan_Laporan_Harian`, `Folder_Struk_Belanja_Pengeluaran`, `Folder_Open_Store`, `Folder_Close_Store`) yang di dalamnya masing-masing memiliki 5 subfolder cabang (`Cabang_Majenang` s/d `Cabang_Kediri`).

## 7. Sinkronisasi Waktu WIB, Sinkronisasi 2 Arah Spreadsheet <-> Web, & Hapus Otomatis Riwayat yang Tidak Ada di Spreadsheet

* **Sinkronisasi Tanggal & Jam WIB (`Asia/Jakarta`)**:

  * Semua tanggal dan jam menggunakan zona waktu lokal WIB (`Asia/Jakarta`), bukan UTC.

  * Di `Code.gs`, fungsi `resolveSynchronizedWibDateTime()` otomatis mengoreksi jam laporan ke waktu server WIB apabila jam perangkat pengirim melenceng > 15 menit dari waktu server (misal akibat bug zona waktu perangkat +7 jam), sehingga jam di Spreadsheet dan di tabel Web Admin selalu sinkron.

* **Tanpa Data Dummy Bawaan (`buildDefaultSeedOpLogs() = []`)**:

  * Jangan pernah menyuntikkan data contoh/dummy (`OP-101` s/d `OP-206`) ke dalam riwayat Web.

* **Penarik Data Langsung dari Spreadsheet & Auto-Delete Riwayat yang Tidak Ada di Spreadsheet**:

  * Buat fungsi `syncLiveRowsFromGoogleSpreadsheetsGviz()` (menggunakan Google Sheets GViz JSONP di browser) dan `syncOpLogsTimeFromBranchSpreadsheets(cfg)` di `Code.gs`, serta tombol **📥 Sinkronkan Spreadsheet** di bar filter Admin.

  * Tarik seluruh baris aktif dari ke-7 sheet operasional (`Laporan_Harian`, `Absen_Masuk`, `Absen_Keluar`, `open_Store`, `Close_Store`, `Stock_Opname`, `Barang_Datang`) ke dalam tabel Web Admin.

  * **Hapus Otomatis Riwayat yang Tidak Ada di Spreadsheet**: Setiap kali sinkronisasi berjalan, hapus secara otomatis dari `opLogs` (dan `localStorage` / Cloud) setiap riwayat di Website yang slot datanya tidak ada atau sudah dihapus dari Google Spreadsheet (dengan masa tunggu aman 90 detik `localSubmittedAt` khusus untuk laporan yang baru saja dikirim dari booth).

## 8. Panel Admin, Filter Rentang Tanggal, Tombol Hapus Manual & Undo Per Tabel (Tata Letak Rapi & Tidak Keluar Baris)

* **Filter Rentang Tanggal (`Dari Tanggal` s/d `Sampai Tanggal`)**:

  * Saat Admin memilih tanggal pada input `Dari Tanggal` dan/atau `Sampai Tanggal` (baik di bar filter utama maupun di bar periode masing-masing laporan), otomatis kosongkan preset default (`1_TAHUN`), pertahankan nilai tanggal pada `<input type="date">`, dan langsung terapkan penyaringan tabel saat nilai tanggal berubah (`change`) maupun saat tombol **Terapkan Rentang** diklik.

* **Tombol Hapus Manual & Tombol Undo di Setiap Tabel (Rapi & Tidak Keluar dari Baris)**:

  * Sediakan tombol **🗑️ Hapus** manual di setiap baris tabel serta tombol **🗑️ Hapus Tabel Ini** dan **↩️ Undo** pada bar periode di atas setiap tabel laporan (`Laporan Keuangan Harian`, `Pengeluaran Kas`, `Absensi Masuk & Pulang`, `Open/Close Store`, `Stock Opname`, `Barang Datang`, dan `Tabel Riwayat Aktivitas`).

  * Pada tabel `Laporan Keuangan Harian`, tampilkan kolom **`Status Revisi`** berdampingan dengan kolom **`Aksi` (`🗑️ Hapus`)**.

  * Rapikan seluruh bar kontrol dan sel tabel menggunakan `w-full max-w-full overflow-hidden box-border`, `overflow-x-auto`, `flex-wrap`, `shrink-0`, dan `whitespace-nowrap` dengan ukuran kompak (`px-2 py-1 text-[10px]`) agar tombol tidak pernah bertumpuk atau keluar dari batas baris/kartu.

* **Sistem Undo Lengkap (`pushUndoDeleteAction` & `triggerUndoLastDelete`)**:

  * Ketika Admin menghapus satu baris (`🗑️ Hapus`) atau menghapus isi satu tabel (`🗑️ Hapus Tabel Ini`), hapus data di Web & Google Spreadsheet namun simpan snapshot lengkapnya ke dalam stack Undo per tabel.

  * Saat Admin menekan tombol **↩️ Undo** pada tabel tersebut (atau di Floating Undo Bar / Header Admin), kembalikan seluruh baris yang baru dihapus ke dalam tabel Website sekaligus kirim ulang ke Google Spreadsheet agar data kembali utuh.