// Geometri rumah Mbak Alfi — diambil dari DED Antasena Karya Project
// (Denah Rencana Lt.1 hal.42, Lt.2 hal.43, Denah Penutup Lantai hal.54-55, Tampak hal.44).
//
// Sistem koordinat denah (meter):
//   x : 0 di batas kiri kavling -> 10.0 di batas kanan
//   y : 0 di batas BELAKANG kavling -> 20.0 di batas DEPAN (jalan)
// Semua angka grid = as (centerline) tembok. Tebal tembok 0.15 m.
// Elevasi: lantai 1 +0.05, teras/toilet -0.03, dak lt.2 +3.80, lantai 2 +3.85,
//          dak talang +7.30, ring balok +8.00, muka tanah -0.50, rabat carport -0.23.

export const WALL_T = 0.15;
export const HALF = WALL_T / 2;
export const LEVELS = {
  tanah: -0.5,
  rabat: -0.23,
  teras: -0.03,
  lt1: 0.05,
  dak2: 3.8,
  lt2: 3.85,
  plafon1: 3.55,
  dakTalang: 7.3,
  ringBalok: 8.0,
};

export const TILE_FLOOR = { w: 0.8, h: 0.8, label: 'Granit 80×80' };
export const TILE_WALL = { w: 0.6, h: 0.3, label: 'Granit 30×60' };
export const TILE_BATH_FLOOR_ALT = { w: 0.4, h: 0.4, label: 'Keramik 40×40 kasar' };

// Helper rect: {x1,y1,x2,y2}
const R = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 });

