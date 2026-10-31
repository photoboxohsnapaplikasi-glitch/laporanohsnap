// ============================================================================
// GOOGLE APPS SCRIPT (Code.gs) — OH SNAP! PHOTOBOX (MULTI-CABANG & CLOUD SYNC V4)
// FITUR UTAMA:
// 1. SINKRONISASI CLOUD OTOMATIS KE SEMUA DEVICE (WEB ADMIN <-> SEMUA HP KRU):
//    - Semua perubahan di Web Admin (Tambah/Hapus Cabang, Kru & Password, Jam Kerja,
//      Edit UI Menu & Slot Foto, Katalog Stok Opname, Stok Cabang, Link Spreadsheet)
//      otomatis tersimpan di Cloud Google (Chunked Properties + File JSON Drive)
//      tanpa batas ukuran 9KB dan langsung sinkron ke seluruh HP kru & device lain!
// 2. OTOMATIS BUAT SPREADSHEET 8 SHEET & FOLDER DRIVE SAAT TAMBAH CABANG BARU:
//    - Saat Admin menambah cabang baru di Web Admin, script ini otomatis membuat
//      file Google Spreadsheet baru (OhSnap_Spreadsheet_Cabang_<NamaCabang>)
//      lengkap dengan 8 Sheet (Absen_Masuk, Absen_Keluar, Laporan_Harian,
//      Rekap_Pengeluaran, Stock_Opname, Barang_Datang, open_Store, Close_Store)
//      serta subfolder foto Cabang_<NamaCabang> di Google Drive!
// 3. PROTEKSI ANTI KLIK 2X (SERVER-SIDE DEDUPLICATION)
// ============================================================================

var SPREADSHEET_ID_PUSAT = '1YuG4fd5DzIbgye0i7DzTzugqtj_rDlap5-6a4qizLik';
var FOLDER_ABSEN_ID = '1YPsH4RmsrfPdqFZUN5A2vmszt_ZyKvUH';
var FOLDER_ABSEN_NAMA = 'Oh Snap 5 Cabang - Pusat Folder Foto Laporan & Spreadsheet';
var CLOUD_CONFIG_FILENAME = 'OhSnap_Cloud_Config_Pusat.json';

var REPORT_PHOTO_FOLDER_NAMES = {
  'ABSEN_MASUK':   'Folder_Absensi',
  'ABSEN_PULANG':  'Folder_Absensi',
  'ABSENSI':       'Folder_Absensi',
  'SERAH_TERIMA':  'Folder_Pemasukan_Laporan_Harian',
  'PEMASUKAN':     'Folder_Pemasukan_Laporan_Harian',
  'STRUK_BELANJA': 'Folder_Struk_Belanja_Pengeluaran',
  'OPEN_STORE':    'Folder_Open_Store',
  'CLOSE_STORE':   'Folder_Close_Store'
};

var DAFTAR_5_CABANG_UTAMA = ['Majenang', 'Cilacap', 'Pekalongan', 'Pemalang', 'Kediri'];

// ============================================================================
// DAFTAR ID SPREADSHEET BERBEDA UNTUK TIAP CABANG
// - Biarkan kosong '' -> Script otomatis membuatkan file Spreadsheet terpisah
//   di Folder Google Drive Anda untuk masing-masing cabang (termasuk cabang baru)!
// ============================================================================
var BRANCH_SPREADSHEET_IDS = {
  'Majenang': '',
  'Cilacap': '',
  'Pekalongan': '',
  'Pemalang': '',
  'Kediri': ''
};

// Urutan & Nama Persis 8 Sheet Template di Setiap Spreadsheet Cabang
var TEMPLATE_8_SHEET_NAMES = [
  'Absen_Masuk',
  'Absen_Keluar',
  'Laporan_Harian',
  'Rekap_Pengeluaran',
  'Stock_Opname',
  'Barang_Datang',
  'open_Store',
  'Close_Store'
];

function getFolderAbsen() {
  try {
    return DriveApp.getFolderById(FOLDER_ABSEN_ID);
  } catch (e) {
    var folders = DriveApp.getFoldersByName(FOLDER_ABSEN_NAMA);
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder(FOLDER_ABSEN_NAMA);
  }
}

function getOrCreateSubFolder(parentFolder, subFolderName) {
  var cleanName = String(subFolderName || 'Lainnya').trim();
  var iter = parentFolder.getFoldersByName(cleanName);
  if (iter.hasNext()) return iter.next();
  return parentFolder.createFolder(cleanName);
}

function getActiveBranchNamesList(extraCabangName) {
  var listCabang = DAFTAR_5_CABANG_UTAMA.slice();
  try {
    var cfg = loadCloudConfigFromChunks(true);
    if (cfg && cfg.branches && cfg.branches.length > 0) {
      for (var i = 0; i < cfg.branches.length; i++) {
        var bn = String(cfg.branches[i] || '').trim();
        if (bn && listCabang.indexOf(bn) === -1) {
          listCabang.push(bn);
        }
      }
    }
  } catch (e) {}
  if (extraCabangName) {
    var cleanExtra = String(extraCabangName).trim();
    if (cleanExtra && listCabang.indexOf(cleanExtra) === -1) {
      listCabang.push(cleanExtra);
    }
  }
  return listCabang;
}

// Pastikan di dalam Folder Kategori selalu tersedia Subfolder untuk semua Cabang aktif
function ensureAll5BranchSubFolders(kategoriFolder, extraCabangName) {
  var listCabang = getActiveBranchNamesList(extraCabangName);
  var targetBranchFolder = kategoriFolder;
  for (var i = 0; i < listCabang.length; i++) {
    var bName = listCabang[i];
    var sub = getOrCreateSubFolder(kategoriFolder, 'Cabang_' + bName);
    if (extraCabangName && String(extraCabangName).trim().toLowerCase() === bName.toLowerCase()) {
      targetBranchFolder = sub;
    }
  }
  return targetBranchFolder;
}

// Ambil / Buat Folder Kategori Laporan + Otomatis Subfolder Cabang di dalamnya
function getFolderFotoByKategoriLaporan(kategoriKey, cabangName) {
  var rootFolder = getFolderAbsen();
  var folderTitle = REPORT_PHOTO_FOLDER_NAMES[kategoriKey] || ('Folder_' + String(kategoriKey || 'Laporan'));
  var kategoriFolder = getOrCreateSubFolder(rootFolder, folderTitle);
  if (cabangName) {
    return ensureAll5BranchSubFolders(kategoriFolder, cabangName);
  }
  ensureAll5BranchSubFolders(kategoriFolder, '');
  return kategoriFolder;
}

// Pastikan kelima folder kategori memiliki subfolder Cabang_<cabangName> saat cabang baru ditambahkan
function ensureBranchPhotoFoldersForSingleBranch(cabangName) {
  var cleanCabang = String(cabangName || '').trim();
  if (!cleanCabang) return;
  var rootFolder = getFolderAbsen();
  var kategoriKeys = ['ABSENSI', 'SERAH_TERIMA', 'STRUK_BELANJA', 'OPEN_STORE', 'CLOSE_STORE'];
  for (var k = 0; k < kategoriKeys.length; k++) {
    var folderTitle = REPORT_PHOTO_FOLDER_NAMES[kategoriKeys[k]];
    var katFolder = getOrCreateSubFolder(rootFolder, folderTitle);
    getOrCreateSubFolder(katFolder, 'Cabang_' + cleanCabang);
  }
}

function extractSpreadsheetIdFromInput(rawVal) {
  if (!rawVal) return '';
  var str = String(rawVal).trim();
  if (!str || str === 'AUTO') return '';
  var match = str.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return str;
}

