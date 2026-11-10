# Kebutuhan plafon WPC Duma (outdoor)

Dihitung otomatis oleh `scripts/wpc-hitung.mjs` dari `src/layout/wpc.js` (data yang sama dengan lapisan WPC di model 3D, tombol **J**). Ukuran = ukuran lapangan tukang. Harga = daftar harga Duma, **beli per box isi 10 batang**.

Yang dihitung hanya plafon outdoor: gimbal atap dan plafon teras / balkon. Tutup tiang memakai produk wall panel (dihitung terpisah); celengan fasad tidak dilapis WPC.

Cara hitung:

1. Tiap bidang dibagi lajur selebar **lebar efektif** papan (dibulatkan ke atas; lajur tepi dibelah). Tiap lajur sepanjang bidang + 1 cm rapikan per potong.
2. **Rencana potong**: lajur ≤ 5 m dipasang utuh tanpa sambungan; potongannya dipaketkan ke batang 3 m / 5 m supaya sisa potong terpakai di bidang lain. Lajur > 5 m (gimbal, plafon balkon samping) memang harus disambung di atas rangka, jadi disusun dari sisa potongan ≥ 1,00 m dulu, baru batang baru; paling banyak 1 sambungan lebih dari minimum per lajur supaya tidak tambal-sulam.
3. Ditambah **cadangan 5 %** untuk salah potong / papan cacat, lalu dibulatkan ke atas per box. Sisa batang di box terakhir ikut jadi cadangan.
4. Dipilih kombinasi box 3 m / 5 m yang termurah.

## Bidang plafon

| No. tukang | Bidang | Ukuran tukang (m) | Luas | Model / DED | Catatan |
|---|---|---|---|---|---|
| 1 | Gimbal atap (plafon bawah lisplang) | 1,00 × 6,90 + 1,00 × 10,20 + 1,00 × 6,90 | 24,00 m² | 13,08 m² | Tukang 1 × 24 m. Model: overstek 50–60 cm, panjang 24,5 m (depan + kiri + belakang). Di lapangan overstek dipanjangkan → pakai ukuran tukang. |
| 2 | Plafon teras belakang lt1 | 3,00 × 1,70 | 5,10 m² | 4,93 m² | Desain sama dengan balkon belakang lt2 di atasnya (3,40 × 1,45). |
| 3 | Plafon teras depan lt1 | 3,50 × 1,45 | 5,08 m² | 5,25 m² |  |
| 5 | Plafon bawah balkon samping lt1 | 1,30 × 6,70 | 8,71 m² | 7,97 m² |  |
| 5 | Plafon dak depan lt1 (di atas kanopi carport) | 8,50 × 0,50 | 4,25 m² | 3,74 m² | Catatan tukang no. 5 "DAK depan" 0,40 × 7,20; ukuran pemilik 0,50 × 8,50 (dipakai). Model: x 1,50–10,00, z 13,56–14,00. Ujung kiri (± 1,4 m) bertumpuk dengan plafon bawah balkon samping. |
| 6 | Plafon balkon depan lt2 | 3,40 × 2,10 | 7,14 m² | 6,83 m² |  |
| 7 | Plafon balkon samping lt2 | 1,30 × 6,30 | 8,19 m² | 8,05 m² |  |
| 9 | Plafon atas jendela renteng lt2 | 2,30 × 0,50 | 1,15 m² | 1,16 m² |  |
| 10 | Plafon balkon belakang lt2 | 4,00 × 1,70 | 6,80 m² | 4,93 m² | Tukang 1,70 × 4,00, padahal teras lt1 tepat di bawahnya ditulis 1,70 × 3,00; di desain keduanya 3,40 × 1,45 → ukur ulang. |
| | **Total** | | **70,42 m²** | 55,94 m² | |

## Kebutuhan per produk (beli per box isi 10)

| Produk | Lebar efektif | Harga per m² | **Beli (termurah)** | Terpakai (rencana potong) | Cadangan | **Harga** | Alternatif semua 5 m** | Kalau balkon belakang lt2 = 3,00 m* |
|---|---|---|---|---|---|---|---|---|
| Duma Modern 50x3 | 15 cm | Rp 393.333 | **11 box 5 m** | 101 × 5 m | 9 batang | **Rp 32.450.000** | sama | 3 box 3 m + 9 box 5 m, Rp 31.860.000 |
| Duma Modern 100 | 10 cm | Rp 283.000 | **16 box 5 m** | 146 × 5 m | 14 batang | **Rp 22.640.000** | sama | 2 box 3 m + 14 box 5 m, Rp 21.508.000 |
| Duma Modern 150 | 15 cm | Rp 314.667 | **11 box 5 m** | 101 × 5 m | 9 batang | **Rp 25.960.000** | sama | 3 box 3 m + 9 box 5 m, Rp 25.488.000 |
| Duma Neo Modern 200 | 19,8 cm | Rp 350.505 | **9 box 5 m** | 81 × 5 m | 9 batang | **Rp 31.230.000** | sama | 1 box 3 m + 8 box 5 m, Rp 29.842.000 |
| Duma Neo Modern Tempo 150 | 15 cm | Rp 400.000 | **11 box 5 m** | 101 × 5 m | 9 batang | **Rp 33.000.000** | sama | 3 box 3 m + 9 box 5 m, Rp 32.400.000 |