// ---------------------------------------------------------------------------
// AREA LANTAI (region = gabungan persegi panjang, dimensi bersih di dalam tembok)
// ---------------------------------------------------------------------------
export const FLOOR_AREAS = [
  // ---------------- LANTAI 1 ----------------
  {
    id: 'lt1-open',
    group: 'Lantai 1',
    name: 'Dapur + R. Makan + R. Keluarga (satu bidang menerus)',
    level: LEVELS.lt1,
    finish: 'polos',
    tile: 'floor',
    mainRect: R(6.5 + HALF, 8.5 - HALF, 10 - HALF, 13.5 - HALF), // ruang keluarga: pola dipusatkan di sini
    rects: [
      // dapur + ruang makan (y 3.5–7.0); tapak tangga L (anak tangga awal x 8.28–9.925, y 3.56–4.56;
      // run sepanjang tembok kanan x 8.88–9.925, y 4.56–9.06) dikeluarkan
      R(3 + HALF, 3.5 + HALF, 8.28, 7.0 - HALF),
      R(8.28, 4.56, 8.88, 7.0 - HALF),
      // koridor depan toilet menerus ke ruang keluarga (y 7.0–8.5)
      R(4.75 + HALF, 7.0 - HALF, 8.88, 8.5 - HALF),
      // di bawah tangga bagian depan (tinggi bebas ≥ 2 m) tetap dilantai
      R(8.88, 6.66, 10 - HALF, 8.5 - HALF),
      // ruang keluarga (y 8.5–13.5)
      R(6.5 + HALF, 8.5 - HALF, 10 - HALF, 13.5 - HALF),
    ],
    // keliling untuk plin (panjang tembok bersih dikurangi bukaan pintu)
    plinth: {
      length:
        // dapur/r.makan: tembok belakang (y3.5) 6.85, tembok kiri dapur (x3) 3.35,
        // tembok toilet (y7) x3–4.75 = 1.6, tembok x4.75 sisi luar toilet 1.35,
        // tembok y8.5 sisi luar KT1 x4.75–6.5 = 1.6, tembok KT1 x6.5 = 3.35,
        // tembok depan RK (y13.5) 3.35, tembok kanan x10 y3.5–13.5 = 9.85 dikurangi tangga 3.2
        6.85 + 3.35 + 1.6 + 1.35 + 1.6 + 3.35 + 3.35 + (9.85 - 3.2),
      doors: 0.9 * 3 + 0.8, // pintu belakang, pintu utama, pintu KT1, pintu toilet
    },
  },
  {
    id: 'lt1-kt1',
    group: 'Lantai 1',
    name: 'Kamar Tidur 1',
    level: LEVELS.lt1,
    finish: 'polos',
    tile: 'floor',
    rects: [R(3 + HALF, 8.5 + HALF, 6.5 - HALF, 12 - HALF)],
    plinth: { length: 2 * (3.35 + 3.35), doors: 0.9 },
  },
  {
    id: 'lt1-toilet',
    group: 'Lantai 1',
    name: 'Toilet Lt.1 (lantai)',
    level: LEVELS.teras,
    finish: 'kamar mandi',
    tile: 'floor',
    isBathroom: true,
    rects: [R(3 + HALF, 7 + HALF, 4.75 - HALF, 8.5 - HALF)],
  },
  {
    id: 'lt1-teras-depan',
    group: 'Lantai luar (teras bawah)',
    name: 'Teras Depan',
    level: LEVELS.teras,
    finish: 'structured (kasar)',
    tile: 'floor',
    outdoor: true,
    // sampai as tembok depan RK (y 13.5); 2 anak tangga turun ke carport (y 13.5–14.0) tidak dihitung
    rects: [R(3 + HALF, 12 + HALF, 6.5 - HALF, 13.5)],
  },
  {
    id: 'lt1-teras-belakang',
    group: 'Lantai luar (teras bawah)',
    name: 'Teras Belakang',
    level: LEVELS.teras,
    finish: 'structured (kasar)',
    tile: 'floor',
    outdoor: true,
    rects: [R(6.5 + HALF, 2.0, 10 - HALF, 3.5 - HALF)],
  },
  {
    id: 'lt1-jemur',
    group: 'Lantai luar (teras bawah)',
    name: 'Ruang Jemur (di gambar: rabat beton — opsional digranit)',
    level: LEVELS.rabat,
    finish: 'structured (kasar)',
    tile: 'floor',
    outdoor: true,
    optional: true,
    rects: [R(6.5 + HALF, 0 + HALF, 10 - HALF, 2.0)],
  },

  // ---------------- LANTAI 2 ----------------
  {
    id: 'lt2-open',
    group: 'Lantai 2',
    name: 'Selasar + R. Keluarga Lt.2 (satu bidang menerus)',
    level: LEVELS.lt2,
    finish: 'polos',
    tile: 'floor',
    mainRect: R(6.5 + HALF, 9.06, 10 - HALF, 13.5 - HALF), // ruang keluarga lt2 selebar penuh
    rects: [
      // selasar x 6.5–8.43 (kanan = void tangga 1,5 × 5,5 m — revisi dari 2,0) menerus ke r. keluarga lt2
      R(6.5 + HALF, 3.5 + HALF, 8.43, 13.5 - HALF),
      // ruang keluarga lt2 sisi kanan, mulai dari ujung tangga tiba (y 9.06)
      R(8.43, 9.06, 10 - HALF, 13.5 - HALF),
    ],
    plinth: {
      // tembok belakang selasar 1.5, tembok KT2 x6.5 3.35, tembok toilet kanan 1.35,
      // tembok KTU x6.5 3.35, tembok depan RK 3.35, tembok kanan x10 y8.5–13.5 4.85
      length: 1.5 + 3.35 + 1.35 + 3.35 + 3.35 + 4.85,
      doors: 0.9 * 4 + 0.8,
    },
  },
  {
    id: 'lt2-kt2',
    group: 'Lantai 2',
    name: 'Kamar Tidur 2',
    level: LEVELS.lt2,
    finish: 'polos',
    tile: 'floor',
    rects: [R(3 + HALF, 3.5 + HALF, 6.5 - HALF, 7 - HALF)],
    plinth: { length: 2 * (3.35 + 3.35), doors: 0.9 },
  },
  {
    id: 'lt2-ktu',
    group: 'Lantai 2',
    name: 'Kamar Tidur Utama',
    level: LEVELS.lt2,
    finish: 'polos',
    tile: 'floor',
    rects: [R(3 + HALF, 8.5 + HALF, 6.5 - HALF, 12 - HALF)],
    plinth: { length: 2 * (3.35 + 3.35), doors: 0.9 * 3 },
  },
  {
    id: 'lt2-toilet-a',
    group: 'Lantai 2',
    name: 'Toilet Lt.2 kiri (lantai)',
    level: LEVELS.lt2 - 0.02,
    finish: 'kamar mandi',
    tile: 'floor',
    isBathroom: true,
    rects: [R(3 + HALF, 7 + HALF, 4.75 - HALF, 8.5 - HALF)],
  },
  {
    id: 'lt2-toilet-b',
    group: 'Lantai 2',
    name: 'Toilet Lt.2 kanan (lantai)',
    level: LEVELS.lt2 - 0.02,
    finish: 'kamar mandi',
    tile: 'floor',
    isBathroom: true,
    rects: [R(4.75 + HALF, 7 + HALF, 6.5 - HALF, 8.5 - HALF)],
  },
  {
    id: 'lt2-balkon-depan',
    group: 'Lantai luar (teras atas)',
    name: 'Balkon Depan Lt.2 (termasuk sisi kiri KT Utama)',
    level: LEVELS.lt2 - 0.02,
    finish: 'structured (kasar)',
    tile: 'floor',
    outdoor: true,
    rects: [
      R(1.5 + HALF, 8.5 - HALF, 3 - HALF, 12 + HALF), // strip kiri KTU
      R(1.5 + HALF, 12 + HALF, 6.5 - HALF, 14.0 - HALF), // balkon depan
    ],
  },
  {
    id: 'lt2-balkon-belakang',
    group: 'Lantai luar (teras atas)',
    name: 'Balkon Belakang Lt.2',
    level: LEVELS.lt2 - 0.02,
    finish: 'structured (kasar)',
    tile: 'floor',
    outdoor: true,
    rects: [R(6.5 + HALF, 2.0 + HALF, 10 - HALF, 3.5 - HALF)],
  },
];