function getBranchPropKey(cabangName) {
  return 'OHSNAP_BRANCH_SS_' + String(cabangName || 'CILACAP').trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

function getTemplateHeadersBySheetName(sheetName) {
  if (sheetName === 'Absen_Masuk') {
    return [
      'Timestamp', 'Tanggal', 'Jam Absen Masuk', 'Cabang', 'Nama Karyawan',
      'Shift', 'Jadwal Jam Kerja', 'Status Ketepatan (Tepat Waktu / Telat)',
      'Detail Keterlambatan', 'Koordinat GPS & Waktu',
      'Link Foto Kamera Absen Masuk', 'Folder Absensi Cabang (Google Drive)', 'Catatan'
    ];
  }
  if (sheetName === 'Absen_Keluar') {
    return [
      'Timestamp', 'Tanggal', 'Jam Absen Keluar', 'Cabang', 'Nama Karyawan',
      'Shift', 'Jadwal Jam Kerja', 'Status Jam Kerja (Tepat Waktu / Belum Memenuhi Jam Kerja)',
      'Detail Kekurangan Jam Kerja', 'Koordinat GPS & Waktu',
      'Link Foto Kamera Absen Keluar', 'Folder Absensi Cabang (Google Drive)', 'Catatan'
    ];
  }
  if (sheetName === 'Laporan_Harian') {
    return [
      'Timestamp', 'Tanggal', 'Jam Input', 'Cabang', 'Shift', 'Nama Kasir / Staf',
      'Pemasukan Cash (Rp)', 'Pemasukan QRIS (Rp)', 'Pemasukan Total Harian Kotor (Rp)',
      'Total Pengeluaran Kas (Rp)', 'Rincian Pengeluaran (Lihat Rekap_Pengeluaran)',
      'Total Pemasukan Harian Bersih (Rp)',
      'Link Foto Pemasukan / Serah Terima (Wajib)', 'Folder Foto Pemasukan Cabang',
      'Link Foto Struk Belanja (Opsional)', 'Folder Foto Struk Belanja Cabang', 'Catatan'
    ];
  }
  if (sheetName === 'Rekap_Pengeluaran') {
    return [
      'Timestamp', 'Tanggal', 'Jam Input', 'Cabang', 'Shift', 'Nama Kasir / Staf',
      'Nama Item Pengeluaran (Beli Tisu, Air, dll.)', 'Nominal Item Pengeluaran (Rp)',
      'Total Pengeluaran Shift (Rp)', 'Link Foto Struk Belanja',
      'Folder Foto Struk Belanja Cabang', 'Catatan Shift'
    ];
  }
  if (sheetName === 'Stock_Opname') {
    return [
      'Timestamp', 'Cabang', 'Peran Pengirim', 'Tanggal Input', 'Tanggal Cutoff', 'Jam Input',
      'Shift', 'Nama Petugas', 'Petugas Membantu (Opsional)',
      '[BRG-001] Kertas (Pax)', '[BRG-002] Hangtag Kecil (Pcs)', '[BRG-003] Hangtag Besar (Pcs)',
      '[BRG-004] Keychain Panjang (Pcs)', '[BRG-005] Keychain Bulat (Pcs)',
      '[BRG-006] Plastik Kecil (Ikat)', '[BRG-007] Plastik Besar (Ikat)',
      '[BRG-008] Tinta LM (%)', '[BRG-009] Tinta LC (%)', '[BRG-010] Tinta Y (%)',
      '[BRG-011] Tinta M (%)', '[BRG-012] Tinta C (%)', '[BRG-013] Tinta K (%)',
      '[BRG-014] Lem Ganci (Pcs)', 'Barang Tambahan (Jika Ada)', 'Catatan'
    ];
  }
  if (sheetName === 'Barang_Datang') {
    return [
      'Timestamp', 'Cabang', 'Peran Pengirim', 'Tanggal Input', 'Tanggal Barang Datang', 'Jam Input',
      'Shift', 'Nama Petugas', 'Petugas Membantu',
      'Kode Barang', 'Nama Barang', 'Jenis Barang', 'Satuan (Botol/Pax/Pcs/Ikat)',
      'Stok Awal', 'Jumlah Masuk (+)', 'Stok Akhir', 'Ringkasan Laporan', 'Catatan / Pengirim'
    ];
  }
  if (sheetName === 'open_Store') {
    return [
      'Timestamp', 'Tanggal', 'Jam Open Store', 'Cabang', 'Shift', 'Jadwal Jam Kerja',
      'Nama Karyawan', 'Daftar Ceklis Alat Open Store', 'Koordinat GPS & Waktu',
      'Link Foto Open Store', 'Folder Foto Open Store Cabang', 'Catatan'
    ];
  }
  if (sheetName === 'Close_Store') {
    return [
      'Timestamp', 'Tanggal', 'Jam Close Store', 'Cabang', 'Shift', 'Jadwal Jam Kerja',
      'Nama Karyawan', 'Jumlah Foto Close Store', 'Daftar Ceklis Alat Close Store',
      'Koordinat GPS & Waktu', 'Link Foto Close Store (2 Foto / 7 Foto Kediri)',
      'Folder Foto Close Store Cabang', 'Catatan'
    ];
  }
  return ['Timestamp', 'Cabang', 'Data'];
}

// Pastikan Spreadsheet Cabang memiliki 8 Sheet sesuai foto & hapus Sheet1 kosong bawaan
function ensureBranch8SheetsTemplate(ss) {
  if (!ss) return;
  for (var i = 0; i < TEMPLATE_8_SHEET_NAMES.length; i++) {
    var sName = TEMPLATE_8_SHEET_NAMES[i];
    var sh = ss.getSheetByName(sName);
    if (!sh) {
      sh = ss.insertSheet(sName);
    }
    if (sh.getLastRow() === 0) {
      var headers = getTemplateHeadersBySheetName(sName);
      sh.appendRow(headers);
      sh.setFrozenRows(1);
      try {
        var headerRange = sh.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#fce7f3');
        headerRange.setFontColor('#19449a');
      } catch (styleErr) {}
    }
  }
  var defaultSheets = ['Sheet1', 'Lembar1', 'Sheet 1', 'Lembar 1'];
  for (var d = 0; d < defaultSheets.length; d++) {
    var defSh = ss.getSheetByName(defaultSheets[d]);
    if (defSh && ss.getSheets().length > TEMPLATE_8_SHEET_NAMES.length && defSh.getLastRow() === 0) {
      try {
        ss.deleteSheet(defSh);
      } catch (delErr) {}
    }
  }
}

// Buka atau buat Spreadsheet khusus untuk Cabang tertentu (Otomatis Buat di Google Drive!)
function getOrCreateBranchSpreadsheet(cabangName, customSpreadsheetIdFromWeb) {
  var cleanCabang = String(cabangName || 'Cilacap').trim();
  var configuredId = extractSpreadsheetIdFromInput(customSpreadsheetIdFromWeb) ||
                     extractSpreadsheetIdFromInput(BRANCH_SPREADSHEET_IDS[cleanCabang]);

  var props = PropertiesService.getScriptProperties();
  var propKey = getBranchPropKey(cleanCabang);

  var ssBranch = null;
  if (configuredId) {
    try {
      ssBranch = SpreadsheetApp.openById(configuredId);
      if (ssBranch) {
        props.setProperty(propKey, ssBranch.getId());
      }
    } catch (e) {
      ssBranch = null;
    }
  }

  if (!ssBranch) {
    var savedId = props.getProperty(propKey);
    if (savedId) {
      try {
        ssBranch = SpreadsheetApp.openById(savedId);
      } catch (e2) {
        ssBranch = null;
      }
    }

    if (!ssBranch) {
      var folder = getFolderAbsen();
      var fileName = 'OhSnap_Spreadsheet_Cabang_' + cleanCabang;
      var files = folder.getFilesByName(fileName);
      if (files.hasNext()) {
        ssBranch = SpreadsheetApp.open(files.next());
      } else {
        ssBranch = SpreadsheetApp.create(fileName);
        try {
          var fileObj = DriveApp.getFileById(ssBranch.getId());
          folder.addFile(fileObj);
        } catch (moveErr) {}
      }
      if (ssBranch) {
        props.setProperty(propKey, ssBranch.getId());
      }
    }
  }

  ensureBranch8SheetsTemplate(ssBranch);
  return ssBranch;
}

// ============================================================================
// SISTEM PENYIMPANAN CLOUD CONFIG TANPA BATAS 9KB (CHUNKED PROPERTIES + DRIVE)
// ============================================================================
function saveCloudConfigToChunks(rawJsonString, writeDriveBackup) {
  if (!rawJsonString) return;
  var props = PropertiesService.getScriptProperties();
  var chunkSize = 3800; // Aman di bawah batas 9KB per property Google Apps Script
  var totalChunks = Math.ceil(rawJsonString.length / chunkSize);
  var batch = {};
  for (var i = 0; i < totalChunks; i++) {
    batch['OHSNAP_CFG_CHUNK_' + i] = rawJsonString.substring(i * chunkSize, (i + 1) * chunkSize);
  }
  batch['OHSNAP_CFG_CHUNK_COUNT'] = String(totalChunks);
  batch['OHSNAP_CFG_UPDATED_AT'] = String(new Date().getTime());
  if (rawJsonString.length < 8500) {
    batch['OHSNAP_CLOUD_CONFIG_JSON'] = rawJsonString;
  }
  props.setProperties(batch, false);

  if (writeDriveBackup) {
    try {
      var folder = getFolderAbsen();
      var files = folder.getFilesByName(CLOUD_CONFIG_FILENAME);
      if (files.hasNext()) {
        var existingFile = files.next();
        existingFile.setContent(rawJsonString);
      } else {
        folder.createFile(CLOUD_CONFIG_FILENAME, rawJsonString, MimeType.PLAIN_TEXT);
      }
    } catch (driveErr) {}
  }
}

function loadCloudConfigFromChunks(skipDriveFallback) {
  var props = PropertiesService.getScriptProperties();
  var countStr = props.getProperty('OHSNAP_CFG_CHUNK_COUNT');
  var raw = '';
  if (countStr && Number(countStr) > 0) {
    var count = Number(countStr);
    var parts = [];
    for (var i = 0; i < count; i++) {
      parts.push(props.getProperty('OHSNAP_CFG_CHUNK_' + i) || '');
    }
    raw = parts.join('');
  }
  if (!raw) {
    raw = props.getProperty('OHSNAP_CLOUD_CONFIG_JSON') || '';
  }
  if (!raw && !skipDriveFallback) {
    try {
      var folder = getFolderAbsen();
      var files = folder.getFilesByName(CLOUD_CONFIG_FILENAME);
      if (files.hasNext()) {
        raw = files.next().getBlob().getDataAsString();
      }
    } catch (e) {}
  }
  if (!raw) return null;
  try {
    var parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      parsed.branchSpreadsheets = parsed.branchSpreadsheets || {};
      var bList = Array.isArray(parsed.branches) ? parsed.branches : DAFTAR_5_CABANG_UTAMA;
      for (var j = 0; j < bList.length; j++) {
        var bName = bList[j];
        var pKey = getBranchPropKey(bName);
        var savedSsId = props.getProperty(pKey) || '';
        if (savedSsId && (!parsed.branchSpreadsheets[bName] || !parsed.branchSpreadsheets[bName].spreadsheetId)) {
          parsed.branchSpreadsheets[bName] = {
            spreadsheetId: savedSsId,
            spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + savedSsId + '/edit',
            updatedAt: new Date().toISOString()
          };
        }
      }
    }
    return parsed;
  } catch (err) {
    return null;
  }
}


