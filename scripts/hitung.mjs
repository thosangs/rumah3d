// node scripts/hitung.mjs  → cetak tabel hitungan ke terminal + tulis hitungan.json
import { computeAll, DEFAULT_CONFIG } from '../src/calc.js';
import { writeFileSync } from 'node:fs';

const cfg = { ...DEFAULT_CONFIG };
for (const a of process.argv.slice(2)) {
  const [k, v] = a.replace(/^--/, '').split('=');
  if (k === 'pcs') cfg.floorPcsPerBox = +v;
  if (k === 'waste') cfg.wastePct = +v;
  if (k === 'bath') cfg.bathFloorMode = v;
  if (k === 'zones') { const [b, t] = v.split('/'); cfg.wallZones = { bottomH: +b / 100, topH: t === 'dak' ? null : +t / 100 }; }
  if (k === 'jemur') cfg.includeOptional = v !== '0';
  if (k === 'pola') cfg.layoutMode = v; // rapi | hemat
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

console.log(`\n## TOTAL granit 80x80 (lantai + plin, pola ${cfg.layoutMode}): ${R.total80.pieces} keping, +cadangan ${R.total80.withWaste} keping ≈ ${R.total80.m2} m² = ${R.total80.boxes} dus  (pola ${cfg.layoutMode === 'hemat' ? 'rapi' : 'hemat'}: ${R.total80.altPieces} keping ≈ ${R.total80.altBoxes} dus)`);

console.log(`\n=== DINDING KAMAR MANDI 30x60 (${cfg.wallPcsPerBox} keping/dus) zona bawah ${cfg.wallZones.bottomH} m teraso, atas ${cfg.wallZones.topH == null ? 'sampai dak (putih polos)' : cfg.wallZones.topH + ' m putih polos'} ===`);
for (const b of R.baths) {
  console.log(`\n## ${b.name} (keliling ${b.perimeter} m, tinggi ${(b.zones.bottomH + b.zones.topH).toFixed(2)} m)  bawah ${b.areaBawah} m² → ${b.bawah.total} keping (utuh ${b.bawah.full} + potong ${b.bawah.cuts} pcs dari ${b.bawah.cutTiles}) | atas ${b.areaAtas} m² → ${b.atas.total} keping (utuh ${b.atas.full} + potong ${b.atas.cuts} pcs dari ${b.atas.cutTiles})`);
  for (const w of b.walls) {
    console.log(`  - ${pad(w.wall, 36)} ${w.len} m  bawah ${w.byZone.bawah.total} (${w.byZone.bawah.cutList.map((c) => c.ukuran + '×' + c.jumlah).join(', ') || 'tanpa potongan'}) | atas ${w.byZone.atas.total} (${w.byZone.atas.cutList.map((c) => c.ukuran + '×' + c.jumlah).join(', ') || 'tanpa potongan'}) [${w.name}]`);
  }
}
console.log(`\n## TOTAL dinding: TERASO ${R.wall.bawah.area} m² → ${R.wall.bawah.pieces} keping (+cadangan ${R.wall.bawah.withWaste}) = ${R.wall.bawah.boxes} dus | PUTIH ${R.wall.atas.area} m² → ${R.wall.atas.pieces} keping (+cadangan ${R.wall.atas.withWaste}) = ${R.wall.atas.boxes} dus`);

console.log(`\n=== HITUNGAN RIIL vs TUKANG (dus) — 80×80: ${cfg.floorPcsPerBox}/dus, 30×60: ${cfg.wallPcsPerBox}/dus ===`);
const T = R.tukang, Ri = R.riil;
const line = (n, t, m2, pcs, pas, w) => console.log(`  ${pad(n, 34)} tukang ${pad((t.m2 ?? '—') + ' m²', 9)} ${pad(t.pcs + ' kpg', 9)} ${pad(t.boxes + ' dus', 8)} | riil ${pad((m2 ?? '—') + ' m²', 9)} ${pad(pcs + ' kpg', 9)} ${pad(pas + ' dus', 8)} +${cfg.wastePct}% → ${w} dus`);
line('Lantai 1', T.lt1, Ri.lt1.area, Ri.lt1.pieces, Ri.lt1.boxesNoWaste, Ri.lt1.boxes);
line('Lantai 2', T.lt2, Ri.lt2.area, Ri.lt2.pieces, Ri.lt2.boxesNoWaste, Ri.lt2.boxes);
line('Teras bawah', T.terasBawah, Ri.terasBawah.area, Ri.terasBawah.pieces, Ri.terasBawah.boxesNoWaste, Ri.terasBawah.boxes);
line('Teras atas', T.terasAtas, Ri.terasAtas.area, Ri.terasAtas.pieces, Ri.terasAtas.boxesNoWaste, Ri.terasAtas.boxes);
line('Lantai KM (riil sudah di Lt1/Lt2)', T.kmLantai, Ri.kmLantai.area, Ri.kmLantai.pieces, '-', '-');
line('Plin', T.plin, '—', Ri.plin.tiles, Math.ceil(Ri.plin.tiles / cfg.floorPcsPerBox), Ri.plin.boxes);
line('TOTAL 80×80', T.total80, Math.round(Ri.total80.withWaste * 0.64 * 100) / 100, Ri.total80.pieces, Ri.total80.boxesNoWaste, Ri.total80.boxes);
line('Dinding KM bawah (teraso)', T.kmBawah, Ri.wall.bawah.area, Ri.wall.bawah.pieces, Ri.wall.bawah.boxesNoWaste, Ri.wall.bawah.boxes);
line('Dinding KM atas (putih)', T.kmAtas, Ri.wall.atas.area, Ri.wall.atas.pieces, Ri.wall.atas.boxesNoWaste, Ri.wall.atas.boxes);
line('TOTAL 30×60', T.wall, Math.round((Ri.wall.bawah.area + Ri.wall.atas.area) * 100) / 100, Ri.wall.bawah.pieces + Ri.wall.atas.pieces, Ri.wall.bawah.boxesNoWaste + Ri.wall.atas.boxesNoWaste, Ri.wall.bawah.boxes + Ri.wall.atas.boxes);
console.log(`\n=== CATATAN TUKANG (asli) ===`);
for (const n of Object.values(R.fieldNotes)) console.log(`  - ${n.text}`);

writeFileSync(new URL('../hitungan.json', import.meta.url), JSON.stringify(R, (k, v) => (k === 'cells' || k === 'pack' || k === 'parts' ? undefined : v), 2));
console.log('\n→ hitungan.json ditulis');
