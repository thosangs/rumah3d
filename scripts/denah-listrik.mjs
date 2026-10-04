// Gambar denah instalasi listrik 2D (SVG + PNG) per lantai, langsung dari data model:
//   tembok/bukaan/tangga/dak dari src/data.js, perangkat/lampu/jalur dari src/layout/elektrik.js.
// Jalankan: node scripts/denah-listrik.mjs  → docs/denah-listrik-lt1.svg, -lt2.svg (+ PNG lewat Chrome headless kalau ada)
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WALLS, RAILINGS, STAIRS, SLAB2, SITE, HALF } from '../src/data.js';
import { PERANGKAT, LAMPU, JALUR } from '../src/layout/elektrik.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'docs'); mkdirSync(OUT, { recursive: true });
const S = 60, M = 70, LEG_W = 450; // px per meter, margin, lebar panel legenda
const PLAN_W = 10 * S, PLAN_H = 20 * S;
const W = M + PLAN_W + 40 + LEG_W + M, H = M + PLAN_H + M + 20;
const X = (x) => +(M + x * S).toFixed(1), Y = (z) => +(M + z * S).toFixed(1);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const RED = '#c8102e', INK = '#111', GREY = '#666';
const TGL = '04-10-2026';
const RUANG = {
  lt1: [['DAPUR', 4.3, 4.65], ['R. MAKAN', 5.4, 6.4], ['TOILET', 3.9, 7.35], ['KAMAR TIDUR 1', 4.75, 10.85], ['R. KELUARGA', 8.25, 10.35], ['TERAS DEPAN', 4.75, 13.3], ['TERAS BLK.', 8.3, 2.3], ['R. JEMUR', 5.0, 1.0], ['CARPORT', 6.5, 17.0], ['TAMAN', 0.75, 10.0], ['SELASAR', 2.25, 5.0]],
  lt2: [['KAMAR TIDUR 2', 4.75, 4.65], ['SELASAR', 7.6, 6.4], ['VOID', 9.2, 6.4], ['TOILET', 3.9, 7.35], ['TOILET', 5.6, 7.35], ['KT UTAMA', 4.75, 10.75], ['R. KELUARGA', 8.25, 10.35], ['BALKON DEPAN', 4.0, 13.8], ['BALKON', 2.25, 11.0], ['BALKON BLK.', 8.3, 3.2]],
};
const NV = { '+z': [0, 1], '+x': [1, 0], '-z': [0, -1], '-x': [-1, 0] };

