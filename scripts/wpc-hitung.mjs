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
const CADANGAN = 0.05; // jeda error di atas sisa potong yang sudah dihitung: salah potong, cacat, rusak saat pasang
const rp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const f2 = (n) => n.toFixed(2).replace('.', ',');

const MIN_SAMBUNG = 1.0; // potongan terpendek untuk menyambung lajur > 5 m (harus menumpu ≥ 2 rangka, jarak 40–60 cm)
/** lajur per bidang: lajur = ceil(lintang / eff), tiap lajur sepanjang bujur. Lajur ≤ 5 m = satu potong utuh (tanpa
 *  sambungan); lajur > 5 m (gimbal, plafon bawah/atas balkon samping) memang harus disambung di atas rangka. */
function lajurBidang(rects, eff) {
  const tetap = [], panjang = [];
  for (const r of rects) {
    const n = Math.ceil(r.lintang / eff - 1e-9);
    for (let i = 0; i < n; i++) (r.bujur > 5 + 1e-9 ? panjang : tetap).push(r.bujur);
  }
  return { tetap, panjang };
}
/** Rencana potong. 1) lajur utuh dipaketkan best-fit decreasing ke batang 3 m / 5 m (batang baru 5 m kalau potongan > ambang).
 *  2) lajur panjang disusun dari sisa potongan (≥ MIN_SAMBUNG) dulu, baru batang baru — sambungan tetap di atas rangka. */
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
    let rem = len;
    while (rem > 1e-9) {
      let fit = null; for (const b of bins) if (b.sisa >= rem + POTONG - 1e-9 && (!fit || b.sisa < fit.sisa)) fit = b;
      if (fit) { fit.sisa -= rem + POTONG; rem = 0; break; } // ujung lajur dari sisa yang pas
      let big = null, pakai = 0; // sisa potongan terbesar, ekor lajur tetap ≥ MIN_SAMBUNG
      for (const b of bins) { const u = Math.min(b.sisa - POTONG, rem - MIN_SAMBUNG); if (u >= MIN_SAMBUNG - 1e-9 && u > pakai) { big = b; pakai = u; } }
      if (big) { big.sisa -= pakai + POTONG; rem -= pakai; sambungan++; continue; }
      if (rem + POTONG <= 5 + 1e-9) { baru(rem + POTONG).sisa -= rem + POTONG; rem = 0; }
      else { const u = Math.min(5 - POTONG, rem - MIN_SAMBUNG); baru(5).sisa -= u + POTONG; rem -= u; sambungan++; }
    }
  }
  const n3 = bins.filter((b) => b.L === 3).length, n5 = bins.filter((b) => b.L === 5).length;
  const terpasang = [...tetap, ...panjang].reduce((s, p) => s + p, 0);
  return { n3, n5, meter: n3 * 3 + n5 * 5, sisa: bins.reduce((s, b) => s + b.sisa, 0), terpasang, sambungan };
}
/** semua variasi ambang 3 m / 5 m; pilih yang termurah per batang dan (terpisah) termurah kalau beli per box. */
function varian(lajur, P) {
  return [0, 1, 1.5, 2, 2.5, 3].map((ambang) => {
    const r = paket(lajur, ambang);
    const c3 = Math.ceil(r.n3 * (1 + CADANGAN) - 1e-9), c5 = Math.ceil(r.n5 * (1 + CADANGAN) - 1e-9);
    const b3 = Math.ceil(c3 / P.isiBox), b5 = Math.ceil(c5 / P.isiBox);
    return { ...r, c3, c5, harga: c3 * P.harga[3] + c5 * P.harga[5], b3, b5, hargaBox: (b3 * P.harga[3] + b5 * P.harga[5]) * P.isiBox };
  });
}
const luas = (rects) => rects.reduce((s, r) => s + r.lintang * r.bujur, 0);
function hitung(prodKey, skenario, filter = () => true) {
  const P = PRODUK[prodKey];
  const items = AREA.filter(filter);
  const rect = (a) => (skenario === 'hemat' ? a.hemat || a.ukur : a[skenario]);
  const lj = items.map((a) => lajurBidang(rect(a), P.eff));
  const vs = varian({ tetap: lj.flatMap((l) => l.tetap), panjang: lj.flatMap((l) => l.panjang) }, P);
  const pilih = (k) => vs.reduce((m, v) => (v[k] < m[k] - 1e-6 || (Math.abs(v[k] - m[k]) < 1e-6 && v.n3 + v.n5 < m.n3 + m.n5) ? v : m));
  const r = pilih('harga'), bx = pilih('hargaBox');
  const L = items.reduce((s, a) => s + luas(rect(a)), 0);
  return { ...r, box: bx.b3 + bx.b5, boxRinci: bx, luas: L, minBatang: Math.ceil(L / (P.eff * 5) - 1e-9) };
}

