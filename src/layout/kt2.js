// Tata letak KAMAR TIDUR 2 lantai 2 (x 3.075–6.425, z 3.575–6.925) — queen 160×200. Referensi render: hal-37..38.jpg
// (ranjang gelap + panel slat walnut ber-LED, meja kerja dengan rak, lemari cermin).
// Bukaan nyata: pintu di tembok kanan x=6.5 (z 6.09–6.89, ayunan ke x≥5.6); jendela di tembok kiri x=3.075 (z 5.65–6.64,
// h 0.81–2.0). Tembok belakang (z 3.575) & tembok toilet (z 6.925) polos. Plafon 3.3 m.
// Prinsip: headboard di tembok belakang; meja kerja di bawah jendela menghadap jendela; lemari di tembok toilet di antara
// meja & ayunan pintu; nakas di kedua sisi headboard.
// Ukuran aset ternormalisasi (untuk cek jarak): bed_queen_dark alas 1.7×2.03 (panel slat 2.2 lebar, belakang di z lokal −0.10);
// nightstand_float 0.42×0.40 melayang 0.41–0.59; desk_white_110 1.1×0.5; fm_office_chair_mesh 0.67×0.77;
// wardrobe_120_mirror 1.2×0.59×2.4 (depan +z lokal, gagang sampai z 0.31); fm_wardrobe_mirror 1.61×0.70×2.3 (tidak dipakai, terlalu dalam);
// display_shelves 0.37 (x) × 1.08 (z) × 1.56 — sumbu panjang = z lokal (rangka terbuka, tembus pandang).
// Kamera shots: kt2-dari-depan berdiri di pojok kiri-belakang (3.5, 4.0) → jangan taruh benda di tembok kiri z 4–5.5.
export default [
  // Ranjang gelap (platform + duvet hitam, headboard slat walnut + LED) menempel tembok belakang, digeser ke kiri
  // supaya lorong kanan ranjang→rak tetap ≥ 0.6 m. Alas x 3.75–5.45, kaki ranjang z 5.72.
  { a: 'bed_queen_dark', x: 4.6, z: 3.68, ry: 0, note: 'queen 160×200; belakang panel di z 3.58 (tembok 3.575)' },
  // Nakas melayang putih di kedua sisi headboard (hal. 37), di luar bidang headboard upholstered (x 3.6–5.6).
  { a: 'nightstand_float', x: 3.37, z: 3.78, ry: 0, note: 'nakas kiri, punggung di tembok belakang' },
  { a: 'nightstand_float', x: 5.83, z: 3.78, ry: 0, note: 'nakas kanan' },
  // Meja kerja putih di depan jendela/gorden (gorden di x 3.12–3.26, meja x 3.33–3.83, z 5.73–6.83); depan meja ke +x.
  // Hampir di tengah jendela (5.65–6.64); kaki meja z 5.75–5.79 (3.5 cm dari kaki ranjang 5.715) & 6.81–6.85 (7.5 cm dari tembok toilet).
  { a: 'desk_white_110', x: 3.58, z: 6.28, ry: Math.PI / 2, note: 'di bawah jendela z 5.65–6.64, depan meja x 3.83–4.35 bebas dari ranjang' },
  // Kursi kantor mesh hitam menghadap meja/jendela (−x; depan aset fm = +z lokal, dicek di r2), disorong ke bawah meja.
  // Bentang x 3.534–4.306, z 5.945–6.615 → 23 cm dari kaki ranjang, di antara kaki meja, di luar zona buka pintu lemari (x ≥ 4.35).
  { a: 'fm_office_chair_mesh', x: 3.92, z: 6.28, ry: -Math.PI / 2 },
  // Lemari krem 2 pintu dengan cermin (tinggi 2.4 seperti render hal. 38) di ujung kanan tembok toilet: x 4.35–5.55 (< 5.6 garis
  // daun pintu), punggung di z 6.925, gagang depan z 6.34 → jarak buka pintu ke kaki ranjang (z 5.72) = 0.62 m; zona buka pintu
  // x 4.35–5.55 bebas dari kursi & meja. (fm_wardrobe_mirror 1.61 lebar × 0.70 dalam terlalu besar: sisa lorong hanya 0.51 m.)
  // tint krem hangat: badan lemari krem & cermin lebih gelap/hangat seperti hal-38 (bukan pantulan langit biru).
  { a: 'wardrobe_120_mirror', x: 4.95, z: 6.65, ry: Math.PI, tint: 0xe6dccb },
  // Rak pajangan terbuka dicat hitam matte (rak rangka hitam hal. 37 / kotak-kotak di samping pintu hal. 38) menempel tembok pintu,
  // sisi panjang sejajar z (4.21–5.29, di luar busur ayunan pintu z ≥ 5.3), depan x 6.06 → lorong ke ranjang 0.6 m.
  { a: 'display_shelves', x: 6.24, z: 4.75, ry: 0, flat: 0x2b2b2b, note: 'rak hitam di tembok kanan antara nakas kanan & pintu' },
  // Gorden krem menutup jendela penuh (lebar 1.72 m, z 5.19–6.91 < tembok toilet 6.925; lewat 46 cm dari kusen dekat z 5.65),
  // menggantung rapat tembok di x 3.12–3.26 di belakang meja (meja mulai x 3.33) → sinar pandang kamera (3.5, 4.0) yang menyerempet
  // tembok tidak lagi lolos ke kusen jendela. Tipis 14 cm, tidak mengganggu area kamera z 4–5.
  { a: 'curtain_cream', x: 3.12, z: 6.05, ry: Math.PI / 2, sx: 0.82 },
];