// ---- simbol (semua menerima pusat px dan warna) ----
const sym = {
  stopkontak: (cx, cy, col, ac) => `<circle cx="${cx}" cy="${cy}" r="7.5" fill="#fff" stroke="${col}" stroke-width="1.6"/><line x1="${cx - 3}" y1="${cy - 4.5}" x2="${cx - 3}" y2="${cy + 4.5}" stroke="${col}" stroke-width="1.6"/><line x1="${cx + 3}" y1="${cy - 4.5}" x2="${cx + 3}" y2="${cy + 4.5}" stroke="${col}" stroke-width="1.6"/>${ac ? `<text x="${cx}" y="${cy - 10}" font-size="9" font-weight="700" text-anchor="middle" fill="${col}">AC</text>` : ''}`,
  saklar: (cx, cy, col, n) => { let s = `<circle cx="${cx}" cy="${cy}" r="6" fill="#fff" stroke="${col}" stroke-width="1.6"/>`; for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 5; s += `<line x1="${cx + 4.2 + o}" y1="${cy - 4.2 - o}" x2="${cx + 12 + o}" y2="${cy - 12 - o}" stroke="${col}" stroke-width="1.6"/>`; } return s; },
  mcb: (cx, cy, col) => `<rect x="${cx - 13}" y="${cy - 8}" width="26" height="16" fill="${col}"/><text x="${cx}" y="${cy + 3.5}" font-size="8.5" font-weight="700" text-anchor="middle" fill="#fff">MCB</text>`,
  kwh: (cx, cy, col) => `<rect x="${cx - 10}" y="${cy - 10}" width="20" height="20" fill="#fff" stroke="${col}" stroke-width="1.6"/><path d="M${cx - 10} ${cy + 10} L${cx + 10} ${cy - 10} L${cx + 10} ${cy + 10} Z" fill="${col}"/><text x="${cx}" y="${cy - 13}" font-size="8.5" font-weight="700" text-anchor="middle" fill="${col}">kWh</text>`,
  sconce: (cx, cy, col) => `<rect x="${cx - 7}" y="${cy - 7}" width="14" height="14" fill="#fff" stroke="${col}" stroke-width="1.6"/><line x1="${cx - 7}" y1="${cy - 7}" x2="${cx + 7}" y2="${cy + 7}" stroke="${col}" stroke-width="1.4"/><line x1="${cx + 7}" y1="${cy - 7}" x2="${cx - 7}" y2="${cy + 7}" stroke="${col}" stroke-width="1.4"/>`,
  lampu: (cx, cy, col, w) => `<circle cx="${cx}" cy="${cy}" r="8" fill="#fff" stroke="${col}" stroke-width="1.6"/>${w === 9 ? `<circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="${col}" stroke-width="1.4"/>` : ''}<line x1="${cx - 11}" y1="${cy - 11}" x2="${cx + 11}" y2="${cy + 11}" stroke="${col}" stroke-width="1.4"/><line x1="${cx + 11}" y1="${cy - 11}" x2="${cx - 11}" y2="${cy + 11}" stroke="${col}" stroke-width="1.4"/>`,
};

