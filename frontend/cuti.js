if (!requireAuth()) { /* redirect ke login.html */ }
else { initSidebar(); init(); }

let cutiList = [];
let karyawanList = [];

async function init() {
  try {
    [cutiList, karyawanList] = await Promise.all([api('/cuti'), api('/karyawan')]);
    render();
  } catch (err) { toast(err.message, true); }
}

function statusBadgeClass(s) {
  if (s === 'Disetujui') return 'badge-green';
  if (s === 'Ditolak') return 'badge-red';
  return 'badge-amber';
}

function render() {
  const body = document.getElementById('cutiTableBody');
  document.getElementById('cutiEmpty').hidden = cutiList.length > 0;
  body.innerHTML = cutiList.map(c => `
    <tr>
      <td><strong>${c.nama_lengkap}</strong></td>
      <td>${c.jenis_cuti}</td>
      <td>${formatTanggal(c.tanggal_mulai)}</td>
      <td>${formatTanggal(c.tanggal_selesai)}</td>
      <td>${c.alasan || '-'}</td>
      <td><span class="badge ${statusBadgeClass(c.status)}">${c.status}</span></td>
      <td>
        <div class="row-actions">
          ${c.status === 'Menunggu' ? `
            <button class="btn btn-ghost btn-sm" onclick="setCutiStatus(${c.id}, 'Disetujui')">Setujui</button>
            <button class="btn btn-danger btn-sm" onclick="setCutiStatus(${c.id}, 'Ditolak')">Tolak</button>
          ` : ''}
          <button class="btn btn-danger btn-sm" onclick="deleteCuti(${c.id})">Hapus</button>
        </div>
      </td>
    </tr>
  `).join('');
}

document.getElementById('btnAddCuti').addEventListener('click', () => openCutiForm());

function openCutiForm() {
  if (karyawanList.length === 0) { toast('Tambahkan karyawan terlebih dahulu', true); return; }
  openModal('Ajukan Cuti', `
    <div class="form-row"><label>Karyawan</label>
      <select name="karyawan_id" required>
        ${karyawanList.map(k => `<option value="${k.id}">${k.nama_lengkap}</option>`).join('')}
      </select></div>
    <div class="form-row"><label>Jenis Cuti</label>
      <select name="jenis_cuti">
        <option>Tahunan</option><option>Sakit</option><option>Melahirkan</option><option>Lainnya</option>
      </select></div>
    <div class="form-row-split">
      <div class="form-row"><label>Tanggal Mulai</label><input type="date" name="tanggal_mulai" required></div>
      <div class="form-row"><label>Tanggal Selesai</label><input type="date" name="tanggal_selesai" required></div>
    </div>
    <div class="form-row"><label>Alasan</label><textarea name="alasan" rows="2"></textarea></div>
  `, async (formData) => {
    const payload = Object.fromEntries(formData.entries());
    await api('/cuti', { method: 'POST', body: JSON.stringify(payload) });
    toast('Pengajuan cuti berhasil ditambahkan');
    await init();
  });
}

async function setCutiStatus(id, status) {
  const c = cutiList.find(x => x.id === id);
  try {
    await api(`/cuti/${id}`, { method: 'PUT', body: JSON.stringify({ ...c, status }) });
    toast(`Cuti ditandai: ${status}`);
    await init();
  } catch (err) { toast(err.message, true); }
}

async function deleteCuti(id) {
  if (!confirm('Hapus pengajuan cuti ini?')) return;
  try {
    await api(`/cuti/${id}`, { method: 'DELETE' });
    toast('Pengajuan cuti berhasil dihapus');
    await init();
  } catch (err) { toast(err.message, true); }
}
