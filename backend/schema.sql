DROP TABLE IF EXISTS cuti CASCADE;
DROP TABLE IF EXISTS karyawan CASCADE;
DROP TABLE IF EXISTS departemen CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','staff')),
    dibuat_pada TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, password_hash, nama_lengkap, role) VALUES
('admin', '$2b$10$/S1AfOrCbMigNLDWu1vyb.IVXIjN0yX4Vssu959VUfIA7nedw34HO', 'Administrator', 'admin');

CREATE TABLE departemen (
    id SERIAL PRIMARY KEY,
    nama_departemen VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT,
    dibuat_pada TIMESTAMP DEFAULT NOW()
);

CREATE TABLE karyawan (
    id SERIAL PRIMARY KEY,
    nama_lengkap VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    no_telp VARCHAR(20),
    posisi VARCHAR(100) NOT NULL,
    gaji NUMERIC(14,2) NOT NULL DEFAULT 0,
    tanggal_masuk DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif','Nonaktif')),
    departemen_id INTEGER REFERENCES departemen(id) ON DELETE SET NULL,
    dibuat_pada TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cuti (
    id SERIAL PRIMARY KEY,
    karyawan_id INTEGER NOT NULL REFERENCES karyawan(id) ON DELETE CASCADE,
    jenis_cuti VARCHAR(50) NOT NULL DEFAULT 'Tahunan',
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    alasan TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu','Disetujui','Ditolak')),
    dibuat_pada TIMESTAMP DEFAULT NOW()
);
