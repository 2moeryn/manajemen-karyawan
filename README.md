Cara Running

1. Siapkan Database PostgreSQL
Buat database baru, lalu jalankan pada file:
createdb manajemen_karyawan
psql -U postgres -d manajemen_karyawan -f backend/schema.sql

2. Konfigurasi Environment
cd backend
lalu sesuaikan DB_USER, DB_PASSWORD, DB_NAME pada .env dengan setup PostgreSQL pribadi

3. Install Dependency dan Jalankan Server
npm install
npm start

Server berjalan di http://localhost:3000
