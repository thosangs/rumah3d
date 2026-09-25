// Tata letak KAMAR TIDUR 1 lantai 1 (x 3.075–6.425, z 8.575–11.925) — single 120×200. Referensi render: hal-32..33.jpg
// Bukaan nyata: pintu di tembok belakang z=8.5 (x 5.59–6.39, membuka ke dalam sampai z≈9.3); jendela tinggi di tembok kiri
// x=3.075 (z 8.78–9.91, h 0.19–2.05). Tembok depan (z 11.925) & kanan (x 6.425) polos. Plafon 3.1 m.
// Pemetaan langsung dari render (TIDAK dicerminkan): hal-32 menghadap tembok depan → lemari di ujung kiri (pojok x 6.425),
// headboard di kanan rapat tembok jendela, tirai di kanan dekat kamera; hal-33 menghadap tembok jendela → headboard di kiri
// (tembok depan), jendela di ujung kanan (dekat tembok belakang = sisi kaki ranjang), meja kerja di pojok jendela.
// Hasil: headboard di tembok depan (kaki ranjang ke arah jendela/meja), meja rias ramping + cermin di antara ranjang & lemari
// (komposisi hal-32: lemari – cermin/ambalan – headboard – tirai), meja di depan jendela
// dengan kursi menghadap jendela (−x) dan ruang tarik kursi ±1.4 m; zona ayunan pintu (engsel x 6.39, r 0.8) & jalur
// pintu→lemari (x 4.71–6.425) kosong.
export default [
  { a: 'bed_single_beige', x: 4.02, z: 11.825, ry: Math.PI, note: 'x 3.33–4.71, z 9.79–11.923; punggung headboard rapat tembok depan, kaki ke arah meja/jendela; sisi kiri 3 cm dari tirai (x ≤ 3.30)' },
  { a: 'picture_frame', x: 4.02, z: 11.905, y: 2.34, ry: Math.PI, sx: 1.35, scale: 1.1, flat: 0x6e635a, note: 'lukisan di atas headboard (hal. 32/33), ±0.88×0.92 m, y 1.88–2.80 (13 cm di atas headboard 1.75, 30 cm di bawah plafon); depan model = +z lokal → ry π menghadap −z; warna taupe-arang agar terbaca karya seni di tembok krem' },
  { a: 'vanity', x: 5.0, z: 11.695, ry: Math.PI, sx: 0.52, note: 'meja rias ramping + cermin lonjong di antara headboard & lemari (hal. 32: ambalan putih + cermin oval di sebelah kiri headboard); lebar 0.52 (sx) → x 4.74–5.26, z 11.47–11.92, laci menghadap −z; sela 3 cm ke ranjang, 1.5 cm ke lemari; sekaligus nakas' },
  { a: 'desk_white_110', x: 3.56, z: 9.14, ry: Math.PI / 2, note: 'meja putih kaki hitam di depan jendela: x 3.31–3.81, z 8.59–9.69 (sela 1 cm ke tirai x 3.30)' },
  { a: 'dining_chair', x: 3.87, z: 9.14, ry: -Math.PI / 2, note: 'kursi krem kaki hitam menghadap jendela (−x): x 3.65–4.17, z 8.92–9.36; ruang tarik kursi ±1.4 m ke arah +x' },
  { a: 'plant_small', x: 3.5, z: 9.5, y: 0.76, note: 'tanaman kecil di atas meja (hal. 33: diffuser/tanaman di meja)' },
  { a: 'fm_wardrobe_grey', x: 5.85, z: 11.63, ry: Math.PI, flat: 0xa3968a, note: 'lemari 2 pintu 1.15×0.59×2.3 di pojok kanan tembok depan (x 5.275–6.425, z 11.335–11.925), menghadap −z; area buka pintu z 10.7–11.335 kosong; warna polos taupe seperti render' },
  { a: 'curtain_cream', x: 3.17, z: 9.35, ry: Math.PI / 2, sx: 0.7, note: 'tirai krem setinggi plafon, jendela z 8.78–9.91 (lebar tirai 1.4, z 8.65–10.05; tebal x 3.16–3.30)' },
];
