# 📸 Oh Snap! Photobox — Sistem Operasional & Keuangan 5 Cabang (Full-Stack)

Sistem informasi manajemen operasional, absensi kamera langsung + watermark GPS, laporan keuangan harian (Cash, QRIS, Pengeluaran Kas), Stock Opname 14 item etalase, Barang Datang, serta ceklis Open/Close Store untuk **5 Cabang Oh Snap! Photobox**:

1. **Majenang**

2. **Cilacap**

3. **Pekalongan**

4. **Pemalang**

5. **Kediri** (Aturan khusus 7 foto wajib saat Close Store)

Dilengkapi dengan **Proteksi 4 Lapis Anti Klik 2x (Anti Duplikat Laporan)** agar ketika kru tidak sabar menekan tombol kirim berkali-kali saat jaringan lambat, laporan dan foto **tidak akan pernah masuk dobel** di aplikasi maupun di Google Spreadsheet.

## 📁 Struktur Direktori Proyek

```
oh-snap-photobox-5-cabang/
├── .gitignore                        # Daftar file yang diabaikan Git (node_modules, .env, db lokal)
├── .env.example                      # Template variabel environment (Server, DB, Google Apps Script)
├── package.json                      # Konfigurasi script NPM & dependensi Node.js
├── README.md                         # Dokumentasi utama & panduan lengkap pemasangan
├── TUTORIAL_LENGKAP_SIAP_PUBLISH.md  # Panduan langkah demi langkah upload GitHub & Google Apps Script
├── index.html                        # Entry Web User / Kru (Root — siap langsung untuk GitHub Pages)
├── admin.html                        # Entry Web Admin Dashboard (Root — siap langsung untuk GitHub Pages)
├── laporan_keuangan_harian.html      # Entry Laporan Keuangan Harian (Root)
├── Code.gs                           # Script Google Apps Script (5 Spreadsheet Cabang & Anti-Duplikat)
│
├── frontend/                         # Folder Aplikasi Web Frontend Terstruktur
│   ├── index.html                    # Portal Web User / Kru (Absensi Kamera, Laporan, Opname)
│   ├── admin.html                    # Portal Web Admin (Dashboard, Edit UI, Rekap, Download Excel)
│   ├── laporan_keuangan_harian.html  # Portal Laporan Keuangan Harian & Rekap Pengeluaran
│   └── assets/
│       └── js/
│           └── api-client.js         # Client penghubung Frontend ke Backend API & Apps Script
│
├── backend/                          # Server REST API Node.js & Integrasi Google Apps Script
│   ├── server.js                     # Entry point HTTP / Express Server (Port 3000)
│   ├── test_api.js                   # Script automated test (API, Seeder & Anti Klik 2x)
│   ├── config/
│   │   └── database.js               # Koneksi database & JSON/SQLite storage engine
│   ├── controllers/
│   │   └── reportController.js       # Logika penyimpanan ke-8 tabel operasional & Anti-Duplikat
│   ├── routes/
│   │   └── api.js                    # Routing endpoint REST API (/api/webhook, /api/config, dll.)
│   └── google-apps-script/
│       └── Code.gs                   # Salinan resmi Script Google Apps Script
│
├── migrations/                       # Skema Migrasi Database SQL (Master & 8 Sheet Operasional)
│   ├── 001_create_master_tables.sql  # Tabel branches, branch_shifts, employees, stock_catalog, dll.
│   ├── 002_create_8_operational_sheets_tables.sql # 8 Tabel sesuai 8 Sheet Spreadsheet Cabang
│   └── run_migrations.js             # CLI Runner untuk mengeksekusi migrasi database
│
├── seeders/                          # Data Palsu (Dummy Data) Lengkap untuk 5 Cabang
│   ├── 001_seed_master_data.sql      # Seed 5 Cabang, Jadwal Shift, 14 Karyawan, 14 Item Stok
│   ├── 002_seed_dummy_transactions.sql # Seed transaksi palsu untuk 8 tabel operasional
│   ├── dummy_data.json               # Dataset JSON siap pakai untuk pengujian API & Web Admin
│   └── run_seeders.js                # CLI Runner untuk mengisi database dengan data palsu
│
├── Template_5_Spreadsheet_Cabang/    # File Excel (.xlsx) Template 8 Sheet untuk 5 Cabang
└── Folder_Foto_Laporan/              # Struktur Folder Foto Laporan per Kategori & 5 Subfolder Cabang


```

## 🛡️ Cara Kerja Proteksi Anti Klik 2x (Anti Duplikat Laporan)