// ============================================================================
// FITUR OTOMATIS HAPUS BARIS SPREADSHEET & FILE FOTO GOOGLE DRIVE SAAT DIHAPUS DI WEB ADMIN
// ============================================================================
function normalizeGsDateCell(rawVal, displayVal) {
  if (rawVal && Object.prototype.toString.call(rawVal) === '[object Date]' && !isNaN(rawVal.getTime())) {
    try {
      return Utilities.formatDate(rawVal, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd');
    } catch (e) {}
  }
  var s = String(displayVal || rawVal || '').trim();
  if (!s) return '';
  var mIso = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (mIso) {
    return mIso[1] + '-' + ('0' + mIso[2]).slice(-2) + '-' + ('0' + mIso[3]).slice(-2);
  }
  var mDmy = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (mDmy) {
    return mDmy[3] + '-' + ('0' + mDmy[2]).slice(-2) + '-' + ('0' + mDmy[1]).slice(-2);
  }
  return s.slice(0, 10);
}

function normalizeGsTimePrefix(rawVal, displayVal) {
  if (rawVal && Object.prototype.toString.call(rawVal) === '[object Date]' && !isNaN(rawVal.getTime())) {
    try {
      return Utilities.formatDate(rawVal, Session.getScriptTimeZone() || 'Asia/Jakarta', 'HH:mm');
    } catch (e) {}
  }
  var s = String(displayVal || rawVal || '').replace(/WIB/i, '').trim().replace(/\./g, ':');
  var m = s.match(/(\d{1,2}):(\d{2})/);
  if (m) {
    return ('0' + m[1]).slice(-2) + ':' + m[2];
  }
  return '';
}

function trashDriveFilesFromUrlText(urlText) {
  var trashedCount = 0;
  if (!urlText) return 0;
  var str = String(urlText);
  var regexFileD = /\/file\/d\/([a-zA-Z0-9_-]{15,})/g;
  var match;
  var seenIds = {};
  while ((match = regexFileD.exec(str)) !== null) {
    var fId = match[1];
    if (fId && !seenIds[fId]) {
      seenIds[fId] = true;
      try {
        DriveApp.getFileById(fId).setTrashed(true);
        trashedCount++;
      } catch (e1) {}
    }
  }
  var regexParamId = /[?&]id=([a-zA-Z0-9_-]{15,})/g;
  while ((match = regexParamId.exec(str)) !== null) {
    var fId2 = match[1];
    if (fId2 && !seenIds[fId2]) {
      seenIds[fId2] = true;
      try {
        DriveApp.getFileById(fId2).setTrashed(true);
        trashedCount++;
      } catch (e2) {}
    }
  }
  return trashedCount;
}

function trashMatchingPhotoFilesInBranchDriveFolders(itemMeta) {
  var trashed = 0;
  if (!itemMeta) return 0;
  var cabang = String(itemMeta.cabang || 'Cilacap').trim();
  var tanggal = String(itemMeta.tanggal || itemMeta.cutoffDate || itemMeta.incomingDate || '').trim();
  var nama = String(itemMeta.nama || '').trim();
  var recType = String(itemMeta.recordType || '').trim();
  if (!tanggal) return 0;

  var targetFolderKeys = [];
  if (recType === 'DAILY_REPORT') {
    if (itemMeta.photoField === 'fotoSerahTerima') {
      targetFolderKeys = ['SERAH_TERIMA'];
    } else if (itemMeta.photoField === 'fotoStruk') {
      targetFolderKeys = ['STRUK_BELANJA'];
    } else {
      targetFolderKeys = ['SERAH_TERIMA', 'STRUK_BELANJA'];
    }
  } else if (recType === 'OPEN_STORE') {
    targetFolderKeys = ['OPEN_STORE'];
  } else if (recType === 'CLOSE_STORE') {
    targetFolderKeys = ['CLOSE_STORE'];
  } else if (recType === 'ABSEN_MUKA') {
    targetFolderKeys = ['ABSENSI'];
  } else {
    targetFolderKeys = ['ABSENSI', 'OPEN_STORE', 'CLOSE_STORE', 'SERAH_TERIMA', 'STRUK_BELANJA'];
  }

  for (var k = 0; k < targetFolderKeys.length; k++) {
    try {
      var branchFolder = getFolderFotoByKategoriLaporan(targetFolderKeys[k], cabang);
      if (!branchFolder) continue;
      var filesIter = branchFolder.getFiles();
      while (filesIter.hasNext()) {
        var f = filesIter.next();
        var fName = String(f.getName() || '');
        var hasDateAndBranch = fName.indexOf(tanggal) !== -1 && fName.toLowerCase().indexOf(cabang.toLowerCase()) !== -1;
        var hasNama = !nama || fName.toLowerCase().indexOf(nama.toLowerCase()) !== -1 || fName.indexOf('OPEN_') === 0 || fName.indexOf('CLOSE_') === 0;
        if (hasDateAndBranch && hasNama) {
          try {
            f.setTrashed(true);
            trashed++;
          } catch (errF) {}
        }
      }
    } catch (errKat) {}
  }
  return trashed;
}

function deleteSingleRecordFromBranchSpreadsheetAndDrive(itemMeta) {
  if (!itemMeta || typeof itemMeta !== 'object') return { deletedRows: 0, trashedFiles: 0 };
  var cabang = String(itemMeta.cabang || 'Cilacap').trim();
  var targetDate = normalizeGsDateCell(null, itemMeta.tanggal || itemMeta.cutoffDate || itemMeta.incomingDate || '');
  var targetCutoff = normalizeGsDateCell(null, itemMeta.cutoffDate || itemMeta.tanggal || '');
  var targetIncoming = normalizeGsDateCell(null, itemMeta.incomingDate || itemMeta.tanggal || '');
  var targetTimePrefix = normalizeGsTimePrefix(null, itemMeta.waktu || '');
  var targetNama = String(itemMeta.nama || '').trim().toLowerCase();
  var recType = String(itemMeta.recordType || '').trim();
  var subType = String(itemMeta.subType || '').trim();
  var onlyPhoto = Boolean(itemMeta.onlyDeletePhoto);

  var deletedRowsCount = 0;
  var trashedFilesCount = 0;

  // 1. Hapus file foto yang cocok di Google Drive Subfolder Cabang
  trashedFilesCount += trashMatchingPhotoFilesInBranchDriveFolders(itemMeta);

  // 2. Cari dan hapus baris (atau kosongkan link foto) di Google Spreadsheet Cabang
  var ss = null;
  try {
    ss = getOrCreateBranchSpreadsheet(cabang, itemMeta.branchSpreadsheetId || '');
  } catch (eSs) {
    ss = null;
  }
  if (!ss) return { deletedRows: deletedRowsCount, trashedFiles: trashedFilesCount };

  var sheetsToScan = [];
  if (recType === 'DAILY_REPORT') {
    sheetsToScan = ['Laporan_Harian', 'Rekap_Pengeluaran'];
  } else if (recType === 'STOCK_OPNAME') {
    sheetsToScan = ['Stock_Opname'];
  } else if (recType === 'BARANG_DATANG') {
    sheetsToScan = ['Barang_Datang'];
  } else if (recType === 'OPEN_STORE') {
    sheetsToScan = ['open_Store', 'Absen_Masuk'];
  } else if (recType === 'CLOSE_STORE') {
    sheetsToScan = ['Close_Store', 'Absen_Keluar'];
  } else if (recType === 'ABSEN_MUKA') {
    sheetsToScan = (subType === 'MUKA_PULANG' || subType === 'CLOSE_MUKA')
      ? ['Absen_Keluar', 'Absen_Masuk']
      : ['Absen_Masuk', 'Absen_Keluar'];
  } else {
    sheetsToScan = TEMPLATE_8_SHEET_NAMES.slice();
  }

  for (var sIdx = 0; sIdx < sheetsToScan.length; sIdx++) {
    var shName = sheetsToScan[sIdx];
    var sh = ss.getSheetByName(shName);
    if (!sh) continue;
    var lastRow = sh.getLastRow();
    if (lastRow <= 1) continue;

    var range = sh.getDataRange();
    var rawValues = range.getValues();
    var dispValues = range.getDisplayValues();

    // Iterasi dari baris paling bawah ke atas (baris 2) agar penghapusan baris tidak menggeser indeks di atasnya
    for (var r = lastRow - 1; r >= 1; r--) {
      var rawRow = rawValues[r];
      var dispRow = dispValues[r];
      var rowJoined = dispRow.join(' | ');

      var rowDate1 = '';
      var rowDate2 = '';
      var rowTimePref = '';
      var rowNama = '';
      var rowCabang = '';

      if (shName === 'Stock_Opname' || shName === 'Barang_Datang') {
        // Kolom: [0]Timestamp, [1]Cabang, [2]Peran, [3]Tanggal Input, [4]Tanggal Cutoff/Datang, [5]Jam Input, [6]Shift, [7]Nama Petugas
        rowCabang = String(dispRow[1] || '').trim().toLowerCase();
        rowDate1 = normalizeGsDateCell(rawRow[3], dispRow[3]);
        rowDate2 = normalizeGsDateCell(rawRow[4], dispRow[4]);
        rowTimePref = normalizeGsTimePrefix(rawRow[5], dispRow[5]);
        rowNama = String(dispRow[7] || '').trim().toLowerCase();
      } else if (shName === 'open_Store' || shName === 'Close_Store') {
        // Kolom: [0]Timestamp, [1]Tanggal, [2]Jam, [3]Cabang, [4]Shift, [5]Jadwal, [6]Nama Karyawan
        rowDate1 = normalizeGsDateCell(rawRow[1], dispRow[1]);
        rowDate2 = rowDate1;
        rowTimePref = normalizeGsTimePrefix(rawRow[2], dispRow[2]);
        rowCabang = String(dispRow[3] || '').trim().toLowerCase();
        rowNama = String(dispRow[6] || '').trim().toLowerCase();
      } else if (shName === 'Laporan_Harian' || shName === 'Rekap_Pengeluaran') {
        // Kolom: [0]Timestamp, [1]Tanggal, [2]Jam Input, [3]Cabang, [4]Shift, [5]Nama Kasir
        rowDate1 = normalizeGsDateCell(rawRow[1], dispRow[1]);
        rowDate2 = rowDate1;
        rowTimePref = normalizeGsTimePrefix(rawRow[2], dispRow[2]);
        rowCabang = String(dispRow[3] || '').trim().toLowerCase();
        rowNama = String(dispRow[5] || '').trim().toLowerCase();
      } else {
        // Absen_Masuk & Absen_Keluar: [0]Timestamp, [1]Tanggal, [2]Jam Absen, [3]Cabang, [4]Nama Karyawan
        rowDate1 = normalizeGsDateCell(rawRow[1], dispRow[1]);
        rowDate2 = rowDate1;
        rowTimePref = normalizeGsTimePrefix(rawRow[2], dispRow[2]);
        rowCabang = String(dispRow[3] || '').trim().toLowerCase();
        rowNama = String(dispRow[4] || '').trim().toLowerCase();
      }

      var dateMatched = !targetDate ||
                        rowDate1 === targetDate || rowDate2 === targetDate ||
                        (targetCutoff && (rowDate1 === targetCutoff || rowDate2 === targetCutoff)) ||
                        (targetIncoming && (rowDate1 === targetIncoming || rowDate2 === targetIncoming));
      var cabangMatched = !cabang || !rowCabang || rowCabang === cabang.toLowerCase();
      var namaMatched = !targetNama || !rowNama || rowNama === targetNama;
      var timeMatched = !targetTimePrefix || !rowTimePref || rowTimePref === targetTimePrefix;

      if (dateMatched && cabangMatched && namaMatched && timeMatched) {
        // Hapus juga file foto di Google Drive berdasarkan link yang tertulis di baris Spreadsheet ini
        trashedFilesCount += trashDriveFilesFromUrlText(rowJoined);

        if (onlyPhoto) {
          // Jika hanya menghapus foto, kosongkan sel link foto di baris Spreadsheet
          if (shName === 'Laporan_Harian') {
            if (!itemMeta.photoField || itemMeta.photoField === 'fotoSerahTerima') sh.getRange(r + 1, 13).setValue('- (Foto Dihapus)');
            if (!itemMeta.photoField || itemMeta.photoField === 'fotoStruk') sh.getRange(r + 1, 15).setValue('- (Foto Dihapus)');
          } else if (shName === 'Rekap_Pengeluaran') {
            sh.getRange(r + 1, 10).setValue('- (Foto Dihapus)');
          } else if (shName === 'open_Store') {
            sh.getRange(r + 1, 10).setValue('- (Foto Dihapus)');
          } else if (shName === 'Close_Store' || shName === 'Absen_Masuk' || shName === 'Absen_Keluar') {
            sh.getRange(r + 1, 11).setValue('- (Foto Dihapus)');
          }
        } else {
          sh.deleteRow(r + 1);
          deletedRowsCount++;
        }
      }
    }
  }

  return { deletedRows: deletedRowsCount, trashedFiles: trashedFilesCount };
}

function handleAdminDeleteRecordsFromWeb(payloadObj) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) {}
  try {
    var items = (payloadObj && Array.isArray(payloadObj.deletedItems)) ? payloadObj.deletedItems : [];
    var delIds = (payloadObj && Array.isArray(payloadObj.deletedOpLogIds)) ? payloadObj.deletedOpLogIds : [];
    var totalDeletedRows = 0;
    var totalTrashedFiles = 0;

    for (var i = 0; i < items.length; i++) {
      var res = deleteSingleRecordFromBranchSpreadsheetAndDrive(items[i]);
      totalDeletedRows += (res.deletedRows || 0);
      totalTrashedFiles += (res.trashedFiles || 0);
      if (items[i] && items[i].id && !items[i].onlyDeletePhoto) {
        var sId = String(items[i].id).trim();
        if (sId && delIds.indexOf(sId) === -1) delIds.push(sId);
      }
    }

    // Update Cloud Config agar ID yang dihapus tidak pernah muncul lagi di device mana pun
    if (delIds.length > 0) {
      var existingCfg = loadCloudConfigFromChunks(false) || {};
      var unionDel = Array.isArray(existingCfg.deletedOpLogIds) ? existingCfg.deletedOpLogIds.slice() : [];
      for (var d = 0; d < delIds.length; d++) {
        var idStr = String(delIds[d] || '').trim();
        if (idStr && unionDel.indexOf(idStr) === -1) unionDel.push(idStr);
      }
      existingCfg.deletedOpLogIds = unionDel.slice(-300);
      if (Array.isArray(existingCfg.opLogsSummary)) {
        existingCfg.opLogsSummary = existingCfg.opLogsSummary.filter(function(x) {
          return x && existingCfg.deletedOpLogIds.indexOf(String(x.id)) === -1;
        });
      }
      existingCfg.updatedAt = new Date().getTime();
      saveCloudConfigToChunks(JSON.stringify(existingCfg), false);
    }

    return JSON.stringify({
      status: 'success',
      action: 'delete_records',
      deletedSpreadsheetRows: totalDeletedRows,
      trashedDrivePhotos: totalTrashedFiles
    });
  } catch (err) {
    return JSON.stringify({
      status: 'error',
      message: err.toString()
    });
  } finally {
    try { lock.releaseLock(); } catch (eLock) {}
  }
}

