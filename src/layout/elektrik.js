// TITIK LISTRIK — dibaca dari gambar "Denah Instalasi Listrik" lantai 1 & 2 (PDF hal. 69–70, lembar 26–27, skala 1:100).
// Posisi x,z = koordinat denah model (m): x dari batas kavling kiri, z dari batas kavling belakang (rumah x 3–10, z 3.5–13.5).
// Kalibrasi: garis tembok di gambar dicocokkan dengan tembok model (±3 cm). Titik di tembok ditempel ke MUKA tembok
// (tebal 0.15 → muka = as ± 0.075). Gambar tidak mencantumkan tinggi, jadi tinggi (h, dari lantai lantai ybs) diambil
// dari praktik umum/PUIL: stop kontak 40 cm; stop kontak meja dapur 115 cm; stop kontak mesin cuci (teras belakang) 120 cm;
// saklar 140 cm; box MCB pusat 175 cm; kWh meter pusat 170 cm; lampu sorot/dinding luar: fasad 230 cm, pagar 175–220 cm;
// lampu dinding lt2 mengikuti titik lampu yang sudah ada di fasad model SKP (x 6.1, 130 cm di atas lantai lt2).
// n = arah muka perangkat (normal tembok ke dalam ruang). t: stopkontak | saklar1 (tunggal) | saklar2 (ganda) | mcb | kwh | sconce.
// ac: true = stop kontak AC (h 2.4, di samping unit indoor yang dipasang tepat di atas kusen jendela/pintu geser);
// wh: true = stop kontak water heater IP44 (h 1.9 dari lantai toilet, di luar zona cipratan shower, grup MCB sendiri);
// Dinding toilet berkeramik: muka keramik 2 cm di depan tembok blok (z 7.095 / 8.405, x 3.095 / 4.655) → titik di toilet pakai muka keramik. baru: true = tambahan revisi 4/10/2026 (tidak ada di gambar DED): 3 AC, 2 dinding TV, 2 dapur.
// Koordinat tembok sudah di-snap ke muka tembok model SKP (raycast): kiri 3.061, kanan 9.88, belakang 3.56, dst.
export const PERANGKAT = [
  // ---------------- LANTAI 1: stop kontak 13 (sesuai legenda gambar) ----------------
  { lvl: 'lt1', t: 'stopkontak', x: 9.876, z: 2.55, n: '-x', h: 1.2, r: 'teras belakang (mesin cuci)' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.876, z: 2.77, n: '-x', h: 1.2, r: 'teras belakang' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.10, z: 3.577, n: '+z', h: 0.4, r: 'dapur, tembok belakang (kulkas)' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.30, z: 3.577, n: '+z', h: 0.4, r: 'dapur, tembok belakang (kulkas)' },
  { lvl: 'lt1', t: 'stopkontak', x: 3.068, z: 5.25, n: '+x', h: 1.15, r: 'dapur, di atas meja dapur, kanan jendela (gambar: z 5.47/5.69 menumpuk kusen jendela z 5.6–6.6 → digeser 22 cm)' },
  { lvl: 'lt1', t: 'stopkontak', x: 3.068, z: 5.47, n: '+x', h: 1.15, r: 'dapur, di atas meja dapur' },
  { lvl: 'lt1', t: 'stopkontak', x: 4.25, z: 3.564, n: '+z', h: 1.15, baru: true, r: 'REVISI: dapur, tembok belakang di atas meja (rice cooker/microwave) — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 4.47, z: 3.564, n: '+z', h: 1.15, baru: true, r: 'REVISI: dapur, tembok belakang di atas meja — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 5.56, z: 6.937, n: '-z', h: 0.4, r: 'ruang makan, tembok toilet' },
  { lvl: 'lt1', t: 'stopkontak', x: 5.77, z: 6.937, n: '-z', h: 0.4, r: 'ruang makan, tembok toilet' },
  { lvl: 'lt1', t: 'stopkontak', x: 4.99, z: 8.565, n: '+z', h: 0.4, r: 'KT1, tembok belakang (kiri pintu)' },
  { lvl: 'lt1', t: 'stopkontak', x: 3.065, z: 10.22, n: '+x', h: 0.4, r: 'KT1, tembok kiri' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.865, z: 10.72, n: '-x', h: 0.4, r: 'R. keluarga, tembok kanan (di muka panel dinding)' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.865, z: 10.94, n: '-x', h: 0.4, r: 'R. keluarga, tembok kanan' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.865, z: 11.19, n: '-x', h: 0.4, r: 'R. keluarga, tembok kanan' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.679, z: 10.35, n: '+x', h: 0.78, baru: true, r: 'REVISI: dinding TV, di bawah TV di atas konsol (TV/set-top box) — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.679, z: 10.90, n: '+x', h: 0.78, baru: true, r: 'REVISI: dinding TV, di bawah TV (speaker/konsol game) — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 3.065, z: 10.2, n: '+x', h: 2.4, ac: true, baru: true, r: 'REVISI: stop kontak AC KT1, tembok kiri di kanan unit indoor yang di atas jendela — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 4.3, z: 7.095, n: '+z', h: 1.82, wh: true, baru: true, r: 'REVISI: stop kontak water heater toilet lt1 (IP44), tembok sisi r. makan, kanan unit; 1,9 m di atas lantai toilet (−0,03) — tambahan' },
  // ---------------- LANTAI 1: saklar 7 (2 tunggal + 5 ganda) ----------------
  { lvl: 'lt1', t: 'saklar2', x: 7.75, z: 3.564, n: '+z', h: 1.4, r: 'dapur, kanan pintu belakang → lampu teras belakang + area jemur' },
  { lvl: 'lt1', t: 'saklar2', x: 6.30, z: 6.937, n: '-z', h: 1.4, r: 'ruang makan, tembok toilet → lampu dapur, r. makan, lorong' },
  { lvl: 'lt1', t: 'saklar1', x: 5.42, z: 8.437, n: '-z', h: 1.4, r: 'lorong depan toilet → lampu toilet' },
  { lvl: 'lt1', t: 'saklar1', x: 5.42, z: 8.565, n: '+z', h: 1.4, r: 'KT1, kiri pintu → lampu KT1' },
  { lvl: 'lt1', t: 'saklar2', x: 2.937, z: 10.22, n: '-x', h: 1.4, r: 'teras samping (luar) → lampu taman/pagar' },
  { lvl: 'lt1', t: 'saklar2', x: 6.68, z: 11.69, n: '+x', h: 1.4, r: 'R. keluarga, di muka panel TV → lampu r. keluarga' },
  { lvl: 'lt1', t: 'saklar2', x: 6.66, z: 12.02, n: '+x', h: 1.4, r: 'R. keluarga, samping pintu utama → lampu teras & carport' },
  // ---------------- LANTAI 1: box MCB (4 × 10 A) & kWh meter, saling membelakangi di tembok kiri KT1 ----------------
  { lvl: 'lt1', t: 'mcb', x: 3.065, z: 11.47, n: '+x', h: 1.75, r: 'box MCB 4 group di dalam KT1, tembok kiri dekat tembok depan' },
  { lvl: 'lt1', t: 'kwh', x: 2.937, z: 11.5, n: '-x', h: 1.7, r: 'kWh meter PLN di sisi luar tembok kiri (teras samping)' },
  // ---------------- Lampu LED outdoor (RAB: 'LED Sorot Outdoor 5 W' 3 bh = 2 lt1 + 1 lt2) + lampu pagar ----------------
  { lvl: 'lt1', t: 'sconce', x: 3.10, z: 13.591, n: '+z', h: 2.3, r: 'sorot fasad lt1 kiri (simbol di gambar z 13.69, muka tembok 13.59)' },
  { lvl: 'lt1', t: 'sconce', x: 6.99, z: 13.56, n: '+z', h: 2.3, r: 'sorot fasad lt1 samping pintu utama (muka tembok 13.56)' },
  { lvl: 'lt2', t: 'sconce', x: 6.10, z: 13.95, n: '+z', h: 1.14, r: 'sorot fasad lt2 di dinding kisi kayu (simbol gambar di x 6.99; model SKP menaruh lampunya di x 6.1 → ikut SKP)' },
  { lvl: 'lt1', t: 'sconce', x: 3.84, z: 0.125, n: '+z', h: 1.75, r: 'area jemur, muka dalam pagar belakang (pagar ±2 m, muka z 0.12)' },
  { lvl: 'lt1', t: 'sconce', x: 3.47, z: 18.99, n: '-z', h: 2.2, r: 'pagar depan dekat kotak sampah (di gambar z 19.63; dipasang di muka dalam pagar z 19.0 menghadap carport)' },
  // ---------------- LANTAI 2: stop kontak 8 ----------------
  { lvl: 'lt2', t: 'stopkontak', x: 3.065, z: 5.33, n: '+x', h: 0.4, r: 'KT2, tembok kiri' },
  { lvl: 'lt2', t: 'stopkontak', x: 6.435, z: 5.45, n: '-x', h: 0.4, r: 'KT2, tembok kanan' },
  { lvl: 'lt2', t: 'stopkontak', x: 6.563, z: 5.45, n: '+x', h: 0.4, r: 'selasar, tembok KT2' },
  { lvl: 'lt2', t: 'stopkontak', x: 6.435, z: 10.01, n: '-x', h: 0.4, r: 'KTU, tembok kanan (meja rias)' },
  { lvl: 'lt2', t: 'stopkontak', x: 3.065, z: 10.75, n: '+x', h: 0.4, r: 'KTU, tembok kiri' },
  { lvl: 'lt2', t: 'stopkontak', x: 9.876, z: 12.41, n: '-x', h: 0.4, r: 'R. keluarga lt2, tembok kanan depan' },
  { lvl: 'lt2', t: 'stopkontak', x: 9.876, z: 12.63, n: '-x', h: 0.4, r: 'R. keluarga lt2, tembok kanan depan' },
  { lvl: 'lt2', t: 'stopkontak', x: 9.876, z: 12.85, n: '-x', h: 0.4, r: 'R. keluarga lt2, tembok kanan depan' },
  { lvl: 'lt2', t: 'stopkontak', x: 3.065, z: 5.45, n: '+x', h: 2.4, ac: true, baru: true, r: 'REVISI: stop kontak AC KT2, tembok kiri di kiri unit indoor yang di atas jendela — tambahan' },
  { lvl: 'lt2', t: 'stopkontak', x: 3.065, z: 10.3, n: '+x', h: 2.4, ac: true, baru: true, r: 'REVISI: stop kontak AC KTU, tembok kiri di kanan unit indoor yang di atas pintu geser balkon — tambahan' },
  // R. keluarga lt2: 3 stop kontak DED semuanya di tembok kanan depan → tambah di tembok seberang (tembok KTU, muka x 6.563):
  // 1 rendah di strip bebas antara ayunan pintu KTU (z ≤ 9.41) dan sideboard (z 10.03–11.85), 2 di atas sideboard (top 0.8) untuk lampu/charger.
  { lvl: 'lt2', t: 'stopkontak', x: 6.563, z: 9.72, n: '+x', h: 0.4, baru: true, r: 'REVISI: R. keluarga lt2, tembok KTU (seberang), strip bebas di kanan pintu KTU — tambahan' },
  { lvl: 'lt2', t: 'stopkontak', x: 6.563, z: 10.90, n: '+x', h: 1.05, baru: true, r: 'REVISI: R. keluarga lt2, tembok KTU di atas sideboard (top 0.80) — tambahan' },
  { lvl: 'lt2', t: 'stopkontak', x: 6.563, z: 11.12, n: '+x', h: 1.05, baru: true, r: 'REVISI: R. keluarga lt2, tembok KTU di atas sideboard — tambahan' },
  { lvl: 'lt2', t: 'stopkontak', x: 3.55, z: 7.095, n: '+z', h: 1.9, wh: true, baru: true, r: 'REVISI: stop kontak water heater toilet lt2 kiri (di dalam KTU, IP44), tembok sisi KT2, kiri unit — tambahan' },
  // ---------------- LANTAI 2: saklar 8 (4 tunggal + 4 ganda) ----------------
  { lvl: 'lt2', t: 'saklar1', x: 7.73, z: 3.564, n: '+z', h: 1.4, r: 'selasar, kanan pintu balkon belakang → lampu balkon' },
  { lvl: 'lt2', t: 'saklar2', x: 6.435, z: 5.88, n: '-x', h: 1.4, r: 'KT2, samping pintu → lampu KT2' },
  { lvl: 'lt2', t: 'saklar2', x: 6.563, z: 5.88, n: '+x', h: 1.4, r: 'selasar → lampu selasar & void tangga' },
  { lvl: 'lt2', t: 'saklar1', x: 6.563, z: 8.15, n: '+x', h: 1.4, r: 'selasar → lampu toilet kanan' },
  { lvl: 'lt2', t: 'saklar1', x: 4.07, z: 8.565, n: '+z', h: 1.4, r: 'KTU, kanan pintu toilet → lampu toilet kiri' },
  { lvl: 'lt2', t: 'saklar1', x: 6.435, z: 9.57, n: '-x', h: 1.4, r: 'KTU, samping pintu → lampu KTU' },
  { lvl: 'lt2', t: 'saklar2', x: 6.563, z: 9.57, n: '+x', h: 1.4, r: 'R. keluarga lt2, samping pintu KTU → lampu r. keluarga' },
  { lvl: 'lt2', t: 'saklar2', x: 6.563, z: 12.02, n: '+x', h: 1.4, r: 'R. keluarga lt2, samping pintu balkon → lampu balkon depan + sorot' },
];

// Titik lampu plafon: w = 5 | 9 (watt downlight); lampu outdoor dinding ada di PERANGKAT (t: 'sconce').
// Tinggi diambil dari plafon/dak di atas titik itu (raycast model SKP) saat dibangun.
export const LAMPU = [
  // lantai 1 (legenda: 9 × 5 W, 6 × 9 W; 2 outdoor → PERANGKAT) + 4 lampu kanopi carport (lembar carport)
  { lvl: 'lt1', x: 8.30, z: 2.74, w: 9, r: 'teras belakang' },
  { lvl: 'lt1', x: 4.76, z: 5.24, w: 9, r: 'dapur' },
  { lvl: 'lt1', x: 7.09, z: 5.24, w: 5, r: 'ruang makan' },
  { lvl: 'lt1', x: 3.87, z: 7.74, w: 5, r: 'toilet' },
  { lvl: 'lt1', x: 7.09, z: 7.74, w: 5, r: 'lorong' },
  { lvl: 'lt1', x: 7.09, z: 8.98, w: 5, r: 'r. keluarga' }, { lvl: 'lt1', x: 9.42, z: 8.98, w: 5, r: 'r. keluarga' },
  { lvl: 'lt1', x: 4.76, z: 10.22, w: 9, r: 'KT1' },
  { lvl: 'lt1', x: 7.09, z: 10.94, w: 5, r: 'r. keluarga' }, { lvl: 'lt1', x: 8.26, z: 10.94, w: 9, r: 'r. keluarga tengah' }, { lvl: 'lt1', x: 9.44, z: 10.94, w: 5, r: 'r. keluarga' },
  { lvl: 'lt1', x: 7.09, z: 12.94, w: 5, r: 'r. keluarga' }, { lvl: 'lt1', x: 9.44, z: 12.94, w: 5, r: 'r. keluarga' },
  { lvl: 'lt1', x: 4.75, z: 12.72, w: 9, r: 'teras depan (bawah dak lt2)' },
  { lvl: 'lt1', x: 1.55, z: 10.97, w: 9, r: 'carport sisi kiri rumah (bawah balkon lt2), disaklar dari saklar luar di tembok kiri' },
  { lvl: 'lt1', x: 4.77, z: 15.0, w: 9, r: 'carport' }, { lvl: 'lt1', x: 8.30, z: 15.0, w: 9, r: 'carport' },
  { lvl: 'lt1', x: 4.77, z: 18.0, w: 9, r: 'carport' }, { lvl: 'lt1', x: 8.30, z: 18.0, w: 9, r: 'carport' },
  // lantai 2 (legenda: 10 × 5 W, 9 × 9 W; 1 outdoor → PERANGKAT)
  { lvl: 'lt2', x: 8.30, z: 2.74, w: 9, r: 'balkon belakang' },
  { lvl: 'lt2', x: 4.76, z: 5.24, w: 9, r: 'KT2' },
  { lvl: 'lt2', x: 7.09, z: 4.99, w: 5, r: 'selasar' }, { lvl: 'lt2', x: 9.42, z: 4.99, w: 9, r: 'void tangga' },
  { lvl: 'lt2', x: 7.09, z: 6.98, w: 5, r: 'selasar' }, { lvl: 'lt2', x: 9.42, z: 6.98, w: 9, r: 'void tangga' },
  { lvl: 'lt2', x: 3.87, z: 7.74, w: 5, r: 'toilet kiri' }, { lvl: 'lt2', x: 5.66, z: 7.74, w: 5, r: 'toilet kanan' },
  { lvl: 'lt2', x: 7.09, z: 8.98, w: 5, r: 'r. keluarga lt2' }, { lvl: 'lt2', x: 9.42, z: 8.98, w: 5, r: 'r. keluarga lt2' },
  { lvl: 'lt2', x: 4.76, z: 10.22, w: 9, r: 'KTU' },
  { lvl: 'lt2', x: 7.09, z: 10.94, w: 5, r: 'r. keluarga lt2' }, { lvl: 'lt2', x: 8.26, z: 10.94, w: 9, r: 'r. keluarga lt2 tengah' }, { lvl: 'lt2', x: 9.44, z: 10.94, w: 5, r: 'r. keluarga lt2' },
  { lvl: 'lt2', x: 7.09, z: 12.94, w: 5, r: 'r. keluarga lt2' }, { lvl: 'lt2', x: 9.44, z: 12.94, w: 5, r: 'r. keluarga lt2' },
  { lvl: 'lt2', x: 2.24, z: 12.73, w: 9, r: 'balkon depan' }, { lvl: 'lt2', x: 4.74, z: 12.73, w: 9, r: 'balkon depan' },
  { lvl: 'lt2', x: 2.24, z: 9.48, w: 9, r: 'balkon samping kiri (di atas carport)' },
];

// Jalur kabel (garis putus-putus di gambar), disederhanakan menjadi polyline ortogonal di bawah plafon/dak.
// Ujung yang berimpit dengan perangkat dinding otomatis diturunkan vertikal ke perangkat itu.
export const JALUR = [
  // lantai 1
  { lvl: 'lt1', pts: [[7.75, 3.575], [7.75, 3.6], [8.30, 3.6], [8.30, 2.74]] },
  { lvl: 'lt1', pts: [[7.95, 3.6], [7.95, 0.24], [3.84, 0.24], [3.84, 0.125]] },
  { lvl: 'lt1', pts: [[6.30, 6.925], [6.30, 5.24], [4.76, 5.24]] },
  { lvl: 'lt1', pts: [[6.30, 6.925], [7.09, 6.925], [7.09, 5.24]] },
  { lvl: 'lt1', pts: [[7.09, 6.925], [7.09, 7.74]] },
  { lvl: 'lt1', pts: [[3.87, 7.74], [3.87, 8.25], [5.42, 8.25], [5.42, 8.425]] },
  { lvl: 'lt1', pts: [[5.42, 8.575], [5.42, 10.22], [4.76, 10.22]] },
  { lvl: 'lt1', pts: [[6.68, 11.69], [7.09, 11.69], [7.09, 8.98], [9.42, 8.98], [9.42, 12.94], [7.09, 12.94], [7.09, 11.69]] },
  { lvl: 'lt1', pts: [[7.09, 10.94], [9.44, 10.94]] },
  { lvl: 'lt1', pts: [[6.68, 12.02], [6.9, 12.02], [6.9, 13.4], [3.10, 13.4], [3.10, 13.591]] },
  { lvl: 'lt1', pts: [[6.9, 13.4], [6.99, 13.4], [6.99, 13.56]] },
  { lvl: 'lt1', pts: [[4.75, 13.4], [4.75, 12.72]] },
  { lvl: 'lt1', pts: [[6.9, 13.4], [6.9, 18.0]] },
  { lvl: 'lt1', pts: [[4.77, 15.0], [8.30, 15.0]] },
  { lvl: 'lt1', pts: [[4.77, 18.0], [8.30, 18.0]] },
  { lvl: 'lt1', pts: [[4.77, 18.0], [3.47, 18.0], [3.47, 18.99]] }, // feed lampu pagar depan dari lampu carport
  { lvl: 'lt1', pts: [[2.925, 10.22], [2.7, 10.22], [2.7, 10.97], [1.55, 10.97]] },
  // lantai 2
  { lvl: 'lt2', pts: [[7.73, 3.575], [7.73, 3.6], [8.30, 3.6], [8.30, 2.74]] },
  { lvl: 'lt2', pts: [[6.425, 5.88], [4.76, 5.88], [4.76, 5.24]] },
  { lvl: 'lt2', pts: [[6.575, 5.88], [7.09, 5.88], [7.09, 4.99], [9.42, 4.99]] },
  { lvl: 'lt2', pts: [[7.09, 5.88], [7.09, 6.98], [9.42, 6.98]] },
  { lvl: 'lt2', pts: [[5.66, 7.74], [6.3, 7.74], [6.3, 8.15], [6.575, 8.15]] },
  { lvl: 'lt2', pts: [[3.87, 7.74], [3.87, 8.6], [4.07, 8.6], [4.07, 8.575]] },
  { lvl: 'lt2', pts: [[2.24, 9.48], [2.24, 8.72], [4.07, 8.72], [4.07, 8.6]] },
  { lvl: 'lt2', pts: [[6.425, 9.57], [6.4, 9.75], [4.76, 9.75], [4.76, 10.22]] },
  { lvl: 'lt2', pts: [[6.575, 9.57], [7.09, 9.57], [7.09, 8.98], [9.42, 8.98], [9.44, 12.94], [7.09, 12.94], [7.09, 9.57]] },
  { lvl: 'lt2', pts: [[7.09, 10.94], [9.44, 10.94]] },
  { lvl: 'lt2', pts: [[6.575, 12.02], [6.9, 12.02], [6.9, 12.73], [4.74, 12.73], [2.24, 12.73]] },
  { lvl: 'lt2', pts: [[6.9, 12.73], [6.9, 13.7], [6.1, 13.7], [6.1, 13.95]] },
];
