-- ============================================================================
-- MIGRATION 001: MASTER TABLES & CLOUD SYNC CONFIGURATION
-- Oh Snap! Photobox — 5 Cabang (Majenang, Cilacap, Pekalongan, Pemalang, Kediri)
-- ============================================================================

CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_code VARCHAR(32) NOT NULL UNIQUE,
    branch_name VARCHAR(100) NOT NULL UNIQUE,
    close_photo_count INTEGER NOT NULL DEFAULT 2,
    spreadsheet_id VARCHAR(128) DEFAULT '',
    spreadsheet_url TEXT DEFAULT '',
    drive_folder_id VARCHAR(128) DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branch_shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_name VARCHAR(100) NOT NULL,
    shift_name VARCHAR(50) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    schedule_label VARCHAR(30) NOT NULL,
    UNIQUE(branch_name, shift_name)
);

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(64) PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    login_password VARCHAR(100) NOT NULL,
    default_branch VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_catalog (
    id VARCHAR(64) PRIMARY KEY,
    item_code VARCHAR(32) NOT NULL UNIQUE,
    item_name VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    unit VARCHAR(32) NOT NULL DEFAULT 'Pcs',
    incoming_unit VARCHAR(32) NOT NULL DEFAULT 'Pcs',
    min_warning INTEGER NOT NULL DEFAULT 50,
    item_type VARCHAR(32) NOT NULL DEFAULT 'single',
    ink_color_code VARCHAR(16) DEFAULT NULL,
    status_hold BOOLEAN NOT NULL DEFAULT 0,
    assigned_branches_json TEXT DEFAULT '["Majenang","Cilacap","Pekalongan","Pemalang","Kediri"]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branch_stock_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_name VARCHAR(100) NOT NULL,
    item_id VARCHAR(64) NOT NULL,
    qty NUMERIC NOT NULL DEFAULT 0,
    botol_qty NUMERIC DEFAULT NULL,
    updated_by VARCHAR(120) DEFAULT '-',
    updated_at VARCHAR(64) DEFAULT '-',
    UNIQUE(branch_name, item_id)
);

CREATE TABLE IF NOT EXISTS deleted_oplog_records (
    log_id VARCHAR(64) PRIMARY KEY,
    deleted_by VARCHAR(100) DEFAULT 'Admin',
    report_key VARCHAR(64) DEFAULT 'ALL_HISTORY',
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cloud_config_store (
    config_key VARCHAR(64) PRIMARY KEY,
    config_json TEXT NOT NULL,
    updated_at BIGINT NOT NULL
);
