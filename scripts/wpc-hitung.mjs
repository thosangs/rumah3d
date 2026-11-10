#!/usr/bin/env node
// Kebutuhan WPC Duma untuk plafon outdoor (gimbal atap + plafon teras / balkon) dari src/layout/wpc.js, beli per box isi 10.
// Tutup tiang memakai produk wall panel (harga lain) dan celengan tidak dilapis, jadi keduanya tidak dihitung di sini.
// Jalankan: node scripts/wpc-hitung.mjs → docs/wpc-kebutuhan.md
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUK, AREA, LIS } from '../src/layout/wpc.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const POTONG = 0.01; // tambahan per potongan: rapikan ujung / gergaji
const CADANGAN = 0.05; // di atas sisa potong yang sudah dihitung: salah potong, papan cacat, rusak saat pasang
const MIN_SAMBUNG = 1.0; // potongan terpendek untuk menyambung lajur > 5 m (menumpu ≥ 2 rangka, jarak 40–60 cm)
const rp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const f2 = (n) => n.toFixed(2).replace('.', ',');
const PLAFON = AREA.filter((a) => a.jenis === 'plafon');
const GRUP = { gimbal: (a) => a.id === 'P1', teras: (a) => a.id !== 'P1' };

/** Lajur per bidang: ceil(lintang / lebar efektif), tiap lajur sepanjang bujur. Lajur ≤ 5 m = satu potong utuh;
 *  lajur > 5 m (gimbal, plafon balkon samping) harus disambung di atas rangka. */
function lajurBidang(rects, eff) {
  const tetap = [], panjang = [];
  for (const r of rects) {
    const n = Math.ceil(r.lintang / eff - 1e-9);
    for (let i = 0; i < n; i++) (r.bujur > 5 + 1e-9 ? panjang : tetap).push(r.bujur);
  }
  return { tetap, panjang };
}
/** Rencana potong. Lajur utuh dipaketkan best-fit decreasing ke batang 3 m / 5 m (batang baru 5 m kalau potongan > ambang),
 *  lalu lajur panjang disusun dari sisa potongan ≥ MIN_SAMBUNG dulu, baru batang baru. */
function paket({ tetap, panjang }, ambang) {
  const bins = [];
  const baru = (p) => { const L = p > 3 + 1e-9 || p > ambang ? 5 : 3; const b = { L, sisa: L }; bins.push(b); return b; };
  for (const len of [...tetap].sort((a, b) => b - a)) {
    const p = len + POTONG;
    let best = null; for (const b of bins) if (b.sisa >= p - 1e-9 && (!best || b.sisa < best.sisa)) best = b;
    (best || baru(p)).sisa -= p;
  }
  let sambungan = 0;
  for (const len of [...panjang].sort((a, b) => b - a)) {
    let rem = len, potong = 0;
    const maks = Math.ceil(len / (5 - POTONG) - 1e-9) + 1; // paling banyak 1 sambungan lebih dari minimum
    const cukup = (r) => Math.ceil(r / (5 - POTONG) - 1e-9) <= maks - potong - 1; // sisa lajur masih bisa ditutup
    while (rem > 1e-9) {
      let fit = null; for (const b of bins) if (b.sisa >= rem + POTONG - 1e-9 && (!fit || b.sisa < fit.sisa)) fit = b;
      if (fit) { fit.sisa -= rem + POTONG; rem = 0; break; } // ujung lajur dari sisa yang pas
      let big = null, pakai = 0; // sisa potongan terbesar, ekor lajur tetap ≥ MIN_SAMBUNG
      for (const b of bins) { const u = Math.min(b.sisa - POTONG, rem - MIN_SAMBUNG); if (u >= MIN_SAMBUNG - 1e-9 && u > pakai && cukup(rem - u)) { big = b; pakai = u; } }
      if (big) { big.sisa -= pakai + POTONG; rem -= pakai; sambungan++; potong++; continue; }
      if (rem + POTONG <= 5 + 1e-9) { baru(rem + POTONG).sisa -= rem + POTONG; rem = 0; }
      else { const u = Math.min(5 - POTONG, rem - MIN_SAMBUNG); baru(5).sisa -= u + POTONG; rem -= u; sambungan++; potong++; }
    }
  }
  const n3 = bins.filter((b) => b.L === 3).length, n5 = bins.filter((b) => b.L === 5).length;
  return { n3, n5, sisa: bins.reduce((s, b) => s + b.sisa, 0), sambungan };
}
const luas = (rects) => rects.reduce((s, r) => s + r.lintang * r.bujur, 0);
/** Semua variasi ambang 3 m / 5 m → + cadangan → dibulatkan ke box; ambil yang termurah (seri: box paling sedikit). */
function hitung(k, skenario, filter = () => true) {
  const P = PRODUK[k];
  const items = PLAFON.filter(filter);
  const rect = (a) => (skenario === 'hemat' ? a.hemat || a.ukur : a[skenario]);
  const lj = items.map((a) => lajurBidang(rect(a), P.eff));
  const lajur = { tetap: lj.flatMap((l) => l.tetap), panjang: lj.flatMap((l) => l.panjang) };
  let best = null, semua5 = null;
  for (const ambang of [0, 1, 1.5, 2, 2.5, 3]) {
    const r = paket(lajur, ambang);
    const b3 = Math.ceil(Math.ceil(r.n3 * (1 + CADANGAN) - 1e-9) / P.isiBox), b5 = Math.ceil(Math.ceil(r.n5 * (1 + CADANGAN) - 1e-9) / P.isiBox);
    const v = { ...r, b3, b5, box: b3 + b5, harga: (b3 * P.harga[3] + b5 * P.harga[5]) * P.isiBox };
    if (ambang === 0) semua5 = v; // batang baru selalu 5 m
    if (!best || v.harga < best.harga - 1 || (Math.abs(v.harga - best.harga) <= 1 && v.box < best.box)) best = v;
  }
  const L = items.reduce((s, a) => s + luas(rect(a)), 0);
  return { ...best, semua5, luas: L, cadangan: (best.b3 + best.b5) * P.isiBox - best.n3 - best.n5 };
}
const kotak = (r) => [r.b3 && `${r.b3} box 3 m`, r.b5 && `${r.b5} box 5 m`].filter(Boolean).join(' + ');
const btg = (r) => [r.n3 && `${r.n3} × 3 m`, r.n5 && `${r.n5} × 5 m`].filter(Boolean).join(' + ');

