const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authRequired } = require('../middleware/auth');

router.use(authRequired);

// GET semua departemen (+ jumlah karyawan)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, COUNT(k.id)::int AS jumlah_karyawan
      FROM departemen d
      LEFT JOIN karyawan k ON k.departemen_id = d.id
      GROUP BY d.id
      ORDER BY d.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET satu departemen by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departemen WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Departemen tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah departemen
router.post('/', async (req, res) => {
  const { nama_departemen, deskripsi } = req.body;
  if (!nama_departemen) return res.status(400).json({ error: 'Nama departemen wajib diisi' });
  try {
    const result = await pool.query(
      'INSERT INTO departemen (nama_departemen, deskripsi) VALUES ($1, $2) RETURNING *',
      [nama_departemen, deskripsi || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Nama departemen sudah ada' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update departemen
router.put('/:id', async (req, res) => {
  const { nama_departemen, deskripsi } = req.body;
  try {
    const result = await pool.query(
      'UPDATE departemen SET nama_departemen = $1, deskripsi = $2 WHERE id = $3 RETURNING *',
      [nama_departemen, deskripsi || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Departemen tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE departemen
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM departemen WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Departemen tidak ditemukan' });
    res.json({ message: 'Departemen berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
