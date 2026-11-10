# Kebutuhan WPC Duma — plafon luar, gimbal, wall panel, tutup tiang

Dihitung otomatis oleh `scripts/wpc-hitung.mjs` dari `src/layout/wpc.js` (data yang sama dengan lapisan WPC di model 3D, tombol **J**). Ukuran utama = ukuran lapangan tukang; pembanding = model SKP / DED. Harga = daftar harga Duma per batang (isi 10/box).

Cara hitung:

1. Tiap bidang dibagi lajur selebar **lebar efektif** papan (dibulatkan ke atas; lajur tepi dibelah). Tiap lajur sepanjang bidang + 1 cm rapikan per potong.
2. **Rencana potong**: lajur ≤ 5 m dipasang utuh tanpa sambungan; potongannya dipaketkan ke batang 3 m / 5 m supaya sisa potong terpakai di bidang lain. Lajur > 5 m (gimbal, plafon balkon samping) memang harus disambung di atas rangka, jadi disusun dari sisa potongan ≥ 1,00 m dulu baru batang baru.
3. Ditambah **cadangan 5 %** untuk salah potong / papan cacat (sisa potong sudah dihitung di langkah 2, jadi tidak didobel).
4. Dipilih kombinasi 3 m / 5 m termurah — terpisah untuk beli per batang dan beli per box (isi 10).

## Bidang

| No. tukang | Bidang | Ukuran tukang | Luas | ≈ biaya Modern 100 | Model / DED | Catatan |
|---|---|---|---|---|---|---|
| 1 | Gimbal atap (plafon bawah lisplang) | 1,00 × 6,90 + 1,00 × 10,20 + 1,00 × 6,90 | 24,00 m² | Rp 7.530.000 | 13,08 m² | Tukang 1 × 24 m. Model: overstek 50–60 cm, panjang 24,5 m (depan + kiri + belakang). Di lapangan overstek dipanjangkan → pakai ukuran tukang. |
| 2 | Plafon teras belakang lt1 | 3,00 × 1,70 | 5,10 m² | Rp 1.600.000 | 4,93 m² | Desain sama dengan balkon belakang lt2 di atasnya (3,40 × 1,45). |
| 3 | Plafon teras depan lt1 | 3,50 × 1,45 | 5,08 m² | Rp 1.592.000 | 5,25 m² |  |
| 5 | Plafon bawah balkon samping lt1 | 1,30 × 6,70 | 8,71 m² | Rp 2.733.000 | 7,97 m² |  |
| 5 | Plafon strip dak depan lt1 | 7,20 × 0,40 | 2,88 m² | Rp 904.000 | 3,17 m² |  |
| 6 | Plafon balkon depan lt2 | 3,40 × 2,10 | 7,14 m² | Rp 2.240.000 | 6,83 m² |  |
| 7 | Plafon balkon samping lt2 | 1,30 × 6,30 | 8,19 m² | Rp 2.570.000 | 8,05 m² |  |
| 9 | Plafon atas jendela renteng lt2 | 2,30 × 0,50 | 1,15 m² | Rp 361.000 | 1,16 m² |  |
| 10 | Plafon balkon belakang lt2 | 4,00 × 1,70 | 6,80 m² | Rp 2.133.000 | 4,93 m² | Tukang 1,70 × 4,00, padahal teras lt1 tepat di bawahnya ditulis 1,70 × 3,00; di desain keduanya 3,40 × 1,45 → ukur ulang. |
| 8 | Wall panel "celengan" fasad lt2 (bentuk U) | 1,72 + 1,04 + 1,04 × 3,30 | 12,54 m² | Rp 3.934.000 | 6,35 m² | Bentuk U: depan + 2 sisi, bentangan 3,80 × tinggi 3,30 (tukang). Model: 1,72 + 0,47 + 0,35 = 2,54 m, tinggi tampak 2,50 m. |
| 4 | Tutup tiang teras depan lt1 (16 × 46) | 0,46 + 0,46 + 0,16 + 0,16 × 3,65 | 4,53 m² | Rp 1.420.000 | 4,53 m² | Dari muka tanah sampai bawah dak (−0,50 → +3,15), cocok dengan model. |
| 7 | Tutup tiang balkon lt2 (16 × 46) | 0,46 + 0,46 + 0,16 + 0,16 × 3,30 | 4,09 m² | Rp 1.284.000 | 2,98 m² | Tukang 3,30 = lantai lt2 sampai dak atap; plafon balkon ada di 2,40 → bagian di atas plafon tertutup. |
| | **Total** | | **90,20 m²** | **Rp 28.300.000** | 69,23 m² | |

