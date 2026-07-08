if (!requireAuth()) { /* akan redirect ke login.html */ }
else {
  initSidebar();
  loadDashboard();
}

function statusBadgeClass(s) {
  if (s === 'Disetujui') return 'badge-green';
  if (s === 'Ditolak') return 'badge-red';
  return 'badge-amber';
}

async function loadDashboard() {
  try {
    const [karyawan, departemen, cuti] = await Promise.all([
      api('/karyawan'), api('/departemen'), api('/cuti'),
    ]);

    document.getElementById('mKaryawan').textContent = karyawan.filter(k => k.status === 'Aktif').length;
    document.getElementById('mDepartemen').textContent = departemen.length;
    document.getElementById('mCutiMenunggu').textContent = cuti.filter(c => c.status === 'Menunggu').length;

    const recent = cuti.slice(0, 5);
    document.getElementById('recentCutiEmpty').hidden = recent.length > 0;
    document.getElementById('recentCutiBody').innerHTML = recent.map(c => `
      <tr>
        <td><strong>${c.nama_lengkap}</strong></td>
        <td>${c.jenis_cuti}</td>
        <td>${formatTanggal(c.tanggal_mulai)}</td>
        <td>${formatTanggal(c.tanggal_selesai)}</td>
        <td><span class="badge ${statusBadgeClass(c.status)}">${c.status}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    toast(err.message, true);
  }
}
