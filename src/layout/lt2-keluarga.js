// Tata letak SELASAR + R. KELUARGA/KERJA lantai 2 (x 6.575–9.925, z 9.06–13.425; selasar x 6.575–8.43, z 3.575–9.06).
// Referensi render: hal-34..36.jpg (hall lt2, ruang kerja dengan meja + kursi kantor + sideboard + tanaman).
// Bukaan nyata: tembok depan KACA PENUH x 6.94–9.48 (h 0.1–2.24); pintu balkon di tembok x=6.5 (z 12.36–13.26);
// pintu KTU di x=6.5 (z 8.61–9.41); tangga tiba di z 9.06 untuk x 8.88–9.925; void x 8.43–9.925, z 3.575–9.06
// (railing prosedural di furniture.js). Tembok kanan x=10 polos. Plafon 3.3 m. y untuk grup lt2 = relatif lantai lt2.
// Muka tembok terukur (raycast model SKP): tembok kanan x=9.88 (bukan 9.925), tembok KTU x=6.575, kaca depan z≈13.49.
// Catatan aset: plant_tree kini hanya 1 pohon (varian d, lebar ±1 m, tinggi 1.9) → boleh dipakai; GLB-nya TANPA pot
// (hanya bark_*/leaves_*), jadi selalu ditanam di pot putih: plant_small (pot keramik putih + kerikil) diperbesar ±2.8×.
// (round_table_s flat putih sudah dicoba sebagai planter → terbaca meja cawan berkaki ramping, ditolak.)
export default [
  // Meja kerja walnut kaki hitam menempel tembok kanan (hal. 36), memanjang sejajar z; depan (-x) ke arah ruang.
  { a: 'desk_walnut_140', x: 9.57, z: 12.4, ry: -Math.PI / 2, tint: 0xc8c0b8, note: 'meja 1.4×0.6 di tembok kanan (daun x 9.27–9.87, z 11.7–13.1, atas y 0.76)' },
  // Kursi kantor putar hitam menghadap meja (+x), di ruang kaki bebas z 11.76–12.59 (antara panel kaki meja & pedestal),
  // dirapatkan ke meja seperti render (ujung lengan ±x 9.25 < tepi daun meja 9.27).
  { a: 'office_chair', x: 9.0, z: 12.2, ry: Math.PI / 2, note: 'lengan z 11.915–12.485: bebas kaki meja (11.76) & pedestal (12.59) saat didorong ke meja' },
  { a: 'plant_small', x: 9.72, z: 12.95, y: 0.76, note: 'tanaman kecil di atas daun meja (atas y 0.76), ujung dekat kaca' },
  // Lukisan portrait di tembok kanan di atas meja (hal. 36); muka tembok SKP x=9.88 → frame 9.85–9.87.
  // Artwork asli gelap mengilap (terbaca seperti TV mati). Render: kanvas terang + noda tinta ungu-hitam, bingkai tipis gelap.
  // → 3 lapis picture_frame: bingkai gelap penuh, kanvas terang 93 % (1 cm di depan), noda gelap-ungu 50 % di tengah.
  { a: 'picture_frame', x: 9.86, z: 11.95, y: 1.7, ry: -Math.PI / 2, flat: 0x2b2927, note: 'bingkai gelap 0.59×0.84 (z 11.655–12.245)' },
  { a: 'picture_frame', x: 9.85, z: 11.95, y: 1.7, ry: -Math.PI / 2, scale: 0.93, flat: 0xece6dc, note: 'kanvas terang' },
  { a: 'picture_frame', x: 9.838, z: 11.95, y: 1.73, ry: -Math.PI / 2, scale: 0.5, flat: 0x3f3946, note: 'noda tinta ungu-gelap di tengah kanvas' },
  // Tanaman pot putih tinggi di ujung meja sisi ruang (hal. 34 kanan-depan, hal. 35/36 kiri meja).
  // Pot: plant_small (potted_plant_04 = pot keramik putih + batu putih + haworthia) diperbesar 2.8× → pot putih ±0.47 m
  // (x 9.25–9.75, z 11.03–11.57), haworthia jadi tanaman bawah di kaki pachira (render: pot putih + kerikil putih).
  { a: 'plant_small', x: 9.5, z: 11.3, scale: 2.8, note: 'pot putih tinggi untuk pachira' },
  { a: 'plant_tree', x: 9.5, z: 11.3, y: 0.44, scale: 0.65, note: 'pachira tertanam di pot (pangkal y 0.44 < bibir pot): tinggi total ±1.68, kanopi x 9.16–9.84, z 10.98–11.62; bebas kaki meja (z 11.72) & tangga tiba' },
  // Pedestal 3 laci di bawah meja ujung kaca (hal. 36): 3 badan nightstand_float (0.42×0.4×0.18, alur hitam = pegangan)
  // ditumpuk → kotak 0.54 m (y 0.03–0.57) abu-walnut; x 9.38–9.78, z 12.59–13.01 (bebas apron x 9.79 / y ≥ 0.66, kaki meja z 13.04).
  { a: 'nightstand_float', x: 9.58, z: 12.8, y: -0.38, ry: -Math.PI / 2, tint: 0x7a736c, note: 'laci bawah y 0.03–0.21' },
  { a: 'nightstand_float', x: 9.58, z: 12.8, y: -0.2, ry: -Math.PI / 2, tint: 0x7a736c, note: 'laci tengah y 0.21–0.39' },
  { a: 'nightstand_float', x: 9.58, z: 12.8, y: -0.02, ry: -Math.PI / 2, tint: 0x7a736c, note: 'laci atas y 0.39–0.57' },
  // Sideboard walnut + kabinet krem ujung lengkung (hal. 35) menempel tembok KTU x=6.5, 0.5 m dari kusen pintu balkon.
  // Blender: badan lokal x -0.8..+1.025 (ujung lengkung di +x) → dengan ry=+π/2 ujung lengkung ke -z (selasar), depan ke +x.
  // tint krem-abu: laci walnut → walnut keabuan gelap, krem putih → krem hangat (hal. 35).
  { a: 'sideboard', x: 6.81, z: 11.05, ry: Math.PI / 2, tint: 0xbdb5ad, note: 'badan z 10.03–11.85; luar ayunan pintu KTU (z ≤ 9.41) & pintu balkon (z ≥ 12.36)' },
  // Hiasan kecil di atas bagian laci walnut (render: model pesawat) → pot haworthia kecil, atas sideboard y 0.8.
  { a: 'plant_small', x: 6.8, z: 11.4, y: 0.8, note: 'hiasan di atas laci walnut (walnut z 10.95–11.85)' },
  // Gorden abu gelap dua panel tertumpuk di pojok/tepi kaca depan (tengah ±1.94 m terbuka = sheer pada render), rel z 13.42.
  // Tinggi jangan dinaikkan: puncak rel 2.955 m sudah menyentuh bawah balok di x ≈ 8.9–9.88.
  { a: 'curtain_dark', x: 6.93, z: 13.42, ry: Math.PI, sx: 0.33, note: 'panel kiri, kain x 6.60–7.26 (rel 6.58–7.28)' },
  { a: 'curtain_dark', x: 9.53, z: 13.42, ry: Math.PI, sx: 0.33, note: 'panel kanan, kain x 9.20–9.86 (z 13.28–13.42, 0.18 m di belakang ujung meja z 13.1)' },
];