\*\* Semua batang 5 m: sedikit lebih mahal karena pembulatan box, tapi pesan lebih gampang, sambungan di gimbal / balkon samping lebih sedikit, dan tukang lebih leluasa kalau rencana potong tidak diikuti persis.

\* Tukang menulis plafon balkon belakang lt2 1,70 × 4,00, padahal teras lt1 tepat di bawahnya 1,70 × 3,00 dan di desain keduanya sama (3,40 × 1,45). Perlu diukur ulang.

## Ukuran tukang vs model 3D

| Bidang | Tukang | Model 3D / DED | Selisih |
|---|---|---|---|
| Gimbal atap (plafon bawah lisplang) | 24,00 m² | 13,08 m² | +10,92 m² |
| Plafon teras belakang lt1 | 5,10 m² | 4,93 m² | +0,17 m² |
| Plafon teras depan lt1 | 5,08 m² | 5,25 m² | -0,17 m² |
| Plafon bawah balkon samping lt1 | 8,71 m² | 7,97 m² | +0,74 m² |
| Plafon dak depan lt1 (di atas kanopi carport) | 4,25 m² | 3,74 m² | +0,51 m² |
| Plafon balkon depan lt2 | 7,14 m² | 6,83 m² | +0,31 m² |
| Plafon balkon samping lt2 | 8,19 m² | 8,05 m² | +0,14 m² |
| Plafon atas jendela renteng lt2 | 1,15 m² | 1,16 m² | -0,01 m² |
| Plafon balkon belakang lt2 | 6,80 m² | 4,93 m² | +1,87 m² |
| **Total** | **70,42 m²** | **55,94 m²** | **+14,47 m²** |

| Produk | Ukuran tukang | Ukuran model 3D | Selisih |
|---|---|---|---|
| Duma Modern 50x3 | 11 box 5 m, Rp 32.450.000 | 9 box 5 m, Rp 26.550.000 | 2 box, Rp 5.900.000 |
| Duma Modern 100 | 16 box 5 m, Rp 22.640.000 | 1 box 3 m + 12 box 5 m, Rp 17.829.000 | 3 box, Rp 4.811.000 |
| Duma Modern 150 | 11 box 5 m, Rp 25.960.000 | 9 box 5 m, Rp 21.240.000 | 2 box, Rp 4.720.000 |
| Duma Neo Modern 200 | 9 box 5 m, Rp 31.230.000 | 7 box 5 m, Rp 24.290.000 | 2 box, Rp 6.940.000 |
| Duma Neo Modern Tempo 150 | 11 box 5 m, Rp 33.000.000 | 9 box 5 m, Rp 27.000.000 | 2 box, Rp 6.000.000 |

Selisih terbesar di gimbal: model 50–60 cm, di lapangan overstek dipanjangkan jadi 1 m (sudah dikonfirmasi).

## Gimbal vs plafon lain (Duma Modern 100)

| Bagian | Luas | Batang terpakai | ≈ biaya |
|---|---|---|---|
| Gimbal atap | 24,00 m² | 7 × 3 m + 45 × 5 m | Rp 7.717.000 |
| Plafon teras, balkon & dak (8 bidang) | 46,41 m² | 97 × 5 m | Rp 14.923.000 |

Biaya per bagian = bagian luas × total harga Duma Modern 100 (Rp 22.640.000), untuk menimbang. Kalau dibeli terpisah, jumlah box bisa beda karena pembulatan box.

## Lis (aksesoris, dipesan per lonjor)

Panjang lis **145 m** (hitungan tukang) + 10 % (sisa potong + cadangan) = 159,50 m → **32 lonjor 5 m**. Keliling semua bidang plafon di data ini ± 151 m (batas atas, termasuk sisi yang menempel balok / dinding dan tidak perlu lis).

| Lis | Untuk | Harga per lonjor 5 m | Per meter | 32 lonjor |
|---|---|---|---|---|
| Lis Siku 21 × 21 | tepi / sudut luar plafon | Rp 112.500 | Rp 22.500 | **Rp 3.600.000** |
| Lis Siku 35 × 35 | tepi / sudut luar, lebih lebar | Rp 128.750 | Rp 25.750 | **Rp 4.120.000** |
| Lis Atas (LS) | pertemuan plafon dengan dinding (list profil) | Rp 187.500 | Rp 37.500 | **Rp 6.000.000** |
| Lis Tengah (LT) | penutup sambungan di tengah bidang | Rp 187.500 | Rp 37.500 | **Rp 6.000.000** |
| Lis Crescent | sudut dalam (cekung) | Rp 97.500 | Rp 19.500 | **Rp 3.120.000** |
| Lis Quarter Round | sudut dalam (cembung) | Rp 97.500 | Rp 19.500 | **Rp 3.120.000** |

Tipe lis tergantung detail tukang; kalau dicampur (mis. siku di tepi luar, LS di pertemuan dinding), jumlah lonjor dibagi sesuai panjang masing-masing.

## Belum termasuk

- Rangka hollow galvalum 2×4 / 4×4 (jarak 40–60 cm), sekrup, sealant, ongkos pasang.
- Tutup tiang (wall panel) — dihitung terpisah.
- Warna: Modern 50x3 B2, BC, BT, WG, C2, BW, E; Modern 100 B2, BC, BT, WG, C2, BW, E; Modern 150 B2, BC, BT, WG, C2, BW, E; Neo Modern 200 BT, C2; Neo Modern Tempo 150 (lihat katalog).
