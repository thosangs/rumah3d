// Mesin hitung keramik/granit: tata letak per ruang, hitung keping utuh,
// keping potongan, dan berapa keping utuh yang harus dikorbankan untuk potongan.
// Dipakai oleh web (three.js) dan skrip Node (scripts/hitung.mjs).

const EPS = 0.002; // toleransi 2 mm
export const KERF = 0.004; // tebal mata gerinda/wet saw

const near = (a, b) => Math.abs(a - b) < EPS;
const r2 = (v) => Math.round(v * 100) / 100;

// ----------------------------------------------------------------------------
// Geometri region (gabungan persegi panjang axis-aligned, tidak saling tumpang)
// ----------------------------------------------------------------------------
export function bbox(rects) {
  return {
    x1: Math.min(...rects.map((r) => r.x1)),
    y1: Math.min(...rects.map((r) => r.y1)),
    x2: Math.max(...rects.map((r) => r.x2)),
    y2: Math.max(...rects.map((r) => r.y2)),
  };
}
export function rectArea(r) {
  return Math.max(0, r.x2 - r.x1) * Math.max(0, r.y2 - r.y1);
}
export function regionArea(rects) {
  return rects.reduce((s, r) => s + rectArea(r), 0);
}
function intersect(a, b) {
  const r = {
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
    x2: Math.min(a.x2, b.x2),
    y2: Math.min(a.y2, b.y2),
  };
  return r.x2 - r.x1 > EPS && r.y2 - r.y1 > EPS ? r : null;
}

// ----------------------------------------------------------------------------
// Tata letak lantai
// ----------------------------------------------------------------------------
/**
 * Bangun grid keramik untuk region dengan titik awal (ox, oy).
 * Mengembalikan daftar cell {x1,y1,x2,y2,w,h,full,shape}
 */
export function gridCells(rects, tile, ox, oy) {
  const bb = bbox(rects);
  const cells = [];
  const i0 = Math.floor((bb.x1 - ox) / tile.w + 1e-9) - 1;
  const i1 = Math.ceil((bb.x2 - ox) / tile.w) + 1;
  const j0 = Math.floor((bb.y1 - oy) / tile.h + 1e-9) - 1;
  const j1 = Math.ceil((bb.y2 - oy) / tile.h) + 1;
  for (let i = i0; i <= i1; i++) {
    for (let j = j0; j <= j1; j++) {
      const cell = { x1: ox + i * tile.w, y1: oy + j * tile.h };
      cell.x2 = cell.x1 + tile.w;
      cell.y2 = cell.y1 + tile.h;
      const parts = rects.map((r) => intersect(cell, r)).filter(Boolean);
      if (!parts.length) continue;
      const ub = bbox(parts);
      const area = parts.reduce((s, p) => s + rectArea(p), 0);
      const isRect = near(area, rectArea(ub));
      const w = ub.x2 - ub.x1;
      const h = ub.y2 - ub.y1;
      const full = isRect && near(w, tile.w) && near(h, tile.h);
      cells.push({
        ...ub,
        w: r2(w),
        h: r2(h),
        full,
        shape: isRect ? 'rect' : 'L',
        parts,
        gi: i,
        gj: j,
      });
    }
  }
  return cells;
}

/**
 * Kemas potongan ke dalam keping utuh (guillotine sederhana).
 * pieces: [{w,h}] ; tile: {w,h}
 * Kembali: {tiles, bins:[{pieces:[{w,h}], note}], leftovers}
 */