// ---------------------------------------------------------------------------
// KAMAR MANDI — dinding (granit 30x60 full sampai plafon, 2 motif: bawah teraso 180 cm, sisanya putih polos)
// walls: panjang bersih tiap sisi; openings: bukaan (pintu/jendela) per sisi.
// ---------------------------------------------------------------------------
export const BATHROOMS = [
  {
    id: 'km-lt1',
    name: 'Toilet Lt.1',
    inner: { w: 1.6, d: 1.35 },
    // sisi: [belakang(y7), kanan(x4.75), depan(y8.5), kiri(x3)]
    walls: [
      { name: 'Sisi dapur (y=7.0)', len: 1.6, openings: [] },
      { name: 'Sisi koridor (x=4.75) — pintu', len: 1.35, openings: [{ w: 0.7, h: 2.1, fromFloor: 0 }] },
      { name: 'Sisi KT1 (y=8.5)', len: 1.6, openings: [] },
      { name: 'Sisi luar (x=3.0) — jendela', len: 1.35, openings: [{ w: 0.6, h: 0.5, fromFloor: 1.7 }] },
    ],
  },
  {
    id: 'km-lt2a',
    name: 'Toilet Lt.2 kiri',
    inner: { w: 1.6, d: 1.35 },
    walls: [
      { name: 'Sisi KT2 (y=7.0)', len: 1.6, openings: [] },
      { name: 'Sisi toilet kanan (x=4.75)', len: 1.35, openings: [] },
      { name: 'Sisi KT Utama (y=8.5) — pintu', len: 1.6, openings: [{ w: 0.7, h: 2.1, fromFloor: 0 }] },
      { name: 'Sisi luar (x=3.0) — jendela', len: 1.35, openings: [{ w: 0.6, h: 0.5, fromFloor: 1.7 }] },
    ],
  },
  {
    id: 'km-lt2b',
    name: 'Toilet Lt.2 kanan',
    inner: { w: 1.6, d: 1.35 },
    walls: [
      { name: 'Sisi KT2 (y=7.0)', len: 1.6, openings: [] },
      { name: 'Sisi selasar (x=6.5) — pintu', len: 1.35, openings: [{ w: 0.7, h: 2.1, fromFloor: 0 }] },
      { name: 'Sisi KT Utama (y=8.5)', len: 1.6, openings: [] },
      { name: 'Sisi toilet kiri (x=4.75)', len: 1.35, openings: [] },
    ],
  },
];

