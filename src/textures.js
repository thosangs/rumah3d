// Canvas → tekstur pola keramik (menunjukkan keping utuh vs potongan)
import * as THREE from 'three';
import { bbox } from './tiles.js';

export const COLORS = {
  polos: { full: '#f3efe7', cut: '#f2c9a3', L: '#d9c3ef', grout: '#b9b2a6' },
  structured: { full: '#cfcac1', cut: '#e5b98f', L: '#c9b6dc', grout: '#8f8a82' },
  bath: { full: '#dfe7ea', cut: '#f2c9a3', L: '#d9c3ef', grout: '#9aa4a8' },
  terakota: { full: '#b8613f', cut: '#d98a63', grout: '#6f3a26' },
  putih: { full: '#f7f7f4', cut: '#f2c9a3', grout: '#bdbdb8' },
};

function palette(area) {
  if (area.isBathroom) return COLORS.bath;
  if (area.outdoor) return COLORS.structured;
  return COLORS.polos;
}

/**
 * Gambar pola lantai untuk satu area. Mengembalikan {texture, bb}.
 * Canvas menutupi bounding box region; bagian di luar region transparan.
 */
export function floorTexture(area, layout, pxPerM = 110, showLabels = true) {
  const bb = bbox(area.rects);
  const W = bb.x2 - bb.x1;
  const H = bb.y2 - bb.y1;
  const cw = Math.max(8, Math.round(W * pxPerM));
  const ch = Math.max(8, Math.round(H * pxPerM));
  const cv = document.createElement('canvas');
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext('2d');
  const pal = palette(area);
  const X = (x) => (x - bb.x1) * pxPerM;
  const Y = (y) => (y - bb.y1) * pxPerM;

  for (const c of layout.cells) {
    const color = c.full ? pal.full : c.shape === 'L' ? pal.L : pal.cut;
    for (const p of c.parts) {
      ctx.fillStyle = color;
      ctx.fillRect(X(p.x1), Y(p.y1), (p.x2 - p.x1) * pxPerM, (p.y2 - p.y1) * pxPerM);
      // tekstur halus untuk granit kasar
      if (area.outdoor) {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for (let k = 0; k < 6; k++) {
          const rx = X(p.x1) + Math.random() * (p.x2 - p.x1) * pxPerM;
          const ry = Y(p.y1) + Math.random() * (p.y2 - p.y1) * pxPerM;
          ctx.fillRect(rx, ry, 2, 2);
        }
      }
    }
    // nat (grout) — gambar tepi setiap part
    ctx.strokeStyle = pal.grout;
    ctx.lineWidth = Math.max(1.5, pxPerM * 0.012);
    for (const p of c.parts) ctx.strokeRect(X(p.x1), Y(p.y1), (p.x2 - p.x1) * pxPerM, (p.y2 - p.y1) * pxPerM);
    if (showLabels && !c.full) {
      const lbl = `${Math.round(c.w * 100)}×${Math.round(c.h * 100)}`;
      const fs = Math.min(c.w, c.h) * pxPerM * 0.45;
      if (fs >= 7) {
        ctx.fillStyle = 'rgba(40,30,20,0.85)';
        ctx.font = `${Math.min(fs, pxPerM * 0.16)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, X((c.x1 + c.x2) / 2), Y((c.y1 + c.y2) / 2));
      }
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { texture: tex, bb, canvas: cv };
}

/**
 * Tekstur dinding kamar mandi (2 motif). wallLayout dari layoutWall.
 * Canvas: lebar = len, tinggi = totalH. Bukaan pintu transparan.
 */
export function wallTexture(wallLayout, zones, pxPerM = 160) {
  const W = wallLayout.len;
  const H = zones.bottomH + zones.topH;
  const cv = document.createElement('canvas');
  cv.width = Math.round(W * pxPerM);
  cv.height = Math.round(H * pxPerM);
  const ctx = cv.getContext('2d');
  const X = (x) => x * pxPerM;
  const Y = (y) => (H - y) * pxPerM; // y=0 lantai di bawah canvas
  for (const c of wallLayout.cells) {
    const pal = c.zone === 'bawah' ? COLORS.terakota : COLORS.putih;
    ctx.fillStyle = c.full ? pal.full : pal.cut;
    const x = X(c.x1), y = Y(c.y2), w = (c.x2 - c.x1) * pxPerM, h = (c.y2 - c.y1) * pxPerM;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = pal.grout;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    if (!c.full && Math.min(w, h) > 14) {
      ctx.fillStyle = 'rgba(30,20,10,0.8)';
      ctx.font = `${Math.min(w, h) * 0.5}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(c.w * 100)}×${Math.round(c.h * 100)}`, x + w / 2, y + h / 2);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { texture: tex, W, H };
}

/** Tekstur sederhana: beton/rumput/aspal dengan noise */
export function noiseTexture(base, spot, size = 256, density = 400) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = spot;
  for (let i = 0; i < density; i++) ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
