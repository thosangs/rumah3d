// WPC (plafon luar + gimbal atap; tutup tiang) — satu sumber untuk hitungan kebutuhan
// (scripts/wpc-hitung.mjs → docs/wpc-kebutuhan.md) dan lapisan 3D (src/wpc.js, tombol J / ?wpc=1).
//
// Ukuran "ukur" = ukuran lapangan dari catatan tukang (Nov 2026). Ukuran "desain" = model SKP / DED, untuk pembanding.
// "hemat" = alternatif untuk item yang masih diragukan (dipakai skenario hemat; item lain memakai "ukur").
// Tiap bidang: lintang = lebar yang ditutup lajur papan (melintang arah papan), bujur = panjang papan (arah serat).
// Arah papan mengikuti denah plafon DED lembar 11–12 (garis plafon PVC sejajar sumbu depan–belakang), gimbal sejajar
// lisplang, tiang tegak. Celengan fasad tidak jadi dilapis WPC. Tutup tiang memakai produk wall panel (harga lain),
// jadi hanya digambar di 3D, tidak ikut hitungan plafon.

export const PRODUK = { // daftar harga Duma (plafon), harga per batang, isi 10 batang per box
  m50: { nama: 'Duma Modern 50x3', eff: 0.15, alur: 0.05, lebarTotal: 0.17, tebal: 0.008, harga: { 3: 177000, 5: 295000 }, isiBox: 10, warnaTersedia: 'B2, BC, BT, WG, C2, BW, E', contoh: '#a8744c' },
  m100: { nama: 'Duma Modern 100', eff: 0.10, lebarTotal: 0.1165, tebal: 0.008, harga: { 3: 84900, 5: 141500 }, isiBox: 10, warnaTersedia: 'B2, BC, BT, WG, C2, BW, E', contoh: '#9c7c58' },
  m150: { nama: 'Duma Modern 150', eff: 0.15, lebarTotal: 0.171, tebal: 0.008, harga: { 3: 141600, 5: 236000 }, isiBox: 10, warnaTersedia: 'B2, BC, BT, WG, C2, BW, E', contoh: '#8c6356' },
  n200: { nama: 'Duma Neo Modern 200', eff: 0.198, lebarTotal: 0.214, tebal: 0.006, harga: { 3: 208200, 5: 347000 }, isiBox: 10, warnaTersedia: 'BT, C2', contoh: '#9a4e32' },
  t150: { nama: 'Duma Neo Modern Tempo 150', eff: 0.15, lebarTotal: 0.165, tebal: 0.01, harga: { 3: 180000, 5: 300000 }, isiBox: 10, warnaTersedia: '(lihat katalog)', contoh: '#6e4a35' },
};