function handleAdminConfigSync(payloadObj) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) {}
  try {
    var incomingCfg = (payloadObj && payloadObj.cloudConfig) ? payloadObj.cloudConfig : payloadObj;
    if (!incomingCfg || typeof incomingCfg !== 'object') {
      incomingCfg = {};
    }
    var existingCfg = loadCloudConfigFromChunks(false) || {};
    var mergedCfg = {};
    var k;
    for (k in existingCfg) { mergedCfg[k] = existingCfg[k]; }
    for (k in incomingCfg) {
      if (incomingCfg[k] !== undefined) {
        mergedCfg[k] = incomingCfg[k];
      }
    }
    // Gabungkan deletedOpLogIds (Union) agar data yang sudah dihapus Admin tidak pernah muncul kembali dari device lain
    var unionDelIds = [];
    var existingDel = Array.isArray(existingCfg.deletedOpLogIds) ? existingCfg.deletedOpLogIds : [];
    var incomingDel = Array.isArray(incomingCfg.deletedOpLogIds) ? incomingCfg.deletedOpLogIds : [];
    for (var d1 = 0; d1 < existingDel.length; d1++) {
      var id1 = String(existingDel[d1] || '').trim();
      if (id1 && unionDelIds.indexOf(id1) === -1) unionDelIds.push(id1);
    }
    for (var d2 = 0; d2 < incomingDel.length; d2++) {
      var id2 = String(incomingDel[d2] || '').trim();
      if (id2 && unionDelIds.indexOf(id2) === -1) unionDelIds.push(id2);
    }
    if (unionDelIds.length > 300) {
      unionDelIds = unionDelIds.slice(unionDelIds.length - 300);
    }
    mergedCfg.deletedOpLogIds = unionDelIds;

    // Gabungkan opLogsSummary lintas device berdasarkan ID dan saring semua ID yang sudah dihapus
    var combinedLogs = [];
    var seenLogIds = {};
    var incLogs = Array.isArray(incomingCfg.opLogsSummary) ? incomingCfg.opLogsSummary : [];
    var extLogs = Array.isArray(existingCfg.opLogsSummary) ? existingCfg.opLogsSummary : [];
    var allSourceLogs = incLogs.concat(extLogs);
    for (var lIdx = 0; lIdx < allSourceLogs.length; lIdx++) {
      var itemLog = allSourceLogs[lIdx];
      if (!itemLog || !itemLog.id) continue;
      var sLogId = String(itemLog.id).trim();
      if (!sLogId || unionDelIds.indexOf(sLogId) !== -1 || seenLogIds[sLogId]) continue;
      seenLogIds[sLogId] = true;
      combinedLogs.push(itemLog);
    }
    mergedCfg.opLogsSummary = combinedLogs.slice(0, 80);
    mergedCfg.updatedAt = incomingCfg.updatedAt || new Date().getTime();
    mergedCfg.branchSpreadsheets = mergedCfg.branchSpreadsheets || {};

    var createBranchName = String((payloadObj && payloadObj.createBranchName) || '').trim();
    var ensureAll = Boolean(payloadObj && payloadObj.ensureAllBranchSpreadsheets);
    var createdSsId = '';
    var createdSsUrl = '';

    var activeBranches = Array.isArray(mergedCfg.branches) && mergedCfg.branches.length > 0
      ? mergedCfg.branches.slice()
      : DAFTAR_5_CABANG_UTAMA.slice();

    if (createBranchName && activeBranches.indexOf(createBranchName) === -1) {
      activeBranches.push(createBranchName);
      mergedCfg.branches = activeBranches;
    }

    var props = PropertiesService.getScriptProperties();

    // 1. Jika ada cabang baru yang ditambahkan dari Web Admin -> langsung buatkan Spreadsheet 8 Sheet & Folder Foto di Drive!
    if (createBranchName) {
      var customIdNew = (mergedCfg.branchSpreadsheets[createBranchName] && mergedCfg.branchSpreadsheets[createBranchName].spreadsheetId) || '';
      var ssCreated = getOrCreateBranchSpreadsheet(createBranchName, customIdNew);
      ensureBranchPhotoFoldersForSingleBranch(createBranchName);
      if (ssCreated) {
        createdSsId = ssCreated.getId();
        createdSsUrl = ssCreated.getUrl();
        mergedCfg.branchSpreadsheets[createBranchName] = {
          spreadsheetId: createdSsId,
          spreadsheetUrl: createdSsUrl,
          updatedAt: new Date().toISOString()
        };
      }
    }

    // 2. Pastikan seluruh cabang di daftar cabang memiliki link Spreadsheet (otomatis buat jika belum ada atau jika diminta)
    for (var i = 0; i < activeBranches.length; i++) {
      var bName = String(activeBranches[i] || '').trim();
      if (!bName) continue;
      var propKey = getBranchPropKey(bName);
      var existingEntry = mergedCfg.branchSpreadsheets[bName] || {};
      var knownId = extractSpreadsheetIdFromInput(existingEntry.spreadsheetId || existingEntry.spreadsheetUrl || '') || props.getProperty(propKey) || '';

      if (ensureAll || !knownId) {
        var ssB = getOrCreateBranchSpreadsheet(bName, knownId);
        if (ensureAll) {
          ensureBranchPhotoFoldersForSingleBranch(bName);
        }
        if (ssB) {
          knownId = ssB.getId();
          mergedCfg.branchSpreadsheets[bName] = {
            spreadsheetId: knownId,
            spreadsheetUrl: ssB.getUrl(),
            updatedAt: existingEntry.updatedAt || new Date().toISOString()
          };
        }
      } else if (knownId) {
        props.setProperty(propKey, knownId);
        mergedCfg.branchSpreadsheets[bName] = {
          spreadsheetId: knownId,
          spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + knownId + '/edit',
          updatedAt: existingEntry.updatedAt || new Date().toISOString()
        };
      }
    }

    // Jika sinkronisasi Admin menyertakan item laporan/foto yang baru dihapus, hapus juga di Spreadsheet & Google Drive!
    var pendingDeletedItems = (payloadObj && Array.isArray(payloadObj.deletedItems))
      ? payloadObj.deletedItems
      : (Array.isArray(incomingCfg.recentDeletedItems) ? incomingCfg.recentDeletedItems : []);
    if (pendingDeletedItems.length > 0) {
      for (var delIdx = 0; delIdx < pendingDeletedItems.length; delIdx++) {
        try {
          deleteSingleRecordFromBranchSpreadsheetAndDrive(pendingDeletedItems[delIdx]);
        } catch (delSheetErr) {}
      }
    }

    saveCloudConfigToChunks(JSON.stringify(mergedCfg), Boolean(createBranchName || ensureAll));

    return JSON.stringify({
      status: 'success',
      synced: true,
      version: 'v4_cloud_sync',
      createdBranch: createBranchName,
      createdSpreadsheetId: createdSsId,
      createdSpreadsheetUrl: createdSsUrl,
      branchSpreadsheets: mergedCfg.branchSpreadsheets,
      cloudConfig: mergedCfg
    });
  } catch (err) {
    return JSON.stringify({
      status: 'error',
      version: 'v4_cloud_sync',
      message: err.toString()
    });
  } finally {
    try { lock.releaseLock(); } catch (eLock) {}
  }
}