1. **Kunci Tombol Instan (`acquireFormSubmitLock`):** Begitu kru menekan tombol **Kirim** pada form *Absen Masuk/Pulang*, *Open/Close Store*, *Laporan Keuangan Harian*, *Stock Opname*, atau *Barang Datang*, tombol langsung dikunci (`disabled`), berubah menjadi indikator `⏳ Sedang Mengirim Laporan... Jangan Klik 2x`, dan menolak klik berikutnya.

2. **Deteksi Sidik Jari Laporan (`buildReportDeduplicationKey`):** Aplikasi memeriksa isi laporan (Cabang, Nama Kru, Shift, Tanggal, Jenis Laporan, dan Nominal/Stok). Jika laporan yang sama persis baru saja dikirim dalam 75 detik terakhir, klik kedua langsung dihentikan sebelum membuat riwayat ganda.

3. **Deduplikasi Jaringan (`IN_FLIGHT_WEBHOOK_SIGNATURES`):** Fungsi `sendToGoogleSheetWebhook()` memblokir pengiriman HTTP `fetch` ganda untuk payload yang sedang dikirim.

4. **Kunci Server Google Apps Script (`LockService` + `CacheService` di `Code.gs`):** Di sisi server Google Apps Script dan Backend Node.js, setiap laporan yang masuk dicek hash MD5-nya di `CacheService`. Jika ada 2 request kembar yang masuk karena sinyal lambat/klik 2x, request kedua otomatis diabaikan sehingga **tidak pernah menulis 2 baris di Google Sheet** dan **tidak mengunggah foto ganda ke Google Drive**.

## 🛠️ Tutorial Lengkap Cara Memasang (Upload ke GitHub, Google Apps Script & Server Lokal)

### BAGIAN A: Cara Upload ke GitHub & Aktifkan GitHub Pages (Gratis & Bisa Diakses Semua HP Kru)

1. **Ekstrak File ZIP:**

   * Ekstrak file `Oh_Snap_Photobox_5_Cabang.zip` ke dalam satu folder di laptop/PC Anda.

2. **Buat Repository Baru di GitHub:**

   * Buka <https://github.com/new> dan login ke akun GitHub Anda.

   * Isi **Repository name**, misalnya: `ohsnap-photobox-5cabang`.

   * Pilih **Public**, lalu klik **Create repository**.

3. **Upload Semua File ke GitHub:**

   * **Cara 1 (Lewat Browser — Paling Mudah):**

     1. Di halaman repository GitHub yang baru dibuat, klik link **uploading an existing file** (atau tombol **Add file** ➔ **Upload files**).

     2. Blok dan seret (*drag & drop*) semua file dan folder hasil ekstrak (`.gitignore`, `.env.example`, `README.md`, `package.json`, `index.html`, `admin.html`, `laporan_keuangan_harian.html`, `Code.gs`, `frontend/`, `backend/`, `migrations/`, `seeders/`) ke kotak upload GitHub.

     3. Tunggu proses upload selesai, ketik pesan commit `Initial fullstack release with anti-double-click`, lalu klik tombol hijau **Commit changes**.

   * **Cara 2 (Lewat Terminal Git):**

     ```
     git init
     git add .
     git commit -m "Initial fullstack release Oh Snap Photobox 5 Cabang"
     git branch -M main
     git remote add origin https://github.com/USERNAME_ANDA/ohsnap-photobox-5cabang.git
     git push -u origin main
     
     
     ```

4. **Aktifkan GitHub Pages:**

   * Masuk ke menu **Settings** di repository GitHub Anda.

   * Di menu sebelah kiri, klik **Pages**.

   * Pada bagian **Build and deployment** ➔ **Branch**, ubah `None` menjadi `main` dan folder `/(root)`, lalu klik **Save**.

   * Tunggu 1–2 menit, lalu refresh halaman. Link web Anda akan muncul:

     * **Link Web Kru (Bagikan ke HP Kru):** `https://USERNAME_ANDA.github.io/ohsnap-photobox-5cabang/`

     * **Link Web Admin (Khusus Owner/Admin):** `https://USERNAME_ANDA.github.io/ohsnap-photobox-5cabang/admin.html`

### BAGIAN B: Cara Memasang `Code.gs` di Google Apps Script (Agar Otomatis Membuat 5 Spreadsheet Cabang & Folder Foto)

