const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ganti-dengan-secret-yang-kuat';

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Belum login. Token tidak ditemukan.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, username, nama_lengkap, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesi tidak valid atau sudah kedaluwarsa. Silakan login kembali.' });
  }
}

module.exports = { authRequired, JWT_SECRET };
