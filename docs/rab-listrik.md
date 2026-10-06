# Estimasi Biaya Instalasi Listrik — Rumah Mbak Alfi (revisi 06-10-2026)

Dihitung otomatis oleh `scripts/rab-listrik.mjs` dari data model 3D (`src/layout/elektrik.js`). Harga satuan mengikuti **RAB V3 bagian IX** untuk item yang sama; item bertanda \* adalah perkiraan harga pasar (Okt 2026) karena tidak ada di RAB.

## A. Kuantitas

| Item | Jumlah |
|---|---:|
| Stop kontak biasa (DED 21 + revisi 8) | 29 |
| Stop kontak AC | 3 |
| Stop kontak water heater (IP44) | 2 |
| Sakelar tunggal / ganda / triple / tukar | 7 / 7 / 1 / 2 |
| Downlight 9 W / 5 W | 19 / 19 |
| Lampu sorot/dinding outdoor | 5 |
| **Titik instalasi (lampu + stop kontak + sakelar)** | **93** (RAB: 65) |

### Panjang jalur (dari geometri model)

| Jalur | Lantai 1 | Lantai 2 | Keterangan |
|---|---:|---:|---|
| Cabang lampu (polyline denah + turunan ke sakelar) | 113.5 m | 61.3 m | NYM 2×1,5 |
| Fase bersama lampu (box MCB → semua sakelar) | 52.8 m | 67.1 m | NYM 2×1,5, lt2 termasuk riser 3.8 m |
| Rantai stop kontak (box MCB → tiap titik, naik–turun dak) | 144.2 m | 94.5 m | NYM 3×2,5 |
| Home-run AC (5.8 + 12.7 + 7.8 m) | | | 26.3 m, NYM 3×2,5 |
| Home-run water heater (9.4 + 13 m) | | | 22.4 m, NYM 3×2,5 |
| **Kabel dibeli** (+10 % potongan, +0,5 m/titik) | | | NYM 2×1,5 **354 m** → 4 roll; NYM 3×2,5 **333 m** → 4 roll |
| **Pipa 5/8"** (90 % jalur, +5 % potongan) | | | **550 m** → 138 batang @4 m |

## B. Rencana anggaran (revisi)

| No | Uraian | Vol | Sat | Harga satuan | Jumlah |
|---:|---|---:|---|---:|---:|
| 1 | Pasang stop kontak 1 ph 16 A (termasuk 8 tambahan revisi) | 29 | bh | Rp 75.000 | Rp 2.175.000 |
| 2 | Pasang stop kontak AC 16 A \* | 3 | bh | Rp 95.000 | Rp 285.000 |
| 3 | Pasang stop kontak water heater 16 A IP44 (tutup) \* | 2 | bh | Rp 110.000 | Rp 220.000 |
| 4 | Pasang sakelar tunggal | 7 | bh | Rp 35.000 | Rp 245.000 |
| 5 | Pasang sakelar ganda | 7 | bh | Rp 55.000 | Rp 385.000 |
| 6 | Pasang sakelar triple (teras blk + jemur + tukar tangga) | 1 | bh | Rp 95.000 | Rp 95.000 |
| 7 | Pasang sakelar tukar (two-way) lampu tangga, lt2 tembok luar \* | 1 | bh | Rp 45.000 | Rp 45.000 |
| 8 | Kabel traveller NYM 3×1,5 mm² antar saklar tukar (lt1 pintu belakang ↔ lt2 atas tangga) \* | 14 | m | Rp 7.000 | Rp 98.000 |
| 9 | Pasang lampu LED downlight 9 W | 19 | bh | Rp 105.000 | Rp 1.995.000 |
| 10 | Pasang lampu LED downlight 5 W | 19 | bh | Rp 90.000 | Rp 1.710.000 |
| 11 | Pasang lampu LED sorot/dinding outdoor | 5 | bh | Rp 105.000 | Rp 525.000 |
| 12 | Pasang antena TV (titik) | 1 | bh | Rp 155.000 | Rp 155.000 |
| 13 | Box MCB 8 group (pengganti 4 group) \* | 1 | bh | Rp 185.000 | Rp 185.000 |
| 14 | MCB 1 fasa 10 A / 16 A (penerangan lt1, lt2; stop kontak lt1, lt2; AC lt1; AC lt2; water heater) | 7 | bh | Rp 132.500 | Rp 927.500 |
| 15 | Kabel NYM 2×1,5 mm² — jalur lampu (354 m) | 4 | roll | Rp 375.000 | Rp 1.500.000 |
| 16 | Kabel NYM 3×2,5 mm² — stop kontak (277 m) + AC (30 m) + water heater (26 m) \* | 4 | roll | Rp 850.000 | Rp 3.400.000 |
| 17 | Kabel NYM 3×4 mm² — kWh meter → box MCB \* | 5 | m | Rp 15.000 | Rp 75.000 |
| 18 | Pipa PVC listrik 5/8" (550 m) | 138 | batang | Rp 12.000 | Rp 1.656.000 |
| 19 | Aksesori (inbow/tee-dos, klem, isolasi) per titik | 93 | titik | Rp 8.750 | Rp 813.750 |
| 20 | Jasa tukang instalasi per titik | 93 | titik | Rp 40.000 | Rp 3.720.000 |
| 21 | Grounding: elektroda arde + kabel BC 6 mm² + klem \* | 1 | ls | Rp 450.000 | Rp 450.000 |
| 22 | kWh meter PLN 2200 VA (pasang baru, SLO) | 1 | unit | Rp 3.250.000 | Rp 3.250.000 |
| | **Total (harga satuan, tanpa overhead)** | | | | **Rp 23.910.250** |
| | Overhead 5 % & profit 10 % (skema RAB) | | | | Rp 3.586.538 |
| | **Total setara RAB** | | | | **Rp 27.496.787** |

