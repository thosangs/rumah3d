// WPC (plafon luar, gimbal atap, wall panel fasad, tutup tiang) — satu sumber untuk hitungan kebutuhan
// (scripts/wpc-hitung.mjs → docs/wpc-kebutuhan.md) dan lapisan 3D (src/wpc.js, tombol J / ?wpc=1).
//
// Ukuran "ukur" = ukuran lapangan dari catatan tukang (Nov 2026). Ukuran "desain" = model SKP / DED, untuk pembanding.
// "hemat" = alternatif untuk item yang masih diragukan (dipakai skenario hemat; item lain memakai "ukur").
// Tiap bidang: lintang = lebar yang ditutup lajur papan (melintang arah papan), bujur = panjang papan (arah serat).
// Arah papan mengikuti denah plafon DED lembar 11–12 (garis plafon PVC sejajar sumbu depan–belakang), gimbal sejajar
// lisplang, wall panel & tiang tegak.

export const PRODUK = {
  m100: { nama: 'Duma Modern 100', eff: 0.10, lebarTotal: 0.1165, tebal: 0.008, harga: { 3: 84900, 5: 141500 }, isiBox: 10, warnaTersedia: 'B2, BC, BT, WG, C2, BW, E', contoh: '#9c7c58' },
  m150: { nama: 'Duma Modern 150', eff: 0.15, lebarTotal: 0.171, tebal: 0.008, harga: { 3: 141600, 5: 236000 }, isiBox: 10, warnaTersedia: 'B2, BC, BT, WG, C2, BW, E', contoh: '#8c6356' },
  n200: { nama: 'Duma Neo Modern 200', eff: 0.198, lebarTotal: 0.214, tebal: 0.006, harga: { 3: 208200, 5: 347000 }, isiBox: 10, warnaTersedia: 'BT, C2', contoh: '#9a4e32' },
};

// render: persegi dunia (m). Plafon: y = tinggi muka bawah plafon/overstek di model (diukur), x0..x1, z0..z1, arah papan 'x' | 'z'.
// Dinding: bidang tegak { bidang: 'x' | 'z', pada, a0, a1 (sumbu lain), y0, y1, n: ±1 }.
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
  { id: 'P5', no: '5', nama: 'Plafon strip dak depan lt1', jenis: 'plafon', lvl: 'lt1',
    ukur: [{ lintang: 7.20, bujur: 0.40 }], desain: [{ lintang: 7.05, bujur: 0.45 }],
    render: [{ y: 3.20, x0: 2.94, x1: 9.88, z0: 13.56, z1: 14.00, arah: 'z' }] },
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
  { id: 'W1', no: '8', nama: 'Wall panel "celengan" fasad lt2 (bentuk U)', jenis: 'dinding', lvl: 'lt2',
    // bentuk U (depan + kedua sisi), bentangan total 3,80 menurut tukang; pembagian per muka belum diukur → depan 1,72 (model),
    // sisa 2,08 dibagi rata ke dua sisi. Tiap muka dihitung lajurnya sendiri (lajur tepi dibelah di sudut).
    ukur: [{ lintang: 1.72, bujur: 3.30, ket: 'depan' }, { lintang: 1.04, bujur: 3.30, ket: 'sisi kiri' }, { lintang: 1.04, bujur: 3.30, ket: 'sisi kanan' }],
    desain: [{ lintang: 1.72, bujur: 2.50, ket: 'depan' }, { lintang: 0.47, bujur: 2.50, ket: 'sisi kiri' }, { lintang: 0.35, bujur: 2.50, ket: 'sisi kanan' }],
    catatan: 'Bentuk U: depan + 2 sisi, bentangan 3,80 × tinggi 3,30 (tukang). Model: 1,72 + 0,47 + 0,35 = 2,54 m, tinggi tampak 2,50 m.',
    render: [{ bidang: 'z', pada: 13.958, a0: 5.20, a1: 6.92, y0: 3.75, y1: 6.25, n: 1 },
      { bidang: 'x', pada: 5.192, a0: 13.44, a1: 13.958, y0: 3.75, y1: 6.25, n: -1 },
      { bidang: 'x', pada: 6.928, a0: 13.56, a1: 13.958, y0: 3.75, y1: 6.25, n: 1 }] },
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
