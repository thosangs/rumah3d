// Interior kamar mandi (3 toilet). Lantai toilet: lt1 −0,03 (y −0,08 relatif lt1), lt2 +3,83 (y −0,02 relatif lt2).
// Muka keramik dinding: z 7.095 (depan) / 8.405 (belakang), x 3.095 / 4.655 (toilet kiri), x 4.845 / 6.405 (toilet lt2 kanan).
// Pintu: lt1 di tembok x 4.75 (z 7.075–7.775, buka ke koridor); lt2 kiri dari KTU di tembok z 8.5 (x 3.06–3.76); lt2 kanan di tembok x 6.5 (z 7.075–7.775).
// Catatan: lembar sanitasi DED (hal. 72–75) memakai tata letak lama (toilet dengan mesin cuci di posisi lain), jadi tata letak di sini
// disusun sendiri: shower di pojok depan-kiri (jauh dari pintu), kloset di sisi berlawanan, water heater di tembok depan di kanan shower
// (pipa pendek ke mixer), stop kontak IP44 ≥ 0,6 m dari kepala shower, floor drain di zona shower.
// RAB: 2 kloset duduk TOTO + 1 kloset jongkok + 2 set hand shower + 2 jet washer (tanpa wastafel) → lt1 jongkok + shower + heater; KTU duduk + shower + heater;
// lt2 kanan duduk + jet washer + shower (kran).
export const toiletLt1 = [
  { a: 'closet_jongkok', x: 4.25, z: 8.05, y: -0.08, ry: 0, note: 'kloset jongkok di pojok belakang-kanan (x 4.0–4.5, z 7.75–8.35), lubang ke tembok belakang; pijakan menghadap pintu' },
  { a: 'water_heater', x: 3.95, z: 7.095, y: 1.87, ry: 0, note: 'water heater 15 L di tembok depan (sisi r. makan), 0,55 m di kanan mixer shower (x 3.40): x 3.77–4.13, 1,75–2,15 di atas lantai toilet; stop kontak IP44 di x 4.45' },
];
export const toiletLt2 = [
  { a: 'closet_duduk', x: 4.655, z: 7.95, y: -0.02, ry: -Math.PI / 2, note: 'toilet KTU: kloset duduk punggung tangki di tembok kanan (x 4.655), menghadap −x; z 7.75–8.15; lorong 0,7 m ke shower' },
  { a: 'water_heater', x: 4.05, z: 7.095, y: 1.95, ry: 0, note: 'toilet KTU: heater di tembok depan, kanan shower (x 3.40): x 3.87–4.23; stop kontak IP44 di x 4.5 (1,1 m dari kepala shower)' },
  { a: 'closet_duduk', x: 5.65, z: 8.405, y: -0.02, ry: Math.PI, note: 'toilet lt2 kanan: kloset duduk punggung di tembok belakang (z 8.405), menghadap pintu (+z... −z ke depan); x 5.45–5.85' },
  // (wastafel tidak ada di RAB; aset bl_washbasin tersedia kalau mau ditambah di tembok kanan z 7.85–8.30)
];
