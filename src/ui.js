// Panel hitungan + galeri gambar
const r1 = (v) => Math.round(v * 10) / 10;

export function renderHitungan(R, el, onPick) {
  if (!el) return;
  const cfg = R.cfg;
  const cutsHtml = (f) => `<div class="cuts">mulai: ${f.layout.name} · potongan: ${f.layout.cutList.map((c) => `${c.ukuran}×${c.jumlah}`).join(', ') || '-'}</div>`;
  let h = '';
  h += `<h2>Kebutuhan granit &amp; cara potong</h2>
  <p class="muted">Ukuran bersih dari gambar DED (grid − tebal tembok 15 cm). "Korban potong" = keping utuh yang dipotong untuk menghasilkan semua potongan (potongan yang seukuran digabung dari satu keping). Klik baris untuk terbang ke ruangnya.</p>`;

  h += `<h3>Granit 80×80 — lantai</h3><table><thead><tr><th>Area</th><th class="num">m²</th><th class="num">Utuh</th><th class="num">Potongan</th><th class="num">Korban</th><th class="num">Total keping</th></tr></thead><tbody>`;
  for (const g of R.groups) {
    h += `<tr class="total"><td colspan="6">${g.name} <span class="badge">${g.area} m² → ${g.pieces} keping · +${cfg.wastePct}% = ${g.withWaste} keping = ${g.boxes} dus</span></td></tr>`;
    for (const f of g.items) {
      const alt = f.isBathroom && cfg.bathFloorMode === '40';
      h += `<tr class="row-click" data-id="${f.id}"><td>${f.name}${alt ? ` <span class="badge">${f.tileSpec.label}</span>` : ''}${cutsHtml(f)}</td><td class="num">${f.area}</td><td class="num">${f.full}</td><td class="num">${f.cutPieces} pcs</td><td class="num">${f.cutTiles}</td><td class="num"><b>${f.pieces}</b></td></tr>`;
    }
  }
  h += `</tbody></table>`;

  h += `<h3>Plin 10 cm (dari granit 80×80 dibelah ${cfg.plinthStrips} × 10 cm)</h3><table><thead><tr><th>Ruang</th><th class="num">Keliling bersih (m)</th><th class="num">Strip 10×80</th><th class="num">Keping 80×80</th></tr></thead><tbody>`;
  for (const f of R.plinthItems) h += `<tr><td>${f.name}</td><td class="num">${f.plinth.net}</td><td class="num">${f.plinth.strips}</td><td class="num">${f.plinth.tiles}</td></tr>`;
  h += `<tr class="total"><td>Total plin</td><td class="num">${R.plinthTotal.length}</td><td class="num">${R.plinthTotal.strips}</td><td class="num">${R.plinthTotal.tiles} keping = ${R.plinthTotal.boxes} dus</td></tr></tbody></table>
  <p class="muted">Belah 8 strip/keping berarti tiap strip ±9,7 cm (dikurangi mata potong). Kalau mau tepat 10 cm, hanya 7 strip/keping → ${Math.ceil(R.plinthTotal.strips / 7)} keping.</p>`;

  h += `<div class="ok"><b>TOTAL granit 80×80 (semua lantai + plin): ${R.total80.pieces} keping → dengan cadangan ${cfg.wastePct}% = ${R.total80.withWaste} keping ≈ ${R.total80.m2} m² = ${R.total80.boxes} dus</b> (${cfg.floorPcsPerBox} keping/dus). Beli granit polos &amp; structured terpisah: polos ${R.groups.filter((g) => !g.name.includes('luar')).reduce((s, g) => s + g.withWaste, 0) + R.plinthTotal.tiles} keping, structured (luar) ${R.groups.filter((g) => g.name.includes('luar')).reduce((s, g) => s + g.withWaste, 0)} keping.</div>`;

  h += `<h3>Dinding kamar mandi — granit 30×60 (dipasang mendatar), bawah terakota ${Math.round(cfg.wallZones.bottomH * 100)} cm, atas putih ${Math.round(cfg.wallZones.topH * 100)} cm</h3>`;
  h += `<table><thead><tr><th>Kamar mandi / sisi</th><th class="num">Panjang</th><th class="num">Terakota</th><th class="num">Putih</th></tr></thead><tbody>`;
  for (const b of R.baths) {
    h += `<tr class="total"><td>${b.name} <span class="badge">keliling ${b.perimeter} m</span></td><td class="num">${b.areaBawah + b.areaAtas} m²</td><td class="num">${b.bawah.total} keping<br/><span class="cuts">${b.bawah.full} utuh + ${b.bawah.cuts} potongan</span></td><td class="num">${b.atas.total} keping<br/><span class="cuts">${b.atas.full} utuh + ${b.atas.cuts} potongan</span></td></tr>`;
    for (const w of b.walls) {
      h += `<tr><td>&nbsp;&nbsp;${w.wall}<div class="cuts">${w.name}</div></td><td class="num">${w.len} m</td><td class="num">${w.byZone.bawah.total}<div class="cuts">${w.byZone.bawah.cutList.map((c) => c.ukuran + '×' + c.jumlah).join(', ') || 'tanpa potongan'}</div></td><td class="num">${w.byZone.atas.total}<div class="cuts">${w.byZone.atas.cutList.map((c) => c.ukuran + '×' + c.jumlah).join(', ') || 'tanpa potongan'}</div></td></tr>`;
    }
  }
  h += `<tr class="total"><td>Total 3 kamar mandi</td><td class="num">${r1(R.wall.bawah.area + R.wall.atas.area)} m²</td><td class="num">${R.wall.bawah.area} m² · ${R.wall.bawah.pieces} keping<br/>+${cfg.wastePct}% = ${R.wall.bawah.withWaste} = <b>${R.wall.bawah.boxes} dus</b></td><td class="num">${R.wall.atas.area} m² · ${R.wall.atas.pieces} keping<br/>+${cfg.wastePct}% = ${R.wall.atas.withWaste} = <b>${R.wall.atas.boxes} dus</b></td></tr></tbody></table>
  <p class="muted">Tinggi pintu 210 cm = 7 baris × 30 cm, jadi di atas pintu pas 1 baris penuh. Jendela kecil diasumsikan 60×50 cm di sisi luar (ambang 170 cm). Kalau tinggi zona dipakai 100/140 cm seperti catatan tukang, tiap dinding butuh 1 baris potongan 10 cm memanjang — ubah di Setelan untuk membandingkan.</p>`;

  h += `<h3>Lantai kamar mandi</h3><p>${R.bathFloorSummary.tile.label}: 3 KM × 1,60 × 1,35 m = ${R.bathFloorSummary.area} m² → ${R.bathFloorSummary.pieces} keping (+cadangan ${R.bathFloorSummary.withWaste}) = ${R.bathFloorSummary.boxes} dus. ${cfg.bathFloorMode === '80' ? 'Catatan: 80×80 di ruang 1,6 × 1,35 m hampir semuanya potongan, dan permukaan polos licin saat basah. Gambar DED memakai keramik 30×30 structured; opsi 40×40 kasar bisa dipilih di Setelan.' : ''}</p>`;

  h += `<h3>Pembanding dengan catatan tukang</h3><table><thead><tr><th>Item</th><th class="num">Tukang</th><th class="num">Dari gambar</th><th>Catatan</th></tr></thead><tbody>`;
  const g = (name) => R.groups.find((x) => x.name === name);
  const rows = [
    ['Lantai 1 (granit polos)', '60 m²', `${g('Lantai 1')?.area} m² (${g('Lantai 1')?.pieces} keping)`, 'Sudah termasuk 3 lantai toilet? Kalau ya selisih ±2–3 m². Angka tukang wajar (≈ +4% cadangan).'],
    ['Lantai 2 (granit polos)', '62,5 m²', `${g('Lantai 2')?.area} m² (${g('Lantai 2')?.pieces} keping)`, 'Catatan tukang "60 − 7,5 = 62,5" salah hitung. Void 2,0 × 5,5 m & tangga L mengikuti model SketchUp. Beda ±14 m² ≈ 22 keping ≈ 11 dus.'],
    ['Teras bawah (structured)', '21 m²', `${g('Lantai luar (teras bawah)')?.area} m²`, 'Gambar: teras depan 3,35×1,43 (tanpa 2 anak tangga) + teras belakang. 21 m² tercapai kalau ruang jemur (7 m²) ikut digranit — cek dulu ke tukang.'],
    ['Teras atas (structured)', '27 m²', `${g('Lantai luar (teras atas)')?.area} m²`, 'Gambar: balkon depan + strip kiri KT utama + balkon belakang = 18,4 m². Selisih 8,6 m² ≈ 13 keping — tanya apa ada area lain (mis. dak tambahan).'],
    ['Dinding KM bawah (terakota)', '30 m²', `${R.wall.bawah.area} m²`, `Tukang pakai keliling 10 m/KM; gambar 5,9 m/KM (1,75 × 1,5 as). Beda ±${r1(30 - R.wall.bawah.area)} m² ≈ ${Math.ceil((30 - R.wall.bawah.area) / 1.44)} dus.`],
    ['Dinding KM atas (putih)', '42 m²', `${R.wall.atas.area} m²`, `Beda ±${r1(42 - R.wall.atas.area)} m² ≈ ${Math.ceil((42 - R.wall.atas.area) / 1.44)} dus. Kalau KM di lapangan memang lebih besar dari gambar, ukur ulang dulu sebelum beli.`],
    ['Lantai KM', '9 m²', `${R.bathFloorSummary.area} m²`, 'Tukang pakai luas as (1,75×1,5 ≈ 2,6 → dibulatkan 3); bersih 2,16 m²/KM.'],
    ['Plin', '± 6 dus', `${R.plinthTotal.tiles} keping = ${R.plinthTotal.boxes} dus`, 'Cocok.'],
  ];
  for (const r of rows) h += `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="cuts">${r[3]}</td></tr>`;
  h += `</tbody></table>
  <div class="warn"><b>Saran urutan pasang (80×80):</b> ruang terbuka lantai 1 (dapur–r. makan–r. keluarga) dipasang sebagai satu grid menerus, mulai dari sudut depan-kanan (pintu utama) supaya keping utuh terlihat di area yang paling dilihat, dan potongan jatuh di bawah kitchen set / di tepi tangga. Kamar tidur 3,35 × 3,35 m: 4 keping utuh + 1 strip 15 cm per baris (8 strip 15×80 + 1 sudut 15×15 → cukup 2 keping korban). Nat 2–3 mm, mulai pasang dari pintu ke dalam.</div>`;
  el.innerHTML = h;
  el.querySelectorAll('tr.row-click').forEach((tr) => tr.addEventListener('click', () => onPick(tr.dataset.id)));
}

