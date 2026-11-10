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
| 5 | Plafon strip dak depan lt1 | 7,20 × 0,40 | 2,88 m² | 3,17 m² |  |
| 6 | Plafon balkon depan lt2 | 3,40 × 2,10 | 7,14 m² | 6,83 m² |  |
| 7 | Plafon balkon samping lt2 | 1,30 × 6,30 | 8,19 m² | 8,05 m² |  |
| 9 | Plafon atas jendela renteng lt2 | 2,30 × 0,50 | 1,15 m² | 1,16 m² |  |
| 10 | Plafon balkon belakang lt2 | 4,00 × 1,70 | 6,80 m² | 4,93 m² | Tukang 1,70 × 4,00, padahal teras lt1 tepat di bawahnya ditulis 1,70 × 3,00; di desain keduanya 3,40 × 1,45 → ukur ulang. |
| | **Total** | | **69,05 m²** | 55,38 m² | |

## Kebutuhan per produk (beli per box isi 10)

| Produk | Lebar efektif | Harga per m² | **Beli (termurah)** | Terpakai (rencana potong) | Cadangan | **Harga** | Alternatif semua 5 m** | Kalau balkon belakang lt2 = 3,00 m* |
|---|---|---|---|---|---|---|---|---|
| Duma Modern 50x3 | 15 cm | Rp 393.333 | **1 box 3 m + 10 box 5 m** | 7 × 3 m + 94 × 5 m | 9 batang | **Rp 31.270.000** | 11 box 5 m, Rp 32.450.000 | 1 box 3 m + 10 box 5 m, Rp 31.270.000 |
| Duma Modern 100 | 10 cm | Rp 283.000 | **16 box 3 m + 6 box 5 m** | 150 × 3 m + 56 × 5 m | 14 batang | **Rp 22.074.000** | 16 box 5 m, Rp 22.640.000 | 15 box 5 m, Rp 21.225.000 |
| Duma Modern 150 | 15 cm | Rp 314.667 | **1 box 3 m + 10 box 5 m** | 7 × 3 m + 94 × 5 m | 9 batang | **Rp 25.016.000** | 11 box 5 m, Rp 25.960.000 | 1 box 3 m + 10 box 5 m, Rp 25.016.000 |
| Duma Neo Modern 200 | 19,8 cm | Rp 350.505 | **8 box 3 m + 4 box 5 m** | 76 × 3 m + 35 × 5 m | 9 batang | **Rp 30.536.000** | 9 box 5 m, Rp 31.230.000 | 1 box 3 m + 8 box 5 m, Rp 29.842.000 |
| Duma Neo Modern Tempo 150 | 15 cm | Rp 400.000 | **1 box 3 m + 10 box 5 m** | 7 × 3 m + 94 × 5 m | 9 batang | **Rp 31.800.000** | 11 box 5 m, Rp 33.000.000 | 1 box 3 m + 10 box 5 m, Rp 31.800.000 |

\*\* Semua batang 5 m: sedikit lebih mahal karena pembulatan box, tapi pesan lebih gampang, sambungan di gimbal / balkon samping lebih sedikit, dan tukang lebih leluasa kalau rencana potong tidak diikuti persis.

\* Tukang menulis plafon balkon belakang lt2 1,70 × 4,00, padahal teras lt1 tepat di bawahnya 1,70 × 3,00 dan di desain keduanya sama (3,40 × 1,45). Perlu diukur ulang.

## Gimbal vs plafon teras / balkon (Duma Modern 100)

| Bagian | Luas | Batang terpakai | ≈ biaya |
|---|---|---|---|
| Gimbal atap | 24,00 m² | 7 × 3 m + 45 × 5 m | Rp 7.673.000 |
| Plafon teras & balkon (8 bidang) | 45,04 m² | 94 × 5 m | Rp 14.401.000 |

Biaya per bagian = bagian luas × total harga Duma Modern 100 (Rp 22.074.000), untuk menimbang. Kalau dibeli terpisah, jumlah box bisa beda karena pembulatan box.

## Belum termasuk

- Lis tepi (U-trim / siku) dan end cap: keliling semua bidang ± 148 m (batas atas; sisi yang menempel dinding / balok bisa tanpa lis).
- Rangka hollow galvalum 2×4 / 4×4 (jarak 40–60 cm), sekrup, sealant, ongkos pasang.
- Tutup tiang (wall panel) — dihitung terpisah.
- Warna: Modern 50x3 B2, BC, BT, WG, C2, BW, E; Modern 100 B2, BC, BT, WG, C2, BW, E; Modern 150 B2, BC, BT, WG, C2, BW, E; Neo Modern 200 BT, C2; Neo Modern Tempo 150 (lihat katalog).
