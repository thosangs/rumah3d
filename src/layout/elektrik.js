// TITIK LISTRIK — dibaca dari gambar "Denah Instalasi Listrik" lantai 1 & 2 (PDF hal. 69–70, lembar 26–27, skala 1:100).
// Posisi x,z = koordinat denah model (m): x dari batas kavling kiri, z dari batas kavling belakang (rumah x 3–10, z 3.5–13.5).
// Kalibrasi: garis tembok di gambar dicocokkan dengan tembok model (±3 cm). Titik di tembok ditempel ke MUKA tembok
// (tebal 0.15 → muka = as ± 0.075). Gambar tidak mencantumkan tinggi, jadi tinggi (h, dari lantai lantai ybs) diambil
// dari praktik umum/PUIL: stop kontak 40 cm; stop kontak meja dapur 115 cm; stop kontak mesin cuci (teras belakang) 120 cm;
// saklar 140 cm; box MCB pusat 175 cm; kWh meter pusat 170 cm; lampu sorot/dinding luar: fasad 230 cm, pagar 175–220 cm;
// lampu dinding lt2 mengikuti titik lampu yang sudah ada di fasad model SKP (x 6.1, 130 cm di atas lantai lt2).
// n = arah muka perangkat (normal tembok ke dalam ruang). t: stopkontak | saklar1 (tunggal) | saklar2 (ganda) | mcb | kwh | sconce.
// t: antena = stop kontak antena TV (coax IEC), 1 kotak inbow; satu antena di atap + splitter 2 way di plafon r. keluarga lt2 melayani 2 titik (JALUR coax: true).
// t: cctv = kamera CCTV bullet IP PoE (outdoor): n = bidang pasang ('+z' dst = tembok, 'dn' = plafon/bawah dak); yaw = sudut pandang
//   relatif normal tembok (rad, + ke kanan dilihat dari belakang kamera) atau, untuk 'dn', sudut dunia dari +z ke +x; pitch = tunduk (rad).
//   nvr: true = stop kontak ganda untuk NVR + switch PoE. Kabel data CAT6 = JALUR dengan data: true.
// t: saklar3 = saklar triple; tukar: true = bagian saklar tukar (two-way) lampu tangga; rev: true = posisi/jenis diubah dari DED.
// ac: true = stop kontak AC (h 2.4, di samping unit indoor yang dipasang tepat di atas kusen jendela/pintu geser);
// wh: true = stop kontak water heater IP44 (h 1.9 dari lantai toilet, di luar zona cipratan shower, grup MCB sendiri);
// Dinding toilet berkeramik: muka keramik 2 cm di depan tembok blok (z 7.095 / 8.405, x 3.095 / 4.655) → titik di toilet pakai muka keramik. baru: true = tambahan revisi 4/10/2026 (tidak ada di gambar DED): 3 AC, 4 dinding TV, 2 dapur.
// Koordinat tembok sudah di-snap ke muka tembok model SKP (raycast): kiri 3.061, kanan 9.88, belakang 3.56, dst.
// Produk (revisi 08-10-2026): stop kontak & saklar Panasonic seri baru, hanya model inbow KOTAK (pelat persegi ±90×90 mm,
// inbow doos 86 mm). Satu kotak = 1 stop kontak ATAU 1 saklar ATAU 2 saklar. Maka setiap entri stopkontak/saklar1/saklar2
// di bawah = satu kotak; saklar triple dipecah jadi 2 kotak (2 + 1), stop kontak ganda NVR jadi 2 kotak. Tiap kotak diberi
// ID otomatis (KOTAK di bawah) yang tampil di model 3D dan di denah 2D supaya bisa dicocokkan saat evaluasi.
export const PERANGKAT = [
  // ---------------- LANTAI 1: stop kontak 13 (sesuai legenda gambar) ----------------
  { lvl: 'lt1', t: 'stopkontak', x: 9.876, z: 2.62, n: '-x', h: 1.2, r: 'teras belakang: mesin cuci (di atas mesin, h 1,2)' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.876, z: 3.27, n: '-x', h: 1.2, rev: true, r: 'teras belakang: pompa pendorong (di atas pompa, h 1,2; DED: z 2.77 → digeser 50 cm)' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.10, z: 3.577, n: '+z', h: 0.4, r: 'dapur, tembok belakang (kulkas)' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.30, z: 3.577, n: '+z', h: 0.4, r: 'dapur, tembok belakang (kulkas)' },
  { lvl: 'lt1', t: 'stopkontak', x: 3.068, z: 5.25, n: '+x', h: 1.15, r: 'dapur, di atas meja dapur, kanan jendela (gambar: z 5.47/5.69 menumpuk kusen jendela z 5.6–6.6 → digeser 22 cm)' },
  { lvl: 'lt1', t: 'stopkontak', x: 3.068, z: 5.47, n: '+x', h: 1.15, r: 'dapur, di atas meja dapur' },
  { lvl: 'lt1', t: 'stopkontak', x: 3.78, z: 3.564, n: '+z', h: 1.15, baru: true, r: 'REVISI: dapur, tembok belakang di pojok kiri atas meja (rice cooker/microwave), jauh dari sink — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 4.0, z: 3.564, n: '+z', h: 1.15, baru: true, r: 'REVISI: dapur, tembok belakang di pojok kiri atas meja — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 5.56, z: 6.937, n: '-z', h: 0.4, r: 'ruang makan, tembok toilet' },
  { lvl: 'lt1', t: 'stopkontak', x: 5.77, z: 6.937, n: '-z', h: 0.4, r: 'ruang makan, tembok toilet' },
  { lvl: 'lt1', t: 'stopkontak', x: 4.99, z: 8.565, n: '+z', h: 0.4, r: 'KT1, tembok belakang (kiri pintu)' },
  { lvl: 'lt1', t: 'stopkontak', x: 3.065, z: 10.22, n: '+x', h: 0.4, r: 'KT1, tembok kiri' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.865, z: 12.3, n: '-x', h: 0.35, rev: true, r: 'R. keluarga, tembok kanan depan, di bawah meja samping melayang (bawah meja 0.41) (DED: z 10.72 di belakang sofa → digeser supaya sofa bisa mepet)' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.865, z: 12.52, n: '-x', h: 0.35, rev: true, r: 'R. keluarga, tembok kanan depan, di balik meja samping (DED: z 10.94)' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.865, z: 9.2, n: '-x', h: 0.4, rev: true, r: 'R. keluarga, tembok kanan dekat lemari bawah tangga, di balik pohon pot (DED: z 11.19)' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.679, z: 10.30, n: '+x', h: 0.78, baru: true, r: 'REVISI: dinding TV, di bawah TV di atas konsol, kotak 1 dari 4 (TV) — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.679, z: 10.52, n: '+x', h: 0.78, baru: true, r: 'REVISI: dinding TV, kotak 2 dari 4 (set-top box / Android TV box) — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.679, z: 10.74, n: '+x', h: 0.78, baru: true, r: 'REVISI: dinding TV, kotak 3 dari 4 (soundbar) — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 6.679, z: 10.96, n: '+x', h: 0.78, baru: true, r: 'REVISI: dinding TV, kotak 4 dari 4 (konsol game / router) — tambahan' },
  { lvl: 'lt1', t: 'antena', x: 6.679, z: 11.18, n: '+x', h: 0.78, baru: true, r: 'REVISI: stop kontak antena TV (coax) di bawah TV, kotak ke-5 di kanan 4 stop kontak — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 3.065, z: 8.75, n: '+x', h: 2.4, ac: true, baru: true, r: 'REVISI: stop kontak AC KT1, tembok kiri mepet pojok tembok belakang (17 cm), di kiri unit indoor yang di atas jendela — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 4.45, z: 7.095, n: '+z', h: 1.82, wh: true, baru: true, r: 'REVISI: stop kontak water heater toilet lt1 (IP44), tembok sisi r. makan, kanan unit; 1,9 m di atas lantai toilet (−0,03) — tambahan' },
  // ---------------- CCTV (revisi 06-10-2026): 4 kamera outdoor, NVR di lemari bawah tangga ----------------
  { lvl: 'lt1', t: 'cctv', no: 1, x: 9.7, z: 13.56, n: '+z', h: 2.7, yaw: -0.70, pitch: 0.26, baru: true, r: 'CCTV-1 carport & gerbang: pojok kanan fasad di bawah tepi kanopi, menghadap gerbang (−40° ke kiri) sehingga mulut selasar kiri ikut terlihat, tunduk 15°' },
  { lvl: 'lt1', t: 'cctv', no: 2, x: 3.4, z: 13.25, n: 'dn', h: 2.7, yaw: 1.71, pitch: 0.35, baru: true, r: 'CCTV-2 teras depan & pintu utama: di plafon teras (bawah balkon) pojok kiri-depan, menghadap pintu utama (+x), tunduk 20°' },
  { lvl: 'lt1', t: 'cctv', no: 3, x: 2.25, z: 11.3, n: 'dn', h: 3.15, yaw: Math.PI, pitch: 0.3, baru: true, r: 'CCTV-3 selasar samping kiri: di bawah balkon samping (tengah), menghadap ke belakang: selasar z 4–11 dalam 7 m, sambung dengan CCTV-4 yang menutup ujung belakang; mulut depan selasar ditangkap CCTV-1' },
  { lvl: 'lt1', t: 'cctv', no: 4, x: 9.876, z: 2.6, n: '-x', h: 3.1, yaw: 0.17, pitch: 0.3, baru: true, r: 'CCTV-4 belakang: tembok batas kanan di bawah balkon belakang, menghadap teras belakang, pintu belakang, area jemur & ujung belakang selasar (+10°), tunduk 17°' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.876, z: 8.35, n: '-x', h: 0.4, nvr: true, baru: true, r: 'REVISI: stop kontak NVR 4 ch PoE, di dalam lemari bawah tangga (bagian tinggi dekat r. keluarga) — tambahan' },
  { lvl: 'lt1', t: 'stopkontak', x: 9.876, z: 8.45, n: '-x', h: 0.4, nvr: true, baru: true, r: 'REVISI: stop kontak router/switch, kotak kedua di samping stop kontak NVR — tambahan' },
  // ---------------- LANTAI 1: saklar 7 (2 tunggal + 5 ganda) ----------------
  { lvl: 'lt1', t: 'saklar2', x: 7.70, z: 3.564, n: '+z', h: 1.4, rev: true, r: 'REVISI: saklar ganda di kanan pintu belakang → lampu teras belakang + area jemur (DED: ganda; kotak Panasonic 2 saklar)' },
  { lvl: 'lt1', t: 'saklar1', tukar: true, x: 7.80, z: 3.564, n: '+z', h: 1.4, baru: true, r: 'REVISI: saklar tukar (two-way) lampu tangga/void, kotak kedua di kanan saklar ganda pintu belakang — tambahan' },
  { lvl: 'lt1', t: 'saklar2', x: 6.30, z: 6.937, n: '-z', h: 1.4, r: 'ruang makan, tembok toilet → lampu dapur, r. makan, lorong' },
  { lvl: 'lt1', t: 'saklar1', x: 5.42, z: 8.437, n: '-z', h: 1.4, r: 'lorong depan toilet → lampu toilet' },
  { lvl: 'lt1', t: 'saklar1', x: 5.42, z: 8.565, n: '+z', h: 1.4, r: 'KT1, kiri pintu → lampu KT1' },
  { lvl: 'lt1', t: 'saklar2', x: 2.937, z: 10.22, n: '-x', h: 1.4, r: 'teras samping (luar) → lampu taman/pagar' },
  { lvl: 'lt1', t: 'saklar2', x: 6.68, z: 11.69, n: '+x', h: 1.4, r: 'R. keluarga, di muka panel TV → lampu r. keluarga' },
  { lvl: 'lt1', t: 'saklar2', x: 6.66, z: 12.02, n: '+x', h: 1.4, r: 'R. keluarga, samping pintu utama → lampu teras & carport' },
  // ---------------- LANTAI 1: box MCB (4 × 10 A) & kWh meter, saling membelakangi di tembok kiri KT1 ----------------
  { lvl: 'lt1', t: 'mcb', x: 3.065, z: 11.47, n: '+x', h: 1.75, r: 'box MCB 4 group di dalam KT1, tembok kiri dekat tembok depan' },
  { lvl: 'lt1', t: 'kwh', x: 2.937, z: 11.5, n: '-x', h: 1.7, r: 'kWh meter PLN di sisi luar tembok kiri (teras samping)' },
  // ---------------- Lampu dinding outdoor (revisi lampu 09-10-2026) ----------------
  // DED lembar 26 menggambar 10 simbol "Lampu LED Outdoor" di lt1 (legendanya hanya menulis 2): 2 di fasad, 6 di tembok batas
  // kiri (taman samping), 1 di pagar belakang (r. jemur), 1 di pagar depan. Tinggi lampu taman = 1,45 m dunia (sejajar
  // sepanjang tembok; 1,45–1,80 m dari tanah/dek). skp: true = armaturnya sudah ada di model SKP → tidak digambar dobel.
  { lvl: 'lt1', t: 'sconce', x: 3.10, z: 13.591, n: '+z', h: 2.0, rev: true, ruang: 'Fasad depan', r: 'fasad lt1 kiri, kolom putih (DED). Tinggi 2,30 → 2,00 m: sejajar atas kusen pintu, standar lampu dinding fasad 1,8–2,1 m' },
  { lvl: 'lt1', t: 'sconce', x: 6.99, z: 13.56, n: '+z', h: 2.0, rev: true, ruang: 'Fasad depan', r: 'fasad lt1 di samping pintu utama (DED). Tinggi 2,30 → 2,00 m' },
  { lvl: 'lt1', t: 'sconce', x: 0.12, z: 0.30, n: '+x', h: 1.4, baru: true, r: 'taman samping, tembok batas kiri pojok belakang, di belakang pintu samping (DED; belum ada di model 3D sebelumnya). Kabel & saklar ikut lampu r. jemur (garis DED menyambung lewat pagar belakang)' },
  { lvl: 'lt1', t: 'sconce', x: 0.12, z: 3.70, n: '+x', h: 1.4, baru: true, r: 'taman samping, tembok batas kiri (DED; belum ada di model 3D sebelumnya)' },
  { lvl: 'lt1', t: 'sconce', x: 0.12, z: 6.00, n: '+x', h: 1.4, baru: true, r: 'taman samping, tembok batas kiri (DED; belum ada di model 3D sebelumnya)' },
  { lvl: 'lt1', t: 'sconce', x: 0.24, z: 9.98, n: '+x', h: 1.4, skp: true, rev: true, r: 'taman samping, panel dinding dek (posisi SKP; DED z 8,57 di ujung panel)' },
  { lvl: 'lt1', t: 'sconce', x: 0.24, z: 12.03, n: '+x', h: 1.4, skp: true, rev: true, r: 'taman samping, panel dinding dek (posisi SKP; DED z 13,43 di ujung panel)' },
  { lvl: 'lt1', t: 'sconce', x: 0.12, z: 15.00, n: '+x', h: 1.4, baru: true, r: 'samping carport, tembok batas kiri (DED; belum ada di model 3D sebelumnya)' },
  { lvl: 'lt1', t: 'sconce', x: 3.84, z: 0.125, n: '+z', h: 1.4, rev: true, r: 'r. jemur, muka dalam pagar belakang (DED). Tinggi 1,75 → 1,40 m, sejajar lampu taman' },
  { lvl: 'lt2', t: 'sconce', x: 6.07, z: 13.95, n: '+z', h: 1.15, skp: true, ruang: 'Fasad lt2', r: 'fasad lt2 di panel kisi kayu (posisi SKP; simbol DED di x 6,99), 1,15 m di atas lantai lt2: lampu aksen fasad' },
  // ---------------- LANTAI 2: stop kontak 8 ----------------
  { lvl: 'lt2', t: 'stopkontak', x: 3.065, z: 5.33, n: '+x', h: 0.4, r: 'KT2, tembok kiri' },
  { lvl: 'lt2', t: 'stopkontak', x: 6.435, z: 5.45, n: '-x', h: 0.4, r: 'KT2, tembok kanan' },
  { lvl: 'lt2', t: 'stopkontak', x: 6.563, z: 5.45, n: '+x', h: 0.4, r: 'selasar, tembok KT2' },
  { lvl: 'lt2', t: 'stopkontak', x: 6.435, z: 10.01, n: '-x', h: 0.4, r: 'KTU, tembok kanan (meja rias)' },
  { lvl: 'lt2', t: 'stopkontak', x: 3.065, z: 10.75, n: '+x', h: 0.4, r: 'KTU, tembok kiri' },
  { lvl: 'lt2', t: 'antena', x: 9.876, z: 12.19, n: '-x', h: 0.4, baru: true, r: 'REVISI: stop kontak antena TV (coax) di bawah meja kerja, kiri 3 stop kontak meja — tambahan' },
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
  { lvl: 'lt2', t: 'stopkontak', x: 4.5, z: 7.095, n: '+z', h: 1.9, wh: true, baru: true, r: 'REVISI: stop kontak water heater toilet lt2 kiri (di dalam KTU, IP44), tembok sisi KT2, kanan unit, 1,1 m dari kepala shower — tambahan' },
  // ---------------- LANTAI 2: saklar 8 (4 tunggal + 4 ganda) — diverifikasi ulang 5/10 dari scan 600 dpi: ganda = batang bercabang
  // sebelum ujung (stub), tunggal = batang berakhir di tick; dicocokkan dengan jumlah kelompok lampu per saklar & legenda ----------------
  { lvl: 'lt2', t: 'saklar1', x: 7.73, z: 3.564, n: '+z', h: 1.4, r: 'selasar, kanan pintu balkon belakang → lampu balkon' },
  { lvl: 'lt2', t: 'saklar1', x: 6.435, z: 5.88, n: '-x', h: 1.4, r: 'KT2, samping pintu → lampu KT2 (simbol DED: tunggal, 1 kelompok lampu)' },
  { lvl: 'lt2', t: 'saklar1', tukar: true, x: 9.876, z: 9.45, n: '-x', h: 1.4, baru: true, r: 'REVISI: saklar tukar (two-way) lampu tangga/void di tembok luar, tepat setelah anak tangga teratas — pasangan saklar triple lt1 di pintu belakang' },
  { lvl: 'lt2', t: 'saklar2', x: 6.563, z: 8.15, n: '+x', h: 1.4, rev: true, r: 'REVISI: selasar, samping pintu toilet kanan → 1 tuts lampu toilet kanan + 1 tuts 3 lampu selasar (2 selasar + 1 depan pintu KTU); menggantikan saklar selasar DED di z 5,88' },
  { lvl: 'lt2', t: 'saklar2', x: 4.07, z: 8.565, n: '+z', h: 1.4, r: 'KTU, kanan pintu toilet → lampu toilet kiri + lampu balkon samping kiri (simbol DED: ganda, 2 kelompok)' },
  { lvl: 'lt2', t: 'saklar1', x: 6.435, z: 9.57, n: '-x', h: 1.4, r: 'KTU, samping pintu → lampu KTU' },
  { lvl: 'lt2', t: 'saklar2', x: 9.876, z: 9.55, n: '-x', h: 1.4, rev: true, r: 'REVISI: R. keluarga lt2, tembok luar setelah tangga, kotak di samping saklar tukar → lampu r. keluarga lt2 (DED: di tembok KTU samping pintu)' },
  { lvl: 'lt2', t: 'saklar2', x: 6.563, z: 12.02, n: '+x', h: 1.4, r: 'R. keluarga lt2, samping pintu balkon → lampu balkon depan + sorot' },
];

// Titik lampu plafon (revisi lampu 09-10-2026). w = 5 | 9 (watt) | 'gantung' (titik lampu gantung furnitur).
// j = jenis armatur: 'dl' downlight tanam (default) | 'tempel' downlight tempel/outbow silinder (kanopi spandek carport) |
//     'gantung' titik fitting lampu gantung. h = tinggi plafon/bidang pasang dari lantai ybs (diukur dari model SKP).
// skp: true = armaturnya sudah ada di model SKP di titik itu (3D tidak menggambar dobel). rev = posisi/jenis diubah dari DED,
// baru = tidak ada di DED. Lampu dinding outdoor ada di PERANGKAT (t: 'sconce').
export const LAMPU = [
  // ---------------- lantai 1, dalam rumah (DED lembar 26; plafon gypsum 3,60 m) ----------------
  { lvl: 'lt1', x: 4.76, z: 5.24, w: 9, h: 3.60, r: 'dapur' },
  { lvl: 'lt1', x: 7.09, z: 5.24, w: 5, h: 3.60, r: 'r. makan sisi tangga' },
  { lvl: 'lt1', x: 5.08, z: 6.54, w: 'gantung', j: 'gantung', h: 3.60, baru: true, r: 'lampu gantung di atas meja makan (furnitur; tidak ada di DED → titik baru). Bawah bola lampu 1,56 m dari lantai = 0,80 m di atas meja (dulu 1,42 m di atas meja — terlalu tinggi; standar 0,75–0,90 m)' },
  { lvl: 'lt1', x: 3.87, z: 7.74, w: 5, h: 3.60, r: 'toilet' },
  { lvl: 'lt1', x: 7.09, z: 7.74, w: 5, h: 3.60, ruang: 'Lorong', r: 'lorong' },
  { lvl: 'lt1', x: 7.09, z: 8.98, w: 5, h: 3.60, r: 'r. keluarga' }, { lvl: 'lt1', x: 9.42, z: 8.98, w: 5, h: 3.35, r: 'r. keluarga, plafon turun dekat tangga' },
  { lvl: 'lt1', x: 4.76, z: 10.22, w: 9, h: 3.60, r: 'KT1' },
  { lvl: 'lt1', x: 7.09, z: 10.94, w: 5, h: 3.60, r: 'r. keluarga' },
  { lvl: 'lt1', x: 8.20, z: 11.20, w: 'gantung', j: 'gantung', h: 3.60, rev: true, r: 'r. keluarga: lampu gantung cincin di atas meja kopi, menggantikan titik 9 W DED (8,26 / 10,94; berimpit 27 cm). Cincin terbawah 2,20 m dari lantai (dulu kanopinya melayang 45 cm di bawah plafon)' },
  { lvl: 'lt1', x: 9.44, z: 10.94, w: 5, h: 3.60, r: 'r. keluarga' },
  { lvl: 'lt1', x: 7.09, z: 12.94, w: 5, h: 3.60, r: 'r. keluarga' }, { lvl: 'lt1', x: 9.44, z: 12.94, w: 5, h: 3.60, r: 'r. keluarga' },
  // ---------------- lantai 1, luar ----------------
  { lvl: 'lt1', x: 8.19, z: 2.72, w: 9, h: 3.45, skp: true, rev: true, r: 'teras belakang (DED 8,30 / 2,74; armatur SKP 11 cm dari titik DED → dipakai posisi SKP)' },
  { lvl: 'lt1', x: 4.69, z: 12.83, w: 9, h: 3.15, skp: true, rev: true, r: 'teras depan, plafon bawah dak lt2 (DED 4,75 / 12,72; posisi SKP)' },
  { lvl: 'lt1', x: 2.18, z: 10.21, w: 9, h: 3.15, skp: true, rev: true, r: 'bawah balkon samping (dek taman), plafon kayu (posisi SKP). DED hanya 1 titik di 1,55 / 10,97 = di tepi luar balkon → diganti 2 titik SKP di tengah plafon' },
  { lvl: 'lt1', x: 2.18, z: 11.83, w: 9, h: 3.15, skp: true, baru: true, r: 'bawah balkon samping (dek taman), titik kedua (posisi SKP; +1 dari DED)' },
  { lvl: 'lt1', x: 4.77, z: 15.0, w: 9, j: 'tempel', h: 2.82, rev: true, r: 'carport (DED), downlight tempel di bawah atap spandek (tidak bisa ditanam); bawah armatur ±2,68 m dari lantai' },
  { lvl: 'lt1', x: 8.30, z: 15.0, w: 9, j: 'tempel', h: 2.85, rev: true, r: 'carport (DED), downlight tempel' },
  { lvl: 'lt1', x: 4.77, z: 18.0, w: 9, j: 'tempel', h: 2.82, rev: true, r: 'carport sisi pagar (DED), downlight tempel' },
  { lvl: 'lt1', x: 8.30, z: 18.0, w: 9, j: 'tempel', h: 2.85, rev: true, r: 'carport sisi pagar (DED), downlight tempel' },
  { lvl: 'lt1', x: 3.60, z: 19.17, w: 5, j: 'uplight', h: -0.22, hKet: 'kepala lampu di bak tanaman (sorot ke atas)', skp: true, rev: true, ruang: 'Luar pagar (sisi jalan)', r: 'sisi jalan, lampu sorot taman (spike) di bak tanaman di antara dua semak, menyorot dinding bertekstur ke atas (render hal. 4 & 6; armatur SKP). Sebelumnya salah kucatat sebagai lampu dinding. IP65' },
  { lvl: 'lt1', x: 9.72, z: 18.70, w: 5, j: 'tanam', h: -0.45, hKet: 'rata paving, 15 cm dari tembok (sorot ke atas)', baru: true, akhir: true, ruang: 'Carport', r: 'carport sisi gerbang, lampu sorot tanam lantai di kaki tembok batas kanan 0,75 m dari gerbang, menyorot tembok ke atas: pasangan lampu sorot dinding tekstur di sisi pintu pagar (tidak ada di DED/SKP; tambahan 09-10-2026). Wajib tipe tanam IP67 tahan dilindas mobil (drive-over). Grup lampu carport' },
  { lvl: 'lt1', x: 2.22, z: 19.23, w: 5, h: 1.64, hKet: '2,00 dari trotoar (plafon kanopi pintu pagar)', skp: true, baru: true, r: 'sisi jalan, di plafon kanopi pintu pagar pejalan kaki (hanya di SKP; dipertahankan: menerangi pintu pagar, bel & nomor rumah). 2,0 m dari trotoar' },
  { lvl: 'lt1', x: 6.45, z: 1.50, w: 5, j: 'uplight', h: -0.10, hKet: 'kepala lampu 0,17 di atas kerikil (sorot ke atas)', skp: true, baru: true, akhir: true, ruang: 'R. jemur', r: 'lampu sorot taman bertiang pendek (spike) di bak kerikil kaki dinding roster, menyorot roster ke atas (hanya di SKP; sempat salah kuanggap penutup floor drain). Dipertahankan sebagai aksen roster. Pakai tipe IP65, kabel outdoor dari grup lampu jemur lewat kolom roster lalu di bawah kerikil' },
  // ---------------- lantai 2, dalam rumah (DED lembar 27; plafon 3,40 m, sisi kanan x ≥ 8,6 turun 3,05 m) ----------------
  { lvl: 'lt2', x: 4.76, z: 5.24, w: 9, h: 3.40, r: 'KT2' },
  { lvl: 'lt2', x: 7.09, z: 4.99, w: 5, h: 3.40, r: 'selasar' }, { lvl: 'lt2', x: 9.42, z: 4.99, w: 9, h: 3.05, ruang: 'Void tangga', r: 'void tangga' },
  { lvl: 'lt2', x: 7.09, z: 6.98, w: 5, h: 3.40, r: 'selasar' }, { lvl: 'lt2', x: 9.42, z: 6.98, w: 9, h: 3.05, ruang: 'Void tangga', r: 'void tangga' },
  { lvl: 'lt2', x: 3.87, z: 7.74, w: 5, h: 3.40, r: 'toilet kiri (KTU)' }, { lvl: 'lt2', x: 5.66, z: 7.74, w: 5, h: 3.40, r: 'toilet kanan' },
  { lvl: 'lt2', x: 7.09, z: 8.98, w: 5, h: 3.40, r: 'r. keluarga lt2 (depan pintu KTU)' }, { lvl: 'lt2', x: 9.42, z: 8.98, w: 5, h: 3.05, r: 'r. keluarga lt2' },
  { lvl: 'lt2', x: 4.76, z: 10.22, w: 9, h: 3.40, r: 'KT utama' },
  { lvl: 'lt2', x: 7.09, z: 10.94, w: 5, h: 3.40, r: 'r. keluarga lt2' }, { lvl: 'lt2', x: 8.26, z: 10.94, w: 9, h: 3.40, r: 'r. keluarga lt2 tengah' }, { lvl: 'lt2', x: 9.44, z: 10.94, w: 5, h: 3.05, r: 'r. keluarga lt2' },
  { lvl: 'lt2', x: 7.09, z: 12.94, w: 5, h: 3.40, r: 'r. keluarga lt2' }, { lvl: 'lt2', x: 9.44, z: 12.94, w: 5, h: 3.05, r: 'r. keluarga lt2' },
  // ---------------- lantai 2, balkon (plafon bawah atap 2,40 m) ----------------
  { lvl: 'lt2', x: 8.19, z: 2.72, w: 9, h: 2.40, skp: true, rev: true, r: 'balkon belakang (DED 8,30 / 2,74; posisi SKP)' },
  { lvl: 'lt2', x: 2.14, z: 9.58, w: 9, h: 2.40, skp: true, rev: true, r: 'balkon samping (DED 2,24 / 9,48; posisi SKP)' },
  { lvl: 'lt2', x: 2.14, z: 12.83, w: 9, h: 2.40, skp: true, rev: true, r: 'balkon depan, pojok kiri (DED 2,24 / 12,73; posisi SKP)' },
  { lvl: 'lt2', x: 5.01, z: 12.83, w: 9, h: 2.40, skp: true, rev: true, r: 'balkon depan (DED 4,74 / 12,73; posisi SKP 27 cm dari DED)' },
];
// Lampu yang ADA di model SKP tetapi TIDAK dipakai (tidak ada di DED / tidak fungsional) → disembunyikan di 3D. Koordinat dunia.
export const LAMPU_SKP_DIBUANG = [
  { x: 3.86, y: 2.70, z: 15.86, r: 'carport, baris tengah (SKP 5 lampu, tanpa lampu di sisi pagar) → diganti grid 2×2 DED' },
  { x: 6.26, y: 2.70, z: 15.86, r: 'carport, baris tengah' }, { x: 8.66, y: 2.70, z: 15.86, r: 'carport, baris tengah' },
  { x: 7.71, y: 2.70, z: 13.68, r: 'carport, depan kaca r. keluarga' }, { x: 8.67, y: 2.70, z: 13.68, r: 'carport, depan kaca r. keluarga' },
  { x: 2.69, y: 6.04, z: 6.16, r: 'luifel jendela KT2 sisi luar, 6 m di atas selasar samping (dekoratif)' },
  { x: 2.14, y: 6.24, z: 11.21, r: 'balkon samping, titik tambahan di antara 2 titik DED (jarak DED 3,25 m sudah cukup)' },
  { x: 3.57, y: 6.24, z: 12.83, r: 'balkon depan, titik tambahan' },
  { x: 8.22, y: 6.24, z: 13.80, r: 'atas bak tanaman di depan kaca r. keluarga lt2 (dekoratif)' },
];


// Jalur kabel (garis putus-putus di gambar), disederhanakan menjadi polyline ortogonal di bawah plafon/dak.
// Ujung yang berimpit dengan perangkat dinding otomatis diturunkan vertikal ke perangkat itu.
// JALUR: polyline [x, z] di plafon (tinggi diambil dari model SKP saat digambar; mengikuti balok/kanopi sebagai anak tangga).
// Elemen ke-3 opsional = tinggi tetap (m dari lantai) untuk ruas di luar yang tidak punya plafon (mis. menyusur puncak pagar).
export const JALUR = [
  // lantai 1
  { lvl: 'lt1', pts: [[7.70, 3.564], [7.70, 3.6], [8.19, 3.6], [8.19, 2.72]] },
  { lvl: 'lt1', pts: [[7.80, 3.564], [7.80, 3.7], [9.6, 3.7]] }, // traveller two-way ke saklar tukar lt2 (naik di pojok belakang kanan)
  // lampu pagar belakang: di bawah kanopi belakang (x ≥ 6.5, ±2,95 m) lalu turun ke puncak pagar (1,95 m) dan menyusur muka pagar
  { lvl: 'lt1', pts: [[7.95, 3.6], [7.95, 0.2], [7.95, 0.2, 1.5], [3.84, 0.2, 1.5], [3.84, 0.125, 1.5]] },
  { lvl: 'lt1', pts: [[3.84, 0.2, 1.5], [0.15, 0.2, 1.5], [0.15, 0.30, 1.5]] },
  { lvl: 'lt1', pts: [[7.95, 1.50], [6.70, 1.50], [6.70, 1.50, -0.12], [6.45, 1.50, -0.12]] }, // uplight roster: turun di kolom roster, lalu di bawah lantai // lampu taman pojok belakang ikut grup lampu jemur (seperti garis DED)
  { lvl: 'lt1', pts: [[6.30, 6.925], [6.30, 5.24], [4.76, 5.24]] },
  { lvl: 'lt1', pts: [[6.30, 6.925], [7.09, 6.925], [7.09, 5.24]] },
  { lvl: 'lt1', pts: [[6.30, 6.54], [5.08, 6.54]] }, // lampu gantung meja makan (cabang dari jalur saklar r. makan)
  { lvl: 'lt1', pts: [[7.09, 6.925], [7.09, 7.74]] },
  { lvl: 'lt1', pts: [[3.87, 7.74], [3.87, 8.25], [5.42, 8.25], [5.42, 8.425]] },
  { lvl: 'lt1', pts: [[5.42, 8.575], [5.42, 10.22], [4.76, 10.22]] },
  { lvl: 'lt1', pts: [[6.68, 11.69], [7.09, 11.69], [7.09, 8.98], [9.42, 8.98], [9.42, 12.94], [7.09, 12.94], [7.09, 11.69]] },
  { lvl: 'lt1', pts: [[7.09, 10.94], [9.44, 10.94]] },
  { lvl: 'lt1', pts: [[8.20, 10.94], [8.20, 11.20]] }, // lampu gantung r. keluarga
  { lvl: 'lt1', pts: [[6.68, 12.02], [6.9, 12.02], [6.9, 13.4], [3.10, 13.4], [3.10, 13.591]] },
  { lvl: 'lt1', pts: [[6.9, 13.4], [6.99, 13.4], [6.99, 13.56]] },
  { lvl: 'lt1', pts: [[4.69, 13.4], [4.69, 12.83]] },
  { lvl: 'lt1', pts: [[6.9, 13.4], [6.9, 18.0]] },
  { lvl: 'lt1', pts: [[4.77, 15.0], [8.30, 15.0]] },
  { lvl: 'lt1', pts: [[4.77, 18.0], [8.30, 18.0]] },
  { lvl: 'lt1', pts: [[8.30, 18.0], [9.80, 18.0], [9.80, 18.70], [9.86, 18.70], [9.86, 18.70, -0.5], [9.72, 18.70, -0.5]] }, // sorot tanam carport sisi gerbang (L1-34): turun di tembok, lalu di bawah paving
  // pagar depan (sisi jalan): dari lampu carport menembus pagar → lampu aksen bak tanaman & downlight kanopi pintu pagar
  { lvl: 'lt1', pts: [[4.77, 18.0], [3.6, 18.0], [3.6, 18.95], [3.6, 18.95, -0.1], [3.6, 19.17, -0.1]] },
  { lvl: 'lt1', pts: [[3.6, 18.95], [2.22, 18.95], [2.22, 18.95, 1.6], [2.22, 19.23, 1.6]] },
  // saklar ganda teras samping (1-31): tuts 1 = 2 lampu bawah balkon samping, tuts 2 = 6 lampu taman di tembok batas kiri
  { lvl: 'lt1', pts: [[2.925, 10.22], [2.18, 10.22], [2.18, 11.83]] },
  // menyusur muka tembok batas kiri (x 0,12–0,14) pada 1,5 m; berhenti di L1-02 sebelum pintu samping (z 2,1–3,4)
  { lvl: 'lt1', pts: [[2.18, 10.22], [0.15, 10.22], [0.15, 10.22, 1.5], [0.15, 3.70, 1.5]] },
  { lvl: 'lt1', pts: [[0.15, 10.22, 1.5], [0.15, 15.0, 1.5]] },
  // data CAT6 (CCTV → NVR di lemari bawah tangga), trunk di bawah dak sepanjang x 7.85 (di bawah lantai selasar lt2; void model SKP mulai x ±8,0 sampai tembok kanan, lebih lebar dari tangga)
  { lvl: 'lt1', data: true, pts: [[9.876, 8.4], [9.876, 9.5], [7.85, 9.5], [7.85, 13.4], [9.7, 13.4], [9.7, 13.56]] }, // dari NVR menyusur tembok kanan di bawah bordes, naik ke plafon setelah tepi lantai lt2 (z ±9,3); trunk x 7.85 = di bawah lantai selasar (void SKP x ≥ 8,0)
  { lvl: 'lt1', data: true, pts: [[7.85, 13.4], [6.6, 13.4], [6.6, 13.25], [3.4, 13.25]] },
  { lvl: 'lt1', data: true, pts: [[3.4, 13.25], [2.9, 13.25], [2.25, 13.25], [2.25, 11.3]] }, // CCTV-3 lewat plafon teras depan lalu bawah balkon samping
  { lvl: 'lt1', data: true, pts: [[7.85, 9.5], [7.85, 3.56], [7.85, 2.6], [9.876, 2.6]] },
  // coax antena TV: splitter 2 way di plafon r. keluarga lt2 (9.44, 12.19); kabel dari antena di atap turun ke splitter.
  // Cabang 1 → stop kontak antena bawah meja lt2; cabang 2 → menyusur plafon lt2 ke tembok TV (x 6,5–6,68), turun di dalam tembok ke plafon lt1, lalu ke stop kontak antena bawah TV.
  { lvl: 'lt2', coax: true, pts: [[9.44, 12.19], [9.876, 12.19]] },
  { lvl: 'lt2', coax: true, pts: [[9.44, 12.19], [6.6, 12.19]] },
  { lvl: 'lt1', coax: true, pts: [[6.6, 12.19], [6.6, 11.18], [6.679, 11.18]] },
  // lantai 2
  { lvl: 'lt2', pts: [[7.73, 3.575], [7.73, 3.6], [8.19, 3.6], [8.19, 2.72]] },
  { lvl: 'lt2', pts: [[6.425, 5.88], [4.76, 5.88], [4.76, 5.24]] },
  { lvl: 'lt2', pts: [[6.575, 8.15], [7.09, 8.15], [7.09, 8.98]] }, // saklar ganda selasar → lampu depan pintu KTU
  { lvl: 'lt2', pts: [[7.09, 8.15], [7.09, 6.98], [7.09, 4.99]] }, // … dan 2 lampu selasar
  { lvl: 'lt2', pts: [[9.876, 9.45], [9.42, 9.45], [9.42, 8.98], [9.42, 4.99]] }, // lampu void/tangga dari saklar tukar lt2
  { lvl: 'lt2', pts: [[9.6, 3.7], [9.42, 3.7], [9.42, 4.99]] }, // traveller two-way dari saklar triple lt1 (riser di pojok belakang kanan)
  { lvl: 'lt2', pts: [[5.66, 7.74], [6.3, 7.74], [6.3, 8.15], [6.575, 8.15]] },
  { lvl: 'lt2', pts: [[3.87, 7.74], [3.87, 8.6], [4.07, 8.6], [4.07, 8.575]] },
  { lvl: 'lt2', pts: [[2.14, 9.58], [2.14, 8.72], [4.07, 8.72], [4.07, 8.6]] },
  { lvl: 'lt2', pts: [[6.425, 9.57], [6.4, 9.75], [4.76, 9.75], [4.76, 10.22]] },
  { lvl: 'lt2', pts: [[9.876, 9.55], [9.44, 9.55], [9.44, 10.94]] }, // saklar ganda r. keluarga lt2 (tembok luar) → lampu r. keluarga
  { lvl: 'lt2', pts: [[9.44, 9.55], [9.42, 9.55], [9.42, 8.98]] },
  { lvl: 'lt2', pts: [[7.09, 10.94], [7.09, 12.94], [9.44, 12.94], [9.44, 10.94]] },
  { lvl: 'lt2', pts: [[7.09, 10.94], [9.44, 10.94]] },
  { lvl: 'lt2', pts: [[6.575, 12.02], [6.9, 12.02], [6.9, 12.83], [5.01, 12.83], [2.14, 12.83]] },
  { lvl: 'lt2', pts: [[6.9, 12.83], [6.9, 13.7], [6.07, 13.7], [6.07, 13.95]] },
];

// ---------------------------------------------------------------------------
// KOTAK INBOW: tiap stop kontak / saklar = satu kotak Panasonic. ID = <lantai>-<nomor>, urut per ruangan lalu posisi.
const RUANG_LT1 = (x, z) => z > 19.1 ? 'Luar pagar (sisi jalan)' : x < 1.5 && z > 8.5 && z < 13.5 ? 'Taman samping (dek)' : x < 1.5 ? 'Taman samping' : z > 13.5 ? 'Carport' : x < 2.85 && z > 8.5 ? 'Taman samping (dek)' : x < 3 ? 'Selasar samping (luar)' : z < 3.5 ? (x > 6.5 ? 'Teras belakang' : 'R. jemur')
  : z < 4.2 && x >= 6.5 ? 'Pintu belakang (r. makan)' : z < 7 ? (x >= 6.5 ? 'R. makan (sisi tangga)' : z < 5.5 ? 'Dapur' : 'R. makan')
  : z < 8.5 ? (x > 8.8 ? 'Lemari bawah tangga' : x >= 6.5 ? 'R. makan (sisi tangga)' : x < 4.6 ? 'Toilet' : 'Lorong')
  : x >= 6.5 ? 'R. keluarga' : z < 12 ? 'KT1' : 'Teras depan';
const RUANG_LT2 = (x, z) => z < 3.5 ? 'Balkon belakang' : x < 3 ? (z > 12 ? 'Balkon depan' : 'Balkon samping') : z < 7 ? (x >= 6.5 ? 'Selasar' : 'KT2')
  : z < 8.5 ? (x >= 6.5 ? 'Selasar' : x < 4.6 ? 'Toilet kiri (KTU)' : 'Toilet kanan') : x >= 6.5 ? (z > 13.5 ? 'Balkon depan' : 'R. keluarga lt2') : z < 12 ? 'KT utama' : 'Balkon depan';
const URUT = ['Taman samping', 'Taman samping (dek)', 'Teras belakang', 'R. jemur', 'Dapur', 'R. makan', 'Pintu belakang (r. makan)', 'R. makan (sisi tangga)', 'Lemari bawah tangga', 'Toilet', 'Lorong', 'KT1', 'R. keluarga', 'Teras depan', 'Fasad depan', 'Selasar samping (luar)', 'Carport', 'Luar pagar (sisi jalan)',
  'Balkon belakang', 'KT2', 'Selasar', 'Void tangga', 'Toilet kiri (KTU)', 'Toilet kanan', 'KT utama', 'R. keluarga lt2', 'Balkon depan', 'Fasad lt2', 'Balkon samping'];
const ISI = { stopkontak: '1 stop kontak', saklar1: '1 saklar', saklar2: '2 saklar', antena: '1 stop kontak antena TV' };
/** Nama ruangan untuk perangkat dinding (titik 6 cm di depan muka tembok). */
export function ruangDi(lvl, x, z) { return lvl === 'lt1' ? RUANG_LT1(x, z) : RUANG_LT2(x, z); }
export const KOTAK = [];
for (const lvl of ['lt1', 'lt2']) {
  const list = PERANGKAT.filter((d) => d.lvl === lvl && ISI[d.t]).map((d) => {
    const nx = d.n === '+x' ? 1 : d.n === '-x' ? -1 : 0, nz = d.n === '+z' ? 1 : d.n === '-z' ? -1 : 0;
    return { d, ruang: ruangDi(lvl, d.x + nx * 0.06, d.z + nz * 0.06) };
  });
  list.sort((a, b) => (URUT.indexOf(a.ruang) - URUT.indexOf(b.ruang)) || (a.d.z - b.d.z) || (a.d.x - b.d.x));
  list.forEach((k, i) => {
    const id = `${lvl === 'lt1' ? 1 : 2}-${String(i + 1).padStart(2, '0')}`;
    k.d.id = id;
    KOTAK.push({ id, lvl, ruang: k.ruang, t: k.d.t, isi: ISI[k.d.t] + (k.d.tukar ? ' tukar' : k.d.ac ? ' AC' : k.d.wh ? ' water heater (IP44)' : k.d.nvr ? ' (NVR/router)' : ''), x: k.d.x, z: k.d.z, n: k.d.n, h: k.d.h, baru: !!k.d.baru, rev: !!k.d.rev, r: k.d.r });
  });
}

// ---------------------------------------------------------------------------
// TITIK LAMPU: semua lampu (plafon LAMPU + dinding outdoor PERANGKAT 'sconce') dengan ID L<lantai>-<nomor>, urut per ruang.
// ID tampil di 3D (tekan E), di denah 2D, dan di tabel daftar lampu (docs/daftar-kotak.pdf).
const JENIS = { dl: 'Downlight tanam', tempel: 'Downlight tempel (outbow)', gantung: 'Titik lampu gantung', sconce: 'Lampu dinding outdoor (up-down)', uplight: 'Lampu sorot taman (spike, sorot ke atas)', tanam: 'Lampu sorot tanam lantai (sorot ke atas)' };
export const TITIK_LAMPU = [];
for (const lvl of ['lt1', 'lt2']) {
  const list = [
    ...LAMPU.filter((l) => l.lvl === lvl).map((l) => ({ o: l, jenis: l.j || 'dl', ruang: l.ruang || ruangDi(lvl, l.x, l.z) })),
    ...PERANGKAT.filter((d) => d.lvl === lvl && d.t === 'sconce').map((d) => {
      const nx = d.n === '+x' ? 1 : d.n === '-x' ? -1 : 0, nz = d.n === '+z' ? 1 : d.n === '-z' ? -1 : 0;
      return { o: d, jenis: 'sconce', ruang: d.ruang || ruangDi(lvl, d.x + nx * 0.06, d.z + nz * 0.06) };
    }),
  ];
  // akhir: true = titik yang ditambahkan setelah daftar dibagikan → diberi nomor paling akhir supaya ID lama tidak bergeser
  list.sort((a, b) => (!!a.o.akhir - !!b.o.akhir) || (URUT.indexOf(a.ruang) - URUT.indexOf(b.ruang)) || (a.o.z - b.o.z) || (a.o.x - b.o.x));
  list.forEach((k, i) => {
    const id = `L${lvl === 'lt1' ? 1 : 2}-${String(i + 1).padStart(2, '0')}`;
    k.o.lid = id;
    const sumber = k.o.baru ? (k.o.skp ? 'SKP (tidak ada di DED)' : 'baru') : k.o.skp ? (k.o.rev ? 'DED, posisi SKP' : 'DED = SKP') : k.o.rev ? 'DED, diubah' : 'DED';
    TITIK_LAMPU.push({ id, lvl, ruang: k.ruang, jenis: JENIS[k.jenis], j: k.jenis, w: k.o.w ?? 5, x: k.o.x, z: k.o.z, h: k.o.h, hKet: k.o.hKet, n: k.o.n, skp: !!k.o.skp, baru: !!k.o.baru, rev: !!k.o.rev, sumber, r: k.o.r });
  });
}