let md = `# Kebutuhan plafon WPC Duma (outdoor)\n\n`;
md += `Dihitung otomatis oleh \`scripts/wpc-hitung.mjs\` dari \`src/layout/wpc.js\` (data yang sama dengan lapisan WPC di model 3D, tombol **J**). `;
md += `Ukuran = ukuran lapangan tukang. Harga = daftar harga Duma, **beli per box isi 10 batang**.\n\n`;
md += `Yang dihitung hanya plafon outdoor: gimbal atap dan plafon teras / balkon. Tutup tiang memakai produk wall panel (dihitung terpisah); celengan fasad tidak dilapis WPC.\n\n`;
md += `Cara hitung:\n\n`;
md += `1. Tiap bidang dibagi lajur selebar **lebar efektif** papan (dibulatkan ke atas; lajur tepi dibelah). Tiap lajur sepanjang bidang + 1 cm rapikan per potong.\n`;
md += `2. **Rencana potong**: lajur ≤ 5 m dipasang utuh tanpa sambungan; potongannya dipaketkan ke batang 3 m / 5 m supaya sisa potong terpakai di bidang lain. `;
md += `Lajur > 5 m (gimbal, plafon balkon samping) memang harus disambung di atas rangka, jadi disusun dari sisa potongan ≥ ${f2(MIN_SAMBUNG)} m dulu, baru batang baru; paling banyak 1 sambungan lebih dari minimum per lajur supaya tidak tambal-sulam.\n`;
md += `3. Ditambah **cadangan ${CADANGAN * 100} %** untuk salah potong / papan cacat, lalu dibulatkan ke atas per box. Sisa batang di box terakhir ikut jadi cadangan.\n`;
md += `4. Dipilih kombinasi box 3 m / 5 m yang termurah.\n\n`;

const BASE = 'm100', hb = hitung(BASE, 'ukur'), totLuas = luas(PLAFON.flatMap((a) => a.ukur));
md += `## Bidang plafon\n\n| No. tukang | Bidang | Ukuran tukang (m) | Luas | Model / DED | Catatan |\n|---|---|---|---|---|---|\n`;
for (const a of PLAFON) md += `| ${a.no} | ${a.nama} | ${a.ukur.map((r) => `${f2(r.lintang)} × ${f2(r.bujur)}`).join(' + ')} | ${f2(luas(a.ukur))} m² | ${a.desain.length ? `${f2(luas(a.desain))} m²` : '–'} | ${a.catatan || ''} |\n`;
md += `| | **Total** | | **${f2(totLuas)} m²** | ${f2(luas(PLAFON.flatMap((a) => a.desain)))} m² | |\n\n`;