function tembok(lvl) {
  let s = '';
  const inside = (x, z) => x > 3 && x < 10 && z > 3.5 && z < 13.5;
  for (const w of WALLS.filter((w) => w.level === lvl)) {
    const horiz = w.y1 === w.y2; const L = horiz ? w.x2 - w.x1 : w.y2 - w.y1;
    const ops = [...w.openings].sort((a, b) => a.at - b.at);
    const seg = []; let cur = 0;
    for (const o of ops) { if (o.at > cur) seg.push([cur, o.at]); cur = o.at + o.w; }
    if (cur < L) seg.push([cur, L]);
    for (const [a, b] of seg) {
      const rx = horiz ? X(w.x1 + a) : X(w.x1 - HALF), ry = horiz ? Y(w.y1 - HALF) : Y(w.y1 + a);
      const rw = horiz ? (b - a) * S : 0.15 * S, rh = horiz ? 0.15 * S : (b - a) * S;
      s += `<rect x="${rx}" y="${ry}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="url(#hatch)" stroke="${INK}" stroke-width="1"/>`;
    }
    for (const o of ops) {
      const isDoor = o.sill === 0;
      // arah ke dalam ruang: ke sisi titik pusat rumah
      const mx = horiz ? w.x1 + o.at + o.w / 2 : w.x1, mz = horiz ? w.y1 : w.y1 + o.at + o.w / 2;
      const dir = horiz ? (8.5 > mz ? 1 : -1) : (6.5 > mx ? 1 : -1);
      if (isDoor) {
        // kusen (garis tipis sisi tembok) + daun + busur 90°
        const hx = horiz ? w.x1 + o.at : w.x1, hz = horiz ? w.y1 : w.y1 + o.at; // engsel
        const ex = horiz ? hx : hx + dir * o.w, ez = horiz ? hz + dir * o.w : hz; // ujung daun terbuka
        const sx = horiz ? hx + o.w : hx, sz = horiz ? hz : hz + o.w; // ujung kusen lain
        s += `<line x1="${X(hx)}" y1="${Y(hz)}" x2="${X(ex)}" y2="${Y(ez)}" stroke="${INK}" stroke-width="1.6"/>`;
        const sweep = horiz ? (dir > 0 ? 0 : 1) : (dir > 0 ? 1 : 0);
        s += `<path d="M${X(ex)} ${Y(ez)} A${(o.w * S).toFixed(1)} ${(o.w * S).toFixed(1)} 0 0 ${sweep} ${X(sx)} ${Y(sz)}" fill="none" stroke="${GREY}" stroke-width="0.8" stroke-dasharray="3,2"/>`;
      } else {
        // jendela: dua garis kaca + garis tipis tepi tembok
        const a = o.at, b = o.at + o.w;
        const p1 = horiz ? [X(w.x1 + a), Y(w.y1)] : [X(w.x1), Y(w.y1 + a)], p2 = horiz ? [X(w.x1 + b), Y(w.y1)] : [X(w.x1), Y(w.y1 + b)];
        for (const off of [-2.2, 2.2]) s += `<line x1="${p1[0] + (horiz ? 0 : off)}" y1="${p1[1] + (horiz ? off : 0)}" x2="${p2[0] + (horiz ? 0 : off)}" y2="${p2[1] + (horiz ? off : 0)}" stroke="${INK}" stroke-width="1"/>`;
        for (const off of [-HALF * S, HALF * S]) s += `<line x1="${p1[0] + (horiz ? 0 : off)}" y1="${p1[1] + (horiz ? off : 0)}" x2="${p2[0] + (horiz ? 0 : off)}" y2="${p2[1] + (horiz ? off : 0)}" stroke="${INK}" stroke-width="0.8"/>`;
      }
    }
  }
  return s;
}
function tangga(lvl) {
  let s = '';
  const r = STAIRS.run;
  if (lvl === 'lt1') {
    for (const wd of STAIRS.winders) s += `<rect x="${X(wd.x1)}" y="${Y(wd.y1)}" width="${((wd.x2 - wd.x1) * S).toFixed(1)}" height="${((wd.y2 - wd.y1) * S).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="0.9"/>`;
    for (let z = r.yStart; z <= r.yEnd + 1e-6; z += STAIRS.tread) s += `<line x1="${X(r.x1)}" y1="${Y(z)}" x2="${X(r.x2)}" y2="${Y(z)}" stroke="${INK}" stroke-width="0.9"/>`;
    s += `<rect x="${X(r.x1)}" y="${Y(r.yStart)}" width="${((r.x2 - r.x1) * S).toFixed(1)}" height="${((r.yEnd - r.yStart) * S).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="1"/>`;
    const cx = (r.x1 + r.x2) / 2;
    s += `<line x1="${X(8.43)}" y1="${Y(4.06)}" x2="${X(cx)}" y2="${Y(4.06)}" stroke="${GREY}" stroke-width="1"/><line x1="${X(cx)}" y1="${Y(4.06)}" x2="${X(cx)}" y2="${Y(r.yEnd - 0.2)}" stroke="${GREY}" stroke-width="1" marker-end="url(#arrow)"/>`;
    s += `<text x="${X(cx) + 4}" y="${Y(6.9)}" font-size="9" fill="${GREY}" transform="rotate(90 ${X(cx) + 4} ${Y(6.9)})">NAIK</text>`;
  } else {
    for (const v of SLAB2.voids) s += `<rect x="${X(v.x1)}" y="${Y(v.y1)}" width="${((v.x2 - v.x1) * S).toFixed(1)}" height="${((v.y2 - v.y1) * S).toFixed(1)}" fill="url(#voidfill)" stroke="${INK}" stroke-width="0.9" stroke-dasharray="4,3"/>`;
    for (let z = r.yEnd - 1.2; z <= r.yEnd + 1e-6; z += STAIRS.tread) s += `<line x1="${X(r.x1)}" y1="${Y(z)}" x2="${X(r.x2)}" y2="${Y(z)}" stroke="${GREY}" stroke-width="0.8"/>`;
    for (const rl of RAILINGS.filter((q) => q.level === lvl)) s += `<line x1="${X(rl.x1)}" y1="${Y(rl.y1)}" x2="${X(rl.x2)}" y2="${Y(rl.y2)}" stroke="${INK}" stroke-width="2.4" stroke-dasharray="1,3" stroke-linecap="round"/>`;
  }
  return s;
}
function tapak(lvl) {
  let s = `<rect x="${X(0)}" y="${Y(0)}" width="${PLAN_W}" height="${PLAN_H}" fill="#fff" stroke="${INK}" stroke-width="1.6" stroke-dasharray="10,4,2,4"/>`;
  if (lvl === 'lt1') {
    const f = (r, fill) => `<rect x="${X(r.x1)}" y="${Y(r.y1)}" width="${((r.x2 - r.x1) * S).toFixed(1)}" height="${((r.y2 - r.y1) * S).toFixed(1)}" fill="${fill}" stroke="none"/>`;
    for (const t of SITE.taman) s += f(t, '#e8f0dc');
    s += f(SITE.carport, '#ececec') + f(SITE.selasarTapak, '#f3f3f3') + f(SITE.jemur, '#f0ebe3');
    s += `<rect x="${X(3)}" y="${Y(12)}" width="${3.5 * S}" height="${1.5 * S}" fill="#f6f3ee"/>`;
  } else {
    for (const r of SLAB2.rects) s += `<rect x="${X(r.x1)}" y="${Y(r.y1)}" width="${((r.x2 - r.x1) * S).toFixed(1)}" height="${((r.y2 - r.y1) * S).toFixed(1)}" fill="#f7f7f5" stroke="${GREY}" stroke-width="0.8"/>`;
  }
  return s;
}
function grid() {
  let s = '';
  for (let x = 0; x <= 10; x++) s += `<line x1="${X(x)}" y1="${Y(0)}" x2="${X(x)}" y2="${Y(20)}" stroke="#dde3ea" stroke-width="0.6"/><text x="${X(x)}" y="${Y(0) - 8}" font-size="9" text-anchor="middle" fill="${GREY}">${x}</text><text x="${X(x)}" y="${Y(20) + 16}" font-size="9" text-anchor="middle" fill="${GREY}">${x}</text>`;
  for (let z = 0; z <= 20; z++) s += `<line x1="${X(0)}" y1="${Y(z)}" x2="${X(10)}" y2="${Y(z)}" stroke="#dde3ea" stroke-width="0.6"/><text x="${X(0) - 8}" y="${Y(z) + 3}" font-size="9" text-anchor="end" fill="${GREY}">${z}</text>`;
  s += `<text x="${X(5)}" y="${Y(0) - 24}" font-size="10" text-anchor="middle" fill="${GREY}">BELAKANG (x, meter dari batas kiri kavling)</text><text x="${X(5)}" y="${Y(20) + 34}" font-size="10" text-anchor="middle" fill="${GREY}">DEPAN / JALAN</text>`;
  return s;
}
function perangkat(lvl) {
  let s = '';
  for (const j of JALUR.filter((q) => q.lvl === lvl)) s += `<polyline points="${j.pts.map(([x, z]) => `${X(x)},${Y(z)}`).join(' ')}" fill="none" stroke="#444" stroke-width="1.4" stroke-dasharray="6,4"/>`;
  for (const l of LAMPU.filter((q) => q.lvl === lvl)) s += sym.lampu(X(l.x), Y(l.z), INK, l.w);
  const labeled = []; // label tinggi hanya sekali untuk perangkat sejenis yang berdampingan (< 35 cm)
  for (const d of PERANGKAT.filter((q) => q.lvl === lvl)) {
    const [nx, nz] = NV[d.n]; const col = d.baru ? RED : INK;
    const cx = X(d.x + nx * 0.2), cy = Y(d.z + nz * 0.2);
    s += `<line x1="${X(d.x)}" y1="${Y(d.z)}" x2="${cx}" y2="${cy}" stroke="${col}" stroke-width="1.4"/>`;
    if (d.t === 'stopkontak') s += sym.stopkontak(cx, cy, col, d.ac);
    else if (d.t === 'saklar1') s += sym.saklar(cx, cy, col, 1);
    else if (d.t === 'saklar2') s += sym.saklar(cx, cy, col, 2);
    else if (d.t === 'mcb') s += sym.mcb(X(d.x + nx * 0.3), Y(d.z + nz * 0.3), col);
    else if (d.t === 'kwh') s += sym.kwh(X(d.x + nx * 0.3), Y(d.z + nz * 0.3), col);
    else if (d.t === 'sconce') s += sym.sconce(cx, cy, col);
    const std = d.t === 'stopkontak' ? 0.4 : d.t.startsWith('saklar') ? 1.4 : null;
    const dup = labeled.some((q) => q.t === d.t && Math.abs(q.h - d.h) < 0.01 && Math.hypot(q.x - d.x, q.z - d.z) < 0.35);
    if (std != null && Math.abs(d.h - std) > 0.01 && !dup) labeled.push(d);
    if (std != null && Math.abs(d.h - std) > 0.01 && !dup) s += `<text x="${cx + (nx ? nx * 14 : 11)}" y="${cy + (nz ? nz * 16 : 4) + (nx ? 3 : 0)}" font-size="8" fill="${col}" text-anchor="${nx < 0 ? 'end' : nx > 0 ? 'start' : 'middle'}">+${d.h.toFixed(2)}</text>`;
  }
  return s;
}
function legenda(lvl) {
  const P = PERANGKAT.filter((q) => q.lvl === lvl), L = LAMPU.filter((q) => q.lvl === lvl);
  const n = (f) => P.filter(f).length;
  const rows = [
    ['stopkontak', 'Stop kontak 1 ph 10/16 A, h 40 cm (dapur 115, mesin cuci 120)', n((d) => d.t === 'stopkontak' && !d.ac && !d.baru), n((d) => d.t === 'stopkontak' && !d.ac && d.baru)],
    ['ac', 'Stop kontak AC, h 220 cm, grup MCB sendiri', 0, n((d) => d.ac)],
    ['saklar1', 'Saklar tunggal, h 140 cm', n((d) => d.t === 'saklar1'), 0],
    ['saklar2', 'Saklar ganda, h 140 cm', n((d) => d.t === 'saklar2'), 0],
    ['lampu5', 'Lampu LED downlight 5 W', L.filter((l) => l.w === 5).length, 0],
    ['lampu9', 'Lampu LED downlight 9 W' + (lvl === 'lt1' ? ' (termasuk 4 carport)' : ''), L.filter((l) => l.w === 9).length, 0],
    ['sconce', 'Lampu LED sorot / dinding outdoor', n((d) => d.t === 'sconce'), 0],
    ['mcb', 'Box MCB 4 group × 10 A, h 175 cm', n((d) => d.t === 'mcb'), 0],
    ['kwh', 'kWh meter PLN 2200 VA (sisi luar), h 170 cm', n((d) => d.t === 'kwh'), 0],
    ['jalur', 'Jalur kabel NYM 2×2,5 mm² dalam pipa, di bawah dak/plafon', null, null],
  ];
  const x0 = M + PLAN_W + 40, y0 = M;
  let s = `<rect x="${x0}" y="${y0}" width="${LEG_W}" height="${PLAN_H}" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`;
  s += `<text x="${x0 + 16}" y="${y0 + 30}" font-size="16" font-weight="700" fill="${INK}">DENAH INSTALASI LISTRIK</text>`;
  s += `<text x="${x0 + 16}" y="${y0 + 52}" font-size="14" font-weight="700" fill="${INK}">${lvl === 'lt1' ? 'LANTAI 1' : 'LANTAI 2'} — REVISI ${TGL}</text>`;
  s += `<text x="${x0 + 16}" y="${y0 + 72}" font-size="10" fill="${GREY}">Rumah Mbak Alfi · skala 1 : 100 pada A3 (1 m = 60 px) · dasar: DED lembar ${lvl === 'lt1' ? '26' : '27'} (hal. ${lvl === 'lt1' ? '69' : '70'})</text>`;
  s += `<line x1="${x0 + 16}" y1="${y0 + 84}" x2="${x0+ LEG_W - 16}" y2="${y0 + 84}" stroke="${INK}" stroke-width="0.8"/>`;
  s += `<text x="${x0 + 16}" y="${y0 + 104}" font-size="10" font-weight="700" fill="${INK}">SIMBOL</text><text x="${x0 + 64}" y="${y0 + 104}" font-size="10" font-weight="700" fill="${INK}">KETERANGAN</text><text x="${x0 + LEG_W - 70}" y="${y0 + 104}" font-size="10" font-weight="700" fill="${INK}" text-anchor="end">ADA</text><text x="${x0 + LEG_W - 18}" y="${y0 + 104}" font-size="10" font-weight="700" fill="${RED}" text-anchor="end">BARU</text>`;
  let y = y0 + 128;
  for (const [k, ket, ada, baru] of rows) {
    const cx = x0 + 34, cy = y - 4, col = baru && !ada ? RED : INK;
    if (k === 'stopkontak') s += sym.stopkontak(cx, cy, col, false);
    else if (k === 'ac') s += sym.stopkontak(cx, cy, RED, true);
    else if (k === 'saklar1') s += sym.saklar(cx, cy, col, 1);
    else if (k === 'saklar2') s += sym.saklar(cx, cy, col, 2);
    else if (k === 'lampu5') s += sym.lampu(cx, cy, col, 5);
    else if (k === 'lampu9') s += sym.lampu(cx, cy, col, 9);
    else if (k === 'sconce') s += sym.sconce(cx, cy, col);
    else if (k === 'mcb') s += sym.mcb(cx, cy, col);
    else if (k === 'kwh') s += sym.kwh(cx, cy + 4, col);
    else if (k === 'jalur') s += `<line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}" stroke="#444" stroke-width="1.4" stroke-dasharray="6,4"/>`;
    s += `<text x="${x0 + 64}" y="${y}" font-size="10" fill="${INK}">${esc(ket)}</text>`;
    if (ada != null) s += `<text x="${x0 + LEG_W - 70}" y="${y}" font-size="10.5" font-weight="700" fill="${INK}" text-anchor="end">${ada}</text><text x="${x0 + LEG_W - 18}" y="${y}" font-size="10.5" font-weight="700" fill="${RED}" text-anchor="end">${baru ? '+' + baru : '–'}</text>`;
    y += 30;
  }
  y += 6;
  s += `<line x1="${x0 + 16}" y1="${y}" x2="${x0 + LEG_W - 16}" y2="${y}" stroke="${INK}" stroke-width="0.8"/>`; y += 22;
  s += `<text x="${x0 + 16}" y="${y}" font-size="10.5" font-weight="700" fill="${RED}">REVISI ${TGL} (merah = tambahan, tidak ada di DED)</text>`; y += 18;
  const rev = P.filter((d) => d.baru).map((d) => `• ${d.r.replace(/^REVISI: /, '').replace(/ — tambahan$/, '')} (h ${d.h.toFixed(2)} m)`);
  if (lvl === 'lt1') rev.push('• Stop kontak dapur kiri digeser 22 cm ke kanan jendela (jendela z 5,6–6,6)');
  for (const t of rev) { for (const line of wrap(t, 78)) { s += `<text x="${x0 + 16}" y="${y}" font-size="9.5" fill="${RED}">${esc(line)}</text>`; y += 14; } y += 2; }
  y += 8;
  s += `<line x1="${x0 + 16}" y1="${y}" x2="${x0 + LEG_W - 16}" y2="${y}" stroke="${INK}" stroke-width="0.8"/>`; y += 22;
  s += `<text x="${x0 + 16}" y="${y}" font-size="10.5" font-weight="700" fill="${INK}">CATATAN</text>`; y += 18;
  const cat = [
    'Posisi simbol = posisi di gambar DED (skala 1:100) yang dikalibrasi ke tembok model 3D; titik dinding digambar di muka tembok.',
    'Tinggi pasang (dari lantai jadi) mengikuti praktik umum/PUIL karena DED tidak mencantumkan tinggi — lihat kolom keterangan.',
    'Lampu plafon dipasang di bawah dak/plafon ruang ybs; angka +h.hh di samping simbol = tinggi yang menyimpang dari standar.',
    'Jalur kabel digambar skematis (ortogonal) mengikuti garis putus-putus DED; semua kabel NYM 2×2,5 mm² dalam pipa PVC 5/8".',
    lvl === 'lt1' ? 'Rekomendasi: grup MCB dipisah (penerangan lt1, penerangan lt2, stop kontak lt1, stop kontak lt2, AC) → box 6 group; daya 2200 VA cukup untuk ≤ 2 AC ½ PK tanpa water heater listrik, kalau 3 AC + pompa sebaiknya 3500 VA.' : 'Rekomendasi: 2 stop kontak AC lt2 digabung ke grup AC tersendiri di box MCB lt1 (RAB mencantumkan 2 box MCB; box ke-2 bisa di selasar lt2 untuk grup lt2).',
  ];
  for (const t of cat) { for (const line of wrap(t, 82)) { s += `<text x="${x0 + 16}" y="${y}" font-size="9.5" fill="${INK}">${esc(line)}</text>`; y += 14; } y += 3; }
  // skala batang
  const sy = y0 + PLAN_H - 40, sx = x0 + 16;
  for (let i = 0; i < 5; i++) s += `<rect x="${sx + i * S}" y="${sy}" width="${S}" height="8" fill="${i % 2 ? '#fff' : INK}" stroke="${INK}" stroke-width="0.8"/>`;
  for (let i = 0; i <= 5; i++) s += `<text x="${sx + i * S}" y="${sy + 22}" font-size="9" text-anchor="middle" fill="${INK}">${i} m</text>`;
  return s;
}
function wrap(t, n) { const out = []; let cur = ''; for (const w of t.split(' ')) { if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; } if (cur.trim()) out.push(cur.trim()); return out; }
function ruang(lvl) { return RUANG[lvl].map(([t, x, z]) => `<text x="${X(x)}" y="${Y(z)}" font-size="10" text-anchor="middle" fill="${GREY}" letter-spacing="1">${esc(t)}</text>`).join(''); }