// ---------------------------------------------------------------------------
// Galeri gambar (halaman PDF yang sudah dirender ke JPG)
// ---------------------------------------------------------------------------
const PAGES = [
  { title: 'Rancangan Arsitektur', tab: 'arsitek', items: [[42, 'Denah rencana lantai 1'], [43, 'Denah rencana lantai 2'], [44, 'Tampak depan & belakang'], [45, 'Denah kusen lantai 1'], [46, 'Denah kusen lantai 2'], [47, 'Detail kusen pintu'], [48, 'Detail kusen pintu/jendela'], [49, 'Detail kusen'], [50, 'Detail kusen'], [51, 'Detail kusen'], [52, 'Denah plafond lantai 1'], [53, 'Denah plafond lantai 2'], [54, 'Denah penutup lantai 1 (pola granit)'], [55, 'Denah penutup lantai 2 (pola granit)']] },
  { title: 'Struktur beton bertulang', tab: 'arsitek', items: [[57, 'Denah pondasi/sloof'], [58, 'Denah kolom'], [59, 'Denah balok lantai 2'], [60, 'Denah pelat lantai 2'], [61, 'Denah ring balok'], [62, 'Denah kuda-kuda/atap'], [63, 'Rencana atap'], [65, 'Detail pondasi & sloof'], [66, 'Detail kolom'], [67, 'Detail penulangan balok']] },
  { title: 'Elektrikal & plumbing', tab: 'arsitek', items: [[69, 'Titik lampu & stop kontak lt.1'], [70, 'Titik lampu & stop kontak lt.2'], [72, 'Plumbing air bersih lt.1'], [73, 'Plumbing air bersih lt.2'], [74, 'Air kotor lt.1'], [75, 'Air kotor lt.2'], [76, 'Air hujan'], [77, 'Detail sumur bor'], [78, 'Denah septictank']] },
  { title: 'Render eksterior', tab: 'render', items: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((n) => [n, `Eksterior ${n - 2}`]) },
  { title: 'Render interior', tab: 'render', items: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].map((n) => [n, `Interior ${n - 20}`]) },
];
const src = (n) => `drawings/hal-${String(n).padStart(2, '0')}.jpg`;
let flat = [];
export function renderGalleries(elArsitek, elRender) {
  if (!elArsitek && !elRender) return;
  flat = [];
  const build = (el, tab) => {
    let h = '';
    for (const sec of PAGES.filter((s) => s.tab === tab)) {
      h += `<h3>${sec.title}</h3><div class="gallery">`;
      for (const [n, cap] of sec.items) {
        const idx = flat.length;
        flat.push({ n, cap });
        h += `<figure><img loading="lazy" src="${src(n)}" data-idx="${idx}" alt="${cap}" /><figcaption>hal. ${n} — ${cap}</figcaption></figure>`;
      }
      h += `</div>`;
    }
    el.innerHTML = (tab === 'arsitek' ? `<h2>Gambar kerja (DED) — Antasena Karya Project</h2><p class="muted">Sumber: <code>1. GAMBAR RUMAH MBAK ALFI.pdf</code> (78 hal). Klik untuk memperbesar.</p>` : `<h2>3D render konsep</h2>`) + h;
  };
  if (elArsitek) build(elArsitek, 'arsitek');
  if (elRender) build(elRender, 'render');
}
export function bindLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const img = lb.querySelector('img');
  const cap = document.getElementById('lb-cap');
  let cur = 0;
  const show = (i) => { cur = (i + flat.length) % flat.length; img.src = src(flat[cur].n); cap.textContent = `hal. ${flat[cur].n} — ${flat[cur].cap}`; lb.hidden = false; };
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.tagName === 'IMG' && t.dataset.idx) show(+t.dataset.idx);
  });
  document.getElementById('lb-close').onclick = () => (lb.hidden = true);
  document.getElementById('lb-prev').onclick = () => show(cur - 1);
  document.getElementById('lb-next').onclick = () => show(cur + 1);
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.hidden = true; });
  addEventListener('keydown', (e) => { if (lb.hidden) return; if (e.key === 'Escape') lb.hidden = true; if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
}
