// Estimasi biaya instalasi listrik (BoQ) dari data model: jumlah titik dari src/layout/elektrik.js, panjang kabel &
// pipa dihitung dari geometri (jalur lampu = polyline JALUR + turunan ke saklar; stop kontak = rantai terdekat per
// lantai dari box MCB, kabel naik ke bawah dak lalu turun ke tiap titik; AC = home-run ke box MCB).
// Harga satuan: RAB V3 (RAB RUMAH MBAK ALFI BREAKDOWN V3.pdf, bagian IX) untuk item yang sama; item baru = perkiraan pasar
// Okt 2026 (ditandai *). Jalankan: node scripts/rab-listrik.mjs → docs/rab-listrik.md
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PERANGKAT, LAMPU, JALUR } from '../src/layout/elektrik.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CEIL = { lt1: 3.6, lt2: 3.4 }; // jalur kabel di bawah dak/plat atap (di atas plafon)
const RISER = 3.8; // tinggi lantai 1 → 2
const MCB = { x: 3.065, z: 11.47, h: 1.75 }; // box MCB di KT1
const RP = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const r1 = (n) => Math.round(n * 10) / 10;

// ---------- jumlah ----------
const P = PERANGKAT, L = LAMPU;
const n = (f) => P.filter(f).length;
const Q = {
  sk: n((d) => d.t === 'stopkontak' && !d.ac && !d.wh), skBaru: n((d) => d.t === 'stopkontak' && !d.ac && !d.wh && d.baru), skAc: n((d) => d.ac), skWh: n((d) => d.wh),
  s1: n((d) => d.t === 'saklar1'), s2: n((d) => d.t === 'saklar2'), sconce: n((d) => d.t === 'sconce'),
  l9: L.filter((l) => l.w === 9).length, l5: L.filter((l) => l.w === 5).length,
};
Q.titik = Q.sk + Q.skAc + Q.skWh + Q.s1 + Q.s2 + Q.sconce + Q.l9 + Q.l5; // "titik" ala RAB: tiap lampu, stop kontak, saklar

// ---------- panjang kabel ----------
const man = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
const devAt = (lvl, x, z) => P.find((d) => d.lvl === lvl && Math.hypot(d.x - x, d.z - z) < 0.06);
// (1) cabang lampu: polyline JALUR (di bawah dak) + turunan vertikal di ujung yang menyentuh saklar/lampu dinding
let lampCabang = { lt1: 0, lt2: 0 };
for (const j of JALUR) {
  let len = 0;
  for (let i = 0; i < j.pts.length - 1; i++) len += Math.abs(j.pts[i + 1][0] - j.pts[i][0]) + Math.abs(j.pts[i + 1][1] - j.pts[i][1]);
  for (const k of [0, j.pts.length - 1]) { const d = devAt(j.lvl, ...j.pts[k]); if (d) len += CEIL[j.lvl] - d.h; }
  lampCabang[j.lvl] += len;
}
// (2) fase bersama lampu: rantai terdekat dari box MCB lewat semua saklar (naik ke dak, mendatar, turun ke saklar)
function rantai(lvl, items, start, hStart) {
  let cur = { ...start, h: hStart }, left = [...items], len = 0;
  while (left.length) {
    left.sort((a, b) => man(cur, a) - man(cur, b));
    const nx = left.shift();
    len += man(cur, nx) + (CEIL[lvl] - cur.h) + (CEIL[lvl] - nx.h);
    cur = nx;
  }
  return len;
}
const saklar = (lvl) => P.filter((d) => d.lvl === lvl && d.t.startsWith('saklar'));
const sk = (lvl) => P.filter((d) => d.lvl === lvl && d.t === 'stopkontak' && !d.ac && !d.wh);
const naikLt2 = (CEIL.lt1 - MCB.h) + RISER; // dari box MCB naik ke bawah dak lt1 lalu riser menembus plat ke bawah plafon lt2
const lampFase = { lt1: rantai('lt1', saklar('lt1'), MCB, MCB.h), lt2: naikLt2 + rantai('lt2', saklar('lt2'), MCB, CEIL.lt2) };
const skRantai = { lt1: rantai('lt1', sk('lt1'), MCB, MCB.h), lt2: naikLt2 + rantai('lt2', sk('lt2'), MCB, CEIL.lt2) };
const acRun = P.filter((d) => d.ac).map((d) => (d.lvl === 'lt2' ? naikLt2 : CEIL.lt1 - MCB.h) + man(MCB, d) + (CEIL[d.lvl] - d.h));
const acTotal = acRun.reduce((a, b) => a + b, 0);
const whRun = P.filter((d) => d.wh).map((d) => (d.lvl === 'lt2' ? naikLt2 : CEIL.lt1 - MCB.h) + man(MCB, d) + (CEIL[d.lvl] - d.h));
const whTotal = whRun.reduce((a, b) => a + b, 0);
const sisa = 1.1, slackTitik = 0.5; // 10 % pemotongan + 0,5 m per titik untuk sambungan di dos
const mLampu = (lampCabang.lt1 + lampCabang.lt2 + lampFase.lt1 + lampFase.lt2) * sisa + (Q.l9 + Q.l5 + Q.sconce + Q.s1 + Q.s2) * slackTitik; // NYM 2×1,5
const mSK = (skRantai.lt1 + skRantai.lt2) * sisa + Q.sk * slackTitik; // NYM 3×2,5
const mAC = acTotal * sisa + Q.skAc * slackTitik; // NYM 3×2,5
const mWH = whTotal * sisa + Q.skWh * slackTitik; // NYM 3×2,5, grup water heater
const mFeeder = 5; // kWh → box MCB (tembok yang sama, sisi luar–dalam) NYM 3×4
const mPipa = (lampCabang.lt1 + lampCabang.lt2 + lampFase.lt1 + lampFase.lt2 + skRantai.lt1 + skRantai.lt2 + acTotal + whTotal) * 0.9 * 1.05; // 10 % jalur dipakai bersama, 5 % potongan
const roll = (m) => Math.ceil(m / 100);
const batang = Math.ceil(mPipa / 4);

