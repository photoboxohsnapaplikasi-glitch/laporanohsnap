# 📖 Panduan & Tutorial Lengkap Siap Publish — Oh Snap! Photobox (5 Cabang)

Panduan ini berisi langkah demi langkah dari awal hingga aplikasi **Oh Snap! Photobox (5 Cabang)** siap digunakan oleh kru dan pemilik (Admin), lengkap dengan **5 Google Spreadsheet berbeda per cabang (8 Sheet)** serta **Folder Google Drive otomatis per 5 cabang** untuk Foto Absensi, Foto Pemasukan, dan Foto Struk Belanja.

## 1. Isi Paket File ZIP (`Oh_Snap_Photobox_5_Cabang.zip`)

| Nama File / Folder | Kegunaan Utama |
| :--- | :--- |
| `index.html` | Halaman utama **Web User (Karyawan/Kru)** untuk Login Kru, Absen Datang & Pulang, Open/Close Store, Laporan Harian, Stock Opname, dan Barang Datang (juga memiliki akses tombol Admin). |
| `admin.html` | Halaman khusus **Web Admin (Owner)** yang langsung membuka Portal Admin untuk memantau riwayat, download spreadsheet, bulk opname, dan kelola admin. |
| `laporan_keuangan_harian.html` | File cadangan aplikasi lengkap yang identik dengan `index.html`. |
| `Code.gs` | Kode **Google Apps Script** yang otomatis membuat 5 Spreadsheet cabang (8 Sheet) dan menyimpan foto ke `Folder_Absensi`, `Folder_Pemasukan_Laporan_Harian`, serta `Folder_Struk_Belanja_Pengeluaran` (masing-masing berisi 5 subfolder cabang). |
| `Template_5_Spreadsheet_Cabang/` | Berisi 5 file Excel (`.xlsx`) siap pakai untuk Cabang **Majenang**, **Cilacap**, **Pekalongan**, **Pemalang**, dan **Kediri** (masing-masing sudah memiliki 8 Sheet sesuai standar). |
| `Folder_Foto_Laporan/` | Struktur folder lokal/referensi (`Folder_Absensi`, `Folder_Pemasukan_Laporan_Harian`, `Folder_Struk_Belanja_Pengeluaran`, `Folder_Open_Store`, `Folder_Close_Store` beserta 5 subfolder cabang di dalamnya). |
| `TUTORIAL_LENGKAP_SIAP_PUBLISH.md` | Dokumen panduan lengkap langkah demi langkah ini. |

## 2. Struktur Otomatis Folder Foto di Google Drive & Spreadsheet

Saat kru mengirim laporan dari aplikasi, `Code.gs` otomatis menata semua foto ke dalam folder utama berdasarkan jenisnya, lalu di dalam setiap folder tersebut **otomatis dibagi menjadi 5 folder cabang** agar sangat mudah dicek:

1. **`Folder_Absensi`** (Menyimpan **Foto Absen Datang** & **Foto Absen Pulang**)
   * `Folder_Absensi/Cabang_Majenang`
   * `Folder_Absensi/Cabang_Cilacap`
   * `Folder_Absensi/Cabang_Pekalongan`
   * `Folder_Absensi/Cabang_Pemalang`
   * `Folder_Absensi/Cabang_Kediri`
   * Tercatat otomatis beserta link foto & link foldernya di Sheet **`Absen_Masuk`** dan **`Absen_Keluar`**.
2. **`Folder_Pemasukan_Laporan_Harian`** (Menyimpan **Foto Bukti Pemasukan / Serah Terima Kasir**)
   * `Folder_Pemasukan_Laporan_Harian/Cabang_Majenang`
   * `Folder_Pemasukan_Laporan_Harian/Cabang_Cilacap`
   * `Folder_Pemasukan_Laporan_Harian/Cabang_Pekalongan`
   * `Folder_Pemasukan_Laporan_Harian/Cabang_Pemalang`
   * `Folder_Pemasukan_Laporan_Harian/Cabang_Kediri`
   * Tercatat otomatis beserta link foto & link foldernya di Sheet **`Laporan_Harian`**.
3. **`Folder_Struk_Belanja_Pengeluaran`** (Menyimpan **Foto Struk Belanja / Pengeluaran Kas**)
   * `Folder_Struk_Belanja_Pengeluaran/Cabang_Majenang`
   * `Folder_Struk_Belanja_Pengeluaran/Cabang_Cilacap`
   * `Folder_Struk_Belanja_Pengeluaran/Cabang_Pekalongan`
   * `Folder_Struk_Belanja_Pengeluaran/Cabang_Pemalang`
   * `Folder_Struk_Belanja_Pengeluaran/Cabang_Kediri`
   * Tercatat otomatis beserta link foto & link foldernya di Sheet **`Laporan_Harian`** dan **`Rekap_Pengeluaran`**.
4. **`Folder_Open_Store`** & **`Folder_Close_Store`**
   * Masing-masing juga otomatis memiliki 5 subfolder cabang (`Cabang_Majenang` s/d `Cabang_Kediri`) dan tercatat di Sheet **`open_Store`** serta **`Close_Store`**.

## 3. Langkah 1: Pasang `Code.gs` & Buat 5 Spreadsheet + Folder 5 Cabang Otomatis

