const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authRequired } = require('../middleware/auth');

router.use(authRequired);

// GET semua karyawan (join nama departemen), support pencarian ?q=
router.get('/', async (req, res) => {
  const { q } = req.query;
  try {
    let query = `
      SELECT k.*, d.nama_departemen
      FROM karyawan k
      LEFT JOIN departemen d ON d.id = k.departemen_id
    `;
    const params = [];
    if (q) {
      query += ` WHERE k.nama_lengkap ILIKE $1 OR k.email ILIKE $1 OR k.posisi ILIKE $1`;
      params.push(`%${q}%`);
    }
    query += ' ORDER BY k.id ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET satu karyawan by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT k.*, d.nama_departemen FROM karyawan k
       LEFT JOIN departemen d ON d.id = k.departemen_id
       WHERE k.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Karyawan tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah karyawan
router.post('/', async (req, res) => {
  const { nama_lengkap, email, no_telp, posisi, gaji, tanggal_masuk, status, departemen_id } = req.body;
  if (!nama_lengkap || !email || !posisi) {
    return res.status(400).json({ error: 'Nama, email, dan posisi wajib diisi' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO karyawan (nama_lengkap, email, no_telp, posisi, gaji, tanggal_masuk, status, departemen_id)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6, CURRENT_DATE),COALESCE($7,'Aktif'),$8) RETURNING *`,
      [nama_lengkap, email, no_telp || null, posisi, gaji || 0, tanggal_masuk || null, status || null, departemen_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email sudah digunakan' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update karyawan
router.put('/:id', async (req, res) => {
  const { nama_lengkap, email, no_telp, posisi, gaji, tanggal_masuk, status, departemen_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE karyawan SET nama_lengkap=$1, email=$2, no_telp=$3, posisi=$4, gaji=$5,
       tanggal_masuk=$6, status=$7, departemen_id=$8 WHERE id=$9 RETURNING *`,
      [nama_lengkap, email, no_telp || null, posisi, gaji || 0, tanggal_masuk, status, departemen_id || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Karyawan tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE karyawan
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM karyawan WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Karyawan tidak ditemukan' });
    res.json({ message: 'Karyawan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
