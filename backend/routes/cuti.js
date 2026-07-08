const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authRequired } = require('../middleware/auth');

router.use(authRequired);

// GET semua pengajuan cuti (join nama karyawan), support ?karyawan_id=
router.get('/', async (req, res) => {
  const { karyawan_id } = req.query;
  try {
    let query = `
      SELECT c.*, k.nama_lengkap
      FROM cuti c
      JOIN karyawan k ON k.id = c.karyawan_id
    `;
    const params = [];
    if (karyawan_id) {
      query += ' WHERE c.karyawan_id = $1';
      params.push(karyawan_id);
    }
    query += ' ORDER BY c.dibuat_pada DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah pengajuan cuti
router.post('/', async (req, res) => {
  const { karyawan_id, jenis_cuti, tanggal_mulai, tanggal_selesai, alasan } = req.body;
  if (!karyawan_id || !tanggal_mulai || !tanggal_selesai) {
    return res.status(400).json({ error: 'Karyawan, tanggal mulai, dan tanggal selesai wajib diisi' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO cuti (karyawan_id, jenis_cuti, tanggal_mulai, tanggal_selesai, alasan)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [karyawan_id, jenis_cuti || 'Tahunan', tanggal_mulai, tanggal_selesai, alasan || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update pengajuan cuti (mis. ubah status: Disetujui/Ditolak)
router.put('/:id', async (req, res) => {
  const { jenis_cuti, tanggal_mulai, tanggal_selesai, alasan, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cuti SET jenis_cuti=$1, tanggal_mulai=$2, tanggal_selesai=$3, alasan=$4, status=$5
       WHERE id=$6 RETURNING *`,
      [jenis_cuti, tanggal_mulai, tanggal_selesai, alasan, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pengajuan cuti tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE pengajuan cuti
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cuti WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pengajuan cuti tidak ditemukan' });
    res.json({ message: 'Pengajuan cuti berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
