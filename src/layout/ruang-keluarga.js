// Tata letak R. KELUARGA lantai 1 (x 6.575–9.925, z 8.425–13.425). Referensi render: drawings/hal-21..24.jpg
// Bukaan nyata (GLB): pintu utama di tembok x=6.5 (z 12.36–13.26, dari teras depan, engsel di sisi z 13.26 → daun rebah
// sepanjang tembok depan x 6.575–7.475 saat terbuka); 3 jendela tinggi di tembok depan (x 7.06–7.47 / 8.02–8.43 /
// 8.97–9.38, h 0.19–2.65); tembok kanan x=10 polos; ke koridor terbuka penuh di z 8.425.
// PENGHALANG TETAP (furniture.js, bukan file ini): lemari bawah tangga underStairCabinet(5.0, 9.0) di x 9.4, depth 0.98 →
// blok krem setinggi ±3.6 m di x 8.91–9.89, z 5.0–9.0. Blok ini menjorok 0.575 m ke pojok belakang-kanan ruang ini, jadi
// pojok x > 8.9 hanya bebas mulai z 9.0. Kamera rk-dari-koridor di (8.3, 1.6, 8.6): jangan taruh benda di sekitarnya.
// Konvensi: x,z = denah (meter), y = tinggi dari lantai, ry = putaran (radian), depan aset = +z lokal. sx:-1 = cermin.
// Aset: lihat src/assets.js. Plafon zona depan lt1 = 3.1 m.
// Orientasi render: TV wall di tembok kiri (x 6.575) dengan pintu utama di sisi depannya (hal. 23/24); sofa L abu
// membelakangi tembok kanan berpanel (x 9.925); urutan dari lemari tangga ke depan (hal. 21/22): pohon pot, chaise, sofa,
// meja samping walnut, kursi tong krem; meja bundar kecil di ujung depan dekat gorden; gorden gelap di kedua sisi +
// vitrase krem di tengah.
// Catatan sx: holder diputar ry dulu, jadi untuk aset ber-ry=±π/2 nilai sx meregangkan panjang aset sepanjang sumbu z
// dunia tanpa mengubah tinggi/kedalaman (mis. panel TV & konsol dipanjangkan lewat sx, bukan scale).
// Jalur pintu utama → koridor: lorong x ≈ 7.1–7.75 di antara konsol TV dan meja kopi (seperti render hal. 24), bebas furnitur.
export default [
  // --- TV wall di tembok kiri (x 6.575), pintu utama tepat di sisi depannya (render hal. 23/24) ---
  // Aset asimetris (lokal x −1.4..+1.204) × sx 1.25 → bentang nyata z 8.945–12.2 (sisa 0.16 m ke kusen pintu z 12.36).
  // Panel taupe lebar + rak hitam di sisi pintu, panel krem utama berpusat z ≈ 10.63 dengan TV.
  { a: 'tv_wall', x: 6.605, z: 10.45, ry: Math.PI / 2, sx: 1.25, note: 'panel krem+taupe+LED, z 8.945–12.2; rak hitam y 0.95' },
  { a: 'tv65', x: 6.73, z: 10.625, y: 1.05, ry: Math.PI / 2, note: 'di tengah panel utama (panel menonjol sampai x 6.675); bawah TV 10 cm di atas rak' },
  // Konsol walnut melayang: 2.4 → 3.12 m lewat sx (z 8.89–12.01), punggung x 6.69; tint menggelapkan walnut yang terlalu oranye di render three.js
  { a: 'tv_console', x: 6.9, z: 10.45, y: 0.3, ry: Math.PI / 2, sx: 1.3, tint: 0xc4bcb8, note: 'fm_tv_console_walnut bentuknya bulat (tidak mirip render), jadi pakai versi Blender' },
  // --- Tembok kanan berpanel (krem + strip walnut) di belakang sofa (hal. 22) ---
  // Aset: 4 papan tebal 0.03 (celah 2 cm) + strip walnut tebal 0.05. Dengan ry −π/2 dan x 9.905 (2 cm di atas reng, supaya
  // celah papan terbaca sebagai garis bayangan seperti render) → muka papan x 9.875, muka strip x 9.855. 4.8 × sx 0.85 = 4.08 m
  // → z 9.06–13.14: bebas lemari tangga (z ≤ 9.0) dan gorden kanan (z ≥ 13.25). Tint krem-beige hangat (lebih gelap dari tembok).
  { a: 'wall_panels', x: 9.905, z: 11.1, ry: -Math.PI / 2, sx: 0.85, tint: 0xeadbc8, note: 'strip walnut kiri z 9.06–9.31 (di belakang pohon), kanan z 12.89–13.14 (di belakang kursi krem); papan 2.5 cm dari punggung sofa (x 9.85), strip di luar bentang sofa' },
  // --- Sofa L abu (Blender) membelakangi tembok kanan, chaise di ujung koridor (sx:-1) ---
  { a: 'sofa_l', x: 9.4, z: 10.85, ry: -Math.PI / 2, sx: -1, note: 'badan 2.6×0.9 → z 9.55–12.15, punggung x 9.85 (muka panel 9.875); chaise z 9.55–10.45 menjorok ke x 8.2' },
  { a: 'fm_coffee_table_oak', x: 8.2, z: 11.2, note: 'meja kopi bundar oak gelap ⌀0.9 (x 7.75–8.65, z 10.75–11.65) di depan dudukan utama; lorong 0.64 m ke konsol' },
  // Meja samping di antara sofa dan kursi krem, menempel tembok kanan (hal. 22: kubus walnut) → tint walnut.
  // side_table_wood (lebar 0.5) terlalu lebar untuk celah sofa–kursi z 12.15–12.30+, jadi tetap nightstand 0.42 m.
  { a: 'nightstand_float', x: 9.64, z: 12.4, ry: -Math.PI / 2, tint: 0x9a7a60, note: 'x 9.44–9.84, z 12.19–12.61, di antara ujung sofa (12.15) dan kursi' },
  { a: 'plant_small', x: 9.66, z: 12.4, y: 0.59, note: 'hiasan tanaman kecil di atas meja samping (hal. 22: ranting dalam vas)' },
  // --- Kursi tong krem (barrel) di ujung depan dekat gorden, menghadap meja kopi (hal. 21/22) ---
  // armchair_cream (Blender, sandaran melengkung) lebih mirip render daripada fm_armchair_boucle yang tampak menggumpal tanpa sandaran jelas.
  { a: 'armchair_cream', x: 9.0, z: 12.72, ry: Math.PI + 0.48, tint: 0xe6d6c0, note: '⌀0.84 → x 8.58–9.42, z 12.30–13.14 (< gorden 13.25); arah depan ke meja kopi (8.2, 11.2)' },
  { a: 'round_table_s', x: 8.2, z: 12.95, note: 'meja bundar kecil hitam ⌀0.5 t 0.5 di samping kursi krem, 0.83 m pusat-ke-pusat; di luar ayunan pintu (x > 7.475)' },
  { a: 'plant_small', x: 8.2, z: 12.95, y: 0.5, note: 'tanaman kecil di atas meja bundar' },
  // --- Pohon pot tinggi di pojok koridor di samping chaise, di depan muka lemari tangga (hal. 21/22) ---
  // assets.js memakai pick /_d$/ (1.9 m); scale 0.85 → 1.6 m, kanopi ±0.45. Pot z ≈ 9.08–9.48: bebas lemari (z ≤ 9.0) dan chaise (z ≥ 9.55).
  { a: 'plant_tree', x: 9.4, z: 9.28, scale: 0.85, note: 'pohon pot tinggi di pojok belakang kanan, di depan strip walnut kiri panel' },
  // --- Gorden setinggi plafon: vitrase krem menutup jendela tengah + gorden abu tua di kedua sisi (hal. 21/23) ---
  // scale 1.05 → tinggi 3.05 m, rel menyentuh plafon 3.1 m. Lipatan aset lokal z −0.01..0.13 → dengan ry π dan scale 1.05
  // gorden di z = pusat − 0.137 .. pusat + 0.011.
  { a: 'curtain_cream', x: 8.25, z: 13.41, ry: Math.PI, sx: 0.64, scale: 1.05, note: 'vitrase 1.41 m (x 7.54–8.96, z 13.27–13.42) di antara dua gorden gelap, tidak saling tembus' },
  { a: 'curtain_dark', x: 7.08, z: 13.39, ry: Math.PI, sx: 0.45, scale: 1.05, note: 'panel gelap kiri (x 6.58–7.58, z 13.25–13.40): di luar ayunan pintu dan tidak menembus tembok' },
  { a: 'curtain_dark', x: 9.42, z: 13.39, ry: Math.PI, sx: 0.45, scale: 1.05, note: 'panel gelap kanan (x 8.92–9.92, z 13.25–13.40)' },
  // --- Lampu ring emas di atas meja kopi, menggantung dari plafon 3.1 m (ring terbawah y ≈ 2.45) ---
  { a: 'ring_pendant', x: 8.2, z: 11.2, y: 3.1 },
];