// ---------- harga satuan ----------
const H = {
  sk: 75000, skAc: 95000, skWh: 110000, box8: 185000, s1: 35000, s2: 55000, l9: 105000, l5: 90000, sconce: 105000, antena: 155000,
  box6: 150000, mcb: 132500, kwh2200: 3250000, kwh3500: 4300000,
  nym215: 375000, nym325: 850000, nym34m: 15000, pipa: 12000, aks: 8750, jasa: 40000,
  grounding: 450000, elcb: 450000,
};
const bintang = new Set(['skAc', 'skWh', 'box8', 'box6', 'kwh3500', 'nym325', 'nym34m', 'grounding', 'elcb']); // perkiraan pasar
const rows = [
  ['Pasang stop kontak 1 ph 16 A (termasuk ' + Q.skBaru + ' tambahan revisi)', Q.sk, 'bh', 'sk'],
  ['Pasang stop kontak AC 16 A', Q.skAc, 'bh', 'skAc'],
  ['Pasang stop kontak water heater 16 A IP44 (tutup)', Q.skWh, 'bh', 'skWh'],
  ['Pasang sakelar tunggal', Q.s1, 'bh', 's1'],
  ['Pasang sakelar ganda', Q.s2, 'bh', 's2'],
  ['Pasang lampu LED downlight 9 W', Q.l9, 'bh', 'l9'],
  ['Pasang lampu LED downlight 5 W', Q.l5, 'bh', 'l5'],
  ['Pasang lampu LED sorot/dinding outdoor', Q.sconce, 'bh', 'sconce'],
  ['Pasang antena TV (titik)', 1, 'bh', 'antena'],
  ['Box MCB 8 group (pengganti 4 group)', 1, 'bh', 'box8'],
  ['MCB 1 fasa 10 A / 16 A (penerangan lt1, lt2; stop kontak lt1, lt2; AC lt1; AC lt2; water heater)', 7, 'bh', 'mcb'],
  ['Kabel NYM 2×1,5 mm² — jalur lampu (' + Math.round(mLampu) + ' m)', roll(mLampu), 'roll', 'nym215'],
  ['Kabel NYM 3×2,5 mm² — stop kontak (' + Math.round(mSK) + ' m) + AC (' + Math.round(mAC) + ' m) + water heater (' + Math.round(mWH) + ' m)', roll(mSK + mAC + mWH), 'roll', 'nym325'],
  ['Kabel NYM 3×4 mm² — kWh meter → box MCB', mFeeder, 'm', 'nym34m'],
  ['Pipa PVC listrik 5/8" (' + Math.round(mPipa) + ' m)', batang, 'batang', 'pipa'],
  ['Aksesori (inbow/tee-dos, klem, isolasi) per titik', Q.titik, 'titik', 'aks'],
  ['Jasa tukang instalasi per titik', Q.titik, 'titik', 'jasa'],
  ['Grounding: elektroda arde + kabel BC 6 mm² + klem', 1, 'ls', 'grounding'],
  ['kWh meter PLN 2200 VA (pasang baru, SLO)', 1, 'unit', 'kwh2200'],
];
const total = rows.reduce((a, [, q, , k]) => a + q * H[k], 0);
const OP = 0.15, RAB_IX_OP = 23762162.5; // RAB: overhead 5 % + profit 10 % di atas harga satuan
const opsi = [
  ['Upgrade daya ke 3500 VA (selisih dari 2200 VA)', H.kwh3500 - H.kwh2200],
  ['ELCB/RCBO 2P 30 mA untuk grup stop kontak (keamanan)', H.elcb],
];
const RABV3 = [['Instalasi 65 titik (kabel 2 m/titik, pipa, aksesori, jasa)', 5248750], ['Downlight 9 W ×15', 1575000], ['Downlight 5 W ×19', 1710000], ['Sorot outdoor ×3', 315000], ['Sakelar tunggal ×6', 210000], ['Sakelar ganda ×9', 495000], ['Sakelar triple ×1', 95000], ['Stop kontak ×21', 1575000], ['Antena TV', 155000], ['Box MCB ×2', 204000], ['MCB 1 fasa ×4', 530000], ['NYM 2×2,5 ×4 roll', 2300000], ['NYM 2×1,5 ×8 roll', 3000000], ['kWh meter 2200 VA', 3250000]];
const rabTotal = RABV3.reduce((a, [, v]) => a + v, 0);