export function packCuts(pieces, tile) {
  const bins = [];
  const stripsA = []; // lebar penuh (w == tile.w), tinggi h < tile.h
  const stripsB = []; // tinggi penuh (h == tile.h), lebar w < tile.w
  const corners = [];
  for (const p of pieces) {
    const pw = Math.min(p.w, tile.w + EPS);
    const ph = Math.min(p.h, tile.h + EPS);
    if (p.shape === 'L') {
      // keping utuh yang dicoak (bentuk L) — butuh 1 keping sendiri
      bins.push({ kind: 'L', pieces: [p], leftover: null });
      continue;
    }
    if (near(pw, tile.w) && near(ph, tile.h)) continue; // utuh, bukan potongan
    if (near(pw, tile.w)) stripsA.push({ w: tile.w, h: ph, ref: p });
    else if (near(ph, tile.h)) stripsB.push({ w: pw, h: tile.h, ref: p });
    else corners.push({ w: pw, h: ph, ref: p });
  }
  // Untuk granit persegi (80x80) strip B bisa diputar jadi strip A.
  const square = near(tile.w, tile.h);
  const strips = square ? [...stripsA, ...stripsB.map((s) => ({ w: tile.w, h: s.w, ref: s.ref, rotated: true }))] : stripsA;
  const stripsBRemain = square ? [] : stripsB;

  // FFD pada dimensi potong
  const packStrips = (list, cap, dimKey) => {
    const sorted = [...list].sort((a, b) => b[dimKey] - a[dimKey]);
    const out = [];
    for (const s of sorted) {
      let placed = false;
      for (const b of out) {
        if (b.used + s[dimKey] + KERF <= cap + EPS) {
          b.pieces.push(s);
          b.used += s[dimKey] + KERF;
          placed = true;
          break;
        }
      }
      if (!placed) out.push({ pieces: [s], used: s[dimKey] + KERF, dimKey, cap });
    }
    return out;
  };
  const binsA = packStrips(strips, tile.h, 'h');
  const binsB = packStrips(stripsBRemain, tile.w, 'w');
  for (const b of binsA) bins.push({ kind: 'strip', pieces: b.pieces, leftover: { w: tile.w, h: r2(tile.h - b.used) } });
  for (const b of binsB) bins.push({ kind: 'strip', pieces: b.pieces, leftover: { w: r2(tile.w - b.used), h: tile.h } });

  // Potongan sudut: coba masuk ke sisa strip dulu, lalu keping baru (shelf packing)
  const cs = [...corners].sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));
  const remaining = [];
  for (const c of cs) {
    let placed = false;
    for (const b of bins) {
      const L = b.leftover;
      if (!L || L.w < EPS || L.h < EPS) continue;
      // orientasi 1
      if (c.h + KERF <= L.h + EPS && c.w + KERF <= L.w + EPS) {
        b.pieces.push(c);
        L.w = r2(L.w - c.w - KERF);
        placed = true;
        break;
      }
      if (square && c.w + KERF <= L.h + EPS && c.h + KERF <= L.w + EPS) {
        b.pieces.push({ ...c, rotated: true });
        L.w = r2(L.w - c.h - KERF);
        placed = true;
        break;
      }
    }
    if (!placed) remaining.push(c);
  }
  // shelf packing di keping baru
  const shelves = [];
  for (const c of remaining) {
    let placed = false;
    for (const t of shelves) {
      for (const sh of t.shelves) {
        if (c.h <= sh.h + EPS && sh.used + c.w + KERF <= tile.w + EPS) {
          sh.pieces.push(c);
          sh.used += c.w + KERF;
          placed = true;
          break;
        }
      }
      if (placed) break;
      if (t.usedH + c.h + KERF <= tile.h + EPS) {
        t.shelves.push({ h: c.h, used: c.w + KERF, pieces: [c] });
        t.usedH += c.h + KERF;
        placed = true;
        break;
      }
    }
    if (!placed) shelves.push({ shelves: [{ h: c.h, used: c.w + KERF, pieces: [c] }], usedH: c.h + KERF });
  }
  for (const t of shelves) {
    bins.push({
      kind: 'corner',
      pieces: t.shelves.flatMap((s) => s.pieces),
      leftover: { w: tile.w, h: r2(tile.h - t.usedH) },
    });
  }
  return { tiles: bins.length, bins };
}

/** Deskripsi ringkas potongan: "30×80 ×4, 30×30 ×1" */
export function describeCuts(cells) {
  const m = new Map();
  for (const c of cells) {
    if (c.full) continue;
    const a = Math.round(Math.max(c.w, c.h) * 100);
    const b = Math.round(Math.min(c.w, c.h) * 100);
    const key = `${b}×${a}${c.shape === 'L' ? ' (L)' : ''}`;
    m.set(key, (m.get(key) || 0) + 1);
  }
  return [...m.entries()].sort((x, y) => y[1] - x[1]).map(([k, n]) => ({ ukuran: k, jumlah: n }));
}

/**
 * Cari tata letak terbaik: coba mulai dari 4 sudut + tengah.
 * Kriteria: total keping paling sedikit; hindari potongan sempit (< minSliver).
 */