Opsional (direkomendasikan):

| Uraian | Jumlah |
|---|---:|
| Upgrade daya ke 3500 VA (selisih dari 2200 VA) \* | Rp 1.050.000 |
| ELCB/RCBO 2P 30 mA untuk grup stop kontak (keamanan) \* | Rp 450.000 |
| **Total dengan opsional** | **Rp 25.410.250** |

## C. CCTV (revisi 06-10-2026, semua harga perkiraan pasar)

| No | Uraian | Vol | Sat | Harga satuan | Jumlah |
|---:|---|---:|---|---:|---:|
| 1 | Kamera CCTV bullet IP PoE 2 MP outdoor (IR, IP66) | 4 | bh | Rp 450.000 | Rp 1.800.000 |
| 2 | NVR 4 channel PoE | 1 | unit | Rp 1.500.000 | Rp 1.500.000 |
| 3 | HDD surveillance 1 TB | 1 | bh | Rp 850.000 | Rp 850.000 |
| 4 | Kabel CAT6 outdoor (44 m) + 1 CAT6 ke router di dinding TV (±8 m) | 52 | m | Rp 4.500 | Rp 234.000 |
| 5 | Pipa PVC 3/4" untuk kabel data | 14 | batang | Rp 15.000 | Rp 210.000 |
| 6 | Konektor RJ45, box, aksesori | 1 | ls | Rp 150.000 | Rp 150.000 |
| 7 | Jasa pasang & setting per kamera | 4 | titik | Rp 150.000 | Rp 600.000 |
| | **Subtotal CCTV** | | | | **Rp 5.344.000** |
| | **Total listrik + CCTV (harga satuan)** | | | | **Rp 29.254.250** |

Stop kontak NVR sudah termasuk di bagian B. Kamera IP PoE: listrik & data lewat 1 kabel CAT6, tidak perlu stop kontak di tiap kamera. Pipa data ditanam sekarang sebelum plester.

## D. Pembanding: RAB V3 bagian IX (listrik saja)

| Uraian | Jumlah |
|---|---:|
| Instalasi 65 titik (kabel 2 m/titik, pipa, aksesori, jasa) | Rp 5.248.750 |
| Downlight 9 W ×15 | Rp 1.575.000 |
| Downlight 5 W ×19 | Rp 1.710.000 |
| Sorot outdoor ×3 | Rp 315.000 |
| Sakelar tunggal ×6 | Rp 210.000 |
| Sakelar ganda ×9 | Rp 495.000 |
| Sakelar triple ×1 | Rp 95.000 |
| Stop kontak ×21 | Rp 1.575.000 |
| Antena TV | Rp 155.000 |
| Box MCB ×2 | Rp 204.000 |
| MCB 1 fasa ×4 | Rp 530.000 |
| NYM 2×2,5 ×4 roll | Rp 2.300.000 |
| NYM 2×1,5 ×8 roll | Rp 3.000.000 |
| kWh meter 2200 VA | Rp 3.250.000 |
| **Total RAB V3 (14 baris listrik, harga satuan)** | **Rp 20.662.750** |
| Total RAB V3 setelah overhead & profit (sub total IX) | Rp 23.762.163 |
| **Selisih estimasi revisi − RAB V3** (basis harga satuan) | **Rp 3.247.500** (+16 %) |
| Selisih setelah overhead & profit | Rp 3.734.625 |

## E. Catatan

- RAB memakai kabel 2 inti (NYM 2×2,5 / 2×1,5) tanpa grounding; estimasi ini memakai **NYM 3×2,5 untuk stop kontak & AC plus elektroda arde** sesuai PUIL — itu penyumbang selisih terbesar. Titik 93 vs 65 di RAB: 16 titik sudah ada di gambar DED tapi tidak terhitung di RAB (lampu carport, lampu pagar, selisih hitung), 12 titik tambahan revisi.
- RAB mengalokasikan 12 roll kabel (1.200 m) tapi hanya 32,5 batang pipa (130 m); perhitungan geometri memberi ±600 m kabel dan ±480 m pipa — RAB kelebihan kabel, kekurangan pipa.
- Panjang kabel dihitung dari rute ortogonal di bawah dak/plat (tinggi 3.6 m lt1, 3.4 m lt2) dengan turunan vertikal ke tiap perangkat; rantai stop kontak memakai urutan tetangga terdekat dari box MCB — realisasi tukang bisa ±15 %.
- Harga RAB "Pasang …" dianggap sudah termasuk material + pemasangan; aksesori dan jasa per titik (Rp 8.750 + Rp 40.000) mengikuti angka RAB.
- Water heater: daya 2200 VA hanya cukup untuk pemanas tangki low-watt (≤ 500 W, mis. 15 L); pemanas instan 2–3,5 kW butuh 3500 VA ke atas. Unit pemanasnya sendiri (±Rp 1,6–2 jt/bh) masuk pekerjaan sanitasi, tidak dihitung di sini.
- Belum termasuk: titik pompa air (belum ditentukan), lampu taman/pagar tambahan (RAB lama: 8 sorot + 4 downlight carport, ±Rp 3,5 jt), biaya PLN di luar pasang baru (UJL).
