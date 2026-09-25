// Tata letak R. MAKAN + DAPUR + BAWAH TANGGA lantai 1. Referensi render: drawings/hal-25..31.jpg
// Geometri: kitchen set (ada di model SKP) menempel tembok kiri x 3.06–3.66 sepanjang z 3.56–6.94 dan tembok belakang
// z 3.56–4.16 (x 3.06–5.44); kulkas x 5.5–6.4, z 3.6–4.4; pintu belakang x 6.61–7.41 di z 3.5; anak tangga awal
// (winder) x 8.28–8.88, z 3.56–4.56 naik ke +x; run tangga x 8.88–9.925, z 4.56→9.06; lemari bawah tangga x 8.91–9.89
// (prosedural, di furniture.js; niche walnut berlampu z 6.5–7.6). Ruang bebas lantai untuk meja: x 3.66–8.9, z 4.4–6.9.
// Koridor: x 4.825–9.925, z 6.925–8.425. Pintu toilet di tembok x 4.75, z 7.075–7.775. Bawah dak (plafon) 3.55 m.
// Konvensi: x,z denah (m); y tinggi dari lantai; ry radian (depan aset = +z lokal; ry=+PI/2 → hadap +x; ry=-PI/2 → hadap -x).
export default [
  // Meja makan marmer hitam 160×80 kaki rangka besi hitam (hal. 25–26), memanjang searah tangga (sumbu z),
  // 1.1 m dari lemari bawah tangga supaya kursi sisi tangga masih bisa ditarik; ujung -z z 5.3 menyisakan jalur
  // 0.9 m (z 4.4–5.3) dari sisi dapur ke anak tangga winder di belakang kulkas/pintu belakang.
  { a: 'dining_table', x: 7.4, z: 6.1, ry: Math.PI / 2, note: 'top marmer hitam #2a2c30 + kaki rangka hitam; fm_dining_table_charcoal punya lubang artefak di top' },
  // 4 kursi makan kain caramel kaki besi hitam ramping (render: boucle tan) — tint menghangatkan beige Blender.
  // Kedalaman kursi (bbox GLB) z lokal −0.301..+0.22 (sandaran miring 5°). Kursi diselipkan ±7 cm di bawah top meja
  // (muka dudukan sisi tangga x 7.73, sisi dapur x 7.07); kaki depan bebas dari panel kaki meja (z 5.355–5.405 /
  // 6.795–6.845) dan balok tengah (x 7.375–7.425). Punggung sisi tangga x ≈ 8.25 → 0.66 m ke muka lemari bawah
  // tangga (x 8.91), cukup untuk buka pintu lemari & lewat. Tint 0xeecdc4 → hasil render piksel ≈ (150,111,84), G/R 0.74 B/R 0.56 ≈ boucle hal. 25 (157,115,86).
  { a: 'dining_chair', x: 6.85, z: 5.7, ry: Math.PI / 2, note: 'sisi dapur, menghadap +x ke meja' },
  { a: 'dining_chair', x: 6.85, z: 6.5, ry: Math.PI / 2 },
  { a: 'dining_chair', x: 7.95, z: 5.7, ry: -Math.PI / 2, note: 'sisi tangga, menghadap -x ke meja; punggung 0.66 m dari muka lemari bawah tangga' },
  { a: 'dining_chair', x: 7.95, z: 6.5, ry: -Math.PI / 2 },
  // Lampu gantung molekul emas di atas tengah meja (hal. 25/27), kanopi di plafon 3.55; scale 1.3 → batang 1.43 m,
  // bar 1.46 m searah meja (< panjang top 1.6 m), bola terendah ±1.83 m ≈ 1.07 m di atas top (render hal. 26 ±0.9–1.0 m).
  // Bar di x 7.4 ± 0.08, jauh dari kepala orang yang berdiri dari kursi (x ≤ 6.85 / ≥ 7.95).
  { a: 'molecule_pendant', x: 7.4, z: 6.1, y: 3.55, ry: Math.PI / 2, scale: 1.3 },
  // Vas bunga kecil di atas meja (hal. 25/28) → tanaman pot mini di atas top (top 0.745+0.0175). Digeser dari tengah
  // (7.4, 6.1) ke (7.2, 6.3) supaya di view tangga-bawah tidak segaris dengan pachira (tajuk seolah tumbuh dari pot meja).
  { a: 'plant_small', x: 7.2, z: 6.3, y: 0.763 },
  // Pohon pot di depan bagian tinggi lemari bawah tangga, di kanan niche (hal. 25/26/27). GLB pachira (diganti 20/9 sore)
  // kini 1 pohon varian d: tinggi 1.9 m, lebar ±1.0 m pada scale 1 → scale 0.85 ≈ 1.6 m, tajuk R≈0.43 m.
  // Posisi dipilih agar tajuk: (1) di luar frustum kanan kamera makan-dari-koridor (cam 7.4,8.1; FOV 70° → setengah sudut
  // horizontal 50.8°; jarak tajuk ke bidang frustum ≈ +0.09 m), (2) di belakang kamera rk-dari-koridor (z maks 8.43 < 8.6),
  // (3) tidak menembus muka lemari (x maks 8.85 < 8.91), (4) pot (z 7.8–8.2) di ujung koridor, jauh dari anak tangga winder.
  { a: 'fm_olive_tree', x: 8.35, z: 8.35, scale: 1, note: 'pohon zaitun ranting jarang dalam pot (render hal. 25–27) di depan bagian tinggi lemari, kanan niche; ganti ke plant_tree + concrete_pot kalau aset belum ada' },
  // Koridor (hal. 28): tanaman pot di pojok tembok toilet (muka x 4.825) × tembok belakang KT1 (muka z 8.425).
  // Normalisasi aset menggeser isi +0.047 x / +0.0925 z; pada scale 0.9 pot x 5.00–5.43, z 7.97–8.40, daun x 4.85–5.49,
  // z 7.80–8.39 → bebas kedua tembok, di luar ayunan pintu toilet (z ≤ 7.775) & pintu KT1 (x ≥ 5.59). Tinggi ±0.77 m.
  { a: 'plant_pot', x: 5.17, z: 8.10, scale: 0.9 },
];
