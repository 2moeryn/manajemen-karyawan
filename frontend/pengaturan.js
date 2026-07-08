if (!requireAuth()) { /* redirect ke login.html */ }
else { initSidebar(); }

const form = document.getElementById('changePasswordForm');
const errorEl = document.getElementById('formError');
const btn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  if (payload.password_baru !== payload.password_konfirmasi) {
    errorEl.textContent = 'Konfirmasi password baru tidak cocok';
    errorEl.hidden = false;
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Menyimpan…';
  try {
    await api('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        password_lama: payload.password_lama,
        password_baru: payload.password_baru,
      }),
    });
    toast('Password berhasil diubah');
    form.reset();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Simpan Password Baru';
  }
});