> **Catatan:** Di dalam kode aplikasi saat ini sudah tertanam URL Google Apps Script aktif Anda (`https://script.google.com/macros/s/AKfycbzWDRLo5bMNHWQeNIkoNXwan67TxgsjSdPow_ZVxVc7AwDHTJxz68l5mj18-sFGbvJh/exec`). Jika Anda ingin memperbarui script di Google Apps Script Anda agar fitur **Anti Klik 2x Server-Side** aktif di Google Sheet:

1. Buka <https://script.google.com> dan pilih project Apps Script Anda (atau buka dari Google Spreadsheet ➔ **Ekstensi** ➔ **Apps Script**).

2. Hapus seluruh kode lama di `Code.gs`, lalu salin (*copy-paste*) seluruh isi file **`Code.gs`** (atau `backend/google-apps-script/Code.gs`) dari paket ZIP ini.

3. Klik ikon **Simpan (💾)** di bagian atas editor Apps Script.

4. **(Opsional - Hanya Sekali)** Untuk menyiapkan 5 Spreadsheet Cabang beserta 8 Sheet dan Folder Foto Google Drive secara otomatis, pilih fungsi **`setup5SpreadsheetCabangOtomatis`** di dropdown atas, lalu klik **Jalankan (Run)** dan berikan izin akses (*Review Permissions* ➔ *Allow*).

5. Klik tombol biru **Terapkan (Deploy)** di kanan atas:

   * Pilih **Kelola deployment (Manage deployments)** jika ingin memakai URL yang sama, klik ikon **Pensil (Edit)** ➔ pada bagian **Versi (Version)** pilih **Versi baru (New version)** ➔ klik **Terapkan (Deploy)**.

   * Atau pilih **Deployment baru (New deployment)** ➔ Jenis: **Aplikasi Web (Web App)** ➔ Jalankan sebagai: **Saya (Me)** ➔ Siapa yang memiliki akses: **Siapa saja (Anyone)** ➔ klik **Terapkan (Deploy)**.

### BAGIAN C: Cara Menjalankan Backend, Migrasi Database & Seeder (Data Palsu) di Lokal / VPS

Jika Anda ingin menjalankan aplikasi sebagai server Full-Stack menggunakan Node.js:

1. **Salin File Environment (`.env`):**

   ```
   cp .env.example .env
   
   
   ```

2. **Jalankan Migrasi Tabel Database (`migrations/`):**

   ```
   npm run migrate
   # Atau langsung dengan Node:
   node migrations/run_migrations.js --fresh
   
   
   ```

3. **Jalankan Seeder Data Palsu (`seeders/`):**

   ```
   npm run seed
   # Atau langsung dengan Node:
   node seeders/run_seeders.js
   
   
   ```

   *(Perintah `npm run db:setup` akan menjalankan `migrate:fresh` sekaligus `seed` dalam satu langkah).*

4. **Jalankan Pengujian Otomatis (Verifikasi API & Anti Klik 2x):**

   ```
   npm test
   
   
   ```

5. **Jalankan Server Aplikasi:**

   ```
   npm start
   
   
   ```

   Akses di browser:

   * **Web User / Kru:** `http://localhost:3000/index.html`

   * **Web Admin Dashboard:** `http://localhost:3000/admin.html`

   * **Laporan Keuangan Harian:** `http://localhost:3000/laporan_keuangan_harian.html`

   * **Health Check API:** `http://localhost:3000/api/health`

   * **Data Seeder JSON API:** `http://localhost:3000/api/seed-data`

## 🗃️ Daftar 8 Tabel Operasional (Sesuai 8 Sheet Spreadsheet Cabang)

| No | Nama Sheet / Tabel | Deskripsi Data | Folder Foto Google Drive | 
| ----- | ----- | ----- | ----- | 
| 1 | `Absen_Masuk` (`absen_masuk`) | Absensi kamera saat datang + deteksi otomatis **Tepat Waktu / Telat** sesuai jadwal shift cabang | `Folder_Absensi/Cabang_<Nama>` | 
| 2 | `Absen_Keluar` (`absen_keluar`) | Absensi kamera langsung saat pulang + deteksi **Memenuhi Jam Kerja / Belum Memenuhi Jam Kerja** | `Folder_Absensi/Cabang_<Nama>` | 
| 3 | `Laporan_Harian` (`laporan_harian`) | Pemasukan Cash, QRIS, Total Kotor, Pengeluaran Kas, Pemasukan Bersih, & Foto Serah Terima | `Folder_Pemasukan_Laporan_Harian/Cabang_<Nama>` | 
| 4 | `Rekap_Pengeluaran` (`rekap_pengeluaran`) | Rincian per item pengeluaran operasional kasir beserta foto struk belanja | `Folder_Struk_Belanja_Pengeluaran/Cabang_<Nama>` | 
| 5 | `Stock_Opname` (`stock_opname`) | Laporan sisa stok fisik 14 barang utama (`BRG-001` s/d `BRG-014`) | \- | 
| 6 | `Barang_Datang` (`barang_datang`) | Pencatatan stok masuk gudang/cabang (Stok Awal, Jumlah Masuk, Stok Akhir) | \- | 
| 7 | `open_Store` (`open_store`) | Ceklis kesiapan peralatan & foto bukti buka store | `Folder_Open_Store/Cabang_<Nama>` | 
| 8 | `Close_Store` (`close_store`) | Ceklis penutupan alat & foto bukti tutup store (2 foto standar / **7 foto khusus Kediri**) | `Folder_Close_Store/Cabang_<Nama>` | 