// Catatan tukang (foto buku) — untuk pembanding
export const FIELD_NOTES = {
  lt2: { text: 'Lantai II: 60 m − 7,5 (lobang tangga) = 62,5 m (hitungannya tidak konsisten, 60−7,5 = 52,5)', m2: 62.5 },
  lt1: { text: 'Lantai I: 60 m', m2: 60 },
  kmBawah: { text: 'Dinding KM bawah (tinggi 100 cm): 10 m × 3 KM = 30 m', m2: 30 },
  kmAtas: { text: 'Dinding KM atas (tinggi 140 cm): 14 × 3 = 42 m', m2: 42 },
  kmLantai: { text: 'Lantai KM: 3 × 3 KM = 9 m', m2: 9 },
  plin: { text: 'Plin dinding 10 cm ± 6 dus (atas & bawah)', boxes: 6 },
  terasAtas: { text: 'Teras atas depan & belakang: 27 m', m2: 27 },
  terasBawah: { text: 'Teras bawah: 21 m', m2: 21 },
};

// ---------------------------------------------------------------------------
// TEMBOK (untuk model 3D) — segmen as tembok + bukaan
// seg: {x1,y1,x2,y2, level:'lt1'|'lt2', h, openings:[{at (jarak dari x1,y1), w, h, sill}]}
// ---------------------------------------------------------------------------
const H1 = LEVELS.dak2 - LEVELS.lt1 + 0.05; // tinggi tembok lt1 sampai dak
const H2 = LEVELS.dakTalang - LEVELS.lt2 + 0.05;
const door = (at, w = 0.9, h = 2.1) => ({ at, w, h, sill: 0 });
const win = (at, w, h = 1.2, sill = 0.9) => ({ at, w, h, sill });

export const WALLS = [
  // ---------- LANTAI 1 ----------
  { x1: 3, y1: 3.5, x2: 10, y2: 3.5, level: 'lt1', h: H1, openings: [door(3.7), win(1.0, 1.2, 0.6, 1.5)] }, // tembok belakang
  { x1: 3, y1: 3.5, x2: 3, y2: 12, level: 'lt1', h: H1, openings: [win(1.2, 1.2), win(4.0, 0.6, 0.5, 1.7), win(6.5, 1.5)] }, // kiri
  { x1: 10, y1: 3.5, x2: 10, y2: 13.5, level: 'lt1', h: H1, openings: [win(5.5, 1.5), win(7.5, 1.5)] }, // kanan
  { x1: 6.5, y1: 13.5, x2: 10, y2: 13.5, level: 'lt1', h: H1, openings: [door(0.35, 1.0), win(1.8, 1.8, 1.5, 0.7)] }, // depan RK
  { x1: 3, y1: 12, x2: 6.5, y2: 12, level: 'lt1', h: H1, openings: [win(1.0, 1.5)] }, // depan KT1
  { x1: 6.5, y1: 8.5, x2: 6.5, y2: 12, level: 'lt1', h: H1, openings: [] }, // KT1 kanan
  { x1: 3, y1: 8.5, x2: 6.5, y2: 8.5, level: 'lt1', h: H1, openings: [door(2.6)] }, // KT1 belakang (pintu KT1)
  { x1: 3, y1: 7, x2: 6.5, y2: 7, level: 'lt1', h: H1, openings: [] }, // dapur/toilet
  { x1: 4.75, y1: 7, x2: 4.75, y2: 8.5, level: 'lt1', h: H1, openings: [door(0.3, 0.7)] }, // toilet kanan (pintu)
  // ---------- LANTAI 2 ----------
  { x1: 3, y1: 3.5, x2: 10, y2: 3.5, level: 'lt2', h: H2, openings: [door(3.7), win(1.0, 1.2)] },
  { x1: 3, y1: 3.5, x2: 3, y2: 12, level: 'lt2', h: H2, openings: [win(1.2, 1.2), win(4.0, 0.6, 0.5, 1.7), door(5.3)] }, // kiri (pintu KTU ke balkon)
  { x1: 10, y1: 3.5, x2: 10, y2: 13.5, level: 'lt2', h: H2, openings: [win(1.0, 1.2), win(7.0, 1.8)] },
  { x1: 6.5, y1: 13.5, x2: 10, y2: 13.5, level: 'lt2', h: H2, openings: [door(0.35, 1.0), win(1.8, 1.8, 1.5, 0.7)] },
  { x1: 3, y1: 12, x2: 6.5, y2: 12, level: 'lt2', h: H2, openings: [win(0.6, 2.4, 1.8, 0.4)] },
  { x1: 6.5, y1: 8.5, x2: 6.5, y2: 12, level: 'lt2', h: H2, openings: [door(0.2)] }, // KTU kanan (pintu)
  { x1: 6.5, y1: 3.5, x2: 6.5, y2: 7, level: 'lt2', h: H2, openings: [door(2.4)] }, // KT2 kanan (pintu)
  { x1: 6.5, y1: 7, x2: 6.5, y2: 8.5, level: 'lt2', h: H2, openings: [door(0.3, 0.7)] }, // toilet kanan (pintu)
  { x1: 3, y1: 7, x2: 6.5, y2: 7, level: 'lt2', h: H2, openings: [] },
  { x1: 3, y1: 8.5, x2: 6.5, y2: 8.5, level: 'lt2', h: H2, openings: [door(0.3, 0.7)] }, // pintu toilet kiri dari KTU
  { x1: 4.75, y1: 7, x2: 4.75, y2: 8.5, level: 'lt2', h: H2, openings: [] },
];