export function layoutFloor(rects, tile, opts = {}) {
  const minSliver = opts.minSliver ?? 0.1;
  const bb = bbox(rects);
  const W = bb.x2 - bb.x1;
  const H = bb.y2 - bb.y1;
  const cx = bb.x1 + (W - Math.ceil(W / tile.w) * tile.w) / 2; // grid simetris (potongan sama kiri-kanan)
  const cy = bb.y1 + (H - Math.ceil(H / tile.h) * tile.h) / 2;
  const cx2 = bb.x1 + W / 2 - tile.w / 2; // nat di tengah
  const cy2 = bb.y1 + H / 2 - tile.h / 2;
  const xs = { 'kiri': bb.x1, 'kanan': bb.x2 - Math.ceil(W / tile.w) * tile.w, 'tengah': cx, 'tengah-nat': cx2 };
  const ys = { 'belakang': bb.y1, 'depan': bb.y2 - Math.ceil(H / tile.h) * tile.h, 'tengah': cy, 'tengah-nat': cy2 };
  const candidates = [];
  for (const [nx, ox] of Object.entries(xs)) {
    for (const [ny, oy] of Object.entries(ys)) {
      const cells = gridCells(rects, tile, ox, oy);
      const full = cells.filter((c) => c.full).length;
      const cuts = cells.filter((c) => !c.full);
      const pack = packCuts(cuts, tile);
      const slivers = cuts.filter((c) => Math.min(c.w, c.h) < minSliver - EPS).length;
      const total = full + pack.tiles;
      candidates.push({ name: `${nx}/${ny}`, ox, oy, cells, full, cuts: cuts.length, cutTiles: pack.tiles, pack, slivers, total });
    }
  }
  // skor: total keping + penalti potongan sempit (jelek & rawan pecah) → tukang biasanya geser grid
  const score = (c) => c.total + c.slivers * 0.75;
  candidates.sort((a, b) => score(a) - score(b) || a.cuts - b.cuts);
  const best = opts.forceOrigin
    ? (() => {
        const cells = gridCells(rects, tile, opts.forceOrigin.x, opts.forceOrigin.y);
        const full = cells.filter((c) => c.full).length;
        const cuts = cells.filter((c) => !c.full);
        const pack = packCuts(cuts, tile);
        return { name: 'grid utama', ox: opts.forceOrigin.x, oy: opts.forceOrigin.y, cells, full, cuts: cuts.length, cutTiles: pack.tiles, pack, slivers: 0, total: full + pack.tiles };
      })()
    : candidates[0];
  return {
    ...best,
    area: r2(regionArea(rects) * 100) / 100,
    tileArea: tile.w * tile.h,
    cutList: describeCuts(best.cells),
    alternatives: candidates.slice(0, 4).map((c) => ({ name: c.name, total: c.total, full: c.full, cuts: c.cuts, cutTiles: c.cutTiles })),
  };
}

