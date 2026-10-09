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
import { PERANGKAT, LAMPU, JALUR, KOTAK, TITIK_LAMPU, LAMPU_SKP_DIBUANG } from '../src/layout/elektrik.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'docs'); mkdirSync(OUT, { recursive: true });
const S = 60, M = 70, LEG_W = 540; // px per meter, margin, lebar panel legenda
const PLAN_W = 10 * S, PLAN_H = 20 * S;
const W = M + PLAN_W + 40 + LEG_W + M, H = M + PLAN_H + M + 20;
const X = (x) => +(M + x * S).toFixed(1), Y = (z) => +(M + z * S).toFixed(1);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const RED = '#c8102e', INK = '#111', GREY = '#666', BLUE = '#1e6fd9';
const UNGU = '#8e3fb8';
const RYA = { '+z': 0, '+x': Math.PI / 2, '-z': Math.PI, '-x': -Math.PI / 2 };
/** arah pandang kamera di denah (dx, dz): yaw relatif normal tembok, atau sudut dunia untuk pasang plafon ('dn') */
function aimDir(d) { const sx = Math.sin(d.yaw), cz = Math.cos(d.yaw); if (d.n === 'dn') return [sx, cz]; const t = RYA[d.n]; return [sx * Math.cos(t) + cz * Math.sin(t), -sx * Math.sin(t) + cz * Math.cos(t)]; }
const TGL = '09-10-2026';
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
  // kamera CCTV: badan + lensa trapesium, diputar ke arah pandang (ang = derajat svg); kerucut pandang digambar terpisah
  cctv: (cx, cy, col, ang, no) => `<g transform="translate(${cx} ${cy}) rotate(${ang})"><path d="M-6 -5 L6 -5 L6 5 L-6 5 Z" fill="${col}"/><path d="M6 -4 L12 -7 L12 7 L6 4 Z" fill="${col}"/></g>${no ? `<text x="${cx}" y="${cy - 11}" font-size="8.5" font-weight="700" text-anchor="middle" fill="${col}">CCTV-${no}</text>` : ''}`,
  // lampu: lingkaran dengan silang menembus (5 W) / lingkaran ganda (9 W)
  // lampu gantung: lingkaran dengan titik isi di tengah + tiga garis gantung pendek
  gantung: (cx, cy, col) => `<circle cx="${cx}" cy="${cy}" r="8" fill="#fff" stroke="${col}" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="3.2" fill="${col}"/><line x1="${cx}" y1="${cy - 8}" x2="${cx}" y2="${cy - 13}" stroke="${col}" stroke-width="1.4"/><line x1="${cx - 4}" y1="${cy - 13}" x2="${cx + 4}" y2="${cy - 13}" stroke="${col}" stroke-width="1.4"/>`,
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
  // kerucut pandang CCTV (FOV 100°, jangkauan 5 m) di bawah semua simbol
  for (const d of PERANGKAT.filter((q) => q.lvl === lvl && q.t === 'cctv')) {
    const [dx, dz] = aimDir(d), a = Math.atan2(dx, dz), R5 = 7 * S, half = (50 * Math.PI) / 180;
    const p1 = [X(d.x) + R5 * Math.sin(a - half), Y(d.z) + R5 * Math.cos(a - half)], p2 = [X(d.x) + R5 * Math.sin(a + half), Y(d.z) + R5 * Math.cos(a + half)];
    s += `<path d="M${X(d.x)} ${Y(d.z)} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${R5} ${R5} 0 0 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} Z" fill="${BLUE}" fill-opacity="0.10" stroke="${BLUE}" stroke-width="0.8" stroke-dasharray="2,3"/>`;
  }
  for (const j of JALUR.filter((q) => q.lvl === lvl)) s += `<polyline points="${j.pts.map(([x, z]) => `${X(x)},${Y(z)}`).join(' ')}" fill="none" stroke="${j.data ? BLUE : j.coax ? UNGU : '#444'}" stroke-width="1.4" stroke-dasharray="${j.data ? '8,3,2,3' : j.coax ? '2,3' : '6,4'}"/>`;
  for (const l of LAMPU.filter((q) => q.lvl === lvl)) {
    const col = l.baru || l.rev ? RED : INK;
    s += l.j === 'gantung' ? sym.gantung(X(l.x), Y(l.z), col) : sym.lampu(X(l.x), Y(l.z), col, l.w);
    if (l.lid) s += `<text x="${X(l.x) + 11}" y="${Y(l.z) + 15}" font-size="7" font-weight="700" fill="${col === RED ? RED : '#8a5a00'}">${l.lid}</text>`;
  }
  const labeled = []; // label tinggi hanya sekali untuk perangkat sejenis yang berdampingan (< 35 cm)
  const idLabels = [];
  for (const d of PERANGKAT.filter((q) => q.lvl === lvl)) {
    if (d.t === 'cctv') { const [dx, dz] = aimDir(d); const ang = (Math.atan2(dz, dx) * 180) / Math.PI; s += sym.cctv(X(d.x), Y(d.z), BLUE, ang, d.no); s += `<text x="${X(d.x) + 14}" y="${Y(d.z) + 4}" font-size="8" fill="${BLUE}">+${d.h.toFixed(2)}</text>`; continue; }
    const [nx, nz] = NV[d.n]; const col = d.baru || d.rev ? RED : INK;
    const cx = X(d.x + nx * 0.2), cy = Y(d.z + nz * 0.2);
    s += `<line x1="${X(d.x)}" y1="${Y(d.z)}" x2="${cx}" y2="${cy}" stroke="${col}" stroke-width="1.4"/>`;
    if (d.t === 'stopkontak') s += sym.stopkontak(cx, cy, col, d.ac ? 'AC' : d.wh ? 'WH' : d.nvr ? 'NVR' : '', ROT[d.n]);
    else if (d.t === 'antena') s += sym.stopkontak(cx, cy, UNGU, 'TV', ROT[d.n]);
    else if (d.t === 'saklar1') s += sym.saklar(cx, cy, col, 1, ROT[d.n], d.tukar);
    else if (d.t === 'saklar2') s += sym.saklar(cx, cy, col, 2, ROT[d.n], d.tukar);
    else if (d.t === 'saklar3') s += sym.saklar(cx, cy, col, 3, ROT[d.n], d.tukar);
    else if (d.t === 'mcb') s += sym.mcb(X(d.x + nx * 0.3), Y(d.z + nz * 0.3), col);
    else if (d.t === 'kwh') s += sym.kwh(X(d.x + nx * 0.3), Y(d.z + nz * 0.3), col);
    else if (d.t === 'sconce') s += sym.sconce(cx, cy, col);
    if (d.id) { // ID kotak: di sisi ruang, dijauhkan kalau bertumpuk dengan label kotak tetangga
      let off = 0.48; const lw = 20, lh = 9;
      const pos = () => [X(d.x + nx * off) + (nz ? 0 : nx * 2), Y(d.z + nz * off) + 3];
      let [lx, ly] = pos();
      for (let k = 0; k < 4 && idLabels.some(([qx, qy]) => Math.abs(qx - lx) < lw && Math.abs(qy - ly) < lh); k++) { off += 0.17; [lx, ly] = pos(); }
      idLabels.push([lx, ly]);
      s += `<text x="${lx}" y="${ly}" font-size="7" font-weight="700" text-anchor="middle" fill="${col}">${d.id}</text>`;
    }
    const std = d.t === 'stopkontak' ? (d.nvr ? null : 0.4) : d.t === 'antena' ? 0.4 : d.t.startsWith('saklar') ? 1.4 : null; // (NVR tanpa label tinggi)
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
    ['antena', 'Stop kontak antena TV (coax IEC), 1 antena di atap + splitter 2 way', 0, n((d) => d.t === 'antena')],
    ['saklar1', 'Saklar tunggal, h 140 cm', n((d) => d.t === 'saklar1' && !d.tukar), 0],
    ['saklar2', 'Saklar ganda, h 140 cm', n((d) => d.t === 'saklar2'), 0],
    ['tukar', 'Saklar tukar (two-way) lampu tangga, h 140 cm', 0, n((d) => d.t === 'saklar1' && d.tukar)],
    ['kotak', `Kotak inbow Panasonic (1 kotak = 1 stop kontak / 1 saklar / 2 saklar); angka = ID kotak (${KOTAK.filter((k) => k.lvl === lvl).length} kotak, lihat daftar-kotak.md)`, null, null],
    ['lampu5', 'Lampu LED downlight 5 W', L.filter((l) => l.w === 5 && !l.baru).length, L.filter((l) => l.w === 5 && l.baru).length],
    ['lampu9', 'Lampu LED downlight 9 W' + (lvl === 'lt1' ? ' (carport: model tempel/outbow)' : ''), L.filter((l) => l.w === 9 && !l.baru).length, L.filter((l) => l.w === 9 && l.baru).length],
    ['gantung', 'Titik lampu gantung (armatur dari furnitur)', L.filter((l) => l.j === 'gantung' && !l.baru).length, L.filter((l) => l.j === 'gantung' && l.baru).length],
    ['sconce', 'Lampu LED dinding outdoor 5 W (taman: h 140 cm)', n((d) => d.t === 'sconce' && !d.baru), n((d) => d.t === 'sconce' && d.baru)],
    ['idlampu', `Angka L${lvl === 'lt1' ? 1 : 2}-xx = ID titik lampu (${TITIK_LAMPU.filter((t) => t.lvl === lvl).length} titik, lihat Daftar Titik Lampu)`, null, null],
    ['mcb', 'Box MCB 4 group × 10 A, h 175 cm', n((d) => d.t === 'mcb'), 0],
    ['kwh', 'kWh meter PLN 2200 VA (sisi luar), h 170 cm', n((d) => d.t === 'kwh'), 0],
    ['jalur', 'Jalur kabel NYM 2×2,5 mm² dalam pipa, di bawah dak/plafon', null, null],
    ['cctv', 'CCTV IP PoE 2 MP outdoor (kerucut = sudut pandang 100°, 7 m)', 0, n((d) => d.t === 'cctv')],
    ['nvr', 'NVR 4 ch PoE + HDD di lemari bawah tangga (stop kontak ganda)', 0, n((d) => d.nvr)],
    ['data', 'Kabel data CAT6 ke NVR, dalam pipa 3/4"', null, null],
    ['coax', 'Kabel coax RG6 antena (splitter di plafon r. keluarga lt2)', null, null],
  ].filter(([k]) => lvl === 'lt1' || !['cctv', 'nvr', 'data'].includes(k));
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
    else if (k === 'antena') s += sym.stopkontak(cx, cy, UNGU, 'TV');
    else if (k === 'coax') s += `<line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}" stroke="${UNGU}" stroke-width="1.4" stroke-dasharray="2,3"/>`;
    else if (k === 'saklar1') s += sym.saklar(cx, cy, col, 1);
    else if (k === 'saklar2') s += sym.saklar(cx, cy, col, 2);
    else if (k === 'tukar') s += sym.saklar(cx, cy, RED, 1, 0, true);
    else if (k === 'kotak') s += `<rect x="${cx - 7}" y="${cy - 7}" width="14" height="14" fill="#fff" stroke="${INK}" stroke-width="1.2"/><text x="${cx}" y="${cy + 3}" font-size="7" font-weight="700" text-anchor="middle" fill="${INK}">1-07</text>`;
    else if (k === 'lampu5') s += sym.lampu(cx, cy, col, 5);
    else if (k === 'lampu9') s += sym.lampu(cx, cy, col, 9);
    else if (k === 'sconce') s += sym.sconce(cx, cy, col);
    else if (k === 'gantung') s += sym.gantung(cx, cy, col);
    else if (k === 'idlampu') s += `<text x="${cx}" y="${cy + 3}" font-size="8" font-weight="700" text-anchor="middle" fill="#8a5a00">L1-07</text>`;
    else if (k === 'mcb') s += sym.mcb(cx, cy, col);
    else if (k === 'kwh') s += sym.kwh(cx, cy, col);
    else if (k === 'jalur') s += `<line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}" stroke="#444" stroke-width="1.4" stroke-dasharray="6,4"/>`;
    else if (k === 'cctv') s += sym.cctv(cx, cy, BLUE, 0, 0);
    else if (k === 'nvr') s += sym.stopkontak(cx, cy, RED, 'NVR');
    else if (k === 'data') s += `<line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}" stroke="${BLUE}" stroke-width="1.4" stroke-dasharray="8,3,2,3"/>`;
    { const ls = wrap(ket, 78); ls.forEach((t, i) => { s += `<text x="${x0 + 64}" y="${y + i * 12}" font-size="10" fill="${INK}">${esc(t)}</text>`; }); if (ls.length > 1) y += (ls.length - 1) * 12; }
    if (ada != null) s += `<text x="${x0 + LEG_W - 70}" y="${y}" font-size="10.5" font-weight="700" fill="${INK}" text-anchor="end">${ada}</text><text x="${x0 + LEG_W - 18}" y="${y}" font-size="10.5" font-weight="700" fill="${RED}" text-anchor="end">${baru ? '+' + baru : '–'}</text>`;
    y += 30;
  }
  y += 6;
  s += `<line x1="${x0 + 16}" y1="${y}" x2="${x0 + LEG_W - 16}" y2="${y}" stroke="${INK}" stroke-width="0.8"/>`; y += 22;
  s += `<text x="${x0 + 16}" y="${y}" font-size="10.5" font-weight="700" fill="${RED}">REVISI ${TGL} (merah = tambahan / perubahan dari DED)</text>`; y += 18;
  const cat = [
    'Posisi simbol dari gambar DED 1:100 yang dikalibrasi ke tembok model 3D; titik dinding digambar di muka tembok. Tinggi pasang (dari lantai jadi) mengikuti praktik umum/PUIL karena DED tidak mencantumkan tinggi.',
    'Angka +h.hh di samping simbol = tinggi yang menyimpang dari standar. Jalur kabel digambar skematis (ortogonal) mengikuti DED; kabel NYM dalam pipa PVC 5/8".',
    lvl === 'lt1' ? 'Rekomendasi: grup MCB dipisah (penerangan lt1/lt2, stop kontak lt1/lt2, AC lt1, AC lt2, water heater) → box 8 group, 7 MCB; 2200 VA cukup untuk ≤ 2 AC ½ PK + water heater tangki low-watt, kalau 3 AC + pompa sebaiknya 3500 VA.' : 'Rekomendasi: 2 stop kontak AC lt2 dan water heater KTU masing-masing ke grup MCB tersendiri (box ke-2 bisa di selasar lt2). Saklar tunggal = 1 kelompok lampu, ganda = 2 kelompok.',
  ];
  // 4 stop kontak dinding TV digabung jadi satu butir supaya daftar tidak terlalu panjang
  const revSrc = P.filter((d) => d.baru || d.rev).filter((d) => !/kotak [2-4] dari 4/.test(d.r) && d.t !== 'sconce'); // lampu → satu butir ringkasan
  const rev = revSrc.map((d) => `• ${/kotak 1 dari 4/.test(d.r) ? 'dinding TV: 4 stop kontak di bawah TV di atas konsol (TV, set-top box, soundbar, konsol/router)' : d.r.replace(/^REVISI: /, '').replace(/ — tambahan$/, '')} (h ${d.h.toFixed(2)} m)`);
  { const T = TITIK_LAMPU.filter((t) => t.lvl === lvl); rev.unshift(`• Lampu (revisi 09-10-2026): ${T.length} titik, ${T.filter((t) => t.rev).length} posisi/jenis/tinggi diubah, ${T.filter((t) => t.baru).length} baru — rincian & tinggi pasang di Daftar Titik Lampu (merah = berubah dari DED)`); }
  if (lvl === 'lt1') rev.push('• TV 65" diturunkan: bawah 0,80 m, tengah layar 1,22 m (mata duduk ±1,10 m)');
  if (lvl === 'lt1') rev.push('• Stop kontak dapur kiri digeser 22 cm ke kanan jendela (jendela z 5,6–6,6)');
  // ukuran huruf menyesuaikan: daftar revisi + catatan harus muat di atas skala batang (y0 + PLAN_H − 70)
  const catLines = (n) => cat.flatMap((t) => [...wrap(t, n), '']);
  const revLines = (n) => rev.flatMap((t) => [...wrap(t, n), '']);
  let fs = 9.5, lh = 14, wn = 96; // ±96 karakter per baris pada lebar legenda 540 px
  const butuh = () => (revLines(wn).length + catLines(wn + 4).length) * lh + 100;
  while (butuh() > y0 + PLAN_H - 24 - y && fs > 7.5) { fs -= 0.5; lh -= 0.7; wn += 5; }
  for (const line of revLines(wn)) { if (line) s += `<text x="${x0 + 16}" y="${y}" font-size="${fs}" fill="${RED}">${esc(line)}</text>`; y += line ? lh : 2; }
  y += 8;
  s += `<line x1="${x0 + 16}" y1="${y}" x2="${x0 + LEG_W - 16}" y2="${y}" stroke="${INK}" stroke-width="0.8"/>`; y += 22;
  s += `<text x="${x0 + 16}" y="${y}" font-size="10.5" font-weight="700" fill="${INK}">CATATAN</text>`; y += 18;
  for (const line of catLines(wn + 4)) { if (line) s += `<text x="${x0 + 16}" y="${y}" font-size="${fs}" fill="${INK}">${esc(line)}</text>`; y += line ? lh : 3; }
  // skala batang
  const sy = Y(19.25), sx = X(0.3); // di strip jalan kiri-bawah gambar
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
let daftarHtml = '';
// ---- daftar kotak (mapping ID → lokasi), sumber yang sama dengan label di 3D dan denah ----
{
  const TEMBOK = { '+z': 'tembok belakang ruang (muka ke +z / ke depan)', '-z': 'tembok depan ruang (muka ke −z / ke belakang)', '+x': 'tembok kiri (muka ke kanan)', '-x': 'tembok kanan (muka ke kiri)' };
  let md = `# Daftar kotak inbow — stop kontak & saklar Panasonic\n\nRevisi ${TGL}. Produk: Panasonic seri baru, hanya model **inbow kotak** (pelat persegi ±90 × 90 mm, inbow doos 86 mm). Satu kotak berisi **1 stop kontak**, **1 saklar**, atau **2 saklar**. Saklar triple di pintu belakang dipecah jadi 2 kotak (2 saklar + 1 saklar tukar), stop kontak ganda NVR jadi 2 kotak.\n\nID kotak yang sama dipakai di tiga tempat supaya bisa dicocokkan saat evaluasi: label di model 3D (tekan **E**), angka kecil di denah 2D (\`denah-listrik-lt1.png\` / \`-lt2.png\`), dan tabel ini. Posisi x diukur dari batas kavling kiri, z dari batas kavling belakang (rumah x 3–10, z 3,5–13,5); h = tinggi as kotak dari lantai lantai tersebut. Merah di denah/3D = tambahan atau perubahan dari gambar DED.\n\n`;
  for (const lvl of ['lt1', 'lt2']) {
    const K = KOTAK.filter((k) => k.lvl === lvl);
    const c = (t) => K.filter((k) => k.t === t).length;
    md += `## ${lvl === 'lt1' ? 'Lantai 1' : 'Lantai 2'} — ${K.length} kotak (${c('stopkontak')} stop kontak, ${c('saklar1')} × 1 saklar, ${c('saklar2')} × 2 saklar)\n\n| ID | Ruang | Isi kotak | h (m) | Posisi (x, z) | Tembok | Keterangan |\n|---|---|---|---|---|---|---|\n`;
    for (const k of K) md += `| **${k.id}** | ${k.ruang} | ${k.isi} | ${k.h.toFixed(2)} | ${k.x.toFixed(2)}, ${k.z.toFixed(2)} | ${TEMBOK[k.n]} | ${(k.baru ? '🔴 BARU: ' : k.rev ? '🔴 REVISI: ' : '') + k.r.replace(/^REVISI: /, '').replace(/ — tambahan$/, '')} |\n`;
    md += `\n`;
  }
  const all = (t) => KOTAK.filter((k) => k.t === t).length;
  md += `## Rekap belanja kotak\n\n| Isi kotak | Jumlah |\n|---|---|\n| Kotak 1 stop kontak (termasuk ${KOTAK.filter((k) => k.t === 'stopkontak' && /AC/.test(k.isi)).length} AC, ${KOTAK.filter((k) => k.t === 'stopkontak' && /water/.test(k.isi)).length} water heater IP44, ${KOTAK.filter((k) => /NVR/.test(k.isi)).length} NVR) | ${all('stopkontak')} |\n| Kotak 1 saklar (termasuk ${KOTAK.filter((k) => /tukar/.test(k.isi)).length} saklar tukar) | ${all('saklar1')} |\n| Kotak 2 saklar | ${all('saklar2')} |\n| Kotak stop kontak antena TV (coax) | ${all('antena')} |\n| **Total kotak / inbow doos** | **${KOTAK.length}** |\n\n`;
  md += `Catatan: stop kontak water heater (${KOTAK.filter((k) => /water/.test(k.isi)).map((k) => k.id).join(', ')}) perlu varian dengan tutup (IP44) — pastikan seri kotak ini punya varian itu, kalau tidak pakai stop kontak IP44 merek lain di titik tersebut. Ukuran pelat 90 mm adalah asumsi dari inbow doos 86 mm; cocokkan dengan kemasan produk saat evaluasi.\n`;
  writeFileSync(join(OUT, 'daftar-kotak.md'), md); console.log('tulis daftar-kotak.md', KOTAK.length, 'kotak');
  // versi cetak: HTML A4 → PDF lewat Chrome headless
  const TEMBOK2 = { '+z': 'belakang', '-z': 'depan', '+x': 'kiri', '-x': 'kanan' };
  let html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Daftar kotak inbow — Rumah Mbak Alfi</title>
<style>
@page { size: A4; margin: 14mm 12mm; }
body { font: 10.5px/1.35 -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; margin: 0; }
h1 { font-size: 17px; margin: 0 0 2px; } h2 { font-size: 13px; margin: 14px 0 6px; page-break-after: avoid; }
p.sub { color: #555; margin: 0 0 8px; font-size: 9.5px; }
table { border-collapse: collapse; width: 100%; page-break-inside: auto; }
tr { page-break-inside: avoid; } th, td { border: 1px solid #999; padding: 3px 5px; vertical-align: top; text-align: left; }
th { background: #eee; font-size: 9.5px; } td.id { font-weight: 700; white-space: nowrap; } td.n { text-align: right; white-space: nowrap; }
tr.rev td.id, tr.rev td.ket { color: #c8102e; } .kecil { font-size: 9px; color: #555; }
.rekap td { font-weight: 600; } .rekap td.n { font-weight: 700; }
</style></head><body>
<h1>Daftar kotak inbow (stop kontak &amp; saklar Panasonic) dan titik lampu</h1>
<p class="sub">Rumah Mbak Alfi · revisi ${TGL} · 1 kotak = 1 stop kontak / 1 saklar / 2 saklar · ID sama dengan label di model 3D (tekan E) dan angka di denah listrik 2D. Posisi x dari batas kavling kiri, z dari batas belakang (rumah x 3–10, z 3,5–13,5); h = tinggi as kotak dari lantai. Merah = tambahan / perubahan dari DED.</p>`;
  for (const lvl of ['lt1', 'lt2']) {
    const K = KOTAK.filter((k) => k.lvl === lvl); const c = (t) => K.filter((k) => k.t === t).length;
    html += `<h2>${lvl === 'lt1' ? 'Lantai 1' : 'Lantai 2'} — ${K.length} kotak (${c('stopkontak')} stop kontak, ${c('saklar1')} × 1 saklar, ${c('saklar2')} × 2 saklar)</h2>
<table><thead><tr><th>ID</th><th>Ruang</th><th>Isi kotak</th><th>h (m)</th><th>x, z (m)</th><th>Tembok</th><th>Keterangan</th></tr></thead><tbody>`;
    for (const k of K) html += `<tr class="${k.baru || k.rev ? 'rev' : ''}"><td class="id">${k.id}</td><td>${esc(k.ruang)}</td><td>${esc(k.isi)}</td><td class="n">${k.h.toFixed(2)}</td><td class="n">${k.x.toFixed(2)}, ${k.z.toFixed(2)}</td><td>${TEMBOK2[k.n]}</td><td class="ket">${esc((k.baru ? 'BARU: ' : k.rev ? 'REVISI: ' : '') + k.r.replace(/^REVISI: /, '').replace(/ — tambahan$/, ''))}</td></tr>`;
    html += `</tbody></table>`;
  }
  const allT = (t) => KOTAK.filter((k) => k.t === t).length;
  html += `<h2>Rekap belanja kotak</h2><table class="rekap"><tbody>
<tr><td>Kotak 1 stop kontak (termasuk ${KOTAK.filter((k) => /AC/.test(k.isi)).length} AC, ${KOTAK.filter((k) => /water/.test(k.isi)).length} water heater IP44, ${KOTAK.filter((k) => /NVR/.test(k.isi)).length} NVR)</td><td class="n">${allT('stopkontak')}</td></tr>
<tr><td>Kotak 1 saklar (termasuk ${KOTAK.filter((k) => /tukar/.test(k.isi)).length} saklar tukar)</td><td class="n">${allT('saklar1')}</td></tr>
<tr><td>Kotak 2 saklar</td><td class="n">${allT('saklar2')}</td></tr>
<tr><td>Kotak stop kontak antena TV (coax; 1 antena di atap + splitter 2 way)</td><td class="n">${allT('antena')}</td></tr>
<tr><td>Total kotak / inbow doos</td><td class="n">${KOTAK.length}</td></tr></tbody></table>
<p class="kecil">Stop kontak water heater (${KOTAK.filter((k) => /water/.test(k.isi)).map((k) => k.id).join(', ')}) perlu varian bertutup (IP44). Ukuran pelat 90 mm = asumsi dari inbow doos 86 mm; cocokkan dengan kemasan produk. Dibuat otomatis dari data model 3D (scripts/denah-listrik.mjs).</p>
</body></html>`;
  // ---- daftar titik lampu ----
  const HADAP = { '+z': 'hadap depan', '-z': 'hadap belakang', '+x': 'hadap kanan', '-x': 'hadap kiri' };
  const daya = (t) => (t.w === 'gantung' ? '—' : `${t.w} W`);
  const tinggi = (t) => t.hKet ? `${t.hKet}` : t.j === 'sconce' ? `${t.h.toFixed(2)} (dinding, ${HADAP[t.n]})` : t.j === 'gantung' ? `${t.h.toFixed(2)} (plafon)` : t.j === 'tempel' ? `${t.h.toFixed(2)} (atap, bawah lampu ${(t.h - 0.14).toFixed(2)})` : `${t.h.toFixed(2)} (plafon)`;
  let mdL = `# Daftar titik lampu\n\nRevisi lampu 09-10-2026. Sumber: DED lembar 26–27 (denah listrik) & 11–12 (denah plafon), dicocokkan dengan armatur lampu di model SKP. Aturan: **DED menentukan jumlah & titik** (dasar RAB); kalau model SKP punya armatur ≤ 0,5 m dari titik DED, posisi SKP yang dipakai; lampu yang hanya ada di SKP dipakai bila fungsional, sisanya tidak dipakai (disembunyikan di 3D). h = tinggi pasang dari lantai lantai ybs (lampu plafon: tinggi plafon). Merah = berubah dari DED.\n\n`;
  let htmlL = `<h2 style="page-break-before:always">Daftar titik lampu — revisi 09-10-2026</h2><p class="sub">DED menentukan jumlah &amp; titik (dasar RAB); armatur SKP ≤ 0,5 m dari titik DED → posisi SKP dipakai; lampu yang hanya di SKP dipakai bila fungsional. h = tinggi pasang dari lantai ybs (lampu plafon = tinggi plafon). ID sama dengan label kuning di 3D (tekan E) dan di denah.</p>`;
  for (const lvl of ['lt1', 'lt2']) {
    const Tl = TITIK_LAMPU.filter((t) => t.lvl === lvl);
    const head = `${lvl === 'lt1' ? 'Lantai 1' : 'Lantai 2'} — ${Tl.length} titik`;
    mdL += `## ${head}\n\n| ID | Ruang | Jenis | Daya | h (m) | x, z (m) | Sumber | Keterangan / evaluasi |\n|---|---|---|---|---|---|---|---|\n`;
    htmlL += `<h2>${head}</h2><table><thead><tr><th>ID</th><th>Ruang</th><th>Jenis</th><th>Daya</th><th>h (m)</th><th>x, z (m)</th><th>Sumber</th><th>Keterangan / evaluasi</th></tr></thead><tbody>`;
    for (const t of Tl) {
      mdL += `| **${t.id}** | ${t.ruang} | ${t.jenis} | ${daya(t)} | ${tinggi(t)} | ${t.x.toFixed(2)}, ${t.z.toFixed(2)} | ${t.sumber} | ${t.r} |\n`;
      htmlL += `<tr class="${t.baru || t.rev ? 'rev' : ''}"><td class="id">${t.id}</td><td>${esc(t.ruang)}</td><td>${esc(t.jenis)}</td><td class="n">${daya(t)}</td><td>${esc(tinggi(t))}</td><td class="n">${t.x.toFixed(2)}, ${t.z.toFixed(2)}</td><td>${esc(t.sumber)}</td><td class="ket">${esc(t.r)}</td></tr>`;
    }
    mdL += `\n`; htmlL += `</tbody></table>`;
  }
  const cT = (f) => TITIK_LAMPU.filter(f).length;
  const rekapL = [
    ['Downlight tanam 9 W', cT((t) => t.j === 'dl' && t.w === 9)], ['Downlight tanam 5 W', cT((t) => t.j === 'dl' && t.w === 5)],
    ['Downlight tempel (outbow) 9 W — carport', cT((t) => t.j === 'tempel')], ['Lampu dinding outdoor 5 W', cT((t) => t.j === 'sconce')],
    ['Titik lampu gantung (armatur furnitur)', cT((t) => t.j === 'gantung')], ['Total titik lampu', TITIK_LAMPU.length],
    ['— di antaranya armatur sudah ada di model SKP', cT((t) => t.skp)], ['— diubah dari DED (posisi / jenis / tinggi)', cT((t) => t.rev)], ['— baru (tidak ada di DED)', cT((t) => t.baru)],
  ];
  mdL += `## Rekap\n\n| Jenis | Jumlah |\n|---|---|\n` + rekapL.map(([a, b]) => `| ${a} | ${b} |`).join('\n') + `\n\n`;
  htmlL += `<h2>Rekap titik lampu</h2><table class="rekap"><tbody>` + rekapL.map(([a, b]) => `<tr><td>${esc(a)}</td><td class="n">${b}</td></tr>`).join('') + `</tbody></table>`;
  mdL += `## Lampu di model SKP yang tidak dipakai (disembunyikan di 3D)\n\n| Posisi x, y, z (m, dunia) | Alasan |\n|---|---|\n` + LAMPU_SKP_DIBUANG.map((l) => `| ${l.x.toFixed(2)}, ${l.y.toFixed(2)}, ${l.z.toFixed(2)} | ${l.r} |`).join('\n') + `\n\n`;
  htmlL += `<h2>Lampu di model SKP yang tidak dipakai (disembunyikan di 3D)</h2><table><thead><tr><th>x, y, z (m)</th><th>Alasan</th></tr></thead><tbody>` + LAMPU_SKP_DIBUANG.map((l) => `<tr><td class="n">${l.x.toFixed(2)}, ${l.y.toFixed(2)}, ${l.z.toFixed(2)}</td><td>${esc(l.r)}</td></tr>`).join('') + `</tbody></table>`;
  const catL = 'Catatan tinggi: plafon dalam rumah tinggi (3,60 m lt1, 3,40 m lt2) — downlight 5 W (±450 lm) di plafon setinggi itu terasa redup untuk ruang keluarga/makan; pertimbangkan 7–9 W untuk titik 5 W di ruang keluarga. Lampu taman dinding 1,40 m dari lantai teras = 1,45–1,80 m dari tanah/dek (standar 1,5–1,8 m). Lampu dinding fasad 2,00 m (standar 1,8–2,1 m). Lampu gantung: cincin r. keluarga terbawah 2,20 m (≥ 2,1 m area lalu-lalang); lampu meja makan 0,80 m di atas meja (standar 0,75–0,90 m).';
  mdL += catL + '\n';
  htmlL += `<p class="kecil">${esc(catL)}</p>`;
  html = html.replace('</body>', htmlL + '</body>'); // sebelum penutup → urutan: kotak, lampu, lalu denah
  writeFileSync(join(OUT, 'daftar-lampu.md'), mdL); console.log('tulis daftar-lampu.md', TITIK_LAMPU.length, 'titik');
  daftarHtml = html; // dicetak setelah SVG denah jadi (lihat bawah): daftar (A4) + denah lt1 & lt2 (A3)
}
for (const lvl of ['lt1', 'lt2']) {
  const svg = join(OUT, `denah-listrik-${lvl}.svg`); writeFileSync(svg, denah(lvl));
  console.log('tulis', svg);
  if (existsSync(chrome)) {
    const png = join(OUT, `denah-listrik-${lvl}.png`);
    spawnSync(chrome, ['--headless=new', '--hide-scrollbars', `--window-size=${W},${H}`, '--force-device-scale-factor=1.5', `--screenshot=${png}`, `--user-data-dir=/tmp/rumah-denah-${process.pid}`, `file://${svg}`], { stdio: 'ignore', timeout: 60000 });
    console.log(existsSync(png) ? 'png ok' : 'png gagal', png);
  }
}
// ---- PDF cetak gabungan: daftar kotak (A4 tegak) + denah listrik lt1 & lt2 (A3 tegak, halaman bernama CSS) ----
{
  const svgB64 = (lvl) => Buffer.from(denah(lvl)).toString('base64');
  const halamanDenah = (lvl) => `<section class="denah"><img alt="Denah instalasi listrik ${lvl}" src="data:image/svg+xml;base64,${svgB64(lvl)}"></section>`;
  const cetak = daftarHtml.replace('</style>', `@page denah { size: A3 portrait; margin: 8mm; }
section.denah { page: denah; page-break-before: always; } section.denah img { width: 100%; height: auto; display: block; }
</style>`).replace('</body>', `${halamanDenah('lt1')}${halamanDenah('lt2')}</body>`);
  const htmlPath = join(OUT, 'daftar-kotak.html'); writeFileSync(htmlPath, cetak);
  if (existsSync(chrome)) {
    const pdf = join(OUT, 'daftar-kotak.pdf');
    spawnSync(chrome, ['--headless=new', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, `--user-data-dir=/tmp/rumah-denah-pdf-${process.pid}`, `file://${htmlPath}`], { stdio: 'ignore', timeout: 90000 });
    console.log(existsSync(pdf) ? 'pdf ok (daftar + denah lt1/lt2)' : 'pdf gagal', pdf);
  }
}