// render: persegi dunia (m). Plafon: y = tinggi muka bawah plafon/overstek di model (diukur), x0..x1, z0..z1, arah papan 'x' | 'z'.
// Tiang: kotak { kotak: true, x0, x1, z0, z1, y0, y1 }.
export const AREA = [
  { id: 'P1', no: '1', nama: 'Gimbal atap (plafon bawah lisplang)', jenis: 'plafon', lvl: 'lt2',
    ukur: [{ lintang: 1.0, bujur: 6.9, ket: 'depan' }, { lintang: 1.0, bujur: 10.2, ket: 'kiri' }, { lintang: 1.0, bujur: 6.9, ket: 'belakang' }],
    desain: [{ lintang: 0.5, bujur: 6.85 }, { lintang: 0.5, bujur: 11.1 }, { lintang: 0.6, bujur: 6.85 }],
    catatan: 'Tukang 1 × 24 m. Model: overstek 50–60 cm, panjang 24,5 m (depan + kiri + belakang). Di lapangan overstek dipanjangkan → pakai ukuran tukang.',
    render: [{ y: 7.25, x0: 2.45, x1: 2.94, z0: 2.95, z1: 14.05, arah: 'z' }, { y: 7.25, x0: 2.94, x1: 9.80, z0: 13.56, z1: 14.05, arah: 'x' }, { y: 7.25, x0: 2.94, x1: 9.80, z0: 2.95, z1: 3.56, arah: 'x' }] },
  { id: 'P2', no: '2', nama: 'Plafon teras belakang lt1', jenis: 'plafon', lvl: 'lt1',
    ukur: [{ lintang: 3.00, bujur: 1.70 }], desain: [{ lintang: 3.40, bujur: 1.45 }],
    catatan: 'Desain sama dengan balkon belakang lt2 di atasnya (3,40 × 1,45).',
    render: [{ y: 3.50, x0: 6.50, x1: 9.88, z0: 2.00, z1: 3.45, arah: 'z' }] },
  { id: 'P3', no: '3', nama: 'Plafon teras depan lt1', jenis: 'plafon', lvl: 'lt1',
    ukur: [{ lintang: 3.50, bujur: 1.45 }], desain: [{ lintang: 3.50, bujur: 1.50 }],
    render: [{ y: 3.20, x0: 3.06, x1: 6.44, z0: 12.06, z1: 13.55, arah: 'z' }] },
  { id: 'P4', no: '5', nama: 'Plafon bawah balkon samping lt1', jenis: 'plafon', lvl: 'lt1',
    ukur: [{ lintang: 1.30, bujur: 6.70 }], desain: [{ lintang: 1.45, bujur: 5.50 }],
    render: [{ y: 3.20, x0: 1.50, x1: 2.94, z0: 8.50, z1: 14.00, arah: 'z' }] },
  { id: 'P5', no: '5', nama: 'Plafon dak depan lt1 (di atas kanopi carport)', jenis: 'plafon', lvl: 'lt1',
    ukur: [{ lintang: 8.50, bujur: 0.50 }], desain: [{ lintang: 8.50, bujur: 0.44 }],
    catatan: 'Catatan tukang no. 5 "DAK depan" 0,40 × 7,20; ukuran pemilik 0,50 × 8,50 (dipakai). Model: x 1,50–10,00, z 13,56–14,00. Ujung kiri (± 1,4 m) bertumpuk dengan plafon bawah balkon samping.',
    render: [{ y: 3.20, x0: 2.94, x1: 10.00, z0: 13.56, z1: 14.00, arah: 'z' }] },
  { id: 'P6', no: '6', nama: 'Plafon balkon depan lt2', jenis: 'plafon', lvl: 'lt2',
    ukur: [{ lintang: 3.40, bujur: 2.10 }], desain: [{ lintang: 3.50, bujur: 1.95 }],
    render: [{ y: 6.25, x0: 2.94, x1: 6.44, z0: 12.06, z1: 14.00, arah: 'z' }] },
  { id: 'P7', no: '7', nama: 'Plafon balkon samping lt2', jenis: 'plafon', lvl: 'lt2',
    ukur: [{ lintang: 1.30, bujur: 6.30 }], desain: [{ lintang: 1.45, bujur: 5.55 }],
    render: [{ y: 6.25, x0: 1.50, x1: 2.94, z0: 8.45, z1: 14.00, arah: 'z' }] },
  { id: 'P8', no: '9', nama: 'Plafon atas jendela renteng lt2', jenis: 'plafon', lvl: 'lt2',
    ukur: [{ lintang: 2.30, bujur: 0.50 }], desain: [{ lintang: 2.58, bujur: 0.45 }],
    render: [{ y: 6.25, x0: 6.92, x1: 9.52, z0: 13.56, z1: 14.00, arah: 'z' }] },
  { id: 'P9', no: '10', nama: 'Plafon balkon belakang lt2', jenis: 'plafon', lvl: 'lt2',
    ukur: [{ lintang: 4.00, bujur: 1.70 }], desain: [{ lintang: 3.40, bujur: 1.45 }],
    hemat: [{ lintang: 3.00, bujur: 1.70 }], // kalau ternyata sama dengan teras lt1 di bawahnya
    catatan: 'Tukang 1,70 × 4,00, padahal teras lt1 tepat di bawahnya ditulis 1,70 × 3,00; di desain keduanya 3,40 × 1,45 → ukur ulang.',
    render: [{ y: 6.25, x0: 6.50, x1: 9.88, z0: 2.00, z1: 3.45, arah: 'z' }] },
  { id: 'T1', no: '4', nama: 'Tutup tiang teras depan lt1 (16 × 46)', jenis: 'tiang', lvl: 'lt1',
    ukur: [{ lintang: 0.46, bujur: 3.65 }, { lintang: 0.46, bujur: 3.65 }, { lintang: 0.16, bujur: 3.65 }, { lintang: 0.16, bujur: 3.65 }],
    desain: [{ lintang: 0.46, bujur: 3.65 }, { lintang: 0.46, bujur: 3.65 }, { lintang: 0.16, bujur: 3.65 }, { lintang: 0.16, bujur: 3.65 }],
    catatan: 'Dari muka tanah sampai bawah dak (−0,50 → +3,15), cocok dengan model.',
    render: [{ kotak: true, x0: 2.902, x1: 3.282, z0: 13.402, z1: 13.602, y0: -0.40, y1: 3.15 }] },
  { id: 'T2', no: '7', nama: 'Tutup tiang balkon lt2 (16 × 46)', jenis: 'tiang', lvl: 'lt2',
    ukur: [{ lintang: 0.46, bujur: 3.30 }, { lintang: 0.46, bujur: 3.30 }, { lintang: 0.16, bujur: 3.30 }, { lintang: 0.16, bujur: 3.30 }],
    desain: [{ lintang: 0.46, bujur: 2.40 }, { lintang: 0.46, bujur: 2.40 }, { lintang: 0.16, bujur: 2.40 }, { lintang: 0.16, bujur: 2.40 }],
    hemat: [{ lintang: 0.46, bujur: 2.40 }, { lintang: 0.46, bujur: 2.40 }, { lintang: 0.16, bujur: 2.40 }, { lintang: 0.16, bujur: 2.40 }], // hanya sampai plafon balkon
    catatan: 'Tukang 3,30 = lantai lt2 sampai dak atap; plafon balkon ada di 2,40 → bagian di atas plafon tertutup.',
    render: [{ kotak: true, x0: 2.902, x1: 3.282, z0: 13.402, z1: 13.602, y0: 3.80, y1: 6.25 }] },
];

