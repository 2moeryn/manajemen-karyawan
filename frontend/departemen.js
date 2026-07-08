if (!requireAuth()) { /* redirect ke login.html */ }
else { initSidebar(); init(); }

let departemenList = [];

async function init() {
  try {
    departemenList = await api('/departemen');
    render();
  } catch (err) { toast(err.message, true); }
}

function render() {
  const grid = document.getElementById('departemenGrid');
  document.getElementById('departemenEmpty').hidden = departemenList.length > 0;
  grid.innerHTML = departemenList.map(d => `
    <div class="dept-card">
      <div class="dept-actions">
        <button class="btn btn-ghost btn-sm" onclick="editDepartemen(${d.id})">Ubah</button>
        <button class="btn btn-danger btn-sm" onclick="deleteDepartemen(${d.id})">Hapus</button>
      </div>
      <h3>${d.nama_departemen}</h3>
      <p>${d.deskripsi || 'Tidak ada deskripsi.'}</p>
      <span class="dept-count">${d.jumlah_karyawan}</span>
      <div class="dept-count-label">Karyawan</div>
    </div>
  `).join('');
}

document.getElementById('btnAddDepartemen').addEventListener('click', () => openDepartemenForm());
function editDepartemen(id) { openDepartemenForm(departemenList.find(x => x.id === id)); }

function openDepartemenForm(d = null) {
  openModal(d ? 'Ubah Departemen' : 'Tambah Departemen', `
    <div class="form-row"><label>Nama Departemen</label>
      <input type="text" name="nama_departemen" required value="${d ? d.nama_departemen : ''}"></div>
    <div class="form-row"><label>Deskripsi</label>
      <textarea name="deskripsi" rows="3">${d ? (d.deskripsi || '') : ''}</textarea></div>
  `, async (formData) => {
    const payload = Object.fromEntries(formData.entries());
    if (d) await api(`/departemen/${d.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/departemen', { method: 'POST', body: JSON.stringify(payload) });
    toast(d ? 'Departemen berhasil diperbarui' : 'Departemen berhasil ditambahkan');
    await init();
  });
}

async function deleteDepartemen(id) {
  if (!confirm('Hapus departemen ini? Karyawan terkait akan menjadi "Belum ditentukan".')) return;
  try {
    await api(`/departemen/${id}`, { method: 'DELETE' });
    toast('Departemen berhasil dihapus');
    await init();
  } catch (err) { toast(err.message, true); }
}
