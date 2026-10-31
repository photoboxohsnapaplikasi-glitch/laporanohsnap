# TUTORIAL LENGKAP: SETUP 5 SPREADSHEET BERBEDA PER CABANG (TEMPLATE 8 SHEET)
## Sistem Absensi Karyawan, Laporan Keuangan & Stock Opname — Oh Snap! Photobox

Sesuai permintaan Anda, sekarang **setiap cabang (Majenang, Cilacap, Pekalongan, Pemalang, Kediri, maupun cabang baru yang Anda tambahkan)** masuk ke **File Spreadsheet yang berbeda-beda**, dan di dalam masing-masing Spreadsheet cabang tersebut otomatis memiliki **8 Sheet Template** persis seperti foto:

1. `Absen_Masuk` — Data absensi datang kru (lengkap status Tepat Waktu / Telat & link foto kamera).
2. `Absen_Keluar` — Data absensi pulang kru (lengkap status Tepat Waktu / Warning Belum Memenuhi Jam Kerja & kekurangan menit/jam).
3. `Laporan_Harian` — Laporan keuangan harian kasir (Cash, QRIS, Total Kotor, Total Pengeluaran, Total Bersih, Foto Serah Terima & Struk).
4. `Rekap_Pengeluaran` — Rincian per item pengeluaran kas harian (misal: Beli Tisu, Air Galon, Token, dll.).
5. `Stock_Opname` — Laporan sisa stok cabang berbentuk angka bersih (satuan barang sudah berada di baris judul/header atas, tanpa tambahan teks status aman/kurang di sel angka).
6. `Barang_Datang` — Laporan restock barang masuk cabang (tinta dibagi per kode warna LM, LC, Y, M, C, K dan bersatuan **Botol**).
7. `open_Store` — Laporan buka store beserta ceklis kesiapan booth & foto Open Store.
8. `Close_Store` — Laporan tutup store beserta ceklis & foto Close Store (standar 2 foto atau Kediri 7 foto / sesuai kustomisasi UI cabang).

---

## CARA 1: MODE 100% OTOMATIS DI GOOGLE DRIVE (PALING MUDAH & CEPAT)
Anda **tidak perlu** membuat 5 file Google Spreadsheet dan 8 Sheet satu per satu secara manual. Cukup gunakan 1 file `Code.gs` yang sudah disediakan:

