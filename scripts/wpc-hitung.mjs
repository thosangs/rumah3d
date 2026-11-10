#!/usr/bin/env node
// Kebutuhan WPC Duma (plafon luar, gimbal, wall panel celengan, tutup tiang) dari src/layout/wpc.js.
// Tiap bidang dipecah jadi lajur (lebar efektif papan) × panjang; potongan dipaketkan ke batang 3 m / 5 m dengan
// best-fit decreasing (sisa potongan dipakai lagi lintas bidang), mencoba beberapa aturan pilih 3 m / 5 m dan
// mengambil total meter terkecil (harga per meter 3 m = 5 m). Lalu + jeda error 10 % untuk salah potong / cacat.
// Jalankan: node scripts/wpc-hitung.mjs → docs/wpc-kebutuhan.md
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUK, AREA } from '../src/layout/wpc.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const POTONG = 0.01; // tambahan per potongan: rapikan ujung / gergaji
const CADANGAN = 0.10; // jeda error: salah potong, cacat, rusak saat pasang
const rp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const f2 = (n) => n.toFixed(2).replace('.', ',');

/** potongan (m) untuk satu bidang: lajur = ceil(lintang / eff), tiap lajur sepanjang bujur. */
function potongan(rects, eff) {
  const out = [];
  for (const r of rects) {
    const lajur = Math.ceil(r.lintang / eff - 1e-9);
    for (let i = 0; i < lajur; i++) out.push(r.bujur + POTONG);
  }
  return out;
}
/** paketkan potongan ke batang; pecah potongan > 5 m; aturan: buka batang 5 m kalau potongan > ambang. */
function paket(pieces, split, ambang) {
  const ps = [];
  for (let p of pieces) { while (p > 5 + 1e-9) { ps.push(split); p -= split - POTONG; } ps.push(p); }
  ps.sort((a, b) => b - a);
  const bins = []; // {L, sisa}
  for (const p of ps) {
    let best = null;
    for (const b of bins) if (b.sisa >= p - 1e-9 && (!best || b.sisa < best.sisa)) best = b;
    if (!best) { const L = p > 3 + 1e-9 || p > ambang ? 5 : 3; best = { L, sisa: L }; bins.push(best); }
    best.sisa -= p;
  }
  const n3 = bins.filter((b) => b.L === 3).length, n5 = bins.filter((b) => b.L === 5).length;
  return { n3, n5, meter: n3 * 3 + n5 * 5, sisa: bins.reduce((s, b) => s + b.sisa, 0), netto: ps.reduce((s, p) => s + p, 0) };
}
function optimal(pieces) {
  let best = null;
  for (const split of [5, 3]) for (const ambang of [0, 1, 1.5, 2, 2.5, 3]) {
    const r = paket(pieces, split, ambang);
    if (!best || r.meter < best.meter - 1e-9 || (Math.abs(r.meter - best.meter) < 1e-9 && r.n3 + r.n5 < best.n3 + best.n5)) best = r;
  }
  return best;
}
const luas = (rects) => rects.reduce((s, r) => s + r.lintang * r.bujur, 0);
function hitung(prodKey, skenario, filter = () => true) {
  const P = PRODUK[prodKey];
  const items = AREA.filter(filter);
  const rect = (a) => (skenario === 'hemat' ? a.hemat || a.ukur : a[skenario]);
  const pieces = items.flatMap((a) => potongan(rect(a), P.eff));
  const r = optimal(pieces);
  const c3 = Math.ceil(r.n3 * (1 + CADANGAN)), c5 = Math.ceil(r.n5 * (1 + CADANGAN));
  const harga = c3 * P.harga[3] + c5 * P.harga[5];
  const b3 = Math.ceil(c3 / P.isiBox), b5 = Math.ceil(c5 / P.isiBox);
  const hargaBox = (b3 * P.harga[3] + b5 * P.harga[5]) * P.isiBox;
  return { ...r, c3, c5, harga, b3, b5, hargaBox, luas: items.reduce((s, a) => s + luas(rect(a)), 0), box: Math.ceil(c3 / P.isiBox) + Math.ceil(c5 / P.isiBox) };
}

const KAT = { plafon: (a) => a.jenis === 'plafon', dinding: (a) => a.jenis === 'dinding', tiang: (a) => a.jenis === 'tiang', semua: () => true };
let md = `# Kebutuhan WPC Duma — plafon luar, gimbal, wall panel, tutup tiang\n\n`;
md += `Dihitung otomatis oleh \`scripts/wpc-hitung.mjs\` dari \`src/layout/wpc.js\` (data yang sama dengan lapisan WPC di model 3D, tombol **J**). `;
md += `Ukuran utama = ukuran lapangan tukang; pembanding = model SKP / DED. Harga = daftar harga Duma per batang (isi 10/box).\n\n`;
md += `Cara hitung: tiap bidang dibagi lajur selebar **lebar efektif** papan, tiap lajur dipotong sepanjang bidang (+1 cm rapikan). `;
md += `Potongan dipaketkan ke batang 3 m / 5 m sehingga sisa potongan terpakai lagi di bidang lain, dipilih kombinasi dengan total meter paling kecil. `;
md += `Lalu ditambah **jeda error ${CADANGAN * 100} %** (salah potong, cacat, rusak saat pasang), dibulatkan ke atas per batang.\n\n`;