// ============================================================================
// JALANKAN FUNGSI INI SEKALI DI EDITOR APPS SCRIPT (KLIK "RUN / JALANKAN")
// ============================================================================
function setup5SpreadsheetCabangOtomatis() {
  var daftarCabang = getActiveBranchNamesList('');
  var kategoriKeys = ['ABSENSI', 'SERAH_TERIMA', 'STRUK_BELANJA', 'OPEN_STORE', 'CLOSE_STORE'];
  var folder = getFolderAbsen();
  Logger.log('=== MEMULAI SETUP SPREADSHEET CABANG (8 SHEET) & FOLDER FOTO PER CABANG ===');
  Logger.log('Folder Utama Google Drive: ' + folder.getUrl());

  for (var k = 0; k < kategoriKeys.length; k++) {
    var key = kategoriKeys[k];
    var mainKatFolder = getFolderFotoByKategoriLaporan(key, '');
    for (var c = 0; c < daftarCabang.length; c++) {
      getFolderFotoByKategoriLaporan(key, daftarCabang[c]);
    }
    Logger.log('Folder [' + REPORT_PHOTO_FOLDER_NAMES[key] + '] siap: ' + mainKatFolder.getUrl());
  }

  var existingCfg = loadCloudConfigFromChunks(false) || { branches: daftarCabang, branchSpreadsheets: {} };
  existingCfg.branchSpreadsheets = existingCfg.branchSpreadsheets || {};

  for (var i = 0; i < daftarCabang.length; i++) {
    var cb = daftarCabang[i];
    var ss = getOrCreateBranchSpreadsheet(cb, '');
    existingCfg.branchSpreadsheets[cb] = {
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      updatedAt: new Date().toISOString()
    };
    Logger.log((i + 1) + '. Spreadsheet Cabang ' + cb + ' -> ID: ' + ss.getId() + ' | Link: ' + ss.getUrl());
  }
  saveCloudConfigToChunks(JSON.stringify(existingCfg));
  Logger.log('=== SELESAI! Semua Folder Foto & Spreadsheet Cabang siap digunakan ===');
}