// Railing (void & balkon) — segmen tinggi 1.0
export const RAILINGS = [
  { x1: 8.43, y1: 3.5 + HALF, x2: 8.43, y2: 9.06, level: 'lt2' }, // tepi void sisi selasar (void 1,5 m)
  { x1: 8.43, y1: 9.06, x2: 8.88, y2: 9.06, level: 'lt2' }, // tepi void di ujung tangga tiba
  { x1: 1.5, y1: 8.5, x2: 1.5, y2: 14.0, level: 'lt2' }, // balkon depan kiri
  { x1: 1.5, y1: 14.0, x2: 6.5, y2: 14.0, level: 'lt2' }, // balkon depan
  { x1: 6.5, y1: 12, x2: 6.5, y2: 14.0, level: 'lt2' },
  { x1: 6.5, y1: 2.0, x2: 10, y2: 2.0, level: 'lt2' }, // balkon belakang
  { x1: 6.5, y1: 2.0, x2: 6.5, y2: 3.5, level: 'lt2' },
];

// Tangga bentuk L (diukur dari model SketchUp): 2 anak tangga awal ke arah +x dari x 8.28 (y 3.56–4.56),
// satu trap lebar (x 8.88–9.88), lalu run lurus sepanjang tembok kanan dari y 4.56 naik ke depan sampai
// tiba di lantai 2 pada y 9.06. Riser 0,20 m, tread 0,30 m (18 riser + 1 riser 0,25 terakhir).
export const STAIRS = {
  rise: 0.2,
  tread: 0.3,
  winders: [
    { x1: 8.28, x2: 8.58, y1: 3.56, y2: 4.56, top: LEVELS.lt1 + 0.2 },
    { x1: 8.58, x2: 8.88, y1: 3.56, y2: 4.56, top: LEVELS.lt1 + 0.4 },
    { x1: 8.88, x2: 10 - HALF, y1: 3.56, y2: 4.56, top: LEVELS.lt1 + 0.6 },
  ],
  run: { x1: 8.88, x2: 10 - HALF, yStart: 4.56, yEnd: 9.06, from: LEVELS.lt1 + 0.6, to: LEVELS.lt2 },
};

// Pelat dak lantai 2 (bawah lantai 2), lubang void
export const SLAB2 = {
  rects: [
    R(3, 3.5, 10, 13.5),
    R(1.5, 8.5, 3, 14.0),
    R(3, 13.5, 6.5, 14.0),
    R(6.5, 2.0, 10, 3.5),
  ],
  voids: [R(8.43, 3.56, 10 - HALF, 9.06)], // lubang tangga 1,5 × 5,5 m (revisi dari 2,0)
};

// Lantai luar lainnya (bukan granit) untuk konteks
export const SITE = {
  lot: R(0, 0, 10, 20),
  carport: R(3, 14.0, 10, 19.5),
  selasarTapak: R(1.5, 0, 3, 19.5),
  taman: [R(0, 0, 1.5, 19.5), R(3, 0, 6.5, 2.0)],
  jemur: R(6.5, 0, 10, 2.0),
};