md += `## Bidang\n\n| No. tukang | Bidang | Ukuran tukang | Luas | Model / DED | Catatan |\n|---|---|---|---|---|---|\n`;
for (const a of AREA) {
  const u = a.ukur.length > 1 && a.jenis !== 'plafon' ? a.ukur.map((r) => `${f2(r.lintang)}`).join(' + ') + ` × ${f2(a.ukur[0].bujur)}` : a.ukur.map((r) => `${f2(r.lintang)} × ${f2(r.bujur)}`).join(' + ');
  md += `| ${a.no} | ${a.nama} | ${u} | ${f2(luas(a.ukur))} m² | ${f2(luas(a.desain))} m² | ${a.catatan || ''} |\n`;
}
md += `| | **Total** | | **${f2(luas(AREA.flatMap((a) => a.ukur)))} m²** | ${f2(luas(AREA.flatMap((a) => a.desain)))} m² | |\n\n`;

md += `## Kebutuhan per produk (satu produk untuk semua bidang)\n\n| Produk | Lebar efektif | Harga per m² | Batang 3 m | Batang 5 m | Harga per batang | Kalau beli per box (isi 10) | Skenario hemat* |\n|---|---|---|---|---|---|---|---|\n`;
const ringkas = {};
for (const k of Object.keys(PRODUK)) {
  const u = hitung(k, 'ukur'), d = hitung(k, 'hemat'); ringkas[k] = { u, d };
  md += `| ${PRODUK[k].nama} | ${PRODUK[k].eff * 100} cm | ${rp(PRODUK[k].harga[5] / (5 * PRODUK[k].eff))} | ${u.c3} | ${u.c5} | **${rp(u.harga)}** | ${u.b3 + u.b5} box, ${rp(u.hargaBox)} | ${d.c3 + d.c5} btg, ${rp(d.harga)} |\n`;
}
md += `\nBatang = sudah termasuk jeda error ${CADANGAN * 100} %. Kalau toko hanya menjual per box (isi 10), sisa batang di box terakhir jadi cadangan tambahan.\n\n`;
md += `\\* Skenario hemat: plafon balkon belakang lt2 ternyata 1,70 × 3,00 (sama dengan teras di bawahnya) dan tiang lt2 cukup dilapis sampai plafon balkon (2,40 m). Item lain tetap ukuran tukang.\n\n`;

md += `## Rincian per kelompok\n\n| Produk | Kelompok | Luas | Batang bersih 3 m + 5 m | Sisa potong | + jeda error | Harga |\n|---|---|---|---|---|---|---|\n`;
for (const k of Object.keys(PRODUK)) for (const kat of ['plafon', 'dinding', 'tiang']) {
  const r = hitung(k, 'ukur', KAT[kat]);
  md += `| ${PRODUK[k].nama} | ${kat === 'dinding' ? 'wall panel celengan' : kat === 'tiang' ? 'tutup tiang' : 'plafon + gimbal'} | ${f2(r.luas)} m² | ${r.n3} + ${r.n5} | ${f2(r.sisa)} m | ${r.c3} + ${r.c5} | ${rp(r.harga)} |\n`;
}
md += `\nRincian per kelompok dipaketkan terpisah (sisa potong tidak dipakai lintas kelompok), jadi jumlahnya bisa sedikit lebih besar dari total gabungan di atas.\n\n`;

md += `## Belum termasuk\n\n- Lis / list tepi (U-trim, siku) dan end cap: plafon ± ${Math.round(AREA.filter(KAT.plafon).reduce((s, a) => s + a.ukur.reduce((t, r) => t + 2 * (r.lintang + r.bujur), 0), 0))} m keliling bidang (batas atas), tiang 4 sudut × tinggi = ${f2(AREA.filter(KAT.tiang).reduce((s, a) => s + 4 * a.ukur[0].bujur, 0))} m, celengan ± ${f2(4 * 3.30 + 2 * 3.80)} m.\n`;
md += `- Rangka hollow galvalum 2×4 / 4×4 (jarak 40–60 cm), sekrup, sealant, ongkos pasang.\n`;
md += `- Kode warna: Modern 100/150 tersedia B2, BC, BT, WG, C2, BW, E; Neo Modern 200 hanya BT, C2 (dari daftar harga).\n`;
writeFileSync(join(root, 'docs/wpc-kebutuhan.md'), md);

// ringkasan ke konsol
for (const k of Object.keys(PRODUK)) {
  const { u, d } = ringkas[k];
  console.log(`${PRODUK[k].nama.padEnd(22)} ukur: ${u.c3}×3m + ${u.c5}×5m = ${u.c3 + u.c5} btg (${u.box} box) ${rp(u.harga)} | bersih ${u.n3}+${u.n5}, sisa ${u.sisa.toFixed(1)} m | hemat: ${d.c3}+${d.c5} btg ${d.box} box ${rp(d.harga)} luas ${d.luas.toFixed(2)}`);
  for (const kat of ['plafon', 'dinding', 'tiang']) { const r = hitung(k, 'ukur', KAT[kat]); console.log(`   ${kat.padEnd(8)} ${r.luas.toFixed(2)} m2  bersih ${r.n3}+${r.n5}  +err ${r.c3}+${r.c5}  ${rp(r.harga)}`); }
}
console.log('luas ukur', luas(AREA.flatMap((a) => a.ukur)).toFixed(2), 'desain', luas(AREA.flatMap((a) => a.desain)).toFixed(2));