Biaya per bidang = bagian luas × total (termasuk sisa potong & cadangan), untuk menimbang bidang mana yang paling mahal.

## Kebutuhan per produk (satu produk untuk semua bidang, ukuran tukang)

| Produk | Harga per m² | Batang 5 m pas (luas tanpa sisa) | Rencana potong | + cadangan 5 % | Harga beli per batang | Beli per box (isi 10) |
|---|---|---|---|---|---|---|
| Duma Modern 100 | Rp 283.000 | 181 | 190 × 5 m (sisa 25,65 m) | 200 × 5 m | **Rp 28.300.000** | **20 box 5 m**, Rp 28.300.000 |
| Duma Modern 150 | Rp 314.667 | 121 | 133 × 5 m (sisa 17,41 m) | 140 × 5 m | **Rp 33.040.000** | **14 box 5 m**, Rp 33.040.000 |
| Duma Neo Modern 200 | Rp 350.505 | 92 | 8 × 3 m + 100 × 5 m (sisa 14,01 m) | 9 × 3 m + 105 × 5 m | **Rp 38.308.800** | **1 box 3 m + 11 box 5 m**, Rp 40.252.000 |

### Skenario hemat*

| Produk | Luas | Batang | Harga per batang | Per box |
|---|---|---|---|---|
| Duma Modern 100 | 87,39 m² | 17 × 3 m + 183 × 5 m | Rp 27.337.800 | 20 box 5 m, Rp 28.300.000 |
| Duma Modern 150 | 87,39 m² | 101 × 3 m + 75 × 5 m | Rp 32.001.600 | 14 box 5 m, Rp 33.040.000 |
| Duma Neo Modern 200 | 87,39 m² | 8 × 3 m + 102 × 5 m | Rp 37.059.600 | 8 box 3 m + 6 box 5 m, Rp 37.476.000 |

\* Plafon balkon belakang lt2 ternyata 1,70 × 3,00 (sama dengan teras di bawahnya) dan tiang lt2 cukup dilapis sampai plafon balkon (2,40 m). Item lain tetap ukuran tukang.

## Rincian per kelompok (Duma Modern 100)

| Kelompok | Luas | Rencana potong | Sisa potong | + cadangan | Harga |
|---|---|---|---|---|---|
| plafon + gimbal | 69,05 m² | 118 × 3 m + 72 × 5 m | 19,59 m | 124 × 3 m + 76 × 5 m | Rp 21.281.600 |
| wall panel celengan | 12,54 m² | 0 × 3 m + 40 × 5 m | 67,60 m | 42 × 5 m | Rp 5.943.000 |
| tutup tiang | 8,62 m² | 0 × 3 m + 28 × 5 m | 42,42 m | 30 × 5 m | Rp 4.245.000 |

Tiap kelompok di atas dipaketkan sendiri. Celengan dan tiang dipasang tegak 3,30–3,65 m, jadi tiap batang 5 m menyisakan 1,3–1,7 m. Total 20 box di atas **mengandaikan sisa itu dipakai tukang untuk menyambung lajur gimbal & plafon balkon samping** (lajur > 5 m yang memang harus disambung; sambungan di atas rangka, tambah potongan hollow kalau perlu). Kalau sisa itu dibuang, kebutuhan naik jadi ± 23 box.

## Belum termasuk

- Lis / list tepi (U-trim, siku) dan end cap: plafon ± 148 m keliling bidang (batas atas), tiang 4 sudut × tinggi = 27,80 m, celengan ± 20,80 m.
- Rangka hollow galvalum 2×4 / 4×4 (jarak 40–60 cm), sekrup, sealant, ongkos pasang.
- Kode warna: Modern 100/150 tersedia B2, BC, BT, WG, C2, BW, E; Neo Modern 200 hanya BT, C2 (dari daftar harga).
