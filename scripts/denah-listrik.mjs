// Gambar denah instalasi listrik 2D (SVG + PNG) per lantai, langsung dari data model:
//   tembok/bukaan/tangga/dak dari src/data.js, perangkat/lampu/jalur dari src/layout/elektrik.js.
// Jalankan: node scripts/denah-listrik.mjs  → docs/denah-listrik-lt1.svg, -lt2.svg (+ PNG lewat Chrome headless kalau ada)
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WALLS as WALLS_BLOK, RAILINGS, STAIRS, SLAB2, SITE, HALF } from '../src/data.js';

// Bukaan (pintu/jendela) untuk denah 2D DIUKUR DARI MODEL SKP (raycast, 4/10/2026) — bukan dari model blok data.js yang
// posisinya hanya perkiraan (mis. jendela KT2 di blok z 4.7–5.9, di SKP z 5.6–6.7). Kunci: `${level}|${x1},${y1}-${x2},${y2}`.
const door = (at, w = 0.9, h = 2.1) => ({ at, w, h, sill: 0 });
const win = (at, w, h = 1.2, sill = 0.9) => ({ at, w, h, sill });
const BUKAAN_SKP = {
  'lt1|3,3.5-10,3.5': [door(3.61, 0.8), win(6.02, 0.62, 1.2, 1.3)], // pintu belakang x 6.61–7.41; jendela tangga x 9.02–9.64
  'lt1|3,3.5-3,12': [win(2.1, 1.0, 0.7, 1.0), win(4.0, 0.6, 0.4, 2.18), win(5.35, 1.1, 1.75, 0.3)], // jendela dapur z 5.6–6.6; jendela toilet 60×40; jendela KT1 z 8.85–9.95
  'lt1|10,3.5-10,13.5': [], // tembok kanan polos
  'lt1|6.5,13.5-10,13.5': [win(0.56, 0.41, 2.46, 0.19), win(1.52, 0.41, 2.46, 0.19), win(2.47, 0.41, 2.46, 0.19)], // 3 jendela tinggi x 7.06–7.47 / 8.02–8.43 / 8.97–9.38; pintu utama ada di tembok x 6.5
  'lt1|3,12-6.5,12': [], // tembok depan KT1 polos
  'lt1|3,8.5-6.5,8.5': [door(2.59, 0.8)], // pintu KT1 x 5.59–6.39
  'lt2|3,3.5-10,3.5': [door(3.7)], // pintu balkon belakang; tembok belakang KT2 polos
  'lt2|3,3.5-3,12': [win(2.1, 1.1, 1.2, 0.9), win(4.0, 0.6, 0.4, 2.18), { ...door(5.1, 1.49, 2.12), slide: true }], // jendela KT2 z 5.6–6.7; jendela toilet; pintu geser balkon z 8.6–10.09
  'lt2|10,3.5-10,13.5': [], // tembok kanan polos
  'lt2|6.5,13.5-10,13.5': [win(0.44, 2.54, 2.14, 0.1)], // kaca penuh x 6.94–9.48; pintu balkon ada di tembok x 6.5
  'lt2|3,12-6.5,12': [], // tembok depan KTU polos
  'lt2|6.5,8.5-6.5,12': [door(0.11, 0.8)], // pintu KTU z 8.61–9.41
  'lt2|6.5,3.5-6.5,7': [door(2.59, 0.8)], // pintu KT2 z 6.09–6.89
};
// Tembok teras/balkon depan di x 6.5 (z 12–13.5) tidak ada di model blok → ditambah: pintu utama (lt1) / pintu balkon (lt2) z 12.36–13.26.
const WALLS = [
  ...WALLS_BLOK.map((w) => ({ ...w, openings: BUKAAN_SKP[`${w.level}|${w.x1},${w.y1}-${w.x2},${w.y2}`] ?? w.openings })),
  { x1: 6.5, y1: 12, x2: 6.5, y2: 13.5, level: 'lt1', openings: [door(0.36, 0.9)] },
  { x1: 6.5, y1: 12, x2: 6.5, y2: 13.5, level: 'lt2', openings: [door(0.36, 0.9)] },
];
import { PERANGKAT, LAMPU, JALUR } from '../src/layout/elektrik.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'docs'); mkdirSync(OUT, { recursive: true });
const S = 60, M = 70, LEG_W = 450; // px per meter, margin, lebar panel legenda
const PLAN_W = 10 * S, PLAN_H = 20 * S;
const W = M + PLAN_W + 40 + LEG_W + M, H = M + PLAN_H + M + 20;
const X = (x) => +(M + x * S).toFixed(1), Y = (z) => +(M + z * S).toFixed(1);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const RED = '#c8102e', INK = '#111', GREY = '#666';
const TGL = '06-10-2026';
const RUANG = {
  lt1: [['DAPUR', 4.3, 4.65], ['R. MAKAN', 5.4, 6.4], ['TOILET', 4.25, 8.1], ['KAMAR TIDUR 1', 4.75, 10.85], ['R. KELUARGA', 8.25, 10.35], ['TERAS DEPAN', 4.75, 13.3], ['TERAS BLK.', 8.3, 2.3], ['R. JEMUR', 5.0, 1.0], ['CARPORT', 6.5, 17.0], ['TAMAN', 0.75, 10.0], ['SELASAR', 2.25, 5.0]],
  lt2: [['KAMAR TIDUR 2', 4.75, 4.65], ['SELASAR', 7.6, 6.4], ['VOID', 9.2, 6.4], ['TOILET', 4.25, 8.1], ['TOILET', 5.6, 7.35], ['KT UTAMA', 4.75, 10.75], ['R. KELUARGA', 8.25, 10.35], ['BALKON DEPAN', 4.0, 13.8], ['BALKON', 2.25, 11.0], ['BALKON BLK.', 8.3, 3.2]],
};
const NV = { '+z': [0, 1], '+x': [1, 0], '-z': [0, -1], '-x': [-1, 0] };

