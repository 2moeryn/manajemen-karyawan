if (!requireAuth()) {}
else { initSidebar(); init(); }

let karyawanList = [];
let departemenList = [];

async function init() {
  try {
    [karyawanList, departemenList] = await Promise.all([api('/karyawan'), api('/departemen')]);
    renderKaryawan(karyawanList);
  } catch (err) { toast(err.message, true); }
}

function renderKaryawan(list) {
  const body = document.getElementById('karyawanTableBody');
  document.getElementById('karyawanEmpty').hidden = list.length > 0;
  body.innerHTML = list.map(k => `
    <tr>
      <td><strong>${k.nama_lengkap}</strong></td>
      <td>${k.email}</td>
      <td>${k.posisi}</td>
      <td>${k.nama_departemen || '<span style="color:#999">Belum ditentukan</span>'}</td>
      <td>${formatRupiah(k.gaji)}</td>
      <td><span class="badge ${k.status === 'Aktif' ? 'badge-green' : 'badge-grey'}">${k.status}</span></td>
      <td>${formatTanggal(k.tanggal_masuk)}</td>
      <td>
        <div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="editKaryawan(${k.id})">Ubah</button>
          <button class="btn btn-danger btn-sm" onclick="deleteKaryawan(${k.id})">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
}

document.getElementById('searchKaryawan').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderKaryawan(karyawanList.filter(k =>
    k.nama_lengkap.toLowerCase().includes(q) ||
    k.email.toLowerCase().includes(q) ||
    k.posisi.toLowerCase().includes(q)
  ));
});

function departemenOptions(selectedId) {
  return `<option value="">— Belum ditentukan —</option>` + departemenList.map(d =>
    `<option value="${d.id}" ${d.id === selectedId ? 'selected' : ''}>${d.nama_departemen}</option>`
  ).join('');
}

document.getElementById('btnAddKaryawan').addEventListener('click', () => openKaryawanForm());
function editKaryawan(id) { openKaryawanForm(karyawanList.find(x => x.id === id)); }

function openKaryawanForm(k = null) {
  openModal(k ? 'Ubah Karyawan' : 'Tambah Karyawan', `
    <div class="form-row"><label>Nama Lengkap</label>
      <input type="text" name="nama_lengkap" required value="${k ? k.nama_lengkap : ''}"></div>
    <div class="form-row"><label>Email</label>
      <input type="email" name="email" required value="${k ? k.email : ''}"></div>
    <div class="form-row-split">
      <div class="form-row"><label>No. Telepon</label>
        <input type="text" name="no_telp" value="${k ? (k.no_telp || '') : ''}"></div>
      <div class="form-row"><label>Posisi</label>
        <input type="text" name="posisi" required value="${k ? k.posisi : ''}"></div>
    </div>
    <div class="form-row-split">
      <div class="form-row"><label>Gaji (Rp)</label>
        <input type="number" name="gaji" min="0" value="${k ? k.gaji : 0}"></div>
      <div class="form-row"><label>Tanggal Masuk</label>
        <input type="date" name="tanggal_masuk" value="${k ? k.tanggal_masuk?.slice(0,10) : ''}"></div>
    </div>
    <div class="form-row-split">
      <div class="form-row"><label>Departemen</label>
        <select name="departemen_id">${departemenOptions(k ? k.departemen_id : null)}</select></div>
      <div class="form-row"><label>Status</label>
        <select name="status">
          <option value="Aktif" ${k && k.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
          <option value="Nonaktif" ${k && k.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option>
        </select></div>
    </div>
  `, async (formData) => {
    const payload = Object.fromEntries(formData.entries());
    payload.gaji = Number(payload.gaji) || 0;
    payload.departemen_id = payload.departemen_id || null;
    if (k) await api(`/karyawan/${k.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/karyawan', { method: 'POST', body: JSON.stringify(payload) });
    toast(k ? 'Karyawan berhasil diperbarui' : 'Karyawan berhasil ditambahkan');
    await init();
  });
}

async function deleteKaryawan(id) {
  if (!confirm('Hapus karyawan ini? Data cuti terkait juga akan terhapus.')) return;
  try {
    await api(`/karyawan/${id}`, { method: 'DELETE' });
    toast('Karyawan berhasil dihapus');
    await init();
  } catch (err) { toast(err.message, true); }
}
