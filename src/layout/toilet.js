// Water heater listrik tangki 15 L (aset bl_water_heater: punggung di z=0 lokal, menonjol +z, pusat vertikal y=0).
// Posisi: dinding seberang zona shower (shower diasumsikan di ujung terjauh dari pintu), unit 1,95 m di atas lantai toilet.
// Muka keramik dinding toilet 2 cm di depan tembok blok → z 7.095. Toilet lt1: x 3.075–4.675, z 7.075–8.425, lantai −0,03 (8 cm di bawah lt1 → y dikurangi 0.08); pintu di tembok x 4.75 z 7.075–7.775.
// Toilet lt2 kiri (di dalam KTU): x 3.075–4.675, z 7.075–8.425; pintu dari KTU di tembok z 8.5 x 3.06–3.76.
export const toiletLt1 = [
  { a: 'water_heater', x: 3.8, z: 7.095, y: 1.87, ry: 0, note: 'toilet lt1, tembok sisi r. makan (z 7.075), x 3.62–3.98, y 1.67–2.07 lt1 (1,75–2,15 di atas lantai toilet); stop kontak IP44 di x 4.3 h 1.82' },
];
export const toiletLt2 = [
  { a: 'water_heater', x: 4.1, z: 7.095, y: 1.95, ry: 0, note: 'toilet lt2 kiri, tembok sisi KT2 (z 7.075), x 3.92–4.28, y 1.75–2.15; stop kontak IP44 di x 3.55 h 1.9' },
];