// Lis profil Duma (aksesoris, dipesan per lonjor). Panjang lis plafon dari tukang.
export const LIS = {
  panjang: 145, sumber: 'tukang',
  produk: {
    siku21: { nama: 'Lis Siku 21 × 21', harga: { 3: 67500, 5: 112500 }, warna: 'B2, BC, BT, WG, C2, BW, E', pakai: 'tepi / sudut luar plafon' },
    siku35: { nama: 'Lis Siku 35 × 35', harga: { 3: 77250, 5: 128750 }, warna: 'BT, WG, C2, BW, BC', pakai: 'tepi / sudut luar, lebih lebar' },
    ls: { nama: 'Lis Atas (LS)', harga: { 3: 112500, 5: 187500 }, warna: 'C2, B2, BT, E, BW', pakai: 'pertemuan plafon dengan dinding (list profil)' },
    lt: { nama: 'Lis Tengah (LT)', harga: { 3: 112500, 5: 187500 }, warna: 'C2, B2, BT, E, BW', pakai: 'penutup sambungan di tengah bidang' },
    crescent: { nama: 'Lis Crescent', harga: { 3: 58500, 5: 97500 }, warna: 'BT, C2', pakai: 'sudut dalam (cekung)' },
    quarter: { nama: 'Lis Quarter Round', harga: { 3: 58500, 5: 97500 }, warna: 'BT, C2', pakai: 'sudut dalam (cembung)' },
  },
};