function denah(lvl) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">
<defs>
  <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="1.2"/></pattern>
  <pattern id="voidfill" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="8" height="8" fill="#fff"/><line x1="0" y1="0" x2="0" y2="8" stroke="#bbb" stroke-width="0.8"/></pattern>
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="${GREY}"/></marker>
</defs>
<rect width="${W}" height="${H}" fill="#fff"/>
${tapak(lvl)}${grid()}${tangga(lvl)}${tembok(lvl)}${ruang(lvl)}${perangkat(lvl)}${legenda(lvl)}
<text x="${M}" y="${H - 14}" font-size="9" fill="${GREY}">Dibuat otomatis dari data model 3D (scripts/denah-listrik.mjs) · ${TGL}</text>
</svg>`;
}

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
for (const lvl of ['lt1', 'lt2']) {
  const svg = join(OUT, `denah-listrik-${lvl}.svg`); writeFileSync(svg, denah(lvl));
  console.log('tulis', svg);
  if (existsSync(chrome)) {
    const png = join(OUT, `denah-listrik-${lvl}.png`);
    spawnSync(chrome, ['--headless=new', '--hide-scrollbars', `--window-size=${W},${H}`, '--force-device-scale-factor=1.5', `--screenshot=${png}`, `--user-data-dir=/tmp/rumah-denah-${process.pid}`, `file://${svg}`], { stdio: 'ignore', timeout: 60000 });
    console.log(existsSync(png) ? 'png ok' : 'png gagal', png);
  }
}