1. Buka [Google Apps Script](https://script.google.com) lalu klik **New Project (Proyek Baru)**, atau buka dari Google Spreadsheet Anda melalui menu **Extensions (Ekstensi) -> Apps Script**.
2. Hapus seluruh isi kode bawaan di editor `Code.gs`, lalu salin dan tempel seluruh isi file **`Code.gs`** dari paket ZIP ini (atau klik tombol **📋 Salin Code.gs** di menu **⚙️ Kelola Admin -> Pilih Pengaturan: ⚙️ 4. GitHub, Spreadsheet & Code.gs**).
3. Klik ikon **💾 Save (Simpan)** di bagian atas editor Apps Script.
4. Pada daftar dropdown fungsi di sebelah tombol Run, pilih fungsi **`setup5SpreadsheetCabangOtomatis`** lalu klik **▶️ Run (Jalankan)**.
5. Jika muncul jendela izin (*Authorization required*), klik **Review permissions -> Pilih Akun Google Anda -> Advanced (Lanjutan) -> Go to project (unsafe) -> Allow (Izinkan)**.
6. Tunggu beberapa detik hingga muncul pesan **Execution completed / Selesai** di bagian *Execution log*:
   * Script otomatis membuat 5 file Google Spreadsheet (`OhSnap_Spreadsheet_Cabang_Majenang` s/d `Kediri`) lengkap dengan 8 Sheet (`Absen_Masuk`, `Absen_Keluar`, `Laporan_Harian`, `Rekap_Pengeluaran`, `Stock_Opname`, `Barang_Datang`, `open_Store`, `Close_Store`).
   * Script juga otomatis membuat `Folder_Absensi`, `Folder_Pemasukan_Laporan_Harian`, `Folder_Struk_Belanja_Pengeluaran`, `Folder_Open_Store`, dan `Folder_Close_Store` yang masing-masing langsung berisi 5 folder cabang (`Cabang_Majenang`, `Cabang_Cilacap`, `Cabang_Pekalongan`, `Cabang_Pemalang`, `Cabang_Kediri`).

## 4. Langkah 2: Deploy Apps Script Menjadi Web App URL

1. Masih di halaman editor Google Apps Script, klik tombol biru **Deploy -> New deployment (Deployment baru)** di pojok kanan atas.
2. Klik ikon roda gigi (⚙️) di samping *Select type*, lalu pilih **Web app**.
3. Isi pengaturan berikut:
   * **Description**: `Webhook Oh Snap 5 Cabang`
   * **Execute as (Jalankan sebagai)**: **Me (Saya)**
   * **Who has access (Siapa yang memiliki akses)**: **Anyone (Siapa saja)** *(Wajib pilih "Anyone / Siapa saja" agar semua HP karyawan di 5 cabang bisa mengirim laporan tanpa kendala login Google)*.
4. Klik **Deploy**, lalu klik **Copy (Salin)** pada **Web App URL** (alamat yang berakhiran `/exec`).
5. Buka aplikasi **Oh Snap! Photobox**, masuk ke **Portal Admin** (Password default Admin: `admin123`), buka tab **⚙️ Kelola Admin**, pilih dropdown **`⚙️ 4. GitHub, Spreadsheet & Code.gs`**, lalu tempelkan URL `/exec` tersebut ke kolom **🔗 URL Google Apps Script Web App** dan klik **💾 Simpan & Tes Koneksi**.

## 5. Langkah 3: Cara Publish Aplikasi ke GitHub Pages (Agar Bisa Diakses Online oleh Semua Cabang)

1. Setelah Anda mengatur jadwal kerja, daftar kru, atau URL Webhook di menu **⚙️ Kelola Admin**, buka dropdown **`⚙️ 4. GitHub, Spreadsheet & Code.gs`**, lalu klik tombol:
   * **⬇️ Download `index.html` (Web User)**
   * **⬇️ Download `admin.html` (Web Admin)**
   *(File yang diunduh dari tombol ini sudah menyimpan seluruh pengaturan terbaru Anda secara permanen di dalam kode).*
2. Masuk ke akun [GitHub](https://github.com) Anda, lalu buat repository baru (klik **New repository**), misalnya beri nama `ohsnap-photobox`, pastikan pilih **Public**, lalu klik **Create repository**.
3. Klik tautan **uploading an existing file** (atau tombol **Add file -> Upload files**).
4. Tarik dan lepas (*drag & drop*) file **`index.html`**, **`admin.html`**, dan **`Code.gs`** ke halaman upload GitHub, lalu klik tombol hijau **Commit changes** di bagian bawah.
5. Buka menu **Settings (Pengaturan)** di repository GitHub Anda, lalu klik menu **Pages** di bilah kiri.
6. Pada bagian **Build and deployment -> Branch**, ubah dari *None* menjadi **`main`** (atau `master`), biarkan folder `/ (root)`, lalu klik **Save**.
7. Tunggu sekitar 1–2 menit, lalu muat ulang (*refresh*) halaman **Settings -> Pages**. Akan muncul tautan resmi aplikasi Anda:
   * **Link untuk Kru (5 Cabang)**: `https://<username-github-anda>.github.io/<nama-repo>/`
   * **Link Khusus Owner/Admin**: `https://<username-github-anda>.github.io/<nama-repo>/admin.html`