## 👥 Daftar Akun Kru (Data Palsu / Seeder)

| Cabang | Nama Kru | Password Login | Jadwal Shift Cabang | 
| ----- | ----- | ----- | ----- | 
| **Majenang** | Widia, Silfi | `widia01`, `silfi02` | Pagi (`09.00-14.30`), Sore (`14.30-20.00`) | 
| **Cilacap** | Saskia, Nazya | `saskia03`, `nazya04` | Pagi (`10.00-15.00`), Sore (`15.00-20.00`) | 
| **Pekalongan** | Kholil, Firdaus | `kholil05`, `firdaus06` | Pagi (`09.30-15.30`), Sore (`15.00-21.00`) | 
| **Pemalang** | Bunga, Fadia, Aji | `bunga07`, `fadia08`, `aji09` | Pagi (`08.40-15.10`), Middle (`13.20-19.40`), Sore (`14.50-22.00`) | 
| **Kediri** | Vino, Kansa, Delisa, Rangga, Winaa | `vino10`, `kansa11`, `delisa12`, `rangga13`, `winaa14` | Pagi (`09.30-16.30`), Middle (`13.00-20.00`), Sore (`15.10-22.10`) | 

## 💻 Tutorial Lengkap & Rinci Upload ke GitHub Menggunakan Terminal (Git Bash / VS Code / CMD / macOS)

Panduan ini menjelaskan langkah demi langkah dari awal (mulai dari ekstrak ZIP, konfigurasi akun Git, menghubungkan repository, mengatasi error login/token, hingga cara update file di kemudian hari).

### Tahap 1: Persiapan & Masuk ke Folder Proyek di Terminal

