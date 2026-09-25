// Tata letak KAMAR TIDUR UTAMA lantai 2 (x 3.075–6.425, z 8.575–11.925) — king 180×200. Referensi render: hal-39..40.jpg
// (headboard panel walnut + panel krem, lemari lengkung krem/walnut di pojok sebelah headboard, nakas melayang kecil,
// meja rias cermin bundar + kursi krem dekat pintu, gorden abu).
// Bukaan nyata: pintu kamar di tembok kanan x=6.5 (z 8.61–9.41, ayunan x≥5.6); pintu toilet di tembok belakang z=8.5
// (x 3.06–3.76, ayunan ke z≤9.2); PINTU GESER balkon di tembok kiri x=3.075 (z 8.6–10.09). Tembok depan z 11.925 polos.
// Plafon 3.3 m. Jalur z 8.6–9.45 dari pintu kamar → pintu geser → toilet HARUS kosong.
// Prinsip (seperti render): headboard di tembok depan yang polos (z 11.925), gorden di tembok samping; ranjang digeser ke sisi kiri
// (alas x 3.345–5.245, z 9.814–11.844, headboard 2 cm dari tembok) supaya sisa strip kanan 1.18 m untuk lemari + meja rias di tembok kanan; muka daun pintu lemari x 5.86 →
// ruang buka pintu 0.615 m sampai alas ranjang; kursi rias diparkir di bawah meja → lorong punggung kursi (x 5.863) ke alas ranjang (x 5.245) 0.62 m; meja rias di z 9.55–10.55 di luar ayunan pintu kamar; kaki ranjang z 9.814 → jalur pintu tetap kosong; gorden greige ditumpuk di z 9.48–10.38 (di luar jalur).
// Kompromi diterima: sisi kiri ranjang hanya 0.27 m dari tembok kiri (3.35 − lemari 0.585 − buka 0.6 − alas 1.9 = 0.265) → king diakses dari sisi kanan saja.
export default [
  { a: 'bed_king_walnut', x: 4.295, z: 11.844, ry: Math.PI, tint: 0xd2cabf, note: 'tint abu hangat: linen putih → abu muda, walnut oranye → walnut gelap seperti render; headboard di tembok depan (celah 2 cm supaya bantal, yang sampai lokal z −0.081, berhenti di z 11.925 tidak menembus tembok); panel x 3.095–5.495, alas x 3.345–5.245, kaki z 9.814' },
  { a: 'nightstand_float', x: 3.21, z: 11.724, y: 0.2, ry: Math.PI, scale: 0.6, note: 'nakas melayang kecil (0.25 m, x 3.084–3.336, z 11.604–11.844) di celah 0.27 m antara tembok kiri & alas ranjang; punggung z 11.844 menempel muka panel headboard' },
  { a: 'wardrobe_100_curved', x: 6.15, z: 11.425, ry: -Math.PI / 2, sx: -1, note: 'tembok kanan pojok depan, pintu menghadap −x (z 10.925–11.925), lengkung walnut di ujung −z (z 10.645) menghadap ruang' },
  { a: 'vanity', x: 6.19, z: 10.05, ry: -Math.PI / 2, note: 'meja rias + cermin bundar di tembok kanan dekat pintu, z 9.55–10.55 (ayunan pintu z≤9.41)' },
  { a: 'dining_chair', x: 6.16, z: 10.05, ry: Math.PI / 2, note: 'kursi krem menghadap cermin (+x), muka dudukan x 6.38 < punggung meja 6.415; dudukan y≤0.495 < laci 0.60; punggung miring sampai lokal z −0.297 → x 5.863 → lorong ke alas ranjang 0.62 m; di tinggi top meja punggung x ≤ 5.935 (3 cm dari tepi top 5.965)' },
  { a: 'plant_small', x: 6.3, z: 10.42, y: 0.76, note: 'dekor kecil di atas meja rias' },
  { a: 'curtain_dark', x: 3.17, z: 9.93, ry: Math.PI / 2, sx: 0.45, flat: 0xb3aca2, note: 'gorden tipis abu hangat (greige, seperti hal-39) ditumpuk ke sisi ranjang: kain z 9.48–10.38, rel z 9.455–10.405 → sepenuhnya di luar jalur z 8.6–9.45 & ayunan pintu toilet; menutup bagian jauh pintu geser (≤10.09) + tembok setelah kusen' },
];