// ---------- tulis ----------
let md = `# Estimasi Biaya Instalasi Listrik — Rumah Mbak Alfi (revisi 04-10-2026)\n\n`;
md += `Dihitung otomatis oleh \`scripts/rab-listrik.mjs\` dari data model 3D (\`src/layout/elektrik.js\`). Harga satuan mengikuti **RAB V3 bagian IX** untuk item yang sama; item bertanda \\* adalah perkiraan harga pasar (Okt 2026) karena tidak ada di RAB.\n\n`;
md += `## A. Kuantitas\n\n| Item | Jumlah |\n|---|---:|\n`;
md += `| Stop kontak biasa (DED ${Q.sk - Q.skBaru} + revisi ${Q.skBaru}) | ${Q.sk} |\n| Stop kontak AC | ${Q.skAc} |\n| Stop kontak water heater (IP44) | ${Q.skWh} |\n| Sakelar tunggal / ganda | ${Q.s1} / ${Q.s2} |\n| Downlight 9 W / 5 W | ${Q.l9} / ${Q.l5} |\n| Lampu sorot/dinding outdoor | ${Q.sconce} |\n| **Titik instalasi (lampu + stop kontak + sakelar)** | **${Q.titik}** (RAB: 65) |\n\n`;
md += `### Panjang jalur (dari geometri model)\n\n| Jalur | Lantai 1 | Lantai 2 | Keterangan |\n|---|---:|---:|---|\n`;
md += `| Cabang lampu (polyline denah + turunan ke sakelar) | ${r1(lampCabang.lt1)} m | ${r1(lampCabang.lt2)} m | NYM 2×1,5 |\n`;
md += `| Fase bersama lampu (box MCB → semua sakelar) | ${r1(lampFase.lt1)} m | ${r1(lampFase.lt2)} m | NYM 2×1,5, lt2 termasuk riser ${RISER} m |\n`;
md += `| Rantai stop kontak (box MCB → tiap titik, naik–turun dak) | ${r1(skRantai.lt1)} m | ${r1(skRantai.lt2)} m | NYM 3×2,5 |\n`;
md += `| Home-run AC (${acRun.map(r1).join(' + ')} m) | | | ${r1(acTotal)} m, NYM 3×2,5 |\n`;
md += `| Home-run water heater (${whRun.map(r1).join(' + ')} m) | | | ${r1(whTotal)} m, NYM 3×2,5 |\n`;
md += `| **Kabel dibeli** (+10 % potongan, +0,5 m/titik) | | | NYM 2×1,5 **${Math.round(mLampu)} m** → ${roll(mLampu)} roll; NYM 3×2,5 **${Math.round(mSK + mAC + mWH)} m** → ${roll(mSK + mAC + mWH)} roll |\n`;
md += `| **Pipa 5/8"** (90 % jalur, +5 % potongan) | | | **${Math.round(mPipa)} m** → ${batang} batang @4 m |\n\n`;
md += `## B. Rencana anggaran (revisi)\n\n| No | Uraian | Vol | Sat | Harga satuan | Jumlah |\n|---:|---|---:|---|---:|---:|\n`;
rows.forEach(([u, q, sat, k], i) => { md += `| ${i + 1} | ${u}${bintang.has(k) ? ' \\*' : ''} | ${q} | ${sat} | ${RP(H[k])} | ${RP(q * H[k])} |\n`; });
md += `| | **Total (harga satuan, tanpa overhead)** | | | | **${RP(total)}** |\n| | Overhead 5 % & profit 10 % (skema RAB) | | | | ${RP(total * OP)} |\n| | **Total setara RAB** | | | | **${RP(total * (1 + OP))}** |\n\n`;
md += `Opsional (direkomendasikan):\n\n| Uraian | Jumlah |\n|---|---:|\n`;
for (const [u, v] of opsi) md += `| ${u} \\* | ${RP(v)} |\n`;
md += `| **Total dengan opsional** | **${RP(total + opsi.reduce((a, [, v]) => a + v, 0))}** |\n\n`;
md += `## C. Pembanding: RAB V3 bagian IX (listrik saja)\n\n| Uraian | Jumlah |\n|---|---:|\n`;
for (const [u, v] of RABV3) md += `| ${u} | ${RP(v)} |\n`;
md += `| **Total RAB V3 (14 baris listrik, harga satuan)** | **${RP(rabTotal)}** |\n| Total RAB V3 setelah overhead & profit (sub total IX) | ${RP(RAB_IX_OP)} |\n| **Selisih estimasi revisi − RAB V3** (basis harga satuan) | **${RP(total - rabTotal)}** (+${Math.round(((total - rabTotal) / rabTotal) * 100)} %) |\n| Selisih setelah overhead & profit | ${RP(total * (1 + OP) - RAB_IX_OP)} |\n\n`;
md += `## D. Catatan\n\n`;
md += `- RAB memakai kabel 2 inti (NYM 2×2,5 / 2×1,5) tanpa grounding; estimasi ini memakai **NYM 3×2,5 untuk stop kontak & AC plus elektroda arde** sesuai PUIL — itu penyumbang selisih terbesar. Titik ${Q.titik} vs 65 di RAB: ${Q.titik - 12 - 65} titik sudah ada di gambar DED tapi tidak terhitung di RAB (lampu carport, lampu pagar, selisih hitung), 12 titik tambahan revisi.\n`;
md += `- RAB mengalokasikan 12 roll kabel (1.200 m) tapi hanya 32,5 batang pipa (130 m); perhitungan geometri memberi ±600 m kabel dan ±480 m pipa — RAB kelebihan kabel, kekurangan pipa.\n`;
md += `- Panjang kabel dihitung dari rute ortogonal di bawah dak/plat (tinggi ${CEIL.lt1} m lt1, ${CEIL.lt2} m lt2) dengan turunan vertikal ke tiap perangkat; rantai stop kontak memakai urutan tetangga terdekat dari box MCB — realisasi tukang bisa ±15 %.\n`;
md += `- Harga RAB "Pasang …" dianggap sudah termasuk material + pemasangan; aksesori dan jasa per titik (Rp ${H.aks.toLocaleString('id-ID')} + Rp ${H.jasa.toLocaleString('id-ID')}) mengikuti angka RAB.\n`;
md += `- Water heater: daya 2200 VA hanya cukup untuk pemanas tangki low-watt (≤ 500 W, mis. 15 L); pemanas instan 2–3,5 kW butuh 3500 VA ke atas. Unit pemanasnya sendiri (±Rp 1,6–2 jt/bh) masuk pekerjaan sanitasi, tidak dihitung di sini.\n`;
md += `- Belum termasuk: titik pompa air (belum ditentukan), lampu taman/pagar tambahan (RAB lama: 8 sorot + 4 downlight carport, ±Rp 3,5 jt), biaya PLN di luar pasang baru (UJL).\n`;
writeFileSync(join(root, 'docs', 'rab-listrik.md'), md);
console.log(md);