const KAT = { plafon: (a) => a.jenis === 'plafon', dinding: (a) => a.jenis === 'dinding', tiang: (a) => a.jenis === 'tiang', semua: () => true };
let md = `# Kebutuhan WPC Duma — plafon luar, gimbal, wall panel, tutup tiang\n\n`;
md += `Dihitung otomatis oleh \`scripts/wpc-hitung.mjs\` dari \`src/layout/wpc.js\` (data yang sama dengan lapisan WPC di model 3D, tombol **J**). `;
md += `Ukuran utama = ukuran lapangan tukang; pembanding = model SKP / DED. Harga = daftar harga Duma per batang (isi 10/box).\n\n`;
md += `Cara hitung:\n\n`;
md += `1. Tiap bidang dibagi lajur selebar **lebar efektif** papan (dibulatkan ke atas; lajur tepi dibelah). Tiap lajur sepanjang bidang + 1 cm rapikan per potong.\n`;
md += `2. **Rencana potong**: lajur ≤ 5 m dipasang utuh tanpa sambungan; potongannya dipaketkan ke batang 3 m / 5 m supaya sisa potong terpakai di bidang lain. `;
md += `Lajur > 5 m (gimbal, plafon balkon samping) memang harus disambung di atas rangka, jadi disusun dari sisa potongan ≥ ${f2(MIN_SAMBUNG)} m dulu baru batang baru.\n`;
md += `3. Ditambah **cadangan ${CADANGAN * 100} %** untuk salah potong / papan cacat (sisa potong sudah dihitung di langkah 2, jadi tidak didobel).\n`;
md += `4. Dipilih kombinasi 3 m / 5 m termurah — terpisah untuk beli per batang dan beli per box (isi 10).\n\n`;

const BASE = 'm100', hb = hitung(BASE, 'ukur');
const totLuas = luas(AREA.flatMap((a) => a.ukur));
md += `## Bidang\n\n| No. tukang | Bidang | Ukuran tukang | Luas | ≈ biaya ${PRODUK[BASE].nama.replace('Duma ', '')} | Model / DED | Catatan |\n|---|---|---|---|---|---|---|\n`;
for (const a of AREA) {
  const u = a.ukur.length > 1 && a.jenis !== 'plafon' ? a.ukur.map((r) => `${f2(r.lintang)}`).join(' + ') + ` × ${f2(a.ukur[0].bujur)}` : a.ukur.map((r) => `${f2(r.lintang)} × ${f2(r.bujur)}`).join(' + ');
  md += `| ${a.no} | ${a.nama} | ${u} | ${f2(luas(a.ukur))} m² | ${rp(Math.round((luas(a.ukur) / totLuas) * hb.harga / 1000) * 1000)} | ${f2(luas(a.desain))} m² | ${a.catatan || ''} |\n`;
}
md += `| | **Total** | | **${f2(totLuas)} m²** | **${rp(hb.harga)}** | ${f2(luas(AREA.flatMap((a) => a.desain)))} m² | |\n\n`;
md += `Biaya per bidang = bagian luas × total (termasuk sisa potong & cadangan), untuk menimbang bidang mana yang paling mahal.\n\n`;

const beli = (r) => [r.c3 && `${r.c3} × 3 m`, r.c5 && `${r.c5} × 5 m`].filter(Boolean).join(' + ');
const box = (x) => [x.b3 && `${x.b3} box 3 m`, x.b5 && `${x.b5} box 5 m`].filter(Boolean).join(' + ');
md += `## Kebutuhan per produk (satu produk untuk semua bidang, ukuran tukang)\n\n`;
md += `| Produk | Harga per m² | Batang 5 m pas (luas tanpa sisa) | Rencana potong | + cadangan ${CADANGAN * 100} % | Harga beli per batang | Beli per box (isi 10) |\n|---|---|---|---|---|---|---|\n`;
const ringkas = {};
for (const k of Object.keys(PRODUK)) {
  const u = hitung(k, 'ukur'), d = hitung(k, 'hemat'); ringkas[k] = { u, d };
  md += `| ${PRODUK[k].nama} | ${rp(PRODUK[k].harga[5] / (5 * PRODUK[k].eff))} | ${u.minBatang} | ${[u.n3 && `${u.n3} × 3 m`, u.n5 && `${u.n5} × 5 m`].filter(Boolean).join(' + ')} (sisa ${f2(u.sisa)} m) | ${beli(u)} | **${rp(u.harga)}** | **${box(u.boxRinci)}**, ${rp(u.boxRinci.hargaBox)} |\n`;
}
md += `\n### Skenario hemat*\n\n| Produk | Luas | Batang | Harga per batang | Per box |\n|---|---|---|---|---|\n`;
for (const k of Object.keys(PRODUK)) { const { d } = ringkas[k]; md += `| ${PRODUK[k].nama} | ${f2(d.luas)} m² | ${beli(d)} | ${rp(d.harga)} | ${box(d.boxRinci)}, ${rp(d.boxRinci.hargaBox)} |\n`; }
md += `\n\\* Plafon balkon belakang lt2 ternyata 1,70 × 3,00 (sama dengan teras di bawahnya) dan tiang lt2 cukup dilapis sampai plafon balkon (2,40 m). Item lain tetap ukuran tukang.\n\n`;

