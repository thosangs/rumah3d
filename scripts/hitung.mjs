// node scripts/hitung.mjs  → cetak tabel hitungan ke terminal + tulis hitungan.json
import { computeAll, DEFAULT_CONFIG } from '../src/calc.js';
import { writeFileSync } from 'node:fs';

const cfg = { ...DEFAULT_CONFIG };
for (const a of process.argv.slice(2)) {
  const [k, v] = a.replace(/^--/, '').split('=');
  if (k === 'pcs') cfg.floorPcsPerBox = +v;
  if (k === 'waste') cfg.wastePct = +v;
  if (k === 'bath') cfg.bathFloorMode = v;
  if (k === 'zones') { const [b, t] = v.split('/').map(Number); cfg.wallZones = { bottomH: b / 100, topH: t / 100 }; }
  if (k === 'jemur') cfg.includeOptional = v !== '0';
}
const R = computeAll(cfg);

const pad = (s, n) => String(s).padEnd(n);
console.log(`\n=== GRANIT 80x80 (${cfg.floorPcsPerBox} keping/dus, cadangan ${cfg.wastePct}%) ===`);
for (const g of R.groups) {
  console.log(`\n## ${g.name}  — ${g.area} m² | ${g.pieces} keping (utuh ${g.full} + korban potong ${g.cutTiles}) → +cadangan ${g.withWaste} keping = ${g.boxes} dus`);
  for (const f of g.items) {
    console.log(`  - ${pad(f.name, 58)} ${pad(f.area + ' m²', 10)} utuh ${pad(f.full, 4)} potongan ${pad(f.cutPieces + ' pcs', 8)} dari ${pad(f.cutTiles, 3)} keping → total ${f.pieces} keping  [mulai: ${f.layout.name}]`);
    console.log(`      potongan: ${f.layout.cutList.map((c) => `${c.ukuran}×${c.jumlah}`).join(', ') || '-'}`);
  }
}
console.log(`\n## Lantai kamar mandi (3 KM) ${R.bathFloorSummary.tile.label}: ${R.bathFloorSummary.area} m² → ${R.bathFloorSummary.pieces} keping (+cadangan ${R.bathFloorSummary.withWaste}) = ${R.bathFloorSummary.boxes} dus`);

console.log(`\n## Plin 10 cm (dari 80x80 dibelah ${cfg.plinthStrips}): panjang bersih ${R.plinthTotal.length} m → ${R.plinthTotal.strips} potong 10×80 → ${R.plinthTotal.tiles} keping = ${R.plinthTotal.boxes} dus`);
for (const f of R.plinthItems) console.log(`  - ${pad(f.name, 58)} ${f.plinth.net} m → ${f.plinth.strips} strip → ${f.plinth.tiles} keping`);

console.log(`\n## TOTAL granit 80x80 (lantai + plin): ${R.total80.pieces} keping, +cadangan ${R.total80.withWaste} keping ≈ ${R.total80.m2} m² = ${R.total80.boxes} dus`);

console.log(`\n=== DINDING KAMAR MANDI 30x60 (${cfg.wallPcsPerBox} keping/dus) zona bawah ${cfg.wallZones.bottomH} m terakota, atas ${cfg.wallZones.topH} m putih ===`);
for (const b of R.baths) {
  console.log(`\n## ${b.name} (keliling ${b.perimeter} m)  bawah ${b.areaBawah} m² → ${b.bawah.total} keping (utuh ${b.bawah.full} + potong ${b.bawah.cuts} pcs dari ${b.bawah.cutTiles}) | atas ${b.areaAtas} m² → ${b.atas.total} keping (utuh ${b.atas.full} + potong ${b.atas.cuts} pcs dari ${b.atas.cutTiles})`);
  for (const w of b.walls) {
    console.log(`  - ${pad(w.wall, 36)} ${w.len} m  bawah ${w.byZone.bawah.total} (${w.byZone.bawah.cutList.map((c) => c.ukuran + '×' + c.jumlah).join(', ') || 'tanpa potongan'}) | atas ${w.byZone.atas.total} (${w.byZone.atas.cutList.map((c) => c.ukuran + '×' + c.jumlah).join(', ') || 'tanpa potongan'}) [${w.name}]`);
  }
}
console.log(`\n## TOTAL dinding: TERAKOTA ${R.wall.bawah.area} m² → ${R.wall.bawah.pieces} keping (+cadangan ${R.wall.bawah.withWaste}) = ${R.wall.bawah.boxes} dus | PUTIH ${R.wall.atas.area} m² → ${R.wall.atas.pieces} keping (+cadangan ${R.wall.atas.withWaste}) = ${R.wall.atas.boxes} dus`);

console.log(`\n=== PEMBANDING CATATAN TUKANG ===`);
for (const n of Object.values(R.fieldNotes)) console.log(`  - ${n.text}`);

writeFileSync(new URL('../hitungan.json', import.meta.url), JSON.stringify(R, (k, v) => (k === 'cells' || k === 'pack' || k === 'parts' ? undefined : v), 2));
console.log('\n→ hitungan.json ditulis');