1. **Buka Google Apps Script**
   - Buka [https://script.google.com](https://script.google.com) lalu buat project baru (atau buka Google Spreadsheet Anda -> klik menu **Extensions / Ekstensi** -> **Apps Script**).
2. **Tempel Kode `Code.gs` Terbaru**
   - Hapus seluruh kode lama di editor `Code.gs`.
   - Buka file `Code.gs` yang ada di dalam paket ZIP ini (atau klik tombol **📋 Salin Code.gs** di menu **Kelola Admin -> GitHub & Code.gs** pada Web Admin).
   - **Paste (Tempel)** ke editor Google Apps Script, lalu tekan **Ctrl+S** (atau klik ikon **Simpan / Save**).
3. **Jalankan Fungsi Pembuat 5 Spreadsheet Otomatis (`setup5SpreadsheetCabangOtomatis`)**
   - Pada dropdown daftar fungsi di bagian atas editor Apps Script (sebelah tombol **Run / Jalankan**), pilih fungsi **`setup5SpreadsheetCabangOtomatis`**.
   - Klik tombol **▶️ Run (Jalankan)**.
   - Jika muncul jendela izin (*Authorization required*), klik **Review permissions** -> pilih akun Google Anda -> klik **Advanced (Lanjutan)** -> klik **Go to ... (unsafe)** -> klik **Allow (Izinkan)**.
   - Dalam beberapa detik, lihat bagian **Execution log (Log Eksekusi)** di bawah: script telah otomatis membuat 5 file Google Spreadsheet terpisah di dalam folder Google Drive Anda:
     - `OhSnap_Spreadsheet_Cabang_Majenang`
     - `OhSnap_Spreadsheet_Cabang_Cilacap`
     - `OhSnap_Spreadsheet_Cabang_Pekalongan`
     - `OhSnap_Spreadsheet_Cabang_Pemalang`
     - `OhSnap_Spreadsheet_Cabang_Kediri`
   - Dan di setiap file tersebut sudah otomatis dibuatkan **8 tab Sheet** (`Absen_Masuk`, `Absen_Keluar`, `Laporan_Harian`, `Rekap_Pengeluaran`, `Stock_Opname`, `Barang_Datang`, `open_Store`, `Close_Store`) lengkap dengan judul kolom berwarna dan rapi!
4. **Deploy sebagai Web App**
   - Klik tombol biru **Deploy** (di pojok kanan atas Apps Script) -> pilih **New deployment (Deployment baru)**.
   - Klik ikon roda gigi (⚙️) di samping *Select type* -> pilih **Web app**.
   - Isi konfigurasi berikut:
     - **Description**: `Oh Snap 5 Spreadsheet Cabang Terpisah`
     - **Execute as (Jalankan sebagai)**: **`Me` (Saya)**
     - **Who has access (Siapa yang memiliki akses)**: **`Anyone` (Siapa saja)** *(Penting agar semua HP kru di 5 cabang bisa mengirim data)*
   - Klik **Deploy**, lalu klik **Copy (Salin)** pada **Web App URL** (berakhiran `/exec`).
5. **Simpan URL di Web Admin & Upload ke GitHub**
   - Buka `admin.html` -> masuk ke menu **⚙️ Kelola Admin** -> gulir ke bagian **GitHub & Code.gs**.
   - Tempel **Web App URL** tadi ke kolom **URL Google Apps Script Web App**, lalu klik **💾 Simpan & Tes Koneksi**.
   - Klik tombol **⬇️ Download `index.html`** dan **⬇️ Download `admin.html`**, lalu upload kedua file tersebut ke repository GitHub Pages Anda.

---

## CARA 2: MENGGUNAKAN FILE GOOGLE SPREADSHEET SENDIRI / UPLOAD TEMPLATE `.xlsx` PER CABANG
Jika Anda ingin menggunakan 5 file Spreadsheet yang sudah Anda buat sendiri (atau meng-upload ke-5 file Excel template yang ada di folder `5_Spreadsheet_Template_Cabang` di dalam ZIP ini):

1. **Upload / Siapkan 5 File Spreadsheet di Google Drive**
   - Anda bisa meng-upload 5 file Excel di folder `5_Spreadsheet_Template_Cabang/` (`OhSnap_Spreadsheet_Cabang_Majenang.xlsx`, dll.) ke Google Drive, lalu buka masing-masing file dan klik menu **File -> Save as Google Sheets (Simpan sebagai Google Spreadsheet)**.
   - Atau buat 5 file Google Spreadsheet kosong biasa (script akan otomatis membuatkan 8 tab Sheet-nya).
2. **Salin Link URL / ID Masing-Masing Spreadsheet Cabang**
   - Buka Spreadsheet Cabang Majenang, lalu salin URL di baris alamat browser (contoh: `https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit`).
   - Lakukan hal yang sama untuk cabang Cilacap, Pekalongan, Pemalang, dan Kediri.
3. **Tempelkan ke Tabel Spreadsheet Cabang di Web Admin**
   - Buka **Web Admin (`admin.html`)** -> klik menu **⚙️ Kelola Admin** -> gulir ke bagian **🏢 Daftar Google Spreadsheet Berbeda untuk Tiap Cabang**.
   - Tempelkan Link URL Google Spreadsheet masing-masing cabang pada baris cabangnya.
   - Klik tombol **💾 Simpan Spreadsheet Cabang**.
   - *Catatan:* Saat Anda klik Simpan, aplikasi juga otomatis memperbarui daftar `BRANCH_SPREADSHEET_IDS` di dalam kotak `Code.gs`!
4. **Download Ulang `index.html` & `admin.html` untuk GitHub**
   - Klik tombol **⬇️ Download `index.html`** dan **⬇️ Download `admin.html`** agar ID Spreadsheet ke-5 cabang tersimpan permanen di dalam kode HTML yang Anda pasang di GitHub.

---

## CARA DOWNLOAD LANGSUNG 5 FILE SPREADSHEET CABANG (.xlsx) DARI WEB ADMIN
Selain tersinkron otomatis ke Google Drive, kapan saja Anda ingin mengunduh laporan ke komputer/HP dalam bentuk 5 file Excel (`.xlsx`) terpisah per cabang dengan format 8 Sheet sesuai foto:
1. Buka **Web Admin (`admin.html`)** -> menu **📊 Riwayat Admin**.
2. Pilih rentang **Periode** di bagian atas (bisa pilih Hari Ini, 7 Hari, Bulan Ini, atau beberapa periode sekaligus).
3. Pada kotak **📗 Download Spreadsheet Berbeda per Cabang (Template 8 Sheet)**:
   - Klik **📗 Download Semua 5 Spreadsheet Cabang (.xlsx Berbeda-beda)** untuk langsung mengunduh 5 file `.xlsx` sekaligus (1 file per cabang, masing-masing berisi 8 Sheet).
   - Atau klik tombol masing-masing cabang (`📗 Cabang Majenang`, `📗 Cabang Cilacap`, `📗 Cabang Pekalongan`, `📗 Cabang Pemalang`, `📗 Cabang Kediri`) untuk mengunduh Spreadsheet cabang tersebut saja.