md += `## Rincian per kelompok (${PRODUK[BASE].nama})\n\n| Kelompok | Luas | Rencana potong | Sisa potong | + cadangan | Harga |\n|---|---|---|---|---|---|\n`;
for (const kat of ['plafon', 'dinding', 'tiang']) {
  const r = hitung(BASE, 'ukur', KAT[kat]);
  md += `| ${kat === 'dinding' ? 'wall panel celengan' : kat === 'tiang' ? 'tutup tiang' : 'plafon + gimbal'} | ${f2(r.luas)} m² | ${r.n3} × 3 m + ${r.n5} × 5 m | ${f2(r.sisa)} m | ${beli(r)} | ${rp(r.harga)} |\n`;
}
const mGrup = ['plafon', 'dinding', 'tiang'].reduce((t, kat) => { const r = hitung(BASE, 'ukur', KAT[kat]); return t + r.c3 * 3 + r.c5 * 5; }, 0);
md += `\nTiap kelompok di atas dipaketkan sendiri. Celengan dan tiang dipasang tegak 3,30–3,65 m, jadi tiap batang 5 m menyisakan 1,3–1,7 m. `;
md += `Total ${hb.boxRinci.b3 + hb.boxRinci.b5} box di atas **mengandaikan sisa itu dipakai tukang untuk menyambung lajur gimbal & plafon balkon samping** (lajur > 5 m yang memang harus disambung; sambungan di atas rangka, tambah potongan hollow kalau perlu). `;
md += `Kalau sisa itu dibuang, kebutuhan naik jadi ± ${Math.ceil(mGrup / (5 * PRODUK[BASE].isiBox))} box.\n\n`;

md += `## Belum termasuk\n\n- Lis / list tepi (U-trim, siku) dan end cap: plafon ± ${Math.round(AREA.filter(KAT.plafon).reduce((s, a) => s + a.ukur.reduce((t, r) => t + 2 * (r.lintang + r.bujur), 0), 0))} m keliling bidang (batas atas), tiang 4 sudut × tinggi = ${f2(AREA.filter(KAT.tiang).reduce((s, a) => s + 4 * a.ukur[0].bujur, 0))} m, celengan ± ${f2(4 * 3.30 + 2 * 3.80)} m.\n`;
md += `- Rangka hollow galvalum 2×4 / 4×4 (jarak 40–60 cm), sekrup, sealant, ongkos pasang.\n`;
md += `- Kode warna: Modern 100/150 tersedia B2, BC, BT, WG, C2, BW, E; Neo Modern 200 hanya BT, C2 (dari daftar harga).\n`;
writeFileSync(join(root, 'docs/wpc-kebutuhan.md'), md);

// ringkasan ke konsol
for (const k of Object.keys(PRODUK)) {
  const { u, d } = ringkas[k];
  console.log(`${PRODUK[k].nama.padEnd(22)} ukur: min ${u.minBatang} | ${u.c3}×3m + ${u.c5}×5m = ${u.c3 + u.c5} btg ${rp(u.harga)} | box ${u.boxRinci.b3}+${u.boxRinci.b5} ${rp(u.boxRinci.hargaBox)} | bersih ${u.n3}+${u.n5}, sisa ${u.sisa.toFixed(1)} m, sambung ${u.sambungan} | hemat: ${d.c3}+${d.c5} btg ${rp(d.harga)} box ${d.boxRinci.b3}+${d.boxRinci.b5} ${rp(d.boxRinci.hargaBox)} luas ${d.luas.toFixed(2)}`);
  for (const kat of ['plafon', 'dinding', 'tiang']) { const r = hitung(k, 'ukur', KAT[kat]); console.log(`   ${kat.padEnd(8)} ${r.luas.toFixed(2)} m2  bersih ${r.n3}+${r.n5}  +err ${r.c3}+${r.c5}  ${rp(r.harga)}`); }
}
console.log('luas ukur', luas(AREA.flatMap((a) => a.ukur)).toFixed(2), 'desain', luas(AREA.flatMap((a) => a.desain)).toFixed(2));