// ---- simbol (semua menerima pusat px dan warna) ----
// Simbol meniru legenda DED (lembar 26/27): dibuat dengan "tembok di atas" lalu diputar sesuai arah muka (rot).
// rot: 0 = tembok di −y (atas kertas), 180 = tembok di +y, −90 = tembok di kiri, 90 = tembok di kanan.
const ROT = { '+z': 0, '-z': 180, '+x': -90, '-x': 90 };
const sym = {
  // stop kontak: setengah lingkaran (cembung ke tembok, terbuka ke ruang) + batang ke tembok dengan palang (kontak arde)
  stopkontak: (cx, cy, col, tag, rot = 0) => `<g transform="translate(${cx} ${cy}) rotate(${rot})"><path d="M-6.5 2 A6.5 6.5 0 0 1 6.5 2" fill="#fff" stroke="${col}" stroke-width="1.7"/><line x1="-6.5" y1="2" x2="-6.5" y2="4.5" stroke="${col}" stroke-width="1.7"/><line x1="6.5" y1="2" x2="6.5" y2="4.5" stroke="${col}" stroke-width="1.7"/><line x1="0" y1="-4.5" x2="0" y2="-12" stroke="${col}" stroke-width="1.7"/><line x1="-4.5" y1="-9.5" x2="4.5" y2="-9.5" stroke="${col}" stroke-width="1.7"/></g>${tag ? `<text x="${cx}" y="${cy - 15}" font-size="9" font-weight="700" text-anchor="middle" fill="${col}">${tag}</text>` : ''}`,
  // saklar: lingkaran + batang 45° ke arah ruang; tunggal = batang berakhir di tick (bentuk Λ); ganda = batang menembus tick (stub)
  saklar: (cx, cy, col, n, rot = 0, tukar = false) => {
    // tunggal: batang 13 px dari tepi lingkaran, berakhir di tick 8 px (bentuk Λ). ganda: tick bercabang di 8 px, batang menerus sampai 15 px (bentuk λ) + tick kedua sejajar di ujung.
    const k = 0.7071, r0 = 5.5, stem = n === 2 ? 15 : 13, at = n === 2 ? 8 : 13, tk = 8;
    const p = (t) => [(r0 + t) * k, (r0 + t) * k];
    const [sx, sy] = p(0), [ex, ey] = p(stem), [tx, ty] = p(at);
    let s = `<g transform="translate(${cx} ${cy}) rotate(${rot})"><circle cx="0" cy="0" r="${r0}" fill="#fff" stroke="${col}" stroke-width="1.6"/><line x1="${sx.toFixed(2)}" y1="${sy.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${ey.toFixed(2)}" stroke="${col}" stroke-width="1.6"/>`;
    s += `<line x1="${tx.toFixed(2)}" y1="${ty.toFixed(2)}" x2="${(tx + tk * k).toFixed(2)}" y2="${(ty - tk * k).toFixed(2)}" stroke="${col}" stroke-width="1.6"/>`;
    if (n >= 2) s += `<line x1="${ex.toFixed(2)}" y1="${ey.toFixed(2)}" x2="${(ex + tk * k).toFixed(2)}" y2="${(ey - tk * k).toFixed(2)}" stroke="${col}" stroke-width="1.6"/>`;
    if (n === 3) { const [mx, my] = p(11.5); s += `<line x1="${mx.toFixed(2)}" y1="${my.toFixed(2)}" x2="${(mx + tk * k).toFixed(2)}" y2="${(my - tk * k).toFixed(2)}" stroke="${col}" stroke-width="1.6"/>`; }
    // saklar tukar (two-way): batang kedua berlawanan arah dengan tick (IEC 60617 S00019)
    if (tukar) { const qx = -r0 * k, qy = -r0 * k, rx = -(r0 + 11) * k, ry2 = -(r0 + 11) * k; s += `<line x1="${qx.toFixed(2)}" y1="${qy.toFixed(2)}" x2="${rx.toFixed(2)}" y2="${ry2.toFixed(2)}" stroke="${col}" stroke-width="1.6"/><line x1="${rx.toFixed(2)}" y1="${ry2.toFixed(2)}" x2="${(rx - tk * k).toFixed(2)}" y2="${(ry2 + tk * k).toFixed(2)}" stroke="${col}" stroke-width="1.6"/>`; }
    return s + '</g>';
  },
  // box MCB: persegi panjang dengan dua garis menembus + simbol pemutus kecil; label di luar
  mcb: (cx, cy, col) => `<rect x="${cx - 14}" y="${cy - 8}" width="28" height="16" fill="#fff" stroke="${col}" stroke-width="1.6"/><line x1="${cx - 18}" y1="${cy - 3}" x2="${cx + 18}" y2="${cy - 3}" stroke="${col}" stroke-width="1.2"/><line x1="${cx - 18}" y1="${cy + 3}" x2="${cx - 3}" y2="${cy + 3}" stroke="${col}" stroke-width="1.2"/><line x1="${cx + 3}" y1="${cy + 3}" x2="${cx + 18}" y2="${cy + 3}" stroke="${col}" stroke-width="1.2"/><path d="M${cx - 3} ${cy + 3} l3 -5 l3 5" fill="none" stroke="${col}" stroke-width="1.4"/><text x="${cx}" y="${cy - 11}" font-size="8" font-weight="700" text-anchor="middle" fill="${col}">MCB</text>`,
  // kWh meter: persegi panjang, separuh kanan-bawah hitam
  kwh: (cx, cy, col) => `<rect x="${cx - 13}" y="${cy - 8}" width="26" height="16" fill="#fff" stroke="${col}" stroke-width="1.6"/><path d="M${cx - 13} ${cy - 8} L${cx + 13} ${cy + 8} L${cx + 13} ${cy - 8} Z" fill="${col}"/><text x="${cx}" y="${cy - 11}" font-size="8" font-weight="700" text-anchor="middle" fill="${col}">kWh</text>`,
  // lampu outdoor: persegi dengan diagonal + lingkaran ganda di dalam
  sconce: (cx, cy, col) => `<rect x="${cx - 8}" y="${cy - 8}" width="16" height="16" fill="#fff" stroke="${col}" stroke-width="1.6"/><line x1="${cx - 8}" y1="${cy - 8}" x2="${cx + 8}" y2="${cy + 8}" stroke="${col}" stroke-width="1.2"/><line x1="${cx + 8}" y1="${cy - 8}" x2="${cx - 8}" y2="${cy + 8}" stroke="${col}" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="${col}" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="3" fill="none" stroke="${col}" stroke-width="1"/>`,
  // lampu: lingkaran dengan silang menembus (5 W) / lingkaran ganda (9 W)
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
      if (isDoor && o.slide) {
        // pintu geser: dua daun sejajar tembok, saling bergeser (tanpa busur)
        const a = o.at, b = o.at + o.w, mid = o.at + o.w / 2;
        const seg = (p, q, off) => horiz ? `<line x1="${X(p)}" y1="${Y(w.y1) + off}" x2="${X(q)}" y2="${Y(w.y1) + off}" stroke="${INK}" stroke-width="1.8"/>` : `<line x1="${X(w.x1) + off}" y1="${Y(p)}" x2="${X(w.x1) + off}" y2="${Y(q)}" stroke="${INK}" stroke-width="1.8"/>`;
        s += seg(a, mid + 0.05, -2.5) + seg(mid - 0.05, b, 2.5);
      } else if (isDoor) {
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
    const [nx, nz] = NV[d.n]; const col = d.baru || d.rev ? RED : INK;
    const cx = X(d.x + nx * 0.2), cy = Y(d.z + nz * 0.2);
    s += `<line x1="${X(d.x)}" y1="${Y(d.z)}" x2="${cx}" y2="${cy}" stroke="${col}" stroke-width="1.4"/>`;
    if (d.t === 'stopkontak') s += sym.stopkontak(cx, cy, col, d.ac ? 'AC' : d.wh ? 'WH' : '', ROT[d.n]);
    else if (d.t === 'saklar1') s += sym.saklar(cx, cy, col, 1, ROT[d.n], d.tukar);
    else if (d.t === 'saklar2') s += sym.saklar(cx, cy, col, 2, ROT[d.n], d.tukar);
    else if (d.t === 'saklar3') s += sym.saklar(cx, cy, col, 3, ROT[d.n], d.tukar);
    else if (d.t === 'mcb') s += sym.mcb(X(d.x + nx * 0.3), Y(d.z + nz * 0.3), col);
    else if (d.t === 'kwh') s += sym.kwh(X(d.x + nx * 0.3), Y(d.z + nz * 0.3), col);
    else if (d.t === 'sconce') s += sym.sconce(cx, cy, col);
    const std = d.t === 'stopkontak' ? 0.4 : d.t.startsWith('saklar') ? 1.4 : null;
    const dup = labeled.some((q) => q.t === d.t && Math.abs(q.h - d.h) < 0.01 && Math.hypot(q.x - d.x, q.z - d.z) < 0.35);
    if (std != null && Math.abs(d.h - std) > 0.01 && !dup) labeled.push(d);
    if (std != null && Math.abs(d.h - std) > 0.01 && !dup) {
      const atas = nx !== 0 && !d.ac && !d.wh;
      const lx = atas ? cx : cx + (nx ? nx * 14 : 11), ly = atas ? cy - 11 : cy + (nz ? nz * 16 : 4) + (nx ? 3 : 0);
      s += `<text x="${lx}" y="${ly}" font-size="8" fill="${col}" text-anchor="${atas ? 'middle' : nx < 0 ? 'end' : nx > 0 ? 'start' : 'middle'}">+${d.h.toFixed(2)}</text>`;
    }
  }
  return s;
}
function legenda(lvl) {
  const P = PERANGKAT.filter((q) => q.lvl === lvl), L = LAMPU.filter((q) => q.lvl === lvl);
  const n = (f) => P.filter(f).length;
  const rows = [
    ['stopkontak', 'Stop kontak 1 ph 10/16 A, h 40 cm (dapur 115, mesin cuci 120)', n((d) => d.t === 'stopkontak' && !d.ac && !d.wh && !d.baru), n((d) => d.t === 'stopkontak' && !d.ac && !d.wh && d.baru)],
    ['ac', 'Stop kontak AC, h 240 cm (unit indoor di atas jendela)', 0, n((d) => d.ac)],
    ['wh', 'Stop kontak water heater IP44, h 190 cm, grup sendiri', 0, n((d) => d.wh)],
    ['saklar1', 'Saklar tunggal, h 140 cm', n((d) => d.t === 'saklar1' && !d.tukar), 0],
    ['saklar2', 'Saklar ganda, h 140 cm', n((d) => d.t === 'saklar2'), 0],
    ['saklar3', 'Saklar triple (2 kelompok + 1 tukar), h 140 cm', 0, n((d) => d.t === 'saklar3')],
    ['tukar', 'Saklar tukar (two-way) lampu tangga, h 140 cm', 0, n((d) => d.t === 'saklar1' && d.tukar)],
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
    if (k === 'stopkontak') s += sym.stopkontak(cx, cy, col, '');
    else if (k === 'ac') s += sym.stopkontak(cx, cy, RED, 'AC');
    else if (k === 'wh') s += sym.stopkontak(cx, cy, RED, 'WH');
    else if (k === 'saklar1') s += sym.saklar(cx, cy, col, 1);
    else if (k === 'saklar2') s += sym.saklar(cx, cy, col, 2);
    else if (k === 'saklar3') s += sym.saklar(cx, cy, RED, 3, 0, true);
    else if (k === 'tukar') s += sym.saklar(cx, cy, RED, 1, 0, true);
    else if (k === 'lampu5') s += sym.lampu(cx, cy, col, 5);
    else if (k === 'lampu9') s += sym.lampu(cx, cy, col, 9);
    else if (k === 'sconce') s += sym.sconce(cx, cy, col);
    else if (k === 'mcb') s += sym.mcb(cx, cy, col);
    else if (k === 'kwh') s += sym.kwh(cx, cy, col);
    else if (k === 'jalur') s += `<line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}" stroke="#444" stroke-width="1.4" stroke-dasharray="6,4"/>`;
    s += `<text x="${x0 + 64}" y="${y}" font-size="10" fill="${INK}">${esc(ket)}</text>`;
    if (ada != null) s += `<text x="${x0 + LEG_W - 70}" y="${y}" font-size="10.5" font-weight="700" fill="${INK}" text-anchor="end">${ada}</text><text x="${x0 + LEG_W - 18}" y="${y}" font-size="10.5" font-weight="700" fill="${RED}" text-anchor="end">${baru ? '+' + baru : '–'}</text>`;
    y += 30;
  }
  y += 6;
  s += `<line x1="${x0 + 16}" y1="${y}" x2="${x0 + LEG_W - 16}" y2="${y}" stroke="${INK}" stroke-width="0.8"/>`; y += 22;
  s += `<text x="${x0 + 16}" y="${y}" font-size="10.5" font-weight="700" fill="${RED}">REVISI ${TGL} (merah = tambahan / perubahan dari DED)</text>`; y += 18;
  const rev = P.filter((d) => d.baru || d.rev).map((d) => `• ${d.r.replace(/^REVISI: /, '').replace(/ — tambahan$/, '')} (h ${d.h.toFixed(2)} m)`);
  if (lvl === 'lt1') rev.push('• TV 65" diturunkan: bawah 0,80 m, tengah layar 1,22 m (mata duduk ±1,10 m)');
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
    lvl === 'lt1' ? 'Rekomendasi: grup MCB dipisah (penerangan lt1, penerangan lt2, stop kontak lt1, stop kontak lt2, AC lt1, AC lt2, water heater) → box 8 group, 7 MCB; daya 2200 VA cukup untuk ≤ 2 AC ½ PK + water heater tangki low-watt, kalau 3 AC + pompa sebaiknya 3500 VA.' : 'Rekomendasi: 2 stop kontak AC lt2 dan water heater KTU masing-masing ke grup tersendiri di box MCB lt1 (RAB mencantumkan 2 box MCB; box ke-2 bisa di selasar lt2 untuk grup lt2). Saklar: tunggal = 1 kelompok lampu, ganda = 2 kelompok (mis. pintu toilet KTU: lampu toilet + balkon samping).',
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
