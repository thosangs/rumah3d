// Tata letak R. MAKAN + DAPUR + BAWAH TANGGA lantai 1. Referensi render: drawings/hal-25..31.jpg
// Geometri: kitchen set (ada di model SKP) menempel tembok kiri x 3.06–3.66 sepanjang z 3.56–6.94 dan tembok belakang
// z 3.56–4.16 (x 3.06–5.44); kulkas x 5.5–6.4, z 3.6–4.4; pintu belakang x 6.61–7.41 di z 3.5; anak tangga awal
// (winder) x 8.28–8.88, z 3.56–4.56 naik ke +x; run tangga x 8.88–9.925, z 4.56→9.06; lemari bawah tangga x 8.91–9.89
// (prosedural, di furniture.js; niche walnut berlampu z 6.5–7.6). Ruang bebas lantai untuk meja: x 3.66–8.9, z 4.4–6.9.
// TEMBOK SISI TOILET (dicek dari GLB 25/9): tembok z 6.92–7.08 menerus x 3.0–6.5 setinggi dak (bukan hanya di depan toilet).
// Di baliknya: toilet x 3–4.75 dan lorong kecil x 4.825–6.425, z 7.075–8.425 (pintu toilet di muka x 4.825 z 7.075–7.775,
// pintu KT1 di z 8.5 x 5.59–6.39) yang terbuka ke sisi +x. Ruang makan tersambung ke ruang keluarga hanya lewat
// bukaan x 6.5–8.9 di z 7.0. Muka tembok yang bisa ditempeli furnitur: z 6.925, x 3.66 (ujung kitchen set) – 6.5 = 2,84 m.
// Bawah dak (plafon) 3.55 m.
// Konvensi: x,z denah (m); y tinggi dari lantai; ry radian (depan aset = +z lokal; ry=+PI/2 → hadap +x; ry=-PI/2 → hadap -x).
// EKSPERIMEN (25/9): meja diputar 90° (memanjang sumbu x), sisi panjang nempel tembok toilet, ditengahkan di bentang
// 3.66–6.5. Kursi 4: 1 ujung barat, 2 sisi selatan, 1 ujung timur. Jalur bukaan z 7.0 (x 6.5–8.9) → tangga / pintu belakang
// bebas 2,4 m; jalur ke dapur lewat selatan kursi (z < 5.7, 1,3 m ke kulkas). Ujung kitchen set z 6.2–6.94 terhalang kursi barat.
export default [
  // Meja makan marmer hitam 140×75 kaki rangka besi hitam (hal. 25–26), memanjang sumbu x, sisi panjang nempel tembok toilet.
  { a: 'dining_table', x: 5.08, z: 6.54, ry: 0, note: 'meja 140×75: x 4.38–5.78, z 6.165–6.915 (1 cm dari muka tembok 6.925); kaki x 4.40/5.76, z 6.20/6.88; stretcher bawah y 0.06 di z 6.185–6.22' },
  // 4 kursi makan kain caramel kaki besi hitam (bbox lokal z −0.301..+0.22 × scale 0.93 → punggung −0.28, muka +0.205; kaki di ±0.177).
  { a: 'dining_chair', x: 4.225, z: 6.54, ry: Math.PI / 2, scale: 0.93, note: 'ujung barat, menghadap +x; muka x 4.43 (5 cm di bawah top), punggung x 3.945 → 28 cm dari ujung kitchen set (x 3.66)' },
  { a: 'dining_chair', x: 4.73, z: 5.98, ry: 0, scale: 0.93, note: 'sisi selatan kiri, menghadap +z (tembok); muka z 6.185 (2 cm di bawah top), kaki depan z 6.157 bebas stretcher (≥6.185); punggung z 5.70' },
  { a: 'dining_chair', x: 5.43, z: 5.98, ry: 0, scale: 0.93, note: 'sisi selatan kanan; jarak antar kursi 0.27 m' },
  { a: 'dining_chair', x: 5.935, z: 6.54, ry: -Math.PI / 2, scale: 0.93, note: 'ujung timur, menghadap −x; muka x 5.73, punggung x 6.215 → 28 cm sebelum ujung tembok (x 6.5)' },
  // Lampu gantung molekul emas di atas tengah meja (hal. 25/27), kanopi di plafon 3.55; bar searah meja (sumbu x).
  { a: 'molecule_pendant', x: 5.08, z: 6.54, y: 3.55, ry: 0, scale: 1.15 },
  // Vas bunga kecil di atas meja (hal. 25/28) → tanaman pot mini di atas top (top 0.745+0.0175), agak ke timur.
  { a: 'plant_small', x: 5.3, z: 6.6, y: 0.763 },
  // Pohon pot di depan bagian tinggi lemari bawah tangga, di kanan niche (hal. 25/26/27), pot di ujung bukaan ke ruang keluarga.
  { a: 'fm_olive_tree', x: 8.55, z: 8.15, scale: 1, note: 'pohon zaitun ranting jarang dalam pot (render hal. 25–27) di depan bagian tinggi lemari, kanan niche; ganti ke plant_tree + concrete_pot kalau aset belum ada' },
  // Lorong kecil depan toilet (hal. 28): tanaman pot di pojok muka toilet (x 4.825) × tembok belakang KT1 (muka z 8.425).
  // Pada scale 0.9 pot x 5.00–5.43, z 7.97–8.40 → bebas kedua tembok, di luar ayunan pintu toilet (z ≤ 7.775) & pintu KT1 (x ≥ 5.59).
  { a: 'plant_pot', x: 5.17, z: 8.10, scale: 0.9 },
];
