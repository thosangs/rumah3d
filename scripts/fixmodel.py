# Perbaiki GLB mentah hasil export SketchUp (material hilang/default):
#  1. Kaca: panel tipis (<1,5 cm), vertikal, warna default abu 0.6, 36 vertex, di badan rumah → material Glass.
#  2. Pagar: panel gerbang depan (material hitam bertekstur) + screen samping carport & kiri → material Perforated
#     (di three.js diganti plat besi perforated tembus pandang).
#  3. Cat tembok: semua material default abu 0.6 tanpa tekstur → putih hangat sesuai render DED.
import struct, json, sys, numpy as np
src, dst = sys.argv[1], sys.argv[2]
d = open(src, 'rb').read()
cl, = struct.unpack('<I', d[12:16]); js = json.loads(d[20:20 + cl]); off = 20 + cl
bl, = struct.unpack('<I', d[off:off + 4]); bin_ = d[off + 8:off + 8 + bl]
def acc(i):
    a = js['accessors'][i]; bv = js['bufferViews'][a['bufferView']]; st = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    return np.frombuffer(bin_[st:st + a['count'] * 12], dtype='<f4').reshape(-1, 3)
def mat(nd):
    if 'matrix' in nd: return np.array(nd['matrix']).reshape(4, 4).T
    M = np.eye(4); t = nd.get('translation', [0, 0, 0]); s = nd.get('scale', [1, 1, 1]); x, y, z, w = nd.get('rotation', [0, 0, 0, 1])
    R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    M[:3, :3] = R * np.array(s); M[:3, 3] = t; return M
glass_idx = len(js['materials'])
js['materials'].append({'name': 'Glass', 'pbrMetallicRoughness': {'baseColorFactor': [0.72, 0.84, 0.92, 0.28], 'metallicFactor': 0.1, 'roughnessFactor': 0.05}, 'alphaMode': 'BLEND', 'doubleSided': True})
perf_idx = len(js['materials'])
js['materials'].append({'name': 'Perforated', 'pbrMetallicRoughness': {'baseColorFactor': [0.12, 0.12, 0.13, 1], 'metallicFactor': 0.6, 'roughnessFactor': 0.5}, 'doubleSided': True})
PERF_NODES = {421, 1200}  # screen samping carport (x 9.88) & screen kiri (x 0.14)
perf_mats = set()
for i, m in enumerate(js['materials']):
    pbr = m.get('pbrMetallicRoughness', {}); c = pbr.get('baseColorFactor')
    if c and c[0] < 0.01 and c[1] < 0.01 and 'baseColorTexture' in pbr: perf_mats.add(i)  # panel gerbang hitam bertekstur
hits = []; perf = 0; painted = 0
def walk(i, M):
    nd = js['nodes'][i]; W = M @ mat(nd)
    if 'mesh' in nd:
        for pr in js['meshes'][nd['mesh']]['primitives']:
            global perf
            if i in PERF_NODES or pr.get('material') in perf_mats:
                pr['material'] = perf_idx; perf += 1; continue
            m = js['materials'][pr['material']] if 'material' in pr else {}
            pbr = m.get('pbrMetallicRoughness', {}); c = pbr.get('baseColorFactor', [1, 1, 1, 1])
            if 'baseColorTexture' in pbr or abs(c[0] - 0.6) > 0.02 or abs(c[2] - 0.6) > 0.02: continue
            P = acc(pr['attributes']['POSITION'])
            if len(P) != 36: continue
            Pw = (np.c_[P, np.ones(len(P))] @ W.T)[:, :3]; mn, mx = Pw.min(0), Pw.max(0); sz = mx - mn
            if sorted(sz)[0] > 0.015 or sz[1] < 0.3 or max(sz[0], sz[2]) < 0.3: continue
            if not (2.85 <= mn[0] <= 9.95 and -16.2 <= mn[2] <= -5.8): continue
            pr['material'] = glass_idx; hits.append((round(float(mn[0]), 2), round(float(mn[1]), 2), round(float(mn[2]), 2), [round(float(v), 2) for v in sz]))
    for ch in nd.get('children', []): walk(ch, W)
for n in js['scenes'][0]['nodes']: walk(n, np.eye(4))
# cat tembok: default abu 0.6 → putih hangat (#EDE9E2)
for m in js['materials']:
    pbr = m.get('pbrMetallicRoughness', {}); c = pbr.get('baseColorFactor')
    if c and 'baseColorTexture' not in pbr and abs(c[0] - 0.6) < 0.02 and abs(c[1] - 0.6) < 0.02 and abs(c[2] - 0.6) < 0.02:
        pbr['baseColorFactor'] = [0.84, 0.81, 0.76, 1]; pbr['roughnessFactor'] = 0.95; pbr['metallicFactor'] = 0; painted += 1
print('kaca:', len(hits), '| panel perforated:', perf, '| material tembok dicat:', painted)
jb = json.dumps(js, separators=(',', ':')).encode(); jb += b' ' * ((4 - len(jb) % 4) % 4)
binp = bin_ + b'\0' * ((4 - len(bin_) % 4) % 4)
out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(binp)) + struct.pack('<II', len(jb), 0x4E4F534A) + jb + struct.pack('<II', len(binp), 0x004E4942) + binp
open(dst, 'wb').write(out); print('ditulis', dst, len(out) // 1024 // 1024, 'MB')