function tesTulisKeSpreadsheet() {
  setup5SpreadsheetCabangOtomatis();
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'get_config') {
    var cfg = loadCloudConfigFromChunks(false);
    var outObj = {
      status: 'success',
      version: 'v4_cloud_sync',
      cloudConfig: cfg
    };
    return ContentService.createTextOutput(JSON.stringify(outObj))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (e && e.parameter && e.parameter.action === 'create_branch') {
    var branchToMake = String(e.parameter.branch || '').trim();
    return ContentService.createTextOutput(handleAdminConfigSync({
      createBranchName: branchToMake,
      ensureAllBranchSpreadsheets: true
    })).setMimeType(ContentService.MimeType.JSON);
  }
  if (e && e.parameter && e.parameter.payload) {
    return ContentService.createTextOutput(simpanDariWebApp(e.parameter.payload))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('Koneksi Spreadsheet Cabang Terpisah (Template 8 Sheet & Cloud Sync V4) Oh Snap Photobox Aktif!');
}

function doPost(e) {
  var rawBody = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
  if (e && e.parameter && e.parameter.action === 'delete_records') {
    var delPayload = {};
    if (e.parameter.payload) {
      try { delPayload = JSON.parse(e.parameter.payload); } catch (eDel1) {}
    } else if (rawBody) {
      try { delPayload = JSON.parse(rawBody); } catch (eDel2) {}
    }
    return ContentService.createTextOutput(handleAdminDeleteRecordsFromWeb(delPayload))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (e && e.parameter && (e.parameter.action === 'save_config' || e.parameter.action === 'create_branch')) {
    var cfgRaw = (e.parameter && e.parameter.cloud_config) ? e.parameter.cloud_config : '';
    if (!cfgRaw && rawBody.indexOf('cloud_config=') === 0) {
      cfgRaw = decodeURIComponent(rawBody.substring('cloud_config='.length).replace(/\+/g, ' '));
    }
    var parsedPayload = {};
    if (cfgRaw) {
      try { parsedPayload = { cloudConfig: JSON.parse(cfgRaw) }; } catch (err1) {}
    } else if (rawBody) {
      try { parsedPayload = JSON.parse(rawBody); } catch (err2) {}
    }
    if (e.parameter.branch && !parsedPayload.createBranchName) {
      parsedPayload.createBranchName = String(e.parameter.branch).trim();
    }
    return ContentService.createTextOutput(handleAdminConfigSync(parsedPayload))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var raw = '';
  if (e && e.parameter && e.parameter.payload) {
    raw = e.parameter.payload;
  } else {
    raw = rawBody;
  }
  return ContentService.createTextOutput(simpanDariWebApp(raw))
    .setMimeType(ContentService.MimeType.JSON);
}

function simpanDariWebApp(jsonString) {
  try {
    var dPre = JSON.parse(jsonString);
    if (dPre && (dPre.recordType === 'ADMIN_DELETE_RECORDS' || dPre.action === 'delete_records')) {
      return handleAdminDeleteRecordsFromWeb(dPre);
    }
    if (dPre && (dPre.recordType === 'ADMIN_SYNC_CONFIG' || dPre.action === 'save_config' || dPre.recordType === 'CREATE_BRANCH_SPREADSHEET')) {
      return handleAdminConfigSync(dPre);
    }
  } catch (preErr) {}

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (lockErr) {}
  try {
    var d = JSON.parse(jsonString);
    var cabang = d.cabang || 'Cilacap';

    // PROTEKSI ANTI KLIK 2X / ANTI DUPLIKAT LAPORAN (SERVER-SIDE DEDUPLICATION)
    var rawDedup = d.dedupKey || [
      d.recordType || '',
      d.subType || '',
      cabang,
      d.tanggal || '',
      d.shift || '',
      d.nama || '',
      d.totalGross !== undefined ? d.totalGross : '',
      d.totalExpense !== undefined ? d.totalExpense : '',
      d.kertasPax !== undefined ? d.kertasPax : '',
      d.positiveSummary || '',
      d.checklistSummary || '',
      d.catatan || ''
    ].join('|');
    var digestBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, rawDedup);
    var hashHex = digestBytes.map(function(b) {
      var v = (b < 0 ? b + 256 : b).toString(16);
      return v.length === 1 ? '0' + v : v;
    }).join('');
    var cacheKey = 'OHSNAP_DEDUP_' + hashHex;
    var cache = CacheService.getScriptCache();
    if (cache && cache.get(cacheKey)) {
      return JSON.stringify({
        status: 'success',
        duplicateIgnored: true,
        message: 'Laporan duplikat (klik 2x) otomatis diabaikan agar tidak dobel di Spreadsheet.'
      });
    }
    if (cache) {
      cache.put(cacheKey, '1', 90);
    }
    var customBranchSsId = d.branchSpreadsheetId || '';

    // Buka / Buat Spreadsheet khusus milik cabang yang bersangkutan (Otomatis 8 Sheet)
    var ss = getOrCreateBranchSpreadsheet(cabang, customBranchSsId);

    // Jika laporan kru menyertakan update stok cabang atau log terbaru, sinkronkan ke Cloud Config
    if (d.updatedBranchStockForCabang || d.latestOpLogSummary) {
      try {
        var currentCfg = loadCloudConfigFromChunks(true);
        if (currentCfg && typeof currentCfg === 'object') {
          if (d.updatedBranchStockForCabang && typeof d.updatedBranchStockForCabang === 'object') {
            currentCfg.branchStockInventory = currentCfg.branchStockInventory || {};
            currentCfg.branchStockInventory[cabang] = d.updatedBranchStockForCabang;
          }
          if (d.latestOpLogSummary && typeof d.latestOpLogSummary === 'object') {
            currentCfg.opLogsSummary = Array.isArray(currentCfg.opLogsSummary) ? currentCfg.opLogsSummary : [];
            var delIds = Array.isArray(currentCfg.deletedOpLogIds) ? currentCfg.deletedOpLogIds : [];
            currentCfg.opLogsSummary = currentCfg.opLogsSummary.filter(function(x) {
              return x && x.id !== d.latestOpLogSummary.id && delIds.indexOf(String(x.id)) === -1;
            });
            currentCfg.opLogsSummary.unshift(d.latestOpLogSummary);
            if (currentCfg.opLogsSummary.length > 80) {
              currentCfg.opLogsSummary = currentCfg.opLogsSummary.slice(0, 80);
            }
          }
          currentCfg.updatedAt = new Date().getTime();
          saveCloudConfigToChunks(JSON.stringify(currentCfg));
        }
      } catch (syncStockErr) {}
    }

    // Simpan foto ke dalam Folder Kategori -> Subfolder Cabang_<Cabang>
    function saveImgToReportFolder(base64, name, kategoriLaporanKey) {
      var targetFolder = getFolderFotoByKategoriLaporan(kategoriLaporanKey, cabang);
      var folderBranchUrl = targetFolder ? targetFolder.getUrl() : ('https://drive.google.com/drive/folders/' + FOLDER_ABSEN_ID);
      try {
        if (!base64 || base64.indexOf('base64,') === -1) {
          return { fileUrl: '-', folderUrl: folderBranchUrl };
        }
        var parts = base64.split('base64,');
        var contentType = parts[0].replace('data:', '').replace(';', '');
        var blob = Utilities.newBlob(Utilities.base64Decode(parts[1]), contentType, name);
        var createdFile = targetFolder.createFile(blob);
        return { fileUrl: createdFile.getUrl(), folderUrl: folderBranchUrl };
      } catch (imgErr) {
        return { fileUrl: 'Foto tersimpan di aplikasi (' + imgErr.message + ')', folderUrl: folderBranchUrl };
      }
    }

    // 1, 2, 7, 8: ABSEN_MASUK, ABSEN_KELUAR, open_Store, Close_Store
    if (d.recordType === 'ABSEN_MUKA' || d.recordType === 'OPEN_STORE' || d.recordType === 'CLOSE_STORE') {
      var isPulang = (d.subType === 'MUKA_PULANG' || d.subType === 'CLOSE_MUKA');
      var isMasuk = (d.subType === 'MUKA_DATANG' || d.subType === 'OPEN_MUKA' || d.subType === 'MASUK');
      var tipeDetail = d.tipeAbsenDetail || (d.recordType + '_' + (d.subType || ''));
      var kategoriFolder = 'ABSENSI';
      if (d.recordType === 'OPEN_STORE' && !isMasuk) {
        kategoriFolder = 'OPEN_STORE';
      } else if (d.recordType === 'CLOSE_STORE' && !isPulang) {
        kategoriFolder = 'CLOSE_STORE';
      } else {
        kategoriFolder = 'ABSENSI';
      }

      var fotoLinks = [];
      var activeBranchFolderObj = getFolderFotoByKategoriLaporan(kategoriFolder, cabang);
      var activeBranchFolderUrl = activeBranchFolderObj ? activeBranchFolderObj.getUrl() : ('https://drive.google.com/drive/folders/' + FOLDER_ABSEN_ID);

      if (d.closePhotosList && d.closePhotosList.length > 0) {
        var folderKeyMulti = (d.recordType === 'OPEN_STORE') ? 'OPEN_STORE' : 'CLOSE_STORE';
        for (var i = 0; i < d.closePhotosList.length; i++) {
          var cp = d.closePhotosList[i];
          var savedMulti = saveImgToReportFolder(cp.base64, folderKeyMulti + '_' + cabang + '_' + (i + 1) + '_' + cp.label.replace(/[^a-zA-Z0-9]/g, '_') + '_' + d.tanggal + '.jpg', folderKeyMulti);
          fotoLinks.push(cp.label + ': ' + savedMulti.fileUrl);
          activeBranchFolderUrl = savedMulti.folderUrl;
        }
      } else if (d.openPhotosList && d.openPhotosList.length > 0) {
        for (var opIdx = 0; opIdx < d.openPhotosList.length; opIdx++) {
          var op = d.openPhotosList[opIdx];
          var savedOp = saveImgToReportFolder(op.base64, 'OPEN_' + cabang + '_' + (opIdx + 1) + '_' + op.label.replace(/[^a-zA-Z0-9]/g, '_') + '_' + d.tanggal + '.jpg', 'OPEN_STORE');
          fotoLinks.push(op.label + ': ' + savedOp.fileUrl);
          activeBranchFolderUrl = savedOp.folderUrl;
        }
      } else {
        var fotoUtamaBase64 = d.fotoBukti || d.fotoBoothBuka || d.fotoLampuMati || d.fotoDepanStore || '';
        var prefixNamaFile = isPulang ? 'ABSEN_PULANG' : (isMasuk ? 'ABSEN_DATANG' : tipeDetail);
        var savedSingle = saveImgToReportFolder(fotoUtamaBase64, prefixNamaFile + '_' + cabang + '_' + d.tanggal + '_' + d.nama + '_' + d.shift + '.jpg', kategoriFolder);
        fotoLinks.push(savedSingle.fileUrl);
        activeBranchFolderUrl = savedSingle.folderUrl;
      }

      var statusSingkat = d.punctualityStatus || (d.recordType === 'ABSEN_MUKA' ? 'TEPAT WAKTU' : '-');
      var detailLengkap = d.punctualityDetail || d.punctualityStatus || '-';

      if (d.recordType === 'OPEN_STORE' && !isMasuk) {
        var shOpen = ss.getSheetByName('open_Store') || ss.insertSheet('open_Store');
        shOpen.appendRow([
          new Date(), d.tanggal || '-', d.waktu || '-', cabang, d.shift || '-', d.shiftScheduleLabel || '-',
          d.nama || '-', d.checklistSummary || '-', d.lokasiWatermark || '-',
          fotoLinks.join(' | '), activeBranchFolderUrl, d.catatan || '-'
        ]);
      } else if (d.recordType === 'CLOSE_STORE' && !isPulang) {
        var shClose = ss.getSheetByName('Close_Store') || ss.insertSheet('Close_Store');
        var jmlFotoClose = (d.closePhotosList && d.closePhotosList.length > 0) ? (d.closePhotosList.length + ' Foto') : '2 Foto';
        shClose.appendRow([
          new Date(), d.tanggal || '-', d.waktu || '-', cabang, d.shift || '-', d.shiftScheduleLabel || '-',
          d.nama || '-', jmlFotoClose, d.checklistSummary || '-', d.lokasiWatermark || '-',
          fotoLinks.join(' | '), activeBranchFolderUrl, d.catatan || '-'
        ]);
      } else if (isPulang) {
        var shKeluarAbsen = ss.getSheetByName('Absen_Keluar') || ss.insertSheet('Absen_Keluar');
        shKeluarAbsen.appendRow([
          new Date(), d.tanggal || '-', d.waktu || '-', cabang, d.nama || '-',
          d.shift || '-', d.shiftScheduleLabel || '-', statusSingkat,
          detailLengkap, d.lokasiWatermark || '-',
          fotoLinks.join(' | '), activeBranchFolderUrl, d.catatan || '-'
        ]);
      } else {
        var shMasukAbsen = ss.getSheetByName('Absen_Masuk') || ss.insertSheet('Absen_Masuk');
        shMasukAbsen.appendRow([
          new Date(), d.tanggal || '-', d.waktu || '-', cabang, d.nama || '-',
          d.shift || '-', d.shiftScheduleLabel || '-', statusSingkat,
          detailLengkap, d.lokasiWatermark || '-',
          fotoLinks.join(' | '), activeBranchFolderUrl, d.catatan || '-'
        ]);
      }

      return JSON.stringify({
        status: 'success',
        branchSpreadsheetId: ss.getId(),
        branchSpreadsheetUrl: ss.getUrl(),
        folderUrl: activeBranchFolderUrl
      });
    }

    // 6: Barang_Datang
    if (d.recordType === 'BARANG_DATANG') {
      var shMasuk = ss.getSheetByName('Barang_Datang') || ss.insertSheet('Barang_Datang');
      if (d.incomingItemsDetail && d.incomingItemsDetail.length > 0) {
        for (var k = 0; k < d.incomingItemsDetail.length; k++) {
          var itm = d.incomingItemsDetail[k];
          var satuanBrg = (String(itm.name || '').toLowerCase().indexOf('tinta') !== -1) ? 'Botol' : (itm.unit || 'Pcs');
          shMasuk.appendRow([
            new Date(), cabang, d.senderRole || 'USER', d.tanggal || '-', d.incomingDate || d.tanggal || '-', d.waktu || '-', d.shift || '-',
            d.nama || '-', d.petugasBantu || '-', itm.code || '-', itm.name || '-', itm.category || '-', satuanBrg,
            itm.stockBefore !== undefined ? itm.stockBefore : '-',
            itm.addedQty !== undefined ? itm.addedQty : '-',
            itm.stockAfter !== undefined ? itm.stockAfter : '-',
            d.positiveSummary || '-', d.catatan || '-'
          ]);
        }
      } else {
        shMasuk.appendRow([
          new Date(), cabang, d.senderRole || 'USER', d.tanggal || '-', d.incomingDate || d.tanggal || '-', d.waktu || '-', d.shift || '-',
          d.nama || '-', d.petugasBantu || '-', '-', '-', '-', '-', '-', '-', '-',
          d.positiveSummary || d.itemsSummary || '-', d.catatan || '-'
        ]);
      }
      return JSON.stringify({ status: 'success', branchSpreadsheetId: ss.getId(), branchSpreadsheetUrl: ss.getUrl() });
    }

    // 5: Stock_Opname
    if (d.recordType === 'STOCK_OPNAME') {
      var shStok = ss.getSheetByName('Stock_Opname') || ss.insertSheet('Stock_Opname');
      shStok.appendRow([
        new Date(), cabang, d.senderRole || 'USER', d.tanggal || '-', d.cutoffDate || d.tanggal || '-', d.waktu || '-',
        d.shift || '-', d.nama || '-', d.petugasBantu || '-',
        d.kertasPax !== undefined ? d.kertasPax : '-',
        d.hangtagKecilPcs !== undefined ? d.hangtagKecilPcs : '-',
        d.hangtagBesarPcs !== undefined ? d.hangtagBesarPcs : '-',
        d.keychainPanjangPcs !== undefined ? d.keychainPanjangPcs : '-',
        d.keychainBulatPcs !== undefined ? d.keychainBulatPcs : '-',
        d.plastikKecilIkat !== undefined ? d.plastikKecilIkat : '-',
        d.plastikBesarIkat !== undefined ? d.plastikBesarIkat : '-',
        d.tintaLmPct !== undefined ? d.tintaLmPct : '-',
        d.tintaLcPct !== undefined ? d.tintaLcPct : '-',
        d.tintaYPct !== undefined ? d.tintaYPct : '-',
        d.tintaMPct !== undefined ? d.tintaMPct : '-',
        d.tintaCPct !== undefined ? d.tintaCPct : '-',
        d.tintaKPct !== undefined ? d.tintaKPct : '-',
        d.lemGanciPcs !== undefined ? d.lemGanciPcs : '-',
        d.extraItemsSummary || '-',
        d.catatan || '-'
      ]);
      return JSON.stringify({ status: 'success', branchSpreadsheetId: ss.getId(), branchSpreadsheetUrl: ss.getUrl() });
    }

    // 3 & 4: Laporan_Harian & Rekap_Pengeluaran
    var shLapHarian = ss.getSheetByName('Laporan_Harian') || ss.insertSheet('Laporan_Harian');
    var savedSerah = saveImgToReportFolder(d.fotoSerahTerima, 'PEMASUKAN_SERAH_TERIMA_' + cabang + '_' + d.tanggal + '_' + d.nama + '_' + (d.shift || '') + '.jpg', 'SERAH_TERIMA');
    var savedStruk = saveImgToReportFolder(d.fotoStruk, 'STRUK_BELANJA_' + cabang + '_' + d.tanggal + '_' + d.nama + '_' + (d.shift || '') + '.jpg', 'STRUK_BELANJA');

    shLapHarian.appendRow([
      new Date(), d.tanggal || '-', d.waktu || '-', cabang, d.shift || '-', d.nama || '-',
      d.cash || 0, d.qris || 0, d.totalGross || 0,
      d.totalExpense || 0, d.rincianPengeluaran || '-',
      d.netOmzet || 0,
      savedSerah.fileUrl, savedSerah.folderUrl,
      savedStruk.fileUrl, savedStruk.folderUrl,
      d.catatan || '-'
    ]);

    var totalExp = Number(d.totalExpense) || 0;
    var hasExpList = d.expensesList && d.expensesList.length > 0;
    var hasExpText = d.rincianPengeluaran && d.rincianPengeluaran !== '-' && d.rincianPengeluaran !== '';
    if (totalExp > 0 || hasExpList || hasExpText) {
      var shRekapKeluar = ss.getSheetByName('Rekap_Pengeluaran') || ss.insertSheet('Rekap_Pengeluaran');
      if (hasExpList) {
        for (var j = 0; j < d.expensesList.length; j++) {
          var exItem = d.expensesList[j];
          shRekapKeluar.appendRow([
            new Date(), d.tanggal || '-', d.waktu || '-', cabang, d.shift || '-', d.nama || '-',
            exItem.desc || 'Pengeluaran Operasional', Number(exItem.amount) || 0,
            totalExp, savedStruk.fileUrl, savedStruk.folderUrl, d.catatan || '-'
          ]);
        }
      } else {
        shRekapKeluar.appendRow([
          new Date(), d.tanggal || '-', d.waktu || '-', cabang, d.shift || '-', d.nama || '-',
          d.rincianPengeluaran || 'Pengeluaran Kas', totalExp,
          totalExp, savedStruk.fileUrl, savedStruk.folderUrl, d.catatan || '-'
        ]);
      }
    }

    return JSON.stringify({
      status: 'success',
      branchSpreadsheetId: ss.getId(),
      branchSpreadsheetUrl: ss.getUrl(),
      folderPemasukanUrl: savedSerah.folderUrl,
      folderStrukUrl: savedStruk.folderUrl
    });
  } catch (err) {
    return JSON.stringify({ status: 'error', message: err.toString() });
  } finally {
    try { lock.releaseLock(); } catch (eLock) {}
  }
}