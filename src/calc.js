import { FLOOR_AREAS, BATHROOMS, TILE_FLOOR, TILE_WALL, TILE_BATH_FLOOR_ALT, FIELD_NOTES } from './data.js';
import { layoutFloor, layoutBathroom, plinth, boxes, withWaste, regionArea } from './tiles.js';

export const DEFAULT_CONFIG = {
  wastePct: 7, // cadangan pecah/cacat/warna (rekomendasi 5–10%)
  floorPcsPerBox: 3, // granit 80×80: 3 keping/dus (1,92 m²)
  wallPcsPerBox: 8, // granit 30×60: umumnya 8 keping/dus (1,44 m²)
  bathFloorMode: '80', // '80' pakai granit 80×80 (sesuai permintaan) | '40' keramik 40×40 kasar
  wallZones: { bottomH: 1.8, topH: 0.6 }, // teraso 180 cm (6 baris) + putih polos sampai plafon 2,4 m (2 baris)
  plinthStrips: 8,
  includeOptional: false, // ruang jemur
};

const r2 = (v) => Math.round(v * 100) / 100;

export function computeAll(cfg = DEFAULT_CONFIG) {
  const floors = FLOOR_AREAS.filter((a) => cfg.includeOptional || !a.optional).map((a) => {
    const tile = a.isBathroom && cfg.bathFloorMode === '40' ? TILE_BATH_FLOOR_ALT : TILE_FLOOR;
    const lay = layoutFloor(a.rects, tile);
    const pl = a.plinth ? plinth(a.plinth.length, a.plinth.doors, TILE_FLOOR, cfg.plinthStrips) : null;
    return {
      ...a,
      tileSpec: tile,
      layout: lay,
      area: r2(regionArea(a.rects)),
      pieces: lay.total,
      full: lay.full,
      cutPieces: lay.cuts,
      cutTiles: lay.cutTiles,
      plinth: pl,
    };
  });

  const groups = {};
  for (const f of floors) {
    const g = (groups[f.group] ??= { name: f.group, area: 0, pieces: 0, full: 0, cutTiles: 0, cutPieces: 0, items: [] });
    if (f.isBathroom && cfg.bathFloorMode === '40') {
      // dihitung terpisah (bukan 80×80)
    } else {
      g.pieces += f.pieces;
      g.full += f.full;
      g.cutTiles += f.cutTiles;
      g.cutPieces += f.cutPieces;
    }
    g.area += f.area;
    g.items.push(f);
  }
  for (const g of Object.values(groups)) {
    g.area = r2(g.area);
    g.withWaste = withWaste(g.pieces, cfg.wastePct);
    g.boxes = boxes(g.withWaste, cfg.floorPcsPerBox);
  }

  // Lantai kamar mandi ringkasan (3 KM)
  const bathFloors = floors.filter((f) => f.isBathroom);
  const bathFloorSummary = {
    area: r2(bathFloors.reduce((s, f) => s + f.area, 0)),
    pieces: bathFloors.reduce((s, f) => s + f.pieces, 0),
    tile: bathFloors[0]?.tileSpec,
  };
  bathFloorSummary.withWaste = withWaste(bathFloorSummary.pieces, cfg.wastePct);
  bathFloorSummary.boxes = boxes(bathFloorSummary.withWaste, cfg.bathFloorMode === '40' ? 6 : cfg.floorPcsPerBox);

  // Plin
  const plinthItems = floors.filter((f) => f.plinth);
  const plinthTotal = {
    length: r2(plinthItems.reduce((s, f) => s + f.plinth.net, 0)),
    strips: plinthItems.reduce((s, f) => s + f.plinth.strips, 0),
  };
  plinthTotal.tiles = Math.ceil(plinthTotal.strips / cfg.plinthStrips);
  plinthTotal.boxes = boxes(plinthTotal.tiles, cfg.floorPcsPerBox);

  // Dinding kamar mandi
  const baths = BATHROOMS.map((b) => layoutBathroom(b, TILE_WALL, cfg.wallZones));
  const wall = {
    bawah: { pieces: baths.reduce((s, b) => s + b.bawah.total, 0), area: r2(baths.reduce((s, b) => s + b.areaBawah, 0)) },
    atas: { pieces: baths.reduce((s, b) => s + b.atas.total, 0), area: r2(baths.reduce((s, b) => s + b.areaAtas, 0)) },
  };
  for (const z of ['bawah', 'atas']) {
    wall[z].withWaste = withWaste(wall[z].pieces, cfg.wastePct);
    wall[z].boxes = boxes(wall[z].withWaste, cfg.wallPcsPerBox);
  }

  // Total granit 80×80 (lantai semua + plin)
  const floorGroups = Object.values(groups);
  const total80 = {
    pieces: floorGroups.reduce((s, g) => s + g.pieces, 0) + plinthTotal.tiles,
    withWaste: floorGroups.reduce((s, g) => s + g.withWaste, 0) + plinthTotal.tiles,
  };
  total80.boxes = boxes(total80.withWaste, cfg.floorPcsPerBox);
  total80.m2 = r2(total80.withWaste * 0.64);

  // dus tanpa cadangan (pembanding apple-to-apple dengan angka tukang)
  for (const g of floorGroups) g.boxesNoWaste = boxes(g.pieces, cfg.floorPcsPerBox);
  total80.boxesNoWaste = boxes(total80.pieces, cfg.floorPcsPerBox);
  for (const z of ['bawah', 'atas']) wall[z].boxesNoWaste = boxes(wall[z].pieces, cfg.wallPcsPerBox);

  // Hitungan tukang (catatan buku + chat) dikonversi ke keping & dus dengan isi dus yang sama
  const fb = (m2, tileArea, perBox) => { const pcs = Math.ceil(m2 / tileArea - 1e-9); return { m2, pcs, boxes: boxes(pcs, perBox) }; };
  const P80 = cfg.floorPcsPerBox, P36 = cfg.wallPcsPerBox;
  const tukang = {
    lt1: fb(60, 0.64, P80), lt2: fb(62.5, 0.64, P80), terasBawah: fb(21, 0.64, P80), terasAtas: fb(27, 0.64, P80),
    kmLantai: fb(9, 0.64, P80), plin: { m2: null, pcs: 6 * P80, boxes: 6 },
    kmBawah: fb(30, 0.18, P36), kmAtas: fb(42, 0.18, P36),
  };
  tukang.total80 = ['lt1', 'lt2', 'terasBawah', 'terasAtas', 'kmLantai', 'plin'].reduce((a, k) => ({ m2: a.m2 + (tukang[k].m2 || 0), pcs: a.pcs + tukang[k].pcs, boxes: a.boxes + tukang[k].boxes }), { m2: 0, pcs: 0, boxes: 0 });
  tukang.wall = { m2: 72, pcs: tukang.kmBawah.pcs + tukang.kmAtas.pcs, boxes: tukang.kmBawah.boxes + tukang.kmAtas.boxes };
  const riilTerasBawah = floorGroups.find((g) => g.name === 'Lantai luar (teras bawah)');
  const riilTerasAtas = floorGroups.find((g) => g.name === 'Lantai luar (teras atas)');
  const riil = {
    lt1: floorGroups.find((g) => g.name === 'Lantai 1'), lt2: floorGroups.find((g) => g.name === 'Lantai 2'),
    terasBawah: riilTerasBawah, terasAtas: riilTerasAtas, kmLantai: bathFloorSummary, plin: plinthTotal, total80, wall,
  };
  return { cfg, floors, groups: floorGroups, bathFloorSummary, plinthItems, plinthTotal, baths, wall, total80, tukang, riil, fieldNotes: FIELD_NOTES };
}