md += `## Kebutuhan per produk (beli per box isi 10)\n\n`;
md += `| Produk | Lebar efektif | Harga per m² | **Beli (termurah)** | Terpakai (rencana potong) | Cadangan | **Harga** | Alternatif semua 5 m** | Kalau balkon belakang lt2 = 3,00 m* |\n|---|---|---|---|---|---|---|---|---|\n`;
const ringkas = {};
for (const k of Object.keys(PRODUK)) {
  const P = PRODUK[k], u = hitung(k, 'ukur'), d = hitung(k, 'hemat'); ringkas[k] = { u, d };
  md += `| ${P.nama} | ${f2(P.eff * 100).replace(/0+$/, "").replace(/,$/, "")} cm | ${rp(P.harga[5] / (5 * P.eff))} | **${kotak(u)}** | ${btg(u)} | ${u.cadangan} batang | **${rp(u.harga)}** | ${u.semua5.b3 || u.semua5.b5 !== u.b5 ? `${kotak(u.semua5)}, ${rp(u.semua5.harga)}` : 'sama'} | ${kotak(d)}, ${rp(d.harga)} |\n`;
}
md += `\n\\*\\* Semua batang 5 m: sedikit lebih mahal karena pembulatan box, tapi pesan lebih gampang, sambungan di gimbal / balkon samping lebih sedikit, dan tukang lebih leluasa kalau rencana potong tidak diikuti persis.\n\n`;
md += `\\* Tukang menulis plafon balkon belakang lt2 1,70 × 4,00, padahal teras lt1 tepat di bawahnya 1,70 × 3,00 dan di desain keduanya sama (3,40 × 1,45). Perlu diukur ulang.\n\n`;

md += `## Gimbal vs plafon lain (${PRODUK[BASE].nama})\n\n| Bagian | Luas | Batang terpakai | ≈ biaya |\n|---|---|---|---|\n`;
for (const [g, f] of Object.entries(GRUP)) {
  const r = hitung(BASE, 'ukur', f);
  md += `| ${g === 'gimbal' ? 'Gimbal atap' : `Plafon teras, balkon & dak (${PLAFON.filter(f).length} bidang)`} | ${f2(r.luas)} m² | ${btg(r)} | ${rp(Math.round((r.luas / totLuas) * hb.harga / 1000) * 1000)} |\n`;
}
md += `\nBiaya per bagian = bagian luas × total harga ${PRODUK[BASE].nama} (${rp(hb.harga)}), untuk menimbang. Kalau dibeli terpisah, jumlah box bisa beda karena pembulatan box.\n\n`;

// lis: panjang dari tukang + sisa potong 5 % + cadangan 5 %, dibeli lonjor 5 m (harga per meter 3 m = 5 m, sambungan lebih sedikit)
const LIS_TAMBAH = 0.10, lonjor = Math.ceil(LIS.panjang * (1 + LIS_TAMBAH) / 5 - 1e-9);
md += `## Lis (aksesoris, dipesan per lonjor)\n\n`;
md += `Panjang lis **${LIS.panjang} m** (hitungan ${LIS.sumber}) + ${LIS_TAMBAH * 100} % (sisa potong + cadangan) = ${f2(LIS.panjang * (1 + LIS_TAMBAH))} m → **${lonjor} lonjor 5 m**. `;
md += `Keliling semua bidang plafon di data ini ± ${Math.round(PLAFON.reduce((s, a) => s + a.ukur.reduce((t, r) => t + 2 * (r.lintang + r.bujur), 0), 0))} m (batas atas, termasuk sisi yang menempel balok / dinding dan tidak perlu lis).\n\n`;
md += `| Lis | Untuk | Harga per lonjor 5 m | Per meter | ${lonjor} lonjor |\n|---|---|---|---|---|\n`;
for (const L of Object.values(LIS.produk)) md += `| ${L.nama} | ${L.pakai} | ${rp(L.harga[5])} | ${rp(L.harga[5] / 5)} | **${rp(lonjor * L.harga[5])}** |\n`;
md += `\nTipe lis tergantung detail tukang; kalau dicampur (mis. siku di tepi luar, LS di pertemuan dinding), jumlah lonjor dibagi sesuai panjang masing-masing.\n\n`;

md += `## Belum termasuk\n\n`;
md += `- Rangka hollow galvalum 2×4 / 4×4 (jarak 40–60 cm), sekrup, sealant, ongkos pasang.\n`;
md += `- Tutup tiang (wall panel) — dihitung terpisah.\n`;
md += `- Warna: ${Object.values(PRODUK).map((P) => `${P.nama.replace('Duma ', '')} ${P.warnaTersedia}`).join('; ')}.\n`;
writeFileSync(join(root, 'docs/wpc-kebutuhan.md'), md);

for (const k of Object.keys(PRODUK)) {
  const { u, d } = ringkas[k];
  console.log(`${PRODUK[k].nama.padEnd(27)} ${kotak(u).padEnd(26)} ${rp(u.harga).padEnd(14)} pakai ${btg(u)} sisa ${u.sisa.toFixed(1)} m sambung ${u.sambungan} cad ${u.cadangan} | hemat ${kotak(d)} ${rp(d.harga)}`);
}
console.log('luas plafon', totLuas.toFixed(2), 'm2', '| lis', lonjor, 'lonjor 5 m');