// ----------------------------------------------------------------------------
// Dinding kamar mandi (30x60 dipasang horizontal: lebar 60, tinggi 30)
// zones: {bottomH, topH} ; wall: {len, openings:[{w,h,fromFloor,at?}]}
// ----------------------------------------------------------------------------
export function layoutWall(wall, tile, zones, opts = {}) {
  const totalH = zones.bottomH + zones.topH;
  const rect = { x1: 0, y1: 0, x2: wall.len, y2: totalH };
  // bukaan diposisikan di tengah dinding jika 'at' tidak ada
  const openings = (wall.openings || []).map((o) => {
    const at = o.at ?? (wall.len - o.w) / 2;
    return { x1: at, x2: at + o.w, y1: o.fromFloor, y2: o.fromFloor + o.h };
  });
  const tryOrigin = (ox) => {
    const cells = [];
    const rowsB = Math.ceil(zones.bottomH / tile.h - 1e-9);
    const rowsT = Math.ceil(totalH / tile.h - 1e-9);
    const i0 = Math.floor((0 - ox) / tile.w + 1e-9) - 1;
    const i1 = Math.ceil((wall.len - ox) / tile.w) + 1;
    for (let j = 0; j < rowsT; j++) {
      // baris: zona bawah dari 0..bottomH, zona atas dari bottomH..totalH (grid ulang dari batas zona)
      const inBottom = j < rowsB;
      const y1 = inBottom ? j * tile.h : zones.bottomH + (j - rowsB) * tile.h;
      const y2 = inBottom ? Math.min(y1 + tile.h, zones.bottomH) : Math.min(y1 + tile.h, totalH);
      if (y2 - y1 < EPS) continue;
      for (let i = i0; i <= i1; i++) {
        const cell = { x1: ox + i * tile.w, x2: ox + (i + 1) * tile.w, y1, y2 };
        const c = intersect(cell, rect);
        if (!c) continue;
        // kurangi bukaan (asumsi bukaan memotong cell jadi persegi panjang; jika cell habis, skip)
        let piece = c;
        let cutByOpening = false;
        for (const o of openings) {
          const ov = intersect(piece, o);
          if (!ov) continue;
          cutByOpening = true;
          // cell tertutup penuh bukaan?
          if (near(rectArea(ov), rectArea(piece))) {
            piece = null;
            break;
          }
          // sisakan bagian terbesar di luar bukaan (kiri/kanan/atas/bawah)
          const cands = [
            { x1: piece.x1, x2: ov.x1, y1: piece.y1, y2: piece.y2 },
            { x1: ov.x2, x2: piece.x2, y1: piece.y1, y2: piece.y2 },
            { x1: piece.x1, x2: piece.x2, y1: piece.y1, y2: ov.y1 },
            { x1: piece.x1, x2: piece.x2, y1: ov.y2, y2: piece.y2 },
          ].filter((r) => r.x2 - r.x1 > EPS && r.y2 - r.y1 > EPS);
          if (!cands.length) {
            piece = null;
            break;
          }
          cands.sort((a, b) => rectArea(b) - rectArea(a));
          piece = cands[0];
        }
        if (!piece) continue;
        const w = piece.x2 - piece.x1;
        const h = piece.y2 - piece.y1;
        cells.push({
          ...piece,
          w: r2(w),
          h: r2(h),
          full: near(w, tile.w) && near(h, tile.h),
          zone: inBottom ? 'bawah' : 'atas',
          shape: 'rect',
          cutByOpening,
        });
      }
    }
    return cells;
  };
  const nCols = Math.ceil(wall.len / tile.w);
  const origins = {
    'dari kiri': 0,
    'dari kanan': wall.len - nCols * tile.w,
    'simetris': (wall.len - nCols * tile.w) / 2,
  };
  const cands = Object.entries(origins).map(([name, ox]) => {
    const cells = tryOrigin(ox);
    const byZone = {};
    for (const z of ['bawah', 'atas']) {
      const zc = cells.filter((c) => c.zone === z);
      const cuts = zc.filter((c) => !c.full);
      const pack = packCuts(cuts, tile);
      byZone[z] = { full: zc.filter((c) => c.full).length, cuts: cuts.length, cutTiles: pack.tiles, total: zc.filter((c) => c.full).length + pack.tiles, cutList: describeCuts(zc) };
    }
    const total = byZone.bawah.total + byZone.atas.total;
    const slivers = cells.filter((c) => !c.full && Math.min(c.w, c.h) < 0.08).length;
    return { name, ox, cells, byZone, total, slivers };
  });
  cands.sort((a, b) => a.total - b.total || a.slivers - b.slivers);
  const best = opts.prefer ? cands.find((c) => c.name === opts.prefer) || cands[0] : cands[0];
  const grossArea = wall.len * totalH;
  const openArea = openings.reduce((s, o) => s + rectArea(intersect(o, rect) || { x1: 0, x2: 0, y1: 0, y2: 0 }), 0);
  return { ...best, wall: wall.name, len: wall.len, area: r2(grossArea - openArea), areaBawah: r2(wall.len * zones.bottomH - openings.reduce((s, o) => s + rectArea(intersect(o, { x1: 0, x2: wall.len, y1: 0, y2: zones.bottomH }) || { x1: 0, x2: 0, y1: 0, y2: 0 }), 0)) };
}

export function layoutBathroom(bath, tile, zones) {
  const walls = bath.walls.map((w) => layoutWall(w, tile, zones));
  const sum = (z, k) => walls.reduce((s, w) => s + w.byZone[z][k], 0);
  return {
    id: bath.id,
    name: bath.name,
    walls,
    bawah: { full: sum('bawah', 'full'), cuts: sum('bawah', 'cuts'), cutTiles: sum('bawah', 'cutTiles'), total: sum('bawah', 'total') },
    atas: { full: sum('atas', 'full'), cuts: sum('atas', 'cuts'), cutTiles: sum('atas', 'cutTiles'), total: sum('atas', 'total') },
    areaBawah: r2(walls.reduce((s, w) => s + w.areaBawah, 0)),
    areaAtas: r2(walls.reduce((s, w) => s + (w.area - w.areaBawah), 0)),
    perimeter: r2(bath.walls.reduce((s, w) => s + w.len, 0)),
  };
}

// ----------------------------------------------------------------------------
// Plin 10 cm dari granit 80x80 → stripsPerTile potongan 10×80
// ----------------------------------------------------------------------------
export function plinth(length, doors, tile, stripsPerTile = 8, wastePct = 5) {
  const net = Math.max(0, length - doors);
  const strips = Math.ceil((net / tile.w) * (1 + wastePct / 100));
  return { net: r2(net), strips, tiles: Math.ceil(strips / stripsPerTile), stripsPerTile };
}

export const boxes = (pcs, perBox) => Math.ceil(pcs / perBox);
export const withWaste = (pcs, pct) => Math.ceil(pcs * (1 + pct / 100));
