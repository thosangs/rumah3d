# Kebutuhan WPC Duma — plafon luar, gimbal, wall panel, tutup tiang

Dihitung otomatis oleh `scripts/wpc-hitung.mjs` dari `src/layout/wpc.js` (data yang sama dengan lapisan WPC di model 3D, tombol **K**). Ukuran utama = ukuran lapangan tukang; pembanding = model SKP / DED. Harga = daftar harga Duma per batang (isi 10/box).

Cara hitung: tiap bidang dibagi lajur selebar **lebar efektif** papan, tiap lajur dipotong sepanjang bidang (+1 cm rapikan). Potongan dipaketkan ke batang 3 m / 5 m sehingga sisa potongan terpakai lagi di bidang lain, dipilih kombinasi dengan total meter paling kecil. Lalu ditambah **jeda error 10 %** (salah potong, cacat, rusak saat pasang), dibulatkan ke atas per batang.

## Bidang

| No. tukang | Bidang | Ukuran tukang | Luas | Model / DED | Catatan |
|---|---|---|---|---|---|
| 1 | Gimbal atap (plafon bawah lisplang) | 1,00 × 6,90 + 1,00 × 10,20 + 1,00 × 6,90 | 24,00 m² | 13,08 m² | Tukang 1 × 24 m. Model: overstek 50–60 cm, panjang 24,5 m (depan + kiri + belakang). Di lapangan overstek dipanjangkan → pakai ukuran tukang. |
| 2 | Plafon teras belakang lt1 | 3,00 × 1,70 | 5,10 m² | 4,93 m² | Desain sama dengan balkon belakang lt2 di atasnya (3,40 × 1,45). |
| 3 | Plafon teras depan lt1 | 3,50 × 1,45 | 5,08 m² | 5,25 m² |  |
| 5 | Plafon bawah balkon samping lt1 | 1,30 × 6,70 | 8,71 m² | 7,97 m² |  |
| 5 | Plafon strip dak depan lt1 | 7,20 × 0,40 | 2,88 m² | 3,17 m² |  |
| 6 | Plafon balkon depan lt2 | 3,40 × 2,10 | 7,14 m² | 6,83 m² |  |
| 7 | Plafon balkon samping lt2 | 1,30 × 6,30 | 8,19 m² | 8,05 m² |  |
| 9 | Plafon atas jendela renteng lt2 | 2,30 × 0,50 | 1,15 m² | 1,16 m² |  |
| 10 | Plafon balkon belakang lt2 | 4,00 × 1,70 | 6,80 m² | 4,93 m² | Tukang 1,70 × 4,00, padahal teras lt1 tepat di bawahnya ditulis 1,70 × 3,00; di desain keduanya 3,40 × 1,45 → ukur ulang. |
| 8 | Wall panel "celengan" fasad lt2 (bentuk U) | 1,72 + 1,04 + 1,04 × 3,30 | 12,54 m² | 6,35 m² | Bentuk U: depan + 2 sisi, bentangan 3,80 × tinggi 3,30 (tukang). Model: 1,72 + 0,47 + 0,35 = 2,54 m, tinggi tampak 2,50 m. |
| 4 | Tutup tiang teras depan lt1 (16 × 46) | 0,46 + 0,46 + 0,16 + 0,16 × 3,65 | 4,53 m² | 4,53 m² | Dari muka tanah sampai bawah dak (−0,50 → +3,15), cocok dengan model. |
| 7 | Tutup tiang balkon lt2 (16 × 46) | 0,46 + 0,46 + 0,16 + 0,16 × 3,30 | 4,09 m² | 2,98 m² | Tukang 3,30 = lantai lt2 sampai dak atap; plafon balkon ada di 2,40 → bagian di atas plafon tertutup. |
| | **Total** | | **90,20 m²** | 69,23 m² | |

## Kebutuhan per produk (satu produk untuk semua bidang)

| Produk | Lebar efektif | Harga per m² | Batang 3 m | Batang 5 m | Harga per batang | Kalau beli per box (isi 10) | Skenario hemat* |
|---|---|---|---|---|---|---|---|
| Duma Modern 100 | 10 cm | Rp 283.000 | 0 | 224 | **Rp 31.696.000** | 23 box, Rp 32.545.000 | 211 btg, Rp 29.856.500 |
| Duma Modern 150 | 15 cm | Rp 314.667 | 0 | 158 | **Rp 37.288.000** | 16 box, Rp 37.760.000 | 147 btg, Rp 34.692.000 |
| Duma Neo Modern 200 | 19.8 cm | Rp 350.505 | 0 | 124 | **Rp 43.028.000** | 13 box, Rp 45.110.000 | 117 btg, Rp 40.599.000 |

Batang = sudah termasuk jeda error 10 %. Kalau toko hanya menjual per box (isi 10), sisa batang di box terakhir jadi cadangan tambahan.

\* Skenario hemat: plafon balkon belakang lt2 ternyata 1,70 × 3,00 (sama dengan teras di bawahnya) dan tiang lt2 cukup dilapis sampai plafon balkon (2,40 m). Item lain tetap ukuran tukang.

## Rincian per kelompok

| Produk | Kelompok | Luas | Batang bersih 3 m + 5 m | Sisa potong | + jeda error | Harga |
|---|---|---|---|---|---|---|
| Duma Modern 100 | plafon + gimbal | 69,05 m² | 11 + 135 | 13,99 m | 13 + 149 | Rp 22.187.200 |
| Duma Modern 100 | wall panel celengan | 12,54 m² | 0 + 40 | 67,60 m | 0 + 44 | Rp 6.226.000 |
| Duma Modern 100 | tutup tiang | 8,62 m² | 0 + 28 | 42,42 m | 0 + 31 | Rp 4.386.500 |
| Duma Modern 150 | plafon + gimbal | 69,05 m² | 0 + 97 | 7,37 m | 0 + 107 | Rp 25.252.000 |
| Duma Modern 150 | wall panel celengan | 12,54 m² | 0 + 26 | 43,94 m | 0 + 29 | Rp 6.844.000 |
| Duma Modern 150 | tutup tiang | 8,62 m² | 0 + 24 | 36,36 m | 0 + 27 | Rp 6.372.000 |
| Duma Neo Modern 200 | plafon + gimbal | 69,05 m² | 4 + 76 | 7,48 m | 5 + 84 | Rp 30.189.000 |
| Duma Neo Modern 200 | wall panel celengan | 12,54 m² | 0 + 21 | 35,49 m | 0 + 24 | Rp 8.328.000 |
| Duma Neo Modern 200 | tutup tiang | 8,62 m² | 0 + 16 | 24,24 m | 0 + 18 | Rp 6.246.000 |

Rincian per kelompok dipaketkan terpisah (sisa potong tidak dipakai lintas kelompok), jadi jumlahnya bisa sedikit lebih besar dari total gabungan di atas.

## Belum termasuk

- Lis / list tepi (U-trim, siku) dan end cap: plafon ± 148 m keliling bidang (batas atas), tiang 4 sudut × tinggi = 27,80 m, celengan ± 20,80 m.
- Rangka hollow galvalum 2×4 / 4×4 (jarak 40–60 cm), sekrup, sealant, ongkos pasang.
- Kode warna: Modern 100/150 tersedia B2, BC, BT, WG, C2, BW, E; Neo Modern 200 hanya BT, C2 (dari daftar harga).
