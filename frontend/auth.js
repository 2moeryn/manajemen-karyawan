// auth.js — dipakai bersama di semua halaman (kecuali login.html)
const API = '/api';

function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}
function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Panggil di awal setiap halaman yang butuh login
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Wrapper fetch yang otomatis menyisipkan token & menangani sesi kedaluwarsa
async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    ...opts,
  });

  if (res.status === 401) {
    clearSession();
    window.location.href = 'login.html';
    throw new Error('Sesi berakhir, silakan login kembali');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}

async function logout() {
  try { await api('/auth/logout', { method: 'POST' }); } catch { /* abaikan */ }
  clearSession();
  window.location.href = 'login.html';
}

// Isi nama user & pasang tombol logout di sidebar (dipanggil di tiap halaman)
function initSidebar() {
  const user = getUser();
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  if (user && nameEl) nameEl.textContent = user.nama_lengkap;
  if (user && roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrator' : 'Staff';

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- MODAL (dipakai di karyawan.html, departemen.html, cuti.html) ----------
function openModal(title, bodyHtml, onSubmit) {
  const overlay = document.getElementById('modalOverlay');
  const form = document.getElementById('modalForm');
  document.getElementById('modalTitle').textContent = title;
  form.innerHTML = bodyHtml + `
    <div class="modal-footer">
      <button type="button" class="btn btn-ghost" id="cancelBtn">Batal</button>
      <button type="submit" class="btn btn-primary">Simpan</button>
    </div>
  `;
  overlay.classList.add('open');
  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(new FormData(form));
      closeModal();
    } catch (err) {
      toast(err.message, true);
    }
  };
  document.getElementById('cancelBtn').onclick = closeModal;
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
});

function formatRupiah(n) { return 'Rp' + Number(n || 0).toLocaleString('id-ID'); }
function formatTanggal(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
