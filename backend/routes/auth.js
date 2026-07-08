const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authRequired, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Username atau password salah' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Username atau password salah' });

    const payload = {
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — cek sesi & ambil data user yang sedang login
router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout — stateless (JWT dihapus di sisi klien),
// endpoint ini disediakan agar alur logout tetap eksplisit lewat API
router.post('/logout', authRequired, (req, res) => {
  res.json({ message: 'Logout berhasil' });
});

// PUT /api/auth/change-password — user yang sedang login mengganti password sendiri
router.put('/change-password', authRequired, async (req, res) => {
  const { password_lama, password_baru } = req.body;
  if (!password_lama || !password_baru) {
    return res.status(400).json({ error: 'Password lama dan password baru wajib diisi' });
  }
  if (password_baru.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    const valid = await bcrypt.compare(password_lama, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Password lama salah' });

    const newHash = await bcrypt.hash(password_baru, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);

    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
