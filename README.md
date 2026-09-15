# Rumah Mbak Alfi — simulasi granit 3D (three.js)

Web 3D untuk melihat pola pemasangan granit 80×80 (lantai) dan granit 30×60 (dinding kamar mandi, 2 motif)
di rumah Mbak Alfi, plus hitungan keping per ruang, gambar kerja (DED), 3D render, dan model SketchUp aslinya.

## Menjalankan

Butuh server statis (module ES tidak jalan dari `file://`):

```bash
cd rumah-alfi-3d && python3 serve.py 8765
```

lalu buka <http://localhost:8765>.

Kontrol: klik untuk mengunci mouse, `W A S D` jalan, `Shift` lari, `1/2/3` lompat ke teras depan / lantai 2 / depan rumah,
`M` mode orbit (denah), `H` sembunyikan lantai 2 + atap, `L` label ukuran potongan, `G` ganti model SKP asli ↔ model blok,
`P` panel hitungan. Naik ke lantai 2 cukup jalan ke tangga di pojok kanan belakang ruang makan.

## Hitungan tanpa browser

```bash
node scripts/hitung.mjs                # default: 2 keping/dus, cadangan 7%, zona KM 90/150
node scripts/hitung.mjs --pcs=3 --waste=10 --zones=100/140 --bath=40 --jemur=1
```

Menulis `hitungan.json` dan mencetak tabel. Hasil terakhir juga ada di `hitungan.txt`.

## Struktur

- `src/data.js` — geometri dari DED (grid as tembok, tebal 15 cm), area lantai, kamar mandi, tembok, tangga, catatan tukang.
- `src/tiles.js` — mesin hitung: grid keramik per region, pemilihan titik mulai (4 sudut + tengah), pengemasan potongan ke keping utuh, dinding KM 2 zona, plin.
- `src/calc.js` — rangkuman total, dus, cadangan.
- `src/textures.js`, `src/scene.js`, `src/app.js`, `src/ui.js` — three.js + panel.
- `drawings/hal-XX.jpg` — 78 halaman PDF `1. GAMBAR RUMAH MBAK ALFI.pdf` (80 dpi).
- `models/` — `.skp` asli, `rumah-raw.glb` (export glTF 96 MB), `rumah.glb` (dikompres meshopt + WebP, 4,2 MB, yang dimuat web).
- `vendor/three/` — three.js 0.170 (module, PointerLock/Orbit controls, GLTFLoader, meshopt decoder).

## Asumsi yang perlu dicek di lapangan

- Model SKP (GLB) kavlingnya mulai di y = 0,5 m, jadi diposisikan dengan offset z = 19,5 (bukan 20) agar tembok-temboknya pas dengan denah DED. Tangga di model berbentuk L: 2 anak tangga awal ke arah kanan dari x 8,28 (y 3,56–4,56), lalu run lurus sepanjang tembok kanan naik ke depan sampai tiba di lantai 2 pada y 9,06 (riser 20 cm, tread 30 cm); void dak 2,0 × 5,5 m. Geometri di `data.js` diukur dari GLB.
- GLB hasil export tidak membawa material kaca; `scripts/fixmodel.py` menandai panel tipis di bukaan jendela sebagai kaca, panel gerbang + screen carport sebagai plat perforated (dirender tembus pandang di three.js), dan mengecat material default abu menjadi putih hangat sesuai render DED. Jalankan `python3 scripts/fixmodel.py models/rumah-raw.glb /tmp/g.glb` lalu optimize ke `models/rumah.glb` (perintah di tab Model SKP, tambah `--palette false --simplify false`).
- Ukuran ruang = grid as − 15 cm tebal tembok. Kamar mandi 1,60 × 1,35 m bersih (as 1,75 × 1,50).
- Tinggi keramik dinding KM 240 cm; zona bawah terakota 90 cm (3 baris) + atas putih 150 cm (5 baris). Catatan tukang 100/140 bisa dipilih di Setelan.
- Pintu KM 70 × 210, jendela KM 60 × 50 (ambang 170) di sisi luar.
- Ruang jemur di gambar rabat beton; kalau ikut digranit, centang di Setelan (menjelaskan angka "teras bawah 21 m²" dari tukang).
- Granit 80×80 dihitung 3 keping/dus (1,92 m²); ubah di Setelan kalau merek lain.