1. **Pastikan Git sudah terinstal di laptop/PC:**
   Buka Terminal (di Windows gunakan **Git Bash**, **PowerShell**, atau terminal di dalam **VS Code** dengan menekan `Ctrl + ~`), lalu cek versi Git:

   ```
   git --version
   
   ```

   *(Jika belum terinstal, unduh terlebih dahulu di [https://git-scm.com/downloads](https://www.google.com/search?q=https://git-scm.com/downloads)).*

2. **Ekstrak File `Oh_Snap_Photobox_5_Cabang.zip`:**
   Ekstrak file ZIP ke folder yang mudah diakses, misalnya:

   * Windows: `C:\Users\NamaAnda\Downloads\Oh_Snap_Photobox_5_Cabang`

   * macOS/Linux: `~/Downloads/Oh_Snap_Photobox_5_Cabang`

3. **Arahkan Terminal (`cd`) ke Dalam Folder Hasil Ekstrak:**

   ```
   # Contoh di Windows (Git Bash / PowerShell):
   cd ~/Downloads/Oh_Snap_Photobox_5_Cabang
   
   # Cek pastikan file index.html, admin.html, package.json, frontend/, backend/ terlihat:
   ls -la
   
   ```

   *(Tips VS Code: Klik **File** ➔ **Open Folder** ➔ pilih folder hasil ekstrak `Oh_Snap_Photobox_5_Cabang` ➔ tekan `Ctrl + ~` maka terminal otomatis sudah berada di dalam folder yang benar).*

### Tahap 2: Konfigurasi Identitas Git (Hanya Dilakukan Sekali Seumur Hidup di Laptop)

Jika Anda baru pertama kali memakai Git di laptop tersebut, jalankan 2 perintah ini (ganti dengan nama dan email akun GitHub Anda):

```
git config --global user.name "Nama_GitHub_Anda"
git config --global user.email "email_github_anda@gmail.com"

```

Cek apakah sudah tersimpan:

```
git config --list

```

### Tahap 3: Buat Repository Kosong di Website GitHub

1. Buka browser dan kunjungi <https://github.com/new>.

2. Pada kolom **Repository name**, ketik nama repo tanpa spasi, contoh: `ohsnap-photobox-5cabang`.

3. Pilih **Public** (wajib Public jika ingin menggunakan GitHub Pages gratis).

4. **PENTING:** Biarkan bagian *Add a README file*, *Add .gitignore*, dan *Choose a license* **TIDAK DICENTANG (kosong)** karena proyek kita sudah memiliki `.gitignore` dan `README.md` sendiri.

5. Klik tombol hijau **Create repository**.

6. Salin URL HTTPS repository Anda yang muncul di layar, contohnya:
   `https://github.com/USERNAME_ANDA/ohsnap-photobox-5cabang.git`

### Tahap 4: Inisialisasi Git, Commit & Push (Upload) dari Terminal

Jalankan perintah berikut secara berurutan satu per satu di Terminal Anda:

```
# 1. Inisialisasi folder proyek menjadi repository Git lokal
git init

# 2. Cek status file yang akan di-upload (file di .gitignore otomatis diabaikan)
git status

# 3. Masukkan seluruh file & folder (.gitignore, .env.example, README.md, package.json, frontend/, backend/, migrations/, seeders/) ke daftar antrean upload (Staging Area)
git add .

# 4. Bungkus dan simpan perubahan dengan pesan catatan (Commit)
git commit -m "Initial release Oh Snap Photobox 5 Cabang Fullstack + Anti Klik 2x"

# 5. Pastikan nama branch utama adalah 'main'
git branch -M main

# 6. Hubungkan folder lokal dengan URL repository GitHub Anda (Ganti URL di bawah dengan URL repo Anda!)
git remote add origin https://github.com/USERNAME_ANDA/ohsnap-photobox-5cabang.git

# 7. Cek apakah alamat remote sudah benar
git remote -v

# 8. Upload (Push) seluruh file ke GitHub!
git push -u origin main

```

### Tahap 5: Cara Mengatasi Login / Password Saat `git push` (Personal Access Token)

Saat menjalankan `git push -u origin main` pertama kali:

* **Jika muncul pop-up jendela "Sign in with your browser":** Klik tombol biru **Sign in with your browser** ➔ klik **Authorize GitCredentialManager** di browser, maka upload akan langsung berjalan otomatis.

* **Jika terminal meminta `Username` dan `Password` secara manual:**

  * **Username:** Ketik username GitHub Anda.

  * **Password:** GitHub tidak lagi menerima password akun biasa di terminal; gunakan **Personal Access Token (PAT)**. Cara membuatnya hanya 30 detik:

    1. Buka <https://github.com/settings/tokens/new>.

    2. Isi **Note**: `Laptop OhSnap`.

    3. Pilih **Expiration**: `No expiration` (atau `90 days`).

    4. Centang kotak **`repo`** (Full control of private repositories).

    5. Scroll ke paling bawah, klik **Generate token**, lalu salin kode token yang diawali `ghp_...` tersebut dan tempelkan (*paste*) saat terminal meminta `Password`.

### Tahap 6: Solusi Jika Muncul Error Umum di Terminal

* **Error 1: `fatal: remote origin already exists`**
  Artinya alamat remote sudah pernah didaftarkan sebelumnya. Ganti alamatnya dengan perintah:

  ```
  git remote set-url origin https://github.com/USERNAME_ANDA/ohsnap-photobox-5cabang.git
  git push -u origin main
  
  ```

* **Error 2: `! [rejected] main -> main (fetch first)` atau `(non-fast-forward)`**
  Terjadi jika di GitHub sudah terlanjur ada file bawaan. Tarik dan gabungkan dulu, atau timpa dengan:

  ```
  # Opsi A (Gabungkan dengan isi di GitHub):
  git pull origin main --allow-unrelated-histories --no-edit
  git push -u origin main
  
  # Opsi B (Timpa paksa isi GitHub dengan file terbaru dari laptop Anda):
  git push -u origin main --force
  
  ```

### Tahap 7: Cara Update File di Kemudian Hari Lewat Terminal

Setiap kali Anda mengedit file atau men-download `index.html` / `admin.html` terbaru dari panel Admin, Anda cukup menjalankan **3 perintah singkat** ini di terminal untuk meng-update GitHub:

```
git add .
git commit -m "Update konfigurasi dan fitur terbaru"
git push

```